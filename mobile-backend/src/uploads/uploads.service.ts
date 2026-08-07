import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/** AWS host-label style region (defense-in-depth vs GHSA-j965-2qgj-vjmq). */
const AWS_REGION_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

@Injectable()
export class UploadsService {
  private readonly s3: S3Client | null;
  private readonly region: string;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.region = this.resolveRegion(
      this.configService.get<string>('AWS_REGION'),
    );
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') ?? '';

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.s3 =
      this.region && accessKeyId && secretAccessKey
        ? new S3Client({
            region: this.region,
            credentials: { accessKeyId, secretAccessKey },
          })
        : null;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    // For development, return a placeholder URL
    // In production, upload to S3
    if (this.configService.get('NODE_ENV') === 'development') {
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${file.originalname}`;
    }

    if (!this.s3 || !this.bucket || !this.region) {
      throw new Error('S3 is not configured');
    }

    const key = `${Date.now()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private resolveRegion(region: string | undefined): string {
    if (region == null || region === '') {
      return '';
    }
    if (!AWS_REGION_PATTERN.test(region)) {
      throw new Error(
        `Invalid AWS_REGION "${region}": must be a valid AWS host label`,
      );
    }
    return region;
  }
}

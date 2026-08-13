import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { IMAGE_MAX_BYTES, IMAGE_MIME } from './multer.options';

/** AWS host-label style region (defense-in-depth vs GHSA-j965-2qgj-vjmq). */
const AWS_REGION_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    const configured =
      !!this.region &&
      !!this.bucket &&
      !!accessKeyId &&
      !!secretAccessKey &&
      !accessKeyId.includes('your_aws');

    this.s3 = configured
      ? new S3Client({
          region: this.region,
          credentials: { accessKeyId, secretAccessKey },
        })
      : null;
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Dosya gerekli');
    }
    if (!IMAGE_MIME.test(file.mimetype)) {
      throw new BadRequestException('Yalnızca görsel dosyaları yüklenebilir');
    }
    if (file.size > IMAGE_MAX_BYTES) {
      throw new BadRequestException('Görsel en fazla 8 MB olabilir');
    }

    const prefix = folder.replace(/[^a-z0-9-]/gi, '').slice(0, 32) || 'uploads';
    const ext = EXT[file.mimetype] ?? 'jpg';
    const key = `${prefix}/${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;

    if (this.s3 && this.bucket && this.region) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    }

    const dir = join(process.cwd(), 'uploads', prefix);
    await mkdir(dir, { recursive: true });
    await writeFile(join(process.cwd(), 'uploads', key), file.buffer);
    const base = (
      this.configService.get<string>('APP_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
    return `${base}/uploads/${key}`;
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

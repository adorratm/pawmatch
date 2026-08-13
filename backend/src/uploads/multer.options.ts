import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Options } from 'multer';

export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/;

export const imageUploadOptions: Options = {
  storage: memoryStorage(),
  limits: { fileSize: IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_MIME.test(file.mimetype)) {
      cb(new BadRequestException('Yalnızca JPEG, PNG, WebP veya GIF yüklenebilir'));
      return;
    }
    cb(null, true);
  },
};

import { S3Client } from "@aws-sdk/client-s3";

/**
 * إعداد اتصال Cloudflare R2 (S3 Compatible)
 * يتم جلب الإعدادات من ملف .env لضمان أعلى معايير الأمان
 */
export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

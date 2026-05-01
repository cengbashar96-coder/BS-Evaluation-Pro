'use server'

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/store/lib/s3-client"; // المسار المحدث
import { v4 as uuidv4 } from 'uuid';

/**
 * دالة عالمية لرفع الصور إلى Cloudflare R2
 * @param formData يحتوي على الملف المراد رفعه
 * @returns رابط الصورة السحابي أو رسالة خطأ
 */
export async function uploadImageToR2(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("لم يتم اختيار ملف");

    // تحويل الملف إلى Buffer لمعالجته برمجياً
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // توليد اسم فريد عالمياً (UUID) لمنع تداخل الصور
    const fileExtension = file.name.split('.').pop();
    const fileName = `projects/uploads/${uuidv4()}.${fileExtension}`;

    // تنفيذ أمر الرفع
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // ACL: 'public-read', // يعتمد على إعدادات الـ Bucket لديك
    }));

    // الرابط النهائي للصورة
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error("Cloudflare R2 Upload Error:", error);
    return { success: false, error: "فشل في تأمين ورفع الصورة للسحاب" };
  }
}

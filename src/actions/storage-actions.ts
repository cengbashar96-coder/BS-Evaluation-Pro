'use server'

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/store/lib/s3-client";
import { v4 as uuidv4 } from 'uuid';

/**
 * دالة رفع الصور بشكل آمن ومشفر إلى Cloudflare R2
 * @param formData الملف المراد رفعه
 * @param projectId معرف المشروع لضمان عزل البيانات
 */
export async function uploadImageSecurely(formData: FormData, projectId: string) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("لم يتم اختيار ملف");

    // 1. فحص الحماية: التأكد من نوع الملف (فقط صور)
    if (!file.type.startsWith('image/')) {
      throw new Error("نوع الملف غير مدعوم، يرجى رفع صور فقط");
    }

    // 2. فحص الحجم (الحد الأقصى 5 ميجابايت)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("حجم الصورة يتجاوز الحد المسموح به (5MB)");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 3. تنظيم المسار: تخزين داخل مجلد المشروع لخصوصية تامة
    const fileExtension = file.name.split('.').pop();
    const fileKey = `projects/${projectId}/${uuidv4()}.${fileExtension}`;

    // 4. تنفيذ الرفع كملف خاص (Private Object)
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      // Metadata لتعزيز التتبع والأمان
      Metadata: {
        "uploaded-by-project": projectId,
        "original-name": encodeURIComponent(file.name)
      }
    }));

    // 5. إعادة مفتاح الملف (Key) وليس الرابط العام لضمان الأمان
    return { success: true, key: fileKey };
  } catch (error: any) {
    console.error("Critical Storage Error:", error.message);
    return { success: false, error: error.message || "فشل في تأمين ورفع الصورة" };
  }
}

/**
 * توليد رابط معاينة مؤقت وآمن (Signed URL)
 * الرابط يعمل فقط لمدة ساعة واحدة لمنع التسريب
 * @param key مفتاح الملف المخزن في R2
 */
export async function getSecureImageUrl(key: string) {
  if (!key) return null;
  
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // توليد رابط موقع ينتهي بعد 3600 ثانية (ساعة واحدة)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return signedUrl;
  } catch (error) {
    console.error("Security Link Generation Error:", error);
    return null;
  }
}
/**
 * دالة مخصصة لجلب روابط الصور دفعة واحدة للتقرير
 * @param keys مصفوفة من مفاتيح الصور
 */
export async function getSecureImagesForReport(keys: string[]) {
  const urls = await Promise.all(
    keys.map(async (key) => {
      if (!key) return null;
      return await getSecureImageUrl(key);
    })
  );
  return urls.filter(url => url !== null);
}

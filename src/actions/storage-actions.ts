'use server'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// إعداد عميل Supabase باستخدام المتغيرات الموجودة في ملف .env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // تأكد من وجود هذا المفتاح في ملفك
)

/**
 * دالة رفع الصور الهندسية لـ Supabase
 */
export async function uploadImageSecurely(formData: FormData, projectId: string) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("لم يتم اختيار ملف");

    // فحص الحجم (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة كبير جداً");

    const fileExtension = file.name.split('.').pop();
    // تنظيم المسار داخل المجلدات برقم المشروع
    const filePath = `${projectId}/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('project-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // نعيد الـ path لكي يتم حفظه في قاعدة بيانات المشروع
    return { success: true, key: data.path };
  } catch (error: any) {
    console.error("Storage Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * دالة جلب رابط الصورة لعرضها في التقارير
 */
export async function getSecureImageUrl(key: string) {
  if (!key) return null;
  
  try {
    const { data } = supabase.storage
      .from('project-assets')
      .getPublicUrl(key);

    return data.publicUrl;
  } catch (error) {
    return null;
  }
}

'use server'

import { createClient } from '@supabase/supabase-js'

// ربط الكود ببيانات مشروعك في Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadImageSecurely(formData: FormData, projectId: string) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("لم يتم اختيار ملف");

    // نستخدم اسم الملف الأصلي مع طابع زمني لمنع تكرار الأسماء
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${projectId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('project-assets') // الاسم الذي أنشأته في الصورة
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // نعيد المسار (key) ليتم حفظه في قاعدة البيانات
    return { success: true, key: data.path };
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getSecureImageUrl(key: string) {
  if (!key) return null;
  
  // بما أن الـ Bucket "Public"، نطلب الرابط العام مباشرة
  const { data } = supabase.storage
    .from('project-assets')
    .getPublicUrl(key);

  return data.publicUrl;
}

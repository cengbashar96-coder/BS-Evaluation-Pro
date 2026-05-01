'use client'

import { useState, useEffect } from 'react';
import { Upload, Loader2, X, ImageIcon, ShieldCheck } from 'lucide-react';
import { uploadImageSecurely, getSecureImageUrl } from '@/actions/storage-actions';
import { toast } from 'sonner';

interface ImageUploaderProps {
  projectId: string;
  onUploadSuccess: (key: string) => void;
  defaultKey?: string;
  label?: string;
}

export default function ImageUploader({ projectId, onUploadSuccess, defaultKey, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState(defaultKey || '');

  // توليد رابط معاينة آمن عند وجود مفتاح مخزن مسبقاً
  useEffect(() => {
    async function loadSecurePreview() {
      if (currentKey) {
        const url = await getSecureImageUrl(currentKey);
        setPreviewUrl(url);
      }
    }
    loadSecurePreview();
  }, [currentKey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) {
      if (!projectId) toast.error("خطأ: لم يتم تحديد معرف المشروع");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // الرفع باستخدام النظام الفائق الأمان
      const result = await uploadImageSecurely(formData, projectId);
      
      if (result.success && result.key) {
        setCurrentKey(result.key);
        onUploadSuccess(result.key); // نرسل الـ Key لقاعدة البيانات وليس الرابط
        
        // جلب رابط معاينة مؤقت لعرضه للمستخدم الآن
        const secureUrl = await getSecureImageUrl(result.key);
        setPreviewUrl(secureUrl);
        
        toast.success("تم تشفير ورفع الصورة بنجاح");
      } else {
        toast.error(result.error || "فشل الرفع الأمني");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالخادم السحابي");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 w-full text-right" dir="rtl">
      {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        {label}
        <ShieldCheck className="h-4 w-4 text-emerald-500" title="تخزين مشفر ومحمي" />
      </label>}
      
      <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 transition-all min-h-[180px] flex flex-col items-center justify-center overflow-hidden">
        
        {previewUrl ? (
          <div className="relative w-full group">
            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain shadow-sm" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <button 
                onClick={() => { setPreviewUrl(null); setCurrentKey(''); onUploadSuccess(''); }}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer w-full flex flex-col items-center justify-center py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-3">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              ) : (
                <Upload className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <span className="text-sm font-semibold text-slate-600">
              {uploading ? "جاري التشفير والرفع..." : "اختر صورة المعاينة الفنية"}
            </span>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*" 
              disabled={uploading} 
            />
          </label>
        )}
      </div>
    </div>
  );
}

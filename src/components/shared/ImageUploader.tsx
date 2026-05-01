'use client'

import { useState } from 'react';
import { Upload, Loader2, X, ImageIcon, CheckCircle2 } from 'lucide-react';
import { uploadImageToR2 } from '@/actions/storage-actions';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  defaultValue?: string;
  label?: string;
  className?: string;
}

export default function ImageUploader({ onUploadSuccess, defaultValue, label, className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultValue || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الملف (أقصى حد 5 ميجابايت مثلاً)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً، الحد الأقصى 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadImageToR2(formData);
      if (result.success && result.url) {
        setPreview(result.url);
        onUploadSuccess(result.url); // تمرير الرابط للـ Store
        toast.success("تم الرفع والحفظ سحابياً");
      } else {
        toast.error(result.error || "فشل الرفع");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بالسحاب");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      
      <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center min-h-[180px] overflow-hidden shadow-sm">
        
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <img src={preview} alt="Preview" className="max-h-[140px] w-auto rounded-lg object-contain mb-2 shadow-md" />
            <div className="flex gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> مؤمن سحابياً
              </span>
              <button 
                onClick={() => { setPreview(''); onUploadSuccess(''); }}
                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                title="حذف الصورة"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full mb-3 group-hover:scale-110 transition-transform">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              ) : (
                <ImageIcon className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {uploading ? "جاري المعالجة السحابية..." : "ارفع صورة المعاينة الفنية"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG حتى 5MB</p>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={uploading} 
            />
          </label>
        )}
      </div>
    </div>
  );
}

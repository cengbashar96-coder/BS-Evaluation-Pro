'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // أضفنا هذا لجلب معرف المشروع
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, X, Image as ImageIcon, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, ElectricalReport } from '@/store/projectStore';
import { toast } from 'sonner';

export default function ElectricalPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string; // المعرف الفريد للمشروع للربط السحابي
  
  const { updateElectrical } = useProjectStore();
  
  const [electricalData, setElectricalData] = useState<ElectricalReport>({
    installation: '',
    electricalNotes: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  // تحميل البيانات بناءً على projectId لضمان العزل التام
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-electrical-${projectId}`);
      if (stored) {
        setElectricalData(JSON.parse(stored));
      }
    }
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. الحفظ المحلي المؤقت المرتبط بالـ ID
      localStorage.setItem(`bs-electrical-${projectId}`, JSON.stringify(electricalData));
      
      // 2. تحديث الحالة في Store (تمهيداً للرفع لـ Prisma لاحقاً)
      updateElectrical(electricalData);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ElectricalReport, value: string | string[]) => {
    setElectricalData({ ...electricalData, [field]: value });
  };

  // معالجة رفع الصور مع الحماية
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) { // تقليل الحجم لـ 2MB لضمان سلاسة التخزين السحابي
        toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الأقصى 2MB)' : 'Image too large (Max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setElectricalData(prev => ({
          ...prev,
          images: [...(prev.images || []), base64]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="border-t-4 border-t-yellow-500 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-yellow-600">
            <Zap className="h-6 w-6 fill-current" />
            {t.electrical.title}
          </CardTitle>
          <CardDescription>
             توثيق البيانات الفنية للشبكة الكهربائية للمشروع رقم: {projectId.substring(0, 8)}...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 dark:text-slate-200">
              {t.electrical.installation}
            </Label>
            <Textarea
              value={electricalData.installation || ''}
              onChange={(e) => handleChange('installation', e.target.value)}
              placeholder="مثال: لوحات التوزيع الرئيسي، جودة الكابلات، تأريض الشبكة..."
              rows={4}
              className="resize-none focus:border-yellow-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700 dark:text-slate-200">
              {t.electrical.notes}
            </Label>
            <Textarea
              value={electricalData.electricalNotes || ''}
              onChange={(e) => handleChange('electricalNotes', e.target.value)}
              placeholder="الملاحظات الفنية والمقترحات..."
              rows={4}
              className="resize-none focus:border-yellow-500"
            />
          </div>

          <div className="border-2 border-dashed rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
             <div className="flex flex-col items-center justify-center gap-3">
                <ImageIcon className="h-8 w-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-medium">{t.electrical.images}</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG حتى 2MB</p>
                </div>
                <label className="bg-white dark:bg-slate-800 border px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all shadow-sm text-sm font-semibold">
                   {t.common.upload}
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
             </div>

             {electricalData.images && electricalData.images.length > 0 && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                 {electricalData.images.map((img, idx) => (
                   <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-white shadow-md group">
                     <img src={img} className="w-full h-full object-cover" />
                     <button 
                       onClick={() => setElectricalData(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))}
                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-12 shadow-lg transition-transform active:scale-95"
          >
            <Save className="h-5 w-5 ml-2" />
            {loading ? t.common.loading : t.common.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

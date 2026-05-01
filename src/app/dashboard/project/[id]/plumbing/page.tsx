'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Image as ImageIcon, X, Droplets, Activity } from 'lucide-react';
import { useTranslation } from '@/store/lib/i18n/translations';
import { useProjectStore, type PlumbingReport } from '@/store/projectStore';
import { toast } from 'sonner';

/**
 * Plumbing Page - المراجعة الاحترافية
 * الواجهة الثامنة: التقرير الفني الصحي
 * تدعم مياه الشرب، الصرف الصحي، والمياه المالحة وفق بنية Prisma
 */
export default function PlumbingPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string; // المعرف الفريد لعزل بيانات المشتركين
  
  const { updatePlumbing } = useProjectStore();
  
  const [formData, setFormData] = useState<PlumbingReport>({
    freshWaterNotes: '',
    wastewaterNotes: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // تحميل البيانات بناءً على معرف المشروع لضمان الأمان السحابي
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-plumbing-${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
        if (parsed.images) setImages(parsed.images);
      }
    }
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = { ...formData, images };
      // الحفظ المحلي المرتبط بـ ID المشروع لضمان عدم التداخل
      localStorage.setItem(`bs-plumbing-${projectId}`, JSON.stringify(dataToSave));
      
      // تحديث الحالة في Store المركزي للمشروع
      updatePlumbing(dataToSave);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت' : 'Max 2MB per image');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="border-t-4 border-t-blue-500 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Droplets className="h-6 w-6" />
            {t.plumbing.title}
          </CardTitle>
          <CardDescription>
            توثيق شبكات المياه والصرف للمشروع رقم: {projectId.substring(0, 8)}...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* مياه الشرب والمياه المالحة */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <Droplets className="h-4 w-4 text-blue-500" />
              {t.plumbing.freshWater}
            </Label>
            <Textarea
              value={formData.freshWaterNotes || ''}
              onChange={(e) => setFormData({...formData, freshWaterNotes: e.target.value})}
              placeholder="وصف حالة مياه الشرب، الخزانات، ونظام المعالجة (بما في ذلك المياه المالحة)..."
              rows={4}
              className="resize-none focus:border-blue-500"
            />
          </div>

          {/* الصرف الصحي */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t.plumbing.wastewater}
            </Label>
            <Textarea
              value={formData.wastewaterNotes || ''}
              onChange={(e) => setFormData({...formData, wastewaterNotes: e.target.value})}
              placeholder="وصف حالة شبكة الصرف، الميول، والتمديدات الخارجية..."
              rows={4}
              className="resize-none focus:border-blue-500"
            />
          </div>

          {/* قسم الصور مع الحماية */}
          <div className="space-y-4 border-2 border-dashed rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> {t.plumbing.images}
            </Label>
            
            <div className="flex flex-col items-center gap-2">
              <label className="cursor-pointer bg-white dark:bg-slate-800 border-2 border-blue-100 hover:border-blue-400 px-6 py-3 rounded-full transition-all shadow-sm">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" /> {t.common.upload}
                </span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">PNG, JPG up to 2MB</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-white shadow-md">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleRemoveImage(idx)}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg transition-transform active:scale-95"
          >
            <Save className="h-5 w-5 ml-2" />
            {loading ? t.common.loading : t.common.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

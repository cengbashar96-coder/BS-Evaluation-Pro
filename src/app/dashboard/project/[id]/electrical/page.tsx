'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, X, Image as ImageIcon, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, ElectricalReport } from '@/store/projectStore';
import { toast } from 'sonner';

/**
 * Electrical Page
 * الواجهة السابعة: تقرير التمديدات الكهربائية
 * تتيح توثيق حالة التركيبات الكهربائية مع دعم رفع الصور والمعاينة الفورية
 */
export default function ElectricalPage() {
  const { t, language } = useTranslation();
  const { updateElectrical } = useProjectStore();
  
  const [electricalData, setElectricalData] = useState<ElectricalReport>({
    installation: '',
    electricalNotes: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  // استرجاع البيانات من التخزين المحلي عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-electrical');
      if (stored) {
        setElectricalData(JSON.parse(stored));
      }
    }
  }, []);

  // تهيئة البيانات عند بدء مشروع جديد
  useEffect(() => {
    const handleNewProject = () => {
      setElectricalData({ installation: '', electricalNotes: '', images: [] });
    };
    window.addEventListener('project:new', handleNewProject);
    return () => window.removeEventListener('project:new', handleNewProject);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-electrical', JSON.stringify(electricalData));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' : 'File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'ar' ? 'يسمح فقط بملفات الصور' : 'Only image files are allowed');
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

  const handleRemoveImage = (index: number) => {
    setElectricalData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="border-t-4 border-t-yellow-500 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Zap className="h-6 w-6" />
            {t.electrical.title}
          </CardTitle>
          <CardDescription>{t.buildingInfo.saveData}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="installation" className="text-base font-semibold">{t.electrical.installation}</Label>
            <Textarea
              id="installation"
              value={electricalData.installation || ''}
              onChange={(e) => handleChange('installation', e.target.value)}
              placeholder="صف حالة التمديدات الكهربائية..."
              rows={4}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricalNotes" className="text-base font-semibold">{t.electrical.notes}</Label>
            <Textarea
              id="electricalNotes"
              value={electricalData.electricalNotes || ''}
              onChange={(e) => handleChange('electricalNotes', e.target.value)}
              placeholder="أضف أي ملاحظات أو أعطال مرصودة..."
              rows={4}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> {t.electrical.images}
            </Label>
            
            <div className="flex items-center gap-4">
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-yellow-500 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{t.common.upload}</span>
                </div>
                <input id="imageUpload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            {electricalData.images && electricalData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {electricalData.images.map((image, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img src={image} alt="Electrical" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 gap-2 px-8 shadow-md">
              <Save className="h-4 w-4" />
              {loading ? t.common.loading : t.common.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

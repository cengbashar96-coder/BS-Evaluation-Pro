'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, PlumbingReport } from '@/store/projectStore';
import { toast } from 'sonner';

export default function Plumbing() {
  const { t, language } = useTranslation();
  const { updatePlumbing } = useProjectStore();
  
  const [formData, setFormData] = useState<PlumbingReport>({});
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-plumbing');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
        if (parsed.images) {
          setImages(parsed.images);
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('project:new', () => {
      setFormData({});
      setImages([]);
    });
    return () => window.removeEventListener('project:new', () => {});
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result as string;
          setImages(prev => [...prev, imageData]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        images: images.length > 0 ? images : undefined
      };
      
      localStorage.setItem('bs-plumbing', JSON.stringify(dataToSave));
      updatePlumbing(dataToSave);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PlumbingReport, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Save className="h-5 w-5" />
          {t.plumbing.title}
        </CardTitle>
        <CardDescription>
          {t.plumbing.freshWater} & {t.plumbing.wastewater}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* التمديدات الصحية الحلوة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.plumbing.freshWater}
          </div>
          <div className="space-y-2">
            <Label htmlFor="freshWaterNotes">
              {t.plumbing.freshWater}
            </Label>
            <Textarea
              id="freshWaterNotes"
              value={formData.freshWaterNotes || ''}
              onChange={(e) => handleChange('freshWaterNotes', e.target.value)}
              placeholder={t.plumbing.freshWater}
              rows={4}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>
        </div>

        {/* التمديدات الصحية المالحة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.plumbing.wastewater}
          </div>
          <div className="space-y-2">
            <Label htmlFor="wastewaterNotes">
              {t.plumbing.wastewater}
            </Label>
            <Textarea
              id="wastewaterNotes"
              value={formData.wastewaterNotes || ''}
              onChange={(e) => handleChange('wastewaterNotes', e.target.value)}
              placeholder={t.plumbing.wastewater}
              rows={4}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>
        </div>

        {/* الصور المرفقة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.plumbing.images}
          </div>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
              <input
                type="file"
                id="plumbingImages"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="plumbingImages" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">
                  {t.common.upload} {t.plumbing.images}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? 'يمكنك اختيار صور متعددة' : 'You can select multiple images'}
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border shadow-sm">
                      <img
                        src={image}
                        alt={`${t.plumbing.images} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <Save className="h-4 w-4" />
            {loading ? t.common.loading : t.common.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

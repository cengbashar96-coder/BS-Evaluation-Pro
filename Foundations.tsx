'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, X, Image as ImageIcon, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, ElectricalReport } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function Electrical() {
  const { t, language } = useTranslation();
  const { updateElectrical } = useProjectStore();
  
  const [electricalData, setElectricalData] = useState<ElectricalReport>({
    installation: '',
    electricalNotes: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-electrical');
      if (stored) {
        setElectricalData(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    const handleNewProject = () => {
      setElectricalData({
        installation: '',
        electricalNotes: '',
        images: []
      });
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

    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Zap className="h-5 w-5" />
            {t.electrical.title}
          </CardTitle>
          <CardDescription>
            {t.buildingInfo.saveData}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Electrical Installation Description */}
          <div className="space-y-2">
            <Label htmlFor="installation" className="text-base font-semibold">
              {t.electrical.installation}
            </Label>
            <Textarea
              id="installation"
              value={electricalData.installation || ''}
              onChange={(e) => handleChange('installation', e.target.value)}
              placeholder={t.electrical.installation}
              rows={6}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Notes and Observations */}
          <div className="space-y-2">
            <Label htmlFor="electricalNotes" className="text-base font-semibold">
              {t.electrical.notes}
            </Label>
            <Textarea
              id="electricalNotes"
              value={electricalData.electricalNotes || ''}
              onChange={(e) => handleChange('electricalNotes', e.target.value)}
              placeholder={t.electrical.notes}
              rows={6}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t.electrical.images}
            </Label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">{t.common.upload}</span>
                </div>
                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <span className="text-sm text-slate-500">
                {t.common.upload} (Max 5MB per image)
              </span>
            </div>

            {/* Images Grid */}
            {electricalData.images && electricalData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {electricalData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={image}
                        alt={`Electrical image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {(!electricalData.images || electricalData.images.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">{t.electrical.images}</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
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

      {/* Preview Card */}
      {electricalData && (electricalData.installation || electricalData.electricalNotes || (electricalData.images && electricalData.images.length > 0)) && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">
              {t.common.preview}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {electricalData.installation && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t.electrical.installation}
                </Label>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm whitespace-pre-wrap">
                  {electricalData.installation}
                </div>
              </div>
            )}

            {electricalData.electricalNotes && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t.electrical.notes}
                </Label>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm whitespace-pre-wrap">
                  {electricalData.electricalNotes}
                </div>
              </div>
            )}

            {electricalData.images && electricalData.images.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  {t.electrical.images} ({electricalData.images.length})
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {electricalData.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          window.open(image, '_blank');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

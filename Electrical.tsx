'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, type BuildingInfo } from '@/store/projectStore';
import { toast } from 'sonner';

export default function BuildingInfo() {
  const { t, language } = useTranslation();
  const { currentProjectId, updateBuildingInfo } = useProjectStore();
  
  const [formData, setFormData] = useState<BuildingInfo>({});
  const [locationImage, setLocationImage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-building-info');
      if (stored) {
        setFormData(JSON.parse(stored));
        const parsed = JSON.parse(stored);
        if (parsed.locationImage) {
          setLocationImage(parsed.locationImage);
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('project:new', () => {
      setFormData({});
      setLocationImage('');
    });
    return () => window.removeEventListener('project:new', () => {});
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setLocationImage(imageData);
        setFormData({ ...formData, locationImage: imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        locationImage: locationImage || undefined
      };
      
      localStorage.setItem('bs-building-info', JSON.stringify(dataToSave));
      updateBuildingInfo(dataToSave);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BuildingInfo, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Save className="h-5 w-5" />
          {t.buildingInfo.title}
        </CardTitle>
        <CardDescription className="text-center">
          {t.buildingInfo.propertyNumber} {t.common.required}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="propertyNumber">
              {t.buildingInfo.propertyNumber} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="propertyNumber"
              value={formData.propertyNumber || ''}
              onChange={(e) => handleChange('propertyNumber', e.target.value)}
              placeholder={t.buildingInfo.propertyNumber}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousLicense">{t.buildingInfo.previousLicense}</Label>
            <Input
              id="previousLicense"
              value={formData.previousLicense || ''}
              onChange={(e) => handleChange('previousLicense', e.target.value)}
              placeholder={t.buildingInfo.previousLicense}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseDate">{t.buildingInfo.licenseDate}</Label>
            <Input
              id="licenseDate"
              type="date"
              value={formData.licenseDate || ''}
              onChange={(e) => handleChange('licenseDate', e.target.value)}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">{t.buildingInfo.area}</Label>
            <Input
              id="area"
              value={formData.area || ''}
              onChange={(e) => handleChange('area', e.target.value)}
              placeholder={t.buildingInfo.area}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">{t.buildingInfo.ownerName}</Label>
            <Input
              id="ownerName"
              value={formData.ownerName || ''}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              placeholder={t.buildingInfo.ownerName}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingUsage">{t.buildingInfo.buildingUsage}</Label>
            <Input
              id="buildingUsage"
              value={formData.buildingUsage || ''}
              onChange={(e) => handleChange('buildingUsage', e.target.value)}
              placeholder={t.buildingInfo.buildingUsage}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floorCount">{t.buildingInfo.floorCount}</Label>
            <Input
              id="floorCount"
              type="number"
              min="0"
              value={formData.floorCount || ''}
              onChange={(e) => handleChange('floorCount', parseInt(e.target.value) || 0)}
              placeholder={t.buildingInfo.floorCount}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="buildingComponent">{t.buildingInfo.buildingComponent}</Label>
            <Textarea
              id="buildingComponent"
              value={formData.buildingComponent || ''}
              onChange={(e) => handleChange('buildingComponent', e.target.value)}
              placeholder={t.buildingInfo.buildingComponent}
              rows={3}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationDescription">{t.buildingInfo.locationDescription}</Label>
            <Textarea
              id="locationDescription"
              value={formData.locationDescription || ''}
              onChange={(e) => handleChange('locationDescription', e.target.value)}
              placeholder={t.buildingInfo.locationDescription}
              rows={3}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationImage">{t.buildingInfo.locationImage}</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="locationImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="locationImage" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">
                      {locationImage ? t.common.upload : t.common.upload}
                    </p>
                  </label>
                </div>
              </div>
              {locationImage && (
                <div className="w-48 h-48 rounded-lg overflow-hidden border shadow-sm">
                  <img
                    src={locationImage}
                    alt={t.buildingInfo.locationImage}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
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

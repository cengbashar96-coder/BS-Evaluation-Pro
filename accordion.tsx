'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Building2, Hammer, Layers } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, type StructuralReport } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function StructuralReport() {
  const { t, language } = useTranslation();
  const { updateStructuralReport } = useProjectStore();
  const { stressUnit } = useSettingsStore();
  
  const [formData, setFormData] = useState<StructuralReport>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-structural-report');
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('project:new', () => {
      setFormData({});
    });
    return () => window.removeEventListener('project:new', () => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-structural-report', JSON.stringify(formData));
      updateStructuralReport(formData);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StructuralReport, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStressUnitLabel = () => {
    switch (stressUnit) {
      case 'kg/cm²':
        return t.structural.schmidtUnit;
      case 'ton/m²':
        return 'طن/م²';
      case 'kN/m²':
        return 'كن/م²';
      case 'Mpa':
        return 'ميغاباسكال';
      default:
        return t.structural.schmidtUnit;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Building2 className="h-5 w-5" />
          {t.structural.title}
        </CardTitle>
        <CardDescription>
          {t.structural.structuralSystemDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* الجملة الإنشائية */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.structural.structuralSystem}
          </div>
          <div className="space-y-2">
            <Label htmlFor="structuralSystem">
              {t.structural.structuralSystem}
            </Label>
            <Textarea
              id="structuralSystem"
              value={formData.structuralSystem || ''}
              onChange={(e) => handleChange('structuralSystem', e.target.value)}
              placeholder={t.structural.structuralSystemDesc}
              rows={3}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>
        </div>

        {/* تقرير مطرقة شميدت */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Hammer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.structural.schmidtReport}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schmidtConcreteStrength">
              {t.structural.schmidtConcreteStrength} ({getStressUnitLabel()})
            </Label>
            <Input
              id="schmidtConcreteStrength"
              type="number"
              step="0.01"
              value={formData.schmidtConcreteStrength || ''}
              onChange={(e) => handleChange('schmidtConcreteStrength', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>
        </div>

        {/* تقرير ميكانيك التربة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t.structural.soilMechanicsReport}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soilType">
                {t.structural.soilType}
              </Label>
              <Input
                id="soilType"
                value={formData.soilType || ''}
                onChange={(e) => handleChange('soilType', e.target.value)}
                placeholder={t.structural.soilType}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundationDepth">
                {t.structural.foundationDepth} (م)
              </Label>
              <Input
                id="foundationDepth"
                type="number"
                step="0.01"
                value={formData.foundationDepth || ''}
                onChange={(e) => handleChange('foundationDepth', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilCapacity">
                {t.structural.soilCapacity} ({getStressUnitLabel()})
              </Label>
              <Input
                id="soilCapacity"
                type="number"
                step="0.01"
                value={formData.soilCapacity || ''}
                onChange={(e) => handleChange('soilCapacity', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilFrictionAngle">
                {t.structural.soilFrictionAngle} (°)
              </Label>
              <Input
                id="soilFrictionAngle"
                type="number"
                step="0.1"
                value={formData.soilFrictionAngle || ''}
                onChange={(e) => handleChange('soilFrictionAngle', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilCohesion">
                {t.structural.soilCohesion} ({getStressUnitLabel()})
              </Label>
              <Input
                id="soilCohesion"
                type="number"
                step="0.01"
                value={formData.soilCohesion || ''}
                onChange={(e) => handleChange('soilCohesion', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groundwaterLevel">
                {t.structural.groundwaterLevel} (م)
              </Label>
              <Input
                id="groundwaterLevel"
                type="number"
                step="0.01"
                value={formData.groundwaterLevel || ''}
                onChange={(e) => handleChange('groundwaterLevel', e.target.value)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="soilNotes">
              {t.structural.soilNotes}
            </Label>
            <Textarea
              id="soilNotes"
              value={formData.soilNotes || ''}
              onChange={(e) => handleChange('soilNotes', e.target.value)}
              placeholder={t.structural.soilNotes}
              rows={3}
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
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

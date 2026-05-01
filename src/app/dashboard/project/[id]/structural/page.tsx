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

/**
 * Structural Page
 * الواجهة السادسة: التقرير الفني الإنشائي
 * تجمع بيانات الجملة الإنشائية، مطرقة شميدت، وميكانيك التربة
 */
export default function StructuralPage() {
  const { t, language } = useTranslation();
  const { updateStructuralReport } = useProjectStore();
  const { stressUnit } = useSettingsStore();
  
  const [formData, setFormData] = useState<StructuralReport>({});
  const [loading, setLoading] = useState(false);

  // تحميل البيانات المحفوظة محلياً (Persisted Data)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-structural-report');
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    }
  }, []);

  // تفريغ النموذج عند البدء بمشروع جديد
  useEffect(() => {
    const handleNewProject = () => setFormData({});
    window.addEventListener('project:new', handleNewProject);
    return () => window.removeEventListener('project:new', handleNewProject);
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

  // وظيفة لتحديد وحدة الإجهاد المختارة من الإعدادات
  const getStressUnitLabel = () => {
    switch (stressUnit) {
      case 'kg/cm²': return t.structural.schmidtUnit;
      case 'ton/m²': return 'طن/م²';
      case 'kN/m²': return 'كن/م²';
      case 'Mpa': return 'ميغاباسكال';
      default: return t.structural.schmidtUnit;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="w-full border-t-4 border-t-emerald-600 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-6 w-6" />
            {t.structural.title}
          </CardTitle>
          <CardDescription>
            {t.structural.structuralSystemDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* قسم الجملة الإنشائية */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b pb-2">
              <Layers className="h-4 w-4" />
              {t.structural.structuralSystem}
            </div>
            <div className="space-y-2">
              <Label htmlFor="structuralSystem">{t.structural.structuralSystem}</Label>
              <Textarea
                id="structuralSystem"
                value={formData.structuralSystem || ''}
                onChange={(e) => handleChange('structuralSystem', e.target.value)}
                placeholder="وصف الجملة الإنشائية (إطارات، جدران قص، إلخ...)"
                rows={3}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          {/* قسم اختبارات المقاومة (مطرقة شميدت) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b pb-2">
              <Hammer className="h-4 w-4" />
              {t.structural.schmidtReport}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* قسم ميكانيك التربة */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 border-b pb-2">
              <Layers className="h-4 w-4" />
              {t.structural.soilMechanicsReport}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soilType">{t.structural.soilType}</Label>
                <Input
                  id="soilType"
                  value={formData.soilType || ''}
                  onChange={(e) => handleChange('soilType', e.target.value)}
                  placeholder="مثال: غضارية، صخرية..."
                  className={language === 'ar' ? 'text-right' : 'text-left'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundationDepth">{t.structural.foundationDepth} (م)</Label>
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
                <Label htmlFor="soilCapacity">{t.structural.soilCapacity} ({getStressUnitLabel()})</Label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soilFrictionAngle">{t.structural.soilFrictionAngle} (°)</Label>
                <Input
                  id="soilFrictionAngle"
                  type="number"
                  step="0.1"
                  value={formData.soilFrictionAngle || ''}
                  onChange={(e) => handleChange('soilFrictionAngle', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groundwaterLevel">{t.structural.groundwaterLevel} (م)</Label>
                <Input
                  id="groundwaterLevel"
                  type="number"
                  step="0.01"
                  value={formData.groundwaterLevel || ''}
                  onChange={(e) => handleChange('groundwaterLevel', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilNotes">{t.structural.soilNotes}</Label>
              <Textarea
                id="soilNotes"
                value={formData.soilNotes || ''}
                onChange={(e) => handleChange('soilNotes', e.target.value)}
                rows={3}
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          {/* زر الحفظ */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2 px-8 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-md"
            >
              <Save className="h-4 w-4" />
              {loading ? t.common.loading : t.common.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

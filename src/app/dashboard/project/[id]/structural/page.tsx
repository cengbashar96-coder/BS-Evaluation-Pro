'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Building2, Hammer, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/store/lib/i18n/translations';
import { useProjectStore, type StructuralReport } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

/**
 * Structural Page - المراجعة الاحترافية
 * الواجهة السادسة: التقرير الفني الإنشائي
 * تم ضبطها لتتوافق مع نظام الربط السحابي (Prisma) وعزل المشاريع
 */
export default function StructuralPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string; // المعرف الفريد لضمان أمن وعزل البيانات
  
  const { updateStructuralReport } = useProjectStore();
  const { stressUnit } = useSettingsStore();
  
  const [formData, setFormData] = useState<StructuralReport>({});
  const [loading, setLoading] = useState(false);

  // تحميل البيانات بناءً على معرف المشروع حصراً لضمان الأمان
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-structural-report-${projectId}`);
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    }
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // حفظ البيانات محلياً مع ربطها بالـ ID لضمان المزامنة الصحيحة لاحقاً
      localStorage.setItem(`bs-structural-report-${projectId}`, JSON.stringify(formData));
      
      // تحديث الحالة العامة للمشروع (Zustand Store)
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
      case 'kg/cm²': return t.structural.schmidtUnit;
      case 'ton/m²': return 'طن/م²';
      case 'kN/m²': return 'كن/م²';
      case 'Mpa': return 'ميغاباسكال';
      default: return t.structural.schmidtUnit;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="w-full border-t-4 border-t-emerald-600 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-emerald-600">
             <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {t.structural.title}
          </CardTitle>
          <CardDescription>
            توثيق الجملة الإنشائية واختبارات التربة للمشروع رقم: {projectId.substring(0, 8)}...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          
          {/* قسم الجملة الإنشائية - مطابق لـ Prisma Field: structuralSystem */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 border-b pb-2">
              <Layers className="h-4 w-4" />
              {t.structural.structuralSystem}
            </div>
            <div className="space-y-2">
              <Textarea
                id="structuralSystem"
                value={formData.structuralSystem || ''}
                onChange={(e) => handleChange('structuralSystem', e.target.value)}
                placeholder="صف الجملة الإنشائية (إطارات بيتونية، جدران قص، إلخ...)"
                rows={3}
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* قسم اختبارات المقاومة - مطابق لـ Prisma Field: schmidtConcreteStrength */}
          <div className="space-y-4 p-4 border rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 border-b pb-2">
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
                />
              </div>
            </div>
          </div>

          {/* قسم ميكانيك التربة - مطابق لحقول Prisma: soilType, foundationDepth, soilCapacity... */}
          <div className="space-y-4 p-4 border rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 border-b pb-2">
              <Layers className="h-4 w-4" />
              {t.structural.soilMechanicsReport}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <Label htmlFor="soilType">{t.structural.soilType}</Label>
                <Input
                  id="soilType"
                  value={formData.soilType || ''}
                  onChange={(e) => handleChange('soilType', e.target.value)}
                  placeholder="غضارية، رملية..."
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
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="soilNotes">{t.structural.soilNotes}</Label>
              <Textarea
                id="soilNotes"
                value={formData.soilNotes || ''}
                onChange={(e) => handleChange('soilNotes', e.target.value)}
                rows={3}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* زر الحفظ النهائي */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <Save className="h-5 w-5 ml-2" />
            {loading ? t.common.loading : t.common.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

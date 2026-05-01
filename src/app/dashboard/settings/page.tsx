'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Globe, Ruler, Weight, Activity, Database } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

/**
 * Settings Page - واجهة إعدادات النظام
 * تم تطويرها للربط مع Prisma وتخصيص تجربة المستخدم السحابية
 */
export default function SettingsPage() {
  const { t, language } = useTranslation();
  const settings = useSettingsStore();
  
  // حالات محلية للإدارة قبل الحفظ النهائي
  const [localSettings, setLocalSettings] = useState({
    language: settings.language,
    lengthUnit: settings.lengthUnit,
    areaUnit: settings.areaUnit,
    loadUnit: settings.loadUnit,
    stressUnit: settings.stressUnit,
    densityUnit: settings.densityUnit
  });

  const [loading, setLoading] = useState(false);

  // تحديث الإعدادات عند تحميل الصفحة
  useEffect(() => {
    setLocalSettings({
      language: settings.language,
      lengthUnit: settings.lengthUnit,
      areaUnit: settings.areaUnit,
      loadUnit: settings.loadUnit,
      stressUnit: settings.stressUnit,
      densityUnit: settings.densityUnit
    });
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. تحديث المتجر المحلي (Zustand)
      settings.setLanguage(localSettings.language);
      settings.setLengthUnit(localSettings.lengthUnit);
      settings.setAreaUnit(localSettings.areaUnit);
      settings.setLoadUnit(localSettings.loadUnit);
      settings.setStressUnit(localSettings.stressUnit);
      settings.setDensityUnit(localSettings.densityUnit);

      // 2. الحفظ في localStorage (للمزامنة الفورية)
      localStorage.setItem('bs-settings', JSON.stringify(localSettings));

      // ملاحظة: هنا يتم استدعاء Server Action لتحديث جدول Settings في Prisma لاحقاً
      
      toast.success(t.buildingInfo.projectSaved);
      
      // إعادة تحميل خفيفة لتطبيق اللغة إذا تغيرت
      if (localSettings.language !== settings.language) {
        window.location.reload();
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
          <Settings className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">إعدادات المنصة</h1>
          <p className="text-slate-500 text-sm">تخصيص الوحدات الهندسية ولغة النظام والتقارير</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* لغة النظام */}
        <Card className="shadow-sm border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" /> لغة واجهة التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={localSettings.language} 
              onValueChange={(val: 'ar' | 'en') => setLocalSettings({...localSettings, language: val})}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="ar" id="ar" />
                <Label htmlFor="ar" className="cursor-pointer font-bold">العربية</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="cursor-pointer font-bold">English</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* الوحدات الهندسية الأساسية */}
        <Card className="shadow-sm border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-500" /> وحدات الأبعاد والمساحات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">وحدة قياس الأطوال</Label>
              <Select value={localSettings.lengthUnit} onValueChange={(val) => setLocalSettings({...localSettings, lengthUnit: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">سنتيمتر (cm)</SelectItem>
                  <SelectItem value="m">متر (m)</SelectItem>
                  <SelectItem value="mm">ميليمتر (mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">وحدة قياس المساحات</Label>
              <Select value={localSettings.areaUnit} onValueChange={(val) => setLocalSettings({...localSettings, areaUnit: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="m²">متر مربع (m²)</SelectItem>
                  <SelectItem value="cm²">سم مربع (cm²)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* الأحمال والإجهادات */}
        <Card className="shadow-sm border-t-4 border-t-orange-500 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" /> القوى والإجهادات (التحليل الإنشائي)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">وحدة الأحمال والوزن</Label>
              <Select value={localSettings.loadUnit} onValueChange={(val) => setLocalSettings({...localSettings, loadUnit: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ton">طن (ton)</SelectItem>
                  <SelectItem value="kN">كيلو نيوتن (kN)</SelectItem>
                  <SelectItem value="kg">كيلو غرام (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">وحدة الإجهادات (مقاومة المواد)</Label>
              <Select value={localSettings.stressUnit} onValueChange={(val) => setLocalSettings({...localSettings, stressUnit: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg/cm²">kg/cm² (كلاسيكي)</SelectItem>
                  <SelectItem value="MPa">ميغاباسكال (MPa)</SelectItem>
                  <SelectItem value="ton/m²">ton/m²</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">وحدة الكثافة</Label>
              <Select value={localSettings.densityUnit} onValueChange={(val) => setLocalSettings({...localSettings, densityUnit: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ton/m³">ton/m³</SelectItem>
                  <SelectItem value="kN/m³">kN/m³</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg mt-8"
      >
        <Save className="h-5 w-5 ml-2" />
        {loading ? t.common.loading : "حفظ الإعدادات وتطبيقها على النظام"}
      </Button>
    </div>
  );
}

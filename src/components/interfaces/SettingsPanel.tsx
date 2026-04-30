'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function SettingsPanel() {
  const { t, language } = useTranslation();
  const {
    language: currentLang,
    lengthUnit,
    areaUnit,
    loadUnit,
    stressUnit,
    densityUnit,
    setLanguage,
    setLengthUnit,
    setAreaUnit,
    setLoadUnit,
    setStressUnit,
    setDensityUnit
  } = useSettingsStore();
  
  const [localLang, setLocalLang] = useState<'ar' | 'en'>(currentLang);
  const [localLength, setLocalLength] = useState(lengthUnit);
  const [localArea, setLocalArea] = useState(areaUnit);
  const [localLoad, setLocalLoad] = useState(loadUnit);
  const [localStress, setLocalStress] = useState(stressUnit);
  const [localDensity, setLocalDensity] = useState(densityUnit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalLang(currentLang);
    setLocalLength(lengthUnit);
    setLocalArea(areaUnit);
    setLocalLoad(loadUnit);
    setLocalStress(stressUnit);
    setLocalDensity(densityUnit);
  }, [currentLang, lengthUnit, areaUnit, loadUnit, stressUnit, densityUnit]);

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    setLocalLang(lang);
    // Reload page to apply language change across all interfaces
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save all settings
      setLanguage(localLang);
      setLengthUnit(localLength);
      setAreaUnit(localArea);
      setLoadUnit(localLoad);
      setStressUnit(localStress);
      setDensityUnit(localDensity);
      
      toast.success(t.common.success);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Settings className="h-5 w-5" />
          {t.settings.title}
        </CardTitle>
        <CardDescription>
          {t.settings.unitsSection}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Language Section */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.settings.languageSection}
          </h3>
          <div className="flex items-center gap-4">
            <RadioGroup
              value={localLang}
              onValueChange={(value) => handleLanguageChange(value as 'ar' | 'en')}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="ar" id="arabic" />
                <Label htmlFor="arabic" className="cursor-pointer font-medium">
                  {t.settings.languageAr}
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="en" id="english" />
                <Label htmlFor="english" className="cursor-pointer font-medium">
                  {t.settings.languageEn}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.settings.languageLabel}
          </p>
        </div>

        {/* Units Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.settings.unitsSection}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Length/Dimensions Unit */}
            <div className="space-y-2">
              <Label htmlFor="lengthUnit">{t.settings.lengthUnit}</Label>
              <Select
                value={localLength}
                onValueChange={setLocalLength}
              >
                <SelectTrigger id="lengthUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">{t.settings.lengthCm}</SelectItem>
                  <SelectItem value="m">{t.settings.lengthM}</SelectItem>
                  <SelectItem value="mm">{t.settings.lengthMm}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Area Unit */}
            <div className="space-y-2">
              <Label htmlFor="areaUnit">{t.settings.areaUnit}</Label>
              <Select
                value={localArea}
                onValueChange={setLocalArea}
              >
                <SelectTrigger id="areaUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm²">{t.settings.areaCm2}</SelectItem>
                  <SelectItem value="mm²">{t.settings.areaMm2}</SelectItem>
                  <SelectItem value="m²">{t.settings.areaM2}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Load Unit */}
            <div className="space-y-2">
              <Label htmlFor="loadUnit">{t.settings.loadUnit}</Label>
              <Select
                value={localLoad}
                onValueChange={setLocalLoad}
              >
                <SelectTrigger id="loadUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ton">{t.settings.loadTon}</SelectItem>
                  <SelectItem value="kg">{t.settings.loadKg}</SelectItem>
                  <SelectItem value="kN">{t.settings.loadKn}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stress Unit */}
            <div className="space-y-2">
              <Label htmlFor="stressUnit">{t.settings.stressUnit}</Label>
              <Select
                value={localStress}
                onValueChange={setLocalStress}
              >
                <SelectTrigger id="stressUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ton/m²">{t.settings.stressTonM2}</SelectItem>
                  <SelectItem value="kN/m²">{t.settings.stressKnM2}</SelectItem>
                  <SelectItem value="kg/cm²">{t.settings.stressKgCm2}</SelectItem>
                  <SelectItem value="MPa">{t.settings.stressMpa}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Density Unit */}
            <div className="space-y-2">
              <Label htmlFor="densityUnit">{t.settings.densityUnit}</Label>
              <Select
                value={localDensity}
                onValueChange={setLocalDensity}
              >
                <SelectTrigger id="densityUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ton/m³">{t.settings.densityTonM3}</SelectItem>
                  <SelectItem value="kN/m³">{t.settings.densityKnM3}</SelectItem>
                  <SelectItem value="kg/cm³">{t.settings.densityKgCm3}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
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

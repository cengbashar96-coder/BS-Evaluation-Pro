'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit2, Trash2, Save, Layers, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, Foundation } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function Foundations() {
  const { t, language } = useTranslation();
  const { updateFoundations } = useProjectStore();
  const { stressUnit } = useSettingsStore();
  
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [soilCapacity, setSoilCapacity] = useState<number>(0);
  
  const [formData, setFormData] = useState<Foundation>({
    hasBasement: false,
    basementDesc: '',
    foundationType: '',
    foundationDepth: undefined,
    foundationModel: '',
    length: undefined,
    width: undefined,
    height: undefined,
    totalLoad: undefined
  });

  // Load soilCapacity from structural report
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const structuralReport = localStorage.getItem('bs-structural-report');
      if (structuralReport) {
        const parsed = JSON.parse(structuralReport);
        setSoilCapacity(parsed.soilCapacity || 0);
      }
    }
  }, []);

  // Recalculate stresses on mount and when foundations change
  useEffect(() => {
    recalculateAllStresses();
  }, [soilCapacity, foundations.map(f => ({
    length: f.length,
    width: f.width,
    totalLoad: f.totalLoad
  })).join(',')]);

  const recalculateAllStresses = () => {
    setFoundations(prevFoundations =>
      prevFoundations.map(foundation => {
        const actualStress = calculateActualStress(foundation);
        const isVerified = actualStress !== null && soilCapacity > 0 && actualStress <= soilCapacity;
        return {
          ...foundation,
          actualStress: actualStress ?? 0,
          isVerified
        };
      })
    );
  };

  const calculateActualStress = (foundation: Foundation): number | null => {
    if (!foundation.length || !foundation.width || !foundation.totalLoad) {
      return null;
    }
    
    // Calculate foundation area in cm²
    const lengthCm = foundation.length * 100; // Convert m to cm
    const widthCm = foundation.width * 100; // Convert m to cm
    const areaCm2 = lengthCm * widthCm;
    
    if (areaCm2 === 0) return null;
    
    // Convert total load from tons to kg
    const totalLoadKg = foundation.totalLoad * 1000;
    
    // Calculate actual stress in kg/cm²
    const actualStress = totalLoadKg / areaCm2;
    
    return Number(actualStress.toFixed(2));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-foundations');
      if (stored) {
        setFoundations(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    const handleNewProject = () => {
      setFoundations([]);
      setFormData({
        hasBasement: false,
        basementDesc: '',
        foundationType: '',
        foundationDepth: undefined,
        foundationModel: '',
        length: undefined,
        width: undefined,
        height: undefined,
        totalLoad: undefined
      });
      setEditingIndex(null);
    };

    // Handle project:loaded event - reload data from localStorage
    const handleLoadProjectData = () => {
      const storedFoundations = localStorage.getItem('bs-foundations');
      if (storedFoundations) {
        try {
          const foundationData = JSON.parse(storedFoundations);
          setFoundations(foundationData);
        } catch (error) {
          console.error('Error loading foundations:', error);
        }
      }

      // Load soilCapacity from structural report
      const storedStructural = localStorage.getItem('bs-structural-report');
      if (storedStructural) {
        const parsed = JSON.parse(storedStructural);
        setSoilCapacity(parsed.soilCapacity || 0);
      }
    };

    window.addEventListener('project:new', handleNewProject);
    window.addEventListener('project:loaded', handleLoadProjectData);

    return () => {
      window.removeEventListener('project:new', handleNewProject);
      window.removeEventListener('project:loaded', handleLoadProjectData);
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-foundations', JSON.stringify(foundations));
      updateFoundations(foundations);
      toast.success('تم حفظ بيانات الأساسات بنجاح في المشروع الحالي', {
        icon: <Save className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Error saving foundations:', error);
      toast.error('حدث خطأ أثناء حفظ بيانات الأساسات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoundation = () => {
    if (!formData.foundationType) {
      toast.error('يرجى إدخال نوع الأساس');
      return;
    }

    const actualStress = calculateActualStress(formData);
    const isVerified = actualStress !== null && soilCapacity > 0 && actualStress <= soilCapacity;

    const foundationWithCalculations = {
      ...formData,
      actualStress: actualStress ?? 0,
      isVerified
    };

    if (editingIndex !== null) {
      const updatedFoundations = [...foundations];
      updatedFoundations[editingIndex] = foundationWithCalculations;
      setFoundations(updatedFoundations);
      setEditingIndex(null);
      toast.success('تم تعديل الأساس بنجاح', {
        icon: <Edit2 className="h-4 w-4" />
      });
    } else {
      setFoundations([...foundations, { ...foundationWithCalculations, id: `foundation-${Date.now()}` }]);
      toast.success('تم إضافة الأساس بنجاح', {
        icon: <Plus className="h-4 w-4" />
      });
    }

    setFormData({
      hasBasement: false,
      basementDesc: '',
      foundationType: '',
      foundationDepth: undefined,
      foundationModel: '',
      length: undefined,
      width: undefined,
      height: undefined,
      totalLoad: undefined
    });
  };

  const handleEditFoundation = (index: number) => {
    setFormData(foundations[index]);
    setEditingIndex(index);
  };

  const handleDeleteFoundation = (index: number) => {
    const updatedFoundations = foundations.filter((_, i) => i !== index);
    setFoundations(updatedFoundations);
    toast.success('تم حذف الأساس بنجاح', {
      icon: <Trash2 className="h-4 w-4" />
    });
  };

  const handleChange = (field: keyof Foundation, value: string | number | boolean | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  const getFoundationTypeLabel = (type?: string) => {
    switch (type) {
      case 'منفصلة':
        return t.foundations.typeIsolated;
      case 'مستمرة':
        return t.foundations.typeContinuous;
      case 'مشتركة':
        return t.foundations.typeCombined;
      case 'حصيرة':
        return t.foundations.typeMat;
      default:
        return type || '-';
    }
  };

  const getFoundationModelLabel = (model?: string) => {
    switch (model) {
      case 'وسطي':
        return t.foundations.modelInterior;
      case 'طرفي':
        return t.foundations.modelExterior;
      case 'ركني':
        return t.foundations.modelCorner;
      case 'غير ذلك':
        return t.foundations.modelOther;
      default:
        return model || '-';
    }
  };

  const getStressUnitLabel = () => {
    switch (stressUnit) {
      case 'kg/cm²':
        return t.foundations.stressUnit;
      case 'ton/m²':
        return 'طن/م²';
      case 'kN/m²':
        return 'كن/م²';
      case 'Mpa':
        return 'ميغاباسكال';
      default:
        return t.foundations.stressUnit;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Layers className="h-5 w-5" />
            {t.foundations.title}
          </CardTitle>
          <CardDescription>
            {t.foundations.addFoundation}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basement/Shelter Section */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="hasBasement"
                checked={formData.hasBasement}
                onCheckedChange={(checked) => handleChange('hasBasement', checked as boolean)}
              />
              <Label htmlFor="hasBasement" className="cursor-pointer">
                {t.foundations.hasBasement}
              </Label>
            </div>
            
            {formData.hasBasement && (
              <div className="space-y-2 pr-7">
                <Label htmlFor="basementDesc">{t.foundations.basementDesc}</Label>
                <Textarea
                  id="basementDesc"
                  value={formData.basementDesc || ''}
                  onChange={(e) => handleChange('basementDesc', e.target.value)}
                  placeholder={t.foundations.basementDesc}
                  rows={2}
                  className={language === 'ar' ? 'text-right' : 'text-left'}
                />
              </div>
            )}
          </div>

          {/* Foundation Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundationType">
                {t.foundations.foundationType} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.foundationType}
                onValueChange={(value) => handleChange('foundationType', value)}
              >
                <SelectTrigger className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.foundations.foundationType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="منفصلة">{t.foundations.typeIsolated}</SelectItem>
                  <SelectItem value="مستمرة">{t.foundations.typeContinuous}</SelectItem>
                  <SelectItem value="مشتركة">{t.foundations.typeCombined}</SelectItem>
                  <SelectItem value="حصيرة">{t.foundations.typeMat}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundationModel">{t.foundations.foundationModel}</Label>
              <Select
                value={formData.foundationModel}
                onValueChange={(value) => handleChange('foundationModel', value)}
              >
                <SelectTrigger className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.foundations.foundationModel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="وسطي">{t.foundations.modelInterior}</SelectItem>
                  <SelectItem value="طرفي">{t.foundations.modelExterior}</SelectItem>
                  <SelectItem value="ركني">{t.foundations.modelCorner}</SelectItem>
                  <SelectItem value="غير ذلك">{t.foundations.modelOther}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundationDepth">{t.foundations.foundationDepth} (م)</Label>
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
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">{t.foundations.length} (م)</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                value={formData.length || ''}
                onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">{t.foundations.width} (م)</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={formData.width || ''}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">{t.foundations.height} (م)</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                value={formData.height || ''}
                onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          {/* Total Load */}
          <div className="space-y-2">
            <Label htmlFor="totalLoad">{t.foundations.totalLoad} (طن)</Label>
            <Input
              id="totalLoad"
              type="number"
              step="0.01"
              value={formData.totalLoad || ''}
              onChange={(e) => handleChange('totalLoad', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={language === 'ar' ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Preview Calculation */}
          {(formData.length && formData.width && formData.totalLoad) && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
              <p className="text-sm font-medium">{t.foundations.actualStress}:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {calculateActualStress(formData)?.toFixed(2) || '0.00'}
                </span>
                <span className="text-slate-500">{getStressUnitLabel()}</span>
              </div>
              {soilCapacity > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-slate-500">
                    {t.foundations.allowableStress}: {soilCapacity.toFixed(2)} {getStressUnitLabel()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingIndex(null);
                  setFormData({
                    hasBasement: false,
                    basementDesc: '',
                    foundationType: '',
                    foundationDepth: undefined,
                    foundationModel: '',
                    length: undefined,
                    width: undefined,
                    height: undefined,
                    totalLoad: undefined
                  });
                }}
              >
                {t.common.cancel}
              </Button>
            )}
            <Button
              onClick={handleAddFoundation}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? t.common.edit : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Foundations List */}
      {foundations.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t.foundations.title} ({foundations.length})</span>
              {soilCapacity > 0 && (
                <span className="text-sm font-normal text-slate-500">
                  {t.foundations.allowableStress}: {soilCapacity.toFixed(2)} {getStressUnitLabel()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {foundations.map((foundation, index) => (
                <AccordionItem 
                  key={foundation.id || index} 
                  value={`foundation-${index}`}
                  className={foundation.isVerified ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${foundation.isVerified ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {foundation.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                          <p className="font-semibold">{getFoundationTypeLabel(foundation.foundationType)} - {getFoundationModelLabel(foundation.foundationModel)}</p>
                          <p className="text-sm text-slate-500">
                            {t.foundations.actualStress}: {foundation.actualStress?.toFixed(2) || '0.00'} {getStressUnitLabel()} | 
                            {foundation.isVerified ? ` ${t.foundations.verified}` : ` ${t.foundations.notVerified}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-3 border-t">
                      {/* Basement Info */}
                      {foundation.hasBasement && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {t.foundations.hasBasement}: ✓
                          </p>
                          {foundation.basementDesc && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {foundation.basementDesc}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Dimensions and Loads */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.foundations.foundationType}:</span>
                          <p className="font-medium">{getFoundationTypeLabel(foundation.foundationType)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.foundations.foundationModel}:</span>
                          <p className="font-medium">{getFoundationModelLabel(foundation.foundationModel)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.foundations.foundationDepth}:</span>
                          <p className="font-medium">{foundation.foundationDepth || '-'} م</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.foundations.totalLoad}:</span>
                          <p className="font-medium">{foundation.totalLoad || '-'} طن</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">{t.foundations.length}:</span>
                          <p className="font-medium">{foundation.length || '-'} م</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.foundations.width}:</span>
                          <p className="font-medium">{foundation.width || '-'} م</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{t.foundations.height}:</span>
                          <p className="font-medium">{foundation.height || '-'} م</p>
                        </div>
                      </div>

                      {/* Stress Calculations */}
                      {(foundation.actualStress !== undefined || foundation.actualStress !== null) && (
                        <div className={`p-4 rounded-lg ${foundation.isVerified ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-red-50 dark:bg-red-950'}`}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-slate-500">{t.foundations.actualStress}:</span>
                              <p className={`text-lg font-bold ${foundation.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {foundation.actualStress?.toFixed(2) || '0.00'} {getStressUnitLabel()}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-500">{t.foundations.allowableStress}:</span>
                              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                {soilCapacity.toFixed(2)} {getStressUnitLabel()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className={`text-sm font-medium ${foundation.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {foundation.isVerified ? t.foundations.foundationVerified : t.foundations.foundationNotVerified}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFoundation(index)}
                          className="gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          {t.common.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFoundation(index)}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {t.common.delete}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading || foundations.length === 0}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
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

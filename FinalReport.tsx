'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Save, Square, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, ColumnWall } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function Columns() {
  const { t, language } = useTranslation();
  const { updateColumns } = useProjectStore();
  const { stressUnit } = useSettingsStore();

  const [columns, setColumns] = useState<ColumnWall[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [schmidtConcreteStrength, setSchmidtConcreteStrength] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ColumnWall>({
    columnType: '',
    floorNumber: '',
    width: undefined,
    depth: undefined,
    totalLoad: undefined,
  });

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load columns
      const storedColumns = localStorage.getItem('bs-columns');
      if (storedColumns) {
        setColumns(JSON.parse(storedColumns));
      }

      // Load floors from architectural report
      const storedFloors = localStorage.getItem('bs-floor-reports');
      if (storedFloors) {
        const floorReports = JSON.parse(storedFloors);
        setFloors(floorReports.map((f: any) => f.floorNumber).filter(Boolean));
      }

      // Load Schmidt concrete strength from structural report
      const storedStructural = localStorage.getItem('bs-structural-report');
      if (storedStructural) {
        const structuralReport = JSON.parse(storedStructural);
        setSchmidtConcreteStrength(structuralReport.schmidtConcreteStrength || 0);
      }
    }
  }, []);

  // Recalculate columns whenever Schmidt concrete strength changes
  useEffect(() => {
    if (columns.length > 0 && schmidtConcreteStrength > 0) {
      const recalculatedColumns = columns.map(column => calculateColumnValues(column));
      setColumns(recalculatedColumns);
      localStorage.setItem('bs-columns', JSON.stringify(recalculatedColumns));
    }
  }, [schmidtConcreteStrength]);

  // Handle project:new event
  useEffect(() => {
    const handleNewProject = () => {
      setColumns([]);
      setFormData({
        columnType: '',
        floorNumber: '',
        width: undefined,
        depth: undefined,
        totalLoad: undefined,
      });
      setSchmidtConcreteStrength(0);
      setEditingIndex(null);
    };

    // Handle project:loaded event - reload data from localStorage
    const handleLoadProjectData = () => {
      const storedColumns = localStorage.getItem('bs-columns');
      if (storedColumns) {
        try {
          const columnData = JSON.parse(storedColumns);
          setColumns(columnData);
        } catch (error) {
          console.error('Error loading columns:', error);
        }
      }

      // Load Schmidt concrete strength from structural report
      const storedStructural = localStorage.getItem('bs-structural-report');
      if (storedStructural) {
        const structuralReport = JSON.parse(storedStructural);
        setSchmidtConcreteStrength(structuralReport.schmidtConcreteStrength || 0);
      }

      // Load floors from architectural report
      const storedFloors = localStorage.getItem('bs-floor-reports');
      if (storedFloors) {
        const floorReports = JSON.parse(storedFloors);
        setFloors(floorReports.map((f: any) => f.floorNumber).filter(Boolean));
      }
    };

    window.addEventListener('project:new', handleNewProject);
    window.addEventListener('project:loaded', handleLoadProjectData);

    return () => {
      window.removeEventListener('project:new', handleNewProject);
      window.removeEventListener('project:loaded', handleLoadProjectData);
    };
  }, []);

  // Calculate column values
  const calculateColumnValues = (column: ColumnWall): ColumnWall => {
    if (!column.width || !column.depth || !column.totalLoad) {
      return { ...column, actualStress: undefined, allowableStress: undefined, isVerified: undefined };
    }

    // Section Area = Width × Depth (cm²)
    const sectionArea = column.width * column.depth;

    // Actual Stress = Total Load / Section Area (kg/cm²)
    // Convert tons to kg: tons * 1000
    const totalLoadKg = (column.totalLoad || 0) * 1000;
    const actualStress = totalLoadKg / sectionArea;

    // Allowable Stress = 0.3 × Schmidt Concrete Strength
    const allowableStress = 0.3 * schmidtConcreteStrength;

    // Verify status
    const isVerified = actualStress <= allowableStress;

    return {
      ...column,
      actualStress: parseFloat(actualStress.toFixed(2)),
      allowableStress: parseFloat(allowableStress.toFixed(2)),
      isVerified,
    };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Recalculate all columns before saving
      const recalculatedColumns = columns.map(column => calculateColumnValues(column));
      setColumns(recalculatedColumns);
      localStorage.setItem('bs-columns', JSON.stringify(recalculatedColumns));
      updateColumns(recalculatedColumns);
      toast.success('تم حفظ بيانات الأعمدة بنجاح في المشروع الحالي', {
        icon: <Save className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Error saving columns:', error);
      toast.error('حدث خطأ أثناء حفظ بيانات الأعمدة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!formData.columnType || !formData.floorNumber || !formData.width || !formData.depth || !formData.totalLoad) {
      toast.error('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }

    const calculatedColumn = calculateColumnValues(formData);

    if (editingIndex !== null) {
      const updatedColumns = [...columns];
      updatedColumns[editingIndex] = { ...calculatedColumn, id: columns[editingIndex].id };
      setColumns(updatedColumns);
      setEditingIndex(null);
      toast.success('تم تعديل العمود بنجاح', {
        icon: <Edit2 className="h-4 w-4" />
      });
    } else {
      setColumns([...columns, { ...calculatedColumn, id: `column-${Date.now()}` }]);
      toast.success('تم إضافة العمود بنجاح', {
        icon: <Plus className="h-4 w-4" />
      });
    }

    setFormData({
      columnType: '',
      floorNumber: '',
      width: undefined,
      depth: undefined,
      totalLoad: undefined,
    });
  };

  const handleEditColumn = (index: number) => {
    setFormData(columns[index]);
    setEditingIndex(index);
  };

  const handleDeleteColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
    toast.success('تم حذف العمود بنجاح', {
      icon: <Trash2 className="h-4 w-4" />
    });
  };

  const handleChange = (field: keyof ColumnWall, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value });
  };

  const getColumnTypeLabel = (type: string) => {
    switch (type) {
      case 'وسطي':
        return t.columns.typeInterior;
      case 'طرفي':
        return t.columns.typeExterior;
      case 'ركني':
        return t.columns.typeCorner;
      case 'جدار':
        return t.columns.typeWall;
      case 'أخرى':
        return t.columns.typeOther;
      default:
        return type;
    }
  };

  const getStressUnitLabel = () => {
    switch (stressUnit) {
      case 'kg/cm²':
        return t.columns.stressUnit;
      case 'ton/m²':
        return 'طن/م²';
      case 'kN/m²':
        return 'كن/م²';
      case 'Mpa':
        return 'ميغاباسكال';
      default:
        return t.columns.stressUnit;
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning if no floors exist */}
      {floors.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.common.error}</AlertTitle>
          <AlertDescription>
            {t.columns.noFloorsWarning}
          </AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Column Form */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Square className="h-5 w-5" />
            {t.columns.title}
          </CardTitle>
          <CardDescription>
            {t.columns.addColumn}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Column Type */}
            <div className="space-y-2">
              <Label htmlFor="columnType">
                {t.columns.columnType} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.columnType}
                onValueChange={(value) => handleChange('columnType', value)}
              >
                <SelectTrigger className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.columns.columnType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="وسطي">{t.columns.typeInterior}</SelectItem>
                  <SelectItem value="طرفي">{t.columns.typeExterior}</SelectItem>
                  <SelectItem value="ركني">{t.columns.typeCorner}</SelectItem>
                  <SelectItem value="جدار">{t.columns.typeWall}</SelectItem>
                  <SelectItem value="أخرى">{t.columns.typeOther}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Floor Number */}
            <div className="space-y-2">
              <Label htmlFor="floorNumber">
                {t.columns.floorNumber} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.floorNumber}
                onValueChange={(value) => handleChange('floorNumber', value)}
                disabled={floors.length === 0}
              >
                <SelectTrigger className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t.columns.floorNumber} />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total Load */}
            <div className="space-y-2">
              <Label htmlFor="totalLoad">
                {t.columns.totalLoad} (طن) <span className="text-red-500">*</span>
              </Label>
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

            {/* Section Width */}
            <div className="space-y-2">
              <Label htmlFor="width">
                {t.columns.sectionWidth} (سم) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                value={formData.width || ''}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>

            {/* Section Depth */}
            <div className="space-y-2">
              <Label htmlFor="depth">
                {t.columns.sectionDepth} (سم) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                value={formData.depth || ''}
                onChange={(e) => handleChange('depth', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
                className={language === 'ar' ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingIndex !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingIndex(null);
                  setFormData({
                    columnType: '',
                    floorNumber: '',
                    width: undefined,
                    depth: undefined,
                    totalLoad: undefined,
                  });
                }}
              >
                {t.common.cancel}
              </Button>
            )}
            <Button
              onClick={handleAddColumn}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="h-4 w-4" />
              {editingIndex !== null ? t.common.edit : t.common.add}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Columns */}
      {columns.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{t.columns.title} ({columns.length})</span>
              {schmidtConcreteStrength > 0 && (
                <span className="text-sm font-normal text-slate-500">
                  {t.structural.schmidtConcreteStrength}: {schmidtConcreteStrength} {getStressUnitLabel()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {columns.map((column, index) => {
                const sectionArea = column.width && column.depth ? (column.width * column.depth).toFixed(0) : '-';

                return (
                  <AccordionItem
                    key={column.id || index}
                    value={`column-${index}`}
                    className={column.isVerified === false ? 'border-red-300 dark:border-red-800' : ''}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${
                            column.isVerified === true
                              ? 'bg-emerald-100 dark:bg-emerald-900'
                              : column.isVerified === false
                              ? 'bg-red-100 dark:bg-red-900'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}>
                            {column.isVerified === true ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : column.isVerified === false ? (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            )}
                          </div>
                          <div className={`text-left ${column.isVerified === false ? 'text-red-600 dark:text-red-400' : ''}`}>
                            <p className="font-semibold">
                              {getColumnTypeLabel(column.columnType || '')} - {column.floorNumber}
                            </p>
                            <p className="text-sm text-slate-500">
                              {column.width && column.depth && (
                                <>
                                  {t.columns.sectionWidth}: {column.width}سم × {t.columns.sectionDepth}: {column.depth}سم
                                  <span className="mx-1">|</span>
                                  {t.columns.totalLoad}: {column.totalLoad}طن
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-3 border-t">
                        {/* Section Dimensions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500">{t.columns.sectionWidth}:</span>
                            <p className="font-medium">{column.width || '-'} سم</p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t.columns.sectionDepth}:</span>
                            <p className="font-medium">{column.depth || '-'} سم</p>
                          </div>
                          <div>
                            <span className="text-slate-500">مساحة المقطع:</span>
                            <p className="font-medium">{sectionArea} سم²</p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t.columns.totalLoad}:</span>
                            <p className="font-medium">{column.totalLoad || '-'} طن</p>
                          </div>
                        </div>

                        {/* Stress Calculations */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded">
                          <div>
                            <span className="text-slate-500">{t.columns.actualStress}:</span>
                            <p className={`font-medium ${
                              column.actualStress !== undefined && column.allowableStress !== undefined
                                ? column.actualStress <= column.allowableStress
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400'
                                : ''
                            }`}>
                              {column.actualStress !== undefined ? column.actualStress : '-'} {getStressUnitLabel()}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t.columns.allowableStress}:</span>
                            <p className="font-medium text-slate-600 dark:text-slate-400">
                              {column.allowableStress !== undefined ? column.allowableStress : '-'} {getStressUnitLabel()}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t.columns.status}:</span>
                            <p className={`font-medium ${
                              column.isVerified === true
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : column.isVerified === false
                                ? 'text-red-600 dark:text-red-400'
                                : ''
                            }`}>
                              {column.isVerified === true ? t.columns.verified : column.isVerified === false ? t.columns.notVerified : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Status Message */}
                        {column.isVerified === true && (
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            ✓ {t.columns.columnVerified}
                          </p>
                        )}
                        {column.isVerified === false && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            ✗ {t.columns.columnNotVerified}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditColumn(index)}
                            className="gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            {t.common.edit}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteColumn(index)}
                            className="gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            {t.common.delete}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading || columns.length === 0}
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

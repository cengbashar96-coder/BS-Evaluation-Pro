'use client'

import { useState, useEffect, useMemo } from 'react';
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
  const { projectInfo, updateColumns } = useProjectStore();
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

  // تحميل البيانات الأولية مع ضمان الربط الأمني
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColumns = localStorage.getItem('bs-columns');
      if (storedColumns) setColumns(JSON.parse(storedColumns));

      const storedFloors = localStorage.getItem('bs-floor-reports');
      if (storedFloors) {
        const floorReports = JSON.parse(storedFloors);
        setFloors(floorReports.map((f: any) => f.floorNumber).filter(Boolean));
      }

      const storedStructural = localStorage.getItem('bs-structural-report');
      if (storedStructural) {
        const structuralReport = JSON.parse(storedStructural);
        setSchmidtConcreteStrength(structuralReport.schmidtConcreteStrength || 0);
      }
    }
  }, []);

  // محرك الحساب الكلاسيكي (WSD) المدمج مع الأحمال التراكمية
  const calculateColumnValues = (column: ColumnWall): ColumnWall => {
    if (!column.width || !column.depth || !column.totalLoad) {
      return { ...column, actualStress: undefined, allowableStress: undefined, isVerified: undefined };
    }

    // جلب معامل عدد الطوابق (n) من المتجر
    const n = projectInfo?.floorCount || 1;
    const sectionArea = column.width * column.depth;

    // الحمل التراكمي الكلاسيكي (بدون تصعيد)
    const totalLoadKg = (column.totalLoad * n) * 1000; 
    
    // الإجهاد الفعلي (كغ/سم²)
    const actualStress = totalLoadKg / sectionArea;

    // الإجهاد المسموح (0.3 * قوة شميدت) - المعيار الكلاسيكي
    const allowableStress = 0.3 * schmidtConcreteStrength;

    return {
      ...column,
      actualStress: parseFloat(actualStress.toFixed(2)),
      allowableStress: parseFloat(allowableStress.toFixed(2)),
      isVerified: actualStress <= allowableStress,
    };
  };

  // إعادة الحساب التلقائي عند تغير قوة شميدت أو عدد الطوابق
  useEffect(() => {
    if (columns.length > 0) {
      const recalculated = columns.map(col => calculateColumnValues(col));
      setColumns(recalculated);
    }
  }, [schmidtConcreteStrength, projectInfo?.floorCount]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const finalColumns = columns.map(col => calculateColumnValues(col));
      setColumns(finalColumns);
      localStorage.setItem('bs-columns', JSON.stringify(finalColumns));
      updateColumns(finalColumns);
      toast.success('تم حفظ وتأمين بيانات الأعمدة بنجاح');
    } catch (error) {
      toast.error('خطأ في مزامنة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!formData.columnType || !formData.floorNumber || !formData.width || !formData.depth || !formData.totalLoad) {
      toast.error('يرجى إكمال البيانات الهندسية المطلوبة');
      return;
    }

    const calculated = calculateColumnValues(formData);
    if (editingIndex !== null) {
      const updated = [...columns];
      updated[editingIndex] = { ...calculated, id: columns[editingIndex].id };
      setColumns(updated);
      setEditingIndex(null);
    } else {
      setColumns([...columns, { ...calculated, id: `col-${Date.now()}` }]);
    }

    setFormData({ columnType: '', floorNumber: '', width: undefined, depth: undefined, totalLoad: undefined });
  };

  return (
    <div className="space-y-6">
      {/* تنبيه عدد الطوابق */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 font-bold">معطيات النظام</AlertTitle>
        <AlertDescription className="text-blue-700">
          يتم الحساب بناءً على <span className="font-bold underline">{projectInfo?.floorCount || 1} طابق/طوابق</span> (تراكمي) وقوة شميدت <span className="font-bold">{schmidtConcreteStrength}</span> كغ/سم².
        </AlertDescription>
      </Alert>

      <Card className="border-t-4 border-t-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Square className="h-5 w-5" /> {t.columns.title} (طريقة WSD)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>نوع العنصر</Label>
            <Select value={formData.columnType} onValueChange={(v) => setFormData({...formData, columnType: v})}>
              <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="وسطي">عمود وسطي</SelectItem>
                <SelectItem value="طرفي">عمود طرفي</SelectItem>
                <SelectItem value="ركني">عمود ركني</SelectItem>
                <SelectItem value="جدار">جدار قص</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>حمل الطابق الواحد (طن)</Label>
            <Input type="number" value={formData.totalLoad || ''} onChange={(e) => setFormData({...formData, totalLoad: parseFloat(e.target.value)})} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>العرض × العمق (سم)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="B" value={formData.width || ''} onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})} />
              <Input type="number" placeholder="H" value={formData.depth || ''} onChange={(e) => setFormData({...formData, depth: parseFloat(e.target.value)})} />
            </div>
          </div>
          <Button onClick={handleAddColumn} className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="h-4 w-4" /> {editingIndex !== null ? 'تحديث البيانات' : 'إضافة العمود للقائمة'}
          </Button>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-3">
        {columns.map((col, idx) => (
          <AccordionItem key={col.id} value={`col-${idx}`} className={`border rounded-lg px-4 ${!col.isVerified ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between w-full items-center">
                <span className="font-bold text-slate-700">{col.columnType} - {col.width}x{col.depth} سم</span>
                {col.isVerified ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className={`p-4 rounded-md grid grid-cols-2 gap-4 ${col.isVerified ? 'bg-emerald-100/50' : 'bg-red-100/50'}`}>
                <div>
                  <p className="text-xs font-bold text-slate-500">الإجهاد الفعلي (التراكمي):</p>
                  <p className={`text-xl font-black ${col.isVerified ? 'text-emerald-700' : 'text-red-700'}`}>{col.actualStress} كغ/سم²</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500">الإجهاد المسموح (كلاسيكي):</p>
                  <p className="text-xl font-black text-slate-700">{col.allowableStress} كغ/سم²</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {setEditingIndex(idx); setFormData(col)}}><Edit2 className="h-3 w-3 mr-1"/> تعديل</Button>
                <Button variant="destructive" size="sm" onClick={() => setColumns(columns.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3 mr-1"/> حذف</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-lg shadow-lg">
        <Save className="mr-2 h-5 w-5" /> {loading ? 'جاري المزامنة...' : 'حفظ ومزامنة كافة الأعمدة'}
      </Button>
    </div>
  );
}

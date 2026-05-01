'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function ColumnsPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string; 

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

  // الربط الأمني: تحميل البيانات بناءً على معرف المشروع الخاص بالمستخدم
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const storedColumns = localStorage.getItem(`bs-columns-${projectId}`);
      if (storedColumns) setColumns(JSON.parse(storedColumns));

      const storedFloors = localStorage.getItem(`bs-floor-reports-${projectId}`);
      if (storedFloors) {
        const floorReports = JSON.parse(storedFloors);
        setFloors(floorReports.map((f: any) => f.floorNumber).filter(Boolean));
      }

      const storedStructural = localStorage.getItem(`bs-structural-report-${projectId}`);
      if (storedStructural) {
        const structuralReport = JSON.parse(storedStructural);
        setSchmidtConcreteStrength(structuralReport.schmidtConcreteStrength || 0);
      }
    }
  }, [projectId]);

  // طريقة إجهادات التشغيل الكلاسيكية (WSD) مع الحساب التراكمي
  const calculateColumnValues = (column: ColumnWall): ColumnWall => {
    if (!column.width || !column.depth || !column.totalLoad) {
      return { ...column, actualStress: undefined, allowableStress: undefined, isVerified: undefined };
    }

    const n = projectInfo?.floorCount || 1;
    const sectionArea = column.width * column.depth;

    // P_total = P_floor * n (Working Load - No Factors)
    const totalLoadKg = (column.totalLoad * n) * 1000; 
    
    // Actual Stress = P / A
    const actualStress = totalLoadKg / sectionArea;

    // Allowable Stress = 0.3 * Schmidt Strength (Classical WSD Factor)
    const allowableStress = 0.3 * schmidtConcreteStrength;

    return {
      ...column,
      actualStress: parseFloat(actualStress.toFixed(2)),
      allowableStress: parseFloat(allowableStress.toFixed(2)),
      isVerified: actualStress <= allowableStress,
    };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const finalColumns = columns.map(col => calculateColumnValues(col));
      setColumns(finalColumns);
      localStorage.setItem(`bs-columns-${projectId}`, JSON.stringify(finalColumns));
      updateColumns(finalColumns);
      toast.success('تم مزامنة بيانات الأعمدة وتأمينها بنجاح');
    } catch (error) {
      toast.error('فشلت عملية المزامنة مع قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!formData.columnType || !formData.floorNumber || !formData.width || !formData.depth || !formData.totalLoad) {
      toast.error('يرجى استكمال المعطيات الفنية');
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
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <Alert className="bg-white border-l-4 border-l-emerald-600 shadow-sm">
        <AlertCircle className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="font-bold">نظام التدقيق الإنشائي الكلاسيكي</AlertTitle>
        <AlertDescription>
          معرف المشروع: <span className="font-mono text-blue-600 font-bold">{projectId}</span> | 
          تراكم الطوابق المحسوب: <span className="font-bold">{projectInfo?.floorCount || 1}</span>
        </AlertDescription>
      </Alert>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5" /> إضافة عمود جديد للمشروع
          </CardTitle>
          <CardDescription className="text-emerald-100">أدخل معطيات العنصر للتحقق من أمان الإجهادات</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-semibold">نوع العمود</Label>
            <Select value={formData.columnType} onValueChange={(v) => setFormData({...formData, columnType: v})}>
              <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="وسطي">وسطي</SelectItem>
                <SelectItem value="طرفي">طرفي</SelectItem>
                <SelectItem value="ركني">ركني</SelectItem>
                <SelectItem value="جدار">جدار قص</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">حمل الطابق الواحد (طن)</Label>
            <Input type="number" value={formData.totalLoad || ''} onChange={(e) => setFormData({...formData, totalLoad: parseFloat(e.target.value)})} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">الأبعاد (سم) B x H</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="B" value={formData.width || ''} onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})} />
              <Input type="number" placeholder="H" value={formData.depth || ''} onChange={(e) => setFormData({...formData, depth: parseFloat(e.target.value)})} />
            </div>
          </div>
          <Button onClick={handleAddColumn} className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 font-bold">
            <Plus className="h-4 w-4 mr-2" /> {editingIndex !== null ? 'تعديل البيانات' : 'تثبيت العمود في القائمة'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {columns.map((col, idx) => (
          <div key={col.id} className={`p-4 rounded-xl border-2 transition-all bg-white shadow-sm ${!col.isVerified ? 'border-red-400' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${col.isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {col.isVerified ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{col.columnType}</h4>
                  <p className="text-xs text-slate-500">{col.width}x{col.depth} سم</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">التحقق</p>
                <p className={`font-black ${col.isVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                  {col.isVerified ? 'آمن' : 'غير آمن'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded text-center">
                <p className="text-[10px] text-slate-400">الإجهاد الفعلي</p>
                <p className="text-sm font-bold">{col.actualStress} كغ/سم²</p>
              </div>
              <div className="bg-slate-50 p-2 rounded text-center">
                <p className="text-[10px] text-slate-400">الإجهاد المسموح</p>
                <p className="text-sm font-bold">{col.allowableStress} كغ/سم²</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => {setEditingIndex(idx); setFormData(col)}}><Edit2 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setColumns(columns.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 h-14 text-lg font-bold shadow-xl">
        <Save className="h-5 w-5 mr-2" /> {loading ? 'جاري الحفظ...' : 'حفظ ومزامنة المشروع'}
      </Button>
    </div>
  );
}

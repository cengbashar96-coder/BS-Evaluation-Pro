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
  const projectId = params.id as string; // الحصول على معرف المشروع من المسار

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

  // مزامنة البيانات مع هوية المشروع والمستخدم
  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  // محرك الحساب الكلاسيكي (WSD) - إجهادات التشغيل
  const calculateColumnValues = (column: ColumnWall): ColumnWall => {
    if (!column.width || !column.depth || !column.totalLoad) {
      return { ...column, actualStress: undefined, allowableStress: undefined, isVerified: undefined };
    }

    // معامل التراكم بناءً على عدد الطوابق المسجل في حساب المستخدم للمشروع
    const n = projectInfo?.floorCount || 1;
    const sectionArea = column.width * column.depth;

    // الحمل التراكمي (بدون تصعيد - طريقة كلاسيكية)
    const totalLoadKg = (column.totalLoad * n) * 1000; 
    
    // الإجهاد الفعلي كغ/سم²
    const actualStress = totalLoadKg / sectionArea;

    // الإجهاد المسموح = 0.3 * مقاومة شميدت (معيار الأمان الكلاسيكي)
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
      // حفظ البيانات مرتبطة بمعرف المشروع لضمان خصوصية حساب المستخدم
      localStorage.setItem(`bs-columns-${projectId}`, JSON.stringify(finalColumns));
      updateColumns(finalColumns);
      toast.success('تم تأمين وحفظ بيانات الأعمدة للمشروع');
    } catch (error) {
      toast.error('حدث خطأ أثناء المزامنة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    if (!formData.columnType || !formData.floorNumber || !formData.width || !formData.depth || !formData.totalLoad) {
      toast.error('يرجى ملء كافة المعطيات الإنشائية');
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
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* نظام التنبيه الذكي للمستخدم */}
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertTitle className="text-emerald-800 font-bold underline">نظام الحساب الكلاسيكي النشط (WSD)</AlertTitle>
        <AlertDescription className="text-emerald-700">
          المشروع الحالي: <span className="font-bold">{projectId}</span> | 
          عدد الطوابق التراكمي: <span className="font-bold">{projectInfo?.floorCount || 1}</span> | 
          قوة شميدت المعتمدة: <span className="font-bold">{schmidtConcreteStrength} كغ/سم²</span>
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-t-4 border-t-emerald-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800 flex justify-center gap-2">
            <Square className="h-6 w-6 text-emerald-600" /> مدخلات أعمدة المشروع
          </CardTitle>
          <CardDescription>أدخل أبعاد المقطع وحمل الطابق الواحد للحساب التراكمي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="font-bold">موقع العمود</Label>
              <Select value={formData.columnType} onValueChange={(v) => setFormData({...formData, columnType: v})}>
                <SelectTrigger><SelectValue placeholder="اختر الموقع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="وسطي">عمود وسطي</SelectItem>
                  <SelectItem value="طرفي">عمود طرفي</SelectItem>
                  <SelectItem value="ركني">عمود ركني</SelectItem>
                  <SelectItem value="جدار">جدار قص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">حمل الطابق الواحد (طن)</Label>
              <Input type="number" value={formData.totalLoad || ''} onChange={(e) => setFormData({...formData, totalLoad: parseFloat(e.target.value)})} placeholder="مثلاً: 25" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">أبعاد المقطع (B x H) سم</Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="العرض" value={formData.width || ''} onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})} />
                <Input type="number" placeholder="العمق" value={formData.depth || ''} onChange={(e) => setFormData({...formData, depth: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
          <Button onClick={handleAddColumn} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg">
            {editingIndex !== null ? 'تحديث العمود' : 'إضافة العمود للقائمة'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {columns.map((col, idx) => (
          <div key={col.id} className={`p-5 border-2 rounded-xl transition-all ${!col.isVerified ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-lg text-slate-800">{col.columnType} ({col.width}x{col.depth} سم)</h3>
              {col.isVerified ? 
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">آمن إنشائياً</span> : 
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">خطر - تجاوز الإجهاد</span>
              }
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500">الإجهاد الفعلي (كلاسيك)</p>
                <p className={`text-xl font-black ${col.isVerified ? 'text-emerald-700' : 'text-red-700'}`}>{col.actualStress} كغ/سم²</p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-500">الإجهاد المسموح (0.3 fc)</p>
                <p className="text-xl font-black text-slate-700">{col.allowableStress} كغ/سم²</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 border-t pt-3">
              <Button variant="ghost" size="sm" onClick={() => {setEditingIndex(idx); setFormData(col)}}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setColumns(columns.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full h-16 text-xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow-xl">
        <Save className="mr-2 h-6 w-6" /> {loading ? 'جاري تأمين البيانات...' : 'حفظ ومزامنة كافة الأعمدة'}
      </Button>
    </div>
  );
}

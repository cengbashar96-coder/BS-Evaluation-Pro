'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit2, Trash2, Save, Layers, CheckCircle2, XCircle, AlertTriangle, Calculator 
} from 'lucide-react';
import { useTranslation } from '@/store/lib/i18n/translations';
import { useProjectStore, BeamSlab } from '@/store/projectStore';
import { toast } from 'sonner';

export default function BeamsAndSlabsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const projectId = params.id as string;
  const { updateBeams, projectInfo } = useProjectStore();
  
  const [elements, setElements] = useState<BeamSlab[]>([]);
  const [schmidtStrength, setSchmidtStrength] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<BeamSlab>>({
    element: '',
    floorNumber: '',
    type: 'beam', // beam or slab
    width: undefined,
    height: undefined,
    span: undefined,
    totalLoad: undefined,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-beams-${projectId}`);
      if (stored) setElements(JSON.parse(stored));

      const structural = localStorage.getItem(`bs-structural-report-${projectId}`);
      if (structural) {
        const data = JSON.parse(structural);
        setSchmidtStrength(data.schmidtConcreteStrength || 0);
      }
    }
  }, [projectId]);

  // محرك الحساب الكلاسيكي (WSD) المعتمد على تحليل ملفاتك
  const performStructuralCheck = (data: Partial<BeamSlab>): BeamSlab => {
    const { width, height, span, totalLoad, type } = data;
    if (!width || !height || !span || !totalLoad) return data as BeamSlab;

    // الحساب الكلاسيكي للعزم (M = qL²/8 للجوائز و qL²/10 للبلاطات المستمرة تقريبياً)
    const coeff = type === 'slab' ? 10 : 8;
    const moment = (totalLoad * Math.pow(span, 2)) / coeff;

    // حساب الإجهاد الفعلي (WSD)
    const d = height - (type === 'slab' ? 2.5 : 5); // التغطية
    const actualStress = (moment * 100000) / (0.35 * width * Math.pow(d, 2));
    
    // الإجهاد المسموح (0.4 للاحناء في الجوائز و 0.35 للبلاطات)
    const allowableStress = (type === 'slab' ? 0.35 : 0.4) * schmidtStrength;

    return {
      ...data,
      id: data.id || `el-${Date.now()}`,
      actualStress: parseFloat(actualStress.toFixed(2)),
      allowableStress: parseFloat(allowableStress.toFixed(2)),
      isVerified: actualStress <= allowableStress
    } as BeamSlab;
  };

  const handleAddElement = () => {
    if (!formData.element || !formData.width || !formData.height || !formData.totalLoad) {
      toast.error('يرجى إدخال البيانات الفنية الأساسية');
      return;
    }

    const processed = performStructuralCheck(formData);
    if (editingIndex !== null) {
      const updated = [...elements];
      updated[editingIndex] = processed;
      setElements(updated);
      setEditingIndex(null);
    } else {
      setElements([...elements, processed]);
    }
    resetForm();
  };

  const resetForm = () => setFormData({ element: '', type: 'beam', width: undefined, height: undefined, span: undefined, totalLoad: undefined });

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem(`bs-beams-${projectId}`, JSON.stringify(elements));
      updateBeams(elements);
      toast.success('تمت المزامنة وحفظ العناصر الإنشائية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Layers className="h-6 w-6 text-emerald-400" /> البلاطات والجوائز
              </CardTitle>
              <CardDescription className="text-slate-300 italic">مشروع: {projectId} | نظام WSD الكلاسيكي</CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400">
              قوة شميدت: {schmidtStrength} كغ/سم²
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج الإدخال المستوحى من SlabsAndBeams.tsx */}
        <Card className="lg:col-span-1 shadow-md border-t-4 border-emerald-500">
          <CardHeader><CardTitle className="text-lg">إدخال عنصر جديد</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نوع العنصر</Label>
              <Select value={formData.type} onValueChange={(v: 'beam' | 'slab') => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beam">جائز (Beam)</SelectItem>
                  <SelectItem value="slab">بلاطة (Slab)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اسم العنصر</Label>
              <Input value={formData.element} onChange={(e) => setFormData({...formData, element: e.target.value})} placeholder="مثلاً: B101" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>العرض B (سم)</Label>
                <Input type="number" value={formData.width || ''} onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>الارتفاع H (سم)</Label>
                <Input type="number" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الحمل (طن/م طولي أو م²)</Label>
              <Input type="number" value={formData.totalLoad || ''} onChange={(e) => setFormData({...formData, totalLoad: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>الفتحة L (متر)</Label>
              <Input type="number" value={formData.span || ''} onChange={(e) => setFormData({...formData, span: parseFloat(e.target.value)})} />
            </div>
            <Button onClick={handleAddElement} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {editingIndex !== null ? 'تحديث العنصر' : 'إضافة للقائمة'}
            </Button>
          </CardContent>
        </Card>

        {/* عرض العناصر المستوحى من Beams.tsx */}
        <div className="lg:col-span-2 space-y-4">
          <Accordion type="multiple" className="w-full space-y-2">
            {elements.map((el, index) => (
              <AccordionItem key={el.id} value={el.id!} className="border rounded-lg bg-white px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-3">
                      {el.isVerified ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                      <span className="font-bold">{el.element} - {el.type === 'beam' ? 'جائز' : 'بلاطة'}</span>
                    </div>
                    <Badge variant="secondary">{el.width}x{el.height} سم</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[10px] text-slate-500 uppercase">الإجهاد الفعلي</p>
                      <p className={`font-bold ${el.isVerified ? 'text-emerald-600' : 'text-red-600'}`}>{el.actualStress}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[10px] text-slate-500 uppercase">المسموح</p>
                      <p className="font-bold">{el.allowableStress}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[10px] text-slate-500 uppercase">الحمل</p>
                      <p className="font-bold">{el.totalLoad} T</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[10px] text-slate-500 uppercase">الفتحة</p>
                      <p className="font-bold">{el.span} M</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => {setEditingIndex(index); setFormData(el)}}><Edit2 className="h-3 w-3 mr-1" /> تعديل</Button>
                    <Button variant="destructive" size="sm" onClick={() => setElements(elements.filter((_, i) => i !== index))}><Trash2 className="h-3 w-3 mr-1" /> حذف</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {elements.length > 0 && (
            <Button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 h-12">
              <Save className="h-4 w-4 mr-2" /> {loading ? 'جاري الحفظ...' : 'حفظ كافة العناصر في المشروع'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

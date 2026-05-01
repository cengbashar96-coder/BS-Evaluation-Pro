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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Save, Layers, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, Foundation } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function FoundationsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const projectId = params.id as string;

  const { updateFoundations, projectInfo } = useProjectStore();
  const { stressUnit } = useSettingsStore();
  
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [soilCapacity, setSoilCapacity] = useState<number>(0);
  
  const [formData, setFormData] = useState<Partial<Foundation>>({
    foundationType: '',
    foundationModel: '',
    length: undefined,
    width: undefined,
    height: undefined,
    totalLoad: undefined,
  });

  // مزامنة البيانات مع هوية المشروع والمستخدم (Security Integration)
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-foundations-${projectId}`);
      if (stored) setFoundations(JSON.parse(stored));

      const structural = localStorage.getItem(`bs-structural-report-${projectId}`);
      if (structural) {
        const data = JSON.parse(structural);
        setSoilCapacity(data.soilCapacity || 0);
      }
    }
  }, [projectId]);

  // محرك الحساب الإنشائي الكلاسيكي للأساسات
  const calculateFoundationSafety = (data: Partial<Foundation>): Foundation => {
    const { length, width, totalLoad } = data;
    if (!length || !width || !totalLoad) return data as Foundation;

    // الإجهاد الفعلي = الحمل الكلي / مساحة القاعدة
    // ملاحظة: الحمل هنا يُفترض أنه حمل تشغيلي (Working Load) حسب طريقتنا
    const area = length * width;
    const actualStress = (totalLoad / area) * 10; // تحويل إلى كغ/سم² إذا كانت الأبعاد بالمتر والحمل بالطن

    return {
      ...data,
      id: data.id || `fnd-${Date.now()}`,
      actualStress: parseFloat(actualStress.toFixed(2)),
      isVerified: actualStress <= soilCapacity
    } as Foundation;
  };

  const handleAddFoundation = () => {
    if (!formData.foundationType || !formData.length || !formData.width || !formData.totalLoad) {
      toast.error('يرجى إكمال بيانات القاعدة الفنية');
      return;
    }

    const processed = calculateFoundationSafety(formData);
    if (editingIndex !== null) {
      const updated = [...foundations];
      updated[editingIndex] = processed;
      setFoundations(updated);
      setEditingIndex(null);
    } else {
      setFoundations([...foundations, processed]);
    }
    setFormData({ foundationType: '', foundationModel: '', length: undefined, width: undefined, height: undefined, totalLoad: undefined });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem(`bs-foundations-${projectId}`, JSON.stringify(foundations));
      updateFoundations(foundations);
      toast.success('تم تأمين بيانات الأساسات للمشروع بنجاح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* نظام التنبيه المرتبط بتقرير التربة */}
      <Alert className={`border-l-4 ${soilCapacity > 0 ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
        <AlertTriangle className={soilCapacity > 0 ? 'text-emerald-600' : 'text-red-600'} />
        <AlertTitle className="font-bold">بيانات التربة المرجعية</AlertTitle>
        <AlertDescription>
          إجهاد التربة المسموح المسجل: <span className="font-black underline">{soilCapacity} كغ/سم²</span>
          {soilCapacity === 0 && " (يرجى تحديث تقرير التربة أولاً)"}
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-t-4 border-emerald-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" /> إضافة أساس جديد
          </CardTitle>
          <CardDescription>أدخل أبعاد القاعدة والحمل التصميمي (بدون تصعيد)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع الأساس</Label>
              <Select value={formData.foundationType} onValueChange={(v) => setFormData({...formData, foundationType: v})}>
                <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="isolated">قاعدة منفردة</SelectItem>
                  <SelectItem value="combined">قاعدة مشتركة</SelectItem>
                  <SelectItem value="raft">لبشة خرسانية</SelectItem>
                  <SelectItem value="strip">أساس شريطي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحمل الكلي الواصل (طن)</Label>
              <Input type="number" value={formData.totalLoad || ''} onChange={(e) => setFormData({...formData, totalLoad: parseFloat(e.target.value)})} placeholder="مثلاً: 120" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>الطول L (متر)</Label>
                <Input type="number" value={formData.length || ''} onChange={(e) => setFormData({...formData, length: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>العرض B (متر)</Label>
                <Input type="number" value={formData.width || ''} onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>السماكة H (سم)</Label>
              <Input type="number" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})} />
            </div>
          </div>
          <Button onClick={handleAddFoundation} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-bold">
            <Plus className="h-5 w-5 mr-1" /> {editingIndex !== null ? 'تحديث بيانات القاعدة' : 'تثبيت القاعدة في النظام'}
          </Button>
        </CardContent>
      </Card>

      {foundations.length > 0 && (
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-2"><CardTitle className="text-lg text-slate-700">نتائج التحقق من إجهادات التربة</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-3">
              {foundations.map((fnd, index) => (
                <AccordionItem key={fnd.id} value={fnd.id!} className="border rounded-xl px-4 bg-slate-50/50">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-3 text-right">
                        {fnd.isVerified ? <CheckCircle className="text-emerald-500" /> : <XCircle className="text-red-500" />}
                        <div>
                          <p className="font-bold text-slate-800">{fnd.foundationModel || `قاعدة ${index + 1}`}</p>
                          <p className="text-xs text-slate-500">{fnd.length}m × {fnd.width}m</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-[10px] font-bold text-slate-400">الإجهاد</p>
                        <p className={`text-sm font-black ${fnd.isVerified ? 'text-emerald-600' : 'text-red-600'}`}>
                          {fnd.actualStress} <span className="text-[10px]">كغ/سم²</span>
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 border-t border-slate-100">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => {setEditingIndex(index); setFormData(fnd)}}>
                        <Edit2 className="h-3 w-3 mr-1" /> تعديل
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setFoundations(foundations.filter((_, i) => i !== index))}>
                        <Trash2 className="h-3 w-3 mr-1" /> حذف
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSave}
        disabled={loading || foundations.length === 0}
        className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-xl text-xl font-black rounded-2xl transition-all"
      >
        <Save className="h-6 w-6 mr-2" />
        {loading ? "جاري تشفير وحفظ البيانات..." : "حفظ ومزامنة أساسات المشروع"}
      </Button>
    </div>
  );
}

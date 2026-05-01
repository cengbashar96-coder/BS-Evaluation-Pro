'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, UserCheck, FileText, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, type Engineer } from '@/store/projectStore';
import { toast } from 'sonner';

/**
 * Final Report Page - الواجهة العاشرة
 * تتضمن نوع التقرير (وضعي راهن أو إضافة) وجدول المهندسين المعتمدين
 * متوافقة مع عزل بيانات المشتركين ومعايير النقابة
 */
export default function FinalReportPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string;
  
  const { updateEngineers } = useProjectStore();

  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [reportPurpose, setReportPurpose] = useState<'additionalFloor' | 'violationSettlement' | 'currentStatus'>('currentStatus');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // حالة الفورم لإضافة مهندس
  const [engineerForm, setEngineerForm] = useState<Engineer>({
    sequence: 1,
    specialty: '',
    name: '',
    unionNumber: ''
  });

  // تحميل البيانات بناءً على projectId لضمان الحماية
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-final-report-${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEngineers(parsed.engineers || []);
        setReportPurpose(parsed.reportPurpose || 'currentStatus');
      }
    }
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const finalData = { engineers, reportPurpose };
      localStorage.setItem(`bs-final-report-${projectId}`, JSON.stringify(finalData));
      updateEngineers(engineers); // تحديث الـ Store
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEngineer = () => {
    if (!engineerForm.name || !engineerForm.specialty) {
      toast.error(language === 'ar' ? 'يرجى ملء اسم المهندس واختصاصه' : 'Please fill name and specialty');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...engineers];
      updated[editingIndex] = engineerForm;
      setEngineers(updated);
      setEditingIndex(null);
    } else {
      setEngineers([...engineers, { ...engineerForm, sequence: engineers.length + 1 }]);
    }

    setEngineerForm({ sequence: 1, specialty: '', name: '', unionNumber: '' });
  };

  const handleDeleteEngineer = (index: number) => {
    setEngineers(engineers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* 1. تحديد غرض التقرير (الخيارين الأساسيين) */}
      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="h-6 w-6" />
            نوع التقرير الفني النهائي
          </CardTitle>
          <CardDescription>اختر الغرض القانوني والهندسي من هذا التقرير</CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={reportPurpose} 
            onValueChange={(value: any) => setReportPurpose(value)}
          >
            <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900 border-2 focus:ring-blue-500">
              <SelectValue placeholder="اختر نوع التقرير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="violationSettlement">تقرير وضع راهن (تسوية مخالفة دون إضافات)</SelectItem>
              <SelectItem value="additionalFloor">تقرير فني هندسي (لإضافة طوابق أو كتل جديدة)</SelectItem>
              <SelectItem value="currentStatus">تقرير فحص سلامة عامة بالوضع القائم</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {reportPurpose === 'violationSettlement' 
                ? "إقرار: المنشأة سليمة بوضعها الحالي، والتقرير مقدم لغرض التسوية القانونية فقط." 
                : "إقرار: المنشأة قادرة إنشائياً على تحمل الأحمال الإضافية المقترحة وفق الكود الهندسي."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. إضافة وتعديل المهندسين */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            إضافة المهندسين القائمين على التقرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اسم المهندس</Label>
              <Input 
                value={engineerForm.name} 
                onChange={(e) => setEngineerForm({...engineerForm, name: e.target.value})}
                placeholder="الاسم الثلاثي..."
              />
            </div>
            <div className="space-y-2">
              <Label>الاختصاص</Label>
              <Select 
                value={engineerForm.specialty} 
                onValueChange={(val) => setEngineerForm({...engineerForm, specialty: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الاختصاص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="معماري">مهندس معماري</SelectItem>
                  <SelectItem value="مدني - إنشائي">مهندس مدني (إنشائي)</SelectItem>
                  <SelectItem value="كهرباء">مهندس كهرباء</SelectItem>
                  <SelectItem value="ميكانيك - صحي">مهندس ميكانيك (صحي)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم النقابة</Label>
              <div className="flex gap-2">
                <Input 
                  value={engineerForm.unionNumber || ''} 
                  onChange={(e) => setEngineerForm({...engineerForm, unionNumber: e.target.value})}
                  placeholder="00000"
                />
                <Button onClick={handleAddEngineer} className="bg-emerald-600 hover:bg-emerald-700">
                  {editingIndex !== null ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* جدول المهندسين */}
          {engineers.length > 0 && (
            <div className="border rounded-lg overflow-hidden mt-6">
              <Table>
                <TableHeader className="bg-slate-100 dark:bg-slate-800">
                  <TableRow>
                    <TableHead className="text-center w-12">#</TableHead>
                    <TableHead>المهندس</TableHead>
                    <TableHead>الاختصاص</TableHead>
                    <TableHead>رقم النقابة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engineers.map((eng, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-center font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-bold">{eng.name}</TableCell>
                      <TableCell>{eng.specialty}</TableCell>
                      <TableCell>{eng.unionNumber}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingIndex(idx); setEngineerForm(eng); }}>
                            <Edit2 className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEngineer(idx)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. تصديق النقابة واعتماد لجنة المكاتب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/10">
          <CardContent className="pt-6 flex items-center gap-4">
            <BadgeCheck className="h-10 w-10 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-400">تصديق النقابة</h3>
              <p className="text-xs text-amber-700 dark:text-amber-500">يخضع هذا التقرير لتدقيق وتصديق نقابة المهندسين واللجان المختصة.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10">
          <CardContent className="pt-6 flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-purple-600 shrink-0" />
            <div>
              <h3 className="font-bold text-purple-900 dark:text-purple-400">لجنة المكاتب الهندسية</h3>
              <p className="text-xs text-purple-700 dark:text-purple-500">تم مراجعة التقرير وفق معايير لجنة المكاتب الهندسية المشتركة.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* زر الحفظ النهائي والمزامنة */}
      <Button 
        onClick={handleSave} 
        disabled={loading || engineers.length === 0}
        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-lg rounded-xl shadow-xl transition-all active:scale-95"
      >
        <Save className="h-5 w-5 ml-2" />
        {loading ? t.common.loading : "اعتماد وحفظ التقرير النهائي"}
      </Button>
    </div>
  );
}

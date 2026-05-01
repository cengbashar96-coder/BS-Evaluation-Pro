'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, Printer, FileDown, Loader2, CheckCircle2, 
  Building2, Zap, Droplets, ShieldCheck, UserCheck, MapPin
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore } from '@/store/projectStore';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate Reports Page - واجهة توليد التقارير
 * تقوم بتجميع كافة بيانات الواجهات السابقة وتنسيقها للطباعة
 */
export default function GenerateReportsPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    buildingInfo: true,
    architectural: true,
    structural: true,
    electrical: true,
    plumbing: true,
    technicalNotes: true,
    engineers: true
  });

  // جلب كافة البيانات من Store المركزي
  const projectData = useProjectStore();

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Report-${projectId.substring(0, 8)}.pdf`);
      toast.success(language === 'ar' ? 'تم تصدير التقرير بنجاح' : 'PDF Exported Successfully');
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-emerald-600" />
            توليد التقرير النهائي
          </h1>
          <p className="text-sm text-muted-foreground mt-1">راجع البيانات واختر الأقسام المطلوبة للطباعة</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> {language === 'ar' ? 'طباعة' : 'Print'}
          </Button>
          <Button onClick={exportToPDF} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* قائمة التحكم بالأقسام */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">تخصيص التقرير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(selectedSections).map((section) => (
              <div key={section} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id={section} 
                  checked={selectedSections[section as keyof typeof selectedSections]}
                  onCheckedChange={(checked) => 
                    setSelectedSections(prev => ({ ...prev, [section]: !!checked }))
                  }
                />
                <Label htmlFor={section} className="text-sm cursor-pointer capitalize">
                  {section === 'buildingInfo' && 'بيانات المنشأة'}
                  {section === 'architectural' && 'التقرير المعماري'}
                  {section === 'structural' && 'التقرير الإنشائي'}
                  {section === 'electrical' && 'التقرير الكهربائي'}
                  {section === 'plumbing' && 'التقرير الصحي'}
                  {section === 'technicalNotes' && 'الملاحظات الفنية'}
                  {section === 'engineers' && 'اعتمادات المهندسين'}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* مسودة المعاينة (Preview) */}
        <Card className="lg:col-span-3 overflow-hidden shadow-2xl">
          <ScrollArea className="h-[800px] bg-slate-50 dark:bg-slate-950 p-4 md:p-12">
            <div ref={reportRef} className="bg-white dark:bg-slate-900 min-h-[1123px] p-10 shadow-sm border mx-auto max-w-[800px] text-right" dir="rtl">
              
              {/* ترويسة التقرير الرسمية */}
              <div className="flex justify-between items-center border-b-4 border-emerald-600 pb-6 mb-8">
                <div className="text-center">
                  <h2 className="text-xl font-black">الجمهورية العربية السورية</h2>
                  <h3 className="text-lg font-bold">نقابة المهندسين</h3>
                  <p className="text-sm">لجنة المكاتب الهندسيّة</p>
                </div>
                <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-emerald-500">
                   <span className="text-xs font-bold text-emerald-700">LOGO</span>
                </div>
                <div className="text-left" dir="ltr">
                  <p className="text-xs font-mono">ID: {projectId.toUpperCase()}</p>
                  <p className="text-xs mt-1 font-bold">{new Date().toLocaleDateString('ar-SY')}</p>
                </div>
              </div>

              {/* محتوى التقرير بناءً على الاختيار */}
              <div className="space-y-10">
                
                {selectedSections.buildingInfo && (
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold bg-slate-100 p-2 rounded mb-4">
                      <Building2 className="h-5 w-5" /> بيانات الهوية للمنشأة
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><strong>اسم المالك:</strong> {projectData.buildingInfo?.ownerName || '---'}</p>
                      <p><strong>الموقع:</strong> {projectData.buildingInfo?.location || '---'}</p>
                      <p><strong>رقم العقار:</strong> {projectData.buildingInfo?.propertyNumber || '---'}</p>
                      <p><strong>عدد الطوابق:</strong> {projectData.buildingInfo?.floorCount || '---'}</p>
                    </div>
                  </section>
                )}

                {selectedSections.structural && (
                  <section>
                    <h4 className="flex items-center gap-2 text-lg font-bold bg-slate-100 p-2 rounded mb-4">
                      <ShieldCheck className="h-5 w-5" /> تقرير السلامة الإنشائية
                    </h4>
                    <p className="text-sm leading-relaxed mb-4">
                      <strong>الجملة الإنشائية:</strong> {projectData.structuralReport?.structuralSystem || 'لا توجد بيانات'}
                    </p>
                    <div className="border rounded-md p-4 bg-emerald-50/50">
                       <p className="text-sm"><strong>مقاومة الخرسانة (Schmidt):</strong> {projectData.structuralReport?.schmidtConcreteStrength || '---'} كغ/سم²</p>
                       <p className="text-sm mt-2"><strong>إجهاد التربة المسموح:</strong> {projectData.structuralReport?.soilCapacity || '---'} كغ/سم²</p>
                    </div>
                  </section>
                )}

                {selectedSections.engineers && (
                  <section className="mt-20">
                    <h4 className="text-center text-lg font-bold mb-6 underline">لجنة الاعتماد وتصديق التقارير</h4>
                    <Table className="border">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-right">المهندس</TableHead>
                          <TableHead className="text-right">الاختصاص</TableHead>
                          <TableHead className="text-right">رقم النقابة</TableHead>
                          <TableHead className="text-center">التوقيع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(projectData.engineers || []).map((eng, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-bold">{eng.name}</TableCell>
                            <TableCell>{eng.specialty}</TableCell>
                            <TableCell>{eng.unionNumber}</TableCell>
                            <TableCell className="h-12 border-r italic text-slate-300 text-center">توقيع رسمي</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                )}

              </div>

              {/* تذييل الصفحة */}
              <div className="mt-12 pt-6 border-t text-center text-[10px] text-slate-400">
                <p>تم توليد هذا التقرير آلياً بواسطة نظام B.S-Evaluation-Pro للتقييم الهندسي</p>
                <p>حقوق الطبع والمزامنة محفوظة © 2026</p>
              </div>

            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}

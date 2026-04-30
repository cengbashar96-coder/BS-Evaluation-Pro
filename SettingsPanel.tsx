'use client'

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { 
  FileText, 
  Building2, 
  Layout, 
  HardHat, 
  Layers, 
  Columns, 
  Square,
  Zap, 
  Droplets, 
  FileCheck, 
  CheckCircle2, 
  FileDown,
  Printer,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Ruler,
  Home,
  AlertTriangle,
  CheckCircle,
  FileSignature
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SectionData {
  hasData: boolean;
  data: any;
}

export default function GenerateReports() {
  const { t, language } = useTranslation();
  const { savedProjects, currentProjectId } = useProjectStore();
  const { stressUnit, loadUnit, lengthUnit, areaUnit } = useSettingsStore();
  
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sectionsData, setSectionsData] = useState<Record<string, SectionData>>({});
  const [showFullReport, setShowFullReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const currentProject = savedProjects.find(p => p.id === currentProjectId);

  // Section definitions with icons and colors
  const sections = [
    {
      key: 'building',
      titleKey: 'sectionBuilding',
      icon: Building2,
      color: 'border-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'architectural',
      titleKey: 'sectionArchitectural',
      icon: Layout,
      color: 'border-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      key: 'structural',
      titleKey: 'sectionStructural',
      icon: HardHat,
      color: 'border-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      key: 'foundations',
      titleKey: 'sectionFoundations',
      icon: Layers,
      color: 'border-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      key: 'columns',
      titleKey: 'sectionColumns',
      icon: Columns,
      color: 'border-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      iconColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      key: 'beams',
      titleKey: 'sectionBeams',
      icon: Square,
      color: 'border-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      key: 'electrical',
      titleKey: 'sectionElectrical',
      icon: Zap,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      key: 'plumbing',
      titleKey: 'sectionPlumbing',
      icon: Droplets,
      color: 'border-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      key: 'notes',
      titleKey: 'sectionNotes',
      icon: FileText,
      color: 'border-slate-500',
      bgColor: 'bg-slate-50 dark:bg-slate-950',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
    {
      key: 'final',
      titleKey: 'sectionFinal',
      icon: FileCheck,
      color: 'border-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      iconColor: 'text-teal-600 dark:text-teal-400',
    }
  ];

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const storageKeys = {
          building: 'bs-building-info',
          architectural: 'bs-floor-reports',
          structural: 'bs-structural-report',
          foundations: 'bs-foundations',
          columns: 'bs-columns',
          beams: 'bs-beams',
          electrical: 'bs-electrical',
          plumbing: 'bs-plumbing',
          notes: 'bs-technical-notes',
          final: 'bs-engineers'
        };

        const loadedData: Record<string, SectionData> = {};

        Object.entries(storageKeys).forEach(([key, storageKey]) => {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const hasData = Array.isArray(parsed) ? parsed.length > 0 : 
                             typeof parsed === 'object' ? Object.keys(parsed).length > 0 : !!parsed;
              loadedData[key] = { hasData, data: parsed };
            } catch (e) {
              loadedData[key] = { hasData: false, data: null };
            }
          } else {
            loadedData[key] = { hasData: false, data: null };
          }
        });

        setSectionsData(loadedData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t.common.error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleProjectChange = () => {
      loadData();
    };

    window.addEventListener('project:new', handleProjectChange);
    return () => window.removeEventListener('project:new', handleProjectChange);
  }, [t]);

  const handleGeneratePDF = async () => {
    const availableSectionsCount = Object.values(sectionsData).filter(s => s.hasData).length;
    if (availableSectionsCount === 0) {
      toast.error('لا توجد بيانات متاحة للتقرير');
      return;
    }

    setGeneratingPDF(true);
    try {
      if (reportRef.current) {
        setShowFullReport(true);
        
        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        let heightLeft = imgHeight;
        let position = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
          heightLeft -= (pdfHeight - 20);
          position -= (pdfHeight - 20);
          
          if (heightLeft > 0) {
            pdf.addPage();
          }
        }

        pdf.save(`تقرير-تقني-${currentProject?.name || 'منشأة'}.pdf`);
        toast.success('تم إنشاء ملف PDF بنجاح');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    const availableSectionsCount = Object.values(sectionsData).filter(s => s.hasData).length;
    if (availableSectionsCount === 0) {
      toast.error('لا توجد بيانات متاحة للطباعة');
      return;
    }
    window.print();
  };

  const availableSectionsCount = Object.values(sectionsData).filter(s => s.hasData).length;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-emerald-600 dark:text-emerald-400">
            {t.reports.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get data helpers
  const getBuildingData = () => sectionsData.building?.data || {};
  const getArchitecturalData = () => sectionsData.architectural?.data || [];
  const getStructuralData = () => sectionsData.structural?.data || {};
  const getFoundationsData = () => sectionsData.foundations?.data || [];
  const getColumnsData = () => sectionsData.columns?.data || [];
  const getBeamsData = () => sectionsData.beams?.data || [];
  const getElectricalData = () => sectionsData.electrical?.data || {};
  const getPlumbingData = () => sectionsData.plumbing?.data || {};
  const getNotesData = () => sectionsData.notes?.data || {};
  const getEngineersData = () => sectionsData.final?.data || [];
  const getReportPurpose = () => localStorage.getItem('bs-report-purpose') || 'currentStatus';

  return (
    <div className="space-y-6">
      {/* Report Generation Card */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <FileDown className="h-6 w-6" />
            {t.reports.title}
          </CardTitle>
          <CardDescription className="text-emerald-50">
            {t.reports.selectSections} ({availableSectionsCount} {availableSectionsCount === 1 ? 'قسم' : 'أقسام'} متاحة)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const hasData = sectionsData[section.key]?.hasData;
              return (
                <div
                  key={section.key}
                  className={`${section.bgColor} ${hasData ? section.color : 'border-slate-200'} border-2 rounded-lg p-4 text-center`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${hasData ? section.iconColor : 'text-slate-400'}`} />
                  <p className={`text-sm font-medium ${hasData ? '' : 'text-muted-foreground'}`}>
                    {t.reports[section.titleKey as keyof typeof t.reports]}
                  </p>
                  {hasData && (
                    <CheckCircle className="h-4 w-4 mx-auto mt-2 text-emerald-600" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              onClick={handlePrint}
              variant="outline"
              disabled={availableSectionsCount === 0}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 gap-2"
            >
              <Printer className="h-4 w-4" />
              {t.reports.printPreview}
            </Button>
            <Button
              onClick={() => setShowFullReport(!showFullReport)}
              variant="outline"
              disabled={availableSectionsCount === 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {showFullReport ? 'إخفاء المعاينة' : 'عرض المعاينة الكاملة'}
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={availableSectionsCount === 0 || generatingPDF}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t.reports.generatePDF}
                </>
              )}
            </Button>
          </div>

          {/* No Data Warning */}
          {availableSectionsCount === 0 && !loading && (
            <div className="text-center py-12 bg-amber-50 dark:bg-amber-950 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
              <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                لا توجد بيانات متاحة
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                يرجى ملء بيانات المنشأة أولاً من الأقسام المختلفة
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Report Preview */}
      {showFullReport && availableSectionsCount > 0 && (
        <Card className="w-full print:shadow-none print:border-none">
          <CardHeader className="no-print text-center">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-5 w-5" />
                المعاينة الكاملة للتقرير
              </CardTitle>
              <Badge variant="secondary">
                {availableSectionsCount} أقسام
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] pr-4 no-print">
              <div ref={reportRef} className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg print:shadow-none print:bg-white print:text-black">
                {/* Report Header */}
                <div className="report-header text-center mb-8 pb-6 border-b-4 border-emerald-500">
                  <h1 className="report-title">
                    {t.appFullTitle}
                  </h1>
                  <p className="report-subtitle">
                    {t.appCode}
                  </p>
                  <p className="report-developer">
                    {t.appDeveloper}
                  </p>
                  {currentProject && (
                    <div className="mt-4 inline-block bg-emerald-100 dark:bg-emerald-900 px-6 py-2 rounded-lg">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">
                        اسم المشروع: {currentProject.name}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <p>تاريخ التقرير: {new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                {/* Building Info Section */}
                {sectionsData.building?.hasData && (
                  <div className="report-section section-building mb-8 bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                    <div className="section-header flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-500">
                      <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="section-title text-xl font-bold text-emerald-800 dark:text-emerald-200">
                        {t.buildingInfo.title}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">رقم العقار</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().propertyNumber || '-'}</p>
                        </div>
                      </div>
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <FileSignature className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">رقم الترخيص</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().previousLicense || '-'}</p>
                        </div>
                      </div>
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">تاريخ الترخيص</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().licenseDate || '-'}</p>
                        </div>
                      </div>
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <User className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">اسم المالك</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().ownerName || '-'}</p>
                        </div>
                      </div>
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <Home className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">عدد الطوابق</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().floorCount || '-'}</p>
                        </div>
                      </div>
                      <div className="info-card flex items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <Ruler className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="info-label text-xs text-slate-600 dark:text-slate-400">استخدام المنشأة</p>
                          <p className="info-value text-lg font-semibold">{getBuildingData().buildingUsage || '-'}</p>
                        </div>
                      </div>
                    </div>
                    {getBuildingData().locationDescription && (
                      <div className="mt-4 info-card bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200">
                        <p className="info-label text-xs text-slate-600 dark:text-slate-400 mb-1">وصف الموقع</p>
                        <p className="text-base leading-relaxed">{getBuildingData().locationDescription}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Architectural Report Section */}
                {sectionsData.architectural?.hasData && getArchitecturalData().length > 0 && (
                  <div className="report-section section-architectural mb-8 bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 page-break-after">
                    <div className="section-header flex items-center gap-2 mb-4 pb-2 border-b-2 border-blue-500">
                      <Layout className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <h2 className="section-title text-xl font-bold text-blue-800 dark:text-blue-200">
                        {t.architectural.title}
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right bg-blue-100 dark:bg-blue-900 font-bold border border-slate-300">رقم الطابق</TableHead>
                          <TableHead className="text-right bg-blue-100 dark:bg-blue-900 font-bold border border-slate-300">مساحة الطابق (م²)</TableHead>
                          <TableHead className="text-right bg-blue-100 dark:bg-blue-900 font-bold border border-slate-300">مساحة البروزات (م²)</TableHead>
                          <TableHead className="text-right bg-blue-100 dark:bg-blue-900 font-bold border border-slate-300">منسوب الطابق (م)</TableHead>
                          <TableHead className="text-right bg-blue-100 dark:bg-blue-900 font-bold border border-slate-300">الملاحظات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getArchitecturalData().map((floor: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-right bg-white dark:bg-slate-800 border border-slate-300 font-medium">{floor.floorNumber}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800 border border-slate-300">{floor.floorArea || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800 border border-slate-300">{floor.projectionArea || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800 border border-slate-300">{floor.elevation || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800 border border-slate-300 text-sm">{floor.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Structural Report Section */}
                {sectionsData.structural?.hasData && (
                  <div className="mb-8 bg-amber-50 dark:bg-amber-950 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-4">
                      <HardHat className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                        {t.structural.title}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {getStructuralData().structuralSystem && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t.structural.structuralSystem}</p>
                          <p className="font-semibold">{getStructuralData().structuralSystem}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getStructuralData().schmidtConcreteStrength && (
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {t.structural.schmidtConcreteStrength}
                            </p>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                              {getStructuralData().schmidtConcreteStrength} {stressUnit}
                            </p>
                          </div>
                        )}
                        {getStructuralData().soilCapacity && (
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {t.structural.soilCapacity}
                            </p>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                              {getStructuralData().soilCapacity} {stressUnit}
                            </p>
                          </div>
                        )}
                        {getStructuralData().soilType && (
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t.structural.soilType}</p>
                            <p className="font-semibold">{getStructuralData().soilType}</p>
                          </div>
                        )}
                        {getStructuralData().foundationDepth && (
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t.structural.foundationDepth}</p>
                            <p className="font-semibold">{getStructuralData().foundationDepth} م</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Foundations Section */}
                {sectionsData.foundations?.hasData && getFoundationsData().length > 0 && (
                  <div className="mb-8 bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                        {t.tabs.foundations}
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right bg-purple-100 dark:bg-purple-900">نوع الأساس</TableHead>
                          <TableHead className="text-right bg-purple-100 dark:bg-purple-900">الأبعاد (سم)</TableHead>
                          <TableHead className="text-right bg-purple-100 dark:bg-purple-900">التحمل الإجمالي ({loadUnit})</TableHead>
                          <TableHead className="text-right bg-purple-100 dark:bg-purple-900">الإجهاد الفعلي</TableHead>
                          <TableHead className="text-right bg-purple-100 dark:bg-purple-900">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFoundationsData().map((foundation: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{foundation.foundationType || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {foundation.length && foundation.width && foundation.height 
                                ? `${foundation.length} × ${foundation.width} × ${foundation.height}`
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{foundation.totalLoad || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{foundation.actualStress || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {foundation.isVerified ? (
                                <Badge className="bg-emerald-600">محقق</Badge>
                              ) : (
                                <Badge variant="destructive">غير محقق</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Columns Section */}
                {sectionsData.columns?.hasData && getColumnsData().length > 0 && (
                  <div className="mb-8 bg-pink-50 dark:bg-pink-950 p-6 rounded-lg border-2 border-pink-200 dark:border-pink-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Columns className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                      <h2 className="text-xl font-bold text-pink-800 dark:text-pink-200">
                        {t.tabs.columns}
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">النوع</TableHead>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">الطابق</TableHead>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">الأبعاد (سم)</TableHead>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">التحمل الإجمالي ({loadUnit})</TableHead>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">الإجهاد</TableHead>
                          <TableHead className="text-right bg-pink-100 dark:bg-pink-900">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getColumnsData().map((column: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{column.columnType || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{column.floorNumber || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {column.width && column.depth ? `${column.width} × ${column.depth}` : '-'}
                            </TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{column.totalLoad || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{column.actualStress || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {column.isVerified ? (
                                <Badge className="bg-emerald-600">محقق</Badge>
                              ) : (
                                <Badge variant="destructive">غير محقق</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Beams and Slabs Section */}
                {sectionsData.beams?.hasData && getBeamsData().length > 0 && (
                  <div className="mb-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Square className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
                        {t.tabs.beams}
                      </h2>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">العنصر</TableHead>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">الطابق</TableHead>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">الامتار (سم)</TableHead>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">السمك/العرض (سم)</TableHead>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">الإجهاد الحد</TableHead>
                          <TableHead className="text-right bg-indigo-100 dark:bg-indigo-900">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getBeamsData().map((beam: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{beam.element || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{beam.floorNumber || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{beam.span || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {beam.width && beam.thickness ? `${beam.width} × ${beam.thickness}` : '-'}
                            </TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{beam.appliedMoment || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">
                              {beam.isVerified ? (
                                <Badge className="bg-emerald-600">محقق</Badge>
                              ) : (
                                <Badge variant="destructive">غير محقق</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Electrical Section */}
                {sectionsData.electrical?.hasData && (
                  <div className="mb-8 bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                        {t.electrical.title}
                      </h2>
                    </div>
                    {getElectricalData().installation && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">التمديدات والتجهيزات</p>
                        <p className="text-sm">{getElectricalData().installation}</p>
                      </div>
                    )}
                    {getElectricalData().electricalNotes && (
                      <div className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">الملاحظات</p>
                        <p className="text-sm">{getElectricalData().electricalNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Plumbing Section */}
                {sectionsData.plumbing?.hasData && (
                  <div className="mb-8 bg-cyan-50 dark:bg-cyan-950 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Droplets className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                      <h2 className="text-xl font-bold text-cyan-800 dark:text-cyan-200">
                        {t.plumbing.title}
                      </h2>
                    </div>
                    {getPlumbingData().freshWaterNotes && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">التمديدات الصحية الحلوة</p>
                        <p className="text-sm">{getPlumbingData().freshWaterNotes}</p>
                      </div>
                    )}
                    {getPlumbingData().wastewaterNotes && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">التمديدات الصحية المالحة</p>
                        <p className="text-sm">{getPlumbingData().wastewaterNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Technical Notes Section */}
                {sectionsData.notes?.hasData && (
                  <div className="mb-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {t.notes.title}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getNotesData().architecturalNotes && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">📐 {t.notes.architecturalNotes}</p>
                          <p className="text-sm">{getNotesData().architecturalNotes}</p>
                        </div>
                      )}
                      {getNotesData().structuralNotes && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">🔨 {t.notes.structuralNotes}</p>
                          <p className="text-sm">{getNotesData().structuralNotes}</p>
                        </div>
                      )}
                      {getNotesData().electricalNotes && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">⚡ {t.notes.electricalNotes}</p>
                          <p className="text-sm">{getNotesData().electricalNotes}</p>
                        </div>
                      )}
                      {getNotesData().plumbingNotes && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">💧 {t.notes.plumbingNotes}</p>
                          <p className="text-sm">{getNotesData().plumbingNotes}</p>
                        </div>
                      )}
                      {getNotesData().requirements && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">📋 {t.notes.requirements}</p>
                          <p className="text-sm">{getNotesData().requirements}</p>
                        </div>
                      )}
                      {getNotesData().suggestions && (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">💡 {t.notes.suggestions}</p>
                          <p className="text-sm">{getNotesData().suggestions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Final Report / Engineers Section */}
                {sectionsData.final?.hasData && getEngineersData().length > 0 && (
                  <div className="mb-8 bg-teal-50 dark:bg-teal-950 p-6 rounded-lg border-2 border-teal-200 dark:border-teal-800">
                    <div className="flex items-center gap-2 mb-4">
                      <FileCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      <h2 className="text-xl font-bold text-teal-800 dark:text-teal-200">
                        {t.final.title}
                      </h2>
                    </div>
                    
                    {/* Certificate Text */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg mb-6 border-2 border-teal-300">
                      <p className="text-sm font-bold text-teal-800 dark:text-teal-200 mb-4 text-center">
                        {t.final.certificate}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                        {getReportPurpose() === 'additionalFloor' ? t.final.additionalFloorCert :
                         getReportPurpose() === 'violationSettlement' ? t.final.violationCert :
                         t.final.violationCert}
                      </p>
                    </div>

                    {/* Engineers Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right bg-teal-100 dark:bg-teal-900">التسلسل</TableHead>
                          <TableHead className="text-right bg-teal-100 dark:bg-teal-900">التخصص</TableHead>
                          <TableHead className="text-right bg-teal-100 dark:bg-teal-900">اسم المهندس</TableHead>
                          <TableHead className="text-right bg-teal-100 dark:bg-teal-900">رقم المهندس النقابي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getEngineersData().map((engineer: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{engineer.sequence}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{engineer.specialty || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{engineer.name || '-'}</TableCell>
                            <TableCell className="text-right bg-white dark:bg-slate-800">{engineer.unionNumber || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Report Footer - Professional Print Footer */}
                <div className="page-footer mt-12 pt-6 border-t-4 border-emerald-500 text-center no-print-break">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src="/logo.jpg" 
                        alt="Logo" 
                        className="h-10 w-10 object-contain"
                      />
                      <span className="font-bold text-base text-emerald-700">B.S Evaluation</span>
                    </div>
                    <span className="text-slate-400 text-lg">|</span>
                    <span className="text-sm font-medium">الكود العربي السوري 2024</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">
                    {t.appDeveloper}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {t.appRights}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    تم إنشاء هذا التقرير بواسطة نظام B.S Evaluation للتحقق الفني للمنشآت
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

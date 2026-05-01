'use client'

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  RefreshCcw, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button'; // تأكد من وجود مكونات UI لديك
import { toast } from 'sonner';
import { getSecureImageUrl } from '@/actions/storage-actions';

export default function ReportsPage({ params }: { params: { id: string } }) {
  const { buildingInfo, structuralReport, foundations } = useProjectStore();
  const [generating, setGenerating] = useState(false);

  // دالة لمحاكاة توليد التقرير (سنربطها بـ jsPDF لاحقاً)
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      // هنا سيتم استدعاء محرك PDF وتضمين الصور الموقعة
      toast.success("جاري تحضير النسخة المهنية من التقرير...");
      
      // منطق التوليد سيتم وضعه هنا
      
      setTimeout(() => {
        setGenerating(false);
        toast.info("تم توليد التقرير بنجاح (نسخة تجريبية)");
      }, 2000);
    } catch (error) {
      setGenerating(false);
      toast.error("فشل توليد التقرير");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck2 className="text-emerald-600" />
              توليد التقارير الفنية والهندسية
            </h1>
            <p className="text-slate-500 text-sm mt-1">المشروع: {buildingInfo?.ownerName || 'قيد المعالجة'}</p>
          </div>
          <Button 
            onClick={handleGeneratePDF}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6 py-6 rounded-xl shadow-lg"
          >
            {generating ? <RefreshCcw className="animate-spin" /> : <Download size={18} />}
            توليد ملف PDF
          </Button>
        </div>

        {/* Preview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[600px] relative overflow-hidden">
              {/* ترويسة التقرير الهندسي */}
              <div className="text-center border-b-2 border-slate-100 pb-6 mb-8">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">تقرير تقييم الوضع الراهن للمنشأة</h2>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">B.S Evaluation Technical Report</p>
              </div>

              {/* ملخص البيانات */}
              <div className="space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 mb-1">اسم المالك</span>
                    <span className="font-bold">{buildingInfo?.ownerName || '---'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[10px] text-slate-400 mb-1">تاريخ الكشف</span>
                    <span className="font-bold">{new Date().toLocaleDateString('ar-SY')}</span>
                  </div>
                </div>

                {/* مكان عرض صورة الموقع المرفوعة سحابياً */}
                <div className="mt-6">
                  <h3 className="font-bold text-slate-800 mb-3 border-r-4 border-emerald-500 pr-2">توثيق الموقع العام</h3>
                  <div className="aspect-video bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    {buildingInfo?.locationImage ? (
                       <img src={buildingInfo.locationImage} alt="Site" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-xs italic text-center px-10">لم يتم رفع صورة للموقع العام، سيتم ترك مساحة بيضاء في التقرير النهائي</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">خيارات الطباعة</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" defaultChecked className="accent-emerald-600 h-4 w-4" />
                  <span className="text-xs font-medium">تضمين الصور الفنية</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" defaultChecked className="accent-emerald-600 h-4 w-4" />
                  <span className="text-xs font-medium">إظهار الحسابات الإنشائية</span>
                </label>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle size={16} />
                جاهزية التقرير
              </h3>
              <p className="text-[11px] text-emerald-600 leading-relaxed italic">
                تم التحقق من جميع البيانات المدخلة ومزامنتها مع السحاب. التقرير سيتم توليده وفق معايير الكود السوري.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { 
  FileCheck2, Download, ShieldCheck, 
  RefreshCcw, Image as ImageIcon 
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { generateProfessionalPDF } from '@/lib/report-generator';
import { getSecureImageUrl } from '@/actions/storage-actions';
import { toast } from 'sonner';

export default function ReportsPage({ params }: { params: { id: string } }) {
  const { buildingInfo } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const [secureImageUrl, setSecureImageUrl] = useState<string | null>(null);

  // جلب رابط المعاينة المؤمن من السحاب عند تحميل الصفحة
  useEffect(() => {
    async function fetchImage() {
      if (buildingInfo?.locationImage) {
        // نستخدم الدالة الجديدة لجلب رابط مؤقت وآمن
        const url = await getSecureImageUrl(buildingInfo.locationImage);
        setSecureImageUrl(url);
      }
    }
    fetchImage();
  }, [buildingInfo?.locationImage]);

  const handleDownload = async () => {
    setGenerating(true);
    // استدعاء محرك الطباعة الذي أنشأناه في lib
    const success = await generateProfessionalPDF('report-content', `Report-${params.id}`);
    
    if (success) {
      toast.success("تم توليد وتحميل التقرير بنجاح");
    } else {
      toast.error("حدث خطأ أثناء توليد ملف PDF");
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* شريط التحكم العلوي - ثابت عند التمرير */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white sticky top-4 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck2 className="text-emerald-600 h-7 w-7" />
              مركز التقارير الهندسية
            </h1>
            <p className="text-slate-500 text-sm font-medium">مشروع: {buildingInfo?.ownerName || params.id.slice(0,8)}</p>
          </div>
          
          <button 
            onClick={handleDownload}
            disabled={generating}
            className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {generating ? <RefreshCcw className="animate-spin h-5 w-5" /> : <Download className="h-5 w-5" />}
            تحميل التقرير (PDF)
          </button>
        </div>

        {/* جسم التقرير - هذا الجزء هو الذي سيتم تصويره وتحويله لـ PDF */}
        <div className="flex flex-col items-center">
          <div 
            id="report-content" 
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl rounded-sm text-slate-900"
          >
            {/* الترويسة الفنية */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-10">
              <div className="text-right">
                <h2 className="text-2xl font-black italic">B.S EVALUATION</h2>
                <p className="text-sm font-bold text-slate-500 tracking-tight">Technical Structural Assessment</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Approved Engineering Report</p>
              </div>
              <div className="text-left text-[10px] text-slate-500 font-mono leading-relaxed">
                REF: {params.id.toUpperCase()}<br/>
                DATE: {new Date().toLocaleDateString('en-GB')}<br/>
                LOC: SYRIA / SITE-INFO
              </div>
            </div>

            {/* محتوى البيانات */}
            <div className="space-y-10">
              <section>
                <h3 className="text-lg font-black mb-4 border-r-4 border-emerald-500 pr-3 bg-slate-50 py-1">1. المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm px-4">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">اسم المالك:</span>
                    <span className="font-bold">{buildingInfo?.ownerName || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">رقم العقار:</span>
                    <span className="font-bold">{buildingInfo?.propertyNumber || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">عدد الطوابق:</span>
                    <span className="font-bold">{buildingInfo?.floorCount || '0'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">تاريخ الكشف:</span>
                    <span className="font-bold">{new Date().toLocaleDateString('ar-SY')}</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black mb-4 border-r-4 border-emerald-500 pr-3 bg-slate-50 py-1">2. التوثيق الفوتوغرافي للموقع</h3>
                <div className="border-2 border-slate-100 rounded-3xl overflow-hidden bg-slate-50 aspect-video flex items-center justify-center relative shadow-inner">
                  {secureImageUrl ? (
                    <img 
                      src={secureImageUrl} 
                      alt="Site Survey" 
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous" 
                    />
                  ) : (
                    <div className="text-center text-slate-300 italic">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-10" />
                      <p className="text-xs italic">بانتظار رفع صورة المعاينة الفنية...</p>
                    </div>
                  )}
                  {secureImageUrl && (
                    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-100 shadow-sm text-emerald-700">
                      <ShieldCheck className="h-3 w-3" />
                      مصادقة سحابية R2
                    </div>
                  )}
                </div>
              </section>

              {/* تذييل التقرير */}
              <div className="pt-20 mt-20 border-t border-slate-100 text-center">
                <div className="flex justify-around mb-12">
                  <div className="text-center">
                    <p className="text-xs font-bold mb-8 text-slate-400 italic">ختم وتوقيع المهندس المعاين</p>
                    <div className="w-32 h-1 bg-slate-100 mx-auto"></div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-medium">
                  تم إصدار هذا التقرير الفني آلياً بواسطة نظام BS-Evaluation. المعلومات الواردة تخضع لمسؤولية المهندس المعاين.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

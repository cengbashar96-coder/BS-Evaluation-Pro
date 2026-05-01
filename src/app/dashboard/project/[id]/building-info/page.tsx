'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Building2, Info, Calendar, MapPin } from 'lucide-react';
import { useTranslation } from ''@/store/lib/i18n/translations';
import { useProjectStore, type BuildingInfo } from '@/store/projectStore';
import { toast } from 'sonner';

export default function BuildingInfoPage() {
  const { t } = useTranslation();
  const params = useParams();
  const projectId = params.id as string; // المعرف الفريد للمشروع (للحماية والعزل)
  
  const { updateBuildingInfo } = useProjectStore();
  const [formData, setFormData] = useState<BuildingInfo>({});
  const [locationImage, setLocationImage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // تحميل البيانات بناءً على معرف المشروع حصراً
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-building-info-${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
        if (parsed.locationImage) setLocationImage(parsed.locationImage);
      }
    }
  }, [projectId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocationImage(base64String);
        setFormData(prev => ({ ...prev, locationImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!projectId) {
      toast.error("خطأ في معرف المشروع - الوصول غير مصرح");
      return;
    }

    setLoading(true);
    try {
      // حفظ البيانات معزولة بمعرف المشروع
      localStorage.setItem(`bs-building-info-${projectId}`, JSON.stringify(formData));
      updateBuildingInfo(formData);
      toast.success("تم تحديث بيانات المنشأة وتأمينها في سجلات المشروع");
    } catch (error) {
      toast.error("فشل الحفظ - تأكد من صلاحيات الوصول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-emerald-400" />
            <div>
              <CardTitle className="text-2xl font-bold">بيانات المنشأة الأساسية</CardTitle>
              <CardDescription className="text-slate-300">هذه البيانات ستظهر في ترويسة التقارير الرسمية</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-8">
          {/* قسم معلومات المالك والعقار */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold text-slate-700">
                <Info className="h-4 w-4" /> اسم المالك / الجهة المالكة
              </Label>
              <Input 
                value={formData.ownerName || ''} 
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                placeholder="الاسم الثلاثي أو اسم الشركة"
                className="border-slate-200 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold text-slate-700">
                <MapPin className="h-4 w-4" /> رقم العقار والمنطقة
              </Label>
              <Input 
                value={formData.propertyNumber || ''} 
                onChange={(e) => setFormData({...formData, propertyNumber: e.target.value})}
                placeholder="مثال: عقار 123 - تنظيم كفرسوسة"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">رقم الرخصة (إن وجد)</Label>
              <Input 
                value={formData.previousLicense || ''} 
                onChange={(e) => setFormData({...formData, previousLicense: e.target.value})}
              />
            </div>
            <div className="space-y-2 text-right">
              <Label className="flex items-center justify-end gap-2 font-bold text-slate-700">
                تاريخ الرخصة <Calendar className="h-4 w-4" />
              </Label>
              <Input 
                type="date"
                value={formData.licenseDate || ''} 
                onChange={(e) => setFormData({...formData, licenseDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-emerald-700">عدد الطوابق (تراكمي)</Label>
              <Input 
                type="number"
                className="border-emerald-200 bg-emerald-50 font-bold"
                value={formData.floorCount || ''} 
                onChange={(e) => setFormData({...formData, floorCount: parseInt(e.target.value)})}
                placeholder="يؤثر على حسابات الأعمدة"
              />
            </div>
          </div>

          {/* قسم الموقع الجغرافي والصورة */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-lg font-bold text-slate-800">وصف الموقع وصورة المخطط</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                <Textarea 
                  placeholder="وصف دقيق للموقع الجغرافي أو أي ملاحظات عامة..."
                  className="min-h-[150px] resize-none"
                  value={formData.locationDescription || ''}
                  onChange={(e) => setFormData({...formData, locationDescription: e.target.value})}
                />
              </div>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <input type="file" id="locImg" hidden accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="locImg" className="cursor-pointer text-center">
                  {locationImage ? (
                    <img src={locationImage} className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm" />
                  ) : (
                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  )}
                  <span className="text-xs font-bold text-slate-600 block">رفع صورة الموقع</span>
                </label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg rounded-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? "جاري التأمين..." : "تحديث وحفظ بيانات الهوية للمنشأة"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

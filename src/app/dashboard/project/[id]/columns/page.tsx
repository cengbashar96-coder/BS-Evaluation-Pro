'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Plus, Trash2, CheckCircle2, XCircle, Square } from 'lucide-react';
import { toast } from 'sonner';

export default function ColumnsPage({ params }: { params: { id: string } }) {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [schmidtStrength] = useState(250); // القيمة الافتراضية لقوة الخرسانة

  // نموذج الإدخال
  const [formData, setFormData] = useState({
    columnType: '',
    floorNumber: '',
    width: 0,
    depth: 0,
    totalLoad: 0,
  });

  // 1. حساب القيم الهندسية (نفس منطق كودك القديم)
  const calculateValues = (col: any) => {
    const area = col.width * col.depth;
    if (area === 0) return col;
    const actualStress = (col.totalLoad * 1000) / area;
    const allowableStress = 0.3 * schmidtStrength;
    return {
      ...col,
      actualStress: parseFloat(actualStress.toFixed(2)),
      allowableStress: parseFloat(allowableStress.toFixed(2)),
      isVerified: actualStress <= allowableStress
    };
  };

  // 2. جلب البيانات من السحاب عند فتح الصفحة
  useEffect(() => {
    const fetchColumns = async () => {
      const res = await fetch(`/api/projects/${params.id}/columns`);
      if (res.ok) {
        const data = await res.json();
        setColumns(data);
      }
    };
    fetchColumns();
  }, [params.id]);

  // 3. حفظ عمود جديد في السحاب
  const handleAdd = async () => {
    if (!formData.columnType || !formData.floorNumber) {
      toast.error("يرجى ملء البيانات الأساسية");
      return;
    }

    const calculated = calculateValues(formData);
    setLoading(true);

    const res = await fetch(`/api/projects/${params.id}/columns`, {
      method: 'POST',
      body: JSON.stringify(calculated),
    });

    if (res.ok) {
      const savedCol = await res.json();
      setColumns([...columns, savedCol]);
      toast.success("تم الحفظ في السحاب بنجاح");
      setFormData({ columnType: '', floorNumber: '', width: 0, depth: 0, totalLoad: 0 });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 text-right" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-600 flex items-center gap-2">
            <Plus className="h-5 w-5" /> إضافة معاينة أعمدة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>نوع العمود</Label>
            <Select onValueChange={(v) => setFormData({...formData, columnType: v})}>
              <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="وسطي">وسطي</SelectItem>
                <SelectItem value="طرفي">طرفي</SelectItem>
                <SelectItem value="ركني">ركني</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>رقم الطابق</Label>
            <Input placeholder="مثلاً: الأرضي" onChange={(e) => setFormData({...formData, floorNumber: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>الحمل الكلي (طن)</Label>
            <Input type="number" onChange={(e) => setFormData({...formData, totalLoad: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>العرض (cm)</Label>
            <Input type="number" onChange={(e) => setFormData({...formData, width: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>العمق (cm)</Label>
            <Input type="number" onChange={(e) => setFormData({...formData, depth: Number(e.target.value)})} />
          </div>
          <Button onClick={handleAdd} disabled={loading} className="mt-8 bg-emerald-600">
            {loading ? "جاري الحفظ..." : "إضافة وحفظ سحابي"}
          </Button>
        </CardContent>
      </Card>

      {/* عرض النتائج */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.map((col, i) => (
          <Card key={i} className={col.isVerified ? "border-emerald-500" : "border-red-500"}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{col.columnType} - طابق {col.floorNumber}</p>
                <p className="text-sm text-gray-500">الإجهاد: {col.actualStress} / المسموح: {col.allowableStress}</p>
              </div>
              {col.isVerified ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

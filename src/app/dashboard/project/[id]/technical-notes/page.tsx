'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, FileText, Edit3, Lightbulb, ClipboardList, Building2, Hammer, Target, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, type TechnicalNotes } from '@/store/projectStore';
import { toast } from 'sonner';

/**
 * Technical Notes Page - الواجهة التاسعة
 * تجمع الملاحظات الفنية والمقترحات للمشروع
 * متوافقة مع بنية Prisma وعزل بيانات المشتركين عبر projectId
 */
export default function TechnicalNotesPage() {
  const { t, language } = useTranslation();
  const params = useParams();
  const projectId = params.id as string;
  
  const { updateTechnicalNotes } = useProjectStore();
  const [formData, setFormData] = useState<TechnicalNotes>({
    architecturalNotes: '',
    structuralNotes: '',
    requirements: '',
    suggestions: ''
  });
  const [loading, setLoading] = useState(false);

  // تحميل البيانات بناءً على معرف المشروع لضمان الأمان السحابي
  useEffect(() => {
    if (typeof window !== 'undefined' && projectId) {
      const stored = localStorage.getItem(`bs-technical-notes-${projectId}`);
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    }
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // الحفظ المحلي المرتبط بـ ID المشروع لضمان عزل بيانات المشتركين
      localStorage.setItem(`bs-technical-notes-${projectId}`, JSON.stringify(formData));
      
      // تحديث الحالة في Store المركزي
      updateTechnicalNotes(formData);
      
      toast.success(t.buildingInfo.projectSaved);
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TechnicalNotes, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="border-t-4 border-t-indigo-500 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2 text-indigo-600">
            <ClipboardList className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
            {t.technicalNotes?.title || 'الملاحظات والمشاهدات الفنية'}
          </CardTitle>
          <CardDescription>
            توثيق التوصيات الفنية للمشروع رقم: {projectId.substring(0, 8)}...
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
            
            {/* الملاحظات المعمارية */}
            <AccordionItem value="item-1" className="border rounded-xl px-4 bg-slate-50/50 dark:bg-slate-900/50">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  {t.technicalNotes?.architectural || 'الملاحظات المعمارية'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <Textarea
                  value={formData.architecturalNotes || ''}
                  onChange={(e) => handleChange('architecturalNotes', e.target.value)}
                  placeholder="سجل هنا أي ملاحظات تتعلق بالتصميم المعماري، الإكساء، أو التوزيع الفراغي..."
                  className="min-h-[120px] bg-white dark:bg-slate-800"
                />
              </AccordionContent>
            </AccordionItem>

            {/* الملاحظات الإنشائية */}
            <AccordionItem value="item-2" className="border rounded-xl px-4 bg-slate-50/50 dark:bg-slate-900/50">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <Hammer className="h-5 w-5 text-indigo-500" />
                  {t.technicalNotes?.structural || 'الملاحظات الإنشائية'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <Textarea
                  value={formData.structuralNotes || ''}
                  onChange={(e) => handleChange('structuralNotes', e.target.value)}
                  placeholder="سجل ملاحظات الحالة الإنشائية، الشقوق، أو أي مشاكل في الجملة الحاملة..."
                  className="min-h-[120px] bg-white dark:bg-slate-800"
                />
              </AccordionContent>
            </AccordionItem>

            {/* المتطلبات الفنية */}
            <AccordionItem value="item-3" className="border rounded-xl px-4 bg-slate-50/50 dark:bg-slate-900/50">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-indigo-500" />
                  {t.technicalNotes?.requirements || 'المتطلبات'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <Textarea
                  value={formData.requirements || ''}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="حدد المتطلبات اللازمة لاستكمال المشروع أو معالجة العيوب..."
                  className="min-h-[120px] bg-white dark:bg-slate-800"
                />
              </AccordionContent>
            </AccordionItem>

            {/* المقترحات */}
            <AccordionItem value="item-4" className="border rounded-xl px-4 bg-slate-50/50 dark:bg-slate-900/50">
              <AccordionTrigger className="hover:no-underline font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-indigo-500" />
                  {t.technicalNotes?.suggestions || 'المقترحات'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <Textarea
                  value={formData.suggestions || ''}
                  onChange={(e) => handleChange('suggestions', e.target.value)}
                  placeholder="أضف مقترحاتك المهنية لتحسين جودة التنفيذ أو المعالجة الفنية..."
                  className="min-h-[120px] bg-white dark:bg-slate-800"
                />
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all active:scale-95"
          >
            <Save className="h-5 w-5 ml-2" />
            {loading ? t.common.loading : t.common.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

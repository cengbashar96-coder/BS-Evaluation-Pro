'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, FileText, CheckCircle2, Info, Edit3, Lightbulb, ClipboardList, FileCheck, Building2, Hammer, Zap, Droplets, Target, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';
import { useProjectStore, type TechnicalNotes } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

export default function TechnicalNotes() {
  const { t, language } = useTranslation();
  const { updateTechnicalNotes } = useProjectStore();
  const { language: settingsLanguage } = useSettingsStore();
  
  const [formData, setFormData] = useState<TechnicalNotes>({});
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('architectural');

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs-technical-notes');
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    }
  }, []);

  // Handle new project event
  useEffect(() => {
    const handleNewProject = () => {
      setFormData({});
      setSummary('');
    };
    
    window.addEventListener('project:new', handleNewProject);
    return () => window.removeEventListener('project:new', handleNewProject);
  }, []);

  // Auto-generate summary when notes change
  useEffect(() => {
    generateSummary();
  }, [formData]);

  const handleChange = (field: keyof TechnicalNotes, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Auto-save to localStorage
    localStorage.setItem('bs-technical-notes', JSON.stringify({ ...formData, [field]: value }));
  };

  const generateSummary = () => {
    const totalFields = 6;
    const filledFields = Object.values(formData).filter(v => v && v.trim().length > 0).length;
    
    let summaryText = '';
    
    if (language === 'ar') {
      summaryText = `ملخص الملاحظات الفنية:\n\n`;
      summaryText += `✓ إجمالي الأقسام: ${totalFields}\n`;
      summaryText += `✓ الأقسام المكتملة: ${filledFields}\n`;
      summaryText += `✓ نسبة الإكمال: ${Math.round((filledFields / totalFields) * 100)}%\n\n`;
      
      if (formData.architecturalNotes) summaryText += `📐 الملاحظات المعمارية: مكتملة\n`;
      if (formData.structuralNotes) summaryText += `🔨 الملاحظات الإنشائية: مكتملة\n`;
      if (formData.electricalNotes) summaryText += `⚡ الملاحظات الكهربائية: مكتملة\n`;
      if (formData.plumbingNotes) summaryText += `💧 الملاحظات الصحية: مكتملة\n`;
      if (formData.requirements) summaryText += `📋 المتطلبات: مكتملة\n`;
      if (formData.suggestions) summaryText += `💡 المقترحات: مكتملة\n`;
    } else {
      summaryText = `Technical Notes Summary:\n\n`;
      summaryText += `✓ Total Sections: ${totalFields}\n`;
      summaryText += `✓ Completed Sections: ${filledFields}\n`;
      summaryText += `✓ Completion Rate: ${Math.round((filledFields / totalFields) * 100)}%\n\n`;
      
      if (formData.architecturalNotes) summaryText += `📐 Architectural Notes: Completed\n`;
      if (formData.structuralNotes) summaryText += `🔨 Structural Notes: Completed\n`;
      if (formData.electricalNotes) summaryText += `⚡ Electrical Notes: Completed\n`;
      if (formData.plumbingNotes) summaryText += `💧 Plumbing Notes: Completed\n`;
      if (formData.requirements) summaryText += `📋 Requirements: Completed\n`;
      if (formData.suggestions) summaryText += `💡 Suggestions: Completed\n`;
    }
    
    setSummary(summaryText);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('bs-technical-notes', JSON.stringify(formData));
      updateTechnicalNotes(formData);
      toast.success(language === 'ar' ? 'تم حفظ الملاحظات الفنية بنجاح' : 'Technical notes saved successfully');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const getSectionStatus = (value: string | undefined) => {
    if (!value || value.trim().length === 0) {
      return <Badge variant="outline" className="gap-1"><Info className="h-3 w-3" /> {language === 'ar' ? 'فارغ' : 'Empty'}</Badge>;
    }
    return <Badge className="gap-1 bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3" /> {language === 'ar' ? 'مكتمل' : 'Completed'}</Badge>;
  };

  const getWordCount = (value: string | undefined) => {
    if (!value) return 0;
    return value.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const sections = [
    {
      id: 'architectural',
      key: 'architecturalNotes' as keyof TechnicalNotes,
      title: language === 'ar' ? 'الملاحظات المعمارية' : 'Architectural Notes',
      description: language === 'ar' ? 'ملاحظات ومشاهدات معمارية' : 'Architectural observations and notes',
      icon: <Building2 className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-600',
      placeholder: language === 'ar' 
        ? 'أدخل الملاحظات المعمارية هنا... (حالة الواجهات، المواد المستخدمة، التشطيبات، إلخ)'
        : 'Enter architectural notes here... (facade condition, materials, finishes, etc.)'
    },
    {
      id: 'structural',
      key: 'structuralNotes' as keyof TechnicalNotes,
      title: language === 'ar' ? 'الملاحظات الإنشائية' : 'Structural Notes',
      description: language === 'ar' ? 'ملاحظات ومشاهدات إنشائية' : 'Structural observations and notes',
      icon: <Hammer className="h-5 w-5" />,
      color: 'from-orange-500 to-red-600',
      placeholder: language === 'ar'
        ? 'أدخل الملاحظات الإنشائية هنا... (الشروخ، التشوهات، حالة التسليح، إلخ)'
        : 'Enter structural notes here... (cracks, deformations, reinforcement condition, etc.)'
    },
    {
      id: 'electrical',
      key: 'electricalNotes' as keyof TechnicalNotes,
      title: language === 'ar' ? 'الملاحظات الكهربائية' : 'Electrical Notes',
      description: language === 'ar' ? 'ملاحظات ومشاهدات كهربائية' : 'Electrical observations and notes',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-yellow-500 to-amber-600',
      placeholder: language === 'ar'
        ? 'أدخل الملاحظات الكهربائية هنا... (اللوحات، الأسلاك، التركيبات، إلخ)'
        : 'Enter electrical notes here... (panels, wiring, fixtures, etc.)'
    },
    {
      id: 'plumbing',
      key: 'plumbingNotes' as keyof TechnicalNotes,
      title: language === 'ar' ? 'الملاحظات الصحية' : 'Plumbing Notes',
      description: language === 'ar' ? 'ملاحظات ومشاهدات صحية' : 'Plumbing observations and notes',
      icon: <Droplets className="h-5 w-5" />,
      color: 'from-cyan-500 to-blue-600',
      placeholder: language === 'ar'
        ? 'أدخل الملاحظات الصحية هنا... (أنابيب، صرف، تركيبات، تسربات، إلخ)'
        : 'Enter plumbing notes here... (pipes, drainage, fixtures, leaks, etc.)'
    },
    {
      id: 'requirements',
      key: 'requirements' as keyof TechnicalNotes,
      title: language === 'ar' ? 'المتطلبات' : 'Requirements',
      description: language === 'ar' ? 'المتطلبات والإلزامات' : 'Requirements and obligations',
      icon: <Target className="h-5 w-5" />,
      color: 'from-purple-500 to-violet-600',
      placeholder: language === 'ar'
        ? 'أدخل المتطلبات هنا... (الأعمال المطلوبة، التدخلات الضرورية، إلخ)'
        : 'Enter requirements here... (required works, necessary interventions, etc.)'
    },
    {
      id: 'suggestions',
      key: 'suggestions' as keyof TechnicalNotes,
      title: language === 'ar' ? 'المقترحات' : 'Suggestions',
      description: language === 'ar' ? 'المقترحات والتوصيات' : 'Suggestions and recommendations',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-600',
      placeholder: language === 'ar'
        ? 'أدخل المقترحات هنا... (تحسينات، توصيات، بدائل، إلخ)'
        : 'Enter suggestions here... (improvements, recommendations, alternatives, etc.)'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="w-full border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-t-xl text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <FileText className="h-8 w-8" />
            {t.notes.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className={`text-muted-foreground ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' 
              ? 'سجل الملاحظات والمشاهدات الفنية التفصيلية حول جوانب المنشأة المختلفة'
              : 'Record detailed technical notes and observations about various aspects of the building'}
          </p>
        </CardContent>
      </Card>

      {/* Main Notes Sections */}
      <Accordion type="single" collapsible className="w-full space-y-4" value={activeSection} onValueChange={setActiveSection}>
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <AccordionTrigger className="hover:no-underline px-6 py-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${section.color} text-white`}>
                  {section.icon}
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSectionStatus(formData[section.key])}
                      <Badge variant="secondary" className="gap-1">
                        <Edit3 className="h-3 w-3" />
                        {getWordCount(formData[section.key] as string)} {language === 'ar' ? 'كلمة' : 'words'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <Textarea
                    value={formData[section.key] || ''}
                    onChange={(e) => handleChange(section.key, e.target.value)}
                    placeholder={section.placeholder}
                    rows={8}
                    className={language === 'ar' ? 'text-right resize-none' : 'text-left resize-none'}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                    <span>{language === 'ar' ? 'يحفظ تلقائياً' : 'Auto-saved'}</span>
                    <span>{language === 'ar' ? 'الأحرف' : 'Characters'}: {(formData[section.key] || '').length}</span>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Separator className="my-8" />

      {/* Summary Card */}
      <Card className="w-full border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 text-white rounded-t-xl text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <FileCheck className="h-6 w-6" />
            {language === 'ar' ? 'الملخص التفاعلي' : 'Interactive Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getWordCount(formData.architecturalNotes)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'معماري' : 'Architectural'}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800">
              <Hammer className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {getWordCount(formData.structuralNotes)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'إنشائي' : 'Structural'}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 text-center border border-yellow-200 dark:border-yellow-800">
              <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {getWordCount(formData.electricalNotes)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'كهربائي' : 'Electrical'}</p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-4 text-center border border-cyan-200 dark:border-cyan-800">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-cyan-600 dark:text-cyan-400" />
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {getWordCount(formData.plumbingNotes)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'صحي' : 'Plumbing'}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {getWordCount(formData.requirements)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'متطلبات' : 'Requirements'}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 text-center border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {getWordCount(formData.suggestions)}
              </p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'مقترحات' : 'Suggestions'}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-6 border-2 border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {language === 'ar' ? 'ملخص النشاط' : 'Activity Summary'}
            </h4>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-white dark:bg-slate-900 p-4 rounded-lg border">
              {summary}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          size="lg"
          className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg text-white font-semibold px-8"
        >
          <Save className="h-5 w-5" />
          {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ جميع الملاحظات' : 'Save All Notes')}
        </Button>
      </div>
    </div>
  );
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Info, Smartphone, Mail, Facebook, MessageCircle, 
  ShieldCheck, Code2, Globe, Heart, Rocket 
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';

/**
 * About Page - واجهة تعريف المنصة (B.S-Evaluation-Pro)
 * مصممة لتقديم معلومات التطبيق ووسائل التواصل الرسمية
 */
export default function AboutPage() {
  const { t, language } = useTranslation();

  const handleContact = (type: 'mobile' | 'whatsapp' | 'email' | 'facebook') => {
    // هذه البيانات يتم جلبها من ملف الترجمة لسهولة التعديل مستقبلاً
    const contactInfo = {
      mobile: t.about.mobileNumber,
      whatsapp: t.about.mobileNumber,
      email: t.about.emailAddress,
      facebook: t.about.facebookUrl
    };

    switch (type) {
      case 'mobile':
        window.open(`tel:${contactInfo.mobile}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${contactInfo.whatsapp}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${contactInfo.email}`, '_blank');
        break;
      case 'facebook':
        window.open(contactInfo.facebook, '_blank');
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      
      {/* رأس الصفحة والهوية */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-2">
          <Rocket className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">
          B.S Evaluation <span className="text-emerald-600 text-2xl">PRO</span>
        </h1>
        <Badge variant="outline" className="px-4 py-1 border-emerald-500 text-emerald-600 font-bold">
          الإصدار الاحترافي 2026.1.0
        </Badge>
        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 leading-relaxed">
          نظام هندسي متكامل لتقييم السلامة الإنشائية والمعمارية للمنشآت، مصمم ليتوافق مع معايير نقابة المهندسين السوريين والكود العربي السوري.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* قسم المميزات التقنية */}
        <Card className="md:col-span-2 shadow-lg border-none bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> ميزات المنصة
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <Code2 className="h-5 w-5 text-blue-500" />
              <h4 className="font-bold text-sm">تقنيات حديثة</h4>
              <p className="text-xs text-muted-foreground">مبني باستخدام Next.js و Tailwind CSS لضمان السرعة والجمالية.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              <h4 className="font-bold text-sm">مزامنة سحابية</h4>
              <p className="text-xs text-muted-foreground">حفظ البيانات ومزامنتها لحظياً عبر قاعدة بيانات PostgreSQL.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <Smartphone className="h-5 w-5 text-orange-500" />
              <h4 className="font-bold text-sm">تطبيق ويب تقدمي (PWA)</h4>
              <p className="text-xs text-muted-foreground">يمكنك تثبيته على هاتفك واستخدامه كتطبيق أصلي في الموقع الإنشائي.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <h4 className="font-bold text-sm">تقارير PDF فورية</h4>
              <p className="text-xs text-muted-foreground">توليد تقارير فنية بضغطة زر جاهزة للطباعة والتوقيع.</p>
            </div>
          </CardContent>
        </Card>

        {/* قسم التواصل المباشر */}
        <Card className="shadow-lg border-none bg-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="text-lg">تواصل مع المطور</CardTitle>
            <CardDescription className="text-emerald-100">للاقتراحات الفنية أو الدعم التقني</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-none text-white h-12"
              onClick={() => handleContact('whatsapp')}
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-none text-white h-12"
              onClick={() => handleContact('facebook')}
            >
              <Facebook className="h-5 w-5" /> Facebook
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-none text-white h-12"
              onClick={() => handleContact('email')}
            >
              <Mail className="h-5 w-5" /> Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* تذييل الصفحة (حقوق الملكية) */}
      <div className="pt-8 text-center space-y-2">
        <Separator className="mb-6" />
        <p className="text-sm font-medium flex items-center justify-center gap-2">
          تم التطوير بكل <Heart className="h-4 w-4 text-red-500 fill-red-500" /> بواسطة مهندسي المنصة
        </p>
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          © 2026 B.S EVALUATION PRO - ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Smartphone, Mail, Facebook, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/translations';

export default function AboutPanel() {
  const { t } = useTranslation();

  const handleContact = (type: 'mobile' | 'whatsapp' | 'email' | 'facebook') => {
    switch (type) {
      case 'mobile':
        window.open(`tel:${t.about.mobileNumber}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${t.about.mobileNumber}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${t.about.emailAddress}`, '_blank');
        break;
      case 'facebook':
        window.open(t.about.facebookUrl, '_blank');
        break;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Info className="h-5 w-5" />
          {t.about.title}
        </CardTitle>
        <CardDescription>
          {t.about.appInfo}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* App Info Section */}
        <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            معلومات التطبيق
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                تطبيق B.S Evaluation
              </p>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                التقييم الفني للوضع الراهن للمنشآت الخرسانية المسلحة
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                وفق اشتراطات ومعطيات الكود العربي السوري نسخة 2024
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                (الطريقة الكلاسيكية)
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                التطبيق هو أحد تطبيقات سلسلة تطبيقات B.S الإنشائية
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  الإصدار الأول 1.0
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                المطور: المهندس الاستشاري المدني: بشار السليمان
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.about.contact}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500 transition-all"
              onClick={() => handleContact('mobile')}
            >
              <Smartphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-center">
                <p className="font-medium text-sm">{t.about.mobile}</p>
                <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                  {t.about.mobileNumber}
                </p>
              </div>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500 transition-all"
              onClick={() => handleContact('whatsapp')}
            >
              <MessageCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-center">
                <p className="font-medium text-sm">{t.about.whatsapp}</p>
                <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                  {t.about.mobileNumber}
                </p>
              </div>
            </Button>

            {/* Email */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500 transition-all"
              onClick={() => handleContact('email')}
            >
              <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-center">
                <p className="font-medium text-sm">{t.about.email}</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {t.about.emailAddress}
                </p>
              </div>
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500 transition-all"
              onClick={() => handleContact('facebook')}
            >
              <Facebook className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="text-center">
                <p className="font-medium text-sm">{t.about.facebook}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                  {t.about.facebookUrl.split('/').pop()}
                </p>
              </div>
            </Button>
          </div>
        </div>

        {/* PWA Info */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-900 dark:text-slate-100">
                {t.about.pwaInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {t.appRights}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

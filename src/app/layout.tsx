import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'نظام تقييم المنشآت الخرسانية',
  description: 'تطبيق هندسي لتقييم المنشآت وفق الكود العربي السوري',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

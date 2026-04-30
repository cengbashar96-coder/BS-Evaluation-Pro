import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession();

  // حماية المسار: إذا لم يكن هناك جلسة دخول، اذهب لصفحة الدخول
  if (!session) {
    redirect('/auth/signin');
  }

  // جلب مشاريع المهندس الحالي فقط من قاعدة البيانات
  const projects = await prisma.project.findMany({
    where: {
      user: { email: session.user?.email! }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 dir-rtl text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">مشاريع التقييم الإنشائي</h1>
          <Link 
            href="/dashboard/new" 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            + مشروع جديد
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">لا توجد مشاريع مسجلة حالياً</p>
            <p className="text-sm text-gray-400">ابدأ بإضافة أول مشروع تقييم للمنشأة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border-r-4 border-blue-500">
                <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  تاريخ الإنشاء: {new Date(project.createdAt).toLocaleDateString('ar-EG')}
                </p>
                <Link 
                  href={`/dashboard/project/${project.id}`}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  عرض التفاصيل الهندسية ←
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    // التحقق من هوية المهندس
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const body = await req.json();
    const { name, location, floors } = body;

    // جلب بيانات المستخدم من القاعدة لربط المشروع به
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // إنشاء المشروع الجديد في Supabase
    const project = await prisma.project.create({
      data: {
        name,
        location,
        floors: parseInt(floors),
        userId: user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المشروع' }, { status: 500 });
  }
}

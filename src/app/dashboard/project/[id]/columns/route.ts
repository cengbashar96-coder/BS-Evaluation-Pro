import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // استخدام ملف السنجلتون الذي أنشأناه
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// جلب قائمة أعمدة مشروع معين
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 });

    const columns = await prisma.column.findMany({
      where: { projectId: params.id }
    });
    
    return NextResponse.json(columns);
  } catch (error) {
    return NextResponse.json({ error: 'فشل جلب البيانات' }, { status: 500 });
  }
}

// حفظ بيانات عمود جديد
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 });

    const body = await req.json();
    const { columnType, floorNumber, width, depth, totalLoad, actualStress, allowableStress, isVerified } = body;

    const newColumn = await prisma.column.create({
      data: {
        columnType,
        floorNumber,
        width,
        depth,
        totalLoad,
        actualStress,
        allowableStress,
        isVerified,
        projectId: params.id, // ربط العمود بالمشروع الحالي
      },
    });

    return NextResponse.json(newColumn);
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: 'خطأ في حفظ البيانات في قاعدة البيانات' }, { status: 500 });
  }
}

'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod"; // لمصادقة البيانات (Validation)

// تعريف هيكل البيانات المتوقع لضمان الحماية
const BuildingSchema = z.object({
  ownerName: z.string().min(3, "اسم المالك مطلوب"),
  propertyNumber: z.string().optional(),
  location: z.string().optional(),
  floorCount: z.number().int().positive().optional(),
  licenseDate: z.string().optional().nullable(),
});

export async function saveBuildingInfo(projectId: string, rawData: any) {
  try {
    // 1. التحقق من البيانات برمجياً قبل دخولها لقاعدة البيانات
    const validatedData = BuildingSchema.parse(rawData);

    // 2. عملية Upsert (تحديث إذا وجد المشروع أو إنشاء إذا لم يوجد)
    const result = await prisma.buildingInfo.upsert({
      where: { projectId: projectId },
      update: {
        ...validatedData,
        licenseDate: validatedData.licenseDate ? new Date(validatedData.licenseDate) : null,
      },
      create: {
        projectId: projectId,
        ...validatedData,
        licenseDate: validatedData.licenseDate ? new Date(validatedData.licenseDate) : null,
      },
    });

    // 3. تطهير الكاش لضمان تحديث الواجهة فوراً
    revalidatePath(`/dashboard/project/${projectId}`);
    
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "بيانات غير صالحة: " + error.errors[0].message };
    }
    return { success: false, error: "حدث خطأ أثناء الحفظ السحابي" };
  }
}

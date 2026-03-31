'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// ==========================================
// MEDICINE INVENTORY
// ==========================================
export async function createMedicine(formData: FormData) {
  const name = formData.get('name') as string;
  const supplier = formData.get('supplier') as string;
  const currentStock = parseFloat(formData.get('currentStock') as string);
  const unit = formData.get('unit') as string;
  const expirationDate = formData.get('expirationDate') as string;

  try {
    await prisma.medicine.create({
      data: {
        name,
      },
    });
    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error creating medicine:', error);
    return { success: false, error: 'Failed to create medicine item.' };
  }
}

export async function updateMedicine(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const supplier = formData.get('supplier') as string;
  const currentStock = parseFloat(formData.get('currentStock') as string);
  const unit = formData.get('unit') as string;
  const expirationDate = formData.get('expirationDate') as string;

  if (currentStock < 0) return { success: false, error: 'Stock cannot be negative.' };

  try {
    await prisma.medicine.update({
      where: { id },
      data: {
        name,
      },
    });
    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error updating medicine:', error);
    return { success: false, error: 'Failed to update medicine item.' };
  }
}

export async function deleteMedicine(id: string) {
  try {
    await prisma.$transaction([
      prisma.medicalRecord.deleteMany({ where: { medicineId: id } }),
      prisma.medicalPurchaseOrder.deleteMany({ where: { medicineId: id } }),
      prisma.medicine.delete({ where: { id } })
    ]);
    
    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return { success: false, error: 'Failed to delete medicine item.' };
  }
}

// ==========================================
// MEDICAL PURCHASE ORDERS
// ==========================================
export async function createMedicalPurchaseOrder(formData: FormData) {
  const medicineId = formData.get('medicineId') as string;
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string);
  const dateStr = formData.get('date') as string;

  if (quantity <= 0 || pricePerUnit < 0) return { success: false, error: 'Quantity must be positive and price cannot be negative.' };

  try {
    const totalCost = quantity * pricePerUnit;

    await prisma.medicalPurchaseOrder.create({
      data: {
        medicineId,
        quantity,
        unit,
        pricePerUnit,
        totalCost,
        date: new Date(dateStr),
      },
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error creating medical PO:', error);
    return { success: false, error: 'Failed to create medical purchase order.' };
  }
}

export async function deleteMedicalPurchaseOrder(id: string) {
  try {
    await prisma.medicalPurchaseOrder.delete({ where: { id } });
    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error deleting medical PO:', error);
    return { success: false, error: 'Failed to delete medical purchase order.' };
  }
}

// ==========================================
// MEDICAL RECORDS (TREATMENTS)
// ==========================================
export async function createMedicalRecord(formData: FormData) {
  const cattleId = formData.get('cattleId') as string;
  const medicineId = formData.get('medicineId') as string;
  const dose = parseFloat(formData.get('dose') as string);
  const treatmentDate = formData.get('treatmentDate') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;

  if (dose <= 0) return { success: false, error: 'الجرعة يجب أن تكون أكبر من صفر.' };

  try {
    // Server-side: fetch the latest PO unit — do NOT trust client input
    const latestOrder = await prisma.medicalPurchaseOrder.findFirst({
      where: { medicineId },
      orderBy: { date: 'desc' },
    });

    if (!latestOrder) {
      return { success: false, error: 'لا توجد طلبية شراء لهذا الدواء. يجب إضافة طلبية أولاً لتحديد الوحدة.' };
    }

    const unit = latestOrder.unit;

    await prisma.medicalRecord.create({
      data: {
        cattleId,
        medicineId,
        dose,
        unit,
        treatmentDate: new Date(treatmentDate),
        type,
        notes,
      },
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error logging medical record:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل العلاج.' };
  }
}

export async function updateMedicalRecord(id: string, formData: FormData) {
  const cattleId = formData.get('cattleId') as string;
  const medicineId = formData.get('medicineId') as string;
  const dose = parseFloat(formData.get('dose') as string);
  const treatmentDate = formData.get('treatmentDate') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;

  if (dose <= 0) return { success: false, error: 'الجرعة يجب أن تكون أكبر من صفر.' };

  try {
    // Preserve the original unit — never allow override
    const existing = await prisma.medicalRecord.findUnique({ where: { id } });
    if (!existing) return { success: false, error: 'السجل غير موجود.' };

    await prisma.medicalRecord.update({
      where: { id },
      data: {
        cattleId,
        medicineId,
        dose,
        unit: existing.unit,
        treatmentDate: new Date(treatmentDate),
        type,
        notes,
      },
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error updating medical record:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث سجل العلاج.' };
  }
}

export async function deleteMedicalRecord(id: string) {
  try {
    await prisma.medicalRecord.delete({ where: { id } });
    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return { success: false, error: 'Failed to delete treatment log.' };
  }
}

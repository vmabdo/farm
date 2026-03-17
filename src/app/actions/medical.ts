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
        supplier,
        currentStock,
        unit,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
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

  try {
    await prisma.medicine.update({
      where: { id },
      data: {
        name,
        supplier,
        currentStock,
        unit,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
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
// MEDICAL RECORDS (TREATMENTS)
// ==========================================
export async function createMedicalRecord(formData: FormData) {
  const cattleId = formData.get('cattleId') as string;
  const medicineId = formData.get('medicineId') as string;
  const dose = parseFloat(formData.get('dose') as string);
  const treatmentDate = formData.get('treatmentDate') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.medicalRecord.create({
        data: {
          cattleId,
          medicineId,
          dose,
          treatmentDate: new Date(treatmentDate),
          type,
          notes,
        },
      });

      // Deduct stock optionally based on requirement
      await tx.medicine.update({
        where: { id: medicineId },
        data: {
          currentStock: { decrement: dose }
        }
      });
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error logging medical record:', error);
    return { success: false, error: 'Failed to log treatment.' };
  }
}

export async function updateMedicalRecord(id: string, formData: FormData) {
  const cattleId = formData.get('cattleId') as string;
  const medicineId = formData.get('medicineId') as string;
  const dose = parseFloat(formData.get('dose') as string);
  const treatmentDate = formData.get('treatmentDate') as string;
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;

  try {
    await prisma.$transaction(async (tx) => {
      const oldRecord = await tx.medicalRecord.findUnique({ where: { id } });
      if (!oldRecord) throw new Error('Record not found');

      // Revert old dose, apply new dose
      if (oldRecord.medicineId !== medicineId) {
        // Medicine changed, revert old completely, deduct full new
        await tx.medicine.update({
          where: { id: oldRecord.medicineId },
          data: { currentStock: { increment: oldRecord.dose } }
        });
        await tx.medicine.update({
          where: { id: medicineId },
          data: { currentStock: { decrement: dose } }
        });
      } else {
        // Same medicine, difference in dose
        const diff = dose - oldRecord.dose;
        await tx.medicine.update({
          where: { id: medicineId },
          data: { currentStock: { decrement: diff } }
        });
      }

      await tx.medicalRecord.update({
        where: { id },
        data: {
          cattleId,
          medicineId,
          dose,
          treatmentDate: new Date(treatmentDate),
          type,
          notes,
        },
      });
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error updating medical record:', error);
    return { success: false, error: 'Failed to update treatment log.' };
  }
}

export async function deleteMedicalRecord(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.findUnique({ where: { id } });
      if (!record) throw new Error('Record not found');

      await tx.medicalRecord.delete({ where: { id } });

      // Restore dose to stock
      await tx.medicine.update({
        where: { id: record.medicineId },
        data: { currentStock: { increment: record.dose } }
      });
    });

    revalidatePath('/medical');
    return { success: true };
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return { success: false, error: 'Failed to delete treatment log.' };
  }
}

'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createCattle(formData: FormData) {
  const tagNumber = formData.get('tagNumber') as string;
  const breed = formData.get('breed') as string;
  const entryDate = formData.get('entryDate') as string;
  const entryWeight = parseFloat(formData.get('entryWeight') as string);

  try {
    const cattle = await prisma.cattle.create({
      data: {
        tagNumber,
        breed,
        entryDate: new Date(entryDate),
        entryWeight,
        currentWeight: entryWeight,
        status: 'ACTIVE',
      },
    });

    // Automatically create the initial weight record
    await prisma.weightRecord.create({
      data: {
        cattleId: cattle.id,
        weight: entryWeight,
        date: new Date(entryDate),
        notes: 'Initial entry weight',
      },
    });

    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error creating cattle:', error);
    return { success: false, error: 'Failed to create cattle record.' };
  }
}

export async function updateCattle(id: string, formData: FormData) {
  const tagNumber = formData.get('tagNumber') as string;
  const breed = formData.get('breed') as string;
  const entryDate = formData.get('entryDate') as string;
  const status = formData.get('status') as string;

  try {
    await prisma.cattle.update({
      where: { id },
      data: {
        tagNumber,
        breed,
        entryDate: new Date(entryDate),
        status,
      },
    });

    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error updating cattle:', error);
    return { success: false, error: 'Failed to update cattle record.' };
  }
}

export async function deleteCattle(id: string) {
  try {
    // Need to delete related records first or use cascading deletes in schema
    // In our schema we didn't specify cascade, so let's delete manually
    await prisma.weightRecord.deleteMany({ where: { cattleId: id } });
    await prisma.medicalRecord.deleteMany({ where: { cattleId: id } });
    
    await prisma.cattle.delete({
      where: { id },
    });

    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error deleting cattle:', error);
    return { success: false, error: 'Failed to delete cattle record.' };
  }
}

export async function addWeightRecord(cattleId: string, formData: FormData) {
  const weightStr = formData.get('weight') as string;
  const dateStr = formData.get('date') as string;
  const notes = formData.get('notes') as string;

  if (!weightStr) return { success: false, error: 'Weight is required' };

  const weight = parseFloat(weightStr);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the new weight record
      await tx.weightRecord.create({
        data: {
          cattleId,
          weight,
          date: dateStr ? new Date(dateStr) : new Date(),
          notes,
        },
      });

      // 2. We should update the Cattle's currentWeight to the LATEST weight by date
      // Find the latest weight record for this cattle
      const latestWeightRecord = await tx.weightRecord.findFirst({
        where: { cattleId },
        orderBy: { date: 'desc' },
      });

      if (latestWeightRecord) {
        await tx.cattle.update({
          where: { id: cattleId },
          data: { currentWeight: latestWeightRecord.weight },
        });
      }
    });

    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error adding weight record:', error);
    return { success: false, error: 'Failed to add weight record.' };
  }
}

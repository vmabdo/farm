'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createCattle(formData: FormData) {
  const tagNumber = formData.get('tagNumber') as string;
  const breedId = formData.get('breedId') as string;
  const entryDate = formData.get('entryDate') as string;
  const entryWeight = parseFloat(formData.get('entryWeight') as string);

  if (!breedId) return { success: false, error: 'يجب اختيار سلالة العجل' };
  if (entryWeight < 0) return { success: false, error: 'Weight cannot be negative' };

  try {
    const cattle = await prisma.cattle.create({
      data: {
        tagNumber,
        breedId: breedId,
        entryDate: new Date(entryDate),
        entryWeight,
        currentWeight: entryWeight,
        lastWeightDifference: 0,
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
  const breedId = formData.get('breedId') as string;
  const entryDate = formData.get('entryDate') as string;
  const status = formData.get('status') as string;

  if (!breedId) return { success: false, error: 'يجب اختيار سلالة العجل' };

  try {
    await prisma.cattle.update({
      where: { id },
      data: {
        tagNumber,
        breedId: breedId,
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
  if (weight < 0) return { success: false, error: 'Weight cannot be negative' };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch exact previous weight record BEFORE creating the new one
      const previousWeightRecord = await tx.weightRecord.findFirst({
        where: { cattleId },
        orderBy: { createdAt: 'desc' },
      });

      const cattle = await tx.cattle.findUnique({
        where: { id: cattleId },
      });
      
      if (!cattle) throw new Error('Cattle not found');

      // 2. Accurate Math: (New Weight) - (Exact Last Recorded Weight)
      const lastRecordedWeight = previousWeightRecord ? previousWeightRecord.weight : cattle.entryWeight;
      const lastWeightDifference = weight - lastRecordedWeight;

      // 3. Create the new weight record
      await tx.weightRecord.create({
        data: {
          cattleId,
          weight,
          date: dateStr ? new Date(dateStr) : new Date(),
          notes,
        },
      });

      // 4. Update the Cattle's currentWeight and lastWeightDifference
      await tx.cattle.update({
        where: { id: cattleId },
        data: { 
          currentWeight: weight,
          lastWeightDifference,
        },
      });
    });

    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error adding weight record:', error);
    return { success: false, error: 'Failed to add weight record.' };
  }
}

export async function markDeceased(id: string) {
  try {
    await prisma.cattle.update({
      where: { id },
      data: { status: 'DECEASED' }
    });
    revalidatePath('/cattle');
    return { success: true };
  } catch (error) {
    console.error('Error marking deceased:', error);
    return { success: false, error: 'Failed to update cattle status.' };
  }
}

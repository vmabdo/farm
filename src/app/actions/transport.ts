'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createTransportRent(formData: FormData) {
  const travelDate = formData.get('travelDate') as string;
  const driverName = formData.get('driverName') as string;
  const vehicleType = formData.get('vehicleType') as string;
  const purpose = formData.get('purpose') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const notes = formData.get('notes') as string;

  if (cost < 0) return { success: false, error: 'Cost cannot be negative.' };

  try {
    await prisma.transportRent.create({
      data: {
        travelDate: new Date(travelDate),
        driverName,
        vehicleType,
        purpose,
        cost,
        notes,
      },
    });
    revalidatePath('/transport');
    return { success: true };
  } catch (error) {
    console.error('Error logging transport:', error);
    return { success: false, error: 'Failed to log transport expense.' };
  }
}

export async function updateTransportRent(id: string, formData: FormData) {
  const travelDate = formData.get('travelDate') as string;
  const driverName = formData.get('driverName') as string;
  const vehicleType = formData.get('vehicleType') as string;
  const purpose = formData.get('purpose') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const notes = formData.get('notes') as string;

  if (cost < 0) return { success: false, error: 'Cost cannot be negative.' };

  try {
    await prisma.transportRent.update({
      where: { id },
      data: {
        travelDate: new Date(travelDate),
        driverName,
        vehicleType,
        purpose,
        cost,
        notes,
      },
    });
    revalidatePath('/transport');
    return { success: true };
  } catch (error) {
    console.error('Error updating transport log:', error);
    return { success: false, error: 'Failed to update transport log.' };
  }
}

export async function deleteTransportRent(id: string) {
  try {
    await prisma.transportRent.delete({ where: { id } });
    revalidatePath('/transport');
    return { success: true };
  } catch (error) {
    console.error('Error deleting transport log:', error);
    return { success: false, error: 'Failed to delete transport log.' };
  }
}

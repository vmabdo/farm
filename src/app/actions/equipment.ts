'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createEquipment(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;

  try {
    await prisma.equipment.create({
      data: {
        name,
        type,
        status,
        notes,
      },
    });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    console.error('Error creating equipment:', error);
    return { success: false, error: 'Failed to add equipment.' };
  }
}

export async function updateEquipment(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const status = formData.get('status') as string;
  const notes = formData.get('notes') as string;

  try {
    await prisma.equipment.update({
      where: { id },
      data: {
        name,
        type,
        status,
        notes,
      },
    });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    console.error('Error updating equipment:', error);
    return { success: false, error: 'Failed to update equipment.' };
  }
}

export async function deleteEquipment(id: string) {
  try {
    await prisma.equipmentMaintenance.deleteMany({ where: { equipmentId: id } });
    await prisma.equipment.delete({ where: { id } });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return { success: false, error: 'Failed to delete equipment.' };
  }
}

// ==========================================
// EQUIPMENT MAINTENANCE
// ==========================================
export async function createEquipmentMaintenance(formData: FormData) {
  const equipmentId = formData.get('equipmentId') as string;
  const description = formData.get('description') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const dateStr = formData.get('date') as string;

  if (cost < 0) return { success: false, error: 'Cost cannot be negative.' };

  try {
    await prisma.equipmentMaintenance.create({
      data: {
        equipmentId,
        description,
        cost,
        date: new Date(dateStr),
      },
    });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return { success: false, error: 'Failed to create maintenance record.' };
  }
}

export async function deleteEquipmentMaintenance(id: string) {
  try {
    await prisma.equipmentMaintenance.delete({ where: { id } });
    revalidatePath('/equipment');
    return { success: true };
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return { success: false, error: 'Failed to delete maintenance record.' };
  }
}

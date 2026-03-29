'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createBreed(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const pricePerKg = parseFloat(formData.get('pricePerKg') as string);
    if (!name || isNaN(pricePerKg)) throw new Error('Invalid input');

    await prisma.breed.create({
      data: { name, pricePerKg }
    });
    revalidatePath('/cattle');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBreed(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const pricePerKg = parseFloat(formData.get('pricePerKg') as string);
    if (!name || isNaN(pricePerKg)) throw new Error('Invalid input');

    await prisma.breed.update({
      where: { id },
      data: { name, pricePerKg }
    });
    revalidatePath('/cattle');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBreed(id: string) {
  try {
    await prisma.breed.delete({ where: { id } });
    revalidatePath('/cattle');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

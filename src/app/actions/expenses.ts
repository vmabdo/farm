'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createExpense(formData: FormData) {
  const itemName = (formData.get('itemName') as string)?.trim();
  const cost     = parseFloat(formData.get('cost') as string);
  const date     = new Date(formData.get('date') as string);

  if (!itemName || isNaN(cost) || isNaN(date.getTime()))
    return { success: false, error: 'بيانات غير صحيحة.' };

  try {
    await prisma.generalExpense.create({ data: { itemName, cost, date } });
    revalidatePath('/expenses');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'فشل إضافة المصروف.' };
  }
}

export async function updateExpense(id: string, formData: FormData) {
  const itemName = (formData.get('itemName') as string)?.trim();
  const cost     = parseFloat(formData.get('cost') as string);
  const date     = new Date(formData.get('date') as string);

  if (!itemName || isNaN(cost) || isNaN(date.getTime()))
    return { success: false, error: 'بيانات غير صحيحة.' };

  try {
    await prisma.generalExpense.update({ where: { id }, data: { itemName, cost, date } });
    revalidatePath('/expenses');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'فشل تعديل المصروف.' };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.generalExpense.delete({ where: { id } });
    revalidatePath('/expenses');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'فشل حذف المصروف.' };
  }
}

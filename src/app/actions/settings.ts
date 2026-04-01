'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function getFarmSettings() {
  const settings = await prisma.farmSettings.findUnique({ where: { id: 1 } });
  return settings ?? { id: 1, farmName: 'مزرعتي', logoData: null };
}

export async function saveFarmSettings(formData: FormData) {
  const farmName = (formData.get('farmName') as string)?.trim() || 'مزرعتي';
  const logoData = (formData.get('logoData') as string) || null;

  try {
    await prisma.farmSettings.upsert({
      where:  { id: 1 },
      create: { id: 1, farmName, logoData },
      update: { farmName, ...(logoData !== null ? { logoData } : {}) },
    });
    revalidatePath('/settings');
    revalidatePath('/invoices');
    revalidatePath('/reports');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'فشل حفظ الإعدادات.' };
  }
}

export async function clearLogo() {
  try {
    await prisma.farmSettings.upsert({
      where:  { id: 1 },
      create: { id: 1, farmName: 'مزرعتي', logoData: null },
      update: { logoData: null },
    });
    revalidatePath('/settings');
    revalidatePath('/invoices');
    revalidatePath('/reports');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'فشل مسح الشعار.' };
  }
}

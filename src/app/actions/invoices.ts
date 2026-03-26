'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function createInvoice(formData: FormData) {
  const clientName = formData.get('clientName') as string;
  const invoiceDate = new Date(formData.get('invoiceDate') as string);
  const discount = parseFloat(formData.get('discount') as string) || 0;
  const notes = formData.get('notes') as string;
  const itemsStr = formData.get('items') as string;

  try {
    const items = JSON.parse(itemsStr);
    
    // Calculate total amount from items
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    const netAmount = Math.max(0, totalAmount - discount);

    await prisma.invoice.create({
      data: {
        clientName,
        invoiceDate,
        totalAmount,
        discount,
        netAmount,
        items: itemsStr,
        notes,
      },
    });

    revalidatePath('/invoices');
    return { success: true };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, error: 'Failed to create invoice.' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/invoices');
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: 'Failed to delete invoice.' };
  }
}

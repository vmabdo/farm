'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// ==========================================
// FEED ITEMS (INVENTORY)
// ==========================================
export async function createFeedItem(formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const unit = formData.get('unit') as string;
  const dailyPrice = parseFloat(formData.get('dailyPrice') as string) || 0;

  try {
    await prisma.feedItem.create({
      data: {
        name,
        type,
      },
    });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error creating feed item:', error);
    return { success: false, error: 'Failed to create feed item.' };
  }
}

export async function updateFeedItem(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const unit = formData.get('unit') as string;
  const dailyPrice = parseFloat(formData.get('dailyPrice') as string) || 0;

  try {
    await prisma.feedItem.update({
      where: { id },
      data: { name, type },
    });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error updating feed item:', error);
    return { success: false, error: 'Failed to update feed item.' };
  }
}

export async function deleteFeedItem(id: string) {
  try {
    // Delete related first
    await prisma.feedPurchaseOrder.deleteMany({ where: { feedId: id } });
    await prisma.feedConsumption.deleteMany({ where: { feedItemId: id } });
    
    await prisma.feedItem.delete({ where: { id } });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error deleting feed item:', error);
    return { success: false, error: 'Failed to delete feed item.' };
  }
}

// ==========================================
// FEED ORDERS
// ==========================================
export async function createFeedOrder(formData: FormData) {
  const feedId = formData.get('feedId') as string;
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string);
  const supplier = formData.get('supplier') as string;
  const orderDate = formData.get('orderDate') as string;

  if (quantity <= 0 || pricePerUnit < 0) return { success: false, error: 'Quantity must be positive and price cannot be negative.' };

  try {
    const totalCost = quantity * pricePerUnit;

    await prisma.feedPurchaseOrder.create({
      data: {
        feedId,
        quantity,
        unit,
        pricePerUnit,
        totalCost,
        supplier,
        date: new Date(orderDate),
      },
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error creating feed order:', error);
    return { success: false, error: 'Failed to create feed order.' };
  }
}

export async function updateFeedOrder(id: string, formData: FormData) {
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string);
  const supplier = formData.get('supplier') as string;
  const dateStr = formData.get('orderDate') as string;

  if (quantity <= 0 || pricePerUnit < 0) return { success: false, error: 'الكمية يجب أن تكون موجبة والسعر لا يمكن أن يكون سالباً.' };

  try {
    const totalCost = quantity * pricePerUnit;
    await prisma.feedPurchaseOrder.update({
      where: { id },
      data: { quantity, unit, pricePerUnit, totalCost, supplier, date: new Date(dateStr) },
    });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error updating feed order:', error);
    return { success: false, error: 'Failed to update feed order.' };
  }
}

export async function deleteFeedOrder(id: string) {
  try {
    await prisma.feedPurchaseOrder.delete({ where: { id } });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error deleting feed order:', error);
    return { success: false, error: 'Failed to delete feed order.' };
  }
}

// ==========================================
// FEED CONSUMPTIONS
// ==========================================
export async function createFeedConsumption(formData: FormData) {
  const feedItemId = formData.get('feedItemId') as string;
  const quantity = parseFloat(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;
  const date = formData.get('date') as string;

  if (quantity <= 0) return { success: false, error: 'الكمية المستهلكة يجب أن تكون أكبر من صفر.' };

  try {
    // Server-side: fetch the latest PO unit — do NOT trust client input
    const latestOrder = await prisma.feedPurchaseOrder.findFirst({
      where: { feedId: feedItemId },
      orderBy: { date: 'desc' },
    });

    if (!latestOrder) {
      return { success: false, error: 'لا توجد طلبية شراء لهذا العلف. يجب إضافة طلبية أولاً لتحديد الوحدة.' };
    }

    const unit = latestOrder.unit;

    await prisma.feedConsumption.create({
      data: {
        feedItemId,
        quantity,
        unit,
        notes,
        date: new Date(date),
      },
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error creating feed consumption:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الاستهلاك.' };
  }
}

export async function updateFeedConsumption(id: string, formData: FormData) {
  const quantity = parseFloat(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;
  const date = formData.get('date') as string;

  if (quantity <= 0) return { success: false, error: 'الكمية المستهلكة يجب أن تكون أكبر من صفر.' };

  try {
    // Preserve the original unit from the existing record — never allow override
    const existing = await prisma.feedConsumption.findUnique({ where: { id } });
    if (!existing) return { success: false, error: 'السجل غير موجود.' };

    await prisma.feedConsumption.update({
      where: { id },
      data: { quantity, unit: existing.unit, notes, date: new Date(date) },
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error updating feed consumption:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث سجل الاستهلاك.' };
  }
}

export async function deleteFeedConsumption(id: string) {
  try {
    await prisma.feedConsumption.delete({ where: { id } });
    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error deleting feed consumption:', error);
    return { success: false, error: 'Failed to delete feed consumption.' };
  }
}

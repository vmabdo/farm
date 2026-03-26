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
        unit,
        dailyPrice,
        currentStock: 0, // Starts at 0, increased by orders
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
      data: { name, type, unit, dailyPrice },
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
    await prisma.feedOrder.deleteMany({ where: { feedItemId: id } });
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
  const feedItemId = formData.get('feedItemId') as string;
  const quantity = parseFloat(formData.get('quantity') as string);
  const cost = parseFloat(formData.get('cost') as string);
  const supplier = formData.get('supplier') as string;
  const orderDate = formData.get('orderDate') as string;

  if (quantity <= 0 || cost < 0) return { success: false, error: 'Quantity must be positive and cost cannot be negative.' };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.feedOrder.create({
        data: {
          feedItemId,
          quantity,
          cost,
          supplier,
          orderDate: new Date(orderDate),
        },
      });

      await tx.feedItem.update({
        where: { id: feedItemId },
        data: {
          currentStock: { increment: quantity }
        }
      });
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
  const cost = parseFloat(formData.get('cost') as string);
  const supplier = formData.get('supplier') as string;
  const orderDate = formData.get('orderDate') as string;

  if (quantity <= 0 || cost < 0) return { success: false, error: 'Quantity must be positive and cost cannot be negative.' };

  try {
    await prisma.$transaction(async (tx) => {
      const oldOrder = await tx.feedOrder.findUnique({ where: { id } });
      if (!oldOrder) throw new Error('Order not found');

      const difference = quantity - oldOrder.quantity;

      await tx.feedOrder.update({
        where: { id },
        data: { quantity, cost, supplier, orderDate: new Date(orderDate) },
      });

      await tx.feedItem.update({
        where: { id: oldOrder.feedItemId },
        data: { currentStock: { increment: difference } }
      });
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
    await prisma.$transaction(async (tx) => {
      const order = await tx.feedOrder.findUnique({ where: { id } });
      if (!order) throw new Error('Order not found');

      await tx.feedOrder.delete({ where: { id } });

      await tx.feedItem.update({
        where: { id: order.feedItemId },
        data: { currentStock: { decrement: order.quantity } }
      });
    });

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
  const rawQuantity = parseFloat(formData.get('quantity') as string);
  const consumeUnit = formData.get('unit') as string; // from frontend
  const notes = formData.get('notes') as string;
  const date = formData.get('date') as string;

  if (rawQuantity <= 0) return { success: false, error: 'Consumption amount must be positive.' };

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.feedItem.findUnique({ where: { id: feedItemId } });
      if (!item) throw new Error('Feed item not found.');

      let convertedQuantity = rawQuantity;
      let notesExtra = notes;

      // Handle conversion if mixed units
      if (item.unit === 'TON' && (consumeUnit === 'KG' || consumeUnit === 'Kg')) {
        convertedQuantity = rawQuantity / 1000;
        notesExtra = notes ? `${notes} (Input: ${rawQuantity} KG)` : `Input: ${rawQuantity} KG`;
      } else if (item.unit === 'KG' && (consumeUnit === 'TON' || consumeUnit === 'Ton')) {
        convertedQuantity = rawQuantity * 1000;
        notesExtra = notes ? `${notes} (Input: ${rawQuantity} TON)` : `Input: ${rawQuantity} TON`;
      }

      if (item.currentStock < convertedQuantity) throw new Error(`Not enough stock. Available: ${item.currentStock.toFixed(2)} ${item.unit}`);

      await tx.feedConsumption.create({
        data: {
          feedItemId,
          quantity: convertedQuantity,
          notes: notesExtra,
          date: new Date(date),
        },
      });

      await tx.feedItem.update({
        where: { id: feedItemId },
        data: { currentStock: { decrement: convertedQuantity } }
      });
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error creating feed consumption:', error);
    return { success: false, error: 'Failed to log feed consumption.' };
  }
}

export async function updateFeedConsumption(id: string, formData: FormData) {
  const quantity = parseFloat(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;
  const date = formData.get('date') as string;

  if (quantity <= 0) return { success: false, error: 'Consumption amount must be positive.' };

  try {
    await prisma.$transaction(async (tx) => {
      const oldConsumption = await tx.feedConsumption.findUnique({ where: { id } });
      if (!oldConsumption) throw new Error('Consumption not found');

      const difference = quantity - oldConsumption.quantity;

      const item = await tx.feedItem.findUnique({ where: { id: oldConsumption.feedItemId } });
      if (!item) throw new Error('Feed item not found.');
      if (difference > 0 && item.currentStock < difference) {
        throw new Error(`Not enough stock. Need ${(difference).toFixed(2)} more, but only ${item.currentStock.toFixed(2)} available.`);
      }

      await tx.feedConsumption.update({
        where: { id },
        data: { quantity, notes, date: new Date(date) },
      });

      // since consumption decreases stock, if new quantity is higher, we need to decrement more
      await tx.feedItem.update({
        where: { id: oldConsumption.feedItemId },
        data: { currentStock: { decrement: difference } }
      });
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error updating feed consumption:', error);
    return { success: false, error: 'Failed to update feed consumption.' };
  }
}

export async function deleteFeedConsumption(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const consumption = await tx.feedConsumption.findUnique({ where: { id } });
      if (!consumption) throw new Error('Consumption not found');

      await tx.feedConsumption.delete({ where: { id } });

      await tx.feedItem.update({
        where: { id: consumption.feedItemId },
        data: { currentStock: { increment: consumption.quantity } }
      });
    });

    revalidatePath('/feed');
    return { success: true };
  } catch (error) {
    console.error('Error deleting feed consumption:', error);
    return { success: false, error: 'Failed to delete feed consumption.' };
  }
}

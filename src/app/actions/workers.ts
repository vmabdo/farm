'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// ==========================================
// WORKERS
// ==========================================
export async function createWorker(formData: FormData) {
  const name = formData.get('name') as string;
  const nationalId = formData.get('nationalId') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;
  const salary = parseFloat(formData.get('salary') as string);
  const startDate = formData.get('startDate') as string;

  if (salary < 0) return { success: false, error: 'Salary cannot be negative.' };

  try {
    await prisma.worker.create({
      data: {
        name,
        nationalId,
        role,
        phone,
        salary,
        startDate: new Date(startDate),
        active: true,
      },
    });
    revalidatePath('/workers');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'A worker with this National ID already exists.' };
    }
    console.error('Error creating worker:', error);
    return { success: false, error: 'Failed to create worker.' };
  }
}

export async function updateWorker(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const nationalId = formData.get('nationalId') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;
  const salary = parseFloat(formData.get('salary') as string);
  const startDate = formData.get('startDate') as string;
  const active = formData.get('active') === 'true';

  if (salary < 0) return { success: false, error: 'Salary cannot be negative.' };

  try {
    await prisma.worker.update({
      where: { id },
      data: {
        name,
        nationalId,
        role,
        phone,
        salary,
        startDate: new Date(startDate),
        active,
      },
    });
    revalidatePath('/workers');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'A worker with this National ID already exists.' };
    }
    console.error('Error updating worker:', error);
    return { success: false, error: 'Failed to update worker.' };
  }
}

export async function deleteWorker(id: string) {
  try {
    // Delete worker's payrolls first to safely cascade, 
    // or use prisma.$transaction
    await prisma.$transaction([
      prisma.payroll.deleteMany({ where: { workerId: id } }),
      prisma.worker.delete({ where: { id } })
    ]);
    
    revalidatePath('/workers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting worker:', error);
    return { success: false, error: 'Failed to delete worker.' };
  }
}

// ==========================================
// PAYROLL
// ==========================================
export async function createPayroll(formData: FormData) {
  const workerId = formData.get('workerId') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;
  const paymentDate = formData.get('paymentDate') as string;

  if (amount <= 0) return { success: false, error: 'Payment amount must be positive.' };

  try {
    await prisma.payroll.create({
      data: {
        workerId,
        amount,
        type, // SALARY, BONUS, DEDUCTION
        notes,
        paymentDate: new Date(paymentDate),
      },
    });

    revalidatePath('/workers');
    return { success: true };
  } catch (error) {
    console.error('Error creating payroll logger:', error);
    return { success: false, error: 'Failed to log payroll payment.' };
  }
}

export async function updatePayroll(id: string, formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const notes = formData.get('notes') as string;
  const paymentDate = formData.get('paymentDate') as string;

  if (amount <= 0) return { success: false, error: 'Payment amount must be positive.' };

  try {
    await prisma.payroll.update({
      where: { id },
      data: {
        amount,
        type,
        notes,
        paymentDate: new Date(paymentDate),
      },
    });

    revalidatePath('/workers');
    return { success: true };
  } catch (error) {
    console.error('Error updating payroll log:', error);
    return { success: false, error: 'Failed to update payroll payment.' };
  }
}

export async function deletePayroll(id: string) {
  try {
    await prisma.payroll.delete({ where: { id } });
    revalidatePath('/workers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting payroll log:', error);
    return { success: false, error: 'Failed to delete payroll payment.' };
  }
}

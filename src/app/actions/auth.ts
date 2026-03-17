'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthSession, clearAuthSession } from '@/lib/auth';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    let user = await prisma.user.findUnique({ where: { username } });

    // Auto-create initial admin if zero users exist (local ERP setup)
    if (!user) {
      const allUsers = await prisma.user.count();
      if (allUsers === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: { username, password: hashedPassword },
        });
      } else {
        return { success: false, error: 'Invalid credentials.' };
      }
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Invalid credentials.' };
    }

    // Set secure session cookie explicitly
    await setAuthSession(user.id);

    return { success: true };
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: 'Authentication failed.' };
  }
}

export async function logout() {
  await clearAuthSession();
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const username = formData.get('username') as string;

  if (!currentPassword || !newPassword || !username) {
    return { success: false, error: 'All fields are required.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return { success: false, error: 'User not found.' };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return { success: false, error: 'Invalid current password.' };

    const hashedNew = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNew }
    });

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to update password.' };
  }
}

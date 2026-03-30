'use server';

import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function getReportData(startIso: string, endIso: string) {
  const startDate = startOfDay(new Date(startIso));
  const endDate = endOfDay(new Date(endIso));

  const dateFilter = { gte: startDate, lte: endDate };

  // ── Cattle status changes ──────────────────────────────────────────────
  const [newCattle, soldCattle, deceasedCattle] = await Promise.all([
    prisma.cattle.count({ where: { entryDate: dateFilter } }),
    prisma.cattle.count({ where: { status: 'SOLD',     updatedAt: dateFilter } }),
    prisma.cattle.count({ where: { status: 'DECEASED', updatedAt: dateFilter } }),
  ]);

  // ── Revenue (from invoices) ────────────────────────────────────────────
  const invoiceAgg = await prisma.invoice.aggregate({
    where: { invoiceDate: dateFilter },
    _sum: { totalAmount: true, netAmount: true },
  });
  const totalRevenue = invoiceAgg._sum.netAmount ?? 0;
  const totalGrossRevenue = invoiceAgg._sum.totalAmount ?? 0;

  // ── Feed consumption cost ──────────────────────────────────────────────
  const feedConsumptions = await prisma.feedConsumption.findMany({
    where: { date: dateFilter },
    include: { feedItem: true },
  });

  // Aggregate per feedItem for the detail table
  const feedMap: Record<string, { name: string; unit: string; totalQuantity: number; totalCost: number }> = {};
  for (const fc of feedConsumptions) {
    if (!feedMap[fc.feedItemId]) {
      feedMap[fc.feedItemId] = {
        name: fc.feedItem.name,
        unit: fc.feedItem.unit,
        totalQuantity: 0,
        totalCost: 0,
      };
    }
    feedMap[fc.feedItemId].totalQuantity += fc.quantity;
    feedMap[fc.feedItemId].totalCost += fc.quantity * (fc.feedItem.dailyPrice ?? 0);
  }
  const feedDetails = Object.values(feedMap);
  const totalFeedCost = feedDetails.reduce((s, f) => s + f.totalCost, 0);

  // ── Medical costs ─────────────────────────────────────────────────────
  const medicalRecords = await prisma.medicalRecord.findMany({
    where: { treatmentDate: dateFilter },
    include: { medicine: true },
  });

  const medicineMap: Record<string, { name: string; totalDose: number; unit: string; totalCost: number }> = {};
  for (const mr of medicalRecords) {
    if (!medicineMap[mr.medicineId]) {
      medicineMap[mr.medicineId] = {
        name: mr.medicine.name,
        unit: mr.medicine.unit,
        totalDose: 0,
        totalCost: 0,
      };
    }
    medicineMap[mr.medicineId].totalDose += mr.dose;
    // Medicine schema doesn't have a price per unit — use 0 for now; extend schema if needed
    medicineMap[mr.medicineId].totalCost += 0;
  }
  const medicalDetails = Object.values(medicineMap);
  const totalMedicalCost = medicalDetails.reduce((s, m) => s + m.totalCost, 0);

  // ── Worker payrolls ────────────────────────────────────────────────────
  const payrollAgg = await prisma.payroll.aggregate({
    where: { paymentDate: dateFilter },
    _sum: { amount: true },
  });
  const totalWorkerCost = payrollAgg._sum.amount ?? 0;

  const payrollDetails = await prisma.payroll.findMany({
    where: { paymentDate: dateFilter },
    include: { worker: true },
    orderBy: { paymentDate: 'desc' },
  });

  // ── Transport costs ────────────────────────────────────────────────────
  const transportAgg = await prisma.transportRent.aggregate({
    where: { travelDate: dateFilter },
    _sum: { cost: true },
  });
  const totalTransportCost = transportAgg._sum.cost ?? 0;

  const transportDetails = await prisma.transportRent.findMany({
    where: { travelDate: dateFilter },
    orderBy: { travelDate: 'desc' },
  });

  // ── P&L ───────────────────────────────────────────────────────────────
  const totalExpenses = totalFeedCost + totalMedicalCost + totalWorkerCost + totalTransportCost;
  const netProfit = totalRevenue - totalExpenses;

  return {
    startDate,
    endDate,
    cattle: { new: newCattle, sold: soldCattle, deceased: deceasedCattle },
    pnl: {
      totalRevenue,
      totalGrossRevenue,
      totalExpenses,
      feedCost: totalFeedCost,
      medicalCost: totalMedicalCost,
      workerCost: totalWorkerCost,
      transportCost: totalTransportCost,
      netProfit,
    },
    feed: feedDetails,
    medical: medicalDetails,
    payroll: {
      total: totalWorkerCost,
      details: payrollDetails,
    },
    transport: {
      total: totalTransportCost,
      details: transportDetails,
    },
  };
}

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

  // ── Feed PO costs ──────────────────────────────────────────────────────
  const feedOrders = await prisma.feedPurchaseOrder.findMany({
    where: { date: dateFilter },
    include: { feedItem: true },
    orderBy: { date: 'desc' },
  });
  const totalFeedCost = feedOrders.reduce((s, o) => s + (o.totalCost ?? 0), 0);

  // ── Medical PO costs ───────────────────────────────────────────────────
  const medicalOrders = await prisma.medicalPurchaseOrder.findMany({
    where: { date: dateFilter },
    include: { medicine: true },
    orderBy: { date: 'desc' },
  });
  const totalMedicalCost = medicalOrders.reduce((s, o) => s + (o.totalCost ?? 0), 0);

  // ── Equipment Maintenance costs ────────────────────────────────────────
  const maintenanceRecords = await prisma.equipmentMaintenance.findMany({
    where: { date: dateFilter },
    include: { equipment: true },
    orderBy: { date: 'desc' },
  });
  const totalMaintenanceCost = maintenanceRecords.reduce((s, m) => s + (m.cost ?? 0), 0);

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

  // ── General Expenses (المصروفات العامة) ───────────────────────────────
  const generalExpenses = await prisma.generalExpense.findMany({
    where: { date: dateFilter },
    orderBy: { date: 'desc' },
  });
  const totalGeneralExpenses = generalExpenses.reduce(
    (s, e) => s + (e.cost ?? 0), 0
  );

  // ── Deceased Livestock Loss (خسائر النافق) ────────────────────────────
  // Fetch all calves marked DECEASED within the date range, include breed
  const deceasedCattleRecords = await prisma.cattle.findMany({
    where: { status: 'DECEASED', updatedAt: dateFilter },
    include: { breed: true },
    orderBy: { updatedAt: 'desc' },
  });
  // Value = currentWeight (or entryWeight fallback) × breed.pricePerKg
  const totalDeceasedLoss = deceasedCattleRecords.reduce((s, c) => {
    const weight = c.currentWeight ?? c.entryWeight ?? 0;
    const pricePerKg = c.breed?.pricePerKg ?? 0;
    return s + weight * pricePerKg;
  }, 0);

  // ── Farm Settings (for print branding) ────────────────────────────────
  const farmSettings = await prisma.farmSettings.findUnique({ where: { id: 1 } })
    ?? { id: 1, farmName: 'مزرعتي', logoData: null };

  // ── P&L ───────────────────────────────────────────────────────────────
  const totalExpenses =
    totalFeedCost +
    totalMedicalCost +
    totalMaintenanceCost +
    totalWorkerCost +
    totalTransportCost +
    totalGeneralExpenses +
    totalDeceasedLoss;

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
      maintenanceCost: totalMaintenanceCost,
      workerCost: totalWorkerCost,
      transportCost: totalTransportCost,
      generalExpensesCost: totalGeneralExpenses,
      deceasedLoss: totalDeceasedLoss,
      netProfit,
    },
    deceasedCattleRecords,
    feedOrders,
    medicalOrders,
    maintenanceRecords,
    payroll: {
      total: totalWorkerCost,
      details: payrollDetails,
    },
    transport: {
      total: totalTransportCost,
      details: transportDetails,
    },
    generalExpenses,
    farmSettings,
  };
}

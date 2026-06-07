/**
 * DC Payroll — PDF & Excel/CSV export utilities.
 *
 * Pure functions that take pre-computed payroll data and produce:
 *   - Branded per-employee PDF payslips (single + bulk zip-less batch)
 *   - Excel workbook with Summary + Per-Employee + MRA breakdown sheets
 *   - Rich CSV (same data, single sheet)
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import logoUrl from "@/assets/dc-payroll-logo.png";
import type { PayrollResult } from "./calc";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export interface CompanyInfo {
  name: string;
  address?: string | null;
  city?: string | null;
  brn?: string | null;
  ern?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface EmployeeInfo {
  first_name: string;
  last_name: string;
  nic?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
  employment_date?: string | null;
}

export interface PayslipPayload {
  company: CompanyInfo;
  employee: EmployeeInfo;
  month: number;
  year: number;
  result: PayrollResult;
}

const fmt = (n: number) =>
  `MUR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Logo loading (cached) ─────────────────────────────────────────────────────
let cachedLogoData: string | null = null;
async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogoData) return cachedLogoData;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        cachedLogoData = String(fr.result);
        resolve(cachedLogoData);
      };
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF — single payslip
// ─────────────────────────────────────────────────────────────────────────────

async function drawPayslip(doc: jsPDF, p: PayslipPayload) {
  const pageW = doc.internal.pageSize.getWidth();
  const M = 14;
  const period = `${months[p.month - 1]} ${p.year}`;

  // ── Header band (black with gold accent) ────────────────────────────
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(0, 38, pageW, 38);

  const logoData = await loadLogoDataUrl();
  if (logoData) {
    try { doc.addImage(logoData, "PNG", M, 6, 26, 26); } catch { /* ignore */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(p.company.name || "Company", M + 32, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  const sub = [p.company.address, p.company.city].filter(Boolean).join(", ");
  if (sub) doc.text(sub, M + 32, 24);
  const reg = [
    p.company.brn ? `BRN: ${p.company.brn}` : null,
    p.company.ern ? `ERN: ${p.company.ern}` : null,
  ].filter(Boolean).join("   ");
  if (reg) doc.text(reg, M + 32, 29);

  // Right side — payslip label
  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAYSLIP", pageW - M, 16, { align: "right" });
  doc.setTextColor(220, 220, 220);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(period.toUpperCase(), pageW - M, 22, { align: "right" });
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text(`Issued: ${new Date().toLocaleDateString("en-GB")}`, pageW - M, 28, { align: "right" });

  // ── Employee info block ─────────────────────────────────────────────
  let y = 48;
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("EMPLOYEE", M, y);
  doc.text("PAY PERIOD", pageW / 2, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.text(`${p.employee.first_name} ${p.employee.last_name}`, M, y + 6);
  doc.text(period, pageW / 2, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const empMeta = [
    p.employee.nic ? `NIC: ${p.employee.nic}` : null,
    p.employee.bank_name && p.employee.bank_account
      ? `${p.employee.bank_name} • ${p.employee.bank_account}`
      : null,
  ].filter(Boolean);
  empMeta.forEach((m, i) => doc.text(m!, M, y + 12 + i * 4));

  // ── Earnings table ───────────────────────────────────────────────────
  const r = p.result;
  const earnings: [string, string][] = [
    ["Basic Salary", fmt(r.basicSalary)],
    ...r.additions.map(a => [a.name, fmt(a.amount)] as [string, string]),
  ];
  if (r.unpaidLeaveDeduction > 0) {
    earnings.push([`Unpaid leave (already deducted)`, `− ${fmt(r.unpaidLeaveDeduction)}`]);
  }

  autoTable(doc, {
    startY: y + 24,
    head: [["EARNINGS", "AMOUNT"]],
    body: earnings,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20], textColor: [212, 175, 55], fontStyle: "bold", fontSize: 9, cellPadding: 3 },
    bodyStyles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
    columnStyles: { 1: { halign: "right", cellWidth: 50 } },
    margin: { left: M, right: pageW / 2 + 4 },
    tableWidth: pageW / 2 - M - 4,
  });

  // ── Deductions table ─────────────────────────────────────────────────
  const deductions: [string, string][] = [];
  if (r.paye > 0) deductions.push(["PAYE (Income Tax)", fmt(r.paye)]);
  if (r.csgEmployee > 0) deductions.push(["CSG (employee)", fmt(r.csgEmployee)]);
  if (r.nsfEmployee > 0) deductions.push(["NSF (employee)", fmt(r.nsfEmployee)]);
  if (r.prgfEmployee > 0) deductions.push(["PRGF (employee)", fmt(r.prgfEmployee)]);
  r.customDeductions.forEach(d => deductions.push([d.name, fmt(d.amount)]));
  if (deductions.length === 0) deductions.push(["—", "MUR 0.00"]);

  autoTable(doc, {
    startY: y + 24,
    head: [["DEDUCTIONS", "AMOUNT"]],
    body: deductions,
    theme: "grid",
    headStyles: { fillColor: [20, 20, 20], textColor: [212, 175, 55], fontStyle: "bold", fontSize: 9, cellPadding: 3 },
    bodyStyles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
    columnStyles: { 1: { halign: "right", cellWidth: 50 } },
    margin: { left: pageW / 2 + 4, right: M },
    tableWidth: pageW / 2 - M - 4,
  });

  const lastY = (doc as any).lastAutoTable.finalY;

  // ── Totals row (Gross / Deductions / Net) ────────────────────────────
  autoTable(doc, {
    startY: lastY + 8,
    body: [[
      { content: "GROSS PAY", styles: { fontStyle: "bold", textColor: [80, 80, 80] } },
      { content: fmt(r.grossPay), styles: { halign: "right", fontStyle: "bold" } },
      { content: "TOTAL DEDUCTIONS", styles: { fontStyle: "bold", textColor: [80, 80, 80] } },
      { content: fmt(r.totalEmployeeDeductions), styles: { halign: "right", fontStyle: "bold", textColor: [180, 40, 40] } },
    ]],
    theme: "plain",
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    margin: { left: M, right: M },
  });

  const netY = (doc as any).lastAutoTable.finalY + 4;
  doc.setFillColor(212, 175, 55);
  doc.roundedRect(M, netY, pageW - 2 * M, 16, 2, 2, "F");
  doc.setTextColor(10, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NET PAY", M + 4, netY + 10);
  doc.setFontSize(14);
  doc.text(fmt(r.netPay), pageW - M - 4, netY + 11, { align: "right" });

  // ── Employer contributions (informational) ───────────────────────────
  const employerY = netY + 24;
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("EMPLOYER CONTRIBUTIONS (NOT DEDUCTED FROM EMPLOYEE)", M, employerY);

  autoTable(doc, {
    startY: employerY + 2,
    head: [["Item", "Amount"]],
    body: [
      ["CSG (employer)", fmt(r.csgEmployer)],
      ["NSF (employer)", fmt(r.nsfEmployer)],
      ["HRDC Training Levy", fmt(r.trainingLevyEmployer)],
      [{ content: "Total Employer Cost", styles: { fontStyle: "bold" } }, { content: fmt(r.employerCost), styles: { halign: "right", fontStyle: "bold" } }],
    ],
    theme: "striped",
    headStyles: { fillColor: [240, 240, 240], textColor: [60, 60, 60], fontSize: 8, cellPadding: 2 },
    bodyStyles: { fontSize: 8, cellPadding: 2, textColor: [60, 60, 60] },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: M, right: M },
  });

  // ── Footer ───────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 220, 220);
  doc.line(M, pageH - 18, pageW - M, pageH - 18);
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "This payslip is system-generated and does not require a signature. Calculations use Mauritian PAYE / CSG / NSF / HRDC rules.",
    pageW / 2, pageH - 12, { align: "center" },
  );
  doc.setTextColor(120, 120, 120);
  doc.text(`DC Payroll  •  Powered by MB18 Solutions`, pageW / 2, pageH - 7, { align: "center" });
}

export async function generatePayslipPDF(p: PayslipPayload) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await drawPayslip(doc, p);
  const safe = `${p.employee.last_name}-${p.employee.first_name}`.replace(/\s+/g, "_");
  doc.save(`Payslip_${safe}_${p.year}-${String(p.month).padStart(2, "0")}.pdf`);
}

/** Generate a single PDF containing all employees' payslips (one per page). */
export async function generateBulkPayslipPDF(items: PayslipPayload[]) {
  if (items.length === 0) return;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  for (let i = 0; i < items.length; i++) {
    if (i > 0) doc.addPage();
    await drawPayslip(doc, items[i]);
  }
  const first = items[0];
  doc.save(`Payslips_${first.year}-${String(first.month).padStart(2, "0")}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Excel — multi-sheet workbook
// ─────────────────────────────────────────────────────────────────────────────

export interface PayrollExportRow {
  employee: string;
  nic?: string | null;
  basic: number;
  unpaidLeaveDays: number;
  overtime: number;
  bonus: number;
  gross: number;
  paye: number;
  csgEmployee: number;
  nsfEmployee: number;
  loan: number;
  totalDeductions: number;
  netPay: number;
  csgEmployer: number;
  nsfEmployer: number;
  trainingLevy: number;
  employerCost: number;
}

export interface PayrollExportPayload {
  company: CompanyInfo;
  month: number;
  year: number;
  rows: PayrollExportRow[];
}

export function generatePayrollExcel(p: PayrollExportPayload) {
  const period = `${months[p.month - 1]} ${p.year}`;
  const wb = XLSX.utils.book_new();

  // Sheet 1 — Per-employee detail
  const detail = p.rows.map(r => ({
    Employee: r.employee,
    NIC: r.nic ?? "",
    "Basic (MUR)": r.basic,
    "Unpaid Days": r.unpaidLeaveDays,
    "Overtime (MUR)": r.overtime,
    "Bonus (MUR)": r.bonus,
    "Gross (MUR)": r.gross,
    "PAYE (MUR)": r.paye,
    "CSG Emp (MUR)": r.csgEmployee,
    "NSF Emp (MUR)": r.nsfEmployee,
    "Loan/Advance (MUR)": r.loan,
    "Total Deductions (MUR)": r.totalDeductions,
    "Net Pay (MUR)": r.netPay,
  }));
  const ws1 = XLSX.utils.json_to_sheet(detail);
  ws1["!cols"] = [
    { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Payroll Detail");

  // Sheet 2 — Summary totals
  const totals = p.rows.reduce(
    (a, r) => ({
      gross: a.gross + r.gross,
      deductions: a.deductions + r.totalDeductions,
      net: a.net + r.netPay,
      employerCost: a.employerCost + r.employerCost,
      paye: a.paye + r.paye,
      csg: a.csg + r.csgEmployee + r.csgEmployer,
      nsf: a.nsf + r.nsfEmployee + r.nsfEmployer,
      training: a.training + r.trainingLevy,
    }),
    { gross: 0, deductions: 0, net: 0, employerCost: 0, paye: 0, csg: 0, nsf: 0, training: 0 },
  );

  const summary = [
    ["Company", p.company.name],
    ["Period", period],
    ["BRN", p.company.brn ?? ""],
    ["ERN", p.company.ern ?? ""],
    ["Employees", p.rows.length],
    [],
    ["Total Gross", totals.gross],
    ["Total Deductions", totals.deductions],
    ["Total Net", totals.net],
    ["Total Employer Cost", totals.employerCost],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(summary);
  ws2["!cols"] = [{ wch: 24 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  // Sheet 3 — MRA breakdown (statutory contributions)
  const mra = [
    ["Contribution", "Amount (MUR)"],
    ["PAYE (employees)", totals.paye],
    ["CSG (employee + employer)", totals.csg],
    ["NSF (employee + employer)", totals.nsf],
    ["HRDC Training Levy", totals.training],
    [],
    ["Total payable to MRA", totals.paye + totals.csg + totals.nsf + totals.training],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(mra);
  ws3["!cols"] = [{ wch: 32 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws3, "MRA Breakdown");

  XLSX.writeFile(wb, `Payroll_${p.year}-${String(p.month).padStart(2, "0")}.xlsx`);
}

/** Rich CSV (single sheet, same columns as detail). */
export function generatePayrollCSV(p: PayrollExportPayload) {
  const header = [
    "Employee","NIC","Basic","Unpaid Days","Overtime","Bonus",
    "Gross","PAYE","CSG (emp)","NSF (emp)","Loan","Total Deductions","Net Pay",
  ];
  const lines = p.rows.map(r => [
    `"${r.employee.replace(/"/g, '""')}"`,
    `"${r.nic ?? ""}"`,
    r.basic, r.unpaidLeaveDays, r.overtime, r.bonus,
    r.gross, r.paye, r.csgEmployee, r.nsfEmployee, r.loan,
    r.totalDeductions, r.netPay,
  ].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Payroll_${p.year}-${String(p.month).padStart(2, "0")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

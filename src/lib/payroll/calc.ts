/**
 * DC Payroll — Centralized Mauritian Payroll Calculation Engine
 *
 * All monetary calculations for monthly payroll. Pure functions, fully
 * unit-testable. Rates kept in `RATES` so they can be tuned for future
 * fiscal years without touching the calling code.
 *
 * Sources (Mauritius, FY 2024–2025 baseline — verify yearly):
 *  - PAYE: progressive bands per Income Tax Act
 *  - CSG (Contribution Sociale Généralisée): replaces NPF since Sept 2020
 *  - NSF (National Savings Fund): 2.5% employee + 2.5% employer (capped)
 *  - Training Levy (HRDC): 1.5% of wage bill (employer only)
 *
 * IMPORTANT: These figures are the platform default. Each company can
 * override via payroll_components (additions / deductions / taxability).
 */

export interface PayrollInput {
  /** Monthly basic salary (MUR) */
  basicSalary: number;
  /** Number of standard working days in the month (typically 22 or 26) */
  workingDaysInMonth?: number;
  /** Days the employee was on unpaid leave in this period */
  unpaidLeaveDays?: number;
  /** Overtime worked at 1.5x (weekday beyond standard hours) */
  overtimeHours1_5x?: number;
  /** Overtime worked at 2x (Sundays / public holidays) */
  overtimeHours2x?: number;
  /** Standard hours per week (used to derive hourly rate) */
  standardHoursPerWeek?: number;
  /** Custom additions (allowances, bonuses, commissions). */
  additions?: PayrollComponent[];
  /** Custom deductions (loan, advance, etc.) excluding statutory ones. */
  deductions?: PayrollComponent[];
  /** Whether the employee is exempt from PAYE (e.g. earns below threshold). Auto-detected if undefined. */
  payeExempt?: boolean;
}

export interface PayrollComponent {
  name: string;
  /** If true, value is a % of basic salary, else absolute MUR. */
  isPercentage?: boolean;
  /** Absolute MUR amount, or % (e.g. 10 = 10%). */
  amount: number;
  /** Whether this addition is taxable (counts toward PAYE chargeable income). */
  taxable?: boolean;
  /** Whether this addition counts toward CSG/NSF wage bill. */
  inWageBill?: boolean;
}

export interface PayrollLineItem {
  name: string;
  amount: number;
}

export interface PayrollResult {
  basicSalary: number;
  unpaidLeaveDeduction: number;
  overtimePay: number;
  additions: PayrollLineItem[];
  totalAdditions: number;
  grossPay: number;
  taxableIncome: number;
  wageBill: number;
  paye: number;
  csgEmployee: number;
  csgEmployer: number;
  nsfEmployee: number;
  nsfEmployer: number;
  prgfEmployee: number;
  prgfEmployer: number;
  trainingLevyEmployer: number;
  customDeductions: PayrollLineItem[];
  totalCustomDeductions: number;
  totalEmployeeDeductions: number;
  employerCost: number;
  netPay: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate tables (DC Payroll — flat-rate Mauritius scheme)
// ─────────────────────────────────────────────────────────────────────────────

export const RATES = {
  // PAYE — flat 15% above Rs 390,000/yr exemption (≈ Rs 32,500/mo)
  paye: {
    annualExempt: 390_000,
    flatRate: 0.15,
    monthlyExemptThreshold: 32_500,
    annualBands: [
      { upTo: 390_000, rate: 0 },
      { upTo: Infinity, rate: 0.15 },
    ],
  },

  // CSG — 1.5% employee / 3% employer (flat)
  csg: {
    threshold: Infinity,
    lowEmployee: 0.015,
    lowEmployer: 0.03,
    highEmployee: 0.015,
    highEmployer: 0.03,
  },

  // NSF — 1.5% each, capped so monthly contribution maxes at Rs 375
  nsf: {
    employee: 0.015,
    employer: 0.015,
    monthlyCap: 25_000,
  },

  // PRGF — Portable Retirement Gratuity Fund
  prgf: {
    employee: 0.03,
    employer: 0.06,
  },

  // Training Levy (HRDC) — employer only
  trainingLevy: {
    employer: 0.015,
  },

  defaults: {
    workingDaysInMonth: 22,
    standardHoursPerWeek: 45,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Round to 2 decimals using banker's-safe arithmetic (×100 then round). */
export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const componentValue = (basic: number, c: PayrollComponent): number =>
  c.isPercentage ? round2((basic * c.amount) / 100) : round2(c.amount);

/**
 * Compute monthly PAYE from monthly chargeable income, using the
 * progressive annual bands (annualised → tax → /12).
 */
export function calculatePAYE(monthlyChargeable: number): number {
  if (monthlyChargeable <= 0) return 0;
  const annual = monthlyChargeable * 12;
  let tax = 0;
  let prevCap = 0;
  for (const band of RATES.paye.annualBands) {
    if (annual <= prevCap) break;
    const slice = Math.min(annual, band.upTo) - prevCap;
    if (slice > 0) tax += slice * band.rate;
    prevCap = band.upTo;
    if (annual <= band.upTo) break;
  }
  return round2(tax / 12);
}

/** Compute CSG (returns both sides of the contribution). */
export function calculateCSG(monthlyWageBill: number): { employee: number; employer: number } {
  if (monthlyWageBill <= 0) return { employee: 0, employer: 0 };
  const isLow = monthlyWageBill <= RATES.csg.threshold;
  const empRate = isLow ? RATES.csg.lowEmployee : RATES.csg.highEmployee;
  const erRate = isLow ? RATES.csg.lowEmployer : RATES.csg.highEmployer;
  return {
    employee: round2(monthlyWageBill * empRate),
    employer: round2(monthlyWageBill * erRate),
  };
}

/** Compute NSF (capped). */
export function calculateNSF(monthlyWageBill: number): { employee: number; employer: number } {
  const insurable = Math.min(monthlyWageBill, RATES.nsf.monthlyCap);
  if (insurable <= 0) return { employee: 0, employer: 0 };
  return {
    employee: round2(insurable * RATES.nsf.employee),
    employer: round2(insurable * RATES.nsf.employer),
  };
}

/** Compute Training Levy (employer only). */
export function calculateTrainingLevy(monthlyWageBill: number): number {
  if (monthlyWageBill <= 0) return 0;
  return round2(monthlyWageBill * RATES.trainingLevy.employer);
}

/**
 * Compute overtime pay.
 *  - 1.5× → weekday beyond standard hours
 *  - 2.0× → Sunday / public holiday
 *
 * Hourly rate is derived from monthly basic:
 *   monthly basic ÷ ((standardHoursPerWeek × 52) / 12)
 */
export function calculateOvertimePay(
  basicSalary: number,
  hours1_5x: number,
  hours2x: number,
  standardHoursPerWeek: number = RATES.defaults.standardHoursPerWeek,
): number {
  if (basicSalary <= 0) return 0;
  const monthlyHours = (standardHoursPerWeek * 52) / 12;
  if (monthlyHours <= 0) return 0;
  const hourly = basicSalary / monthlyHours;
  const pay = hourly * 1.5 * hours1_5x + hourly * 2 * hours2x;
  return round2(pay);
}

/** Pro-rated unpaid leave deduction. */
export function calculateUnpaidLeaveDeduction(
  basicSalary: number,
  unpaidLeaveDays: number,
  workingDaysInMonth: number = RATES.defaults.workingDaysInMonth,
): number {
  if (unpaidLeaveDays <= 0 || basicSalary <= 0 || workingDaysInMonth <= 0) return 0;
  return round2((basicSalary / workingDaysInMonth) * unpaidLeaveDays);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const basic = Math.max(0, input.basicSalary || 0);
  const workingDays = input.workingDaysInMonth ?? RATES.defaults.workingDaysInMonth;
  const stdHours = input.standardHoursPerWeek ?? RATES.defaults.standardHoursPerWeek;

  // 1. Unpaid leave deduction (reduces basic)
  const unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(basic, input.unpaidLeaveDays ?? 0, workingDays);
  const adjustedBasic = round2(basic - unpaidLeaveDeduction);

  // 2. Overtime
  const overtimePay = calculateOvertimePay(
    basic,
    input.overtimeHours1_5x ?? 0,
    input.overtimeHours2x ?? 0,
    stdHours,
  );

  // 3. Additions (allowances, bonuses, commissions)
  const additionsList: PayrollLineItem[] = [];
  let totalAdditions = 0;
  let taxableAdditionsTotal = 0;
  let wageBillAdditionsTotal = 0;

  if (overtimePay > 0) {
    additionsList.push({ name: "Overtime", amount: overtimePay });
    totalAdditions += overtimePay;
    taxableAdditionsTotal += overtimePay;
    wageBillAdditionsTotal += overtimePay;
  }

  for (const c of input.additions ?? []) {
    const v = componentValue(basic, c);
    if (v <= 0) continue;
    additionsList.push({ name: c.name, amount: v });
    totalAdditions += v;
    if (c.taxable !== false) taxableAdditionsTotal += v;
    if (c.inWageBill !== false) wageBillAdditionsTotal += v;
  }

  // 4. Gross pay (what the employee notionally earned this month)
  const grossPay = round2(adjustedBasic + totalAdditions);

  // 5. Statutory bases
  const taxableIncome = round2(adjustedBasic + taxableAdditionsTotal);
  const wageBill = round2(adjustedBasic + wageBillAdditionsTotal);

  // 6. Statutory deductions
  const isExempt = input.payeExempt ?? basic < RATES.paye.monthlyExemptThreshold;
  const paye = isExempt ? 0 : calculatePAYE(taxableIncome);
  const csg = calculateCSG(wageBill);
  const nsf = calculateNSF(wageBill);
  const trainingLevy = calculateTrainingLevy(wageBill);
  const prgfEmployee = round2(wageBill * RATES.prgf.employee);
  const prgfEmployer = round2(wageBill * RATES.prgf.employer);

  // 7. Custom deductions
  const customDeductionsList: PayrollLineItem[] = [];
  let totalCustomDeductions = 0;
  for (const c of input.deductions ?? []) {
    const v = componentValue(basic, c);
    if (v <= 0) continue;
    customDeductionsList.push({ name: c.name, amount: v });
    totalCustomDeductions += v;
  }

  // 8. Totals
  const totalEmployeeDeductions = round2(
    paye + csg.employee + nsf.employee + prgfEmployee + totalCustomDeductions
  );
  const netPay = round2(grossPay - totalEmployeeDeductions);
  const employerCost = round2(
    grossPay + csg.employer + nsf.employer + prgfEmployer + trainingLevy
  );

  return {
    basicSalary: adjustedBasic,
    unpaidLeaveDeduction,
    overtimePay,
    additions: additionsList,
    totalAdditions: round2(totalAdditions),
    grossPay,
    taxableIncome,
    wageBill,
    paye,
    csgEmployee: csg.employee,
    csgEmployer: csg.employer,
    nsfEmployee: nsf.employee,
    nsfEmployer: nsf.employer,
    prgfEmployee,
    prgfEmployer,
    trainingLevyEmployer: trainingLevy,
    customDeductions: customDeductionsList,
    totalCustomDeductions: round2(totalCustomDeductions),
    totalEmployeeDeductions,
    employerCost,
    netPay,
  };
}

/** Aggregate multiple PayrollResults into file-level totals. */
export function aggregatePayrollTotals(results: PayrollResult[]) {
  return results.reduce(
    (acc, r) => ({
      totalGross: round2(acc.totalGross + r.grossPay),
      totalDeductions: round2(acc.totalDeductions + r.totalEmployeeDeductions),
      totalNet: round2(acc.totalNet + r.netPay),
      totalEmployerCost: round2(acc.totalEmployerCost + r.employerCost),
      totalPAYE: round2(acc.totalPAYE + r.paye),
      totalCSG: round2(acc.totalCSG + r.csgEmployee + r.csgEmployer),
      totalNSF: round2(acc.totalNSF + r.nsfEmployee + r.nsfEmployer),
      totalTrainingLevy: round2(acc.totalTrainingLevy + r.trainingLevyEmployer),
    }),
    {
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalEmployerCost: 0,
      totalPAYE: 0,
      totalCSG: 0,
      totalNSF: 0,
      totalTrainingLevy: 0,
    },
  );
}

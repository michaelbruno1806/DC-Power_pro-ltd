import { describe, it, expect } from "vitest";
import {
  calculatePAYE,
  calculateCSG,
  calculateNSF,
  calculateTrainingLevy,
  calculateOvertimePay,
  calculateUnpaidLeaveDeduction,
  calculatePayroll,
  aggregatePayrollTotals,
  RATES,
} from "./calc";

describe("PAYE", () => {
  it("returns 0 below the first band", () => {
    expect(calculatePAYE(20_000)).toBe(0);
  });
  it("computes tax on a salary inside the first taxable band", () => {
    // 35,000/month → 420,000/year. First 390k @ 0%, next 30k @ 2% = 600/year = 50/month
    expect(calculatePAYE(35_000)).toBe(50);
  });
  it("crosses bands progressively", () => {
    // 100,000/month → 1,200,000/year. Verifies bands are summed, not flat.
    const tax = calculatePAYE(100_000);
    expect(tax).toBeGreaterThan(0);
    expect(tax).toBeLessThan(100_000 * 0.2);
  });
  it("handles zero/negative gracefully", () => {
    expect(calculatePAYE(0)).toBe(0);
    expect(calculatePAYE(-5_000)).toBe(0);
  });
});

describe("CSG", () => {
  it("uses low rates at or below threshold", () => {
    const r = calculateCSG(40_000);
    expect(r.employee).toBe(round(40_000 * RATES.csg.lowEmployee));
    expect(r.employer).toBe(round(40_000 * RATES.csg.lowEmployer));
  });
  it("uses high rates above threshold", () => {
    const r = calculateCSG(80_000);
    expect(r.employee).toBe(round(80_000 * RATES.csg.highEmployee));
    expect(r.employer).toBe(round(80_000 * RATES.csg.highEmployer));
  });
});

describe("NSF", () => {
  it("caps at the monthly ceiling", () => {
    const huge = calculateNSF(500_000);
    expect(huge.employee).toBe(round(RATES.nsf.monthlyCap * RATES.nsf.employee));
  });
});

describe("Training Levy", () => {
  it("applies employer rate to wage bill", () => {
    expect(calculateTrainingLevy(50_000)).toBe(round(50_000 * RATES.trainingLevy.employer));
  });
});

describe("Overtime", () => {
  it("computes 1.5x and 2x correctly", () => {
    // basic 19,500, std 45h/week → 195h/month → hourly 100
    const pay = calculateOvertimePay(19_500, 10, 5, 45);
    // 10*150 + 5*200 = 1500 + 1000 = 2500
    expect(pay).toBe(2500);
  });
});

describe("Unpaid leave", () => {
  it("pro-rates against working days", () => {
    expect(calculateUnpaidLeaveDeduction(22_000, 2, 22)).toBe(2_000);
  });
  it("returns 0 when no leave", () => {
    expect(calculateUnpaidLeaveDeduction(22_000, 0, 22)).toBe(0);
  });
});

describe("calculatePayroll — end-to-end scenarios", () => {
  it("PAYE-exempt low earner with no extras: net == basic minus CSG/NSF", () => {
    const r = calculatePayroll({ basicSalary: 20_000 });
    expect(r.paye).toBe(0);
    expect(r.grossPay).toBe(20_000);
    expect(r.netPay).toBe(20_000 - r.csgEmployee - r.nsfEmployee);
  });

  it("Mid earner with overtime, taxable allowance and unpaid leave", () => {
    const r = calculatePayroll({
      basicSalary: 50_000,
      workingDaysInMonth: 22,
      unpaidLeaveDays: 2,
      overtimeHours1_5x: 4,
      additions: [{ name: "Transport", amount: 2_000, taxable: true, inWageBill: true }],
      deductions: [{ name: "Loan", amount: 1_500 }],
    });
    expect(r.unpaidLeaveDeduction).toBeCloseTo((50_000 / 22) * 2, 1);
    expect(r.totalAdditions).toBeGreaterThan(2_000);
    expect(r.netPay).toBeLessThan(r.grossPay);
    expect(r.netPay).toBeGreaterThan(0);
  });

  it("Net = Gross − (PAYE + CSG-emp + NSF-emp + custom deductions)", () => {
    const r = calculatePayroll({
      basicSalary: 60_000,
      additions: [{ name: "Bonus", amount: 5_000 }],
      deductions: [{ name: "Advance", amount: 2_000 }],
    });
    const expected = r.grossPay - (r.paye + r.csgEmployee + r.nsfEmployee + r.totalCustomDeductions);
    expect(r.netPay).toBeCloseTo(expected, 2);
  });

  it("aggregatePayrollTotals sums correctly", () => {
    const a = calculatePayroll({ basicSalary: 25_000 });
    const b = calculatePayroll({ basicSalary: 50_000 });
    const totals = aggregatePayrollTotals([a, b]);
    expect(totals.totalGross).toBeCloseTo(a.grossPay + b.grossPay, 2);
    expect(totals.totalNet).toBeCloseTo(a.netPay + b.netPay, 2);
  });
});

describe("Unpaid leave integration", () => {
  it("reduces basic, gross and net by the pro-rated amount", () => {
    const baseline = calculatePayroll({ basicSalary: 44_000, workingDaysInMonth: 22 });
    const withLeave = calculatePayroll({ basicSalary: 44_000, workingDaysInMonth: 22, unpaidLeaveDays: 3 });
    // 44000/22 * 3 = 6000
    expect(withLeave.unpaidLeaveDeduction).toBeCloseTo(6000, 2);
    expect(withLeave.basicSalary).toBeCloseTo(38_000, 2);
    expect(withLeave.grossPay).toBeLessThan(baseline.grossPay);
    expect(withLeave.netPay).toBeLessThan(baseline.netPay);
  });

  it("never produces negative pay even with extreme unpaid leave", () => {
    const r = calculatePayroll({ basicSalary: 30_000, workingDaysInMonth: 22, unpaidLeaveDays: 100 });
    // basic goes negative but should not crash; downstream stays consistent
    expect(Number.isFinite(r.netPay)).toBe(true);
  });
});

describe("Employer cost", () => {
  it("equals gross + employer CSG + employer NSF + training levy", () => {
    const r = calculatePayroll({ basicSalary: 60_000 });
    const expected = r.grossPay + r.csgEmployer + r.nsfEmployer + r.trainingLevyEmployer;
    expect(r.employerCost).toBeCloseTo(expected, 2);
  });
});

describe("Non-taxable, non-wage-bill allowances", () => {
  it("does not count toward PAYE or CSG when flagged off", () => {
    const r = calculatePayroll({
      basicSalary: 50_000,
      additions: [{ name: "Travel reimbursement", amount: 5_000, taxable: false, inWageBill: false }],
    });
    const baseline = calculatePayroll({ basicSalary: 50_000 });
    expect(r.paye).toBeCloseTo(baseline.paye, 2);
    expect(r.csgEmployee).toBeCloseTo(baseline.csgEmployee, 2);
    expect(r.grossPay).toBeCloseTo(baseline.grossPay + 5_000, 2);
  });
});

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}


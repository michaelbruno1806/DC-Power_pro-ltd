/**
 * Helpers for resolving period-level payroll inputs from the database:
 * working-day config, public holidays, and unpaid-leave days per employee.
 */
import { supabase } from "@/integrations/supabase/client";

export interface PeriodConfig {
  workingDays: number;
  hoursPerWeek: number;
}

/** Get the working-day config for a given company/year/month, falling back
 * to the year default and finally to platform defaults (22 days, 45h/week). */
export async function getPeriodConfig(
  companyId: string,
  year: number,
  month: number,
): Promise<PeriodConfig> {
  const { data } = await supabase
    .from("working_day_configs")
    .select("month, working_days, hours_per_week")
    .eq("company_id", companyId)
    .eq("year", year)
    .in("month", [month, null as any]);

  const monthRow = data?.find(r => r.month === month);
  const yearRow = data?.find(r => r.month === null);
  const row = monthRow ?? yearRow;
  return {
    workingDays: row?.working_days ?? 22,
    hoursPerWeek: Number(row?.hours_per_week ?? 45),
  };
}

/** Build YYYY-MM-DD bounds for a (year, month) period. */
const periodBounds = (year: number, month: number) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const last = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(last)}`,
  };
};

/** Count overlap days between two date ranges (inclusive). */
const overlapDays = (aStart: string, aEnd: string, bStart: string, bEnd: string): number => {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (end < start) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(ms / 86_400_000) + 1;
};

/**
 * Returns a map of employee_id → unpaid-leave days for the given period.
 * Counts only **approved** leave requests whose leave_type is unpaid (is_paid = false),
 * pro-rated to the slice that actually falls in this month.
 */
export async function getUnpaidLeaveDaysByEmployee(
  companyId: string,
  year: number,
  month: number,
): Promise<Record<string, number>> {
  const { start, end } = periodBounds(year, month);

  const { data, error } = await supabase
    .from("leave_requests")
    .select("employee_id, start_date, end_date, status, leave_types ( is_paid )")
    .eq("company_id", companyId)
    .eq("status", "approved")
    .lte("start_date", end)
    .gte("end_date", start);

  if (error || !data) return {};

  const out: Record<string, number> = {};
  for (const row of data as any[]) {
    if (row.leave_types && row.leave_types.is_paid !== false) continue; // only unpaid
    const days = overlapDays(row.start_date, row.end_date, start, end);
    if (days > 0) {
      out[row.employee_id] = (out[row.employee_id] || 0) + days;
    }
  }
  return out;
}

/** Count public holidays falling inside the given period (purely informational). */
export async function getPublicHolidaysInPeriod(
  companyId: string,
  year: number,
  month: number,
): Promise<{ date: string; name: string }[]> {
  const { start, end } = periodBounds(year, month);
  const { data } = await supabase
    .from("public_holidays")
    .select("holiday_date, name")
    .eq("company_id", companyId)
    .gte("holiday_date", start)
    .lte("holiday_date", end)
    .order("holiday_date");
  return (data || []).map(h => ({ date: h.holiday_date, name: h.name }));
}

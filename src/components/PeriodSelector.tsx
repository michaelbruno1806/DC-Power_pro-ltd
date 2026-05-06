import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface PeriodSelectorProps {
  month: number;          // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
  /** Extra info shown to the right, e.g. "Deadline: 31 Mar 2026" */
  badge?: string;
}

const PeriodSelector = ({ month, year, onChange, badge }: PeriodSelectorProps) => {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };
  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const years = Array.from({ length: 7 }, (_, i) => year - 3 + i);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-secondary/40 rounded-lg p-1 border border-border/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Select value={String(month)} onValueChange={v => onChange(Number(v), year)}>
          <SelectTrigger className="h-8 w-[120px] border-0 bg-transparent text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthNames.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={v => onChange(month, Number(v))}>
          <SelectTrigger className="h-8 w-[80px] border-0 bg-transparent text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {badge && (
        <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-md border border-border/30 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {badge}
        </span>
      )}
    </div>
  );
};

export default PeriodSelector;

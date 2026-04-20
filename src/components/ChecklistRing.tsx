interface ChecklistRingProps {
  done: number;
  total: number;
  size?: number;
}

const ChecklistRing = ({ done, total, size = 130 }: ChecklistRingProps) => {
  const deg = total > 0 ? (done / total) * 360 : 0;
  const inset = size * 0.085;

  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <div
        className="rounded-full"
        style={{
          height: size,
          width: size,
          background: `conic-gradient(hsl(var(--primary)) ${deg}deg, hsl(var(--border)) ${deg}deg)`,
          boxShadow: "0 0 40px -10px hsl(var(--primary) / 0.25)",
        }}
      />
      <div
        className="absolute rounded-full bg-card border border-border"
        style={{ inset }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-semibold text-foreground leading-none">{done}<span className="text-muted-foreground text-xl">/{total}</span></div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1.5">Complete</div>
      </div>
    </div>
  );
};

export default ChecklistRing;

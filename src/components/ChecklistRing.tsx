interface ChecklistRingProps {
  done: number;
  total: number;
}

const ChecklistRing = ({ done, total }: ChecklistRingProps) => {
  const deg = (done / total) * 360;

  return (
    <div className="relative h-[120px] w-[120px]">
      <div
        className="h-[120px] w-[120px] rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${deg}deg, hsl(var(--border)) ${deg}deg)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-panel-2 border border-border" />
      <div className="absolute inset-0 flex items-center justify-center font-extrabold text-foreground">
        {done}/{total}
      </div>
      <div className="absolute -bottom-1 left-0 right-0 text-center text-[11px] text-muted-foreground">
        Complete
      </div>
    </div>
  );
};

export default ChecklistRing;

import { HardHat } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Visual indicator */}
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 animate-bounce">
          <HardHat size={48} />
        </div>
        
        {/* Main message */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Under Scheduled Maintenance
        </h1>
        
        <p className="text-muted-foreground text-base">
          Our platform is currently undergoing system optimization and upgrades to serve you better. 
          We apologize for the inconvenience and will be back shortly.
        </p>

        {/* Status indicator */}
        <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Systems updating offline</span>
        </div>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Subtle ambient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <AppSidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-[1400px] mx-auto px-8 py-10 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

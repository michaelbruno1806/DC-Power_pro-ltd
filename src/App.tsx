import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import SplashScreen from "@/components/SplashScreen";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import CompanySetup from "@/pages/CompanySetup";
import PayrollComponents from "@/pages/PayrollComponents";
import Employees from "@/pages/Employees";
import PayrollFiles from "@/pages/PayrollFiles";
import PayrollRun from "@/pages/PayrollRun";
import AdminPanel from "@/pages/AdminPanel";
import Leaves from "@/pages/Leaves";
import Holidays from "@/pages/Holidays";
import WorkingDays from "@/pages/WorkingDays";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(() => {
    // Only show splash once per browser session
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("dc_splash_seen") === "1";
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem("dc_splash_seen", "1");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/company-setup" element={<CompanySetup />} />
                <Route path="/components" element={<PayrollComponents />} />
                <Route path="/payroll" element={<PayrollFiles />} />
                <Route path="/payroll/:id" element={<PayrollRun />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/payslips" element={<PlaceholderPage />} />
                <Route path="/checklist" element={<PlaceholderPage />} />
                <Route path="/mra-filings" element={<PlaceholderPage />} />
                <Route path="/leaves" element={<Leaves />} />
                <Route path="/working-days" element={<WorkingDays />} />
                <Route path="/holidays" element={<Holidays />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

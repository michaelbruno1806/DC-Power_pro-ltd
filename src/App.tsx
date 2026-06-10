import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import SplashScreen from "@/components/SplashScreen";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Onboarding from "@/pages/Onboarding";
import Pricing from "@/pages/Pricing";
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
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
import EmployeePortal from "@/pages/EmployeePortal";
import Payslips from "@/pages/Payslips";
import Checklist from "@/pages/Checklist";
import MraFilings from "@/pages/MraFilings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("dc_splash_seen") === "1";
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem("dc_splash_seen", "1");
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public marketing routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/landing" element={<Navigate to="/" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/verify-email"
                  element={
                    <ProtectedRoute allowUnverified allowSetup>
                      <VerifyEmail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute allowSetup>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route path="/my-portal" element={<ProtectedRoute><EmployeePortal /></ProtectedRoute>} />

                {/* Protected admin routes */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/company-setup" element={<CompanySetup />} />
                  <Route path="/components" element={<PayrollComponents />} />
                  <Route path="/payroll" element={<PayrollFiles />} />
                  <Route path="/payroll/:id" element={<PayrollRun />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/payslips" element={<Payslips />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/mra-filings" element={<MraFilings />} />
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
    </ThemeProvider>
  );
};

export default App;

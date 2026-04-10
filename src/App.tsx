import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import CompanySetup from "@/pages/CompanySetup";
import PayrollComponents from "@/pages/PayrollComponents";
import Employees from "@/pages/Employees";
import PayrollFiles from "@/pages/PayrollFiles";
import AdminPanel from "@/pages/AdminPanel";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/company-setup" element={<CompanySetup />} />
              <Route path="/components" element={<PayrollComponents />} />
              <Route path="/payroll" element={<PayrollFiles />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/payslips" element={<PlaceholderPage />} />
              <Route path="/checklist" element={<PlaceholderPage />} />
              <Route path="/mra-filings" element={<PlaceholderPage />} />
              <Route path="/leaves" element={<PlaceholderPage />} />
              <Route path="/working-days" element={<PlaceholderPage />} />
              <Route path="/holidays" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

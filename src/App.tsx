import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CompanySetup from "@/pages/CompanySetup";
import PayrollComponents from "@/pages/PayrollComponents";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/company-setup" element={<CompanySetup />} />
            <Route path="/components" element={<PayrollComponents />} />
            <Route path="/payroll" element={<PlaceholderPage />} />
            <Route path="/payslips" element={<PlaceholderPage />} />
            <Route path="/checklist" element={<PlaceholderPage />} />
            <Route path="/mra-filings" element={<PlaceholderPage />} />
            <Route path="/employees" element={<PlaceholderPage />} />
            <Route path="/leaves" element={<PlaceholderPage />} />
            <Route path="/working-days" element={<PlaceholderPage />} />
            <Route path="/holidays" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

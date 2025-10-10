import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Pregnancy from "./pages/Pregnancy";
import Periods from "./pages/Periods";
import MentalHealth from "./pages/MentalHealth";
import Caretaker from "./pages/Caretaker";
import Wearable from "./pages/Wearable";
import FoodAnalyzer from "./pages/FoodAnalyzer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pregnancy" element={<Pregnancy />} />
          <Route path="/periods" element={<Periods />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/caretaker" element={<Caretaker />} />
          <Route path="/wearable" element={<Wearable />} />
          <Route path="/food-analyzer" element={<FoodAnalyzer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

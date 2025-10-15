import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PregnancyCare from "./pages/PregnancyCare";
import PeriodTracking from "./pages/PeriodTracking";
import MentalWellness from "./pages/MentalWellness";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";
import TherapistSupport from "./pages/TherapistSupport";
import BookingPage from "./pages/BookingPage";
import FindProfessional from "./pages/FindProfessional";
import WearableConnect from "./pages/wearable-connect";  // 👈 fixed import name

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/pregnancy-care" element={<RequireAuth><PregnancyCare /></RequireAuth>} />
      <Route path="/period-tracking" element={<RequireAuth><PeriodTracking /></RequireAuth>} />
      <Route path="/mental-wellness" element={<RequireAuth><MentalWellness /></RequireAuth>} />
      <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
      <Route path="/therapist-support" element={<RequireAuth><TherapistSupport /></RequireAuth>} />
      <Route path="/booking" element={<RequireAuth><BookingPage /></RequireAuth>} />
      <Route path="/find/:type" element={<RequireAuth><FindProfessional /></RequireAuth>} />
      <Route path="/wearable-connect" element={<RequireAuth><WearableConnect /></RequireAuth>} /> {/* ✅ fixed */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;

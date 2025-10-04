import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { RequireAuth } from "./components/RequireAuth";

// ✅ Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PregnancyCare = lazy(() => import("./pages/PregnancyCare"));
const PeriodTracking = lazy(() => import("./pages/PeriodTracking"));
const MentalWellness = lazy(() => import("./pages/MentalWellness"));
const Report = lazy(() => import("./pages/Report"));
const TherapistSupport = lazy(() => import("./pages/TherapistSupport"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const FindProfessional = lazy(() => import("./pages/FindProfessional"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <>
    <Toaster />
    <Sonner />
    {/* Suspense ensures lazy pages show a fallback while loading */}
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-lg text-gray-500">Loading...</div>}>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

export default App;

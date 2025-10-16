import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SOSModal from "@/components/SOSModal";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "See you soon!" });
      navigate("/");
    } catch (error: any) {
      toast({ 
        title: "Logout failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleSOSClick = () => {
    setIsSOSModalOpen(true);
  };

  const handleCloseSOSModal = () => {
    setIsSOSModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8">
      {isSOSModalOpen && (
        <SOSModal isOpen={isSOSModalOpen} onClose={handleCloseSOSModal} />
      )}
      <div className="container mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl">💖</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                SheCares Dashboard
              </h1>
              <p className="text-gray-600 mt-1 font-medium">Welcome, {user?.displayName || 'User'} ✨</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button 
                variant="outline" 
                className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-pink-300 font-semibold"
              >
                Back
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/Help")}
              className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-pink-300 font-semibold"
            >
              Help
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-pink-300 font-semibold"
            >
              Logout
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-700">
          <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-red-500 to-pink-600 border-0 shadow-2xl hover:shadow-red-500/50 transition-all duration-500 hover:scale-[1.02] transform cursor-pointer group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center space-x-3 text-white text-2xl">
                <span className="text-4xl animate-pulse">🆘</span>
                <span className="font-bold">Emergency SOS</span>
              </CardTitle>
              <CardDescription className="text-red-100 text-base">Immediately alert your emergency contacts and share your live location.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button 
                variant="secondary" 
                className="w-full bg-white text-red-600 hover:bg-red-50 font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform" 
                onClick={handleSOSClick}
              >
                Activate SOS
              </Button>
            </CardContent>
          </Card>

          <Link to="/pregnancy-care" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-pink-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">👶</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Pregnancy Care</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Due date calculator, tips, and PregBot</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Track your pregnancy journey with personalized guidance and support
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/period-tracking" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-purple-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🩸</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Period Tracking</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Cycle tracking and mood support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Predict cycles, get personalized tips, and connect with specialists
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/mental-wellness" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-blue-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🧠</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Mental Wellness</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Smart routing and therapist support</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Get personalized mental health guidance and professional support
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/wearable-connect" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-green-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">⌚</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Wearable Connect</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Sync devices and track vitals</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Connect your smartwatch and fitness trackers for real-time health monitoring
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/caretaker-help" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-amber-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🤝</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Caretaker Help</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Connect with professional caregivers</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Find trusted caretakers and support services for you and your loved ones
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/FoodAnalyser" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-emerald-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🍎</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Food Analyzer</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Nutrition tracking and meal planning</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Analyze your meals, track nutrition, and get personalized diet recommendations
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
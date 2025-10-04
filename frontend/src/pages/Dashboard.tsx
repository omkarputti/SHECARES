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
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold text-xl">❤️</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {isSOSModalOpen && (
        <SOSModal isOpen={isSOSModalOpen} onClose={handleCloseSOSModal} />
      )}
      <div className="container mx-auto max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SheCares Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome back, {user.displayName || 'User'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-elegant transition-shadow cursor-pointer md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🆘</span>
                <span>Emergency SOS</span>
              </CardTitle>
              <CardDescription>Immediately alert your emergency contacts and share your live location.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" onClick={handleSOSClick}>
                Activate SOS
              </Button>
            </CardContent>
          </Card>

          <Link to="/pregnancy-care">
            <Card className="hover:shadow-elegant transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>👶</span>
                  <span>Pregnancy</span>
                </CardTitle>
                <CardDescription>Due date calculator, tips, and PregBot</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your pregnancy journey with personalized guidance
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to= "/period-tracking">
            <Card className="hover:shadow-elegant transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🩸</span>
                  <span>Periods</span>
                </CardTitle>
                <CardDescription>Cycle tracking and mood support</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Predict cycles, get tips, and connect with doctors
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to= "/mental-wellness">
            <Card className="hover:shadow-elegant transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🧠</span>
                  <span>Mental Health</span>
                </CardTitle>
                <CardDescription>Smart routing and therapist support</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get personalized mental health guidance and support
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

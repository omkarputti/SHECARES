import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      toast({ title: "Account created!", description: "Please login to continue." });
      // After registering, switch to login tab
      setActiveTab("login");
      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center justify-center p-4">
      
      {/* Back button */}
      <div className="w-full max-w-5xl flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          onClick={() => navigate("/")}
        >
          ← Back
        </Button>
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <div className="hidden md:block relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 transform group-hover:scale-105 transition-all duration-500">
            <img 
              src="src/assets/doctor.jpg" 
              alt="Healthcare Professional" 
              className="w-full h-[600px] object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-pink-100">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Your Health, Our Priority
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join thousands of women taking control of their health journey with personalized care and expert support.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Card Section */}
        <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:shadow-pink-200/50 transition-all duration-500">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">💖</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              SheCares
            </CardTitle>
            <CardDescription className="text-base text-gray-600 font-medium">
              Your trusted companion for women's health
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(val: "login" | "register") => setActiveTab(val)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-semibold"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 font-semibold"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700 font-semibold">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required 
                      className="h-12 border-2 focus:border-pink-400 transition-colors duration-300 rounded-xl"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700 font-semibold">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required 
                      className="h-12 border-2 focus:border-pink-400 transition-colors duration-300 rounded-xl"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-700 font-semibold">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)} 
                      required 
                      className="h-12 border-2 focus:border-pink-400 transition-colors duration-300 rounded-xl"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-700 font-semibold">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                      required 
                      className="h-12 border-2 focus:border-pink-400 transition-colors duration-300 rounded-xl"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

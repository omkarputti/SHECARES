import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; 
import { auth } from "@/config/firebase";      
import { signOut } from "firebase/auth";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // ✅ Change the site name here
  const siteName = "Vespera";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          {/* ✅ Visible and gradient-safe site name */}
          <span className="font-bold text-2xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
            {siteName}
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to={user ? "/pregnancy-care" : "/auth"} className="text-muted-foreground hover:text-primary transition-colors">
            Pregnancy
          </Link>
          <Link to={user ? "/period-tracking" : "/auth"} className="text-muted-foreground hover:text-primary transition-colors">
            Periods
          </Link>
          <Link to={user ? "/mental-wellness" : "/auth"} className="text-muted-foreground hover:text-primary transition-colors">
            Wellness
          </Link>
          <Link to={user ? "/therapist-support" : "/auth"} className="text-muted-foreground hover:text-primary transition-colors">
            Therapists
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-10 w-44 animate-pulse bg-muted rounded-md"></div>
          ) : user ? (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleLogout} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

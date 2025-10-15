import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";

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

  const siteName = "Vespera";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-pink-50/80 via-white/70 to-purple-50/80 border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Gradient Glow */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-200">
              <span className="text-white font-bold text-lg">VS</span>
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-fuchsia-600 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              {siteName}
            </span>
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link
            to={user ? "/pregnancy-care" : "/auth"}
            className="text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
          >
            Pregnancy
          </Link>
          <Link
            to={user ? "/period-tracking" : "/auth"}
            className="text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
          >
            Periods
          </Link>
          <Link
            to={user ? "/mental-wellness" : "/auth"}
            className="text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
          >
            Wellness
          </Link>
          <Link
            to={user ? "/therapist-support" : "/auth"}
            className="text-gray-600 hover:text-fuchsia-600 transition-colors duration-200"
          >
            Therapists
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-10 w-44 animate-pulse bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-inner"></div>
          ) : user ? (
            <>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-fuchsia-600 font-medium transition-all duration-200"
                asChild
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  className="rounded-xl px-5 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                >
                  Logout
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-fuchsia-600 font-medium transition-all duration-200"
                asChild
              >
                <Link to="/auth">Log In</Link>
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="rounded-xl px-5 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                  asChild
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

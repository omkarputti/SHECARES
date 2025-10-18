import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Calendar,
  Brain,
  Shield,
  Bot,
  Users,
  MapPin,
} from "lucide-react"; // adjust icons if needed

const Header = () => {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const features = [
    { icon: Heart, title: "Pregnancy Care", description: "Smart health insights", link: "/pregnancy-care" },
    { icon: Calendar, title: "Period Tracker", description: "Cycle prediction", link: "/period-tracking" },
    { icon: Brain, title: "Mental Wellness", description: "Mood & therapy tools", link: "/mental-wellness" },
    { icon: Shield, title: "Caretaker Help", description: "Safety & tracking", link: "/caretaker" },
    { icon: Bot, title: "Report Incident", description: "Report any issue", link: "/report" },
    { icon: MapPin, title: "Food Analyzer", description: "Scan Your Food", link: "/FoodAnalyser" },
  ];

  return (
    <header className="w-full z-30 backdrop-blur-md bg-white/50 fixed top-0 left-0">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
            SH
          </div>
          <span className="font-semibold text-lg text-primary">SHECARES</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-base font-semibold hover:text-primary transition-colors">
            Home
          </Link>

          {/* Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setFeaturesOpen(true)}
            onMouseLeave={() => setFeaturesOpen(false)}
          >
            <button
              onClick={() => setFeaturesOpen((s) => !s)}
              className="text-base font-semibold flex items-center gap-2 hover:text-primary transition-colors"
              aria-expanded={featuresOpen}
            >
              Features
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  featuresOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.653a.75.75 0 01-1.07 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              className={`absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-pink-200 transition-all duration-200 ${
                featuresOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <div className="p-3">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <Link
                      key={i}
                      to={f.link}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-pink-600" />
                      <div className="text-sm">
                        <div className="font-semibold">{f.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {f.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <a
            href="/help"
            className="text-base font-semibold hover:text-primary transition-colors"
          >
            Help
          </a>
          <a
            href="/contact"
            className="text-base font-semibold hover:text-primary transition-colors"
          >
            Contact Info
          </a>
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link to="/dashboard">
            <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 font-semibold">
              Get Started
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
// src/pages/Index.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Calendar,
  Brain,
  Shield,
  Users,
  AlertTriangle,
  Apple,
  Watch,
  MapPin,
  Bot,
} from "lucide-react";

import pregnancyCare from "@/assets/pregnancy-care.jpg";
import periodTracking from "@/assets/period-tracking.jpg";
import mentalWellness from "@/assets/mental-wellness.jpg";
import emergencySafety from "@/assets/emergency-safety.jpg";
import caretaker from "@/assets/caretaker.jpg";
import foodAnalyzer from "@/assets/food-analyzer.jpg";
import wearableIot from "@/assets/wearable-iot.jpg";
import trustCta from "@/assets/trust-cta.jpg";

export default function Index(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [mobileOverlay, setMobileOverlay] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const firebaseFunctionURL =
    "https://us-central1-your-project-id.cloudfunctions.net/emergencySOS";

  const sendSOS = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          await fetch(firebaseFunctionURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          });
          alert("🚨 SOS sent successfully! Help is on the way.");
        } catch (err) {
          console.error(err);
          alert("Error sending SOS alert. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setLoading(false);
        alert("Unable to get your location. Please allow location access.");
      }
    );
  };

  const features = [
    {
      icon: Heart,
      title: "Pregnancy Care",
      description: "Due date calculator, trimester tips, and AI pregnancy assistant",
      link: "/dashboard",
      image: pregnancyCare,
    },
    {
      icon: Calendar,
      title: "Period Tracking",
      description: "Cycle prediction, mood support, and health recommendations",
      link: "/dashboard",
      image: periodTracking,
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      description: "Smart routing, therapist support, and coping strategies",
      link: "/dashboard",
      image: mentalWellness,
    },
    {
      icon: Shield,
      title: "Emergency Safety",
      description: "SOS alerts, location sharing, and nearby help finder",
      link: "#emergency",
      image: emergencySafety,
    },
    {
      icon: Users,
      title: "Caretaker",
      description: "Prescription scanner, reminders & caretaker mode",
      link: "/dashboard",
      image: caretaker,
    },
    {
      icon: Apple,
      title: "Food Analyzer",
      description: "AI food health analyzer for smarter eating",
      link: "/dashboard",
      image: foodAnalyzer,
    },
    {
      icon: Watch,
      title: "Wearable IoT",
      description: "Monitor heart rate and detect emergencies in real-time",
      link: "/dashboard",
      image: wearableIot,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-purple-200 text-foreground">
      {/* NAVBAR */}
      <header className="w-full z-30 backdrop-blur-md bg-white/50 fixed top-0 left-0">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
              SH
            </div>
            <span className="font-semibold text-lg text-primary">SHECARES</span>
          </div>

          {/* Center links - enlarged */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base font-semibold hover:text-primary transition-colors">
              Home
            </Link>

            {/* Features dropdown */}
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
                  className={`w-4 h-4 transform transition-transform ${featuresOpen ? "rotate-180" : ""}`}
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

              {/* dropdown visible */}
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-pink-200 transition-all duration-200 ${
                  featuresOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <div className="p-3">
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <a
                        key={i}
                        href={f.link}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-pink-600" />
                        <div className="text-sm">
                          <div className="font-semibold">{f.title}</div>
                          <div className="text-xs text-muted-foreground">{f.description.split(",")[0]}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <a href="#help" className="text-base font-semibold hover:text-primary transition-colors">
              Help
            </a>
            <a href="/Contact" className="text-base font-semibold hover:text-primary transition-colors">
              Contact Info
            </a>
          </div>

          {/* Get Started */}
          <div className="hidden md:block">
            <Link to="/dashboard">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 font-semibold">
                Get Started
              </button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="pt-32">
        <section className="relative isolate flex items-center justify-center px-6">
          {/* Background gradient animation */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-300 opacity-90" />

          {/* Hero content */}
          <div className="w-full max-w-4xl text-center py-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                Your Complete
              </span>
              <span className="block mt-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-md inline-block shadow-md">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Wellness Companion
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-gray-700"
            >
              Comprehensive support for pregnancy, periods, mental health, and real-time emergency assistance.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <button
                onClick={sendSOS}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold transition"
              >
                <AlertTriangle className="w-5 h-5" />
                {loading ? "Sending..." : "Send SOS"}
              </button>

              <Link to="/dashboard">
                <button className="bg-white/80 backdrop-blur-sm border border-gray-200 px-6 py-3 rounded-full hover:shadow-lg text-lg font-semibold text-gray-800 transition">
                  Try Demo
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features tagline */}
        <div className="text-center mt-20 mb-10">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Features
          </h2>
          <p className="text-gray-600 mt-2">Explore our core wellness tools and intelligent support modules</p>
        </div>

        {/* FEATURES grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-white rounded-2xl border border-pink-200 shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 flex items-center justify-center rounded-md bg-pink-100 text-pink-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-semibold">{f.title}</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">{f.description}</div>
                    <div className="flex items-center justify-between">
                      <a href={f.link} className="text-pink-600 font-semibold">
                        Open
                      </a>
                      <div className="text-xs text-gray-400">Details →</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* TRUST CTA */}
        <section id="trust" className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-pink-200 shadow-lg">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 text-pink-600">
                Safe, Private, Always There for You
              </h3>
              <p className="text-gray-600 mb-4">
                Your health data is encrypted and secure. Emergency features and AI assistants
                provide personalized, confidential support.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-pink-500" /> Privacy
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bot className="w-5 h-5 text-purple-500" /> AI Powered
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-500" /> 24/7 Support
                </div>
              </div>
            </div>
            <div className="w-full md:w-96">
              <img
                src={trustCta}
                alt="Safe and private healthcare"
                className="rounded-2xl w-full object-cover shadow-lg"
              />
            </div>
          </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 py-10 text-center text-sm text-gray-500 border-t border-gray-200 mt-12">
          © 2025 SheCares. Your health, your privacy, our priority.
        </footer>
      </main>

      {/* Floating SOS for desktop */}
      <div className="hidden md:block">
        <motion.button
          onClick={sendSOS}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-10 right-10 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-4 border-white transition-all"
          aria-label="Send SOS"
        >
          <AlertTriangle className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Mobile overlay */}
      {mobileOverlay && (
        <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-pink-400 to-purple-500 flex flex-col items-center justify-center text-white p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-3xl bg-white/20 backdrop-blur-md p-6 text-center shadow-2xl border border-white/30">
              <h2 className="text-2xl font-bold mb-2">Emergency SOS</h2>
              <p className="text-sm mb-4 opacity-90">
                Tap to send your location to trusted contacts immediately.
              </p>
              <button
                onClick={sendSOS}
                className="mx-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full w-full font-semibold mb-3 shadow-lg transition-all"
              >
                {loading ? "Sending..." : "Send SOS"}
              </button>
              <button
                onClick={() => setMobileOverlay(false)}
                className="mx-auto bg-white/30 hover:bg-white/40 text-white px-6 py-2 rounded-full w-full transition-all"
              >
                Open App
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

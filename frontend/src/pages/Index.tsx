import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, Brain, Shield, Users, AlertTriangle, Apple, Watch, MapPin, Bot, PlusCircle, Trash2 } from "lucide-react";
import pregnancyCare from "@/assets/pregnancy-care.jpg";
import periodTracking from "@/assets/period-tracking.jpg";
import mentalWellness from "@/assets/mental-wellness.jpg";
import emergencySafety from "@/assets/emergency-safety.jpg";
import caretaker from "@/assets/caretaker.jpg";
import foodAnalyzer from "@/assets/food-analyzer.jpg";
import wearableIot from "@/assets/wearable-iot.jpg";
import trustCta from "@/assets/trust-cta.jpg";



// --- Emergency Contacts Modal ---
const EmergencyContactsModal = ({ isOpen, onClose, contacts, onSave }) => {
  const [currentContacts, setCurrentContacts] = useState(contacts);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    setCurrentContacts(contacts);
  }, [contacts]);

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (newName && newPhone) {
      setCurrentContacts([...currentContacts, { name: newName, phone: newPhone }]);
      setNewName("");
      setNewPhone("");
    }
  };

  const handleRemoveContact = (index) => {
    const updatedContacts = currentContacts.filter((_, i) => i !== index);
    setCurrentContacts(updatedContacts);
  };
  
  const handleSave = () => {
    onSave(currentContacts);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Emergency Contacts</h2>
        <div className="space-y-4">
          {currentContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <div>
                <p className="font-semibold">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.phone}</p>
              </div>
              <button onClick={() => handleRemoveContact(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
            <input type="tel" placeholder="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
           <button onClick={handleAddContact} className="w-full flex justify-center items-center gap-2 bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition">
            <PlusCircle className="w-5 h-5"/> Add Contact
          </button>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} className="w-full bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-700 transition">Save</button>
          <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const SOSModal = ({ isOpen, onClose, sosState, onRetry, emergencyContacts }) => {
  if (!isOpen) return null;

  const Loader = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin h-12 w-12 text-blue-600"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  );

  const renderContent = () => {
    switch (sosState.status) {
      case "loading":
        return (
          <div className="text-center py-6">
            <Loader />
            <h3 className="mt-4 text-lg font-medium text-gray-800">Finding your location...</h3>
            <p className="text-sm text-gray-500">Please approve the location request.</p>
          </div>
        );
      case "success":
        const { location } = sosState;
        const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        const message = `Emergency! My current location is: ${mapLink}`;
        const contactNumbers = emergencyContacts.map(c => c.phone).join(',');
        
        return (
          <div className="text-center py-4">
             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
               <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-green-700 mb-2">Location Found!</h3>
            <p className="text-sm text-gray-600 mb-4">Share this information immediately.</p>
            <div className="bg-green-50 p-4 rounded-lg text-left text-sm text-gray-800 break-words mb-4">
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-block font-semibold">View on Google Maps</a>
            </div>
            <div className="space-y-2">
              {contactNumbers ? (
                 <a href={`sms:${contactNumbers}?body=${encodeURIComponent(message)}`} className="block w-full text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">Share with Emergency Contacts</a>
              ) : (
                 <a href={`sms:?body=${encodeURIComponent(message)}`} className="block w-full text-center bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">Share via SMS (No contacts saved)</a>
              )}
              <a href="tel:112" className="block w-full text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300">Call Emergency Services (112)</a>
              <button onClick={onClose} className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-red-700 mb-2">Location Error</h3>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{sosState.message}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={onRetry} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Retry</button>
              <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center p-4">
      <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-md">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function Index(): JSX.Element {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [sosState, setSosState] = useState({ status: "idle", location: null, message: "" });
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  const handleSaveContacts = (contacts) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    setEmergencyContacts(contacts);
  };
  
  const handleSOSClick = useCallback(() => {
    setIsSosModalOpen(true);
    setSosState({ status: "loading", location: null, message: "" });

    if (!navigator.geolocation) {
      setSosState({ status: "error", location: null, message: "Geolocation is not supported by your browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSosState({ status: "success", location: position.coords, message: "" });
      },
      (error) => {
        let message = "An unknown error occurred.";
        switch(error.code) {
           case error.PERMISSION_DENIED:
              message = "Location access was denied. Please allow it in your browser's site settings and retry.";
              break;
           case error.POSITION_UNAVAILABLE:
              message = "Location information is unavailable. Check your network or device's location services.";
              break;
           case error.TIMEOUT:
              message = "The request to get your location timed out.";
              break;
        }
        setSosState({ status: "error", location: null, message });
      }
    );
  }, []);

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
      link: "#",
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              SH
            </div>
            <span className="font-semibold text-lg text-pink-600">SHECARES</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-base font-semibold hover:text-pink-600 transition-colors">
              Home
            </a>
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button
                onClick={() => setFeaturesOpen((s) => !s)}
                className="text-base font-semibold flex items-center gap-2 hover:text-pink-600 transition-colors"
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
                        href={f.link === '#' ? undefined : f.link}
                        onClick={f.link === '#' ? (e) => { e.preventDefault(); handleSOSClick(); } : undefined}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer"
                      >
                        <Icon className="w-5 h-5 text-pink-600" />
                        <div className="text-sm">
                          <div className="font-semibold">{f.title}</div>
                          <div className="text-xs text-gray-500">{f.description.split(",")[0]}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            <a href="/Help" className="text-base font-semibold hover:text-pink-600 transition-colors">Help</a>
            <a href="/Contact" className="text-base font-semibold hover:text-pink-600 transition-colors">Contact Info</a>
          </div>

          <div className="hidden md:block">
            <a href="/dashboard">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 font-semibold">
                Get Started
              </button>
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="pt-32">
        <section className="relative isolate flex items-center justify-center px-6">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-300 opacity-90" />
          <div className="w-full max-w-4xl text-center py-24">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Your Complete</span>
              <span className="block mt-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-md inline-block shadow-md">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Wellness Companion</span>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-gray-700">
              Comprehensive support for pregnancy, periods, mental health, and real-time emergency assistance.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={handleSOSClick} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold transition">
                <AlertTriangle className="w-5 h-5" />
                {sosState.status === 'loading' ? "Sending..." : "Send SOS"}
              </button>
              <a href="/report" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-300 text-gray-800 px-8 py-3 rounded-full shadow-lg text-lg font-semibold transition hover:bg-gray-100">
                 <Shield className="w-5 h-5" />
                 Report Incident
               </a>
            </motion.div>
          </div>
        </section>

        {/* Features tagline */}
        <div className="text-center mt-20 mb-10">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Features</h2>
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
                    <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 flex items-center justify-center rounded-md bg-pink-100 text-pink-600"><Icon className="w-4 h-4" /></div>
                      <div className="text-lg font-semibold">{f.title}</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">{f.description}</div>
                    <div className="flex items-center justify-between">
                       <a 
                          href={f.link === '#' ? undefined : f.link} 
                          onClick={f.link === '#' ? (e) => { e.preventDefault(); handleSOSClick(); } : undefined} 
                          className="text-pink-600 font-semibold cursor-pointer">
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
              <h3 className="text-2xl font-bold mb-3 text-pink-600">Safe, Private, Always There for You</h3>
              <p className="text-gray-600 mb-4">Your health data is encrypted and secure. Add your trusted contacts for one-tap emergency alerts.</p>
              <div className="flex flex-wrap gap-4 items-center">
                 <button onClick={() => setIsContactsModalOpen(true)} className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600 transition">Manage Contacts</button>
                 <div className="flex items-center gap-2 text-gray-600"><Bot className="w-5 h-5 text-purple-500" /> AI Powered</div>
                 <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-5 h-5 text-red-500" /> 24/7 Support</div>
              </div>
            </div>
            <div className="w-full md:w-96">
              <img src={trustCta} alt="Safe and private healthcare" className="rounded-2xl w-full object-cover shadow-lg" />
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
          onClick={handleSOSClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-10 right-10 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-4 border-white transition-all"
          aria-label="Send SOS"
        >
          {sosState.status === 'loading' ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <AlertTriangle className="w-8 h-8" />}
        </motion.button>
      </div>

      <SOSModal 
        isOpen={isSosModalOpen} 
        onClose={() => setIsSosModalOpen(false)} 
        sosState={sosState}
        onRetry={handleSOSClick}
        emergencyContacts={emergencyContacts}
      />
      
      <EmergencyContactsModal 
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        contacts={emergencyContacts}
        onSave={handleSaveContacts}
      />
    </div>
  );
}
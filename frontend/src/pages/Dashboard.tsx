import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader, X, PlusCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

// -------------------- Firebase Setup --------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "shecares-a6575.firebaseapp.com",
  projectId: "shecares-a6575",
  storageBucket: "shecares-a6575.firebasestorage.app",
  messagingSenderId: "47603653504",
  appId: "1:47603653504:web:7378a54fd969d06258bf65",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------- Emergency Contacts Modal --------------------
const EmergencyContactsModal = ({ isOpen, onClose, contacts, onSave }) => {
  const [currentContacts, setCurrentContacts] = useState(contacts);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    setCurrentContacts(contacts);
  }, [contacts]);

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (newName.trim() && newPhone.trim()) {
      setCurrentContacts([...currentContacts, { name: newName.trim(), phone: newPhone.trim() }]);
      setNewName("");
      setNewPhone("");
    }
  };

  const handleRemoveContact = (index) => {
    setCurrentContacts(currentContacts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(currentContacts);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Contacts</h2>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {currentContacts.length === 0 && (
            <p className="text-center text-gray-500 py-4">No contacts added yet.</p>
          )}
          {currentContacts.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
            >
              <div>
                <p className="font-semibold text-gray-700">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.phone}</p>
              </div>
              <button
                onClick={() => handleRemoveContact(index)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-4 mt-4 border-t">
          <input
            type="text"
            placeholder="Contact Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border-gray-300 rounded-lg p-2 border focus:ring-pink-500 focus:border-pink-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full border-gray-300 rounded-lg p-2 border focus:ring-pink-500 focus:border-pink-500"
          />
          <button
            onClick={handleAddContact}
            className="w-full flex justify-center items-center gap-2 bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition"
          >
            <PlusCircle className="w-5 h-5" /> Add Contact
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-pink-700 transition shadow-md"
          >
            Save & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// -------------------- SOS Modal --------------------
const SOSModal = ({ isOpen, onClose, sosState, onRetry, emergencyContacts }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (sosState.status) {
      case "loading":
        return (
          <div className="text-center py-6">
            <Loader className="animate-spin mx-auto h-12 w-12 text-blue-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-800">
              Finding your location...
            </h3>
            <p className="text-sm text-gray-500">Please approve the location request.</p>
          </div>
        );

      case "success":
        const { location } = sosState;
        const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        const message = `Emergency! My current location is: ${mapLink}`;
        const contactNumbers = emergencyContacts.map((c) => c.phone).join(",");

        return (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-green-700 mb-2">
              Location Found!
            </h3>
            <p className="text-sm text-gray-600 mb-4">Share this information immediately.</p>

            <div className="bg-green-50 p-4 rounded-lg text-left text-sm text-gray-800 break-words mb-4 border border-green-200">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-block font-semibold"
              >
                View on Google Maps
              </a>
            </div>

            <div className="space-y-3">
              {emergencyContacts.length > 0 ? (
                <a
                  href={`sms:${contactNumbers}?body=${encodeURIComponent(message)}`}
                  className="block w-full text-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Share with Emergency Contacts
                </a>
              ) : (
                <div className="text-center bg-gray-100 p-3 rounded-lg text-sm text-gray-600">
                  No emergency contacts saved. Add them from the dashboard.
                </div>
              )}
              <a
                href="tel:112"
                className="block w-full text-center bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Call Emergency Services (112)
              </a>
              <button
                onClick={onClose}
                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-700 mb-2">Location Error</h3>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {sosState.message}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md"
      >
        <div className="p-6">{renderContent()}</div>
      </motion.div>
    </div>
  );
};

// -------------------- Dashboard --------------------
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [sosState, setSosState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
    location?: GeolocationCoordinates;
  }>({ status: "idle" });
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().emergencyContacts) {
          setEmergencyContacts(docSnap.data().emergencyContacts);
        } else {
          setEmergencyContacts([]);
        }
      } else {
        window.location.href = `${window.location.origin}/auth`;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveContacts = async (contacts) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to save contacts.",
        variant: "destructive",
      });
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { emergencyContacts: contacts }, { merge: true });
      setEmergencyContacts(contacts);
      toast({ title: "Success", description: "Emergency contacts saved successfully." });
    } catch (error) {
      console.error("Error saving contacts to Firestore:", error);
      toast({ title: "Error", description: "Failed to save contacts.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "See you soon!" });
      window.location.href = `${window.location.origin}/`;
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSOSClick = useCallback(() => {
    setIsSOSModalOpen(true);
    setSosState({ status: "loading" });

    if (!navigator.geolocation) {
      setSosState({
        status: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSosState({ status: "success", location: position.coords });
      },
      (error) => {
        let message = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location access was denied. Please allow it in your browser's site settings and retry.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "The request to get your location timed out.";
            break;
        }
        setSosState({ status: "error", message });
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8">
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
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

      <div className="container mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💖</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                SheCares Dashboard
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Welcome, {user?.displayName || user?.email} ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsContactsModalOpen(true)}
              className="shadow-md font-semibold"
            >
              Manage Emergency Contacts
            </Button>
            <Link to="/">
              <Button variant="outline" className="shadow-md font-semibold">
                Back
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="shadow-md font-semibold"
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

          <Link to="/report" className="group">
            <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl hover:shadow-green-200/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">❗</span>
                </div>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
                  <span>Report Incident</span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">Quick, confidential, and secure reporting.</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Our team ensures every report is reviewed with care and prompt action.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/Caretaker" className="group">
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

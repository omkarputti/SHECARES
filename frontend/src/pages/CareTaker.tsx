import React, { useEffect, useRef, useState } from 'react';
import { Upload, Bell, Clock, Pill, ShoppingCart, Coffee, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';

interface Medicine {
  id: string;
  name: string;
  tabletsPerDose: number;
  totalTablets: number;
  timesSelected: string[]; // ['Morning','Afternoon']
  customTimes: Record<string, string>; // { Morning: '09:00' }
  foodTiming: string;
  imageUrl: string;
  remainingDays: number;
  timestamp: number;
  // optional suggestions returned from the food suggestions API
  foodSuggestions?: {
    before: string[];
    after: string[];
  };
}

const DEFAULT_TIMES: Record<string, string> = {
  Morning: '09:00',
  Afternoon: '14:00',
  Night: '20:00'
};

const LOCAL_KEY = 'caretaker_medicines_v1';

const App: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    tablets: '',
    totalTablets: '',
    timeSelected: [] as string[],
    customTimes: { ...DEFAULT_TIMES },
    foodTiming: 'after'
  });
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // compress large images to keep localStorage usage reasonable
  const compressImage = (file: File, maxWidth = 800, quality = 0.8) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          const width = Math.min(maxWidth, img.width);
          const height = Math.round(width / ratio);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  const [showNotificationBanner, setShowNotificationBanner] = useState<null | { title: string; body: string }>(null);
  const notifiedRef = useRef<Record<string, number>>({}); // key -> minuteTimestamp last notified

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Medicine[];
        setMedicines(parsed);
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }

    // ask notification permission proactively (user can block; safe fallback)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Persist medicines to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(medicines));
    } catch (e) {
      console.warn('Failed to persist medicines to localStorage (possibly quota).', e);
      // If quota exceeded, consider trimming images from stored medicines to keep app usable
    }
  }, [medicines]);

  // Soft ding using WebAudio API (subtle)
  const playSoftDing = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // high-ish for ding
      g.gain.value = 0.02; // very soft
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.stop(ctx.currentTime + 0.6);
      // close context after a sec
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {
      // fallback: try HTMLAudio with a tiny base64 sound (if available) - skipped to avoid blob size
      console.warn('Audio not allowed or failed', e);
    }
  };

  // Helper: format HH:MM -> display
  const formatTime = (hm: string) => {
    if (!hm) return '';
    const [hh, mm] = hm.split(':').map(Number);
    const date = new Date();
    date.setHours(hh, mm, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reminder check every 15 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currMinuteKey = Math.floor(now.getTime() / 60000); // minute precision

      medicines.forEach((med) => {
        med.timesSelected.forEach((slot) => {
          const hm = med.customTimes[slot] || DEFAULT_TIMES[slot];
          if (!hm) return;
          const [hh, mm] = hm.split(':').map(Number);

          if (now.getHours() === hh && now.getMinutes() === mm) {
            const notifyKey = `${med.id}_${slot}_${currMinuteKey}`;
            // ensure we didn't notify already this minute
            if (notifiedRef.current[notifyKey]) return;

            // mark as notified
            notifiedRef.current[notifyKey] = Date.now();

            // show in-app banner
            setShowNotificationBanner({ title: med.name, body: `Time to take ${med.tabletsPerDose} tablet(s) — ${slot} (${formatTime(hm)})` });
            setTimeout(() => setShowNotificationBanner(null), 7000);

            // browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Medicine Reminder', {
                  body: `${med.name} — take ${med.tabletsPerDose} tablet(s) now`,
                  icon: med.imageUrl
                });
              } catch (e) {
                console.warn('Notification failed', e);
              }
            }

            // play ding
            playSoftDing();
          }
        });
      });

      // cleanup old keys (> 10 minutes)
      const cutoff = Date.now() - 1000 * 60 * 10;
      Object.keys(notifiedRef.current).forEach((k) => {
        if (notifiedRef.current[k] < cutoff) delete notifiedRef.current[k];
      });
    };

    checkReminders(); // run once immediately
    const id = setInterval(checkReminders, 15 * 1000);
    return () => clearInterval(id);
  }, [medicines]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // compress if big (e.g., >200KB)
      if (file.size > 200 * 1024) {
        try {
          const compressed = await compressImage(file, 800, 0.8);
          setUploadedImage(compressed);
        } catch (e) {
          console.warn('Compression failed, falling back to raw file', e);
          const reader = new FileReader();
          reader.onloadend = () => setUploadedImage(reader.result as string);
          reader.readAsDataURL(file);
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setUploadedImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  // helper to read a File as data URL (promise)
  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  // Add medicine
  const handleSubmit = async () => {
    const name = formData.name.trim();
    const tabletsPerDose = Number(formData.tablets);
    const totalTablets = Number(formData.totalTablets);
    const times = formData.timeSelected;

    if (!name || !tabletsPerDose || !totalTablets || times.length === 0) {
      alert('Please fill name, tablets per dose, total tablets and select at least one time.');
      return;
    }

    const timesPerDay = times.length;
    const totalDays = Math.floor(totalTablets / (tabletsPerDose * timesPerDay));

    // ensure we have an image (await file read if necessary)
    let imageBase = uploadedImage;
    if (!imageBase && uploadedFile) {
      try {
        imageBase = await readFileAsDataUrl(uploadedFile);
      } catch (e) {
        console.warn('Failed reading uploaded file', e);
      }
    }

    const newMed: Medicine = {
      id: Date.now().toString(),
      name,
      tabletsPerDose,
      totalTablets,
      timesSelected: times,
      customTimes: { ...formData.customTimes },
      foodTiming: formData.foodTiming,
      imageUrl: imageBase || `https://via.placeholder.com/100x100/E9D5FF/9333EA?text=${encodeURIComponent(name[0] || 'M')}`,
      remainingDays: totalDays,
      timestamp: Date.now()
    };

    setMedicines((s) => [newMed, ...s]);

    // reset form
    setFormData({ name: '', tablets: '', totalTablets: '', timeSelected: [], customTimes: { ...DEFAULT_TIMES }, foodTiming: 'after' });
  setUploadedImage('');
  setUploadedFile(null);

    // gentle confirmation
    setShowNotificationBanner({ title: 'Reminder set', body: `${name} — ${tabletsPerDose} tab(s) • ${timesPerDay} time(s)/day • ${newMed.remainingDays} day(s) left` });
    setTimeout(() => setShowNotificationBanner(null), 4000);
  };

  const removeMedicine = (id: string) => {
    if (!confirm('Remove this medicine?')) return;
    setMedicines((s) => s.filter(m => m.id !== id));
  };

  // Utility: get next occurrences (today/tomorrow) for a med
  const getNextOccurrences = (med: Medicine) => {
    const now = new Date();
    const results: { slot: string; date: Date }[] = [];
    med.timesSelected.forEach((slot) => {
      const hm = med.customTimes[slot] || DEFAULT_TIMES[slot];
      const [hh, mm] = hm.split(':').map(Number);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
      if (d.getTime() <= now.getTime()) {
        // schedule next day
        d.setDate(d.getDate() + 1);
      }
      results.push({ slot, date: d });
    });
    // sort by soonest
    results.sort((a, b) => a.date.getTime() - b.date.getTime());
    return results;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-lavender-200" style={{ background: 'linear-gradient(180deg, #FFE5F1 0%, #F3E8FF 50%, #E9D5FF 100%)' }}>
      {showNotificationBanner && (
        <div className="fixed top-20 right-6 z-50 bg-white rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-3">
            <Bell className="text-purple-500" size={22} />
            <div>
              <div className="font-semibold text-purple-700">{showNotificationBanner.title}</div>
              <div className="text-sm text-purple-500">{showNotificationBanner.body}</div>
            </div>
          </div>
        </div>
      )}

      <Header />
      <br></br>
      <br></br>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
            Your Complete Medicine
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Management Companion</span>
          </h2>
          <p className="text-purple-600 text-lg">Never miss a dose. Stay healthy, stay happy. 💜</p>
        </div>

        {/* Add Medicine Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Pill className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">Add Medicine Details</h3>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all">
                <label className="flex flex-col items-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:shadow-xl transition-shadow">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Medicine" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Upload className="text-purple-400 group-hover:text-purple-600 transition-colors" size={40} />
                    )}
                  </div>
                  <span className="text-purple-600 font-medium">Upload Medicine Photo</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-purple-700 font-medium mb-2">Medicine Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors" placeholder="e.g., Vitamin D3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-700 font-medium mb-2">Tablets per Dose</label>
                    <input type="number" min={1} value={formData.tablets} onChange={(e) => setFormData({ ...formData, tablets: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors" placeholder="1" />
                  </div>

                  <div>
                    <label className="block text-purple-700 font-medium mb-2">Total Tablets Available</label>
                    <input type="number" min={1} value={formData.totalTablets} onChange={(e) => setFormData({ ...formData, totalTablets: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors" placeholder="e.g., 30" />
                  </div>
                </div>

                <div>
  <label className="block text-purple-700 font-medium mb-2">Time(s) of Day</label>
  <div className="space-y-2 bg-white p-4 rounded-xl border-2 border-purple-200">
    {(["Morning", "Afternoon", "Night"] as const).map((timeOption) => {
      const checked = formData.timeSelected.includes(timeOption);

      const minTime =
        timeOption === "Morning"
          ? "05:00"
          : timeOption === "Afternoon"
          ? "12:00"
          : "18:00";
      const maxTime =
        timeOption === "Morning"
          ? "11:59"
          : timeOption === "Afternoon"
          ? "16.00"
          : "23:59";

      return (
        <div
          key={timeOption}
          className="flex items-center justify-between gap-2 hover:bg-purple-50 p-2 rounded-lg transition-colors"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...formData.timeSelected, timeOption]
                  : formData.timeSelected.filter((t) => t !== timeOption);
                setFormData({ ...formData, timeSelected: newSelected });
              }}
              className="w-5 h-5 text-purple-500 rounded border-purple-200"
            />
            <span className="text-purple-700">{timeOption}</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={formData.customTimes[timeOption] || DEFAULT_TIMES[timeOption]}
              min={minTime}
              max={maxTime}
              onChange={(e) => {
                const value = e.target.value;
                const [hour] = value.split(":").map(Number);
                const valid =
                  (timeOption === "Morning" && hour >= 5 && hour < 12) ||
                  (timeOption === "Afternoon" && hour >= 12 && hour < 16) ||
                  (timeOption === "Night" && hour >= 18 && hour <= 23);

                if (!valid) {
                  alert(`Please choose a valid ${timeOption.toLowerCase()} time.`);
                  return;
                }

                setFormData({
                  ...formData,
                  customTimes: {
                    ...formData.customTimes,
                    [timeOption]: value,
                  },
                });
              }}
              className="px-3 py-2 rounded-lg border-2 border-purple-100"
            />
            <span className="text-sm text-purple-500">
              Default: {formatTime(DEFAULT_TIMES[timeOption])}
            </span>
          </div>
        </div>
      );
    })}
  </div>
</div>


                <div>
                  <label className="block text-purple-700 font-medium mb-2">Food Timing</label>
                  <div className="flex gap-4">
                    {['before', 'after'].map((timing) => (
                      <label key={timing} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="foodTiming" value={timing} checked={formData.foodTiming === timing} onChange={(e) => setFormData({ ...formData, foodTiming: e.target.value })} className="w-5 h-5 text-purple-500" />
                        <span className="text-purple-700 capitalize">{timing} Food</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all">🔔 Set Reminder</button>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Bell className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">Upcoming Reminders</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {medicines.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-purple-400">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No reminders set yet. Add your first medicine above! 💊</p>
              </div>
            ) : (
              medicines.map((med) => {
                const next = getNextOccurrences(med)[0];
                return (
                  <div key={med.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={med.imageUrl} alt={med.name} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-bold text-purple-700">{med.name}</h4>
                          <button onClick={() => removeMedicine(med.id)} className="text-xs text-red-500">Remove</button>
                        </div>
                        <p className="text-sm text-purple-500">{med.tabletsPerDose} tablet(s) • {med.timesSelected.length} time(s)/day</p>
                        <p className="text-sm text-purple-500 mt-1">{med.remainingDays} day(s) left</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-purple-600">
                      <Clock size={16} />
                      <div className="text-sm font-medium">
                        Next: {next ? `${next.slot} • ${next.date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : '—'}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-purple-500">
                      {med.foodTiming === 'before' ? '🍽️ Before food' : '🍽️ After food'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Food Suggestions */}
<div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
      <Coffee className="text-white" size={20} />
    </div>
    <h3 className="text-2xl font-bold text-purple-700">Food Suggestions</h3>
  </div>

  <div className="space-y-4">
    {medicines.length === 0 ? (
      <div className="text-center py-8 text-purple-400">
        <Clock size={48} className="mx-auto mb-4 opacity-50" />
        <p>No medicines yet to give food suggestions 🍽️</p>
      </div>
    ) : (
      medicines.map((med) => (
        <div key={med.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={med.imageUrl} alt={med.name} className="w-12 h-12 rounded-xl object-cover" />
              <h4 className="font-bold text-purple-700">{med.name}</h4>
            </div>
            <button
  onClick={async () => {
    try {
  // Use BACKEND_URL env (injected at build) or default to http://localhost:3001
  const BACKEND = (import.meta.env?.VITE_BACKEND_URL as string) || 'http://localhost:3000';
  const res = await fetch(`${BACKEND}/api/food-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName: med.name }) // send medicine name
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json(); // expected: { before: string[], after: string[] }

      setMedicines((prev) =>
        prev.map((m) =>
          m.id === med.id ? { ...m, foodSuggestions: data } : m
        )
      );
    } catch (e) {
      console.error('Failed to fetch food suggestions', e);
      alert('Failed to fetch food suggestions');
    }
  }}
  className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl font-semibold shadow hover:shadow-lg transition-all"
>
  🍽️ Get Food Suggestions
</button>
          </div>

          {med.foodSuggestions && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {/* Before Medicine */}
              <div className="bg-green-50 rounded-2xl p-4">
                <h5 className="text-lg font-bold text-green-700 mb-3">Before Medicine</h5>
                <div className="space-y-2">
                  {med.foodSuggestions.before.map((item: string, idx: number) => (
                    <div key={idx} className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-purple-700 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* After Medicine */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h5 className="text-lg font-bold text-blue-700 mb-3">After Medicine</h5>
                <div className="space-y-2">
                  {med.foodSuggestions.after.map((item: string, idx: number) => (
                    <div key={idx} className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-purple-700 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
</div>


        {/* Stock Alerts */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">Stock Alerts</h3>
          </div>

          <div className="space-y-4">
            {medicines.length === 0 ? (
              <div className="text-center py-8 text-purple-400">
                <Pill size={48} className="mx-auto mb-4 opacity-50" />
                <p>Add medicines to track stock levels 📦</p>
              </div>
            ) : (
              medicines.map((med) => (
                <div key={med.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={med.imageUrl} alt={med.name} className="w-12 h-12 rounded-xl object-cover" />
                      <h4 className="font-bold text-purple-700">{med.name}</h4>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${med.remainingDays <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {med.remainingDays} days left
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-purple-200 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${med.remainingDays <= 5 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`} style={{ width: `${Math.min(100, (med.remainingDays / 30) * 100)}%` }} />
                    </div>
                  </div>

                  {med.remainingDays <= 5 && (
                    <div className="flex items-center gap-3 mb-4 bg-red-50 p-3 rounded-xl">
                      <AlertTriangle className="text-red-500" size={20} />
                      <span className="text-red-600 font-medium">Low stock! Consider ordering soon.</span>
                      
                    </div>
                  )}
                  <button
  onClick={() => {
    const searchQuery = encodeURIComponent(med.name);
    const url = `https://www.1mg.com/search/all?name=${searchQuery}`;
    window.open(url, '_blank'); // opens in new tab
  }}
  className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
>
  🛒 Order Medicine
</button>

                  
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
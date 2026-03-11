// pages/CareTaker/TodayDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

interface DosageLog {
  _id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed';
  takenAt?: string;
  tabletsPerDose: number;
  timeSlot: string;
}

interface Medicine {
  _id: string;
  name: string;
  imageUrl: string;
}

const TodayDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DosageLog[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      // Fetch today's logs
      const logsRes = await fetch('http://localhost:5000/api/dosage-logs/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      // Fetch medicines for image URLs
      const medsRes = await fetch('http://localhost:5000/api/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (medsRes.ok) {
        const medsData = await medsRes.json();
        setMedicines(medsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const generateTodaysLogs = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch('http://localhost:5000/api/dosage-logs/generate-today', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Generated logs:', data);
        await loadData(); // Reload
      }
    } catch (error) {
      console.error('Failed to generate logs:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleTakeDose = async (logId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:5000/api/dosage-logs/${logId}/take`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to mark as taken:', error);
    }
  };

  const handleMarkMissed = async (logId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:5000/api/dosage-logs/${logId}/miss`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to mark as missed:', error);
    }
  };

  const getMedicineImage = (medicineId: string) => {
    const med = medicines.find(m => m._id === medicineId);
    return med?.imageUrl || 'https://via.placeholder.com/100x100/E9D5FF/9333EA?text=M';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} ${diffMins} min ago`;
    }
    return `${diffMins} min ago`;
  };

  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `in ${diffHours} hr${diffHours > 1 ? 's' : ''} ${diffMins} min`;
    }
    return `in ${diffMins} min`;
  };

  // Categorize logs
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  
  const upcoming = logs.filter(log => {
    const scheduled = new Date(log.scheduledTime);
    return scheduled > now && scheduled <= sixHoursFromNow && log.status === 'pending';
  });

  
  const pending = logs.filter(log => {
    const scheduled = new Date(log.scheduledTime);
    return scheduled <= now && log.status === 'pending';
  });

  const taken = logs.filter(log => log.status === 'taken');
  const missed = logs.filter(log => log.status === 'missed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-lavender-200 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Loading today's schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-lavender-200 pb-24">
      <Header />
      <br /><br />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Today's Medicines</h1>
          <p className="text-purple-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

          {/* Debug Button */}
          <button
            onClick={generateTodaysLogs}
            disabled={generating}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Generate Today\'s Logs (Debug)'}
          </button>
        </div>

        {/* UPCOMING Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">⏰ UPCOMING (Next 6 hours)</h2>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-purple-400">
              <p>No upcoming doses in the next 2 hours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(log => (
                <div key={log._id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 flex items-center gap-4">
                  <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-purple-700 text-lg">🔔 {log.medicineName}</h3>
                    <p className="text-purple-600">{formatTime(log.scheduledTime)} ({getTimeUntil(log.scheduledTime)})</p>
                    <p className="text-sm text-purple-500">{log.tabletsPerDose} tablet(s) • {log.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PENDING Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">⏳ PENDING (Overdue)</h2>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-8 text-purple-400">
              <p>No pending doses! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(log => (
                <div key={log._id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-700 text-lg">⚠️ {log.medicineName}</h3>
                      <p className="text-red-600">{formatTime(log.scheduledTime)} ({getTimeAgo(log.scheduledTime)})</p>
                      <p className="text-sm text-red-500">{log.tabletsPerDose} tablet(s) • {log.timeSlot}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTakeDose(log._id)}
                      className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg"
                    >
                      ✓ Take Now
                    </button>
                    <button
                      onClick={() => handleMarkMissed(log._id)}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg"
                    >
                      ✗ Mark Missed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TAKEN TODAY Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">✅ TAKEN TODAY</h2>
          </div>

          {taken.length === 0 ? (
            <div className="text-center py-8 text-purple-400">
              <p>No doses taken yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {taken.map(log => (
                <div key={log._id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 flex items-center gap-4">
                  <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-green-700 text-lg">✓ {log.medicineName}</h3>
                    <p className="text-green-600">
                      {formatTime(log.scheduledTime)} (taken at {log.takenAt ? formatTime(log.takenAt) : 'N/A'})
                    </p>
                    <p className="text-sm text-green-500">{log.tabletsPerDose} tablet(s) • {log.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MISSED Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
              <XCircle className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">❌ MISSED</h2>
          </div>

          {missed.length === 0 ? (
            <div className="text-center py-8 text-purple-400">
              <p>No missed doses today! Great job! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missed.map(log => (
                <div key={log._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-4">
                  <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-16 h-16 rounded-xl object-cover opacity-50" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-700 text-lg">✗ {log.medicineName}</h3>
                    <p className="text-gray-600">{formatTime(log.scheduledTime)}</p>
                    <p className="text-sm text-gray-500">{log.tabletsPerDose} tablet(s) • {log.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayDashboard;
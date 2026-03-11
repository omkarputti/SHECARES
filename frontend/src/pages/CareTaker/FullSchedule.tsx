// pages/CareTaker/FullSchedule.tsx
import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

const FullSchedule: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DosageLog[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      
      const logsRes = await fetch('http://localhost:5000/api/dosage-logs/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        logsData.sort((a: DosageLog, b: DosageLog) => 
          new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
        );
        setLogs(logsData);
      }
      
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
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getMedicineImage = (medicineId: string) => {
    const med = medicines.find(m => m._id === medicineId);
    return med?.imageUrl || 'https://via.placeholder.com/100x100/E9D5FF/9333EA?text=M';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Categorize logs
  const takenLogs = logs.filter(l => l.status === 'taken');
  const pendingLogs = logs.filter(l => l.status === 'pending');
  const missedLogs = logs.filter(l => l.status === 'missed');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-lavender-200 flex items-center justify-center">
        <div className="text-purple-600 text-xl">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-lavender-200 pb-24">
      <Header />
      <br /><br />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">📋 Full Schedule</h1>
          <p className="text-purple-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TAKEN Column */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-700">✅ TAKEN</h2>
                <p className="text-sm text-green-600">{takenLogs.length} doses</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {takenLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No doses taken yet</p>
                </div>
              ) : (
                takenLogs.map(log => (
                  <div key={log._id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold text-green-800">{log.medicineName}</h3>
                        <p className="text-xs text-green-600">{log.timeSlot} • {formatTime(log.scheduledTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-green-600 mt-2 pt-2 border-t border-green-200">
                      <span>{log.tabletsPerDose} tablet(s)</span>
                      <span className="font-medium">✓ {log.takenAt ? formatTime(log.takenAt) : 'Done'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PENDING Column */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-orange-700">⏳ PENDING</h2>
                <p className="text-sm text-orange-600">{pendingLogs.length} doses</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {pendingLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>All caught up! 🎉</p>
                </div>
              ) : (
                pendingLogs.map(log => (
                  <div key={log._id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold text-orange-800">{log.medicineName}</h3>
                        <p className="text-xs text-orange-600">{log.timeSlot} • {formatTime(log.scheduledTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-orange-600 mt-2 pt-2 border-t border-orange-200">
                      <span>{log.tabletsPerDose} tablet(s)</span>
                      <span className="font-medium animate-pulse">⏰ Waiting</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MISSED Column */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-300">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                <XCircle className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-700">❌ MISSED</h2>
                <p className="text-sm text-gray-600">{missedLogs.length} doses</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {missedLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No missed doses! 🌟</p>
                </div>
              ) : (
                missedLogs.map(log => (
                  <div key={log._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={getMedicineImage(log.medicineId)} alt={log.medicineName} className="w-12 h-12 rounded-lg object-cover opacity-60" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-700">{log.medicineName}</h3>
                        <p className="text-xs text-gray-600">{log.timeSlot} • {formatTime(log.scheduledTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-300">
                      <span>{log.tabletsPerDose} tablet(s)</span>
                      <span className="font-medium">✗ Skipped</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6">
          <h3 className="text-center text-lg font-bold text-purple-700 mb-4">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{takenLogs.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{pendingLogs.length}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{missedLogs.length}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullSchedule;
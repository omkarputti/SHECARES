// CareTakerRouter.tsx - Mini router just for CareTaker section
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, Plus } from 'lucide-react';
import TodayDashboard from './TodayDashboard';
import FullSchedule from './FullSchedule';
import AddMedicine from './AddMedicine';

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/Caretaker/today', icon: Calendar, label: 'Today' },
    { path: '/Caretaker/schedule', icon: ClipboardList, label: 'Schedule' },
    { path: '/Caretaker', icon: Plus, label: 'Add' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t-2 border-purple-200 shadow-2xl z-50">
      <div className="max-w-lg mx-auto px-6 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg scale-110'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

const CareTakerRouter: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/" element={<AddMedicine />} />
        <Route path="/today" element={<TodayDashboard />} />
        <Route path="/schedule" element={<FullSchedule />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default CareTakerRouter;
import React, { useState, useEffect } from 'react';
import { Hospital, Clock, Wifi, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0D1728]/95 backdrop-blur-md border-b border-[#1E293B] fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6">
      {/* Left side: Hospital info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Hospital className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">MediPriority Central Hospital</span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-400">Emergency Operations Center</span>
        </div>
      </div>

      {/* Right side: Live clock, status, system health */}
      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Live clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-slate-200 text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};

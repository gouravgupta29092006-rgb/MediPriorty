import React, { useState, useEffect } from 'react';
import { Hospital, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-bg-surface border-b border-[var(--border)] fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Left side: Hospital info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Hospital className="w-4 h-4 text-accent" />
          <span className="font-bold text-text-primary">MediPriority Central Hospital</span>
          <span className="text-text-muted">•</span>
          <span className="text-xs text-text-secondary">Emergency Operations Center</span>
        </div>
      </div>

      {/* Right side: Status, clock, theme toggle */}
      <div className="flex items-center gap-3">
        {/* System Online status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--success-light)] border border-[var(--success)] text-[var(--success)] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Live clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface-2 border border-[var(--border)] text-text-primary text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>{time}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="p-2 rounded-lg bg-bg-surface-2 border border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-[var(--border-strong)] transition-all"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

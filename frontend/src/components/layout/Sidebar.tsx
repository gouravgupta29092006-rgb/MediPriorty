import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Users,
  AlertCircle,
  Stethoscope,
  Truck,
  Bed,
  History,
  BarChart3,
  ShieldCheck,
  FileText,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Priority Queue', path: '/priority-queue', icon: Layers },
  { name: 'Emergency Requests', path: '/emergency-requests', icon: AlertCircle },
  { name: 'Clinical Triage', path: '/triage', icon: Stethoscope, roles: ['MEDICAL_OFFICER', 'ADMIN'] },
  { name: 'Ambulances & Dispatch', path: '/ambulances', icon: Truck, roles: ['DISPATCHER', 'ADMIN'] },
  { name: 'Beds & Admissions', path: '/beds', icon: Bed, roles: ['MEDICAL_OFFICER', 'ADMIN', 'DISPATCHER'] },
  { name: 'Patients Directory', path: '/patients', icon: Users },
  { name: 'Allocation History', path: '/allocations', icon: History },
  { name: 'Analytics & KPIs', path: '/analytics', icon: BarChart3 },
  { name: 'User Management', path: '/users', icon: ShieldCheck, roles: ['ADMIN'] },
  { name: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles);
  });

  return (
    <aside className="w-64 bg-bg-sidebar border-r border-[var(--border)] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-md flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-text-primary flex items-center gap-1.5">
            MediPriority
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-accent-light text-accent-text border border-[var(--border)]">
              Pro
            </span>
          </h1>
          <p className="text-[11px] text-text-muted">Emergency Decision Support</p>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-text-muted uppercase mb-2">
          Operations
        </p>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-accent-light'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User info & logout */}
      <div className="p-3 border-t border-[var(--border)] bg-bg-surface-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-bg-surface border border-[var(--border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.fullName}</p>
              <span className="inline-block text-[10px] font-medium text-accent-text bg-accent-light px-1.5 rounded border border-[var(--border)]">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-text-muted hover:text-[var(--critical)] hover:bg-[var(--critical-light)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

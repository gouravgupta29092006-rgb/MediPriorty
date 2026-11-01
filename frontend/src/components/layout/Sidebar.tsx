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
    <aside className="w-64 bg-[#0D1728] border-r border-[#1E293B] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#1E293B]">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
            MediPriority
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Pro
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Emergency Decision Support</p>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#111C2E]'
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
      <div className="p-3 border-t border-[#1E293B] bg-[#0A111E]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111C2E] border border-[#1E293B]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <span className="inline-block text-[10px] font-medium text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-800/40">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

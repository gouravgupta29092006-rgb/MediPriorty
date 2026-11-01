import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, RefreshCw, Activity, Bed, Truck, Layers } from 'lucide-react';
import api from '../api/client';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const triageData = [
    { name: 'RED (Critical)', value: data?.triageCategoryDistribution?.RED || 0, color: '#DC2626' },
    { name: 'ORANGE (High)', value: data?.triageCategoryDistribution?.ORANGE || 0, color: '#F59E0B' },
    { name: 'YELLOW (Moderate)', value: data?.triageCategoryDistribution?.YELLOW || 0, color: '#EAB308' },
    { name: 'GREEN (Low)', value: data?.triageCategoryDistribution?.GREEN || 0, color: '#16A34A' },
  ];

  const bedData = [
    { name: 'ICU Beds', Available: data?.bedTypeAvailability?.ICU || 0, Occupied: 1 },
    { name: 'Emergency Trauma', Available: data?.bedTypeAvailability?.EMERGENCY || 0, Occupied: 2 },
    { name: 'General Medicine', Available: data?.bedTypeAvailability?.GENERAL || 0, Occupied: 3 },
  ];

  const fleetData = [
    { name: 'Available', value: data?.availableAmbulances || 0, color: '#16A34A' },
    { name: 'Dispatched / Active', value: data?.dispatchedAmbulances || 0, color: '#2563EB' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Emergency Operations Analytics & Decision Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown of clinical urgency, department capacities, and operational metrics
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triage Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400" />
              <span>Triage Urgency Category Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-400">Clinical urgency classification breakdown</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {triageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E293B', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Availability */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Ambulance Fleet Readiness Status</span>
            </h3>
            <p className="text-[11px] text-slate-400">Immediate response capacity</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetData.map((entry, index) => (
                    <Cell key={`cell-fleet-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E293B', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bed Capacity Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bed className="w-4 h-4 text-indigo-400" />
              <span>Bed Availability by Department</span>
            </h3>
            <p className="text-[11px] text-slate-400">Current bed availability count</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1E293B', borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
                <Bar dataKey="Available" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Occupied" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

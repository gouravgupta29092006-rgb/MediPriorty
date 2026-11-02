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
import { BarChart3, RefreshCw, Activity, Bed, Truck } from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
    { name: 'RED (Critical)', value: data?.triageCategoryDistribution?.RED || 0, color: '#D94A4A' },
    { name: 'ORANGE (High)', value: data?.triageCategoryDistribution?.ORANGE || 0, color: '#D97706' },
    { name: 'YELLOW (Moderate)', value: data?.triageCategoryDistribution?.YELLOW || 0, color: '#CA8A04' },
    { name: 'GREEN (Low)', value: data?.triageCategoryDistribution?.GREEN || 0, color: '#168653' },
  ];

  const bedData = [
    { name: 'ICU Beds', Available: data?.bedTypeAvailability?.ICU || 0, Occupied: 1 },
    { name: 'Emergency Trauma', Available: data?.bedTypeAvailability?.EMERGENCY || 0, Occupied: 2 },
    { name: 'General Medicine', Available: data?.bedTypeAvailability?.GENERAL || 0, Occupied: 3 },
  ];

  const fleetData = [
    { name: 'Available', value: data?.availableAmbulances || 0, color: '#168653' },
    { name: 'Dispatched / Active', value: data?.dispatchedAmbulances || 0, color: '#2563EB' },
  ];

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1A292E' : '#FFFFFF',
    borderColor: theme === 'dark' ? '#304449' : '#DCE7E6',
    borderRadius: 12,
    fontSize: 12,
    color: theme === 'dark' ? '#E7F0EF' : '#172B3A',
    boxShadow: 'var(--shadow-md)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-accent" />
            <span>Emergency Operations Analytics & Decision Reports</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Statistical breakdown of clinical urgency, department capacities, and operational metrics
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-muted">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold">Generating analytics models...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Triage Distribution Pie Chart */}
          <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--critical)]" />
                <span>Triage Urgency Category Distribution</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Clinical urgency classification breakdown</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={triageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {triageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    formatter={(value) => <span className="text-xs font-medium text-text-secondary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Availability */}
          <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--success)]" />
                <span>Ambulance Fleet Readiness Status</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Immediate response capacity</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetData.map((entry, index) => (
                      <Cell key={`cell-fleet-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    formatter={(value) => <span className="text-xs font-medium text-text-secondary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bed Capacity Bar Chart */}
          <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Bed className="w-4 h-4 text-accent" />
                <span>Bed Availability by Department</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Current bed availability count</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bedData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend formatter={(val) => <span className="text-xs font-medium text-text-secondary">{val}</span>} />
                  <Bar dataKey="Available" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Occupied" fill="#D99A28" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

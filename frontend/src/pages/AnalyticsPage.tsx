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
import { BarChart3, RefreshCw, Activity, Bed, Truck, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { DashboardResponse } from '../types';
import { AnalyticsSkeleton } from '../components/skeleton/PageSkeletons';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<DashboardResponse>('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Failed to load analytics data. Please check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalTriageActive =
    (data?.triageCategoryDistribution?.RED || 0) +
    (data?.triageCategoryDistribution?.ORANGE || 0) +
    (data?.triageCategoryDistribution?.YELLOW || 0) +
    (data?.triageCategoryDistribution?.GREEN || 0);

  const triageData = [
    { name: 'RED (Critical)', value: data?.triageCategoryDistribution?.RED || 0, color: '#DC2626' },
    { name: 'ORANGE (High)', value: data?.triageCategoryDistribution?.ORANGE || 0, color: '#EA580C' },
    { name: 'YELLOW (Moderate)', value: data?.triageCategoryDistribution?.YELLOW || 0, color: '#CA8A04' },
    { name: 'GREEN (Low)', value: data?.triageCategoryDistribution?.GREEN || 0, color: '#16A34A' },
  ];
  const activeTriageData = triageData.filter((d) => d.value > 0);

  const bedData =
    data?.departmentBeds && data.departmentBeds.length > 0
      ? data.departmentBeds.map((dept) => ({
          name: dept.departmentName,
          Available: dept.availableBeds,
          Occupied: dept.occupiedBeds,
          Total: dept.totalBeds,
        }))
      : [
          {
            name: 'Emergency & Trauma Center',
            Available: data?.bedTypeAvailability?.EMERGENCY || 0,
            Occupied: data?.bedTypeOccupied?.EMERGENCY || 0,
            Total: (data?.bedTypeAvailability?.EMERGENCY || 0) + (data?.bedTypeOccupied?.EMERGENCY || 0),
          },
          {
            name: 'Intensive Care Unit (ICU)',
            Available: data?.bedTypeAvailability?.ICU || 0,
            Occupied: data?.bedTypeOccupied?.ICU || 0,
            Total: (data?.bedTypeAvailability?.ICU || 0) + (data?.bedTypeOccupied?.ICU || 0),
          },
          {
            name: 'Cardiology Care Unit',
            Available: 0,
            Occupied: 0,
            Total: 0,
          },
          {
            name: 'General Medicine Ward',
            Available: data?.bedTypeAvailability?.GENERAL || 0,
            Occupied: data?.bedTypeOccupied?.GENERAL || 0,
            Total: (data?.bedTypeAvailability?.GENERAL || 0) + (data?.bedTypeOccupied?.GENERAL || 0),
          },
        ];

  const fleetData = [
    { name: 'Available', value: data?.availableAmbulances || 0, color: '#16A34A' },
    { name: 'Dispatched', value: data?.dispatchedAmbulances || 0, color: '#2563EB' },
    { name: 'On Scene', value: data?.onSceneAmbulances || 0, color: '#7C3AED' },
    { name: 'Returning', value: data?.returningAmbulances || 0, color: '#EA580C' },
    { name: 'Reserved', value: data?.reservedAmbulances || 0, color: '#0891B2' },
    { name: 'Maintenance', value: data?.maintenanceAmbulances || 0, color: '#64748B' },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1A292E' : '#FFFFFF',
    borderColor: theme === 'dark' ? '#304449' : '#DCE7E6',
    borderRadius: 12,
    fontSize: 12,
    color: theme === 'dark' ? '#E7F0EF' : '#172B3A',
    boxShadow: 'var(--shadow-md)',
  };

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

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
      ) : error ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-muted">
          <BarChart3 className="w-12 h-12 text-[var(--critical)] mb-3 opacity-50" />
          <p className="text-sm font-bold text-text-primary">Analytics Unavailable</p>
          <p className="text-xs text-text-secondary mt-1 max-w-sm text-center">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
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
              <p className="text-xs text-text-secondary mt-0.5">Active clinical urgency classification breakdown</p>
            </div>

            {totalTriageActive === 0 ? (
              <div className="h-72 w-full flex flex-col items-center justify-center text-text-muted border border-dashed border-[var(--border)] rounded-xl bg-bg-surface-2/30">
                <CheckCircle2 className="w-10 h-10 text-[var(--success)] mb-2" />
                <p className="text-sm font-bold text-text-primary">No Active Emergency Triage Cases</p>
                <p className="text-xs text-text-secondary mt-1">All current emergency episodes are triaged and allocated</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeTriageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activeTriageData.map((entry, index) => (
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
            )}
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

            {fleetData.length === 0 ? (
              <div className="h-72 w-full flex flex-col items-center justify-center text-text-muted border border-dashed border-[var(--border)] rounded-xl bg-bg-surface-2/30">
                <Truck className="w-10 h-10 text-accent mb-2 opacity-50" />
                <p className="text-sm font-bold text-text-primary">No Fleet Data Available</p>
                <p className="text-xs text-text-secondary mt-1">No ambulance units currently registered in database</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Bed Capacity Bar Chart */}
          <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Bed className="w-4 h-4 text-accent" />
                <span>Bed Availability by Department</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">Real-time department capacity and occupancy counts</p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bedData} margin={{ top: 15, right: 30, left: 0, bottom: 45 }}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: any, name: any) => [`${value} Beds`, name]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12 }}
                    formatter={(val) => <span className="text-xs font-medium text-text-secondary">{val} Beds</span>}
                  />
                  <Bar dataKey="Available" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Occupied" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

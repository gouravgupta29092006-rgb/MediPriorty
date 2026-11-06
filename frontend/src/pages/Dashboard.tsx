import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Truck,
  Bed,
  Layers,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Activity,
  HeartPulse
} from 'lucide-react';
import api from '../api/client';
import { QueueEntry, DashboardResponse } from '../types';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, queueRes] = await Promise.all([
        api.get<DashboardResponse>('/dashboard'),
        api.get<QueueEntry[]>('/priority-queue')
      ]);
      setData(dashRes.data);
      setQueue(queueRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96 text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Aggregating hospital metrics...</p>
        </div>
      </div>
    );
  }

  const redCount = data?.triageCategoryDistribution?.RED || 0;
  const orangeCount = data?.triageCategoryDistribution?.ORANGE || 0;
  const yellowCount = data?.triageCategoryDistribution?.YELLOW || 0;
  const greenCount = data?.triageCategoryDistribution?.GREEN || 0;

  const totalAmbulances =
    (data?.availableAmbulances ?? 0) +
    (data?.dispatchedAmbulances ?? 0) +
    (data?.onSceneAmbulances ?? 0) +
    (data?.returningAmbulances ?? 0) +
    (data?.reservedAmbulances ?? 0) +
    (data?.maintenanceAmbulances ?? 0);

  const activeAmbulances =
    (data?.dispatchedAmbulances ?? 0) +
    (data?.onSceneAmbulances ?? 0) +
    (data?.returningAmbulances ?? 0) +
    (data?.reservedAmbulances ?? 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-accent" />
            <span>Emergency Command Overview</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time decision support, custom heap prioritization, and allocation metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/triage"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-semibold text-white transition-all shadow-sm"
          >
            <HeartPulse className="w-4 h-4" />
            <span>New Triage Assessment</span>
          </Link>
        </div>
      </div>

      {/* Critical Banner if RED Patients Waiting */}
      {redCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] dark:border-[var(--critical)] flex items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 border border-[#F87171] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--critical)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--critical)]">
                CRITICAL TRIAGE ALERT: {redCount} Patient{redCount > 1 ? 's' : ''} in Category RED
              </p>
              <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-0.5">
                Immediate life-threatening urgency detected. Immediate ambulance dispatch and ICU bed reservation required.
              </p>
            </div>
          </div>
          <Link
            to="/priority-queue"
            className="px-4 py-2 rounded-xl bg-[var(--critical)] hover:opacity-90 text-xs font-semibold text-white whitespace-nowrap transition-all shadow-sm"
          >
            View Queue
          </Link>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Emergency Requests */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Active Emergencies</span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">
              {data?.totalActiveRequests ?? 0}
            </span>
            <span className="text-xs text-text-secondary font-medium">episodes active</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-text-secondary">
            <span>Pending Triage:</span>
            <span className="font-bold text-[var(--warning)]">{data?.waitingPatients ?? 0}</span>
          </div>
        </div>

        {/* Priority Queue (Binary Heap) */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Patient Priority Queue</span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Layers className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">
              {queue.length}
            </span>
            <span className="text-xs text-text-secondary font-medium">awaiting allocation</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-text-secondary">
            <span>Top Urgency:</span>
            <span className="font-bold text-[var(--critical)]">
              {queue.length > 0 ? `${queue[0].triageCategory} (Req #${queue[0].requestId})` : 'Queue Empty'}
            </span>
          </div>
        </div>

        {/* Available Ambulances */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Ambulances Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Truck className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-accent tracking-tight">
              {data?.availableAmbulances ?? 0}
            </span>
            <span className="text-xs text-text-secondary font-medium">
              available / {totalAmbulances} total
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-text-secondary">
            <span>Dispatched / Active:</span>
            <span className="font-bold text-[var(--warning)]">{activeAmbulances}</span>
          </div>
        </div>

        {/* Available Beds */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Hospital Beds</span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
              <Bed className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary tracking-tight">
              {data?.availableBeds ?? 0}
            </span>
            <span className="text-xs text-text-secondary font-medium">
              free of {data?.totalBeds ?? 0} beds
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-text-secondary">
            <span>Occupancy Rate:</span>
            <span className="font-bold text-text-primary">
              {data?.totalBeds ? Math.round(((data.occupiedBeds || 0) / data.totalBeds) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Triage Severity Breakdown & Bed Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Triage Urgency Distribution */}
        <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Triage Severity Distribution</h3>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinical Urgency</span>
          </div>
          <div className="space-y-2.5">
            {/* RED */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FEF2F2] dark:bg-[var(--critical-light)] border border-[#FEE2E2] dark:border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--critical)]" />
                <span className="text-xs font-bold text-[var(--critical)]">RED — Critical (Priority 1)</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--critical)]">{redCount}</span>
            </div>

            {/* ORANGE */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFBEB] dark:bg-[var(--warning-light)] border border-[#FEF3C7] dark:border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" />
                <span className="text-xs font-bold text-[var(--warning)]">ORANGE — High (Priority 2)</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--warning)]">{orangeCount}</span>
            </div>

            {/* YELLOW */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FEFCE8] dark:bg-yellow-950/20 border border-[#FEF9C3] dark:border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]" />
                <span className="text-xs font-bold text-[#CA8A04] dark:text-yellow-400">YELLOW — Moderate (Priority 3)</span>
              </div>
              <span className="text-sm font-extrabold text-[#CA8A04] dark:text-yellow-400">{yellowCount}</span>
            </div>

            {/* GREEN */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDF4] dark:bg-[var(--success-light)] border border-[#DCFCE7] dark:border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]" />
                <span className="text-xs font-bold text-[var(--success)]">GREEN — Low (Priority 4)</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--success)]">{greenCount}</span>
            </div>
          </div>
        </div>

        {/* Live Priority Queue Top Items (Min-Heap Snapshot) */}
        <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-text-primary">Live Patient Priority Queue</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-light text-accent border border-[var(--border)]">
                Binary Min-Heap
              </span>
            </div>
            <Link
              to="/priority-queue"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-bold"
            >
              <span>Full Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted border border-dashed border-[var(--border)] rounded-2xl bg-bg-surface-2/40">
              <CheckCircle2 className="w-12 h-12 text-[var(--success)] mb-2.5" />
              <p className="text-sm font-bold text-text-primary">All active emergency requests triaged & resolved</p>
              <p className="text-xs text-text-secondary mt-1">New requests will order automatically by medical urgency</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {queue.slice(0, 4).map((item, index) => {
                const badgeColor =
                  item.triageCategory === 'RED'
                    ? 'bg-[#FEF2F2] dark:bg-[var(--critical-light)] text-[var(--critical)] border-[#FCA5A5]'
                    : item.triageCategory === 'ORANGE'
                    ? 'bg-[#FFFBEB] dark:bg-[var(--warning-light)] text-[var(--warning)] border-[#FCD34D]'
                    : item.triageCategory === 'YELLOW'
                    ? 'bg-[#FEFCE8] text-[#CA8A04] border-[#FDE047]'
                    : 'bg-[#F0FDF4] dark:bg-[var(--success-light)] text-[var(--success)] border-[#86EFAC]';

                return (
                  <div
                    key={item.requestId}
                    className="p-3.5 rounded-xl bg-bg-surface-2 border border-[var(--border)] flex items-center justify-between hover:border-[var(--border-strong)] transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-7 h-7 rounded-lg bg-bg-surface flex items-center justify-center text-xs font-bold text-text-secondary border border-[var(--border)] shadow-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{item.patientName}</span>
                          <span className="text-[10px] text-text-muted font-mono bg-bg-surface px-1.5 py-0.5 rounded border border-[var(--border)]">
                            {item.requestNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-2">
                          <span>Status: {item.requestStatus.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Reg: {new Date(item.registeredAt).toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badgeColor}`}>
                        {item.triageCategory} (P{item.priorityValue})
                      </span>
                      <Link
                        to="/ambulances"
                        className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        Dispatch
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

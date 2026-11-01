import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Truck,
  Bed,
  Layers,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse
} from 'lucide-react';
import api from '../api/client';
import { QueueEntry } from '../types';

interface DashboardData {
  totalActiveRequests: number;
  criticalPatients: number;
  waitingPatients: number;
  availableAmbulances: number;
  dispatchedAmbulances: number;
  availableBeds: number;
  occupiedBeds: number;
  totalBeds: number;
  triageCategoryDistribution: Record<string, number>;
  bedTypeAvailability: Record<string, number>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [dashRes, queueRes] = await Promise.all([
        api.get<DashboardData>('/dashboard'),
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
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Aggregating hospital metrics...</p>
        </div>
      </div>
    );
  }

  const redCount = data?.triageCategoryDistribution?.RED || 0;
  const orangeCount = data?.triageCategoryDistribution?.ORANGE || 0;
  const yellowCount = data?.triageCategoryDistribution?.YELLOW || 0;
  const greenCount = data?.triageCategoryDistribution?.GREEN || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Emergency Command Overview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time decision support, custom heap prioritization, and allocation metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/triage"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/20"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>New Triage Assessment</span>
          </Link>
        </div>
      </div>

      {/* Critical Banner if RED Patients Waiting */}
      {redCount > 0 && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-200">
                CRITICAL TRIAGE ALERT: {redCount} Patient{redCount > 1 ? 's' : ''} in Category RED
              </p>
              <p className="text-xs text-red-300/80 mt-0.5">
                Immediate life-threatening urgency detected. Immediate ambulance dispatch and ICU bed reservation required.
              </p>
            </div>
          </div>
          <Link
            to="/priority-queue"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white whitespace-nowrap transition-colors"
          >
            View Queue
          </Link>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Emergency Requests */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Emergencies</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {data?.totalActiveRequests ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">episodes active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending Triage:</span>
            <span className="font-semibold text-amber-400">{data?.waitingPatients ?? 0}</span>
          </div>
        </div>

        {/* Priority Queue (Binary Heap) */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Heap Priority Queue</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {queue.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">in clinical min-heap</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
            <span>Top Urgency:</span>
            <span className="font-semibold text-red-400">
              {queue.length > 0 ? `${queue[0].triageCategory} (Req #${queue[0].requestId})` : 'Queue Empty'}
            </span>
          </div>
        </div>

        {/* Available Ambulances */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Ambulances Fleet</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {data?.availableAmbulances ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              available / {(data?.availableAmbulances ?? 0) + (data?.dispatchedAmbulances ?? 0)} total
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
            <span>Dispatched / Active:</span>
            <span className="font-semibold text-amber-400">{data?.dispatchedAmbulances ?? 0}</span>
          </div>
        </div>

        {/* Available Beds */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Hospital Beds</span>
            <Bed className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {data?.availableBeds ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              free of {data?.totalBeds ?? 0} beds
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
            <span>Occupancy Rate:</span>
            <span className="font-semibold text-slate-200">
              {data?.totalBeds ? Math.round(((data.occupiedBeds || 0) / data.totalBeds) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Triage Severity Breakdown & Bed Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Triage Urgency Distribution */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Triage Severity Distribution</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Clinical Urgency</span>
          </div>
          <div className="space-y-3">
            {/* RED */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-300">RED — Critical (Priority 1)</span>
              </div>
              <span className="text-sm font-bold text-red-400">{redCount}</span>
            </div>

            {/* ORANGE */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-300">ORANGE — High (Priority 2)</span>
              </div>
              <span className="text-sm font-bold text-amber-400">{orangeCount}</span>
            </div>

            {/* YELLOW */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-950/20 border border-yellow-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold text-yellow-300">YELLOW — Moderate (Priority 3)</span>
              </div>
              <span className="text-sm font-bold text-yellow-400">{yellowCount}</span>
            </div>

            {/* GREEN */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-300">GREEN — Low (Priority 4)</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{greenCount}</span>
            </div>
          </div>
        </div>

        {/* Live Priority Queue Top Items (Min-Heap Snapshot) */}
        <div className="p-5 rounded-xl bg-[#111C2E] border border-[#1E293B] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Live Patient Priority Queue</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Binary Min-Heap
              </span>
            </div>
            <Link
              to="/priority-queue"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Full Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 border border-dashed border-[#1E293B] rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
              <p className="text-xs font-medium">All active emergency requests triaged & resolved</p>
              <p className="text-[11px] text-slate-500 mt-0.5">New requests will order automatically by medical urgency</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.slice(0, 4).map((item, index) => {
                const badgeColor =
                  item.triageCategory === 'RED'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : item.triageCategory === 'ORANGE'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : item.triageCategory === 'YELLOW'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                return (
                  <div
                    key={item.requestId}
                    className="p-3 rounded-lg bg-[#0B1220] border border-[#1E293B] flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[#111C2E] flex items-center justify-center text-xs font-bold text-slate-400 border border-[#1E293B]">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{item.patientName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.requestNumber}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Status: {item.requestStatus.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Reg: {new Date(item.registeredAt).toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}>
                        {item.triageCategory} (P{item.priorityValue})
                      </span>
                      <Link
                        to="/ambulances"
                        className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 transition-colors"
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  Bed,
  CheckCircle2,
  Info
} from 'lucide-react';
import api from '../api/client';
import { QueueEntry } from '../types';
import { useAuth } from '../context/AuthContext';

export const PriorityQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { hasRole } = useAuth();

  const fetchQueue = async () => {
    try {
      const res = await api.get<QueueEntry[]>('/priority-queue');
      setQueue(res.data || []);
    } catch (err) {
      console.error('Failed to load priority queue', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRebuild = async () => {
    try {
      setRefreshing(true);
      await api.post('/priority-queue/rebuild');
      await fetchQueue();
    } catch (err) {
      console.error('Rebuild failed', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'RED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ORANGE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'YELLOW':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Emergency Patient Priority Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by Array-Backed Binary Min-Heap (<code className="text-purple-300">com.medipriority.dsa.heap.PatientPriorityQueue</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchQueue();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>

          {hasRole(['ADMIN']) && (
            <button
              onClick={handleRebuild}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Heap Rebuild O(n)</span>
            </button>
          )}
        </div>
      </div>

      {/* DSA Educational Explainer Banner */}
      <div className="p-4 rounded-xl bg-[#111C2E] border border-[#1E293B] flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-white">How the Priority Min-Heap Works</p>
          <p className="text-slate-400 leading-relaxed">
            Patients are ordered by <strong className="text-slate-200">1) Clinical Urgency</strong> (RED = 1, ORANGE = 2, YELLOW = 3, GREEN = 4). Ties are broken strictly by <strong className="text-slate-200">2) Registration Timestamp</strong> (earlier arrival first), followed by <strong className="text-slate-200">3) Request ID</strong> for deterministic uniqueness. Clinical reassessment utilizes <strong className="text-slate-200">Version Registry</strong> to lazily purge stale entries without scanning the array.
          </p>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Ordered Heap Nodes</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {queue.length} Active Candidates
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Live extraction order (Root first)</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Querying min-heap...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mb-2" />
            <p className="text-sm font-medium text-slate-300">Heap Queue is Empty</p>
            <p className="text-xs text-slate-500 mt-1">No emergency requests are currently awaiting allocation.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E293B]">
            {queue.map((entry, index) => {
              const isRoot = index === 0;
              return (
                <div
                  key={entry.requestId}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isRoot ? 'bg-purple-950/15' : 'hover:bg-[#18253C]/40'
                  }`}
                >
                  {/* Left: Position, Name, Request Code */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isRoot
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-[#0B1220] border border-[#1E293B] text-slate-400'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{entry.patientName}</span>
                        <span className="text-xs font-mono text-slate-400 bg-[#0B1220] px-2 py-0.5 rounded border border-[#1E293B]">
                          {entry.requestNumber}
                        </span>
                        {isRoot && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Heap Root (Next Serve)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono bg-[#0B1220] px-1.5 py-0.5 rounded border border-[#1E293B]">
                          v{entry.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Registered: {new Date(entry.registeredAt).toLocaleString()}</span>
                        </span>
                        <span>•</span>
                        <span>Status: <strong className="text-slate-300">{entry.requestStatus.replace('_', ' ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Triage Badge & Action Buttons */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border tracking-wide ${getCategoryBadge(
                        entry.triageCategory
                      )}`}
                    >
                      {entry.triageCategory} (Priority {entry.priorityValue})
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to="/ambulances"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Ambulance</span>
                      </Link>

                      <Link
                        to="/beds"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all"
                      >
                        <Bed className="w-3.5 h-3.5" />
                        <span>Assign Bed</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  RefreshCw,
  Clock,
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
    const interval = setInterval(fetchQueue, 4000);
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
        return 'bg-[#FEF2F2] dark:bg-[var(--critical-light)] text-[var(--critical)] border-[#FCA5A5]';
      case 'ORANGE':
        return 'bg-[#FFFBEB] dark:bg-[var(--warning-light)] text-[var(--warning)] border-[#FCD34D]';
      case 'YELLOW':
        return 'bg-[#FEFCE8] text-[#CA8A04] border-[#FDE047]';
      default:
        return 'bg-[#F0FDF4] dark:bg-[var(--success-light)] text-[var(--success)] border-[#86EFAC]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-accent" />
            <span>Emergency Patient Priority Queue</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time clinical urgency ranking and deterministic allocation queue (Min-Heap Engine)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchQueue();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {hasRole(['ADMIN']) && (
            <button
              onClick={handleRebuild}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Priority List</span>
            </button>
          )}
        </div>
      </div>

      {/* Clinical Operations Explainer Banner */}
      <div className="p-5 rounded-2xl bg-accent-light border border-[var(--border)] flex items-start gap-4 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-bg-surface border border-[var(--border)] flex items-center justify-center flex-shrink-0 text-accent shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-bold text-text-primary">Clinical Urgency Ordering & Automated Priority Balancing</p>
          <p className="text-text-secondary leading-relaxed">
            Patients are ordered primarily by <strong className="text-text-primary">1) Clinical Urgency</strong> (RED = Priority 1, ORANGE = Priority 2, YELLOW = Priority 3, GREEN = Priority 4). Equal urgency ties are resolved by <strong className="text-text-primary">2) Registration Time</strong> (earliest arrival first), followed by <strong className="text-text-primary">3) Request ID</strong> for deterministic consistency. Clinical reassessments synchronize priorities automatically to ensure high-acuity patients are surfaced immediately.
          </p>
        </div>
      </div>

      {/* Queue List Card */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-text-primary">Emergency Patient Priority List</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-light text-accent border border-[var(--border)]">
              {queue.length} Pending Emergency Patients
            </span>
          </div>
          <span className="text-xs text-text-muted">Highest Priority First</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Loading patient priority list...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted">
            <CheckCircle2 className="w-12 h-12 text-[var(--success)] mb-3" />
            <p className="text-base font-bold text-text-primary">No Pending Emergency Patients</p>
            <p className="text-xs text-text-secondary mt-1">No emergency requests are currently awaiting allocation.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {queue.map((entry, index) => {
              const isRoot = index === 0;
              return (
                <div
                  key={entry.requestId}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isRoot ? 'bg-accent-light/40 dark:bg-accent-light/10' : 'hover:bg-bg-surface-2/60'
                  }`}
                >
                  {/* Left: Position, Name, Request Code */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                        isRoot
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-bg-surface-2 border border-[var(--border)] text-text-secondary'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-text-primary">{entry.patientName}</span>
                        <span className="text-xs font-mono text-text-muted bg-bg-surface-2 px-2 py-0.5 rounded border border-[var(--border)]">
                          {entry.requestNumber}
                        </span>
                        {isRoot && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent text-white shadow-sm">
                            Highest Priority (Next)
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted font-mono bg-bg-surface-2 px-1.5 py-0.5 rounded border border-[var(--border)]">
                          v{entry.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          <span>Registered: {new Date(entry.registeredAt).toLocaleString()}</span>
                        </span>
                        <span>•</span>
                        <span>Status: <strong className="text-text-primary">{entry.requestStatus.replace('_', ' ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Triage Badge & Action Buttons */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border tracking-wide ${getCategoryBadge(
                        entry.triageCategory
                      )}`}
                    >
                      {entry.triageCategory} (Priority {entry.priorityValue})
                    </span>

                    <div className="flex items-center gap-2">
                      {hasRole(['DISPATCHER']) && (
                        <Link
                          to={`/ambulances?dispatchRequestId=${entry.requestId}`}
                          className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Ambulance</span>
                        </Link>
                      )}

                      {hasRole(['MEDICAL_OFFICER', 'ADMIN']) && (
                        <Link
                          to="/beds"
                          className="px-3.5 py-1.5 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Bed className="w-3.5 h-3.5 text-accent" />
                          <span>Assign Bed</span>
                        </Link>
                      )}
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

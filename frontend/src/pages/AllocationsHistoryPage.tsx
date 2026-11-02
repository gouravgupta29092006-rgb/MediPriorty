import React, { useEffect, useState } from 'react';
import { History, Truck, Bed, RefreshCw, Check } from 'lucide-react';
import api from '../api/client';
import { AmbulanceAllocation, BedAllocation } from '../types';

export const AllocationsHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AMBULANCE' | 'BED'>('AMBULANCE');
  const [ambulanceAllocs, setAmbulanceAllocs] = useState<AmbulanceAllocation[]>([]);
  const [bedAllocs, setBedAllocs] = useState<BedAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ambRes, bedRes] = await Promise.all([
        api.get('/allocations/ambulance', { params: { size: 50 } }),
        api.get('/allocations/bed', { params: { size: 50 } }),
      ]);
      setAmbulanceAllocs(ambRes.data.content || []);
      setBedAllocs(bedRes.data.content || []);
    } catch (err) {
      console.error('Failed to load allocations history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <History className="w-6 h-6 text-accent" />
            <span>Resource Allocation History & Audit</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Immutable tracking of all ambulance dispatches, patient arrivals, and hospital bed occupancies
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 text-xs">
        <button
          onClick={() => setActiveTab('AMBULANCE')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all shadow-sm ${
            activeTab === 'AMBULANCE'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-bg-surface border border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-[var(--border-strong)]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Ambulance Missions ({ambulanceAllocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BED')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all shadow-sm ${
            activeTab === 'BED'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-bg-surface border border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-[var(--border-strong)]'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Bed Reservations ({bedAllocs.length})</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-semibold">Loading allocation history records...</span>
          </div>
        ) : activeTab === 'AMBULANCE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Alloc #</th>
                  <th className="py-3.5 px-5">Request #</th>
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-5">Ambulance Unit</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Dispatched At</th>
                  <th className="py-3.5 px-5">Arrival At</th>
                  <th className="py-3.5 px-5">Completed At</th>
                  <th className="py-3.5 px-5">Dispatcher</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-text-primary">
                {ambulanceAllocs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-text-muted font-medium">
                      No ambulance allocations recorded.
                    </td>
                  </tr>
                ) : (
                  ambulanceAllocs.map((a) => (
                    <tr key={a.allocationId} className="hover:bg-bg-surface-2/60 transition-colors">
                      <td className="py-4 px-5 font-mono font-medium text-text-muted">#{a.allocationId}</td>
                      <td className="py-4 px-5 font-mono text-accent font-bold">{a.requestNumber}</td>
                      <td className="py-4 px-5 font-bold text-text-primary">{a.patientName}</td>
                      <td className="py-4 px-5 font-mono text-text-primary font-medium">{a.ambulanceRegistration}</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-bg-surface-2 border border-[var(--border)] text-text-secondary">
                          {a.ambulanceType}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-text-secondary">{new Date(a.dispatchTime).toLocaleTimeString()}</td>
                      <td className="py-4 px-5 text-text-secondary">{a.arrivalTime ? new Date(a.arrivalTime).toLocaleTimeString() : '—'}</td>
                      <td className="py-4 px-5 text-text-secondary">{a.completionTime ? new Date(a.completionTime).toLocaleTimeString() : '—'}</td>
                      <td className="py-4 px-5 text-text-secondary">{a.allocatedBy}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          a.status === 'COMPLETED'
                            ? 'text-[var(--success)] bg-[#DCFCE7] dark:bg-[var(--success-light)]'
                            : 'text-accent bg-accent-light'
                        }`}>
                          {a.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                          <span>{a.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Alloc #</th>
                  <th className="py-3.5 px-5">Request #</th>
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-5">Bed Number</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Bed Type</th>
                  <th className="py-3.5 px-5">Reserved At</th>
                  <th className="py-3.5 px-5">Admitted At</th>
                  <th className="py-3.5 px-5">Released At</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-text-primary">
                {bedAllocs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-text-muted font-medium">
                      No bed reservations recorded.
                    </td>
                  </tr>
                ) : (
                  bedAllocs.map((b) => (
                    <tr key={b.allocationId} className="hover:bg-bg-surface-2/60 transition-colors">
                      <td className="py-4 px-5 font-mono font-medium text-text-muted">#{b.allocationId}</td>
                      <td className="py-4 px-5 font-mono text-accent font-bold">{b.requestNumber}</td>
                      <td className="py-4 px-5 font-bold text-text-primary">{b.patientName}</td>
                      <td className="py-4 px-5 font-mono text-text-primary font-bold">{b.bedNumber}</td>
                      <td className="py-4 px-5 text-text-secondary">{b.departmentName}</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-bg-surface-2 border border-[var(--border)] text-text-secondary">
                          {b.bedType}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-text-secondary">{new Date(b.reservedAt).toLocaleTimeString()}</td>
                      <td className="py-4 px-5 text-text-secondary">{b.admittedAt ? new Date(b.admittedAt).toLocaleTimeString() : '—'}</td>
                      <td className="py-4 px-5 text-text-secondary">{b.releasedAt ? new Date(b.releasedAt).toLocaleTimeString() : '—'}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          b.status === 'COMPLETED'
                            ? 'text-[var(--success)] bg-[#DCFCE7] dark:bg-[var(--success-light)]'
                            : 'text-accent bg-accent-light'
                        }`}>
                          {b.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                          <span>{b.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { History, Truck, Bed, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
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
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Resource Allocation History & Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable tracking of all ambulance dispatches, patient arrivals, and hospital bed occupancies
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs border-b border-[#1E293B] pb-2">
        <button
          onClick={() => setActiveTab('AMBULANCE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'AMBULANCE'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-[#111C2E] border border-[#1E293B] text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Ambulance Missions ({ambulanceAllocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'BED'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-[#111C2E] border border-[#1E293B] text-slate-400 hover:text-white'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Bed Reservations ({bedAllocs.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading allocation history records...</span>
          </div>
        ) : activeTab === 'AMBULANCE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Alloc #</th>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Ambulance Unit</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Arrival At</th>
                  <th className="py-3 px-4">Completed At</th>
                  <th className="py-3 px-4">Dispatcher</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-300">
                {ambulanceAllocs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-500">
                      No ambulance allocations recorded.
                    </td>
                  </tr>
                ) : (
                  ambulanceAllocs.map((a) => (
                    <tr key={a.allocationId} className="hover:bg-[#18253C]/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{a.allocationId}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-400 font-semibold">{a.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{a.patientName}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">{a.ambulanceRegistration}</td>
                      <td className="py-3.5 px-4 text-slate-400">{a.ambulanceType}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(a.dispatchTime).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-4 text-slate-400">{a.arrivalTime ? new Date(a.arrivalTime).toLocaleTimeString() : '—'}</td>
                      <td className="py-3.5 px-4 text-slate-400">{a.completionTime ? new Date(a.completionTime).toLocaleTimeString() : '—'}</td>
                      <td className="py-3.5 px-4 text-slate-300">{a.allocatedBy}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          a.status === 'ACTIVE'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {a.status}
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
              <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Alloc #</th>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Bed Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Bed Type</th>
                  <th className="py-3 px-4">Reserved At</th>
                  <th className="py-3 px-4">Admitted At</th>
                  <th className="py-3 px-4">Released At</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-300">
                {bedAllocs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-500">
                      No bed reservations recorded.
                    </td>
                  </tr>
                ) : (
                  bedAllocs.map((b) => (
                    <tr key={b.allocationId} className="hover:bg-[#18253C]/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{b.allocationId}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-400 font-semibold">{b.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{b.patientName}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">{b.bedNumber}</td>
                      <td className="py-3.5 px-4 text-slate-300">{b.departmentName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{b.bedType}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(b.reservedAt).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-4 text-slate-400">{b.admittedAt ? new Date(b.admittedAt).toLocaleTimeString() : '—'}</td>
                      <td className="py-3.5 px-4 text-slate-400">{b.releasedAt ? new Date(b.releasedAt).toLocaleTimeString() : '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          b.status === 'ACTIVE'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {b.status}
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

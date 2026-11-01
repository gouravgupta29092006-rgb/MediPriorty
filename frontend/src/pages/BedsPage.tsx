import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bed as BedIcon,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  LogOut,
  UserCheck,
  Activity
} from 'lucide-react';
import api from '../api/client';
import { Bed, EmergencyRequest, BedAllocation, BedStatus, BedType } from '../types';

export const BedsPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [allocations, setAllocations] = useState<BedAllocation[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bedsRes, reqRes, allocRes] = await Promise.all([
        api.get('/beds', { params: { size: 100 } }),
        api.get('/emergency-requests', { params: { size: 50 } }),
        api.get('/allocations/bed', { params: { size: 20 } }),
      ]);

      setBeds(bedsRes.data.content || []);

      // Requests eligible for bed reservation
      const candidates = (reqRes.data.content || []).filter(
        (r: EmergencyRequest) =>
          r.requestStatus === 'ARRIVED' ||
          r.requestStatus === 'AMBULANCE_DISPATCHED' ||
          r.requestStatus === 'TRIAGED'
      );
      setActiveRequests(candidates);

      // Check query param
      const params = new URLSearchParams(location.search);
      const qReqId = params.get('assignRequestId');
      if (qReqId) {
        setSelectedRequestId(Number(qReqId));
      } else if (candidates.length > 0 && selectedRequestId === '') {
        setSelectedRequestId(candidates[0].requestId);
      }

      setAllocations(allocRes.data.content || []);
    } catch (err) {
      console.error('Failed to load beds data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAutoAssign = async () => {
    if (!selectedRequestId) {
      setMsg({ type: 'error', text: 'Select an emergency incident to assign a bed' });
      return;
    }

    setAssigning(true);
    setMsg(null);

    try {
      const res = await api.post('/allocations/bed/auto', {
        requestId: Number(selectedRequestId),
      });
      setMsg({
        type: 'success',
        text: `Bed [${res.data.bedNumber}] in ${res.data.departmentName} successfully reserved!`,
      });
      fetchData();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Bed allocation failed. No suitable beds available.',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async (bedId: number) => {
    if (!selectedRequestId) {
      setMsg({ type: 'error', text: 'Select a patient above before picking a bed' });
      return;
    }

    setAssigning(true);
    setMsg(null);

    try {
      const res = await api.post('/allocations/bed/manual', {
        requestId: Number(selectedRequestId),
        bedId,
      });
      setMsg({
        type: 'success',
        text: `Bed [${res.data.bedNumber}] successfully assigned!`,
      });
      fetchData();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Bed reservation failed.',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleAdmit = async (allocationId: number) => {
    try {
      await api.patch(`/allocations/bed/${allocationId}/admit`);
      setMsg({ type: 'success', text: 'Patient admitted to bed. Status updated to OCCUPIED.' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Admit failed' });
    }
  };

  const handleRelease = async (allocationId: number) => {
    try {
      await api.patch(`/allocations/bed/${allocationId}/release`);
      setMsg({ type: 'success', text: 'Patient discharged. Bed marked CLEANING and incident CLOSED.' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Release failed' });
    }
  };

  const handleSetBedStatus = async (bedId: number, status: BedStatus) => {
    try {
      await api.patch(`/beds/${bedId}/status`, { status });
      setMsg({ type: 'success', text: `Bed status updated to ${status}.` });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Status update failed' });
    }
  };

  const filteredBeds = beds.filter((b) => {
    if (selectedDeptFilter === 'ALL') return true;
    return b.bedType === selectedDeptFilter;
  });

  const getBedCardColor = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
      case 'RESERVED':
        return 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300';
      case 'OCCUPIED':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
      case 'CLEANING':
        return 'border-purple-500/40 bg-purple-950/20 text-purple-300';
      default:
        return 'border-red-500/40 bg-red-950/20 text-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BedIcon className="w-5 h-5 text-indigo-400" />
            <span>Hospital Bed Management & Admissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pessimistic locking bed reservations across ICU, Emergency, and General Medicine
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Beds</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Bed Reservation Action Bar */}
      <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Patient to Allocate Bed *
          </label>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Choose active emergency request --</option>
            {activeRequests.map((r) => (
              <option key={r.requestId} value={r.requestId}>
                {r.requestNumber} • {r.patientName} [{r.requestStatus}] (Needs {r.requiredBedType || 'GENERAL'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 w-full md:w-auto pt-2 md:pt-0">
          <button
            onClick={handleAutoAssign}
            disabled={assigning || !selectedRequestId}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            <span>Auto-Reserve Optimal Bed</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {[
          { label: 'All Beds', value: 'ALL' },
          { label: 'ICU Beds', value: 'ICU' },
          { label: 'Emergency Trauma Beds', value: 'EMERGENCY' },
          { label: 'General Medicine Beds', value: 'GENERAL' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedDeptFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedDeptFilter === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#111C2E] border border-[#1E293B] text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Bed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredBeds.map((bed) => {
          const isAvail = bed.status === 'AVAILABLE';
          const isCleaning = bed.status === 'CLEANING';

          return (
            <div
              key={bed.bedId}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${getBedCardColor(
                bed.status
              )}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-white">{bed.bedNumber}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0B1220]/60">
                    {bed.bedType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{bed.departmentName}</p>
                <p className="text-xs font-semibold mt-2">{bed.status}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1.5">
                {isAvail ? (
                  <button
                    onClick={() => handleManualAssign(bed.bedId)}
                    disabled={!selectedRequestId || assigning}
                    className="w-full py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[11px] font-bold transition-colors"
                  >
                    Reserve Bed
                  </button>
                ) : isCleaning ? (
                  <button
                    onClick={() => handleSetBedStatus(bed.bedId, 'AVAILABLE')}
                    className="w-full py-1 px-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors"
                  >
                    Mark Ready
                  </button>
                ) : (
                  <span className="text-[10px] text-center text-slate-400 font-mono py-1">In Use</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Bed Allocations / Occupancy Table */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Active Bed Occupancy & Allocations</h3>
          <span className="text-xs text-slate-400">Live Inpatients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Bed #</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Reserved At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {allocations.filter((a) => a.status === 'ACTIVE').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active bed reservations currently recorded.
                  </td>
                </tr>
              ) : (
                allocations
                  .filter((a) => a.status === 'ACTIVE')
                  .map((alloc) => (
                    <tr key={alloc.allocationId} className="hover:bg-[#18253C]/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{alloc.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{alloc.patientName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{alloc.bedNumber}</td>
                      <td className="py-3.5 px-4 text-slate-400">{alloc.departmentName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(alloc.reservedAt).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {alloc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {!alloc.admittedAt && (
                          <button
                            onClick={() => handleAdmit(alloc.allocationId)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold"
                          >
                            Admit to Bed
                          </button>
                        )}
                        <button
                          onClick={() => handleRelease(alloc.allocationId)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded text-[11px] font-semibold"
                        >
                          Discharge / Release
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

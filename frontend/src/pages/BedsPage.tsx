import React, { useEffect, useState } from 'react';
import {
  Bed as BedIcon,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import { Bed, EmergencyRequest, BedAllocation, BedStatus } from '../types';

export const BedsPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [allocations, setAllocations] = useState<BedAllocation[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bedsRes, reqRes, allocRes] = await Promise.all([
        api.get('/beds', { params: { size: 100 } }),
        api.get('/emergency-requests', { params: { size: 50 } }),
        api.get('/allocations/bed', { params: { size: 20 } }),
      ]);

      setBeds(bedsRes.data.content || []);

      const candidates = (reqRes.data.content || []).filter(
        (r: EmergencyRequest) =>
          r.requestStatus === 'ARRIVED' ||
          r.requestStatus === 'AMBULANCE_DISPATCHED' ||
          r.requestStatus === 'TRIAGED'
      );
      setActiveRequests(candidates);

      const params = new URLSearchParams(window.location.search);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <BedIcon className="w-6 h-6 text-accent" />
            <span>Hospital Bed Management & Admissions</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Pessimistic locking bed reservations across ICU, Emergency, and General Medicine
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh Beds</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs shadow-sm ${
            msg.type === 'success'
              ? 'bg-[#DCFCE7] dark:bg-[var(--success-light)] border-[#86EFAC] dark:border-[var(--success)] text-[var(--success)]'
              : 'bg-[#FEE2E2] dark:bg-[var(--critical-light)] border-[#FCA5A5] dark:border-[var(--critical)] text-[var(--critical)]'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Bed Reservation Action Bar */}
      <div className="p-5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-bold text-text-primary mb-1.5">
            Select Patient to Allocate Bed *
          </label>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
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
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
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
            className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedDeptFilter === tab.value
                ? 'bg-accent text-white shadow-sm'
                : 'bg-bg-surface border border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-[var(--border-strong)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Bed Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-muted">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Loading hospital beds...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBeds.map((bed) => {
            const isAvail = bed.status === 'AVAILABLE';
            const isCleaning = bed.status === 'CLEANING';

            return (
              <div
                key={bed.bedId}
                className="p-4 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm flex flex-col justify-between hover:border-[var(--border-strong)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-extrabold text-sm text-text-primary">{bed.bedNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-light text-accent border border-[var(--border)]">
                      {bed.bedType}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary truncate">{bed.departmentName}</p>
                  <p
                    className={`text-xs font-bold mt-2 uppercase tracking-wide ${
                      isAvail
                        ? 'text-[var(--success)]'
                        : bed.status === 'RESERVED'
                        ? 'text-[var(--warning)]'
                        : 'text-[var(--critical)]'
                    }`}
                  >
                    {bed.status}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-col gap-1.5">
                  {isAvail ? (
                    <button
                      onClick={() => handleManualAssign(bed.bedId)}
                      disabled={!selectedRequestId || assigning}
                      className="w-full py-1.5 px-3 rounded-xl bg-bg-surface border border-accent text-accent hover:bg-accent hover:text-white disabled:opacity-40 text-xs font-bold transition-all shadow-sm"
                    >
                      Reserve Bed
                    </button>
                  ) : isCleaning ? (
                    <button
                      onClick={() => handleSetBedStatus(bed.bedId, 'AVAILABLE')}
                      className="w-full py-1.5 px-3 rounded-xl bg-accent-light border border-[var(--border)] text-accent hover:bg-accent hover:text-white text-xs font-semibold transition-all"
                    >
                      Mark Ready
                    </button>
                  ) : (
                    <span className="text-xs text-center text-text-muted font-mono py-1">In Use</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Bed Allocations / Occupancy Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Active Bed Occupancy & Allocations</h3>
          <span className="text-xs text-text-muted">Live Inpatients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Request #</th>
                <th className="py-3.5 px-5">Patient</th>
                <th className="py-3.5 px-5">Bed #</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Reserved At</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {allocations.filter((a) => a.status === 'ACTIVE').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted font-medium">
                    No active bed reservations currently recorded.
                  </td>
                </tr>
              ) : (
                allocations
                  .filter((a) => a.status === 'ACTIVE')
                  .map((alloc) => (
                    <tr key={alloc.allocationId} className="hover:bg-bg-surface-2/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-accent">{alloc.requestNumber}</td>
                      <td className="py-3.5 px-5 font-bold text-text-primary">{alloc.patientName}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-text-primary">{alloc.bedNumber}</td>
                      <td className="py-3.5 px-5 text-text-secondary">{alloc.departmentName}</td>
                      <td className="py-3.5 px-5 text-text-secondary">{new Date(alloc.reservedAt).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-accent-light text-accent border border-[var(--border)]">
                          {alloc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {!alloc.admittedAt && (
                          <button
                            onClick={() => handleAdmit(alloc.allocationId)}
                            className="px-3 py-1 bg-[#DCFCE7] dark:bg-[var(--success-light)] border border-[#86EFAC] text-[var(--success)] rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-sm"
                          >
                            Admit to Bed
                          </button>
                        )}
                        <button
                          onClick={() => handleRelease(alloc.allocationId)}
                          className="px-3 py-1 bg-[#FEE2E2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] text-[var(--critical)] rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-sm"
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

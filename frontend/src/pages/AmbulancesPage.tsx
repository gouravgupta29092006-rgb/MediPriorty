import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Truck,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Navigation
} from 'lucide-react';
import api from '../api/client';
import { Ambulance, EmergencyRequest, AmbulanceAllocation } from '../types';

export const AmbulancesPage: React.FC = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<AmbulanceAllocation[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dijkstra Test Tool
  const [routeSource, setRouteSource] = useState('2');
  const [routeDest, setRouteDest] = useState('1');
  const [travelResult, setTravelResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ambRes, reqRes, allocRes] = await Promise.all([
        api.get('/ambulances', { params: { size: 50 } }),
        api.get('/emergency-requests', { params: { size: 50 } }),
        api.get('/allocations/ambulance', { params: { size: 20 } }),
      ]);

      setAmbulances(ambRes.data.content || []);

      const candidates = (reqRes.data.content || []).filter(
        (r: EmergencyRequest) =>
          r.requestStatus === 'TRIAGED' || r.requestStatus === 'PENDING_TRIAGE'
      );
      setActiveRequests(candidates);

      const params = new URLSearchParams(location.search);
      const qReqId = params.get('dispatchRequestId');
      if (qReqId) {
        setSelectedRequestId(Number(qReqId));
      } else if (candidates.length > 0 && selectedRequestId === '') {
        setSelectedRequestId(candidates[0].requestId);
      }

      setActiveAllocations(allocRes.data.content || []);
    } catch (err) {
      console.error('Failed to load ambulance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAutoDispatch = async () => {
    if (!selectedRequestId) {
      setMsg({ type: 'error', text: 'Select an emergency incident to dispatch an ambulance' });
      return;
    }

    setDispatching(true);
    setMsg(null);

    try {
      const res = await api.post('/allocations/ambulance/auto', {
        requestId: Number(selectedRequestId),
      });
      setMsg({
        type: 'success',
        text: `Optimal ambulance [${res.data.ambulanceRegistration}] auto-dispatched using optimal routing and capability matching!`,
      });
      fetchData();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Automatic dispatch failed. No matching available ambulances.',
      });
    } finally {
      setDispatching(false);
    }
  };

  const handleManualDispatch = async () => {
    if (!selectedRequestId || !selectedAmbulanceId) {
      setMsg({ type: 'error', text: 'Select both request and specific ambulance for manual dispatch' });
      return;
    }

    setDispatching(true);
    setMsg(null);

    try {
      const res = await api.post('/allocations/ambulance/manual', {
        requestId: Number(selectedRequestId),
        ambulanceId: Number(selectedAmbulanceId),
      });
      setMsg({
        type: 'success',
        text: `Ambulance [${res.data.ambulanceRegistration}] manually dispatched.`,
      });
      fetchData();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Manual dispatch failed.',
      });
    } finally {
      setDispatching(false);
    }
  };

  const handleMarkArrived = async (allocationId: number) => {
    try {
      await api.patch(`/allocations/ambulance/${allocationId}/arrived`);
      setMsg({ type: 'success', text: 'Ambulance status updated to ON SCENE.' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const handleComplete = async (allocationId: number) => {
    try {
      await api.patch(`/allocations/ambulance/${allocationId}/complete`);
      setMsg({ type: 'success', text: 'Ambulance allocation completed and unit returned to AVAILABLE.' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Completion failed' });
    }
  };

  const testDijkstra = async () => {
    setCalcLoading(true);
    try {
      const res = await api.get('/routing/travel-time', {
        params: { sourceNodeId: routeSource, destNodeId: routeDest },
      });
      setTravelResult(res.data);
    } catch (err) {
      console.error('Dijkstra failed', err);
    } finally {
      setCalcLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-[#DCFCE7] dark:bg-[var(--success-light)] text-[var(--success)] border-[#86EFAC]';
      case 'DISPATCHED':
        return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
      case 'ON_SCENE':
        return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]';
      case 'RETURNING':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      default:
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-accent" />
            <span>Ambulance Fleet & Dispatch Center</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Optimal route planning & ambulance capability matching for fastest patient response
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs shadow-sm ${
            msg.type === 'success'
              ? 'bg-[#DCFCE7] dark:bg-[var(--success-light)] border-[#86EFAC] text-[var(--success)]'
              : 'bg-[#FEE2E2] dark:bg-[var(--critical-light)] border-[#FCA5A5] text-[var(--critical)]'
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

      {/* Dispatch Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Actions */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Intelligent Allocation Engine</span>
            </h3>
            <span className="text-xs text-text-muted font-mono">Routing + Capability Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Target Emergency Request *
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">-- Choose triaged request --</option>
                {activeRequests.map((r) => (
                  <option key={r.requestId} value={r.requestId}>
                    {r.requestNumber} • {r.patientName} [{r.currentTriageCategory || 'UNTRIAGED'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Specific Unit (For Manual Dispatch)
              </label>
              <select
                value={selectedAmbulanceId}
                onChange={(e) => setSelectedAmbulanceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">-- Auto-select recommended --</option>
                {ambulances
                  .filter((a) => a.currentStatus === 'AVAILABLE')
                  .map((a) => (
                    <option key={a.ambulanceId} value={a.ambulanceId}>
                      {a.registrationNumber} • {a.ambulanceType} ({a.equipmentLevel}) • At {a.currentNodeName || 'Base'}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleAutoDispatch}
              disabled={dispatching || !selectedRequestId}
              className="flex-1 py-2.5 px-4 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Auto-Dispatch Best Ambulance (Recommended)</span>
            </button>

            {selectedAmbulanceId && (
              <button
                onClick={handleManualDispatch}
                disabled={dispatching}
                className="py-2.5 px-4 bg-bg-surface-2 hover:bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-text-primary rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-sm"
              >
                Manual Override
              </button>
            )}
          </div>
        </div>

        {/* Right: Dijkstra Travel Time Calculator */}
        <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              <span>Ambulance Route & Travel-Time Estimator</span>
            </h3>
            <span className="text-[10px] text-text-muted font-mono">Route Information</span>
          </div>

          <p className="text-xs text-text-secondary leading-tight">
            Estimates the optimal route and travel time between ambulance dispatch locations.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary mb-1">Starting Location</label>
              <select
                value={routeSource}
                onChange={(e) => setRouteSource(e.target.value)}
                className="w-full p-2 bg-bg-surface-2 border border-[var(--border)] rounded-lg text-xs text-text-primary"
              >
                <option value="1">Hospital Base (Station 1)</option>
                <option value="2">North EMS Station (Station 2)</option>
                <option value="3">South EMS Station (Station 3)</option>
                <option value="4">Downtown Center Plaza (Zone 4)</option>
                <option value="5">West River Crossing (Zone 5)</option>
                <option value="6">East Highway Junction (Zone 6)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary mb-1">Destination</label>
              <select
                value={routeDest}
                onChange={(e) => setRouteDest(e.target.value)}
                className="w-full p-2 bg-bg-surface-2 border border-[var(--border)] rounded-lg text-xs text-text-primary"
              >
                <option value="1">Hospital Base (Station 1)</option>
                <option value="2">North EMS Station (Station 2)</option>
                <option value="3">South EMS Station (Station 3)</option>
                <option value="4">Downtown Center Plaza (Zone 4)</option>
                <option value="5">West River Crossing (Zone 5)</option>
                <option value="6">East Highway Junction (Zone 6)</option>
              </select>
            </div>
          </div>

          <button
            onClick={testDijkstra}
            disabled={calcLoading}
            className="w-full py-2 bg-accent-light hover:bg-accent hover:text-white border border-[var(--border)] text-accent rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            {calcLoading ? 'Computing...' : 'Calculate Route'}
          </button>

          {travelResult && (
            <div className="p-3 rounded-xl bg-bg-surface-2 border border-[var(--border)] text-xs text-text-primary shadow-sm">
              <span className="font-bold text-[var(--success)]">
                {travelResult.travelTimeMinutes >= 0
                  ? `Estimated Travel: ${travelResult.travelTimeMinutes} mins`
                  : 'Unreachable Route'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Inventory Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Ambulance Fleet Status</h3>
          <span className="text-xs text-text-muted">{ambulances.length} Registered Units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Registration</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Equipment</th>
                <th className="py-3.5 px-5">Staff</th>
                <th className="py-3.5 px-5">Location Station</th>
                <th className="py-3.5 px-5">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {ambulances.map((a) => (
                <tr key={a.ambulanceId} className="hover:bg-bg-surface-2/60 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-text-primary flex items-center gap-2">
                    <Truck className="w-4 h-4 text-accent" />
                    <span>{a.registrationNumber}</span>
                  </td>
                  <td className="py-4 px-5 font-bold text-text-primary">{a.ambulanceType}</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-accent-light text-accent border border-[var(--border)]">
                      {a.equipmentLevel}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-text-secondary">{a.availableMedicalPersonnel} Personnel</td>
                  <td className="py-4 px-5 text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{a.currentNodeName || 'Hospital Base'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(a.currentStatus)}`}>
                      {a.currentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Dispatched Ambulances Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Active Ambulance Dispatches</h3>
          <span className="text-xs text-text-muted">Live Mission Execution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Request #</th>
                <th className="py-3.5 px-5">Patient</th>
                <th className="py-3.5 px-5">Ambulance</th>
                <th className="py-3.5 px-5">Dispatched At</th>
                <th className="py-3.5 px-5">Dispatcher</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {activeAllocations.filter((a) => a.status === 'ACTIVE').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted font-medium">
                    No active ambulance missions in progress.
                  </td>
                </tr>
              ) : (
                activeAllocations
                  .filter((a) => a.status === 'ACTIVE')
                  .map((alloc) => (
                    <tr key={alloc.allocationId} className="hover:bg-bg-surface-2/60">
                      <td className="py-4 px-5 font-mono font-bold text-accent">{alloc.requestNumber}</td>
                      <td className="py-4 px-5 font-bold text-text-primary">{alloc.patientName}</td>
                      <td className="py-4 px-5 font-mono text-text-primary font-bold">{alloc.ambulanceRegistration}</td>
                      <td className="py-4 px-5 text-text-secondary">{new Date(alloc.dispatchTime).toLocaleTimeString()}</td>
                      <td className="py-4 px-5 text-text-secondary">{alloc.allocatedBy}</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                          {alloc.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        {!alloc.arrivalTime && (
                          <button
                            onClick={() => handleMarkArrived(alloc.allocationId)}
                            className="px-3 py-1 bg-[#EDE9FE] border border-[#DDD6FE] text-[#7C3AED] rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-sm"
                          >
                            Mark Arrived
                          </button>
                        )}
                        <button
                          onClick={() => handleComplete(alloc.allocationId)}
                          className="px-3 py-1 bg-[#DCFCE7] dark:bg-[var(--success-light)] border border-[#86EFAC] text-[var(--success)] rounded-lg text-xs font-bold hover:opacity-80 transition-all shadow-sm"
                        >
                          Complete Run
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

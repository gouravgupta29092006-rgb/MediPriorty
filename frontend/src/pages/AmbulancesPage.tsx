import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Truck,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Navigation,
  ArrowRight
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

      // Active triaged requests that need ambulance
      const candidates = (reqRes.data.content || []).filter(
        (r: EmergencyRequest) =>
          r.requestStatus === 'TRIAGED' || r.requestStatus === 'PENDING_TRIAGE'
      );
      setActiveRequests(candidates);

      // Query param dispatchRequestId
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
        text: `Optimal ambulance [${res.data.ambulanceRegistration}] auto-dispatched via Dijkstra routing & capability MergeSort!`,
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
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'DISPATCHED':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'ON_SCENE':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'RETURNING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>Ambulance Fleet & Dispatch Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dijkstra road-network shortest path estimation & custom MergeSort capability ranking
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
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

      {/* Dispatch Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Actions */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Intelligent Allocation Engine</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Dijkstra + MergeSort</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Emergency Request *
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Specific Unit (For Manual Dispatch)
              </label>
              <select
                value={selectedAmbulanceId}
                onChange={(e) => setSelectedAmbulanceId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Auto-Dispatch Best Ambulance (Recommended)</span>
            </button>

            {selectedAmbulanceId && (
              <button
                onClick={handleManualDispatch}
                disabled={dispatching}
                className="py-2.5 px-4 bg-[#0B1220] hover:bg-[#18253C] border border-[#1E293B] hover:border-slate-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all"
              >
                Manual Override
              </button>
            )}
          </div>
        </div>

        {/* Right: Dijkstra Travel Time Calculator */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Dijkstra Shortest Path Probe</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Graph API</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Queries graph adjacency-list with min-heap shortest path calculation.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Source Node</label>
              <select
                value={routeSource}
                onChange={(e) => setRouteSource(e.target.value)}
                className="w-full p-1.5 bg-[#0B1220] border border-[#1E293B] rounded text-xs text-white"
              >
                <option value="1">Node 1: Hospital</option>
                <option value="2">Node 2: North EMS</option>
                <option value="3">Node 3: South EMS</option>
                <option value="4">Node 4: Downtown</option>
                <option value="5">Node 5: West River</option>
                <option value="6">Node 6: East Junction</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Destination Node</label>
              <select
                value={routeDest}
                onChange={(e) => setRouteDest(e.target.value)}
                className="w-full p-1.5 bg-[#0B1220] border border-[#1E293B] rounded text-xs text-white"
              >
                <option value="1">Node 1: Hospital</option>
                <option value="2">Node 2: North EMS</option>
                <option value="3">Node 3: South EMS</option>
                <option value="4">Node 4: Downtown</option>
                <option value="5">Node 5: West River</option>
                <option value="6">Node 6: East Junction</option>
              </select>
            </div>
          </div>

          <button
            onClick={testDijkstra}
            disabled={calcLoading}
            className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded text-xs font-semibold"
          >
            {calcLoading ? 'Computing...' : 'Calculate Route Weight'}
          </button>

          {travelResult && (
            <div className="p-2 rounded bg-[#0B1220] border border-[#1E293B] text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">
                {travelResult.travelTimeMinutes >= 0
                  ? `Estimated Travel: ${travelResult.travelTimeMinutes} mins`
                  : 'Unreachable Route'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Inventory Table */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Ambulance Fleet Status</h3>
          <span className="text-xs text-slate-400">{ambulances.length} Registered Units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Equipment</th>
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Location Station</th>
                <th className="py-3 px-4">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {ambulances.map((a) => (
                <tr key={a.ambulanceId} className="hover:bg-[#18253C]/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500" />
                    <span>{a.registrationNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{a.ambulanceType}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B1220] border border-[#1E293B] text-slate-300">
                      {a.equipmentLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{a.availableMedicalPersonnel} Personnel</td>
                  <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>{a.currentNodeName || 'Hospital Base'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(a.currentStatus)}`}>
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
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Active Ambulance Dispatches</h3>
          <span className="text-xs text-slate-400">Live Mission Execution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Ambulance</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4">Dispatcher</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {activeAllocations.filter((a) => a.status === 'ACTIVE').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active ambulance missions in progress.
                  </td>
                </tr>
              ) : (
                activeAllocations
                  .filter((a) => a.status === 'ACTIVE')
                  .map((alloc) => (
                    <tr key={alloc.allocationId} className="hover:bg-[#18253C]/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{alloc.requestNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{alloc.patientName}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">{alloc.ambulanceRegistration}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(alloc.dispatchTime).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-4 text-slate-300">{alloc.allocatedBy}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {alloc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {!alloc.arrivalTime && (
                          <button
                            onClick={() => handleMarkArrived(alloc.allocationId)}
                            className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded text-[11px] font-semibold"
                          >
                            Mark Arrived
                          </button>
                        )}
                        <button
                          onClick={() => handleComplete(alloc.allocationId)}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded text-[11px] font-semibold"
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

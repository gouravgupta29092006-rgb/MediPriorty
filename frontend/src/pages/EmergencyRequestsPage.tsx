import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Plus,
  MapPin,
  Clock,
  HeartPulse,
  Truck,
  Bed,
  CheckCircle2,
  XCircle,
  X,
  Filter
} from 'lucide-react';
import api from '../api/client';
import { EmergencyRequest, Patient, RequestStatus, BedType } from '../types';
import { useAuth } from '../context/AuthContext';

export const EmergencyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLatitude, setPickupLatitude] = useState('40.71800000');
  const [pickupLongitude, setPickupLongitude] = useState('-73.99000000');
  const [requiredBedType, setRequiredBedType] = useState<BedType>('EMERGENCY');

  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    // Check if redirected with newForPatient query param
    const params = new URLSearchParams(location.search);
    const patientIdParam = params.get('newForPatient');
    if (patientIdParam) {
      setSelectedPatientId(Number(patientIdParam));
      setShowModal(true);
    }
  }, [location]);

  const fetchRequests = async (status = statusFilter, pageNum = page) => {
    try {
      setLoading(true);
      const res = await api.get('/emergency-requests', {
        params: {
          status: status || undefined,
          page: pageNum,
          size: 15,
        },
      });
      setRequests(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load emergency requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients', { params: { size: 100 } });
      setPatients(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter, page);
    fetchPatients();
  }, [statusFilter, page]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a registered patient');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await api.post('/emergency-requests', {
        patientId: Number(selectedPatientId),
        pickupLocation,
        pickupLatitude: pickupLatitude ? Number(pickupLatitude) : null,
        pickupLongitude: pickupLongitude ? Number(pickupLongitude) : null,
        requiredBedType,
      });

      setShowModal(false);
      setPickupLocation('');
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create emergency request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING_TRIAGE':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'TRIAGED':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'AMBULANCE_DISPATCHED':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'ARRIVED':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'BED_RESERVED':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'ADMITTED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-slate-700 text-slate-300 border-slate-600';
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
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>Emergency Requests</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident dispatch, status transitions, and bed allocation pipelines
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Emergency Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { label: 'All Incidents', value: '' },
          { label: 'Pending Triage', value: 'PENDING_TRIAGE' },
          { label: 'Triaged', value: 'TRIAGED' },
          { label: 'Ambulance Dispatched', value: 'AMBULANCE_DISPATCHED' },
          { label: 'Arrived On Scene', value: 'ARRIVED' },
          { label: 'Bed Reserved', value: 'BED_RESERVED' },
          { label: 'Admitted', value: 'ADMITTED' },
          { label: 'Closed', value: 'CLOSED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#111C2E] border border-[#1E293B] text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Triage</th>
                <th className="py-3 px-4">Pickup Location</th>
                <th className="py-3 px-4">Bed Requirement</th>
                <th className="py-3 px-4">Logged Time</th>
                <th className="py-3 px-4 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading emergency records...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No emergency requests matching the selected filter.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.requestId} className="hover:bg-[#18253C]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {r.requestNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{r.patientName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(r.requestStatus)}`}>
                        {r.requestStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.currentTriageCategory ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            r.currentTriageCategory === 'RED'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : r.currentTriageCategory === 'ORANGE'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : r.currentTriageCategory === 'YELLOW'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {r.currentTriageCategory}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Untriaged</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{r.pickupLocation}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0B1220] border border-[#1E293B] text-slate-300">
                        {r.requiredBedType || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.requestStatus === 'PENDING_TRIAGE' && (
                          <button
                            onClick={() => navigate(`/triage?requestId=${r.requestId}`)}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[11px] font-semibold"
                          >
                            Assess Triage
                          </button>
                        )}

                        {r.requestStatus === 'TRIAGED' && (
                          <button
                            onClick={() => navigate(`/ambulances?dispatchRequestId=${r.requestId}`)}
                            className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-[11px] font-semibold"
                          >
                            Dispatch Amb
                          </button>
                        )}

                        {(r.requestStatus === 'ARRIVED' || r.requestStatus === 'AMBULANCE_DISPATCHED') && (
                          <button
                            onClick={() => navigate(`/beds?assignRequestId=${r.requestId}`)}
                            className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold"
                          >
                            Reserve Bed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded bg-[#0B1220] border border-[#1E293B] disabled:opacity-40 hover:text-white"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-[#0B1220] border border-[#1E293B] disabled:opacity-40 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111C2E] border border-[#1E293B] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create Emergency Request</h3>
            <p className="text-xs text-slate-400 mb-4">Log incoming emergency 911/EMS call</p>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose registered patient --</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.fullName} (ID #{p.patientId}) {p.contactNumber ? `• ${p.contactNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pickup Location Address *</label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Downtown Plaza"
                  className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={pickupLatitude}
                    onChange={(e) => setPickupLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={pickupLongitude}
                    onChange={(e) => setPickupLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Anticipated Bed Type</label>
                <select
                  value={requiredBedType}
                  onChange={(e) => setRequiredBedType(e.target.value as BedType)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="EMERGENCY">Emergency Trauma Bed</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="GENERAL">General Medical Ward</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1220] border border-[#1E293B] text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Log Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

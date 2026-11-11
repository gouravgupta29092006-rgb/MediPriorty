import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Plus,
  MapPin,
  X
} from 'lucide-react';
import api from '../api/client';
import { EmergencyRequest, Patient, RequestStatus, BedType } from '../types';
import { useAuth } from '../context/AuthContext';
import { EmergencyRequestsSkeleton } from '../components/skeleton/PageSkeletons';

export const EmergencyRequestsPage: React.FC = () => {
  const { hasRole } = useAuth();
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

  useEffect(() => {
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
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      case 'TRIAGED':
        return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
      case 'AMBULANCE_DISPATCHED':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      case 'ARRIVED':
        return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]';
      case 'BED_RESERVED':
        return 'bg-accent-light text-accent border-[var(--border)]';
      case 'ADMITTED':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
      case 'CLOSED':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
    }
  };

  if (loading && requests.length === 0) {
    return <EmergencyRequestsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-[var(--critical)]" />
            <span>Emergency Requests</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time incident dispatch, status transitions, and bed allocation pipelines
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--critical)] hover:opacity-90 text-white text-xs font-semibold shadow-sm transition-all"
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
            className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
              statusFilter === tab.value
                ? 'bg-accent text-white shadow-sm'
                : 'bg-bg-surface border border-[var(--border)] text-text-secondary hover:text-text-primary hover:border-[var(--border-strong)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Request #</th>
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Current Status</th>
                <th className="py-3.5 px-5">Triage</th>
                <th className="py-3.5 px-5">Pickup Location</th>
                <th className="py-3.5 px-5">Bed Requirement</th>
                <th className="py-3.5 px-5">Logged Time</th>
                <th className="py-3.5 px-5 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted">
                    <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                    <span className="font-semibold">Loading emergency records...</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted font-medium">
                    No emergency requests matching the selected filter.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.requestId} className="hover:bg-bg-surface-2/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-accent">
                      {r.requestNumber}
                    </td>
                    <td className="py-4 px-5 font-bold text-text-primary">{r.patientName}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(r.requestStatus)}`}>
                        {r.requestStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {r.currentTriageCategory ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                            r.currentTriageCategory === 'RED'
                              ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                              : r.currentTriageCategory === 'ORANGE'
                              ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                              : r.currentTriageCategory === 'YELLOW'
                              ? 'bg-[#FEFCE8] text-[#CA8A04] border-[#FDE047]'
                              : 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                          }`}
                        >
                          {r.currentTriageCategory}
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px] italic">Untriaged</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-text-secondary max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        <span className="truncate">{r.pickupLocation}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-accent-light text-accent border border-[var(--border)]">
                        {r.requiredBedType || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-text-secondary">
                      {new Date(r.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.requestStatus === 'PENDING_TRIAGE' && (
                          <button
                            onClick={() => navigate(`/triage?requestId=${r.requestId}`)}
                            className="px-3 py-1 rounded-lg bg-[#FFFBEB] dark:bg-[var(--warning-light)] border border-[#FCD34D] text-[var(--warning)] hover:opacity-80 text-[11px] font-bold transition-all shadow-sm"
                          >
                            Assess Triage
                          </button>
                        )}

                        {r.requestStatus === 'TRIAGED' && hasRole(['DISPATCHER']) && (
                          <button
                            onClick={() => navigate(`/ambulances?dispatchRequestId=${r.requestId}`)}
                            className="px-3 py-1 rounded-lg bg-accent-light border border-[var(--border)] text-accent hover:bg-accent hover:text-white text-[11px] font-bold transition-all shadow-sm"
                          >
                            Dispatch Amb
                          </button>
                        )}

                        {(r.requestStatus === 'ARRIVED' || r.requestStatus === 'AMBULANCE_DISPATCHED') && (
                          <button
                            onClick={() => navigate(`/beds?assignRequestId=${r.requestId}`)}
                            className="px-3 py-1 rounded-lg bg-bg-surface-2 border border-[var(--border)] text-text-primary hover:border-[var(--border-strong)] text-[11px] font-bold transition-all shadow-sm"
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
          <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-text-secondary">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3.5 py-1.5 rounded-lg bg-bg-surface-2 border border-[var(--border)] disabled:opacity-40 hover:text-text-primary text-xs font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-lg bg-bg-surface-2 border border-[var(--border)] disabled:opacity-40 hover:text-text-primary text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-[var(--border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-text-primary mb-1">Create Emergency Request</h3>
            <p className="text-xs text-text-secondary mb-4">Log incoming emergency 911/EMS call</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] text-xs text-[var(--critical)]">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
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
                <label className="block text-xs font-bold text-text-primary mb-1.5">Pickup Location Address *</label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Downtown Plaza"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Latitude</label>
                  <input
                    type="text"
                    value={pickupLatitude}
                    onChange={(e) => setPickupLatitude(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Longitude</label>
                  <input
                    type="text"
                    value={pickupLongitude}
                    onChange={(e) => setPickupLongitude(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Anticipated Bed Type</label>
                <select
                  value={requiredBedType}
                  onChange={(e) => setRequiredBedType(e.target.value as BedType)}
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="EMERGENCY">Emergency Trauma Bed</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="GENERAL">General Medical Ward</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-surface-2 border border-[var(--border)] text-xs font-semibold text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[var(--critical)] hover:opacity-90 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
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

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  History,
  CheckCircle2,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import api from '../api/client';
import { EmergencyRequest, TriageCategory, TriageRecord } from '../types';
import { TriageSkeleton } from '../components/skeleton/PageSkeletons';
import { useAuth } from '../context/AuthContext';

export const TriagePage: React.FC = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<TriageCategory>('RED');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Vital Signs
  const [hr, setHr] = useState('110');
  const [bp, setBp] = useState('90/60');
  const [spo2, setSpo2] = useState('88');
  const [rr, setRr] = useState('28');
  const [temp, setTemp] = useState('38.2');
  const [gcs, setGcs] = useState('12');

  const [history, setHistory] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const location = useLocation();
  const { user } = useAuth();

  const fetchRequests = async () => {
    try {
      const res = await api.get('/emergency-requests', {
        params: { size: 50 },
      });
      const active = (res.data.content || []).filter(
        (r: EmergencyRequest) => r.requestStatus !== 'CLOSED' && r.requestStatus !== 'CANCELLED'
      );
      setRequests(active);

      const params = new URLSearchParams(location.search);
      const reqIdParam = params.get('requestId');
      if (reqIdParam) {
        setSelectedRequestId(Number(reqIdParam));
      } else if (active.length > 0 && selectedRequestId === '') {
        setSelectedRequestId(active[0].requestId);
      }
    } catch (err) {
      console.error('Failed to load emergency requests', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (requestId: number) => {
    try {
      const res = await api.get<TriageRecord[]>(`/triage/${requestId}/history`);
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load triage history', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequestId) {
      fetchHistory(Number(selectedRequestId));
    } else {
      setHistory([]);
    }
  }, [selectedRequestId]);

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setErrorMsg('Please select an active emergency request');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const vitalSignsJson = JSON.stringify({
      heartRate: hr ? Number(hr) : null,
      bloodPressure: bp || null,
      spo2: spo2 ? Number(spo2) : null,
      respiratoryRate: rr ? Number(rr) : null,
      temperatureC: temp ? Number(temp) : null,
      gcs: gcs ? Number(gcs) : null,
    });

    try {
      await api.post('/triage', {
        requestId: Number(selectedRequestId),
        triageCategory: selectedCategory,
        clinicalNotes: clinicalNotes || null,
        vitalSignsJson,
      });

      setSuccessMsg(`Triage assessment submitted! Categorized as ${selectedCategory}. Min-heap priority updated.`);
      setClinicalNotes('');
      fetchHistory(Number(selectedRequestId));
      fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit triage assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRequest = requests.find((r) => r.requestId === selectedRequestId);

  if (loading && requests.length === 0) {
    return <TriageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
          <Stethoscope className="w-6 h-6 text-accent" />
          <span>Clinical Triage Management</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Authorized medical officer decision-support assessment & vital signs recording
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] dark:bg-[var(--success-light)] border border-[#86EFAC] dark:border-[var(--success)] flex items-center gap-3 text-xs text-[var(--success)] shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] dark:border-[var(--critical)] flex items-center gap-3 text-xs text-[var(--critical)] shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assessment Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-accent" />
              <span>Assessment & Clinical Categorization</span>
            </h3>

            <form onSubmit={handleTriageSubmit} className="space-y-5">
              {/* Request Selector */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Select Active Emergency Patient *
                </label>
                <select
                  required
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">-- Choose emergency incident --</option>
                  {requests.map((r) => (
                    <option key={r.requestId} value={r.requestId}>
                      {r.requestNumber} • {r.patientName} [{r.requestStatus}]
                      {r.currentTriageCategory ? ` (Currently ${r.currentTriageCategory})` : ' (Untriaged)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Triage Category Selection Buttons */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-2">
                  Assign Triage Urgency Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* RED */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('RED')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'RED'
                        ? 'bg-[#FEF2F2] dark:bg-[var(--critical-light)] border-[#F87171] ring-2 ring-[#F87171]/40'
                        : 'bg-bg-surface-2 border-[var(--border)] hover:border-[#F87171]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--critical)]">RED</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[var(--critical)]">
                        P1
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary">Critical</p>
                    <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                      Immediate life threat / resuscitation
                    </p>
                  </button>

                  {/* ORANGE */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ORANGE')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'ORANGE'
                        ? 'bg-[#FFFBEB] dark:bg-[var(--warning-light)] border-[#FCD34D] ring-2 ring-[#FCD34D]/40'
                        : 'bg-bg-surface-2 border-[var(--border)] hover:border-[#FCD34D]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--warning)]">ORANGE</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[var(--warning)]">
                        P2
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary">High</p>
                    <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                      Emergent / severe pain or trauma
                    </p>
                  </button>

                  {/* YELLOW */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('YELLOW')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'YELLOW'
                        ? 'bg-[#FEFCE8] dark:bg-yellow-950/20 border-[#FDE047] ring-2 ring-[#FDE047]/40'
                        : 'bg-bg-surface-2 border-[var(--border)] hover:border-[#FDE047]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#CA8A04]">YELLOW</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#CA8A04]">
                        P3
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary">Moderate</p>
                    <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                      Urgent / complex investigation
                    </p>
                  </button>

                  {/* GREEN */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('GREEN')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'GREEN'
                        ? 'bg-[#F0FDF4] dark:bg-[var(--success-light)] border-[#86EFAC] ring-2 ring-[#86EFAC]/40'
                        : 'bg-bg-surface-2 border-[var(--border)] hover:border-[#86EFAC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--success)]">GREEN</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[var(--success)]">
                        P4
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary">Low</p>
                    <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                      Standard acute care
                    </p>
                  </button>
                </div>
              </div>

              {/* Vitals Grid */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  <span>Objective Vital Signs</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={hr}
                      onChange={(e) => setHr(e.target.value)}
                      placeholder="e.g. 110"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="e.g. 120/80"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="e.g. 96"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Resp Rate (/min)</label>
                    <input
                      type="number"
                      value={rr}
                      onChange={(e) => setRr(e.target.value)}
                      placeholder="e.g. 18"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="e.g. 37.0"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">GCS Score (3-15)</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={gcs}
                      onChange={(e) => setGcs(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-3.5 py-2 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Narrative Clinical Notes */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span>Clinical Narrative & Triage Notes</span>
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter medical assessment findings, pain score, mechanism of injury, or reason for urgency upgrade/downgrade..."
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent placeholder-text-muted leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-text-secondary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Assessing Officer: <strong className="text-text-primary">{user?.fullName || 'Physician'}</strong></span>
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Recording Assessment...' : 'Commit Clinical Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Assessment Version History (Audit Trail) */}
        <div className="p-6 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              <span>Assessment History</span>
            </h3>
            <span className="text-[10px] text-text-muted font-mono">Immutable Log</span>
          </div>

          {selectedRequest && (
            <div className="mb-4 p-3.5 rounded-xl bg-bg-surface-2 border border-[var(--border)] text-xs">
              <p className="font-bold text-text-primary">{selectedRequest.patientName}</p>
              <p className="text-[11px] text-accent font-mono mt-0.5">{selectedRequest.requestNumber}</p>
              <p className="text-[11px] text-text-secondary mt-1">Location: {selectedRequest.pickupLocation}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <div className="py-16 text-center text-text-muted text-xs">
                No previous triage records for this request.
              </div>
            ) : (
              history.map((record) => (
                <div
                  key={record.triageId}
                  className="p-3.5 rounded-xl bg-bg-surface-2 border border-[var(--border)] space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        record.triageCategory === 'RED'
                          ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                          : record.triageCategory === 'ORANGE'
                          ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                          : record.triageCategory === 'YELLOW'
                          ? 'bg-[#FEFCE8] text-[#CA8A04] border-[#FDE047]'
                          : 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                      }`}
                    >
                      {record.triageCategory} (v{record.assessmentVersion})
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(record.assessedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {record.clinicalNotes && (
                    <p className="text-xs text-text-primary italic bg-bg-surface p-2.5 rounded-lg border border-[var(--border)]">
                      "{record.clinicalNotes}"
                    </p>
                  )}

                  {record.vitalSignsJson && (
                    <div className="text-[10px] text-text-secondary font-mono bg-bg-surface p-2 rounded-lg border border-[var(--border)] overflow-x-auto">
                      {record.vitalSignsJson}
                    </div>
                  )}

                  <p className="text-[10px] text-text-muted text-right">
                    Assessed by: {record.assessedByOfficer}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

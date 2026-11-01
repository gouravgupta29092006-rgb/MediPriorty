import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import api from '../api/client';
import { EmergencyRequest, TriageCategory, TriageRecord } from '../types';
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
      // Filter requests that are active
      const active = (res.data.content || []).filter(
        (r: EmergencyRequest) => r.requestStatus !== 'CLOSED' && r.requestStatus !== 'CANCELLED'
      );
      setRequests(active);

      // Check query param
      const params = new URLSearchParams(location.search);
      const reqIdParam = params.get('requestId');
      if (reqIdParam) {
        setSelectedRequestId(Number(reqIdParam));
      } else if (active.length > 0 && selectedRequestId === '') {
        setSelectedRequestId(active[0].requestId);
      }
    } catch (err) {
      console.error('Failed to load emergency requests', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-400" />
          <span>Clinical Triage Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Authorized medical officer decision-support assessment & vital signs recording
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assessment Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#1E293B] shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-400" />
              <span>Assessment & Clinical Categorization</span>
            </h3>

            <form onSubmit={handleTriageSubmit} className="space-y-5">
              {/* Request Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Active Emergency Patient *
                </label>
                <select
                  required
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Assign Triage Urgency Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* RED */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('RED')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'RED'
                        ? 'bg-red-600/25 border-red-500 ring-2 ring-red-500/30'
                        : 'bg-[#0B1220] border-[#1E293B] hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-400">RED</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                        P1
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-white">Critical</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Immediate life threat / resuscitation
                    </p>
                  </button>

                  {/* ORANGE */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ORANGE')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'ORANGE'
                        ? 'bg-amber-600/25 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-[#0B1220] border-[#1E293B] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-400">ORANGE</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        P2
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-white">High</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Emergent / severe pain or trauma
                    </p>
                  </button>

                  {/* YELLOW */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('YELLOW')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'YELLOW'
                        ? 'bg-yellow-600/25 border-yellow-500 ring-2 ring-yellow-500/30'
                        : 'bg-[#0B1220] border-[#1E293B] hover:border-yellow-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-yellow-400">YELLOW</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                        P3
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-white">Moderate</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Urgent / complex investigation
                    </p>
                  </button>

                  {/* GREEN */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('GREEN')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedCategory === 'GREEN'
                        ? 'bg-emerald-600/25 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-[#0B1220] border-[#1E293B] hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-400">GREEN</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        P4
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-white">Low</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Standard acute care
                    </p>
                  </button>
                </div>
              </div>

              {/* Vitals Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Objective Vital Signs</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={hr}
                      onChange={(e) => setHr(e.target.value)}
                      placeholder="e.g. 110"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      placeholder="e.g. 120/80"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="e.g. 96"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resp Rate (/min)</label>
                    <input
                      type="number"
                      value={rr}
                      onChange={(e) => setRr(e.target.value)}
                      placeholder="e.g. 18"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="e.g. 37.0"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GCS Score (3-15)</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={gcs}
                      onChange={(e) => setGcs(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 bg-[#0B1220] border border-[#1E293B] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Narrative Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Clinical Narrative & Triage Notes</span>
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter medical assessment findings, pain score, mechanism of injury, or reason for urgency upgrade/downgrade..."
                  className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assessing Officer: {user?.fullName || 'Physician'}</span>
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Recording Assessment...' : 'Commit Clinical Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Assessment Version History (Audit Trail) */}
        <div className="p-6 rounded-2xl bg-[#111C2E] border border-[#1E293B] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Assessment History</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Immutable Log</span>
          </div>

          {selectedRequest && (
            <div className="mb-4 p-3 rounded-xl bg-[#0B1220] border border-[#1E293B] text-xs">
              <p className="font-semibold text-white">{selectedRequest.patientName}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedRequest.requestNumber}</p>
              <p className="text-[11px] text-slate-400 mt-1">Location: {selectedRequest.pickupLocation}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3">
            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No previous triage records for this request.
              </div>
            ) : (
              history.map((record) => (
                <div
                  key={record.triageId}
                  className="p-3.5 rounded-xl bg-[#0B1220] border border-[#1E293B] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        record.triageCategory === 'RED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : record.triageCategory === 'ORANGE'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : record.triageCategory === 'YELLOW'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {record.triageCategory} (v{record.assessmentVersion})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(record.assessedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {record.clinicalNotes && (
                    <p className="text-xs text-slate-300 italic bg-[#111C2E] p-2 rounded border border-[#1E293B]/60">
                      "{record.clinicalNotes}"
                    </p>
                  )}

                  {record.vitalSignsJson && (
                    <div className="text-[10px] text-slate-400 font-mono bg-[#111C2E] p-2 rounded overflow-x-auto">
                      {record.vitalSignsJson}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 text-right">
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

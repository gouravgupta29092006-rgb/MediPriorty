import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  X
} from 'lucide-react';
import api from '../api/client';
import { Patient } from '../types';
import { useNavigate } from 'react-router-dom';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const navigate = useNavigate();

  const fetchPatients = async (query = search, pageNum = page) => {
    try {
      setLoading(true);
      const res = await api.get('/patients', {
        params: {
          search: query || undefined,
          page: pageNum,
          size: 15,
        },
      });
      setPatients(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchPatients(search, 0);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/patients', {
        fullName,
        dateOfBirth: dateOfBirth || null,
        gender,
        contactNumber: contactNumber || null,
        emergencyContact: emergencyContact || null,
      });

      setShowModal(false);
      setFullName('');
      setDateOfBirth('');
      setContactNumber('');
      setEmergencyContact('');
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <Users className="w-6 h-6 text-accent" />
            <span>Patients Directory</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Registered patients, medical histories, and active emergency records
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-2xl bg-bg-surface border border-[var(--border)] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                fetchPatients('', 0);
              }}
              className="px-4 py-2.5 bg-bg-surface-2 border border-[var(--border)] hover:border-[var(--border-strong)] text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl transition-all"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Full Name</th>
                <th className="py-3.5 px-5">Gender</th>
                <th className="py-3.5 px-5">Date of Birth</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Emergency Contact</th>
                <th className="py-3.5 px-5">Registered</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted">
                    <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                    <span className="font-semibold">Loading patient records...</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-text-muted font-medium">
                    No registered patients found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patientId} className="hover:bg-bg-surface-2/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-text-muted">#{p.patientId}</td>
                    <td className="py-4 px-5 font-bold text-text-primary">{p.fullName}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          p.gender === 'MALE'
                            ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                            : p.gender === 'FEMALE'
                            ? 'bg-[#FCE7F3] text-[#BE185D]'
                            : 'bg-bg-surface-2 text-text-muted border border-[var(--border)]'
                        }`}
                      >
                        {p.gender || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-text-secondary">{p.dateOfBirth || '—'}</td>
                    <td className="py-4 px-5 text-text-secondary font-mono">{p.contactNumber || '—'}</td>
                    <td className="py-4 px-5 text-text-secondary truncate max-w-xs">{p.emergencyContact || '—'}</td>
                    <td className="py-4 px-5 text-text-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => navigate(`/emergency-requests?newForPatient=${p.patientId}`)}
                        className="px-3 py-1 rounded-xl bg-transparent border border-[#FCA5A5] text-[var(--critical)] hover:bg-[#FEE2E2] dark:hover:bg-[var(--critical-light)] text-xs font-semibold transition-all shadow-sm"
                      >
                        Create Emergency
                      </button>
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

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-text-primary mb-1">Register New Patient</h3>
            <p className="text-xs text-text-secondary mb-4">Add patient profile into hospital database</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] text-xs text-[var(--critical)]">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Johnathan Miller"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1-555-0199"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Emergency Contact Info</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Sarah Miller (Spouse) +1-555-0188"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
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
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

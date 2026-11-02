import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, User as UserIcon } from 'lucide-react';
import api from '../api/client';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (pageNum = page) => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: { page: pageNum, size: 20 },
      });
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const getActionBadge = (action: string) => {
    if (action.includes('TRIAGE')) return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
    if (action.includes('DISPATCH') || action.includes('AMBULANCE')) return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
    if (action.includes('BED') || action.includes('ADMIT')) return 'bg-accent-light text-accent border-[var(--border)]';
    if (action.includes('USER')) return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]';
    return 'bg-bg-surface-2 text-text-secondary border-[var(--border)]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-accent" />
            <span>System Audit & Compliance Logs</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Cryptographically tracked audit trail of all medical assessments, dispatches, and admissions
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-surface border border-[var(--border)] hover:border-[var(--border-strong)] text-xs font-semibold text-text-primary transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Log ID</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Entity</th>
                <th className="py-3.5 px-5">Entity ID</th>
                <th className="py-3.5 px-5">Acting Officer</th>
                <th className="py-3.5 px-5">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-text-muted">
                    <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                    <span className="font-semibold">Loading audit trail...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-text-muted font-medium">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-bg-surface-2/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-text-muted">#{log.logId}</td>
                    <td className="py-4 px-5 text-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-text-primary">{log.entityType}</td>
                    <td className="py-4 px-5 font-mono text-text-secondary">
                      {log.entityId ? `#${log.entityId}` : '—'}
                    </td>
                    <td className="py-4 px-5 text-text-primary font-bold">
                      {log.user ? (
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-accent" />
                          <span>{log.user.fullName} ({log.user.role})</span>
                        </span>
                      ) : (
                        <span className="text-text-muted italic">SYSTEM</span>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-text-secondary max-w-sm truncate">
                      {log.detailsJson || '—'}
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
    </div>
  );
};

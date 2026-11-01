import React, { useEffect, useState } from 'react';
import { FileText, Shield, Clock, RefreshCw, User as UserIcon } from 'lucide-react';
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
    if (action.includes('TRIAGE')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (action.includes('DISPATCH') || action.includes('AMBULANCE')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (action.includes('BED') || action.includes('ADMIT')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    if (action.includes('USER')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>System Audit & Compliance Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically tracked audit trail of all medical assessments, dispatches, and admissions
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C2E] border border-[#1E293B] text-xs font-medium text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111C2E] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Acting Officer</th>
                <th className="py-3 px-4">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading audit trail...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-[#18253C]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{log.logId}</td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">{log.entityType}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {log.entityId ? `#${log.entityId}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      {log.user ? (
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{log.user.fullName} ({log.user.role})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">SYSTEM</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-sm truncate">
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
    </div>
  );
};

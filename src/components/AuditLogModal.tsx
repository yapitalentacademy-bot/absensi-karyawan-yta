'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '@/lib/types';
import { formatJakartaFullDateTime } from '@/lib/date';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/attendance/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Riwayat Audit Perubahan Absensi
            </h3>
            <p className="text-xs text-slate-400">
              Mencatat semua perubahan manual yang dilakukan oleh Admin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Memuat data riwayat audit...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
              Belum ada catatan koreksi manual.
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2 text-xs hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold uppercase text-[10px] border border-blue-500/30">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-200 text-sm">{log.employeeName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {formatJakartaFullDateTime(log.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Diubah oleh Admin: <strong className="text-amber-300">{log.editedByName}</strong></span>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-slate-300 space-y-1">
                  <p className="font-semibold text-amber-400 flex items-center gap-1 text-[11px]">
                    <FileText className="w-3 h-3" /> Alasan Perubahan:
                  </p>
                  <p className="italic text-slate-200">{log.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-right shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

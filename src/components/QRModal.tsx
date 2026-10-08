'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, ShieldCheck, Building, User } from 'lucide-react';
import { Employee } from '@/lib/types';

interface QRModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ employee, onClose }) => {
  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-white relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Kartu Identitas & QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="printable-area bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/80 shadow-inner space-y-5 text-center relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400"></div>

          <div className="flex items-center justify-between text-left border-b border-slate-700/50 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">KARTU ABSENSI RESMI</p>
              <h4 className="font-extrabold text-sm text-white">PT YTA CORPORATE</h4>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-mono font-bold">
              {employee.employeeCode}
            </span>
          </div>

          {/* Employee Avatar & Name */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg bg-slate-800 flex items-center justify-center">
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white leading-tight">{employee.name}</h3>
              <p className="text-xs text-amber-300 font-medium">{employee.position}</p>
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-slate-400" /> {employee.department}
              </p>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="bg-white p-4 rounded-2xl inline-block border-4 border-slate-700 shadow-xl">
            <QRCodeSVG
              value={employee.qrToken}
              size={170}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Footer Security Notice */}
          <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
            <p className="font-mono font-semibold text-slate-300">TOKEN: {employee.qrToken}</p>
            <p className="italic text-[9px] text-slate-500">Tunjukkan QR Code ini pada kamera pemindai untuk melakukan Absen Masuk & Pulang.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu QR
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

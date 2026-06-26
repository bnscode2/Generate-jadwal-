'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KonflikJadwal } from '../lib/types';

interface KonflikTabProps {
  conflicts: KonflikJadwal[];
}

export default function KonflikTab({ conflicts }: KonflikTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Validasi Real-time &amp; Laporan Deteksi Konflik</h2>
        <p className="text-xs text-slate-500 font-medium">Melaporkan bentrokan jadwal guru, kelas, ruangan, maupun batasan preferensi harian real-time.</p>
      </div>

      {conflicts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-xl max-w-2xl mx-auto text-center space-y-3.5 shadow-xs font-sans">
          <CheckCircle2 className="w-16 h-16 mx-auto stroke-[1.2] text-emerald-500" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Sempurna! Nol Konflik Terdeteksi</h3>
            <p className="text-xs text-slate-550 max-w-sm mx-auto mt-1">Seluruh jadwal pelajaran SMAN 1 AI berada dalam kondisi non-bentrok. Memenuhi semua batasan wajib serta mengutamakan target soft constraints.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
          
          {/* CONFLICT SUMMARY SENSORS */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-800">Rincian Tipe Pelanggaran</h3>
            
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">
                <span>Bentrok Guru Mengajar</span>
                <span className="font-mono font-bold bg-rose-500 text-white px-1.5 rounded">{conflicts.filter(c => c.tipe_konflik === 'guru_bentrok').length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200 text-amber-700">
                <span>Bentrok Jadwal Kelas</span>
                <span className="font-mono font-bold bg-amber-500 text-white px-1.5 rounded">{conflicts.filter(c => c.tipe_konflik === 'kelas_bentrok').length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">
                <span>Penggunaan Ruang Belajar Ganda</span>
                <span className="font-mono font-bold bg-rose-600 text-white px-1.5 rounded">{conflicts.filter(c => c.tipe_konflik === 'ruangan_bentrok').length}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                <span>Pelanggaran Preferensi Guru</span>
                <span className="font-mono font-bold bg-indigo-500 text-white px-1.5 rounded">{conflicts.filter(c => c.tipe_konflik === 'preferensi_bentrok').length}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs leading-relaxed text-slate-550 space-y-2 font-medium">
              <span className="font-bold text-slate-700 block">Saran Penyelesaian Konflik:</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Gunakan fitur <b>Tukar Slot</b> di halaman Grid untuk mengalihkan secara manual.</li>
                <li>Buka modul <b>Preferensi Guru</b> untuk melonggarkan jam blokir jika jadwal terlalu padat.</li>
                <li>Tambahkan prasarana ruangan cadangan untuk kelas paralel.</li>
              </ol>
            </div>
          </div>

          {/* ACTIVE DETAILED CONFLICT LOGS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-800 text-sm">Masalah Bentrokan Berdasarkan Rapor Waktu</h3>

            <div className="space-y-3">
              {conflicts.map((cf) => {
                return (
                  <div key={cf.id} className="p-4 bg-slate-50 border border-slate-202 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-rose-50 text-rose-600 border border-rose-220 rounded-lg shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-rose-700 uppercase tracking-tight text-[9px] bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded leading-none">
                          {cf.tipe_konflik.replace('_', ' ').toUpperCase()}
                        </span>
                        {cf.jam_ke > 0 ? (
                          <span className="text-slate-800 font-bold">Hari {cf.hari} • Jam Ke-{cf.jam_ke}</span>
                        ) : (
                          <span className="text-slate-800 font-bold">Kapasitas Hari {cf.hari}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-650 font-medium leading-relaxed mt-1.5">{cf.deskripsi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

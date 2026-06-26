'use client';

import React from 'react';
import { 
  Users, 
  Layers, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  Play, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  Info 
} from 'lucide-react';
import { Guru, Kelas, MataPelajaran, Jadwal, KonflikJadwal } from '../lib/types';

interface DashboardTabProps {
  guru: Guru[];
  kelas: Kelas[];
  mapel: MataPelajaran[];
  jadwal: Jadwal[];
  conflicts: KonflikJadwal[];
  setActiveTab: (tab: string) => void;
  handleClearJadwal: () => void;
}

export default function DashboardTab({
  guru,
  kelas,
  mapel,
  jadwal,
  conflicts,
  setActiveTab,
  handleClearJadwal
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ringkasan Sistem</h2>
          <p className="text-sm text-slate-500">Ikhtisar data kurikulum sekolah dan kualitas jadwal pelajaran saat ini.</p>
        </div>
        {jadwal.length === 0 ? (
          <button 
            onClick={() => setActiveTab('generate')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-xs text-sm cursor-pointer"
          >
            <Play className="w-4 h-4" /> Susun Jadwal Instan Sekarang
          </button>
        ) : (
          <button 
            onClick={handleClearJadwal}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-55 hover:bg-rose-100 text-rose-700 border border-rose-220 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan Jadwal
          </button>
        )}
      </div>

      {/* KPI STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Total Guru Aktif</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{guru.filter(g => g.status_aktif).length}</h3>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100/50">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Jumlah Kelas</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{kelas.length}</h3>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100/50">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Mata Pelajaran</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{mapel.length}</h3>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100/50">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Jam Terjadwal</span>
            <h3 className="text-2xl font-bold mt-1 text-indigo-600">
              {jadwal.length} <span className="text-xs text-slate-500 font-normal">slot</span>
            </h3>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100/50">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between col-span-2 lg:col-span-1 shadow-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Deteksi Konflik</span>
            <h3 className={`text-2xl font-bold mt-1 ${conflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {conflicts.length === 0 ? '✓ Sempurna' : `${conflicts.length} Konflik`}
            </h3>
          </div>
          <div className={`p-2.5 rounded-lg border ${conflicts.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DASHBOARD VISUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT CONFLICTS OR STATUS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Real-time Konflik Dan Validasi
            </h4>
            <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">Evaluasi Instan</span>
          </div>

          {conflicts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 stroke-[1.5] mb-2" />
              <h5 className="font-bold text-slate-800">Tidak Ada Bentrok Jadwal</h5>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Sistem penjadwalan telah diuji terhadap seluruh hard constraint. Semua guru, kelas, dan ruangan berada dalam konfigurasi ideal.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {conflicts.slice(0, 5).map((cf) => (
                <div key={cf.id} className="p-3 bg-rose-50 border border-rose-100 border-l-4 border-l-rose-500 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-105 text-rose-750 font-bold border border-rose-220">
                        {cf.tipe_konflik.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-800 font-bold">Hari {cf.hari} • Jam Ke-{cf.jam_ke}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{cf.deskripsi}</p>
                  </div>
                </div>
              ))}
              {conflicts.length > 5 && (
                <button 
                  onClick={() => setActiveTab('konflik')}
                  className="w-full text-center py-2 text-xs text-indigo-600 font-bold hover:text-indigo-850 transition hover:underline cursor-pointer"
                >
                  Lihat {conflicts.length - 5} Konflik Tambahan Lainnya &gt;
                </button>
              )}
            </div>
          )}
        </div>

        {/* SCHEDULER HELPER INFO */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5 shadow-xs">
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" /> Aturan Penjadwalan
            </h4>
            
            <div className="text-xs space-y-3 leading-relaxed">
              <div>
                <span className="font-bold text-indigo-700 block mb-0.5">Constraint Wajib (Hard):</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium whitespace-normal">
                  <li>Guru mengajar maks 1 kelas per jam.</li>
                  <li>Kelas hanya belajar 1 mapel per jam.</li>
                  <li>Ruangan eksklusif 1 kelas per jam.</li>
                  <li>Terkondisi dari blok/libur guru.</li>
                </ul>
              </div>
              <div>
                <span className="font-bold text-indigo-700 block mb-0.5">Constraint Prioritas (Soft):</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium whitespace-normal">
                  <li>Utamakan hari &amp; jam favorit guru.</li>
                  <li>Sebar mata pelajaran tidak menumpuk.</li>
                  <li>Maksimal jam mengajar harian guru.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs leading-relaxed text-slate-600 flex items-start gap-2 font-medium">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Gunakan fitur <b>Drag &amp; Drop</b> atau tukar posisi manual di tab Grid untuk penyesuaian manual langsung.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

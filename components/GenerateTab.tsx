'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { Guru, Kelas, PengampuMataPelajaran } from '../lib/types';

interface GenerateTabProps {
  guru: Guru[];
  kelas: Kelas[];
  pengampu: PengampuMataPelajaran[];
  algorithm: 'csp' | 'genetic';
  setAlgorithm: (alg: 'csp' | 'genetic') => void;
  isGenerating: boolean;
  stats: { executionTimeMs: number; score: number };
  handleGenerateAutomatedTimetable: () => void;
}

export default function GenerateTab({
  guru,
  kelas,
  pengampu,
  algorithm,
  setAlgorithm,
  isGenerating,
  stats,
  handleGenerateAutomatedTimetable
}: GenerateTabProps) {
  const totalBebanJP = pengampu.reduce((acc, curr) => acc + curr.jumlah_jam, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Penyusunan Jadwal Pelajaran Otomatis</h2>
        <p className="text-xs text-slate-500">Tekan tombol di bawah untuk mencocokkan total ribuan kombinasi pencarian ruang dan waktu bebas bentrok dalam sekejap.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-3xl mx-auto space-y-6 font-sans">
        
        {/* SELECT ALGORITHM DESIGNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Algoritma CSP */}
          <label className={`block border p-4 rounded-xl cursor-pointer transition relative selection:bg-transparent ${algorithm === 'csp' ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-xs' : 'bg-slate-50/55 border-slate-200 text-slate-605 hover:border-slate-300'}`}>
            <input 
              type="radio" 
              name="algorithm-select" 
              checked={algorithm === 'csp'} 
              onChange={() => setAlgorithm('csp')}
              className="absolute right-4 top-4 accent-indigo-650"
            />
            <div className="font-bold text-sm text-slate-800">Constraint Satisfaction Problem (CSP)</div>
            <div className="font-mono text-[9px] text-indigo-600 font-bold tracking-wider mt-0.5 uppercase">Backtracking + MRV + Forward Checking</div>
            <p className="text-[11px] text-slate-550 font-medium mt-2 leading-relaxed">
              Sistematis mencari ruang solusi non-bentrok. Minimum Remaining Values (MRV) menyortir guru dengan batasan libur tersusah untuk diplot terlebih dahulu guna menjamin 100% kepatuhan aturan wajib.
            </p>
          </label>

          {/* Genetic model */}
          <label className={`block border p-4 rounded-xl cursor-pointer transition relative selection:bg-transparent ${algorithm === 'genetic' ? 'bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-xs' : 'bg-slate-50/55 border-slate-200 text-slate-605 hover:border-slate-300'}`}>
            <input 
              type="radio" 
              name="algorithm-select" 
              checked={algorithm === 'genetic'} 
              onChange={() => setAlgorithm('genetic')}
              className="absolute right-4 top-4 accent-indigo-650"
            />
            <div className="font-bold text-sm text-slate-800">Algoritma Genetika (Evolusi)</div>
            <div className="font-mono text-[9px] text-indigo-600 font-bold tracking-wider mt-0.5 uppercase">Kromosom Seleksi Acak + Crossover + Mutasi</div>
            <p className="text-[11px] text-slate-550 font-medium mt-2 leading-relaxed">
              Cocok untuk sekolah super besar dengan ratusan guru. Meniru reproduksi biologis guna mendapatkan hasil jadwal paling lentur berbasis penghitungan skor fitness kriteria.
            </p>
          </label>

        </div>

        {/* RUN COMMAND BUTTON CONTROL */}
        <div className="border-t border-slate-200 pt-6 flex flex-col items-center justify-center text-center gap-4">
          
          {isGenerating ? (
            <div className="space-y-4 py-4">
              {/* Animating gears / spinner loader */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Mengeksekusi Pencarian Solusi...</h4>
                <p className="text-xs text-slate-500 mt-1">Algoritma {algorithm.toUpperCase()} sedang memetakan domain waktu kosong tiap kelas dan ruangan.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed max-w-md text-slate-600 border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Status Kesiapan SMAN 1 AI:</span>
                ✓ Guru terdaftar: <b>{guru.length}</b> • ✓ Kelas: <b>{kelas.length}</b> • ✓ Total Jam Terdistribusi: <b>{totalBebanJP} slots</b>.
              </div>

              <button 
                onClick={handleGenerateAutomatedTimetable}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl hover:shadow-lg transition active:scale-95 text-sm flex items-center justify-center gap-2 mx-auto shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 text-white fill-current" /> GENERATE JADWAL SEKARANG
              </button>
            </div>
          )}

          {/* LATEST RESULT REPORT */}
          {stats.score > 0 && !isGenerating && (
            <div className="bg-slate-55 border border-slate-200 p-4 rounded-lg w-full max-w-md text-left text-xs grid grid-cols-2 gap-3 divide-x divide-slate-200">
              <div>
                <span className="text-slate-450 font-mono block text-[10px] uppercase font-bold">Waktu Komputasi</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{stats.executionTimeMs} ms</span>
              </div>
              <div className="pl-4">
                <span className="text-slate-450 font-mono block text-[10px] uppercase font-bold">Akurasi Fitness</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">{stats.score} Pts</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

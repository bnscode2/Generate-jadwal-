'use client';

import React from 'react';
import { Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Guru, Kelas, PengampuMataPelajaran, PreferensiGuru } from '../lib/types';

interface GenerateTabProps {
  guru: Guru[];
  kelas: Kelas[];
  pengampu: PengampuMataPelajaran[];
  preferensi: PreferensiGuru[];
  algorithm: 'csp' | 'genetic';
  setAlgorithm: (alg: 'csp' | 'genetic') => void;
  allowPartial: boolean;
  setAllowPartial: (allow: boolean) => void;
  ignoreRoomConflicts: boolean;
  setIgnoreRoomConflicts: (ignore: boolean) => void;
  isGenerating: boolean;
  stats: { 
    executionTimeMs: number; 
    score: number;
    totalLessonsNeeded?: number;
    totalLessonsPlotted?: number;
    totalConflicts?: number;
  };
  handleGenerateAutomatedTimetable: () => void;
  handleCancelGeneration?: () => void;
  generationProgress: number;
}

export default function GenerateTab({
  guru,
  kelas,
  pengampu,
  preferensi = [],
  algorithm,
  setAlgorithm,
  allowPartial,
  setAllowPartial,
  ignoreRoomConflicts,
  setIgnoreRoomConflicts,
  isGenerating,
  stats,
  handleGenerateAutomatedTimetable,
  handleCancelGeneration,
  generationProgress
}: GenerateTabProps) {
  const totalBebanJP = pengampu.reduce((acc, curr) => acc + curr.jumlah_jam, 0);

  return (
    <div className="space-y-6" id="generate-tab">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans">Penyusunan Jadwal Pelajaran Otomatis</h2>
        <p className="text-xs text-slate-500 font-medium">Tekan tombol di bawah untuk mencocokkan total ribuan kombinasi pencarian ruang dan waktu bebas bentrok dalam sekejap.</p>
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

        {/* EXTRA GENERATION SETTINGS */}
        <div className="space-y-3">
          {algorithm === 'csp' && (
            <div className="bg-amber-50/40 border border-amber-250 rounded-xl p-4 text-left">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allow-partial-checkbox"
                  checked={allowPartial}
                  onChange={(e) => setAllowPartial(e.target.checked)}
                  className="mt-1 accent-indigo-650 cursor-pointer h-4 w-4 rounded"
                />
                <div>
                  <label htmlFor="allow-partial-checkbox" className="font-bold text-xs text-slate-800 cursor-pointer block select-none">
                    Izinkan Hasil Jadwal Parsial (Selesai Meskipun Tidak 100% Mengisi Grid)
                  </label>
                  <p className="text-[11px] text-slate-550 mt-1 leading-relaxed">
                    Jika diaktifkan, apabila sistem tidak menemukan kombinasi penuh 100% karena kendala yang sangat padat, sistem akan <b>tetap mengembalikan jadwal terbaik tanpa bentrok</b>. Sisa slot kosong dapat Anda lengkapi secara manual dengan mengklik sel kosong di tab Grid. Ini sangat mempermudah kerja guru karena preferensi yang bisa masuk akan otomatis terplot dengan rapi.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-emerald-50/40 border border-emerald-250 rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="ignore-room-conflicts-checkbox"
                checked={ignoreRoomConflicts}
                onChange={(e) => setIgnoreRoomConflicts(e.target.checked)}
                className="mt-1 accent-indigo-650 cursor-pointer h-4 w-4 rounded"
              />
              <div>
                <label htmlFor="ignore-room-conflicts-checkbox" className="font-bold text-xs text-slate-800 cursor-pointer block select-none">
                  Abaikan Bentrok Penggunaan Ruangan (Sangat Direkomendasikan)
                </label>
                <p className="text-[11px] text-slate-550 mt-1 leading-relaxed">
                  Jika diaktifkan, bentrok ruangan tidak akan dianggap sebagai pelanggaran aturan keras (*hard constraint*). Setiap kelas (misalnya Kelas 7A) akan secara otomatis diplot pada ruang kelasnya masing-masing tanpa dibatasi ketersediaan ruangan bersama, sehingga <b>proses pembuatan jadwal berjalan jauh lebih mulus, cepat, dan anti-merah</b>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RUN COMMAND BUTTON CONTROL */}
        <div className="border-t border-slate-200 pt-6 flex flex-col items-center justify-center text-center gap-6">
          
          {isGenerating ? (
            <div className="space-y-5 py-4 w-full">
              {/* Animating gears / spinner loader */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Mengeksekusi Pencarian Solusi...</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Algoritma {algorithm.toUpperCase()} sedang memetakan domain waktu kosong tiap kelas dan ruangan di latar belakang.
                </p>
              </div>

              {/* REAL-TIME PROGRESS BAR */}
              <div className="w-full max-w-md mx-auto space-y-2 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-700 font-sans">Progres Pemetaan Waktu</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    {generationProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden border border-slate-300">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out animate-pulse"
                    style={{ width: `${Math.max(3, generationProgress)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium font-sans">
                  <span>Menganalisis Ruang Guru</span>
                  <span>Mendeteksi Bentrokan</span>
                </div>
              </div>

              {handleCancelGeneration && (
                <button
                  type="button"
                  onClick={handleCancelGeneration}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-lg text-xs transition active:scale-95 cursor-pointer"
                >
                  Batalkan Proses
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed max-w-md text-slate-600 border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Status Kesiapan SMAN 1 AI:</span>
                ✓ Guru terdaftar: <b>{guru.length}</b> • ✓ Kelas: <b>{kelas.length}</b> • ✓ Total Jam Terdistribusi: <b>{totalBebanJP} slots</b>.
              </div>

              <button 
                onClick={handleGenerateAutomatedTimetable}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl hover:shadow-lg transition active:scale-95 text-sm flex items-center justify-center gap-2 mx-auto shadow-sm cursor-pointer animate-pulse"
              >
                <Play className="w-4 h-4 text-white fill-current" /> GENERATE JADWAL SEKARANG
              </button>
            </div>
          )}

          {/* LATEST RESULT REPORT WITH SUCCESS METRICS */}
          {stats.score > 0 && !isGenerating && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl w-full max-w-xl text-left text-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <span className="text-base">📊</span>
                <span className="font-bold text-slate-800 text-sm">Laporan Hasil Penyusunan Jadwal</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-150">
                <div className="space-y-1">
                  <span className="text-slate-450 font-mono block text-[9px] uppercase font-bold tracking-wider">Durasi Komputasi</span>
                  <span className="text-base font-bold text-slate-800 font-mono">{stats.executionTimeMs} ms</span>
                </div>
                <div className="space-y-1 pl-4">
                  <span className="text-slate-450 font-mono block text-[9px] uppercase font-bold tracking-wider">Skor Kepatuhan</span>
                  <span className="text-base font-bold text-indigo-700 font-mono">{stats.score} Pts</span>
                </div>
                <div className="space-y-1 pl-4">
                  <span className="text-slate-450 font-mono block text-[9px] uppercase font-bold tracking-wider">Berhasil Diplot</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {stats.totalLessonsPlotted ?? 0} / {stats.totalLessonsNeeded ?? totalBebanJP} JP
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  <span className="text-slate-450 font-mono block text-[9px] uppercase font-bold tracking-wider">Bentrokan Tersisa</span>
                  <span className={`text-base font-bold font-mono ${stats.totalConflicts && stats.totalConflicts > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                    {stats.totalConflicts ?? 0} Konflik
                  </span>
                </div>
              </div>

              {stats.totalLessonsPlotted !== undefined && stats.totalLessonsNeeded !== undefined && (
                <div className="bg-white border border-slate-150 rounded-lg p-3.5 space-y-2 font-medium">
                  <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                    <span>Rasio Keberhasilan Pengisian Jadwal</span>
                    <span className="text-emerald-700 font-bold">
                      {Math.round((stats.totalLessonsPlotted / stats.totalLessonsNeeded) * 100)}% Berhasil
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stats.totalLessonsPlotted / stats.totalLessonsNeeded) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    {stats.totalConflicts && stats.totalConflicts > 0 ? (
                      <div className="text-amber-700 font-bold bg-amber-50 border border-amber-100 p-2.5 rounded-md mt-2 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Catatan: Jadwal terisi 100%, namun terdapat beberapa bentrokan karena total beban jam mengajar guru melampaui kapasitas sekolah. Selesaikan bentrok di tab <b>Validasi Konflik</b> menggunakan saran penyelesaian dan pembagian (split) beban mengajar.
                        </span>
                      </div>
                    ) : stats.totalLessonsPlotted && stats.totalLessonsNeeded && stats.totalLessonsPlotted < stats.totalLessonsNeeded ? (
                      <div className="space-y-4 text-left">
                        <div className="text-amber-700 font-bold bg-amber-50 border border-amber-100 p-2.5 rounded-md mt-2 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Hasil Parsial ({Math.round((stats.totalLessonsPlotted / stats.totalLessonsNeeded) * 100)}%): Sistem berhasil menempatkan {stats.totalLessonsPlotted} dari {stats.totalLessonsNeeded} JP secara aman tanpa bentrok. Sisa slot kosong dapat Anda isi secara manual di tab <b>Grid</b> dengan mengklik kotak kosong.
                          </span>
                        </div>

                        {(() => {
                          const list: {
                            guru: Guru;
                            pref: PreferensiGuru;
                            score: number;
                            reasons: string[];
                            totalJP: number;
                          }[] = [];

                          for (const p of preferensi) {
                            const g = guru.find(x => x.id === p.guru_id);
                            if (!g || !g.status_aktif) continue;

                            const totalJP = pengampu
                              .filter(x => x.guru_id === g.id)
                              .reduce((sum, x) => sum + x.jumlah_jam, 0);

                            const reasons: string[] = [];
                            let restrictionScore = 0;

                            if (p.hari_tidak_bersedia && p.hari_tidak_bersedia.length > 0) {
                              restrictionScore += p.hari_tidak_bersedia.length * 20;
                              reasons.push(`Berhalangan mengajar pada hari: ${p.hari_tidak_bersedia.join(', ')}`);
                            }

                            if (p.jam_tidak_bersedia && p.jam_tidak_bersedia.length > 0) {
                              restrictionScore += p.jam_tidak_bersedia.length * 3;
                              reasons.push(`Berhalangan pada jam pelajaran: ${p.jam_tidak_bersedia.map(j => `ke-${j}`).join(', ')}`);
                            }

                            if (p.slot_tidak_bersedia && p.slot_tidak_bersedia.length > 0) {
                              restrictionScore += p.slot_tidak_bersedia.length * 5;
                              reasons.push(`Memiliki ${p.slot_tidak_bersedia.length} slot berhalangan khusus`);
                            }

                            if (p.max_jam_per_hari && p.max_jam_per_hari < 6) {
                              const strictness = 6 - p.max_jam_per_hari;
                              restrictionScore += strictness * 15;
                              reasons.push(`Maksimum mengajar dibatasi hanya ${p.max_jam_per_hari} JP per hari`);
                            }

                            if (totalJP > 15 && restrictionScore > 15) {
                              restrictionScore += 25;
                            }

                            if (restrictionScore > 0) {
                              list.push({
                                guru: g,
                                pref: p,
                                score: restrictionScore,
                                reasons,
                                totalJP
                              });
                            }
                          }

                          const restrictiveTeachers = list.sort((a, b) => b.score - a.score).slice(0, 3);

                          if (restrictiveTeachers.length === 0) return null;

                          return (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-left">
                              <span className="font-bold text-xs text-slate-800 block mb-1">💡 Tips & Rekomendasi Pengisian Penuh 100%:</span>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                Sistem tidak dapat menempatkan sisa slot karena beberapa guru memiliki batasan preferensi berhalangan mengajar yang sangat ketat. Cobalah untuk melonggarkan batasan atau hari libur guru-guru berikut di tab <b>Daftar Guru</b> agar jadwal dapat terisi penuh 100%:
                              </p>
                              <div className="space-y-3 mt-3">
                                {restrictiveTeachers.map((rt, idx) => (
                                  <div key={idx} className="border-l-3 border-indigo-500 pl-3 py-1 bg-white border border-slate-150 rounded-r-lg shadow-2xs">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-slate-800 text-xs">{rt.guru.nama}</span>
                                      <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                                        Beban Kerja: {rt.totalJP} JP
                                      </span>
                                    </div>
                                    <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-600 text-[11px]">
                                      {rt.reasons.map((r, rIdx) => (
                                        <li key={rIdx}>{r}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-md mt-2 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Sukses Sempurna: Seluruh mata pelajaran berhasil ditempatkan tanpa bentrokan apa pun!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

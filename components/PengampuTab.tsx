'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Guru, MataPelajaran, Kelas, PengampuMataPelajaran } from '../lib/types';

interface PengampuTabProps {
  guru: Guru[];
  mapel: MataPelajaran[];
  kelas: Kelas[];
  pengampu: PengampuMataPelajaran[];
  newPengampu: Partial<PengampuMataPelajaran>;
  setNewPengampu: React.Dispatch<React.SetStateAction<Partial<PengampuMataPelajaran>>>;
  handleAddPengampu: (e: React.FormEvent) => void;
  handleDeletePengampu: (id: string) => void;
}

export default function PengampuTab({
  guru,
  mapel,
  kelas,
  pengampu,
  newPengampu,
  setNewPengampu,
  handleAddPengampu,
  handleDeletePengampu
}: PengampuTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Pembagian Pengampu Mata Pelajaran</h2>
        <p className="text-xs text-slate-500">Satu guru dapat mengambil beban mengajar untuk beberapa kelas sekaligus. Silakan plot di modul ini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FORM ADD ASSIGNMENT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" /> Ploting Tugas Mengajar
          </h3>

          <form onSubmit={handleAddPengampu} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Pilih Guru Pengajar</label>
              <select 
                value={newPengampu.guru_id || ''}
                onChange={(e) => setNewPengampu({...newPengampu, guru_id: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-medium transition-all"
                required
              >
                <option value="">-- Pilih Nama Guru --</option>
                {guru.filter(g => g.status_aktif).map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Mata Pelajaran Diampu</label>
              <select 
                value={newPengampu.mapel_id || ''}
                onChange={(e) => setNewPengampu({...newPengampu, mapel_id: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505/20 font-medium transition-all"
                required
              >
                <option value="">-- Pilih Bidang Studi --</option>
                {mapel.map(m => (
                  <option key={m.id} value={m.id}>({m.kode_mapel}) {m.nama_mapel}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Pilih Rombel / Kelas</label>
                <select 
                  value={newPengampu.kelas_id || ''}
                  onChange={(e) => setNewPengampu({...newPengampu, kelas_id: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-805 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-bold transition-all"
                  required
                >
                  <option value="">-- Kelas --</option>
                  {kelas.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Alokasi (Jam JP/Minggu)</label>
                <input 
                  type="number" 
                  min={1}
                  max={12}
                  value={newPengampu.jumlah_jam || 4}
                  onChange={(e) => setNewPengampu({...newPengampu, jumlah_jam: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-bold transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Kunci Alokasi Tugas
            </button>
          </form>
        </div>

        {/* CURRENT ASSIGNMENTS TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="font-semibold text-slate-800 text-sm">Struktur Ploting Kurikulum</h3>
          
          <div className="overflow-x-auto text-xs font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-550 font-mono text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Pengajar</th>
                  <th className="py-2.5 px-3">Studi Mapel</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Beban JP/Minggu</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengampu.map((assign) => {
                  const matchingGuru = guru.find(g => g.id === assign.guru_id);
                  const matchingMapel = mapel.find(m => m.id === assign.mapel_id);
                  const matchingKelas = kelas.find(c => c.id === assign.kelas_id);

                  return (
                    <tr key={assign.id} className="hover:bg-slate-50/55">
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {matchingGuru ? matchingGuru.nama : <span className="text-rose-500 italic">Guru terhapus</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {matchingMapel ? matchingMapel.nama_mapel : <span className="text-rose-500 italic">Mapel terhapus</span>}
                      </td>
                      <td className="py-3 px-3 text-indigo-700 font-bold">
                        {matchingKelas ? matchingKelas.nama_kelas : <span className="text-rose-500 italic">Kelas terhapus</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-bold font-mono">{assign.jumlah_jam} JP</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => handleDeletePengampu(assign.id)}
                          className="text-rose-605 hover:text-rose-850 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

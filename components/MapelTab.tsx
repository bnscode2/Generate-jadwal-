'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MataPelajaran } from '../lib/types';

interface MapelTabProps {
  mapel: MataPelajaran[];
  newMapel: Partial<MataPelajaran>;
  setNewMapel: React.Dispatch<React.SetStateAction<Partial<MataPelajaran>>>;
  handleAddMapel: (e: React.FormEvent) => void;
  handleDeleteMapel: (id: string) => void;
}

export default function MapelTab({
  mapel,
  newMapel,
  setNewMapel,
  handleAddMapel,
  handleDeleteMapel
}: MapelTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Mata Pelajaran Sekolah</h2>
        <p className="text-xs text-slate-500">Merumuskan daftar mata pelajaran kurikulum beserta total alokasi jam tatap muka per minggu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FORM ADD SUBJECT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" /> Tambah Mata Pelajaran
          </h3>

          <form onSubmit={handleAddMapel} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nama Mata Pelajaran</label>
              <input 
                type="text" 
                value={newMapel.nama_mapel || ''}
                onChange={(e) => setNewMapel({...newMapel, nama_mapel: e.target.value})}
                placeholder="contoh: Pendidikan Kewarganegaraan"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kode Mapel (Singkat)</label>
                <input 
                  type="text" 
                  value={newMapel.kode_mapel || ''}
                  onChange={(e) => setNewMapel({...newMapel, kode_mapel: e.target.value})}
                  placeholder="contoh: PKN"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Durasi (JP/Minggu)</label>
                <input 
                  type="number" 
                  min={1}
                  max={10}
                  value={newMapel.jumlah_jam_per_minggu || 4}
                  onChange={(e) => setNewMapel({...newMapel, jumlah_jam_per_minggu: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Daftarkan Mapel
            </button>
          </form>
        </div>

        {/* SUBJECTS LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Mata Pelajaran Aktif</h3>
          
          <div className="overflow-x-auto text-xs font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Kode Mapel</th>
                  <th className="py-2.5 px-3">Nama Lengkap Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Jumlah Jam Mengajar Seminggu</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mapel.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/55">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{m.kode_mapel}</td>
                    <td className="py-3 px-3 text-slate-800 font-bold">{m.nama_mapel}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      <span className="font-bold text-slate-900">{m.jumlah_jam_per_minggu}</span> JP (Jam Pelajaran)
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => handleDeleteMapel(m.id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Kelas, Ruangan } from '../lib/types';

interface KelasTabProps {
  kelas: Kelas[];
  ruangan: Ruangan[];
  newKelas: Partial<Kelas>;
  setNewKelas: React.Dispatch<React.SetStateAction<Partial<Kelas>>>;
  newRuangan: Partial<Ruangan>;
  setNewRuangan: React.Dispatch<React.SetStateAction<Partial<Ruangan>>>;
  handleAddKelas: (e: React.FormEvent) => void;
  handleDeleteKelas: (id: string) => void;
  handleAddRuangan: (e: React.FormEvent) => void;
  handleDeleteRuangan: (id: string) => void;
}

export default function KelasTab({
  kelas,
  ruangan,
  newKelas,
  setNewKelas,
  newRuangan,
  setNewRuangan,
  handleAddKelas,
  handleDeleteKelas,
  handleAddRuangan,
  handleDeleteRuangan
}: KelasTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Kelas &amp; Ruangan Belajar</h2>
        <p className="text-xs text-slate-500">Menyusun detail kelas target belajar beserta daya tampung ruangan fisik yang tersedia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN LEFT: CLASS COGNITION */}
        <div className="space-y-6">
          
          {/* ADD CLASS */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Tambah Rombel Kelas Baru
            </h3>

            <form onSubmit={handleAddKelas} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nama Kelas</label>
                  <input 
                    type="text" 
                    value={newKelas.nama_kelas || ''}
                    onChange={(e) => setNewKelas({...newKelas, nama_kelas: e.target.value})}
                    placeholder="contoh: VII A"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505/20 transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tingkat Kurikulum</label>
                  <select 
                    value={newKelas.tingkat || 'VII'}
                    onChange={(e) => setNewKelas({...newKelas, tingkat: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-bold"
                  >
                    <option value="VII">Kelas VII (Satu)</option>
                    <option value="VIII">Kelas VIII (Dua)</option>
                    <option value="IX">Kelas IX (Tiga)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Wali Kelas Lengkap</label>
                <input 
                  type="text" 
                  value={newKelas.wali_kelas || ''}
                  onChange={(e) => setNewKelas({...newKelas, wali_kelas: e.target.value})}
                  placeholder="contoh: Ahmad Subarjo, S.Pd."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505/20 transition-all font-medium"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Daftarkan Rombel Kelas
              </button>
            </form>
          </div>

          {/* CLASS TABLES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-800 text-sm">Daftar Rombongan Belajar (Rombel)</h3>
            
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-550 font-mono text-[10px] uppercase font-bold">
                    <th className="py-2.5 px-3">Nama Kelas</th>
                    <th className="py-2.5 px-3">Tingkat</th>
                    <th className="py-2.5 px-3">Wali Kelas</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kelas.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/55">
                      <td className="py-3 px-3 font-bold text-slate-800">{c.nama_kelas}</td>
                      <td className="py-3 px-3 text-indigo-700 font-mono font-bold">Tingkat {c.tingkat}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{c.wali_kelas || 'Belum diisi'}</td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => handleDeleteKelas(c.id)}
                          className="text-rose-605 hover:text-rose-850 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
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

        {/* COLUMN RIGHT: PHYSICAL ROOMS COGNITION */}
        <div className="space-y-6">
          
          {/* ADD ROOM */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Tambah Ruangan Baru
            </h3>

            <form onSubmit={handleAddRuangan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nama Ruangan</label>
                  <input 
                    type="text" 
                    value={newRuangan.nama_ruangan || ''}
                    onChange={(e) => setNewRuangan({...newRuangan, nama_ruangan: e.target.value})}
                    placeholder="contoh: Lab IPA / Aula"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505/20 font-medium transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kapasitas Kursi</label>
                  <input 
                    type="number" 
                    min={1}
                    value={newRuangan.kapasitas || 32}
                    onChange={(e) => setNewRuangan({...newRuangan, kapasitas: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505/20 transition-all"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition cursor-pointer"
              >
                Tambahkan Kamar Ruang
              </button>
            </form>
          </div>

          {/* ROOM TABLES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-800 text-sm">Prasarana Ruangan Sekolah</h3>
            
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-550 font-mono text-[10px] uppercase font-bold">
                    <th className="py-2.5 px-3">Nama Ruangan</th>
                    <th className="py-2.5 px-3">Daya Tampung</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ruangan.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/55">
                      <td className="py-3 px-3 font-bold text-slate-800">{r.nama_ruangan}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        <span className="text-slate-900 font-bold">{r.kapasitas}</span> Siswa / Kelas
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          onClick={() => handleDeleteRuangan(r.id)}
                          className="text-rose-605 hover:text-rose-850 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
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
    </div>
  );
}

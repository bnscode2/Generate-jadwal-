'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Settings, Check, X } from 'lucide-react';
import { Kelas, Ruangan, Hari, PreferensiKelas, JamPelajaran } from '../lib/types';
import { LocalDB } from '../lib/db';

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
  handleUpdateKelas?: (updated: Kelas) => void;
  preferensiKelas?: PreferensiKelas[];
  onSavePreferensiKelas?: (data: PreferensiKelas[]) => void;
  hariAktif?: Hari[];
  jamPelajaran?: JamPelajaran[];
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
  handleDeleteRuangan,
  handleUpdateKelas,
  preferensiKelas = [],
  onSavePreferensiKelas,
  hariAktif = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  jamPelajaran = []
}: KelasTabProps) {
  const [selectedJenjang, setSelectedJenjang] = useState<'SD' | 'SMP' | 'SMA'>(() => {
    if (typeof window === 'undefined') return 'SMP';
    const activeUnit = LocalDB.getActiveUnit();
    const profile = LocalDB.getSchoolProfile();
    const nameToCheck = (activeUnit || profile?.nama_sekolah || '').toUpperCase();

    if (nameToCheck.includes('SD') || nameToCheck.includes('MI') || nameToCheck.includes('IBTIDAIYAH') || nameToCheck.includes('DASAR')) {
      return 'SD';
    } else if (nameToCheck.includes('SMA') || nameToCheck.includes('SMK') || nameToCheck.includes('MA') || nameToCheck.includes('ALIYAH') || nameToCheck.includes('KEJURUAN')) {
      return 'SMA';
    }
    return 'SMP';
  });

  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [preferensiModalKelasId, setPreferensiModalKelasId] = useState<string | null>(null);

  // Preference fields state
  const [prefSpecificSlotsBlocked, setPrefSpecificSlotsBlocked] = useState<{ hari: Hari; jam_ke: number }[]>([]);
  const [prefMaxHours, setPrefMaxHours] = useState<number>(8);

  const periodsList = jamPelajaran.length > 0 
    ? jamPelajaran.map(p => p.jam_ke).sort((a, b) => a - b) 
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Load existing class preferences on opening modal
  const openPreferencesModal = (kelasId: string) => {
    const existing = preferensiKelas.find(cp => cp.kelas_id === kelasId);
    setPreferensiModalKelasId(kelasId);
    if (existing) {
      setPrefSpecificSlotsBlocked(existing.slot_tidak_bersedia || []);
      setPrefMaxHours(existing.max_jam_per_hari || 8);
    } else {
      setPrefSpecificSlotsBlocked([]);
      setPrefMaxHours(8);
    }
  };

  // Synchronize default tingkat based on initial selectedJenjang once on mount
  useEffect(() => {
    if (selectedJenjang === 'SD') {
      if (!newKelas.tingkat || !['I', 'II', 'III', 'IV', 'V', 'VI'].includes(newKelas.tingkat)) {
        setNewKelas(prev => ({ ...prev, tingkat: 'I' }));
      }
    } else if (selectedJenjang === 'SMA') {
      if (!newKelas.tingkat || !['X', 'XI', 'XII'].includes(newKelas.tingkat)) {
        setNewKelas(prev => ({ ...prev, tingkat: 'X' }));
      }
    } else {
      if (!newKelas.tingkat || !['VII', 'VIII', 'IX'].includes(newKelas.tingkat)) {
        setNewKelas(prev => ({ ...prev, tingkat: 'VII' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKelas) {
      if (!editingKelas.nama_kelas) {
        alert('Nama kelas wajib diisi.');
        return;
      }
      if (handleUpdateKelas) {
        handleUpdateKelas(editingKelas);
      }
      setEditingKelas(null);
    } else {
      handleAddKelas(e);
    }
  };

  const toggleSpecificSlotBlocked = (hari: Hari, jam_ke: number) => {
    setPrefSpecificSlotsBlocked(prev => {
      const exists = prev.some(x => x.hari === hari && x.jam_ke === jam_ke);
      if (exists) {
        return prev.filter(x => !(x.hari === hari && x.jam_ke === jam_ke));
      } else {
        return [...prev, { hari, jam_ke }];
      }
    });
  };

  const handleResetPreferences = () => {
    setPrefSpecificSlotsBlocked([]);
    setPrefMaxHours(8);
  };

  const handleSavePreferences = () => {
    if (!preferensiModalKelasId || !onSavePreferensiKelas || !preferensiKelas) return;
    
    // Filter out existing preference for this class
    const filtered = preferensiKelas.filter(cp => cp.kelas_id !== preferensiModalKelasId);
    
    // Add the new one
    const newPref: PreferensiKelas = {
      id: `class-pref-${preferensiModalKelasId}`,
      kelas_id: preferensiModalKelasId,
      slot_tidak_bersedia: prefSpecificSlotsBlocked,
      max_jam_per_hari: prefMaxHours
    };
    
    onSavePreferensiKelas([...filtered, newPref]);
    setPreferensiModalKelasId(null);
  };

  const modalKelasObj = kelas.find(c => c.id === preferensiModalKelasId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Kelola Kelas &amp; Ruangan Belajar</h2>
        <p className="text-xs text-slate-500">Menyusun detail kelas target belajar beserta daya tampung ruangan fisik yang tersedia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN LEFT: CLASS COGNITION */}
        <div className="space-y-6">
          
          {/* ADD OR EDIT CLASS */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              {editingKelas ? (
                <>
                  <Pencil className="w-4 h-4 text-indigo-600" /> Edit Rombel Kelas: {editingKelas.nama_kelas}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-indigo-600" /> Tambah Rombel Kelas Baru
                </>
              )}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* Segmented Jenjang Selector */}
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px] tracking-wider font-mono">Jenjang Kurikulum</label>
                <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenjang('SD');
                      if (editingKelas) {
                        setEditingKelas(prev => prev ? ({ ...prev, tingkat: 'I' }) : null);
                      } else {
                        setNewKelas(prev => ({ ...prev, tingkat: 'I' }));
                      }
                    }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition duration-150 cursor-pointer select-none ${selectedJenjang === 'SD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200/60'}`}
                  >
                    SD / MI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenjang('SMP');
                      if (editingKelas) {
                        setEditingKelas(prev => prev ? ({ ...prev, tingkat: 'VII' }) : null);
                      } else {
                        setNewKelas(prev => ({ ...prev, tingkat: 'VII' }));
                      }
                    }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition duration-150 cursor-pointer select-none ${selectedJenjang === 'SMP' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200/60'}`}
                  >
                    SMP / MTs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJenjang('SMA');
                      if (editingKelas) {
                        setEditingKelas(prev => prev ? ({ ...prev, tingkat: 'X' }) : null);
                      } else {
                        setNewKelas(prev => ({ ...prev, tingkat: 'X' }));
                      }
                    }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition duration-150 cursor-pointer select-none ${selectedJenjang === 'SMA' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200/60'}`}
                  >
                    SMA / SMK / MA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nama Kelas</label>
                  <input 
                    type="text" 
                    value={editingKelas ? editingKelas.nama_kelas : (newKelas.nama_kelas || '')}
                    onChange={(e) => {
                      if (editingKelas) {
                        setEditingKelas({ ...editingKelas, nama_kelas: e.target.value });
                      } else {
                        setNewKelas({ ...newKelas, nama_kelas: e.target.value });
                      }
                    }}
                    placeholder="contoh: VII A"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tingkat Kurikulum</label>
                  {(() => {
                    const currentTingkat = editingKelas 
                      ? editingKelas.tingkat 
                      : (newKelas.tingkat || (selectedJenjang === 'SD' ? 'I' : selectedJenjang === 'SMA' ? 'X' : 'VII'));
                    
                    const tingkatOptions = selectedJenjang === 'SD' 
                      ? [
                          { value: 'I', label: 'I', desc: 'Satu' },
                          { value: 'II', label: 'II', desc: 'Dua' },
                          { value: 'III', label: 'III', desc: 'Tiga' },
                          { value: 'IV', label: 'IV', desc: 'Empat' },
                          { value: 'V', label: 'V', desc: 'Lima' },
                          { value: 'VI', label: 'VI', desc: 'Enam' }
                        ]
                      : selectedJenjang === 'SMP'
                      ? [
                          { value: 'VII', label: 'VII', desc: 'Satu' },
                          { value: 'VIII', label: 'VIII', desc: 'Dua' },
                          { value: 'IX', label: 'IX', desc: 'Tiga' }
                        ]
                      : [
                          { value: 'X', label: 'X', desc: 'Sepuluh' },
                          { value: 'XI', label: 'XI', desc: 'Sebelas' },
                          { value: 'XII', label: 'XII', desc: 'Duabelas' }
                        ];

                    return (
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/50">
                        {tingkatOptions.map((opt) => {
                          const isSelected = currentTingkat === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                if (editingKelas) {
                                  setEditingKelas({ ...editingKelas, tingkat: opt.value });
                                } else {
                                  setNewKelas({ ...newKelas, tingkat: opt.value });
                                }
                              }}
                              className={`py-1 px-0.5 text-center rounded-md transition-all duration-150 cursor-pointer select-none flex flex-col items-center justify-center border ${
                                isSelected 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                            >
                              <span className={`text-[10px] font-extrabold leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {opt.label}
                              </span>
                              <span className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 leading-none ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {opt.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Wali Kelas Lengkap</label>
                <input 
                  type="text" 
                  value={editingKelas ? (editingKelas.wali_kelas || '') : (newKelas.wali_kelas || '')}
                  onChange={(e) => {
                    if (editingKelas) {
                      setEditingKelas({ ...editingKelas, wali_kelas: e.target.value });
                    } else {
                      setNewKelas({ ...newKelas, wali_kelas: e.target.value });
                    }
                  }}
                  placeholder="contoh: Ahmad Subarjo, S.Pd."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>

              <div className="flex gap-2">
                {editingKelas && (
                  <button 
                    type="button" 
                    onClick={() => setEditingKelas(null)}
                    className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer text-center"
                  >
                    Batal
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer text-center ${editingKelas ? 'w-2/3' : 'w-full'}`}
                >
                  {editingKelas ? 'Simpan Perubahan' : 'Daftarkan Rombel Kelas'}
                </button>
              </div>
            </form>
          </div>

          {/* CLASS TABLES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-800 text-sm">Daftar Rombongan Belajar (Rombel)</h3>
            
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                    <th className="py-2.5 px-3">Nama Kelas</th>
                    <th className="py-2.5 px-3">Tingkat</th>
                    <th className="py-2.5 px-3">Wali Kelas</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kelas.map((c) => {
                    const existingPref = preferensiKelas.find(cp => cp.kelas_id === c.id);
                    const hasPrefSet = existingPref && (
                      (existingPref.slot_tidak_bersedia && existingPref.slot_tidak_bersedia.length > 0) || 
                      (existingPref.max_jam_per_hari !== undefined && existingPref.max_jam_per_hari < 8)
                    );

                    return (
                      <tr key={c.id} className={`hover:bg-slate-50/55 ${editingKelas?.id === c.id ? 'bg-amber-50/30' : ''}`}>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{c.nama_kelas}</span>
                            {hasPrefSet && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 rounded px-1 py-0.5 mt-0.5 w-max font-semibold font-mono">
                                Preferensi Aktif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-indigo-700 font-mono font-bold">Tingkat {c.tingkat}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{c.wali_kelas || 'Belum diisi'}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => openPreferencesModal(c.id)}
                              title="Atur Preferensi (Batas Jam & Slot Libur Kelas)"
                              className={`p-1.5 rounded border transition cursor-pointer ${hasPrefSet ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-100'}`}
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => setEditingKelas(c)}
                              title="Edit Nama Kelas"
                              className={`p-1.5 rounded border transition cursor-pointer ${editingKelas?.id === c.id ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100'}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => handleDeleteKelas(c.id)}
                              title="Hapus Kelas"
                              className="text-rose-600 border border-transparent hover:border-rose-200 hover:bg-rose-50 p-1.5 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-medium transition-all"
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
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
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
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
                          className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
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

      {/* --- CLASS PREFERENCES MODAL --- */}
      {preferensiModalKelasId && modalKelasObj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-slide-up">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Konstruksi Aturan Preferensi Kelas</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Mengatur batasan operasional belajar untuk kelas: <strong className="text-indigo-600">{modalKelasObj.nama_kelas}</strong>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setPreferensiModalKelasId(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs flex-1">
              
              {/* MAX STUDY HOURS LIMIT */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Batas Maksimal Jam Pelajaran Per Hari
                </span>
                <span className="text-slate-500 text-[11px] font-medium block">
                  Tentukan sampai jam berapa maksimal kelas ini diperbolehkan melangsungkan kegiatan belajar mengajar per harinya.
                </span>

                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {periodsList.map((num) => {
                    const isSelected = prefMaxHours === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPrefMaxHours(num)}
                        className={`py-2 px-1 rounded-lg border text-center font-mono font-bold transition cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        Jam Ke-{num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC SLOTS BLOCK GRID */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <span className="font-bold text-rose-700 block uppercase tracking-tight font-mono text-[10px] border-b border-slate-200 pb-1">
                    Halangan Khusus (Slot Jam &amp; Hari Spesifik)
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium block mt-1">
                    Pilih kotak di bawah untuk memblokir slot hari dan jam pelajaran tertentu agar kelas tidak mendapatkan jadwal di slot tersebut (misal: kelas diliburkan hari Jumat di Jam Ke-4 dan Ke-5).
                  </span>
                </div>
                
                <div className="overflow-x-auto border border-slate-150 rounded-lg bg-white">
                  <table className="w-full border-collapse bg-white text-center text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-2.5 text-left font-bold text-slate-500 whitespace-nowrap">Hari \ Jam</th>
                        {periodsList.map((s) => (
                          <th key={s} className="p-2 font-mono font-bold text-slate-500">
                            Ke-{s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hariAktif.map((d) => (
                        <tr key={d} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-left font-semibold text-slate-700 whitespace-nowrap bg-slate-50/30">
                            {d}
                          </td>
                          {periodsList.map((s) => {
                            const isSlotBlocked = prefSpecificSlotsBlocked.some(x => x.hari === d && x.jam_ke === s);
                            return (
                              <td key={s} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSpecificSlotBlocked(d as Hari, s)}
                                  className={`w-8 h-8 rounded flex items-center justify-center transition border font-bold cursor-pointer mx-auto ${
                                    isSlotBlocked 
                                      ? 'bg-rose-100 border-rose-300 text-rose-600 hover:bg-rose-200' 
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                                  title={`${d} Jam Ke-${s}: ${isSlotBlocked ? 'Berhalangan/Blocked' : 'Tersedia/Active'}`}
                                >
                                  {isSlotBlocked ? (
                                    <X className="w-3.5 h-3.5 stroke-[3px]" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 flex justify-between bg-slate-50/40 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={handleResetPreferences}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold border border-slate-200 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Reset Semua Preferensi
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreferensiModalKelasId(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-100 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

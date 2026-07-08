'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertTriangle, Check, RefreshCw, Cloud, AlertCircle } from 'lucide-react';
import { Hari, JamPelajaran } from '../lib/types';
import { LocalDB } from '../lib/db';
import { isSupabaseModeActive } from '../lib/supabaseClient';
import { SupabaseSyncService } from '../lib/supabaseSync';

interface PengaturanWaktuTabProps {
  hariAktif: Hari[];
  jamPelajaran: JamPelajaran[];
  batasJamHari: Record<Hari, number>;
  onUpdateHariAktif: (hari: Hari[]) => void;
  onUpdateJamPelajaran: (jam: JamPelajaran[]) => void;
  onUpdateBatasJamHari: (batas: Record<Hari, number>) => void;
  loadDatabase: (skipCloudSync?: boolean) => void;
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
  onPushAllToCloud?: () => Promise<void>;
}

const SEMUA_HARI: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function PengaturanWaktuTab({
  hariAktif,
  jamPelajaran,
  batasJamHari,
  onUpdateHariAktif,
  onUpdateJamPelajaran,
  onUpdateBatasJamHari,
  loadDatabase,
  setLogMessages,
  onPushAllToCloud,
}: PengaturanWaktuTabProps) {
  // Periods form states
  const [newJamKe, setNewJamKe] = useState<number>(jamPelajaran.length + 1);
  const [newJamMulai, setNewJamMulai] = useState<string>('07:30');
  const [newJamSelesai, setNewJamSelesai] = useState<string>('08:15');

  // Preset generator states
  const [genJamMulai, setGenJamMulai] = useState<string>('07:30');
  const [genJumlahJp, setGenJumlahJp] = useState<number>(8);
  const [genDurasiJp, setGenDurasiJp] = useState<number>(40);
  const [genBreak1After, setGenBreak1After] = useState<number>(4); // 0 means none
  const [genBreak1Duration, setGenBreak1Duration] = useState<number>(15);
  const [genBreak2After, setGenBreak2After] = useState<number>(0); // 0 means none
  const [genBreak2Duration, setGenBreak2Duration] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showConfirmPresetModal, setShowConfirmPresetModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const addMinutesToTime = (timeStr: string, mins: number): string => {
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    m += mins;
    while (m >= 60) {
      m -= 60;
      h += 1;
    }
    while (h >= 24) {
      h -= 24;
    }
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleFormSubmitPreset = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(genJamMulai)) {
      alert('Format Jam Mulai tidak valid. Gunakan format HH:MM (contoh: 07:30).');
      return;
    }

    setShowConfirmPresetModal(true);
  };

  const executeGeneratePreset = async () => {
    setShowConfirmPresetModal(false);
    setIsGenerating(true);
    
    try {
      const generated: JamPelajaran[] = [];
      let currentStart = genJamMulai;

      for (let i = 1; i <= genJumlahJp; i++) {
        const currentEnd = addMinutesToTime(currentStart, genDurasiJp);
        
        generated.push({
          id: `period-preset-${i}-${Date.now()}`,
          jam_ke: i,
          jam_mulai: currentStart,
          jam_selesai: currentEnd
        });

        let nextStart = currentEnd;

        // Apply breaks
        if (genBreak1After > 0 && i === genBreak1After) {
          nextStart = addMinutesToTime(currentEnd, genBreak1Duration);
        } else if (genBreak2After > 0 && i === genBreak2After) {
          nextStart = addMinutesToTime(currentEnd, genBreak2Duration);
        }

        currentStart = nextStart;
      }

      // Save to local storage
      LocalDB.saveJamPelajaran(generated);
      onUpdateJamPelajaran(generated);

      // REAL-TIME DIRECT SUPABASE SYNC
      if (isSupabaseModeActive()) {
        try {
          // Delete old periods
          for (const p of jamPelajaran) {
            await SupabaseSyncService.syncPeriod(p, 'delete');
          }
          // Insert new periods
          for (const p of generated) {
            await SupabaseSyncService.syncPeriod(p, 'upsert');
          }
          setLogMessages(prev => [`☁️ [Real-time] Berhasil sinkronisasi ${generated.length} jam pelajaran preset ke cloud!`, ...prev]);
        } catch (err: any) {
          console.error("Gagal sinkronisasi preset ke cloud:", err);
          alert('Berhasil menyimpan lokal, namun gagal menyelaraskan ke Cloud Supabase.');
        }
      }

      loadDatabase(true);
      setNewJamKe(generated.length + 1);

      setLogMessages(prev => [
        `⏰ Berhasil membuat preset ${generated.length} Jam Pelajaran secara otomatis! (Mulai: ${genJamMulai}, Durasi: ${genDurasiJp} menit/JP)`,
        ...prev
      ]);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat membuat preset.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [editPeriodId, setEditPeriodId] = useState<string | null>(null);
  const [editJamMulai, setEditJamMulai] = useState<string>('');
  const [editJamSelesai, setEditJamSelesai] = useState<string>('');

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingToggleDay, setPendingToggleDay] = useState<Hari | null>(null);

  const handleToggleDay = (day: Hari, force = false) => {
    let updated: Hari[];
    if (hariAktif.includes(day)) {
      if (hariAktif.length <= 1) {
        alert('Minimal harus ada 1 hari aktif dalam seminggu.');
        return;
      }
      
      // Check if there are schedules on this day
      const schedules = LocalDB.getJadwal();
      const hasSchedules = schedules.some(s => s.hari === day);
      if (hasSchedules && !force) {
        setPendingToggleDay(day);
        return;
      }
      
      updated = hariAktif.filter(d => d !== day);
    } else {
      // Keep natural order when adding days
      updated = SEMUA_HARI.filter(d => d === day || hariAktif.includes(d));
    }
    
    onUpdateHariAktif(updated);
    LocalDB.saveHariAktif(updated);
    loadDatabase();
    setPendingToggleDay(null);
    setLogMessages(prev => [
      `📅 Konfigurasi Hari Aktif diperbarui: [${updated.join(', ')}]`,
      ...prev
    ]);
  };

  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (jamPelajaran.some(p => p.jam_ke === newJamKe)) {
      alert(`Jam ke-${newJamKe} sudah ada. Silakan gunakan nomor jam pelajaran yang lain.`);
      return;
    }

    const newPeriod: JamPelajaran = {
      id: `period-${Date.now()}`,
      jam_ke: newJamKe,
      jam_mulai: newJamMulai,
      jam_selesai: newJamSelesai,
    };

    const updated = [...jamPelajaran, newPeriod].sort((a, b) => a.jam_ke - b.jam_ke);
    onUpdateJamPelajaran(updated);
    LocalDB.saveJamPelajaran(updated);

    // REAL-TIME DIRECT SUPABASE SYNC
    if (isSupabaseModeActive()) {
      try {
        await SupabaseSyncService.syncPeriod(newPeriod, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Berhasil menambahkan Jam Pelajaran Ke-${newJamKe} langsung ke cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi jam pelajaran baru:", err);
      }
    }

    loadDatabase(true);

    // Setup defaults for next entry
    setNewJamKe(updated.length + 1);
    setLogMessages(prev => [
      `⏰ Menambahkan Jam Pelajaran Baru: Jam Ke-${newJamKe} (${newJamMulai} - ${newJamSelesai})`,
      ...prev
    ]);
  };

  const handleDeletePeriod = (id: string, jamKe: number) => {
    // Set pending delete state to trigger in-UI inline confirmation
    setPendingDeleteId(id);
  };

  const confirmDeletePeriod = async (id: string, jamKe: number) => {
    const target = jamPelajaran.find(p => p.id === id);
    const updated = jamPelajaran.filter(p => p.id !== id);
    onUpdateJamPelajaran(updated);
    LocalDB.saveJamPelajaran(updated);

    // REAL-TIME DIRECT SUPABASE SYNC
    if (isSupabaseModeActive() && target) {
      try {
        await SupabaseSyncService.syncPeriod(target, 'delete');
        setLogMessages(prev => [`☁️ [Real-time] Berhasil menghapus Jam Pelajaran Ke-${jamKe} langsung dari cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi hapus jam pelajaran:", err);
      }
    }

    loadDatabase(true);
    setPendingDeleteId(null);
    
    setLogMessages(prev => [
      `🗑️ Menghapus Jam Pelajaran Ke-${jamKe}`,
      ...prev
    ]);
  };

  const startEditPeriod = (p: JamPelajaran) => {
    setEditPeriodId(p.id);
    setEditJamMulai(p.jam_mulai);
    setEditJamSelesai(p.jam_selesai);
  };

  const handleSaveEditPeriod = async (id: string) => {
    let editedPeriod: JamPelajaran | null = null;
    const updated = jamPelajaran.map(p => {
      if (p.id === id) {
        editedPeriod = {
          ...p,
          jam_mulai: editJamMulai,
          jam_selesai: editJamSelesai
        };
        return editedPeriod;
      }
      return p;
    });

    onUpdateJamPelajaran(updated);
    LocalDB.saveJamPelajaran(updated);

    // REAL-TIME DIRECT SUPABASE SYNC
    if (isSupabaseModeActive() && editedPeriod) {
      try {
        await SupabaseSyncService.syncPeriod(editedPeriod, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Berhasil memperbarui Jam Pelajaran Ke-${(editedPeriod as JamPelajaran).jam_ke} langsung di cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi edit jam pelajaran:", err);
      }
    }

    loadDatabase(true);
    setEditPeriodId(null);
    setLogMessages(prev => [
      `📝 Jam Pelajaran diperbarui.`,
      ...prev
    ]);
  };

  // Preset quick configurations
  const applyPreset6Days = () => {
    const days: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    onUpdateHariAktif(days);
    LocalDB.saveHariAktif(days);
    loadDatabase();
    setLogMessages(prev => [`📅 Menerapkan preset: 6 Hari Kerja (Senin - Sabtu).`, ...prev]);
  };

  const applyPreset5Days = () => {
    const days: Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    onUpdateHariAktif(days);
    LocalDB.saveHariAktif(days);
    loadDatabase();
    setLogMessages(prev => [`📅 Menerapkan preset: 5 Hari Kerja (Senin - Jumat).`, ...prev]);
  };

  const applyPresetPesantren = () => {
    const days: Hari[] = ['Sabtu', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis'];
    onUpdateHariAktif(days);
    LocalDB.saveHariAktif(days);
    loadDatabase();
    setLogMessages(prev => [`📅 Menerapkan preset pesantren: Sabtu - Kamis (Jumat Libur).`, ...prev]);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Pengaturan Kalender &amp; Waktu Sekolah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasikan hari aktif mingguan serta struktur jam pelajaran harian yang digunakan oleh sekolah secara dinamis.
          </p>
        </div>

        {isSupabaseModeActive() && onPushAllToCloud && (
          <button
            type="button"
            id="save-to-cloud-button"
            onClick={async () => {
              try {
                await onPushAllToCloud();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer select-none shrink-0"
          >
            <Cloud className="w-4 h-4 animate-pulse" />
            <span>Simpan ke Cloud</span>
          </button>
        )}
      </div>

      {isSupabaseModeActive() && onPushAllToCloud && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-950">Penyimpanan Terintegrasi Cloud Aktif</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Perubahan Anda otomatis disimpan sementara di browser ini. Agar perubahan pada kalender, hari kerja, dan jam pelajaran sekolah tersimpan secara permanen di database cloud Anda, klik tombol <span className="font-bold">Simpan ke Cloud</span> di kanan atas.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: HARI AKTIF */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Hari Sekolah Aktif</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan hari-hari dalam seminggu di mana kegiatan belajar mengajar berlangsung. Penjadwal otomatis hanya akan menempatkan slot pelajaran pada hari yang terpilih.
            </p>

            {pendingToggleDay && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2.5 animate-fade-in text-left">
                <p className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Konfirmasi Menonaktifkan Hari {pendingToggleDay}
                </p>
                <p className="text-[10px] text-rose-700 leading-normal">
                  Terdapat jadwal pelajaran aktif pada hari <b>{pendingToggleDay}</b>. Jika dinonaktifkan, jadwal terkait mungkin tidak akan ditampilkan di grid. Apakah Anda yakin?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(pendingToggleDay, true)}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition text-center cursor-pointer shadow-xs"
                  >
                    Ya, Nonaktifkan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingToggleDay(null)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[10px] rounded-lg transition text-center cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Checkbox selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SEMUA_HARI.map((day) => {
                const isActive = hariAktif.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold ring-1 ring-indigo-100'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{day}</span>
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* QUICK PRESETS */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Preset Cepat Hari Sekolah</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={applyPreset6Days}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
                >
                  🏫 Regular: 6 Hari Kerja <span className="text-slate-400 font-normal">(Senin - Sabtu)</span>
                </button>
                <button
                  type="button"
                  onClick={applyPreset5Days}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
                >
                  🏢 Full Day: 5 Hari Kerja <span className="text-slate-400 font-normal">(Senin - Jumat)</span>
                </button>
                <button
                  type="button"
                  onClick={applyPresetPesantren}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
                >
                  🕌 Pesantren: Sabtu - Kamis <span className="text-slate-400 font-normal">(Jumat Libur)</span>
                </button>
              </div>
            </div>
          </div>

          {/* BATAS JAM MAKSIMAL PER HARI */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Batas Jam Maksimal per Hari</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan batas jam pelajaran maksimal untuk masing-masing hari aktif (misal: hari Jumat hanya sampai jam ke-6).
            </p>
            <div className="space-y-3">
              {hariAktif.map((day) => {
                const currentLimit = batasJamHari[day] ?? jamPelajaran.length;
                return (
                  <div key={day} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-700">{day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Maks:</span>
                      <select
                        value={currentLimit}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const updated = { ...batasJamHari, [day]: val };
                          onUpdateBatasJamHari(updated);
                          setLogMessages(prev => [
                            `⏰ Batas jam maksimal hari ${day} diperbarui menjadi Jam Ke-${val}`,
                            ...prev
                          ]);
                        }}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {jamPelajaran.map((p) => (
                          <option key={p.jam_ke} value={p.jam_ke}>
                            Jam Ke-{p.jam_ke} ({p.jam_mulai})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: JAM PELAJARAN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PEMBUAT PRESET JAM PELAJARAN OTOMATIS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Pembuat Jam Pelajaran Otomatis</h3>
              </div>
              <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sangat Cepat
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Buat seluruh deretan jam pelajaran secara instan. Cukup tentukan jam mulai KBM, jumlah JP sehari, durasi, serta waktu istirahat jika ada.
            </p>

            <form onSubmit={handleFormSubmitPreset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Jam Mulai KBM</label>
                  <input
                    type="text"
                    placeholder="07:30"
                    value={genJamMulai}
                    onChange={(e) => setGenJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Jumlah JP Sehari</label>
                  <select
                    value={genJumlahJp}
                    onChange={(e) => setGenJumlahJp(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono cursor-pointer"
                  >
                    {[...Array(15)].map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>{idx + 1} JP</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Durasi per JP (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={genDurasiJp}
                    onChange={(e) => setGenDurasiJp(parseInt(e.target.value) || 40)}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Istirahat Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide font-mono">Istirahat 1</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-medium mb-1">Setelah JP Ke-</label>
                      <select
                        value={genBreak1After}
                        onChange={(e) => setGenBreak1After(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 font-mono cursor-pointer"
                      >
                        <option value="0">Tidak Ada</option>
                        {[...Array(12)].map((_, idx) => (
                          <option key={idx + 1} value={idx + 1}>JP {idx + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-medium mb-1">Durasi (Menit)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        disabled={genBreak1After === 0}
                        value={genBreak1Duration}
                        onChange={(e) => setGenBreak1Duration(parseInt(e.target.value) || 15)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 font-mono disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide font-mono">Istirahat 2 (Opsional)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-medium mb-1">Setelah JP Ke-</label>
                      <select
                        value={genBreak2After}
                        onChange={(e) => setGenBreak2After(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 font-mono cursor-pointer"
                      >
                        <option value="0">Tidak Ada</option>
                        {[...Array(12)].map((_, idx) => (
                          <option key={idx + 1} value={idx + 1}>JP {idx + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-medium mb-1">Durasi (Menit)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        disabled={genBreak2After === 0}
                        value={genBreak2Duration}
                        onChange={(e) => setGenBreak2Duration(parseInt(e.target.value) || 15)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 font-mono disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-[10px] text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 flex items-center gap-1">
                  ⚠️ Tindakan ini akan mengganti seluruh Jam Pelajaran saat ini.
                </span>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Memproses...' : 'Generate Preset Jam'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Daftar Jam Pelajaran</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Kelola nomor urutan jam pelajaran beserta rentang waktu aslinya. Anda bisa menambahkan atau menghapus jam pelajaran agar selaras dengan jadwal harian sekolah Anda.
            </p>

            {/* Form to add period */}
            <form onSubmit={handleAddPeriod} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">Jam Ke-</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={newJamKe}
                  onChange={(e) => setNewJamKe(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">Mulai</label>
                <input
                  type="text"
                  placeholder="07:30"
                  value={newJamMulai}
                  onChange={(e) => setNewJamMulai(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tight">Selesai</label>
                <input
                  type="text"
                  placeholder="08:15"
                  value={newJamSelesai}
                  onChange={(e) => setNewJamSelesai(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </form>

            {/* List of Periods */}
            <div className="border border-slate-150 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-mono text-slate-500 uppercase font-bold">
                    <th className="p-3">Urutan</th>
                    <th className="p-3">Jam Mulai</th>
                    <th className="p-3">Jam Selesai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {jamPelajaran.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                        Belum ada jam pelajaran yang dikonfigurasi.
                      </td>
                    </tr>
                  ) : (
                    jamPelajaran.map((p) => {
                      const isEditing = editPeriodId === p.id;
                      const isPendingDelete = pendingDeleteId === p.id;
                      const schedules = LocalDB.getJadwal();
                      const hasSchedules = schedules.some(s => s.jam_ke === p.jam_ke);

                      if (isPendingDelete) {
                        return (
                          <tr key={p.id} className="bg-rose-50 hover:bg-rose-100/60 transition-colors">
                            <td className="p-3 font-bold text-rose-900">
                              Jam Ke-{p.jam_ke}
                            </td>
                            <td colSpan={3} className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2 text-xs">
                                <span className="text-rose-700 font-medium text-[11px] flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  {hasSchedules ? 'Ada jadwal aktif! Tetap hapus?' : 'Yakin ingin menghapus?'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => confirmDeletePeriod(p.id, p.jam_ke)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[10px] transition cursor-pointer shadow-xs"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(null)}
                                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-md text-[10px] transition cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/40">
                          <td className="p-3 font-bold text-slate-800">
                            Jam Ke-{p.jam_ke}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editJamMulai}
                                onChange={(e) => setEditJamMulai(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs font-mono w-20 focus:outline-indigo-500 font-bold"
                              />
                            ) : (
                              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {p.jam_mulai}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editJamSelesai}
                                onChange={(e) => setEditJamSelesai(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs font-mono w-20 focus:outline-indigo-500 font-bold"
                              />
                            ) : (
                              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {p.jam_selesai}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditPeriod(p.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition cursor-pointer"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditPeriodId(null)}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-semibold transition cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditPeriod(p)}
                                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePeriod(p.id, p.jam_ke)}
                                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                    title="Hapus Jam Pelajaran"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN CONFIRMATION MODAL FOR PRESET */}
      {showConfirmPresetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Header / Accent Bar */}
            <div className="h-1.5 bg-indigo-600 w-full" />
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl shrink-0">
                  <Clock className="w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Konfirmasi Pembuatan Preset
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tindakan otomatisasi struktur waktu
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 p-4 rounded-xl space-y-2.5">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {jamPelajaran.length > 0 ? (
                    <span>
                      Tindakan ini akan <b className="text-rose-600 font-bold font-sans">menghapus {jamPelajaran.length} jam pelajaran lama</b> yang ada saat ini dan menggantinya dengan preset baru secara otomatis.
                    </span>
                  ) : (
                    <span>Apakah Anda yakin ingin membuat preset jam pelajaran baru secara otomatis?</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Struktur jam pelajaran yang baru akan langsung diterapkan di seluruh sistem penjadwalan. Anda dapat mengubah urutan atau durasinya secara manual nanti.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  id="confirm-preset-cancel"
                  onClick={() => setShowConfirmPresetModal(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="confirm-preset-execute"
                  onClick={executeGeneratePreset}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center select-none"
                >
                  Ya, Terapkan Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Calendar, AlertTriangle, CheckCircle2, ChevronRight, Edit2, Check, X, Database } from 'lucide-react';
import { Jadwal, ScheduleVersion, KonflikJadwal } from '../lib/types';
import { LocalDB } from '../lib/db';
import { isSupabaseModeActive } from '../lib/supabaseClient';
import { SupabaseSyncService } from '../lib/supabaseSync';

interface VersionsTabProps {
  jadwal: Jadwal[];
  conflicts: KonflikJadwal[];
  stats: {
    executionTimeMs: number;
    score: number;
    totalLessonsNeeded?: number;
    totalLessonsPlotted?: number;
    totalConflicts?: number;
  };
  onLoadVersion: (version: ScheduleVersion) => void;
  onRefresh: () => void;
  addLogMessage: (msg: string) => void;
  currentUser?: any;
}

export default function VersionsTab({
  jadwal,
  conflicts,
  stats,
  onLoadVersion,
  onRefresh,
  addLogMessage,
  currentUser
}: VersionsTabProps) {
  const isPro = LocalDB.getCurrentUser()?.is_pro || currentUser?.is_pro || false;

  const [versions, setVersions] = useState<ScheduleVersion[]>(() => {
    if (typeof window === 'undefined') return [];
    return LocalDB.getScheduleVersions();
  });

  const [versionName, setVersionName] = useState<string>('');
  const [versionDesc, setVersionDesc] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
      alert('Fitur Penyimpanan Multi-Versi hanya tersedia untuk Akun PRO.');
      return;
    }

    if (jadwal.length === 0) {
      alert('Tidak ada jadwal aktif yang bisa disimpan. Silakan generate jadwal terlebih dahulu.');
      return;
    }

    const trimmedName = versionName.trim();
    if (!trimmedName) {
      alert('Nama versi tidak boleh kosong.');
      return;
    }

    const newVersion: ScheduleVersion = {
      id: `ver-${Date.now()}`,
      name: trimmedName,
      description: versionDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
      schedules: [...jadwal],
      stats: {
        score: stats.score,
        totalLessonsPlotted: jadwal.length,
        totalLessonsNeeded: stats.totalLessonsNeeded || jadwal.length,
        totalConflicts: conflicts.length,
        executionTimeMs: stats.executionTimeMs
      }
    };

    const updated = [newVersion, ...versions];
    LocalDB.saveScheduleVersions(updated);
    setVersions(updated);
    
    addLogMessage(`💾 Berhasil menyimpan Versi Jadwal baru: "${trimmedName}" (${jadwal.length} slot, ${conflicts.length} konflik)`);
    
    if (isSupabaseModeActive()) {
      setIsSyncing(true);
      try {
        await SupabaseSyncService.syncVersion(newVersion, 'upsert');
        addLogMessage(`☁️ Berhasil mensinkronisasikan versi "${trimmedName}" ke Cloud.`);
      } catch (err: any) {
        addLogMessage(`⚠️ Gagal menyimpan draf ke Cloud: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }

    setVersionName('');
    setVersionDesc('');
  };

  const handleLoadVersion = async (v: ScheduleVersion) => {
    if (!isPro) {
      alert('Fitur memuat versi jadwal hanya tersedia untuk Akun PRO.');
      return;
    }

    const confirmMsg = `Apakah Anda yakin ingin memuat "${v.name}"?\nJadwal aktif saat ini akan digantikan oleh versi ini.`;
    if (!confirm(confirmMsg)) {
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Save to LocalDB
      LocalDB.saveJadwal(v.schedules);
      
      // 2. Sync to Supabase if Supabase is active
      if (isSupabaseModeActive()) {
        addLogMessage(`☁️ Menyelaraskan Versi Jadwal "${v.name}" ke Cloud...`);
        const recalculatedConflicts = LocalDB.getConflicts();
        const res = await SupabaseSyncService.pushSchedulesOnly(v.schedules, recalculatedConflicts);
        if (res.success) {
          addLogMessage(`✅ Berhasil sinkronisasi "${v.name}" ke Cloud!`);
        } else {
          addLogMessage(`⚠️ Gagal sinkronisasi ke Cloud: ${res.message}`);
          alert(`Berhasil memuat jadwal secara lokal, namun gagal menyelaraskan ke Cloud: ${res.message}`);
        }
      }

      // 3. Trigger callback to parent state
      onLoadVersion(v);
      
      addLogMessage(`🔄 Berhasil memuat Versi Jadwal: "${v.name}"`);
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat memuat versi jadwal.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteVersion = async (id: string, name: string) => {
    if (!isPro) {
      alert('Fitur menghapus versi jadwal hanya tersedia untuk Akun PRO.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus Versi Jadwal "${name}" secara permanen?`)) {
      return;
    }

    const updated = versions.filter(v => v.id !== id);
    LocalDB.saveScheduleVersions(updated);
    setVersions(updated);
    addLogMessage(`🗑️ Berhasil menghapus Versi Jadwal: "${name}"`);

    if (isSupabaseModeActive()) {
      setIsSyncing(true);
      try {
        await SupabaseSyncService.syncVersion({ id } as any, 'delete');
        addLogMessage(`☁️ Berhasil menghapus draf "${name}" dari Cloud.`);
      } catch (err: any) {
        addLogMessage(`⚠️ Gagal menghapus draf dari Cloud: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleStartEdit = (v: ScheduleVersion) => {
    if (!isPro) return;
    setEditingId(v.id);
    setEditName(v.name);
    setEditDesc(v.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!isPro) return;
    const trimmedName = editName.trim();
    if (!trimmedName) {
      alert('Nama versi tidak boleh kosong.');
      return;
    }

    let updatedVersion: ScheduleVersion | null = null;
    const updated = versions.map(v => {
      if (v.id === id) {
        updatedVersion = {
          ...v,
          name: trimmedName,
          description: editDesc.trim() || undefined
        };
        return updatedVersion;
      }
      return v;
    });

    LocalDB.saveScheduleVersions(updated);
    setVersions(updated);
    setEditingId(null);
    addLogMessage(`✏️ Berhasil memperbarui informasi Versi Jadwal: "${trimmedName}"`);

    if (updatedVersion && isSupabaseModeActive()) {
      setIsSyncing(true);
      try {
        await SupabaseSyncService.syncVersion(updatedVersion, 'upsert');
        addLogMessage(`☁️ Berhasil mensinkronisasikan perubahan draf "${trimmedName}" ke Cloud.`);
      } catch (err: any) {
        addLogMessage(`⚠️ Gagal memperbarui draf di Cloud: ${err.message}`);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6" id="versions-tab">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans">Multi-Versi &amp; Penyimpanan Payload Jadwal</h2>
        <p className="text-xs text-slate-500 font-medium">
          Simpan hasil penyusunan jadwal aktif ke dalam berbagai versi payload. Anda dapat beralih versi (load) secara instan tanpa perlu memproses ulang algoritma generate dari awal.
        </p>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans relative ${!isPro ? 'min-h-[450px]' : ''}`}>
        {/* Lock Overlay */}
        {!isPro && (
          <div className="absolute inset-0 bg-slate-50/75 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-center p-6 z-20 border border-slate-200 shadow-lg max-w-md mx-auto my-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3 animate-bounce">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Penyimpanan Multi-Versi &amp; Cloud (Fitur PRO)</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
              Dapatkan kenyamanan lebih dengan kemampuan untuk menyimpan draf pengerjaan jadwal Anda ke dalam berbagai versi payload, serta menyinkronkan seluruh versi tersebut secara otomatis ke Cloud (Supabase).
            </p>
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 mt-4 space-y-1.5 text-left w-full max-w-xs">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider font-mono block">Benefit Akun PRO:</span>
              <ul className="text-[10px] text-slate-650 space-y-1 list-disc pl-4 font-semibold">
                <li>Simpan draf jadwal aktif sebanyak-banyaknya tanpa batas.</li>
                <li>Beralih versi draf secara instan hanya dengan sekali klik.</li>
                <li>Sinkronisasi Cloud otomatis: Simpan draf Anda dengan aman di database Supabase.</li>
                <li>Keamanan data terjamin meskipun Anda membersihkan cache browser.</li>
              </ul>
            </div>
            <p className="text-[9px] text-indigo-600 font-bold mt-4 uppercase tracking-wider font-mono">
              Silakan aktifkan Lisensi PRO Anda di menu Aktivasi Akun
            </p>
          </div>
        )}

        {/* LEFT COLUMN: SAVE CURRENT SCHEDULE */}
        <div className={`lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-5 ${!isPro ? 'opacity-25 pointer-events-none select-none blur-[2px]' : ''}`}>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Simpan Jadwal Aktif</h3>
          </div>

          {jadwal.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
              <span className="text-2xl block">⚠️</span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Belum ada jadwal yang di-generate atau aktif saat ini. Silakan masuk ke tab <b>Generator Otomatis</b> terlebih dahulu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveVersion} className="space-y-4">
              {/* CURRENT ACTIVE SCHEDULE STATS SUMMARY */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2.5">
                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Draf Jadwal yang Sedang Aktif:</span>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="space-y-0.5">
                    <span className="text-slate-450 text-[10px] block">Total Slot Diplot</span>
                    <span className="font-bold text-slate-800 font-mono">{jadwal.length} JP</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-450 text-[10px] block">Bentrokan</span>
                    <span className={`font-bold font-mono ${conflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {conflicts.length} Konflik
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-450 text-[10px] block">Skor Kepatuhan</span>
                    <span className="font-bold text-indigo-600 font-mono">{stats.score} Pts</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-450 text-[10px] block">Komputasi</span>
                    <span className="font-bold text-slate-800 font-mono">{stats.executionTimeMs} ms</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Nama Versi</label>
                <input
                  type="text"
                  placeholder="Contoh: Versi Semester Ganjil - Opsi A"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Keterangan / Deskripsi (Opsional)</label>
                <textarea
                  placeholder="Catatan tambahan mengenai versi jadwal ini..."
                  value={versionDesc}
                  onChange={(e) => setVersionDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                Simpan Versi Baru
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: LIST OF SAVED VERSIONS */}
        <div className={`lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-5 ${!isPro ? 'opacity-25 pointer-events-none select-none blur-[2px]' : ''}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Gudang Payload Versi Terdaftar ({versions.length})
            </h3>
            <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {LocalDB.getActiveUnit() || "Mode Mandiri"}
            </span>
          </div>

          {versions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm">Gudang Payload Kosong</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Belum ada versi jadwal yang disimpan di unit ini. Silakan simpan jadwal aktif Anda pada kolom di sebelah kiri.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {versions.map((v) => {
                const isEditing = editingId === v.id;

                return (
                  <div key={v.id} className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all space-y-3 bg-slate-50/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                            />
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Edit keterangan..."
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-600"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-bold text-slate-800 text-sm font-sans">{v.name}</h4>
                            {v.description && (
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{v.description}</p>
                            )}
                            <span className="block text-[10px] text-slate-400 font-mono">Dibuat: {formatDate(v.createdAt)}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(v.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-100 cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition border border-rose-100 cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition border border-slate-200 cursor-pointer"
                              title="Ubah Nama / Deskripsi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVersion(v.id, v.name)}
                              className="p-1.5 bg-rose-50/50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-100/50 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* STATS CHIPS FOR SAVED PAYLOAD */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-center space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Skor</span>
                        <span className="text-xs font-extrabold text-indigo-700 font-mono">{v.stats.score} Pts</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-center space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Terisi</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {v.stats.totalLessonsPlotted} / {v.stats.totalLessonsNeeded || v.stats.totalLessonsPlotted} JP
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-center space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Konflik</span>
                        <span className={`text-xs font-bold font-mono ${v.stats.totalConflicts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {v.stats.totalConflicts} Bentrok
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-center space-y-0.5 flex flex-col justify-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Durasi</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">{v.stats.executionTimeMs || 0} ms</span>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleLoadVersion(v)}
                          disabled={isSyncing}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none disabled:opacity-50"
                        >
                          Terapkan Versi Ini
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

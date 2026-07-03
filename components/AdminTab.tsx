'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Key, Plus, Copy, Check, Trash2, ToggleLeft, ToggleRight, TrendingUp, BarChart2, CheckCircle, Search, HelpCircle, Settings, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { LocalDB, SystemSettings } from '../lib/db';
import { getSupabaseClient, isSupabaseModeActive } from '../lib/supabaseClient';

interface AdminTabProps {
  currentUser: any;
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminTab({ currentUser, setLogMessages }: AdminTabProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [serialKeys, setSerialKeys] = useState<any[]>([]);
  const [genQuantity, setGenQuantity] = useState(3);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [keyFilter, setKeyFilter] = useState<'all' | 'available' | 'used'>('all');
  const [dbHasSerialKeysTable, setDbHasSerialKeysTable] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>(() => {
    return LocalDB.getSystemSettings();
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track if settings are currently being edited (dirty state)
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);
  const isSettingsDirtyRef = React.useRef(false);

  const setSettingsDirtyState = (dirty: boolean) => {
    setIsSettingsDirty(dirty);
    isSettingsDirtyRef.current = dirty;
  };

  // Load data from LocalDB or Supabase
  const loadAdminData = async (includeSettings = false) => {
    let supabaseProfilesLoaded = false;
    let supabaseKeysLoaded = false;

    if (isSupabaseModeActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Load settings only on explicit request (e.g., initial mount) to avoid overwriting typed input
        if (includeSettings && !isSettingsDirtyRef.current) {
          try {
            const { data: dbSettings, error: errS } = await supabase.from('system_settings').select('*');
            if (!errS && dbSettings && dbSettings.length > 0) {
              const parsed: any = {};
              dbSettings.forEach((row: any) => {
                parsed[row.key] = row.value;
              });
              const loadedSettings = {
                harga_pro: parsed.harga_pro !== undefined && !isNaN(Number(parsed.harga_pro)) ? Number(parsed.harga_pro) : 99000,
                harga_coret: parsed.harga_coret !== undefined && !isNaN(Number(parsed.harga_coret)) ? Number(parsed.harga_coret) : 199000,
                teks_diskon: parsed.teks_diskon || "Diskon 50% Terbatas!",
                pakasir_api_key: parsed.pakasir_api_key || "demo_api_key",
                pakasir_project: parsed.pakasir_project || "depodomain",
              };
              setSettings(loadedSettings);
              LocalDB.saveSystemSettings(loadedSettings);
            } else {
              // Fallback to LocalDB if table is empty
              setSettings(LocalDB.getSystemSettings());
            }
          } catch (errSettings) {
            console.warn("Gagal membaca system_settings di Supabase, fallback ke LocalDB:", errSettings);
            setSettings(LocalDB.getSystemSettings());
          }
        }

        try {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*');
          if (!error && profiles) {
            // Map Supabase profile data to user format expected by AdminTab
            const mapped = profiles.map((p: any) => ({
              username: p.id, // Supabase UUID
              email: p.email || '',
              nama_sekolah: p.nama_sekolah,
              is_pro: p.is_pro,
              serial_key: p.serial_key,
              activated_at: p.activated_at,
              role: p.role || 'user',
              isGoogle: true
            }));
            setUsers(mapped);
            supabaseProfilesLoaded = true;
          } else {
            console.error("Gagal load profile dari Supabase:", error);
          }
        } catch (err) {
          console.error("Gagal mengambil daftar pengguna dari Supabase:", err);
        }

        // Ambil daftar serial keys dari Supabase
        try {
          const { data: keys, error: keysError } = await supabase
            .from('serial_keys')
            .select('*');
          
          if (!keysError && keys) {
            setSerialKeys(keys);
            setDbHasSerialKeysTable(true);
            supabaseKeysLoaded = true;
          } else {
            console.warn("Table serial_keys tidak ditemukan atau error:", keysError);
            if (keysError?.code === 'PGRST116' || keysError?.message?.includes('does not exist')) {
              setDbHasSerialKeysTable(false);
            }
          }
        } catch (err) {
          console.error("Gagal mengambil daftar serial key dari Supabase:", err);
          setDbHasSerialKeysTable(false);
        }
      }
    } else {
      if (includeSettings && !isSettingsDirtyRef.current) {
        setSettings(LocalDB.getSystemSettings());
      }
    }

    if (!supabaseProfilesLoaded) {
      setUsers(LocalDB.getUsers());
    }
    if (!supabaseKeysLoaded) {
      setSerialKeys(LocalDB.getSerialKeys());
    }
  };

  useEffect(() => {
    // Jalankan asinkron untuk mencegah warning ESLint set-state-in-effect
    const timer = setTimeout(() => {
      loadAdminData(true);
    }, 0);

    // Auto-refresh data admin dari Supabase setiap 5 detik untuk multi-device real-time (tanpa system_settings)
    const interval = setInterval(() => {
      loadAdminData(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleGenerateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (genQuantity < 1 || genQuantity > 20) return;

    if (isSupabaseModeActive() && dbHasSerialKeysTable) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const generatedList: any[] = [];
          for (let i = 0; i < genQuantity; i++) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let part1 = '';
            let part2 = '';
            for (let j = 0; j < 4; j++) {
              part1 += chars.charAt(Math.floor(Math.random() * chars.length));
              part2 += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const newKey = `JADW-PRO-${part1}-${part2}`;
            generatedList.push({
              key: newKey,
              is_used: false,
              used_by: null,
              created_at: new Date().toISOString(),
              activated_at: null
            });
          }

          const { error } = await supabase
            .from('serial_keys')
            .insert(generatedList);

          if (!error) {
            setLogMessages(prev => [
              `Admin berhasil menghasilkan ${genQuantity} Kode Serial baru secara massal ke Supabase Cloud.`,
              ...prev
            ]);
            loadAdminData();
          } else {
            alert(`Gagal menyimpan serial key ke Supabase: ${error.message}`);
          }
        } catch (err: any) {
          alert(`Error saat generate serial key ke cloud: ${err.message}`);
        }
        return;
      }
    }

    // Fallback local
    const newKeys = LocalDB.generateSerialKeys(genQuantity);
    loadAdminData();
    setLogMessages(prev => [
      `Admin berhasil menghasilkan ${genQuantity} Kode Serial baru secara massal di penyimpanan lokal.`,
      ...prev
    ]);
  };

  const handleCopyKey = (key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleToggleUserPro = async (username: string, currentIsPro: boolean) => {
    if (isSupabaseModeActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const nextIsPro = !currentIsPro;
          
          let userSerialKey: string | null = null;
          const userObj = users.find(u => u.username === username);
          if (userObj) {
            userSerialKey = userObj.serial_key;
          }

          const { error } = await supabase
            .from('profiles')
            .update({
              is_pro: nextIsPro,
              serial_key: nextIsPro ? 'CLOUD-ACTIVATED' : null,
              activated_at: nextIsPro ? new Date().toISOString() : null
            })
            .eq('id', username);
          
          if (!error) {
            // Bebaskan key jika status diturunkan
            if (!nextIsPro && userSerialKey && dbHasSerialKeysTable) {
              await supabase
                .from('serial_keys')
                .update({
                  is_used: false,
                  used_by: null,
                  activated_at: null
                })
                .eq('key', userSerialKey);
            }

            setLogMessages(prev => [
              `Admin memperbarui status PRO akun di Supabase (ID: ${username}) menjadi ${nextIsPro ? 'PRO' : 'TRIAL'}.`,
              ...prev
            ]);
            loadAdminData();
          } else {
            alert(`Gagal memperbarui status di Supabase: ${error.message}`);
          }
        } catch (err: any) {
          alert(`Error: ${err.message}`);
        }
      }
    } else {
      const success = LocalDB.updateUserProStatus(username, !currentIsPro);
      if (success) {
        loadAdminData();
        setLogMessages(prev => [
          `Admin memperbarui status @${username} secara manual menjadi ${!currentIsPro ? 'PRO' : 'TRIAL'}.`,
          ...prev
        ]);
      }
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username.toLowerCase() === 'admin') {
      alert('Tidak dapat menghapus super-admin default.');
      return;
    }
    
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna? Semua data miliknya akan hilang.`);
    if (!confirmDelete) return;

    if (isSupabaseModeActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          let userSerialKey: string | null = null;
          const userObj = users.find(u => u.username === username);
          if (userObj) {
            userSerialKey = userObj.serial_key;
          }

          const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', username);
          
          if (!error) {
            // Bebaskan key jika dihapus
            if (userSerialKey && dbHasSerialKeysTable) {
              await supabase
                .from('serial_keys')
                .update({
                  is_used: false,
                  used_by: null,
                  activated_at: null
                })
                .eq('key', userSerialKey);
            }

            setLogMessages(prev => [
              `Admin menghapus data profil pengguna (ID: ${username}) dari database Supabase.`,
              ...prev
            ]);
            loadAdminData();
          } else {
            alert(`Gagal menghapus pengguna dari Supabase: ${error.message}`);
          }
        } catch (err: any) {
          alert(`Error: ${err.message}`);
        }
      }
    } else {
      const allUsers = LocalDB.getUsers();
      const filteredUsers = allUsers.filter(u => u.username.toLowerCase() !== username.toLowerCase());
      LocalDB.saveUsers(filteredUsers);
      
      // Also clean up any keys associated
      const userKeys = LocalDB.getSerialKeys();
      const updatedKeys = userKeys.map(k => {
        if (k.used_by?.toLowerCase() === username.toLowerCase()) {
          return { ...k, is_used: false, used_by: null, activated_at: null };
        }
        return k;
      });
      LocalDB.saveSerialKeys(updatedKeys);

      loadAdminData();
      setLogMessages(prev => [
        `Admin menghapus akun pengguna @${username} dari database platform.`,
        ...prev
      ]);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveError(null);
    setShowSaveAlert(false);
    try {
      LocalDB.saveSystemSettings(settings);
      
      if (isSupabaseModeActive()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const rows = [
            { key: 'harga_pro', value: String(settings.harga_pro) },
            { key: 'harga_coret', value: String(settings.harga_coret) },
            { key: 'teks_diskon', value: settings.teks_diskon },
            { key: 'pakasir_api_key', value: settings.pakasir_api_key },
            { key: 'pakasir_project', value: settings.pakasir_project },
          ];
          const { error } = await supabase.from('system_settings').upsert(rows);
          if (error) {
            throw error;
          }
        }
      }
      
      setLogMessages(prev => ["☁️ [Admin] Pengaturan harga platform & payment gateway berhasil disimpan!", ...prev]);
      setShowSaveAlert(true);
      setSettingsDirtyState(false);
      // Sembunyikan setelah 4 detik secara halus
      setTimeout(() => setShowSaveAlert(false), 4000);
    } catch (err: any) {
      console.error("Gagal menyimpan pengaturan:", err);
      setSaveError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSettings = () => {
    const confirmReset = window.confirm("Apakah Anda yakin ingin mengembalikan semua konfigurasi harga, diskon, dan API ke default bawaan?");
    if (!confirmReset) return;
    
    const defaults = {
      harga_pro: 99000,
      harga_coret: 199000,
      teks_diskon: "Diskon 50% Terbatas!",
      pakasir_api_key: "demo_api_key",
      pakasir_project: "depodomain"
    };
    setSettings(defaults);
    setSettingsDirtyState(true);
    setLogMessages(prev => ["[Admin] Berhasil memulihkan konfigurasi default.", ...prev]);
  };

  // Metrics calculations
  const totalUsersCount = users.length;
  const proUsersCount = users.filter(u => u.is_pro).length;
  const trialUsersCount = totalUsersCount - proUsersCount;

  const totalKeysCount = serialKeys.length;
  const usedKeysCount = serialKeys.filter(k => k.is_used).length;
  const availableKeysCount = totalKeysCount - usedKeysCount;

  // Filter keys
  const filteredKeys = serialKeys.filter(k => {
    if (keyFilter === 'available') return !k.is_used;
    if (keyFilter === 'used') return k.is_used;
    return true;
  }).reverse(); // Show newest first

  // Filter users by search term
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.nama_sekolah && u.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Header */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs">
          <span className="font-extrabold uppercase">Mode Konsol Administrator:</span> Anda sedang melihat data lisensi global dan manajemen user platform. Pastikan untuk menjaga kerahasiaan Kode Serial yang dihasilkan demi keadilan lisensi sekolah.
        </div>
      </div>

      {/* Supabase Serial Keys Table Setup Notice */}
      {isSupabaseModeActive() && !dbHasSerialKeysTable && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-rose-900 space-y-3">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold uppercase text-rose-700">Tabel Serial Keys Belum Aktif di Supabase Cloud:</span>
              <p>Untuk menyelaraskan Kode Serial secara real-time dan profesional di cloud, Anda harus membuat tabel <code>serial_keys</code> di Supabase SQL Editor Anda agar sinkronisasi multi-device berjalan sempurna.</p>
            </div>
          </div>
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto relative group max-h-40">
            {`CREATE TABLE IF NOT EXISTS public.serial_keys (
    key VARCHAR(50) PRIMARY KEY,
    is_used BOOLEAN DEFAULT false,
    used_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.serial_keys ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses
CREATE POLICY "Admin full access" ON public.serial_keys TO authenticated USING (
    (auth.jwt() ->> 'email') = 'balkhi05@gmail.com'
) WITH CHECK (
    (auth.jwt() ->> 'email') = 'balkhi05@gmail.com'
);

CREATE POLICY "Users read key" ON public.serial_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update key" ON public.serial_keys FOR UPDATE TO authenticated USING (NOT is_used OR used_by = auth.uid()::text) WITH CHECK (used_by = auth.uid()::text);`}
          </div>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined') {
                navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.serial_keys (
    key VARCHAR(50) PRIMARY KEY,
    is_used BOOLEAN DEFAULT false,
    used_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.serial_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON public.serial_keys TO authenticated USING (
    (auth.jwt() ->> 'email') = 'balkhi05@gmail.com'
) WITH CHECK (
    (auth.jwt() ->> 'email') = 'balkhi05@gmail.com'
);

CREATE POLICY "Users read key" ON public.serial_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update key" ON public.serial_keys FOR UPDATE TO authenticated USING (NOT is_used OR used_by = auth.uid()::text) WITH CHECK (used_by = auth.uid()::text);`);
                alert('SQL Schema berhasil disalin! Silakan tempel di SQL Editor Supabase Anda.');
              }
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
          >
            Salin Kode SQL Schema
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Total Akun Sekolah</div>
            <div className="text-xl font-black text-slate-900">{totalUsersCount}</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Semua registrasi terdaftar</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Pengguna PRO</div>
            <div className="text-xl font-black text-emerald-600">{proUsersCount}</div>
            <div className="text-[9px] text-emerald-500 font-bold mt-0.5">
              {totalUsersCount > 0 ? Math.round((proUsersCount / totalUsersCount) * 100) : 0}% Rasio Aktivasi
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Pengguna Trial</div>
            <div className="text-xl font-black text-slate-700">{trialUsersCount}</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Dalam masa evaluasi</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Serial Tersedia</div>
            <div className="text-xl font-black text-amber-600">{availableKeysCount}</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Dari total {totalKeysCount} Kode</div>
          </div>
        </div>
      </div>

      {/* Pengaturan Harga & Gateway Pembayaran */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Konfigurasi Harga Platform &amp; Gerbang Pembayaran Pakasir</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Atur harga promo, label diskon, dan API Key Pakasir untuk pembayaran QRIS otomatis.</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleResetSettings}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Pulihkan Default
          </button>
        </div>

        {/* FEEDBACK NOTIFICATION BANNERS */}
        {showSaveAlert && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Berhasil! Konfigurasi harga platform &amp; API Gateway telah disimpan secara aman ke database.</span>
          </div>
        )}

        {saveError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Gagal menyimpan: {saveError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* INPUT FORM (Col-span-8) */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  Harga PRO Promo (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={settings.harga_pro}
                    onChange={(e) => {
                      setSettings({ ...settings, harga_pro: Number(e.target.value) || 0 });
                      setSettingsDirtyState(true);
                    }}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600"
                    placeholder="99000"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Harga final yang harus dibayar pengguna.</p>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  Harga Coret Sebelum Diskon (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={settings.harga_coret}
                    onChange={(e) => {
                      setSettings({ ...settings, harga_coret: Number(e.target.value) || 0 });
                      setSettingsDirtyState(true);
                    }}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600"
                    placeholder="199000"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Harga acuan sebelum potongan.</p>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  Teks Label Diskon / Promo
                </label>
                <input
                  type="text"
                  value={settings.teks_diskon}
                  onChange={(e) => {
                    setSettings({ ...settings, teks_diskon: e.target.value });
                    setSettingsDirtyState(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600"
                  placeholder="Diskon 50% Terbatas!"
                />
                <p className="text-[9px] text-slate-400 mt-1">Draf label promo menarik di atas kartu.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  Pakasir API Key
                </label>
                <input
                  type="password"
                  value={settings.pakasir_api_key}
                  onChange={(e) => {
                    setSettings({ ...settings, pakasir_api_key: e.target.value });
                    setSettingsDirtyState(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600 font-mono"
                  placeholder="Gunakan demo_api_key atau API Key Anda"
                />
                <p className="text-[9px] text-slate-400 mt-1">API Key utama dari dashboard Pakasir Anda.</p>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-1.5">
                  Pakasir Project Name
                </label>
                <input
                  type="text"
                  value={settings.pakasir_project}
                  onChange={(e) => {
                    setSettings({ ...settings, pakasir_project: e.target.value });
                    setSettingsDirtyState(true);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600"
                  placeholder="depodomain"
                />
                <p className="text-[9px] text-slate-400 mt-1">Nama project aktif di dalam akun Pakasir.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                {isSettingsDirty && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 font-bold animate-pulse inline-flex items-center gap-1">
                    ⚠️ Perubahan Belum Disimpan
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={savingSettings}
                className={`px-5 py-2.5 text-white font-bold rounded-xl text-xs transition shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5 ${
                  isSettingsDirty 
                    ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-500/10' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {savingSettings ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Simpan Konfigurasi Platform
                  </>
                )}
              </button>
            </div>
          </form>

          {/* REAL-TIME INTERACTIVE CARD PREVIEW (Col-span-4) */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                  Live Pratinjau
                </span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              </div>

              {/* SIMULATED CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs relative overflow-hidden space-y-2.5">
                {settings.teks_diskon && (
                  <div className="inline-block px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-lg">
                    {settings.teks_diskon}
                  </div>
                )}

                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800">Paket Aktivasi PRO</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Sekali bayar untuk selamanya tanpa batas</p>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(settings.harga_pro)}
                  </span>
                  
                  {settings.harga_coret > settings.harga_pro && (
                    <span className="text-[10px] text-slate-400 line-through">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(settings.harga_coret)}
                    </span>
                  )}
                </div>

                {settings.harga_coret > settings.harga_pro && (
                  <div className="text-[9px] text-rose-500 font-extrabold font-mono bg-rose-50 border border-rose-100 rounded-md px-1.5 py-0.5 inline-block">
                    Hemat {Math.round(((settings.harga_coret - settings.harga_pro) / settings.harga_coret) * 100)}% dari harga normal!
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[9px] text-slate-400 font-semibold space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Rute API Gateway:</span>
                <span className="font-mono text-slate-600 text-[8px] bg-slate-200/50 px-1 py-0.2 rounded font-bold">/api/pakasir/*</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Project Name:</span>
                <span className="font-mono text-indigo-600 font-bold truncate max-w-[100px]">{settings.pakasir_project || 'kosong'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Management Table (Col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Manajemen Lisensi Pengguna
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">Aktifkan atau hapus akses sekolah sekolah terdaftar.</p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Cari sekolah/username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-48"
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50">
                  <th className="py-2.5 px-3">Username &amp; Sekolah</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Serial Terpakai</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      Tidak menemukan pengguna yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.username} className="hover:bg-slate-50/40">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>{u.email ? u.email : `@${u.username}`}</span>
                          {(u.role === 'admin' || u.role === 'Administrator') && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate" title={u.nama_sekolah}>
                          {u.nama_sekolah || 'Nama sekolah tidak diset'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {u.is_pro ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold">
                            PRO
                          </span>
                        ) : (
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold">
                            TRIAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                        {u.serial_key ? (
                          <span className="text-indigo-600 font-bold">{u.serial_key}</span>
                        ) : (
                          <span className="text-slate-300 italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleUserPro(u.username, !!u.is_pro)}
                            className="p-1 transition text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer"
                            title={u.is_pro ? "Ubah ke Akun Trial" : "Paksa Upgrade ke PRO"}
                          >
                            {u.is_pro ? (
                              <ToggleRight className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(u.username)}
                            className="p-1 transition text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            disabled={u.username.toLowerCase() === 'admin' || u.role === 'admin' || u.role === 'Administrator' || u.email?.toLowerCase() === 'balkhi05@gmail.com'}
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Serial Keys Generator & List (Col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Generator Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Generator Serial Massal
            </h3>
            
            <form onSubmit={handleGenerateKeys} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider mb-1">
                  Jumlah Serial
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={genQuantity}
                  onChange={(e) => setGenQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                Generate
              </button>
            </form>
          </div>

          {/* Serial Keys List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Kode Serial</h3>
                <p className="text-[9px] text-slate-400 font-semibold">Salin kode di bawah untuk didistribusikan.</p>
              </div>

              {/* Filters */}
              <div className="flex gap-1.5 text-[9px] font-bold">
                <button
                  onClick={() => setKeyFilter('all')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${keyFilter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setKeyFilter('available')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${keyFilter === 'available' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Tersedia
                </button>
                <button
                  onClick={() => setKeyFilter('used')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${keyFilter === 'used' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Terpakai
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredKeys.length === 0 ? (
                <div className="py-6 text-center text-slate-400 italic text-xs">
                  Tidak ada serial key yang cocok.
                </div>
              ) : (
                filteredKeys.map(k => (
                  <div key={k.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200/60 hover:bg-slate-100/40 transition">
                    <div className="font-mono text-xs font-extrabold text-slate-700 tracking-wider">
                      {k.key}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {k.is_used ? (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold" title={`Diaktifkan oleh @${k.used_by}`}>
                          @{k.used_by}
                        </span>
                      ) : (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold">
                          Ready
                        </span>
                      )}

                      <button
                        onClick={() => handleCopyKey(k.key)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded border border-slate-200 bg-slate-50 shadow-xs cursor-pointer"
                        title="Salin Serial Key"
                      >
                        {copiedKey === k.key ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

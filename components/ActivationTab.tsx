'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { CheckCircle, AlertCircle, CreditCard, ShieldCheck, HelpCircle, Sparkles, RefreshCw, Smartphone, ExternalLink, Check, Info } from 'lucide-react';
import { LocalDB, SystemSettings } from '../lib/db';
import { getSupabaseClient, isSupabaseModeActive } from '../lib/supabaseClient';

interface ActivationTabProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

const NOISE_PATTERN = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

export default function ActivationTab({ currentUser, setCurrentUser, setLogMessages }: ActivationTabProps) {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    return LocalDB.getSystemSettings();
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paying, setPaying] = useState(false);
  const [qrisData, setQrisData] = useState<any>(null);
  const [pollingId, setPollingId] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'expired' | null>(null);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Spotlights for 3 cards
  const mouseX1 = useMotionValue(0);
  const mouseY1 = useMotionValue(0);
  const mouseX2 = useMotionValue(0);
  const mouseY2 = useMotionValue(0);
  const mouseX3 = useMotionValue(0);
  const mouseY3 = useMotionValue(0);

  function handleMouseMoveCard1({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX1.set(clientX - left);
    mouseY1.set(clientY - top);
  }

  function handleMouseMoveCard2({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX2.set(clientX - left);
    mouseY2.set(clientY - top);
  }

  function handleMouseMoveCard3({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX3.set(clientX - left);
    mouseY3.set(clientY - top);
  }

  // Format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Load platform settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      let local = LocalDB.getSystemSettings();
      
      // Always pre-set local settings first as offline fallback
      setSettings(local);
      
      if (isSupabaseModeActive()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data, error } = await supabase.from('system_settings').select('*');
            if (!error && data && data.length > 0) {
              const parsed: any = {};
              data.forEach((row: any) => {
                parsed[row.key] = row.value;
              });
              
              const merged = {
                harga_pro: parsed.harga_pro !== undefined && !isNaN(Number(parsed.harga_pro)) ? Number(parsed.harga_pro) : local.harga_pro,
                harga_coret: parsed.harga_coret !== undefined && !isNaN(Number(parsed.harga_coret)) ? Number(parsed.harga_coret) : local.harga_coret,
                teks_diskon: parsed.teks_diskon !== undefined ? parsed.teks_diskon : local.teks_diskon,
                pakasir_api_key: parsed.pakasir_api_key !== undefined ? parsed.pakasir_api_key : local.pakasir_api_key,
                pakasir_project: parsed.pakasir_project !== undefined ? parsed.pakasir_project : local.pakasir_project,
              };
              setSettings(merged);
              LocalDB.saveSystemSettings(merged);
            }
          } catch (err) {
            console.warn("Membaca tabel system_settings dibatalkan atau tabel belum ada:", err);
          }
        }
      }
      setLoadingSettings(false);
    };

    fetchSettings();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingId) {
        clearInterval(pollingId);
      }
    };
  }, [pollingId]);

  // Initiate QRIS payment
  const handleInitiatePayment = async () => {
    if (!currentUser) {
      setErrorMsg("Harap login terlebih dahulu untuk melakukan aktivasi lisensi sekolah.");
      return;
    }
    
    if (pollingId) {
      clearInterval(pollingId);
      setPollingId(null);
    }

    setPaying(true);
    setErrorMsg('');
    setQrisData(null);
    setPaymentStatus(null);

    // Filter characters in username for safe order_id, or use user UUID if logged into Supabase
    const userIdentifier = currentUser.id || currentUser.username.replace(/[^a-zA-Z0-9]/g, '');
    const orderId = `JADW_${userIdentifier}_${Date.now()}`;

    try {
      console.log(`Menginisiasi transaksi Pakasir QRIS: ${orderId}`);
      const response = await fetch("/api/pakasir/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: settings.harga_pro,
          apiKey: settings.pakasir_api_key,
          project: settings.pakasir_project
        })
      });

      const resData = await response.json();
      console.log("Response QRIS di Client:", resData);

      const hasPayment = resData.payment || resData.payment_number || resData.total_payment;

      if ((resData.status === "success" || hasPayment) && (resData.payment || resData)) {
        const p = resData.payment || resData;
        setQrisData({
          orderId: orderId,
          qrString: p.payment_number || resData.payment_number || "",
          total: p.total_payment || resData.total_payment || p.amount || settings.harga_pro,
          fee: p.fee !== undefined ? p.fee : (resData.fee !== undefined ? resData.fee : 0),
          expiredAt: p.expired_at || resData.expired_at || ""
        });
        setPaymentStatus('pending');

        // Start polling the server status API
        const interval = setInterval(async () => {
          try {
            const checkRes = await fetch(`/api/pakasir/status?order_id=${orderId}&amount=${settings.harga_pro}&project=${settings.pakasir_project}`);
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.status === "PAID") {
                clearInterval(interval);
                setPollingId(null);
                setPaymentStatus('success');

                // Update status locally in client-side states
                const updatedUser = {
                  ...currentUser,
                  is_pro: true,
                  activated_at: new Date().toISOString()
                };
                localStorage.setItem('sch_current_user', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);

                // Update local storage DB status
                LocalDB.updateUserProStatus(currentUser.username, true);

                // Update Supabase profile directly if connected and authenticated
                if (isSupabaseModeActive()) {
                  const supabase = getSupabaseClient();
                  if (supabase) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      await supabase
                        .from('profiles')
                        .update({
                          is_pro: true,
                          activated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);
                    }
                  }
                }

                setSuccessMsg("Selamat! Pembayaran QRIS terverifikasi secara instan. Fitur Jadwalify PRO kini aktif sepenuhnya!");
                setLogMessages(prev => [
                  `🎉 [Sistem] Pembayaran QRIS ${orderId} berhasil diverifikasi! Lisensi PRO diaktifkan.`,
                  ...prev
                ]);
                setQrisData(null);
              }
            }
          } catch (pollErr) {
            console.error("Gagal memeriksa status pembayaran di interval:", pollErr);
          }
        }, 3000);

        setPollingId(interval);
      } else {
        setErrorMsg(resData.message || "Gagal membuat transaksi QRIS. Harap periksa koneksi internet atau hubungi Admin via WhatsApp.");
      }
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setErrorMsg(`Kesalahan jaringan: ${err.message || String(err)}`);
    } finally {
      setPaying(false);
    }
  };

  const isPro = currentUser?.is_pro;

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Real-time countdown calculation (1 year duration)
  useEffect(() => {
    if (!isPro || !currentUser?.activated_at) return;

    const updateCountdown = () => {
      const activatedTime = new Date(currentUser.activated_at).getTime();
      const expiryTime = activatedTime + 365 * 24 * 60 * 60 * 1000; // 1 year in ms
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeRemaining('Masa Aktif Berakhir (Telah Kedaluwarsa)');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isPro, currentUser?.activated_at]);

  const legoVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <div className="space-y-8 font-sans" id="activation-tab-container">
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="header-panel">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Status Lisensi &amp; Aktivasi
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola langganan dan aktivasi lisensi profesional Jadwalify Anda di sini.
          </p>
        </div>
        <div className="flex items-center">
          {isPro ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold" id="pro-badge">
              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
              PROFESIONAL (PRO) AKTIF (1 TAHUN)
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold animate-pulse" id="trial-badge">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              VERSI TRIAL (TERBATAS)
            </div>
          )}
        </div>
      </div>

      {isPro ? (
        // ==========================================
        // DISPLAY USER ACTIVE PRO LICENSE - DARK INDIGO GLASSY
        // ==========================================
        <div className="bg-[#0c0a21] text-white rounded-[32px] p-1 shadow-2xl relative overflow-hidden border border-indigo-900/40">
          {/* Noise effect */}
          <div className="absolute inset-0 z-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />
          {/* Animated blurred light backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse" />
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Aktivasi Lisensi PRO Berhasil
              </div>
              <h3 className="text-3xl font-black tracking-tight text-white">
                Jadwalify Professional
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Sekolah Anda telah terdaftar sebagai pengguna resmi **Jadwalify PRO (1 Tahun)**. Selamat menikmati kemudahan menyusun jadwal bebas bentrok menggunakan algoritma genetika pintar, ekspor excel, draf multi-versi, serta cetak PDF resmi siap pakai.
              </p>

              {/* Real-time countdown box */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 max-w-md text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block font-mono">Status Masa Aktif Real-Time:</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                  <span className="text-sm font-black text-white font-mono tracking-wide">{timeRemaining || 'Memuat...'}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">Masa aktif lisensi Anda berlaku selama 1 tahun (365 hari) penuh terhitung sejak tanggal aktivasi terverifikasi di server.</p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span>Fitness Genetika Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span>Multi-Versi &amp; Cloud Draft</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span>Cetak PDF Premium Siap LPJ</span>
                </div>
              </div>
            </div>

            {/* License details ticket - Glass styling */}
            <div className="w-full md:w-80 overflow-hidden rounded-[24px] bg-white/5 border border-white/10 p-6 shadow-2xl relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-emerald-400" />
              </div>
              
              <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 font-mono">
                Rincian Lisensi Sekolah
              </h4>
              <div className="space-y-3.5 font-mono text-xs text-white/70">
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-white/40">Akun</span>
                  <span className="font-bold text-white">@{currentUser?.username || 'Guest'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-white/40">Sekolah</span>
                  <span className="font-bold text-white truncate max-w-[140px]" title={currentUser?.nama_sekolah}>
                    {currentUser?.nama_sekolah || '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-white/40">Tipe</span>
                  <span className="font-bold text-emerald-400">PRO (1 TAHUN)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <span className="text-white/40">Sisa Waktu</span>
                  <span className="font-bold text-indigo-300 text-[10px] truncate max-w-[140px] text-right" title={timeRemaining}>
                    {timeRemaining ? timeRemaining.split(',')[0] : '365 hari'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Aktivasi</span>
                  <span className="font-bold text-white">
                    {currentUser?.activated_at ? new Date(currentUser.activated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // 3-TIER PRICING GLASS LAYOUT FOR TRIAL - DARK INDIGO
        // ==========================================
        <div className="bg-[#0c0a21] text-white rounded-[32px] p-6 md:p-12 shadow-2xl relative overflow-hidden border border-indigo-900/40" id="pricing-glass-section">
          {/* Noise effect */}
          <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />
          {/* Ambient Spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

          {/* Section title */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-wider rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Paket Lisensi Jadwalify
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white animate-fade-in">
              Masa Aktif 1 Tahun Penuh.
            </h2>
            <p className="text-sm md:text-base text-white/50 leading-relaxed">
              Pilih opsi aktivasi terbaik untuk sekolah Anda. Nikmati kemudahan ekspor data, koordinasi otomatis super lancar, optimasi genetika, dan penyimpanan multi-versi cloud draf tanpa batas.
            </p>
          </div>

          {/* 3-Tier Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* TIER 1: FREE TRIAL (CARD 1) */}
            <div
              onMouseMove={handleMouseMoveCard1}
              className="group relative overflow-hidden rounded-[32px] bg-white/1 backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110 flex flex-col transition-all duration-500 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_32px_64px_-12px_rgba(0,0,0,0.6)]"
            >
              {/* Card Spotlight */}
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: useMotionTemplate`radial-gradient(400px at ${mouseX1}px ${mouseY1}px, rgba(255,255,255,0.08), transparent)`
                }}
              />
              <div className="absolute inset-0 z-0 opacity-[0.01] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />
              
              <div className="relative z-10 flex flex-col p-8 flex-1">
                <h3 className="text-lg font-bold text-white/60 tracking-wider">
                  Trial Version
                </h3>
                
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-white/40 text-2xl font-semibold tracking-tight">Rp</span>
                  <div className="h-[50px] flex items-center">
                    <span className="text-[44px] font-black text-white tracking-tighter leading-none">
                      0
                    </span>
                  </div>
                  <span className="text-white/40 text-sm font-semibold ml-1">/ selamanya</span>
                </div>
                
                <p className="text-white/40 text-xs leading-relaxed mb-6 min-h-[36px]">
                  Fungsionalitas terbatas untuk keperluan uji coba awal di sekolah Anda.
                </p>
                
                <div className="w-full h-px bg-white/10 mb-6" />
                
                {/* Features list */}
                <div className="flex flex-col gap-3.5 mb-8 flex-1">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 text-red-400 font-bold text-xs mt-0.5">✕</span>
                    <span className="text-white/50 text-[13px] leading-tight">Maksimal 5 Generasi Genetika</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 text-red-400 font-bold text-xs mt-0.5">✕</span>
                    <span className="text-white/50 text-[13px] leading-tight">Format Cetak PDF Terbatas (Watermark)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 text-red-400 font-bold text-xs mt-0.5">✕</span>
                    <span className="text-white/50 text-[13px] leading-tight">Tidak Ada Penyimpanan Multi-Versi</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 text-red-400 font-bold text-xs mt-0.5">✕</span>
                    <span className="text-white/50 text-[13px] leading-tight">Tidak Ada Sinkronisasi Cloud Supabase</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-white/10 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/80" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[13px] leading-tight">Penyimpanan Offline Browser</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-center text-xs font-bold text-white/50 cursor-default">
                    Sedang Digunakan
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 2: PROFESSIONAL AUTOMATIC QRIS (CARD 2) */}
            <div
              onMouseMove={handleMouseMoveCard2}
              className="group relative overflow-hidden rounded-[32px] bg-white/1 backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110 flex flex-col transition-all duration-500 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.05),0_32px_64px_-12px_rgba(0,0,0,0.6),0_0_80px_rgba(255,255,255,0.05)] lg:-translate-y-4"
            >
              {/* Dynamic shining border */}
              <div 
                className="absolute inset-0 z-0 rounded-[32px] pointer-events-none p-px"
                style={{
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude"
                }}
              >
                <div 
                  className="absolute -inset-full animate-[spin_4s_linear_infinite]"
                  style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.6) 100%)" }}
                />
              </div>

              {/* Card Spotlight */}
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: useMotionTemplate`radial-gradient(400px at ${mouseX2}px ${mouseY2}px, rgba(255,255,255,0.12), transparent)`
                }}
              />
              <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

              {/* Badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 border-b border-x border-white/10 rounded-b-xl text-[9px] font-black uppercase tracking-widest text-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                Bayar Otomatis QRIS
              </div>

              <div className="relative z-10 flex flex-col p-8 md:p-9 flex-1">
                <h3 className="text-lg font-black text-white tracking-wider flex items-center gap-1.5">
                  Professional PRO
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </h3>
                
                <div className="flex flex-col gap-1 mt-4 mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-white/40 text-lg font-semibold tracking-tight">Rp</span>
                    <div className="h-[50px] overflow-hidden flex items-center">
                      <span className="text-[36px] md:text-[40px] font-black text-white tracking-tighter leading-none">
                        {settings.harga_pro.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 line-through font-semibold">
                      Rp {settings.harga_coret.toLocaleString('id-ID')}
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-[8px] font-black uppercase tracking-wide">
                      {settings.teks_diskon}
                    </span>
                  </div>
                </div>
                       <p className="text-white/40 text-xs leading-relaxed mb-6 min-h-[36px]">
                  Lisensi resmi institusi selama 1 (satu) tahun penuh untuk kemudahan penjadwalan tanpa batas.
                </p>
                
                <div className="w-full h-px bg-white/10 mb-6" />

                {/* Conditional view: If QRIS generated, replace feature lists to focus on QR code checkout */}
                <AnimatePresence mode="wait">
                  {qrisData ? (
                    <motion.div
                      key="qris-box"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center space-y-4 bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden mb-4"
                    >
                      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />
                      
                      <div className="text-center space-y-1">
                        <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Pindai QRIS Instan</span>
                        <h4 className="text-lg font-black text-white">{formatRupiah(qrisData.total)}</h4>
                        <p className="text-[8px] text-white/40">Biaya admin {formatRupiah(qrisData.fee)}</p>
                      </div>

                      <div className="bg-white p-2 rounded-xl relative shadow-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrisData.qrString)}`}
                          alt="Pakasir QRIS Code"
                          className="w-36 h-36 rounded-md"
                        />
                        {paymentStatus === 'success' && (
                          <div className="absolute inset-0 bg-black/90 rounded-xl flex flex-col items-center justify-center text-emerald-400 space-y-2">
                            <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Sukses!</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold text-amber-400">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></div>
                          Menunggu Transfer...
                        </div>
                        <p className="text-[8px] text-white/40 leading-tight max-w-[180px]">
                          Mendukung GoPay, OVO, Dana, LinkAja, BCA, Mandiri, dll.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (pollingId) clearInterval(pollingId);
                          setPollingId(null);
                          setQrisData(null);
                          setPaymentStatus(null);
                        }}
                        className="text-[9px] font-bold text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                      >
                        Batalkan QRIS
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="features-box"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-3.5 mb-8 flex-1"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                          <Check className="w-2.5 h-2.5 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-[13px] leading-tight font-semibold">Optimasi Genetika Tanpa Batas</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                          <Check className="w-2.5 h-2.5 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-[13px] leading-tight font-semibold">Cetak PDF Premium Siap LPJ</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                          <Check className="w-2.5 h-2.5 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-[13px] leading-tight font-semibold">Penyimpanan Multi-Versi &amp; Cloud Draft</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                          <Check className="w-2.5 h-2.5 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-[13px] leading-tight font-semibold">Sinkronisasi Cloud Supabase Real-Time</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                          <Check className="w-2.5 h-2.5 text-indigo-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/80 text-[13px] leading-tight font-semibold">Masa Aktif 1 Tahun Penuh (365 Hari)</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Display Messages */}
                {errorMsg && (
                  <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-semibold text-red-400 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {!qrisData && (
                  <div className="mt-auto">
                    <button
                      onClick={handleInitiatePayment}
                      disabled={paying || loadingSettings}
                      className="w-full py-4 rounded-2xl font-black text-xs text-black bg-white hover:bg-white/95 active:scale-[0.98] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      id="btn-generate-qris-glass"
                    >
                      {paying ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Menghubungkan Server...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Aktivasi Instan (QRIS)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TIER 3: MANUAL LICENSE / INSTITUTION via WHATSAPP (CARD 3) */}
            <div
              onMouseMove={handleMouseMoveCard3}
              className="group relative overflow-hidden rounded-[32px] bg-white/1 backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110 flex flex-col transition-all duration-500 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_32px_64px_-12px_rgba(0,0,0,0.6)]"
            >
              {/* Card Spotlight */}
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: useMotionTemplate`radial-gradient(400px at ${mouseX3}px ${mouseY3}px, rgba(255,255,255,0.08), transparent)`
                }}
              />
              <div className="absolute inset-0 z-0 opacity-[0.01] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

              <div className="relative z-10 flex flex-col p-8 flex-1">
                <h3 className="text-lg font-bold text-white/60 tracking-wider">
                  Manual / Institusi
                </h3>
                
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-white/40 text-2xl font-semibold tracking-tight">Invoice</span>
                  <div className="h-[50px] flex items-center">
                    <span className="text-[36px] font-black text-white tracking-tighter leading-none">
                      Resmi
                    </span>
                  </div>
                </div>
                
                <p className="text-white/40 text-xs leading-relaxed mb-6 min-h-[36px]">
                  Dukungan bendahara sekolah, kuitansi formal cap basah, & penawaran LPJ.
                </p>
                
                <div className="w-full h-px bg-white/10 mb-6" />
                
                {/* Features list */}
                <div className="flex flex-col gap-3.5 mb-8 flex-1">
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-white/10 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/80" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[13px] leading-tight">Penawaran Formal &amp; Invoice LPJ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-white/10 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/80" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[13px] leading-tight">Transfer Bank Manual (BCA/Mandiri)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-white/10 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/80" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[13px] leading-tight">Kuitansi Cap Basah Resmi</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 flex items-center justify-center w-4 h-4 mt-0.5 rounded-full bg-white/10 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/80" strokeWidth={3} />
                    </div>
                    <span className="text-white/70 text-[13px] leading-tight">Pendampingan Setup Prioritas</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <a
                    href={`https://wa.me/6289522537711?text=${encodeURIComponent(
                      `Halo Admin Jadwalify 👋,\n\nSaya tertarik untuk membeli Lisensi PRO Resmi melalui konfirmasi manual.\n\nBerikut detail akun sekolah saya:\n• Username     : @${currentUser?.username || 'user'}\n• Nama Sekolah : ${currentUser?.nama_sekolah || '-'}\n\nMohon informasi prosedur pembayarannya. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-2xl font-black text-xs text-center text-white bg-white/10 hover:bg-white/20 active:scale-[0.98] transition border border-white/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Hubungi WhatsApp Admin
                    <ExternalLink className="w-3.5 h-3.5 text-white/60 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Collapsible/Elegant Licensing FAQ section inside the dark box */}
          <div className="relative z-10 mt-20 border-t border-white/10 pt-12">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-8 justify-center md:justify-start">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Pertanyaan Umum (FAQ) Lisensi Jadwalify
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/60 leading-relaxed font-semibold">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-sm hover:border-white/10 transition">
                <h4 className="font-bold text-white text-sm mb-2">Apakah pembayaran QRIS aman?</h4>
                <p className="leading-relaxed">Ya, sangat aman. Kode QRIS di-generate secara unik untuk transaksi Anda secara real-time. Begitu terbayar, sistem mendeteksinya langsung dalam hitungan detik dan mengaktifkan akun Anda secara instan.</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-sm hover:border-white/10 transition">
                <h4 className="font-bold text-white text-sm mb-2">Berapa lama masa aktif Lisensi PRO?</h4>
                <p className="leading-relaxed">Lisensi PRO berlaku selama 1 tahun (365 hari) sejak tanggal aktivasi terverifikasi. Setelah 1 tahun, Anda dapat melakukan perpanjangan lisensi dengan mudah untuk tahun ajaran berikutnya.</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 shadow-sm hover:border-white/10 transition">
                <h4 className="font-bold text-white text-sm mb-2">Dapatkah dibuka di beberapa perangkat?</h4>
                <p className="leading-relaxed">Tentu saja. Dengan mengaktifkan Supabase cloud mode, data utama sekolah Anda tersimpan aman di cloud. Anda dapat mengakses, mengisi data, atau mengedit jadwal dari komputer mana saja secara instan.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

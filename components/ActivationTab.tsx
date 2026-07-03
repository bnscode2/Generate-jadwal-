'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, CreditCard, ShieldCheck, HelpCircle, Sparkles, RefreshCw, Smartphone, ExternalLink } from 'lucide-react';
import { LocalDB, SystemSettings } from '../lib/db';
import { getSupabaseClient, isSupabaseModeActive } from '../lib/supabaseClient';

interface ActivationTabProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

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
    setSuccessMsg('');
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

      if (resData.status === "success" && resData.payment) {
        const p = resData.payment;
        setQrisData({
          orderId: orderId,
          qrString: p.payment_number,
          total: p.total_payment,
          fee: p.fee || 0,
          expiredAt: p.expired_at
        });
        setPaymentStatus('pending');

        // Start polling the server status API
        const interval = setInterval(async () => {
          try {
            const checkRes = await fetch(`/api/pakasir/status?order_id=${orderId}`);
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
        setErrorMsg(resData.message || "Gagal membuat transaksi QRIS. Harap periksa koneksi internet atau gunakan opsi pembayaran WhatsApp.");
      }
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setErrorMsg(`Kesalahan jaringan: ${err.message || String(err)}`);
    } finally {
      setPaying(false);
    }
  };

  const isPro = currentUser?.is_pro;

  return (
    <div className="space-y-6 font-sans" id="activation-tab-container">
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
              PROFESIONAL (PRO) AKTIF
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold" id="trial-badge">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              VERSI TRIAL (TERBATAS)
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="activation-main-grid">
        {/* Left Panel: Checkout QRIS or PRO Status Details */}
        <div className="lg:col-span-7 space-y-6" id="left-action-panel">
          {isPro ? (
            // PRO ACTIVE LAYOUT
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden" id="pro-details-card">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-40 h-40" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase font-mono">Lisensi Premium Terverifikasi</div>
                  <h3 className="text-lg font-black tracking-tight text-white">Jadwalify Professional</h3>
                </div>
              </div>

              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-xs font-mono text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-300">Pemilik Akun</span>
                  <span className="font-bold text-white">@{currentUser?.username || 'Guest'}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-300">Nama Sekolah</span>
                  <span className="font-bold text-indigo-200 truncate max-w-[180px]" title={currentUser?.nama_sekolah}>
                    {currentUser?.nama_sekolah || '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-300">Metode Lisensi</span>
                  <span className="font-bold text-emerald-300">
                    Sistem Pembayaran Instan QRIS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Tanggal Aktivasi</span>
                  <span className="font-bold text-slate-200">
                    {currentUser?.activated_at ? new Date(currentUser.activated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-indigo-200 font-semibold bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Terima kasih! Dukungan Anda memungkinkan kami terus menyempurnakan algoritma penataan jadwal sekolah otomatis ini.</span>
              </div>
            </div>
          ) : (
            // TRIAL CHECKOUT & QRIS GENERATOR
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6" id="trial-checkout-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 text-indigo-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Aktivasi Instan via QRIS</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Aktifkan status PRO dalam hitungan detik secara otomatis.</p>
                  </div>
                </div>
                
                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold uppercase animate-pulse">
                  Metode Otomatis
                </span>
              </div>

              {/* Pricing Showcase */}
              {!qrisData && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Buka Lisensi Seumur Hidup (Lifetime)</div>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                      <span className="text-2xl font-black text-indigo-600">{formatRupiah(settings.harga_pro)}</span>
                      <span className="text-xs text-slate-400 line-through font-semibold">{formatRupiah(settings.harga_coret)}</span>
                    </div>
                    <div className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] font-black uppercase font-mono tracking-wider">
                      {settings.teks_diskon}
                    </div>
                  </div>

                  <button
                    onClick={handleInitiatePayment}
                    disabled={paying || loadingSettings}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-xs hover:shadow-md disabled:opacity-75 flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                    id="btn-generate-qris"
                  >
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating QRIS...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Bayar Instan Sekarang (QRIS)
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* QRIS Display */}
              {qrisData && (
                <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4 animate-fade-in" id="qris-display-panel">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider font-mono">Scan Kode QRIS di Bawah Ini</span>
                    <h4 className="text-base font-black text-slate-900">{formatRupiah(qrisData.total)}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold">Sudah termasuk biaya admin {formatRupiah(qrisData.fee)}</p>
                  </div>

                  {/* QR Image */}
                  <div className="mx-auto bg-white p-3 rounded-2xl border border-slate-200/80 w-52 h-52 flex items-center justify-center relative shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisData.qrString)}`}
                      alt="Pakasir QRIS Code"
                      className="w-44 h-44 rounded-lg"
                    />
                    {paymentStatus === 'success' && (
                      <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center text-emerald-600 space-y-2 animate-fade-in">
                        <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                        <span className="text-xs font-black uppercase tracking-wider font-mono">Pembayaran Sukses!</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Live Status Indicator */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                      Menunggu Pembayaran (Otomatis Aktif)...
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      QRIS mendukung seluruh aplikasi pembayaran perbankan (M-Banking) &amp; e-Wallet seperti <strong>GoPay, OVO, Dana, LinkAja, ShopeePay, dsb</strong>.
                    </div>
                    
                    <button
                      onClick={() => {
                        if (pollingId) clearInterval(pollingId);
                        setPollingId(null);
                        setQrisData(null);
                        setPaymentStatus(null);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition text-[10px] font-bold cursor-pointer"
                    >
                      Batal / Cari Alternatif Lain
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Trial Limitations Card */}
          {!isPro && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4" id="trial-limits-card">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Batasan Fitur Akun Trial (Uji Coba)</h4>
              <div className="space-y-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Format PDF Terbatas:</strong> Hasil cetak master tidak didukung oleh styling kustom premium.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Batas Penjadwalan:</strong> Algoritma Genetika hanya terbatas pada 5 generasi kalkulasi.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Cloud Sync:</strong> Tidak dapat mengaktifkan sinkronisasi database cloud otomatis.</span>
                </p>
              </div>
            </div>
          )}

          {/* Secondary WhatsApp Support */}
          {!isPro && (
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6 shadow-xs space-y-4" id="wa-purchase-card">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Beli Manual / Konfirmasi WhatsApp</h3>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Apabila Anda memerlukan invoice penawaran formal untuk bendahara sekolah atau ingin bertransaksi secara manual melalui transfer bank konvensional.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/6289522537711?text=${encodeURIComponent(
                  `Halo Admin Jadwalify 👋,\n\nSaya tertarik untuk membeli Lisensi PRO Resmi melalui konfirmasi manual.\n\nBerikut detail akun sekolah saya:\n• Username     : @${currentUser?.username || 'user'}\n• Nama Sekolah : ${currentUser?.nama_sekolah || '-'}\n\nMohon informasi prosedur pembayarannya. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-emerald-200 hover:border-emerald-300 text-emerald-700 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                <span>Hubungi Layanan WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Panel: Benefits & FAQ */}
        <div className="lg:col-span-5 space-y-6" id="right-info-panel">
          {/* Pro Benefits Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5" id="pro-benefits-card">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Keunggulan Akun Profesional (PRO)
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 h-8 w-8 shrink-0 flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">PDF Cetak Profesional Kustom</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Cetak jadwal kolektif super bersih dengan layout landscape, footer tanda tangan, dan legenda otomatis.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 h-8 w-8 shrink-0 flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Optimasi Genetika Tanpa Batas</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Temukan solusi jadwal sekolah super padat dengan ratusan generasi fitness kalkulasi bebas bentrok.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 h-8 w-8 shrink-0 flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pencadangan Cloud Otomatis</h4>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Hubungkan jadwal sekolah Anda secara reaktif ke Supabase Cloud untuk kolaborasi multi-perangkat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Licensing FAQ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4" id="licensing-faq-card">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Pertanyaan Umum (FAQ)
            </h3>

            <div className="space-y-3 text-[11px] font-semibold text-slate-600 leading-relaxed">
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="font-bold text-slate-800 mb-0.5">Apakah pembayaran QRIS aman?</h4>
                <p className="text-slate-500 leading-relaxed">Ya, sangat aman. Kode QRIS di-generate secara unik untuk transaksi Anda secara real-time. Begitu terbayar, sistem mendeteksinya langsung dalam hitungan detik dan mengaktifkan akun Anda secara instan.</p>
              </div>
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="font-bold text-slate-800 mb-0.5">Apakah Lisensi PRO berlaku selamanya?</h4>
                <p className="text-slate-500 leading-relaxed">Ya, sekali diaktifkan, lisensi PRO berlaku seumur hidup (lifetime) untuk akun sekolah Anda tanpa biaya bulanan atau tahunan tambahan.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-0.5">Dapatkah satu Akun PRO dibuka di beberapa perangkat?</h4>
                <p className="text-slate-500 leading-relaxed">Tentu saja. Dengan mengaktifkan Supabase cloud mode, data utama sekolah Anda tersimpan aman di cloud. Anda dapat mengakses, mengisi data, atau mengedit jadwal dari komputer mana saja secara instan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

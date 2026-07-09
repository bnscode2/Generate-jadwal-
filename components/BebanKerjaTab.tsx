'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Printer, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Guru, PengampuMataPelajaran, Jadwal } from '../lib/types';
import { LocalDB } from '../lib/db';

interface BebanKerjaTabProps {
  guru: Guru[];
  pengampu: PengampuMataPelajaran[];
  jadwal: Jadwal[];
}

interface TugasTambahan {
  id: string;
  nama: string;
  ekuivalensi_jp: number;
}

// Standar Tugas Tambahan Berdasarkan Permendikbud No. 15 Tahun 2018
const PILIHAN_TUGAS_TAMBAHAN: TugasTambahan[] = [
  { id: 'wakasek', nama: 'Wakil Kepala Sekolah', ekuivalensi_jp: 12 },
  { id: 'kepala_perpus', nama: 'Kepala Perpustakaan', ekuivalensi_jp: 12 },
  { id: 'kepala_lab', nama: 'Kepala Laboratorium/Bengkel', ekuivalensi_jp: 12 },
  { id: 'wali_kelas', nama: 'Wali Kelas', ekuivalensi_jp: 2 },
  { id: 'pembina_ekskul', nama: 'Pembina Ekstrakurikuler', ekuivalensi_jp: 2 },
  { id: 'koordinator_pkb', nama: 'Koordinator PKB/PKS', ekuivalensi_jp: 2 },
  { id: 'kepala_unit_produksi', nama: 'Kepala Unit Produksi SMK', ekuivalensi_jp: 12 }
];

export default function BebanKerjaTab({ guru, pengampu, jadwal }: BebanKerjaTabProps) {
  const isPro = LocalDB.getCurrentUser()?.is_pro;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'kurang' | 'ideal' | 'overload'>('semua');
  
  // State untuk menyimpan tugas tambahan guru secara dinamis di level client (disimpan di localStorage agar persisten)
  const [guruTugasTambahan, setGuruTugasTambahan] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sch_guru_tugas_tambahan');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Gagal memuat tugas tambahan:', e);
        }
      }
    }
    return {};
  });
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Simpan tugas tambahan ke LocalStorage
  const saveTugasTambahan = (newMap: Record<string, string[]>) => {
    setGuruTugasTambahan(newMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sch_guru_tugas_tambahan', JSON.stringify(newMap));
    }
  };

  const handleAddTugasTambahan = (guruId: string, tugasId: string) => {
    if (!tugasId) return;
    const currentList = guruTugasTambahan[guruId] || [];
    if (currentList.includes(tugasId)) return;
    
    const updated = {
      ...guruTugasTambahan,
      [guruId]: [...currentList, tugasId]
    };
    saveTugasTambahan(updated);
  };

  const handleRemoveTugasTambahan = (guruId: string, tugasId: string) => {
    const currentList = guruTugasTambahan[guruId] || [];
    const updated = {
      ...guruTugasTambahan,
      [guruId]: currentList.filter(id => id !== tugasId)
    };
    saveTugasTambahan(updated);
  };

  // --- LOGIKA PERHITUNGAN BEBAN KERJA GURU ---
  const dataBebanKerja = useMemo(() => {
    return guru.map(g => {
      // 1. Hitung JP Rencana berdasarkan pembagian beban di Pengampu
      const jp_rencana = pengampu
        .filter(p => p.guru_id === g.id)
        .reduce((sum, curr) => sum + curr.jumlah_jam, 0);

      // 2. Hitung JP Aktual berdasarkan yang sudah terplot di Jadwal saat ini
      const jp_aktual = jadwal.filter(j => j.guru_id === g.id).length;

      // 3. Hitung JP Ekuivalensi dari Tugas Tambahan
      const listTugasIds = guruTugasTambahan[g.id] || [];
      const listTugas = listTugasIds.map(id => PILIHAN_TUGAS_TAMBAHAN.find(t => t.id === id)).filter(Boolean) as TugasTambahan[];
      const jp_ekuivalensi = listTugas.reduce((sum, curr) => sum + curr.ekuivalensi_jp, 0);

      // Total JP Kumulatif (Rencana + Ekuivalensi) & (Aktual + Ekuivalensi)
      const total_jp_rencana = jp_rencana + jp_ekuivalensi;
      const total_jp_aktual = jp_aktual + jp_ekuivalensi;

      // Status kelayakan sertifikasi (Syarat mutlak: Total JP Kumulatif >= 24 JP)
      const layak_sertifikasi = total_jp_rencana >= 24;

      // Status Beban Mengajar Tatap Muka Murni (Standar: 24 - 40 JP)
      let status: 'kurang' | 'ideal' | 'overload' = 'ideal';
      if (total_jp_rencana < 24) {
        status = 'kurang';
      } else if (total_jp_rencana > 40) {
        status = 'overload';
      }

      return {
        ...g,
        jp_rencana,
        jp_aktual,
        jp_ekuivalensi,
        total_jp_rencana,
        total_jp_aktual,
        listTugas,
        layak_sertifikasi,
        status
      };
    });
  }, [guru, pengampu, jadwal, guruTugasTambahan]);

  // --- STATISTIK SUMMARY ---
  const stats = useMemo(() => {
    const totalGuru = dataBebanKerja.length;
    const kurang = dataBebanKerja.filter(d => d.status === 'kurang').length;
    const ideal = dataBebanKerja.filter(d => d.status === 'ideal').length;
    const overload = dataBebanKerja.filter(d => d.status === 'overload').length;
    
    const layakSertifikasi = dataBebanKerja.filter(d => d.layak_sertifikasi).length;
    const tidakLayakSertifikasi = totalGuru - layakSertifikasi;

    const totalJpMengajar = dataBebanKerja.reduce((sum, d) => sum + d.jp_rencana, 0);
    const rataRataJp = totalGuru > 0 ? Math.round((totalJpMengajar / totalGuru) * 10) / 10 : 0;

    return {
      totalGuru,
      kurang,
      ideal,
      overload,
      layakSertifikasi,
      tidakLayakSertifikasi,
      totalJpMengajar,
      rataRataJp
    };
  }, [dataBebanKerja]);

  // --- FILTER & SEARCH ---
  const filteredData = useMemo(() => {
    return dataBebanKerja.filter(d => {
      const matchSearch = d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.nip.includes(searchTerm);
      const matchStatus = statusFilter === 'semua' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [dataBebanKerja, searchTerm, statusFilter]);

  // --- EKSPOR CSV ---
  const handleExportCSV = () => {
    let csvContent = 'LAPORAN BEBAN KERJA GURU - STANDAR REPUBLIK INDONESIA\n';
    csvContent += 'NIP,Nama Guru,Jenis Kelamin,JP Mengajar,JP Ekuivalensi,Total JP Beban,Status Beban,Sertifikasi (>=24 JP)\n';

    dataBebanKerja.forEach(d => {
      const statusLabel = d.status === 'kurang' ? 'Kurang' : d.status === 'ideal' ? 'Ideal' : 'Overload';
      const sertifikasiLabel = d.layak_sertifikasi ? 'Memenuhi Syarat' : 'Belum Memenuhi';
      csvContent += `"${d.nip}","${d.nama}","${d.jenis_kelamin}",${d.jp_rencana},${d.jp_ekuivalensi},${d.total_jp_rencana},"${statusLabel}","${sertifikasiLabel}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'laporan_beban_kerja_guru.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CETAK PDF ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Briefcase className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase font-mono">Analisis Beban Kerja</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">Laporan Beban Kerja Guru (BKG)</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Analisis kesesuaian mengajar berdasarkan Standar Beban Kerja Guru di Indonesia (Permendikbud No. 15 Tahun 2018 - Minimal 24 JP, Maksimal 40 JP).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowInfoModal(true)}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Panduan Standar
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Ekspor Excel/CSV
          </button>

          <button
            onClick={isPro ? handlePrint : undefined}
            disabled={!isPro}
            className={`px-3.5 py-2 font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
              isPro
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-50/50 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-75'
            }`}
            title={isPro ? "Cetak Laporan beban kerja" : "Fitur Cetak Laporan hanya tersedia untuk Akun PRO"}
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
            {!isPro && (
              <span className="ml-1 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-extrabold tracking-wide">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RENDER KHUSUS PRINT */}
      <div className="hidden print:block space-y-6 text-slate-900">
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl font-bold uppercase">LAPORAN PEMENUHAN BEBAN KERJA GURU</h1>
          <h2 className="text-md font-semibold uppercase">STANDAR NASIONAL INDONESIA (MINIMAL 24 JP)</h2>
          <p className="text-xs">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs font-bold bg-slate-50 border border-slate-300 p-3 rounded-lg">
          <div>Total Guru: {stats.totalGuru} Orang</div>
          <div>Beban Ideal: {stats.ideal} Orang</div>
          <div>Kurang Jam: {stats.kurang} Orang</div>
          <div>Overload (&gt;40 JP): {stats.overload} Orang</div>
        </div>
      </div>

      {/* STATISTIK BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Total Guru Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">TOTAL GURU AKTIF</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalGuru}</span>
            <span className="text-xs text-slate-400 font-bold">Orang</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Rerata Beban Mengajar:</span>
            <span className="text-indigo-600 font-black">{stats.rataRataJp} JP/Minggu</span>
          </div>
        </div>

        {/* Layak Sertifikasi Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">SYARAT SERTIFIKASI (TPG)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-600">{stats.layakSertifikasi}</span>
            <span className="text-xs text-slate-400 font-bold">dari {stats.totalGuru} Guru</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Memenuhi Syarat &ge;24 JP:</span>
            <span className="text-emerald-600 font-black">
              {stats.totalGuru > 0 ? Math.round((stats.layakSertifikasi / stats.totalGuru) * 100) : 0}% Guru
            </span>
          </div>
        </div>

        {/* Belum Memenuhi Standard Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">BELUM MEMENUHI KKM (&lt;24 JP)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-600">{stats.kurang}</span>
            <span className="text-xs text-slate-400 font-bold">Guru</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Butuh Tambahan Jam / Tugas:</span>
            <span className="text-amber-600 font-black">{stats.kurang} Guru</span>
          </div>
        </div>

        {/* Overload Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-lg pointer-events-none" />
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">KELEBIHAN BEBAN (&gt;40 JP)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-rose-600">{stats.overload}</span>
            <span className="text-xs text-slate-400 font-bold">Guru</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Risiko Kelelahan Tinggi:</span>
            <span className="text-rose-600 font-black">
              {stats.totalGuru > 0 ? Math.round((stats.overload / stats.totalGuru) * 100) : 0}% Guru
            </span>
          </div>
        </div>
      </div>

      {/* GRAFIK DISTRIBUSI & INFORMASI PENDUKUNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        {/* PURE CSS/SVG CHART PANEL (Col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Visualisasi Distribusi Beban Kerja Guru</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Proporsi beban mengajar dalam satuan JP per Minggu.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                <span>Kurang (&lt;24)</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                <span>Ideal (24-40)</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                <span>Overload (&gt;40)</span>
              </span>
            </div>
          </div>

          {/* DYNAMIC SVG DISTRIBUTION GRAPH WITH SCROLLABLE MOBILE CANVAS */}
          <div className="h-72 bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-end">
            {/* GRID LINES AND JP VALUE LABELS */}
            <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between pointer-events-none py-10 px-4 z-0">
              <div className="border-b border-dashed border-slate-200 w-full text-[8px] font-bold text-slate-400 font-mono text-right pb-1">Max Jam (40 JP)</div>
              <div className="border-b border-dashed border-slate-200 w-full text-[8px] font-bold text-slate-400 font-mono text-right pb-1">Batas Sertifikasi (24 JP)</div>
              <div className="w-full text-[8px] font-bold text-slate-300 font-mono text-right">0 JP</div>
            </div>

            {/* SCROLLABLE BARS CONTAINER */}
            <div className="absolute inset-0 pt-10 pb-4 px-4 overflow-x-auto scrollbar-thin z-10">
              {filteredData.length > 0 ? (
                <div 
                  className="flex items-end gap-3 sm:gap-4 h-full"
                  style={{ 
                    minWidth: `${Math.max(450, Math.min(filteredData.length, 10) * 65)}px`,
                    width: '100%'
                  }}
                >
                  {filteredData.slice(0, 10).map((d) => {
                    const maxScale = 45;
                    const percentHeight = Math.min((d.total_jp_rencana / maxScale) * 100, 100);
                    const isKurang = d.total_jp_rencana < 24;
                    const isOver = d.total_jp_rencana > 40;
                    const barColor = isKurang ? 'bg-amber-500 hover:bg-amber-600' : isOver ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600';

                    return (
                      <div key={d.id} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                        {/* Tooltip on hover/touch */}
                        <div className="absolute bottom-full mb-2 bg-slate-950 text-white p-2.5 rounded-xl text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none min-w-[140px] shadow-xl text-center z-50 border border-slate-800">
                          <span className="block text-indigo-300 mb-0.5 truncate">{d.nama}</span>
                          <span className="block">Mengajar: {d.jp_rencana} JP</span>
                          {d.jp_ekuivalensi > 0 && <span className="block text-emerald-400 font-extrabold">Tugas: +{d.jp_ekuivalensi} JP</span>}
                          <span className="block border-t border-slate-800 mt-1 pt-1 text-[10px]">Total: {d.total_jp_rencana} JP</span>
                        </div>

                        {/* The Bar wrapper */}
                        <div className="w-full relative flex items-end justify-center rounded-t-xl bg-slate-200/60 h-[75%] overflow-hidden">
                          <div 
                            className={`w-full ${barColor} rounded-t-xl transition-all duration-500 flex items-center justify-center relative group-hover:brightness-105`} 
                            style={{ height: `${percentHeight}%` }}
                          >
                            <span className="text-[10px] font-black text-white select-none">
                              {d.total_jp_rencana}
                            </span>
                          </div>
                        </div>

                        {/* Name Label */}
                        <span className="text-[9px] font-extrabold text-slate-500 max-w-[65px] truncate text-center block">
                          {d.nama.split(',')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-bold text-xs gap-1.5 p-4">
                  <AlertCircle className="w-5 h-5 text-slate-300" />
                  Tidak ada guru yang sesuai kriteria pencarian.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ANALISIS KEBIJAKAN STANDAR (Col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Kriteria Kelayakan Sertifikasi</h3>
              <p className="text-[9px] text-slate-400 font-bold">Permendikbud No. 15 Tahun 2018</p>
            </div>
          </div>

          <div className="space-y-3 text-[11px] font-medium text-slate-600 leading-relaxed">
            <p>
              Berdasarkan peraturan resmi Republik Indonesia, guru wajib memenuhi beban kerja minimal **24 Jam Pelajaran (JP)** per minggu tatap muka untuk berhak mendapatkan tunjangan profesi (Sertifikasi/TPG).
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 text-xs block">Ekuivalensi Tugas Tambahan</strong>
                  <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                    Guru dengan tugas tambahan diakui memiliki ekuivalensi jam tambahan (contoh: Wali Kelas diakui setara +2 JP, Wakil Kepala Sekolah setara +12 JP).
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 text-[10px] leading-relaxed">
              <strong>Catatan Operator Sekolah:</strong> Pastikan Anda telah mengalokasikan &quot;Pengampu Mata Pelajaran&quot; dengan tepat terlebih dahulu di menu Pengampu, lalu tambahkan &quot;Tugas Tambahan&quot; di bawah ini untuk mensinkronisasi beban ekuivalensi.
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR DETIL BEBAN KERJA GURU */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* TABLE CONTROLS */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari guru berdasarkan nama / NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono hidden sm:inline">Status:</span>
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 text-[10px] font-extrabold w-full md:w-auto overflow-x-auto scrollbar-none whitespace-nowrap">
              <button
                onClick={() => setStatusFilter('semua')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'semua' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Semua ({stats.totalGuru})
              </button>
              <button
                onClick={() => setStatusFilter('kurang')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'kurang' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Kurang ({stats.kurang})
              </button>
              <button
                onClick={() => setStatusFilter('ideal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'ideal' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Ideal ({stats.ideal})
              </button>
              <button
                onClick={() => setStatusFilter('overload')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === 'overload' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Overload ({stats.overload})
              </button>
            </div>
          </div>
        </div>

        {/* THE MASTER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Guru / NIP</th>
                <th className="px-6 py-4 hidden md:table-cell">Jenis Kelamin</th>
                <th className="px-6 py-4 text-center">Beban Tatap Muka</th>
                <th className="px-6 py-4">Tugas Tambahan &amp; Ekuivalensi</th>
                <th className="px-6 py-4 text-center">Total Beban</th>
                <th className="px-6 py-4 text-center">Status BKG</th>
                <th className="px-6 py-4 text-center print:hidden hidden lg:table-cell">Kelayakan Sertifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
              {filteredData.map((d) => {
                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    {/* Guru Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-slate-900 text-xs font-black block">{d.nama}</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono block">NIP. {d.nip}</span>
                          <span className="text-[9px] text-slate-300 md:hidden">•</span>
                          <span className="text-[10px] text-slate-500 font-semibold md:hidden">{d.jenis_kelamin}</span>
                        </div>
                        {/* Mobile-only certification eligibility badge */}
                        <div className="lg:hidden mt-1">
                          {d.layak_sertifikasi ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/75">
                              <UserCheck className="w-3 h-3 shrink-0" /> Layak Sertifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-50 text-slate-400 border border-slate-200">
                              <UserX className="w-3 h-3 shrink-0" /> Belum Layak
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Jenis Kelamin */}
                    <td className="px-6 py-4 text-slate-500 font-semibold hidden md:table-cell">{d.jenis_kelamin}</td>

                    {/* Beban Tatap Muka */}
                    <td className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-800">{d.jp_rencana} JP</div>
                        <div className="text-[9px] text-slate-400 font-semibold">
                          Aktual Terplot: {d.jp_aktual} JP
                        </div>
                      </div>
                    </td>

                    {/* Tugas Tambahan & Ekuivalensi */}
                    <td className="px-6 py-4 min-w-[280px]">
                      {/* Interactive selector for Tugas Tambahan */}
                      <div className="space-y-2 print:hidden">
                        {/* List of active tugas tambahan */}
                        {d.listTugas.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {d.listTugas.map(t => (
                              <span 
                                key={t.id} 
                                className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg shadow-2xs"
                              >
                                {t.nama} (+{t.ekuivalensi_jp} JP)
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTugasTambahan(d.id, t.id)}
                                  className="text-indigo-400 hover:text-rose-600 transition ml-0.5 font-bold cursor-pointer"
                                  title="Hapus Tugas Tambahan"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium italic block">
                            Tidak memiliki tugas tambahan
                          </span>
                        )}

                        {/* Add selector */}
                        <div className="flex items-center gap-1">
                          <select
                            onChange={(e) => {
                              handleAddTugasTambahan(d.id, e.target.value);
                              e.target.value = ''; // Reset selector
                            }}
                            defaultValue=""
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="" disabled>+ Tambah Tugas Tambahan</option>
                            {PILIHAN_TUGAS_TAMBAHAN.filter(option => !(guruTugasTambahan[d.id] || []).includes(option.id)).map(option => (
                              <option key={option.id} value={option.id}>
                                {option.nama} (+{option.ekuivalensi_jp} JP)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Static print representation */}
                      <div className="hidden print:block">
                        {d.listTugas.length > 0 ? (
                          <span className="text-slate-800 font-semibold">
                            {d.listTugas.map(t => `${t.nama} (+${t.ekuivalensi_jp} JP)`).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Total JP Beban */}
                    <td className="px-6 py-4 text-center">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-slate-900 block">{d.total_jp_rencana} JP</span>
                        {d.jp_ekuivalensi > 0 && (
                          <span className="text-[9px] text-emerald-600 font-extrabold block">
                            (Inc. +{d.jp_ekuivalensi} JP Tugas)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status BKG */}
                    <td className="px-6 py-4 text-center">
                      {d.status === 'kurang' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-50 border border-amber-200 text-amber-700">
                          <TrendingDown className="w-3 h-3" /> Kurang
                        </span>
                      ) : d.status === 'ideal' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Ideal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-50 border border-rose-200 text-rose-700">
                          <TrendingUp className="w-3 h-3" /> Overload
                        </span>
                      )}
                    </td>

                    {/* Kelayakan Sertifikasi */}
                    <td className="px-6 py-4 text-center print:hidden hidden lg:table-cell">
                      {d.layak_sertifikasi ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <UserCheck className="w-3.5 h-3.5" /> Layak Sertifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                          <UserX className="w-3.5 h-3.5" /> Belum Layak
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold italic">
                    Belum ada data guru atau pencarian tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANDUAN MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-xs font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-950">Panduan Standar Beban Kerja Guru (BKG)</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-600 font-medium leading-relaxed">
              <p>
                Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen serta Peraturan Menteri Pendidikan dan Kebudayaan Republik Indonesia menetapkan aturan ketat terkait beban kerja pendidik:
              </p>

              <div className="space-y-2 border-l-2 border-indigo-500 pl-3">
                <div>
                  <strong className="text-slate-800 block">1. Beban Mengajar Minimal (24 JP):</strong>
                  <span>Wajib bertatap muka di kelas minimal 24 Jam Pelajaran (JP) per minggu untuk pencairan Tunjangan Profesi Guru (TPG/Sertifikasi).</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">2. Batas Beban Maksimal (40 JP):</strong>
                  <span>Untuk memastikan efektivitas belajar-mengajar dan kebugaran guru, batas maksimum kumulatif adalah 40 JP per minggu.</span>
                </div>
                <div>
                  <strong className="text-slate-800 block">3. Ekuivalensi Jam Mengajar:</strong>
                  <span>Tugas tambahan khusus pimpinan diakui setara dengan jumlah jam tertentu untuk mengurangi porsi tatap muka.</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <h4 className="font-extrabold text-slate-800 mb-1">Daftar Ekuivalensi Resmi:</h4>
                <ul className="list-disc pl-4 text-[10px] space-y-1 text-slate-500 font-semibold">
                  <li>Wakil Kepala Sekolah: ekuivalen 12 JP</li>
                  <li>Kepala Laboratorium / Perpustakaan / Bengkel: ekuivalen 12 JP</li>
                  <li>Wali Kelas: ekuivalen 2 JP</li>
                  <li>Pembina Ekstrakurikuler: ekuivalen 2 JP</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg transition shadow-xs cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

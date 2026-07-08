'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Layers, 
  Clock, 
  Settings, 
  Play, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  CloudUpload, 
  Sparkles,
  ArrowRight,
  Info,
  Compass,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface TutorialTabProps {
  setActiveTab: (tab: string) => void;
  isSupabaseActive?: boolean;
}

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tabKey: string;
  badge: string;
  details: string[];
  tips: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'dasar' | 'algoritma' | 'cloud' | 'ekspor';
}

export default function TutorialTab({ setActiveTab, isSupabaseActive = true }: TutorialTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState<'semua' | 'dasar' | 'algoritma' | 'cloud' | 'ekspor'>('semua');

  const steps: Step[] = [
    {
      number: 1,
      title: 'Kalender & Jam Kerja',
      description: 'Konfigurasikan hari aktif sekolah serta slot jam pelajaran per hari.',
      icon: <Settings className="w-5 h-5 text-indigo-600" />,
      tabKey: 'pengaturan_waktu',
      badge: 'Langkah Dasar',
      details: [
        'Tentukan hari-hari aktif kegiatan belajar mengajar (misal: Senin - Jumat).',
        'Atur batas maksimum jam pelajaran (JP) dalam satu hari (misal: 10 JP).',
        'Sesuaikan durasi per JP serta waktu istirahat agar jadwal sinkron secara riil.'
      ],
      tips: 'Langkah ini sangat penting karena batas jam harian akan menjadi acuan kapasitas ruang belajar.'
    },
    {
      number: 2,
      title: 'Data Guru & Preferensi',
      description: 'Daftarkan nama-nama guru pengajar beserta inisial singkat & hari berhalangan mengajar.',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      tabKey: 'guru',
      badge: 'Data Utama',
      details: [
        'Tambahkan guru baru lengkap dengan nama dan inisial kode guru (misal: "Anto" -> "ANT").',
        'Gunakan fitur "Ubah Preferensi" untuk menandai hari berhalangan mengajar guru.',
        'Sistem otomatis akan menjamin guru tersebut tidak akan dijadwalkan pada hari berhalangan tersebut.'
      ],
      tips: 'Bagi guru terbang (mengajar di sekolah lain), kunci hari di mana mereka berhalangan sebelum men-generate.'
    },
    {
      number: 3,
      title: 'Data Mata Pelajaran',
      description: 'Lengkapi daftar mata pelajaran wajib maupun muatan lokal yang diajarkan.',
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
      tabKey: 'mapel',
      badge: 'Data Utama',
      details: [
        'Tambahkan mata pelajaran satu per satu atau gunakan preset standar Kurikulum Merdeka.',
        'Sertakan kode mata pelajaran yang unik untuk mempermudah identifikasi.',
        'Kelompokkan jenis mata pelajaran (umum, kejuruan, atau praktik).'
      ],
      tips: 'Manfaatkan fitur "Impor Preset Kurikulum Merdeka" untuk menghemat waktu input manual.'
    },
    {
      number: 4,
      title: 'Data Kelas & Ruangan',
      description: 'Definisikan seluruh kelas belajar serta ruang kelas atau laboratorium.',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      tabKey: 'kelas',
      badge: 'Data Utama',
      details: [
        'Daftarkan nama kelas secara berurutan (misal: X-A, X-B, XI-MIPA).',
        'Tambahkan ruangan teori dan ruangan laboratorium khusus praktik.',
        'Dukungan multi-jurusan / multi-tingkat secara terstruktur.'
      ],
      tips: 'Menentukan ruangan membantu sistem mengalokasikan ruang belajar yang spesifik demi menghindari bentrok pemakaian laboratorium.'
    },
    {
      number: 5,
      title: 'Tugas Pengampu Pelajaran',
      description: 'Hubungkan Guru dengan Mata Pelajaran, Kelas, dan jumlah Jam Pelajaran (JP).',
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      tabKey: 'pengampu',
      badge: 'Kunci Utama',
      details: [
        'Tentukan guru mana yang mengajar mata pelajaran apa, di kelas berapa.',
        'Isi jumlah alokasi jam pelajaran (JP) per minggu (misal: Matematika wajib 4 JP/minggu).',
        'Sistem otomatis melacak total beban mengajar guru (kumulatif JP) secara real-time.'
      ],
      tips: 'Pastikan total JP seluruh pengampu tidak melebihi kapasitas jam kalender sekolah yang sudah diatur pada Langkah 1.'
    },
    {
      number: 6,
      title: 'Otomatisasi Penjadwalan',
      description: 'Jalankan Kecerdasan Buatan (Genetika) untuk menyusun jadwal instan tanpa bentrok.',
      icon: <Play className="w-5 h-5 text-indigo-600 animate-pulse" />,
      tabKey: 'generate',
      badge: 'Eksekusi Cerdas',
      details: [
        'Buka tab "Mulai Otomatisasi".',
        'Pilih opsi algoritma yang diinginkan (Genetic Algorithm Core).',
        'Klik tombol "Mulai Otomatisasi". Dalam beberapa detik, sistem akan menghitung kombinasi terbaik dengan skor konflik terkecil atau nol!'
      ],
      tips: 'Jika persentase plotting belum 100%, periksa kembali apakah beban mengajar di pengampu melebihi total slot hari kerja Anda.'
    },
    {
      number: 7,
      title: 'Visualisasi & Ekspor Akhir',
      description: 'Tinjau jadwal dalam bentuk matriks interaktif, simpan ke cloud, ekspor Excel atau PDF.',
      icon: <CloudUpload className="w-5 h-5 text-indigo-600" />,
      tabKey: 'grid',
      badge: 'Publikasi',
      details: [
        'Gunakan filter pencarian (berdasarkan Kelas, Guru, atau Ruangan) pada tabel kisi jadwal.',
        'Klik tombol "Simpan ke Cloud" agar seluruh rekan guru dapat mengakses jadwal riil.',
        'Unduh file format Excel (.csv) atau cetak PDF dengan tata letak profesional siap pasang.'
      ],
      tips: 'Gunakan fitur drag & drop langsung di tabel grid jika Anda ingin melakukan penyesuaian personal paska generate otomatis.'
    }
  ];

  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      category: 'dasar',
      question: 'Bagaimana cara memulai membuat jadwal baru dari awal?',
      answer: 'Untuk memulai, pastikan Anda masuk ke tab "Profil & Logo Sekolah" dan "Pengaturan Kalender & Jam" terlebih dahulu untuk menentukan dasar jam kerja Anda. Setelah itu, tambahkan Guru, Mata Pelajaran, dan Kelas. Terakhir, hubungkan semuanya di tab "Pengampu Pelajaran" sebelum masuk ke menu otomatisasi.'
    },
    {
      id: 'faq-2',
      category: 'algoritma',
      question: 'Bagaimana cara sistem mengunci agar Guru tidak mengajar di waktu tertentu?',
      answer: 'Setiap guru memiliki preferensi sendiri. Masuk ke menu "Guru & Preferensi", pilih salah satu guru, lalu klik tombol "Ubah Preferensi". Di sana, Anda dapat mencentang hari berhalangan mengajar (misalnya karena mengajar di sekolah lain atau hari libur dinas). Algoritma genetika kami secara otomatis akan melompati slot hari tersebut.'
    },
    {
      id: 'faq-3',
      category: 'algoritma',
      question: 'Mengapa hasil otomatisasi tidak mencapai 100% pelajaran terplot?',
      answer: 'Hal ini biasanya disebabkan oleh "Beban Berlebih" (Overload). Artinya, total akumulasi jam pelajaran (JP) yang Anda masukkan di menu "Pengampu" melampaui jumlah total slot waktu belajar yang tersedia (Jumlah Hari Aktif dikali Jam Pelajaran Harian). Solusinya, silakan kurangi JP pengampu atau tambah slot jam harian Anda di menu Pengaturan Kalender.'
    },
    {
      id: 'faq-4',
      category: 'cloud',
      question: 'Apa perbedaan Mode Sandbox (Simulasi) dengan Mode Riil Supabase Cloud?',
      answer: 'Mode Sandbox/Simulasi diisi secara otomatis dengan data sekolah fiktif (SMAN 1 AI) agar Anda dapat menguji seluruh alur kerja sistem tanpa mengetik apa pun. Mode Riil Supabase Cloud menghubungkan sistem langsung dengan database cloud pribadi Anda, di mana data sekolah Anda akan tersimpan abadi secara terpusat, aman, dan dapat disinkronkan langsung di antara admin sekolah.'
    },
    {
      id: 'faq-5',
      category: 'ekspor',
      question: 'Apakah file Excel yang diunduh berformat CSV?',
      answer: 'Benar, sistem mengekspor data jadwal induk dan tampilan saringan aktif dalam format file Excel berstandar CSV (Comma Separated Values) dengan pemisah koma atau titik koma yang kompatibel dengan Microsoft Excel, Google Sheets, maupun sistem akademis eksternal (Dapodik).'
    },
    {
      id: 'faq-6',
      category: 'algoritma',
      question: 'Bagaimana jika saya ingin mengubah satu atau dua jam pelajaran secara manual?',
      answer: 'Sangat mudah! Anda hanya perlu berpindah ke tab "Kisi Jadwal (Matriks)". Di sana, Anda bisa menghapus slot pelajaran secara langsung dengan menekan tombol silang merah di dalam sel, lalu melakukan penyesuaian manual sesuai kebutuhan tanpa perlu mengulang generate dari nol.'
    },
    {
      id: 'faq-7',
      category: 'cloud',
      question: 'Mengapa saya melihat peringatan "Perubahan Data Belum Disimpan ke Cloud"?',
      answer: 'Aplikasi ini memiliki fitur perlindungan data ganda. Ketika Anda menambah atau mengedit guru, mapel, kelas, atau pengampu, data tersebut langsung disimpan di memori lokal browser Anda (sangat aman). Namun, untuk menyingkronkannya dengan database server Supabase Anda agar tersimpan permanen di cloud, Anda harus menekan tombol hijau "Simpan ke Cloud" di bilah atas.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = faqCategory === 'semua' || faq.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-16 animate-fade-in" id="tutorial-faq-root">
      
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Pusat Panduan &amp; Bantuan
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Panduan Lengkap Penyusunan Jadwal Anti Bentrok
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Selamat datang di Pusat Bantuan Jadwalify! Pelajari langkah demi langkah mendasar untuk menyusun jadwal pelajaran sekolah Anda secara otomatis menggunakan kecerdasan buatan genetika anti-bentrok secara instan.
          </p>
        </div>
      </div>

      {/* STEP BY STEP TIMELINE WORKFLOW */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" /> Alur Kerja Penyusunan Jadwal
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Ikuti 7 langkah standar ini untuk hasil penyusunan jadwal bebas bentrok 100%.</p>
          </div>
          
          <div className="flex bg-slate-100/80 border border-slate-200/60 p-1 rounded-xl text-xs overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => setActiveStep(s.number)}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${activeStep === s.number ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ke-{s.number}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Timeline Left: 1-7 Lists */}
          <div className="lg:col-span-5 space-y-3 max-h-[480px] overflow-y-auto pr-2 no-scrollbar">
            {steps.map((step) => {
              const isSelected = activeStep === step.number;
              return (
                <div 
                  key={step.number}
                  onClick={() => setActiveStep(step.number)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-4 text-left select-none ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-100 shadow-xs' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {step.number}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{step.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Right: Detailed Step Box */}
          <div className="lg:col-span-7 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-6">
            <AnimatePresence mode="wait">
              {steps.map((step) => {
                if (step.number !== activeStep) return null;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 shadow-xs">
                          {step.icon}
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Langkah {step.number} dari 7</span>
                          <h3 className="text-base font-extrabold text-slate-900">{step.title}</h3>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab(step.tabKey)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Buka Menu <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 p-3 rounded-xl shadow-2xs">
                      {step.description}
                    </p>

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-900">Detail Yang Perlu Dikerjakan:</h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PRO TIPS PANEL */}
                    <div className="bg-amber-50/50 border border-amber-200/40 rounded-xl p-3.5 flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Tips Profesional:</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{step.tips}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="space-y-6">
        
        {/* FAQ HEADER AND CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" /> Pertanyaan Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Temukan jawaban cepat atas kendala teknis dan cara penanganan bentrok jadwal.</p>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Cari pertanyaan atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 shadow-xs hover:border-slate-300 transition-colors"
            />
          </div>
        </div>

        {/* CATEGORY SWITCHER */}
        <div className="flex bg-slate-100 border border-slate-200/50 p-1 rounded-xl text-xs w-full sm:w-auto self-start overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
          <button 
            onClick={() => setFaqCategory('semua')}
            className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${faqCategory === 'semua' ? 'bg-white text-indigo-700 border border-slate-200/50 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Semua Topik
          </button>
          <button 
            onClick={() => setFaqCategory('dasar')}
            className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${faqCategory === 'dasar' ? 'bg-white text-indigo-700 border border-slate-200/50 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Dasar Penggunaan
          </button>
          <button 
            onClick={() => setFaqCategory('algoritma')}
            className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${faqCategory === 'algoritma' ? 'bg-white text-indigo-700 border border-slate-200/50 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Algoritma &amp; Bentrok
          </button>
          <button 
            onClick={() => setFaqCategory('cloud')}
            className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${faqCategory === 'cloud' ? 'bg-white text-indigo-700 border border-slate-200/50 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Cloud Database
          </button>
          <button 
            onClick={() => setFaqCategory('ekspor')}
            className={`px-4 py-1.5 rounded-lg transition font-bold cursor-pointer ${faqCategory === 'ekspor' ? 'bg-white text-indigo-700 border border-slate-200/50 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Ekspor &amp; Cetak
          </button>
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <motion.div 
                    layout
                    key={faq.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-start"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-slate-800 text-xs sm:text-xs cursor-pointer select-none"
                    >
                      <span className="leading-relaxed">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-[11px] leading-relaxed text-slate-500 border-t border-slate-50 font-medium">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-2 py-12 text-center space-y-3 bg-white border border-dashed border-slate-200 rounded-2xl">
                <div className="bg-slate-50 p-3 rounded-full w-fit mx-auto border border-slate-100 text-slate-400">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800">Pertanyaan Tidak Ditemukan</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Silakan gunakan kata kunci pencarian atau kategori filter lainnya.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

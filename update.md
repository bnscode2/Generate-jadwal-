# Log Pembaruan Sistem - Jadwalify

## [09 Juli 2026 - Aturan Lisensi PRO 1 Tahun & Tampilan Indigo Gelap Premium]
### Perubahan Antarmuka & UX (Frontend):
- **Skema Lisensi Baru (Masa Aktif 1 Tahun)**: Memperbarui ketentuan lisensi PRO dari seumur hidup (lifetime) menjadi masa aktif 1 tahun (365 hari) penuh untuk mendukung keberlanjutan lisensi tahunan sekolah.
- **Indikator Masa Aktif Real-Time**: Menyediakan modul countdown real-time yang menghitung secara presisi sisa hari, jam, menit, dan detik masa aktif lisensi PRO pengguna secara live dengan efek pulse hijau yang dinamis.
- **Visual Premium Indigo Gelap (Deep Navy/Indigo)**: Mengubah warna background utama section dari hitam murni (`bg-[#050505]`) menjadi warna indigo gelap berkelas (`bg-[#0c0a21]`) yang lebih elegan dan serasi dengan gradien cahaya.
- **Pembaruan Daftar Fitur PRO Terkini**: Menambahkan informasi terbaru seputar keunggulan fitur PRO, termasuk dukungan "Penyimpanan Multi-Versi & Cloud Draft" serta optimasi algoritma genetika tanpa batas.

### Perubahan Database & Logika Sinkronisasi (Backend):
- **FAQ Lisensi Terkini**: Memperbaharui informasi Frequently Asked Questions (FAQ) mengenai masa berlaku lisensi selama 1 tahun, cara perpanjangan, serta keamanan pembayaran QRIS yang instan.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Penyimpanan Multi-Versi & Cloud Sync Khusus Akun PRO]
### Perubahan Antarmuka & UX (Frontend):
- **Tampilan Terkunci Premium (Lock Overlay)**: Menambahkan overlay premium interaktif yang mengaburkan, menonaktifkan, dan melock fitur Multi-Versi di tab **Penyimpanan Versi** untuk pengguna trial/free, lengkap dengan penjelasan detail benefit dan ajakan aktivasi lisensi PRO.
- **Sinkronisasi Instan Latar Belakang**: Ketika akun PRO membuat draf versi baru, mengubah nama/deskripsi, atau menghapus draf di tab Penyimpanan Versi, draf tersebut secara otomatis diselaraskan langsung ke database cloud Supabase di latar belakang dengan indikasi status visual yang aman.

### Perubahan Database & Logika Sinkronisasi (Backend):
- **Skema Database Baru**: Menambahkan rancangan tabel `schedule_versions` di `/schema.sql` dan `/lib/database-schema.ts` lengkap dengan pengamanan baris data (Row Level Security - RLS) agar data versi draf terisolasi aman per pengguna (`user_id`).
- **Integrasi Penuh Sync Service**: Mengintegrasikan `schedule_versions` ke dalam alur unggah (`pushAll`) dan unduh (`pullAll`) di `SupabaseSyncService` (`/lib/supabaseSync.ts`). Menambahkan metode kustom `syncVersion` untuk mendukung update real-time dinamis.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Tampilan Detail Informasi Konflik pada Dialog Atur Jadwal Manual]
### Perubahan Antarmuka & UX (Frontend):
- **Integrasi Panel Informasi Konflik**: Menambahkan panel pendeteksi konflik khusus di bagian paling atas dialog **Atur Jadwal Manual** ketika pengguna mengeklik sel jadwal yang memiliki status bentrok (*Konflik Aktif*).
- **Detail Lebih Informatif**: Panel menampilkan daftar lengkap seluruh konflik yang terjadi pada slot (Hari & Jam Pelajaran) tersebut, termasuk tipe konflik (guru bentrok, kelas bentrok, ruangan bentrok, dll.), penjelasan deskripsi bentrok, serta tag entitas-entitas yang terlibat.

### Perubahan Backend & Logika Sistem (Backend):
- **Penyaringan Konflik Berdasarkan Sel**: Mengimplementasikan logika penyaringan dinamis `activeCellConflicts` yang mencocokkan hari dan jam pelajaran dari sel yang sedang diinteraksi oleh pengguna dengan repositori konflik global.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Cetak PDF & Impor Cadangan Khusus Akun PRO]
### Perubahan Antarmuka & UX (Frontend):
- **Kunci Fitur Cetak PDF Profesional**: Membatasi fitur "Cetak PDF Profesional" di Tab Grid dan "Cetak Laporan" di Tab Beban Kerja agar hanya dapat diakses oleh pengguna berstatus **PRO**. Pada akun FREE/TRIAL, tombol ini akan ditampilkan dengan lencana visual `PRO` berwarna indigo, status dinonaktifkan (*disabled*), dan instruksi *tooltip* yang ramah.
- **Kunci Fitur Impor Cadangan (Upload Payload)**: Membatasi tombol "Impor Cadangan" (Unggah payload sistem JSON) di Dashboard Ringkasan agar hanya dapat dijalankan oleh pemegang akun **PRO**. Dilengkapi dengan proteksi preventif saat pemilihan file agar data cadangan tidak dapat diimpor tanpa lisensi yang sesuai.

### Perubahan Backend & Logika Sistem (Backend):
- **Proteksi Event Handler**: Memasang pengaman ganda pada fungsi `handlePrintPDF` di `app/page.tsx` dan `handleImportBackup` di `DashboardTab.tsx` untuk membatalkan eksekusi cetak / pembacaan berkas secara instan apabila status `is_pro` bernilai salah.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Preferensi Belajar Kelas (Max Jam Pelajaran & Hari vs Jam Blokir) & Edit Nama Kelas]
### Perubahan Antarmuka & UX (Frontend):
- **Fitur Preferensi Kelas Interaktif**: Menambahkan modal kustom **Konstruksi Aturan Preferensi Kelas** yang dipicu melalui tombol pengaturan di samping setiap baris kelas. Modal ini menyediakan:
  - Selektor batas maksimal jam belajar harian kelas (pilihan jam pelajaran ke-X).
  - Grid matriks interaktif (Hari vs Jam Pelajaran) dengan lencana toggle centang hijau (aktif) dan silang merah (blokir) yang meniru persis preferensi guru, memberikan kontrol penuh untuk meliburkan kelas pada slot-slot spesifik.
- **Tombol Edit Nama & Detail Kelas**: Menambahkan tombol edit nama kelas (ikon pensil) pada tabel kelas. Tombol ini secara dinamis mengubah formulir pendaftaran kelas di sisi kiri menjadi formulir edit beranimasi, mendukung pembaharuan nama kelas, tingkat kurikulum, dan wali kelas secara seamless.

### Perubahan Database & Algoritma Penjadwalan (Backend):
- **Aturan Batasan Kelas Dinamis**: Mendefinisikan tipe data `PreferensiKelas` di `types.ts` dan menambahkan metode penyimpanan/pemuatan mandiri di `LocalDB` (`lib/db.ts`).
- **Integrasi Mesin Solver**: Memperbarui logika backtracking CSP (`solveCSP` & `solveRelaxedCSP`) dan algoritma genetika (`solveGenetic`) di `lib/scheduler.ts` agar memperhitungkan batas jam belajar dan slot berhalangan kelas sebagai batasan keras (*hard constraints*).
- **Deteksi Konflik Otomatis**: Memperbarui `recalculateConflicts` di `lib/db.ts` untuk mendaftarkan bentrok ketersediaan kelas dan kelebihan jam belajar ke dalam daftar konflik jadwal.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Penyaringan & Pengabaian Bentrok Ruangan Secara Menyeluruh]
### Perubahan Alur Kerja & Sistem Validasi:
- **Penyaringan Bentrok Ruangan Real-Time**: Menyinkronkan variabel status preferensi `ignoreRoomConflicts` (Abaikan Bentrok Ruangan) secara global ke seluruh dashboard, tab diagnosa, indikator tab samping, serta kisi kalender jadwal.
- **Penyembunyian Peringatan Bentrok Ruangan Dinamis**: Ketika opsi "Abaikan Bentrok Ruangan" diaktifkan (bawaan sistem: `true`), semua peringatan bertipe `ruangan_bentrok` akan disaring keluar dari UI secara cerdas. Hal ini memastikan bahwa sekolah-sekolah di Indonesia yang menganut sistem **Kelas Tetap/Stasioner** tidak lagi dibingungkan oleh indikator konflik merah yang sebenarnya tidak relevan bagi model operasional mereka, sehingga fokus analisis bergeser sepenuhnya pada bentrokan jadwal guru yang kritis.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Opsi Pengabaian Bentrok Ruangan Dinamis (Sistem Kelas Tetap)]
### Perubahan Frontend & UX:
- **Checkbox Abaikan Bentrok Ruangan**: Menambahkan opsi toggle interaktif "Abaikan Bentrok Ruangan" pada modal penambahan jadwal manual di tab Kisi Jadwal (`/components/GridTab.tsx`). Opsi ini diaktifkan secara default (`true`) untuk menyelaraskan dengan sistem operasional sekolah di Indonesia yang mayoritas menggunakan pola **Kelas Tetap/Stasioner** (di mana siswa menetap di kelas masing-masing dan guru yang bergerak, sehingga bentrok ruang tidak relevan).
- **Validasi Kondisional Cerdas**: Mengonfigurasi logika simpan jadwal manual agar melewati atau melewatkan pemeriksaan bentrok ruang saat opsi pengabaian dicentang, sementara pemeriksaan bentrok jadwal guru dan bentrok jadwal kelas tetap berjalan secara ketat demi keakuratan mutlak.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Fitur Penjadwalan Manual Beruntun (Multi-Slot JP) & Validasi Konflik Ketat]
### Perubahan Frontend & UX:
- **Selektor Durasi Berurutan (Multi-Slot JP)**: Menambahkan kontrol drop-down interaktif "Durasi / Jumlah JP" pada modal penambahan jadwal manual di tab Kisi Jadwal (`/components/GridTab.tsx`). Fitur ini memungkinkan guru atau admin untuk memasukkan alokasi jam pelajaran (misal 2 JP atau lebih) secara berurutan dalam satu tindakan klik saja.
- **Batasan Durasi Dinamis**: Sistem secara pintar menghitung batas maksimum slot berurutan yang diperbolehkan berdasarkan sisa jam alokasi mengajar pengampu (*unfulfilled quota*) dan sisa period/jam pelajaran yang tersedia sebelum akhir hari sekolah, mencegah pengisian berlebih secara otomatis.
- **Validasi Konflik Ketat & Pencegahan Bentrok**: Mengganti sistem konfirmasi toleransi konvensional dengan validasi pencegahan tabrakan jadwal yang sangat disiplin. Jika ada bagian dari slot berurutan tersebut yang bentrok dengan jadwal guru lain, kelas lain, atau ruangan lain, sistem akan memblokir penyimpanan, menampilkan detail bentrok per-jam pelajaran secara spesifik, dan memaksa pengguna untuk memilih alternatif lain yang bebas bentrok.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Penyempurnaan Pencarian Jadwal Parsial (Cerdas & Iteratif) & Tips Diagnostik Guru]
### Perubahan Algoritma Penjadwalan:
- **Metode Skip Cerdas (Smart Skip Heuristic)**: Menyempurnakan mesin backtracking `solveCSP` di `/lib/scheduler.ts` agar tidak mudah menyerah atau menghasilkan jadwal yang kosong. Saat `allowPartial` aktif, jika sistem mendeteksi slot buntu (*conflict bottleneck*) pada suatu mata pelajaran, sistem akan secara cerdas melompati (*skip*) mata pelajaran bermasalah tersebut daripada melakukan pembatalan (*unassign*) besar-besaran, lalu melanjutkan pengisian mata pelajaran lainnya secara maksimal.
- **Peningkatan Kapasitas Eksplorasi (Max 500k Steps & Time Guard)**: Meningkatkan batas langkah eksplorasi backtracking dari 25.000 menjadi 500.000 langkah, dikombinasikan dengan pembatas waktu dinamis maksimal 4,5 detik. Ini memberi mesin kesempatan mencari kombinasi grid yang jauh lebih padat dan penuh tanpa mengorbankan performa UI (karena berjalan di Web Worker).

### Perubahan Frontend & UX:
- **Sistem Tips & Diagnostik Terberat**: Menambahkan algoritma kalkulasi "Skor Batasan Guru" di `/components/GenerateTab.tsx` yang secara otomatis menganalisis preferensi seluruh guru. Jika jadwal yang dihasilkan berstatus parsial (< 100%), sistem akan mendiagnosis dan merekomendasikan top 3 guru dengan batasan libur/jam paling ketat yang memblokir pembuatan jadwal, lengkap dengan rincian jam beban kerja dan alasannya.
- **Pemberian Properti Terkait**: Menghubungkan state `preferensi` dari `/app/page.tsx` ke dalam panel `<GenerateTab />`.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Fitur Abaikan Bentrok Ruangan (Optional Classroom & Ignore Room Conflicts)]
### Perubahan Algoritma Penjadwalan & Backend:
- **Parameter Abaikan Bentrok Ruangan**: Menambahkan parameter `ignoreRoomConflicts` (nilai bawaan: `true`) pada fungsi `solveCSP`, `solveRelaxedCSP`, dan `solveGenetic` di dalam berkas `/lib/scheduler.ts`.
- **Bypass Hambatan Ruangan**: Memodifikasi aturan pemeriksaan keras (*hard constraint*) agar pemeriksaan bentrok penggunaan ruangan (`roomUsage` / `roomSet` / `roomActiveSlots`) dapat diabaikan jika parameter `ignoreRoomConflicts` aktif. Hal ini mencegah kegagalan penyusunan jadwal yang disebabkan oleh keterbatasan ruangan.
- **Penyelarasan Web Worker**: Memperbarui `/lib/scheduler.worker.ts` agar dapat mendestrukturisasi properti `ignoreRoomConflicts` dari muatan pesan dan meneruskannya ke mesin penjadwalan.

### Perubahan Frontend & UX:
- **Selektor Opsi Ruangan Opsional**: Mengintegrasikan panel opsi interaktif kustom dengan kotak centang (*checkbox*) emerald di dalam tab Penyusun Otomatis (`/components/GenerateTab.tsx`) untuk mengaktifkan atau menonaktifkan Mode Abaikan Bentrok Ruangan secara fleksibel.
- **Penempatan Ruangan Otomatis**: Jika opsi ini aktif (direkomendasikan), sistem akan langsung memplot mata pelajaran pada ruang kelas yang bersangkutan (misal Kelas 7A langsung ditempatkan di Ruangan Kelas 7A) secara paralel tanpa memicu peringatan bentrok ("merah") atau kegagalan pencarian solusi.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Fitur Penyusunan Jadwal Pelajaran Parsial Best-Effort (CSP)]
### Perubahan Algoritma Penjadwalan & Backend:
- **Penyusunan Jadwal Parsial (Best-Effort CSP)**: Menyempurnakan mesin solver backtracking di `solveCSP` (`/lib/scheduler.ts`) untuk melacak dan mendokumentasikan keadaan pemetaan terbaik (`bestAssignmentMap`) yang sepenuhnya bebas dari bentrokan. Jika kombinasi sempurna 100% tidak ditemukan karena batasan yang terlalu padat, sistem tidak lagi memaksa fallback bentrok, melainkan mengembalikan hasil optimal dari keadaan parsial terbaik tersebut.
- **Dukungan Asynchronous Web Worker**: Memperbarui `/lib/scheduler.worker.ts` untuk memproses parameter `allowPartial` dan meneruskannya ke mesin kalkulasi scheduler.

### Perubahan Frontend & UX:
- **Selektor Kontrol Jadwal Parsial**: Menambahkan panel opsi interaktif kustom dengan kotak centang (*checkbox*) di dalam tab Penyusun Otomatis (`/components/GenerateTab.tsx`) untuk mengaktifkan atau menonaktifkan Mode Jadwal Parsial secara dinamis.
- **Sinergi Alur Pengisian Semi-Manual**: Memungkinkan guru atau admin untuk mendapatkan jadwal awal yang mematuhi preferensi guru terberat secara instan tanpa bentrok, lalu dengan mudah mengisi sisa slot kosong secara manual melalui grid interaktif di tab Kisi Jadwal (`/components/GridTab.tsx`).
- **Dashboard Statistik Responsif**: Memperbarui presentase capaian plotting pada metrik laporan hasil agar secara akurat merepresentasikan jumlah jam yang berhasil terplot (misal: "84 / 120 JP").

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [09 Juli 2026 - Perbaikan Bug Preferensi Slot Berhalangan Khusus Guru (Slot Jam & Hari Spesifik)]
### Perubahan Database & Backend (Supabase):
- **Penambahan Kolom Database**: Menambahkan kolom `slot_tidak_bersedia` bertipe `JSONB` dengan nilai bawaan `'[]'::jsonb` ke dalam skema tabel `public.teacher_preferences` di file `/schema.sql` and `/scheme.sql`.
- **Penyelarasan Sinkronisasi Cloud**: Memperbarui `/lib/supabaseSync.ts` agar menyertakan data array `slot_tidak_bersedia` saat melakukan sinkronisasi preferensi guru baik melalui sinkronisasi massal (`mappedPreferences`), pemuatan data dari cloud (`localPreferences`), maupun sinkronisasi instan per-item (`syncPreference`).

### Perubahan Frontend & UX:
- **Penyimpanan Matang & Konsisten**: Memastikan preferensi halangan khusus guru (blokir slot hari dan jam pelajaran spesifik) yang dikonfigurasi lewat modal di tab Guru (`/components/GuruTab.tsx`) berhasil tersimpan secara permanen di LocalStorage maupun Cloud Supabase, tanpa terhapus atau kembali ke draf kosong saat sinkronisasi ulang dilakukan.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Resolusi Bug `schedules_pkey` Duplikat (User-Scoped Deterministic Salt Hashing)]
### Perubahan Database & Backend (Supabase):
- **Isolasi UUID Antar Pengguna**: Menyempurnakan mekanisme pemetaan ID lokal ke UUID di `IDMapper.getUUID` (`/lib/supabaseSync.ts`). Sekarang, sistem menyuntikkan `username` pengguna yang aktif sebagai **salt utama** dalam algoritma hashing deterministik (`usr_${username}_`).
- **Pencegahan Kegagalan `schedules_pkey`**: Memastikan draf jadwal pelajaran (`schedules`), guru (`teachers`), mata pelajaran (`subjects`), kelas (`classes`), dll. yang berasal dari template awal lokal yang sama tidak akan lagi menghasilkan UUID yang bertabrakan di antara pengguna yang berbeda di satu database Supabase cloud yang sama.
- **Standar Multi-Tenant yang Aman**: Mematuhi kaidah isolasi data multi-tenant dengan tetap mempertahankan satu database fisik terbagi dengan pengamanan ketat lewat Row Level Security (RLS).

### Perubahan Frontend & UX:
- **Pesan Edukasi Sinkronisasi**: Memperkuat penanganan error dan konfirmasi di tab penampil kisi (`/components/GridTab.tsx`) dengan penjelasan teknis yang santun dan solutif.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Resolusi Bug Sinkronisasi Cloud & Integrasi Promosi Jadwalify PRO]
### Perubahan Database & Backend (Supabase):
- **Resolusi Konflik Duplikasi Kunci Primer (`schedules_pkey`)**: Menyempurnakan logika pemetaan ID di `/lib/supabaseSync.ts` (`pushSchedulesOnly` & `pushAll`). Sekarang, sistem secara otomatis melacak UUID yang sudah dipetakan (`seenSchedules` & `seenConflicts`) untuk menjamin tidak ada duplikasi kunci primer yang dikirimkan dalam satu batch operasi database. Jika terdeteksi ID yang sama, sistem menyuntikkan salt dinamis secara otomatis untuk menghasilkan UUID yang aman dan unik tanpa merusak integritas hubungan data.
- **Pembersihan Laporan Konflik Aman**: Mengimplementasikan penanganan ID duplikat yang sama untuk tabel `schedule_conflicts` guna mencegah kegagalan sinkronisasi laporan konflik jadwal.

### Perubahan Frontend & UX:
- **Dialog Promosi Interaktif & Informatif**: Menambahkan modal kustom premium (`showProPromoModal`) di dalam tab penampil kisi (`/components/GridTab.tsx`). Modal ini menggantikan fungsi alert browser standar yang kaku.
- **Visualisasi Edukasi Lisensi**:
  - Jika sinkronisasi berhasil pada **Mode Trial**, modal menampilkan pemberitahuan informatif bahwa penyimpanan cloud berhasil, sekaligus mengajak pengguna mengaktifkan versi PRO untuk membuka fitur ekspor Excel (.CSV), cetak PDF berlogo kustom, tanda tangan rill, dan performa kecerdasan AI berkecepatan tinggi.
  - Jika terjadi kendala sinkronisasi, modal mengomunikasikan detail kendala secara transparan dan santun, serta memberikan saran pemecahan masalah yang menenangkan.
- **Pintasan Navigasi PRO**: Menyertakan tombol pemicu langsung (*Call to Action*) yang intuitif untuk mengarahkan pengguna Trial langsung ke tab Aktivasi (`activation`) dalam satu klik tanpa mengganggu kenyamanan bernavigasi.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [07 Juli 2026 - Integrasi Desain Pricing Glass Premium pada Tab Aktivasi]
### Perubahan Frontend & UX:
- **Tampilan Premium 3-Tier Obsidian Glass**: Mengintegrasikan desain kaca transparan (glassmorphism) bernuansa gelap obsidian untuk halaman aktivasi lisensi. Mengganti layout trial konvensional dengan 3 kartu harga yang terstruktur:
  1. **Trial Version (Aktif)**: Menampilkan status gratis saat ini dengan fitur-fitur terbatas.
  2. **Professional PRO (Paling Populer)**: Dilengkapi pencahayaan conic-gradient berputar di border, harga diskon dinamis, rincian fitur unggulan, serta penayangan QRIS interaktif langsung di dalam kartu saat diaktifkan.
  3. **Manual / Institusi**: Tombol pemicu otomatis untuk menghubungi Admin WhatsApp demi kebutuhan nota LPJ, invoice sekolah, atau kuitansi fisik cap basah.
- **Interaktivitas Mouse Spotlight**: Mengaktifkan efek sorotan cahaya mengikuti gerakan mouse (*mouse spotlight tracking*) pada permukaan kartu kaca menggunakan `framer-motion` dan `useMotionTemplate`.
- **Rincian Lisensi Kaca PRO**: Memperbarui tampilan bagi pengguna yang status PRO-nya sudah aktif dengan sertifikat tiket digital transparan bernuansa holografik modern.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [07 Juli 2026 - Sinkronisasi Ketersediaan Mata Pelajaran dengan Pengaturan Jam Pelajaran (JP)]
### Perubahan Frontend & UX:
- **Sinkronisasi Matriks Larangan Mapel**: Mengintegrasikan daftar `jamPelajaran` (JP) dinamis ke dalam komponen `MapelTab`. Matriks blokir slot hari & jam pelajaran (ketersediaan mata pelajaran) kini otomatis menyesuaikan dengan jumlah JP yang diatur pengguna (misal: 10 JP), tidak lagi terbatas kaku pada 8 JP.
- **Penyesuaian Rendering Kolom**: Memperbarui penataan baris & kolom tabel larangan waktu mengajar pelajaran agar selaras dengan data JP yang aktif.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [06 Juli 2026 - Sinkronisasi Aturan Preferensi Guru dengan Pengaturan Jam Pelajaran (JP)]
### Perubahan Frontend & UX:
- **Sinkronisasi JP Dinamis**: Mengintegrasikan daftar `jamPelajaran` (JP) yang dikonfigurasi pengguna ke dalam komponen `GuruTab`. Hal ini memastikan bahwa batasan mengajar maksimal harian, daftar Jam Berhalangan, daftar Jam Paling Disukai, serta matriks Halangan Khusus (Slot Jam & Hari Spesifik) otomatis menyesuaikan jumlah JP yang diatur (misalnya 10 JP), tidak lagi terkunci kaku di 8 JP.
- **Fallback Prop Aman**: Menggunakan nilai bawaan/fallback (1-8 JP) secara cerdas apabila data `jamPelajaran` kosong atau belum didefinisikan untuk menjaga ketahanan aplikasi.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [04 Juli 2026 - Perbaikan Kebocoran Peringatan Cloud di Mode Sandbox (Bypass Cloud Alerts)]
### Perubahan Frontend & UX:
- **Pencegahan Modal Peringatan Cloud di Mode Sandbox**: Menyaring dan mematikan pemicuan otomatis modal peringatan "Ada Perubahan Belum Disimpan" saat pengguna berpindah tab/menu jika sistem sedang dalam **Mode Sandbox** (`isDemoMode` bernilai `true`), sehingga tidak mengganggu pengalaman pengujian data lokal.
- **Penyembunyian Spanduk Peringatan Simpan ke Cloud**: Memperbarui penayangan spanduk kuning (*amber banner*) "Perubahan Data Belum Disimpan ke Cloud" di bagian atas halaman utama (`/app/page.tsx`) agar otomatis disembunyikan sepenuhnya selama Mode Sandbox aktif. Spanduk ini hanya akan tampil kembali ketika pengguna beralih ke Mode Riil (Supabase Cloud aktif).

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [04 Juli 2026 - Ketersediaan Larangan Waktu Mata Pelajaran (Subject-Specific Constraints)]
### Perubahan Frontend & UX:
- **Konstruksi Aturan Ketersediaan Mata Pelajaran (Opsional)**: Menambahkan modal panel interaktif dan estetis di dalam tab Mata Pelajaran (`/components/MapelTab.tsx`) untuk mengonfigurasi slot larangan waktu penempatan mata pelajaran (blocked slots) secara presisi, serupa dengan fitur ketersediaan guru.
- **Indikator Jumlah Jam Blokir**: Menampilkan badge tag warna merah muda (*pinkish*) di sebelah nama mata pelajaran aktif yang menunjukkan jumlah slot waktu terblokir (misal: "3 Jam Blokir") agar pengguna mendapatkan umpan balik visual secara instan.
- **1-Click Reset / Freedom**: Menyediakan opsi "Bebaskan Semua Slot" untuk menghapus seluruh batasan waktu untuk mata pelajaran yang bersangkutan secara instan.
- **Custom Iconography**: Mengintegrasikan pintasan konfigurasi cepat dengan ikon `Calendar` yang selaras secara visual dengan estetika antarmuka modern yang responsif.

### Perubahan Algoritma Penjadwalan & Konvensional:
- **CSP (Constraint Satisfaction Problem) Integration**: Memperbarui mesin solver backtracking di `solveCSP` pada `/lib/scheduler.ts` untuk melacak `slot_tidak_bersedia` pada setiap mata pelajaran sebagai *hard constraint* baru. Ini memastikan pelajaran seperti Olahraga (PJOK) tidak akan pernah dijadwalkan di akhir hari atau waktu terlarang lainnya.
- **Relaxed CSP Constraint Tracking**: Memperluas pengecekan pada solver draf cadangan `solveRelaxedCSP` untuk menyaring dan menghindari penempatan mata pelajaran pada slot waktu terblokir.
- **Algoritma Genetika (GA) Fitness Tuning**: Menambahkan penalti biner yang kuat (skor -400) di fungsi evaluasi kebugaran (`computeFitness`) pada `solveGenetic` apabila kromosom menempatkan mata pelajaran di slot waktu yang dilarang keras oleh pengguna.
- **Conflict Detection Engine Update**: Memperbarui pendeteksi bentrok bawaan `recalculateConflicts` di `LocalDB` (`/lib/db.ts`) untuk secara otomatis menganalisis dan mendaftarkan bentrok ketersediaan mata pelajaran ke dalam daftar konflik draf jadwal pelajaran.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [04 Juli 2026 - Penyimpanan Multi-Versi Payload Jadwal Pelajaran]
### Perubahan Frontend & UX:
- **Dedicated Versions Tab (Versi Jadwal)**: Menambahkan tab baru berupa panel pengelola versi jadwal (`/components/VersionsTab.tsx`) di sidebar utama, di mana pengguna dapat mengamankan dan mengelola berbagai macam versi jadwal pelajaran secara terisolasi.
- **Penyimpanan Snapshot Payload**: Memungkinkan pengguna menyimpan keadaan (snapshot) jadwal aktif lengkap dengan metadata seperti skor kepatuhan, total slot waktu terisi, total konflik, algoritma pembuat, durasi kalkulasi, tanggal, nama, dan catatan kustom.
- **Pemuatan Instan Tanpa Generate Ulang (Load Version)**: Pengguna dapat memilih versi tersimpan mana saja untuk langsung diterapkan sebagai draf jadwal utama secara instan.
- **Yayasan Multi-Unit Isolation**: Sesuai dengan spesifikasi, versi jadwal diisolasi secara otomatis berdasarkan unit sekolah aktif (SD, SMP, SMA/SMK) di dalam sistem database penyimpanan lokal.
- **Real-Time Cloud Synchronization**: Mendeteksi jika koneksi Supabase Cloud sedang aktif, maka memuat versi jadwal tersimpan akan langsung menimpa data draf di server cloud Supabase secara otomatis dan aman (re-sync).
- **CRUD Operations**: Mendukung penamaan baru saat penyimpanan, pengeditan nama & deskripsi di tempat (inline edit) pada payload versi yang sudah tersimpan, serta penghapusan payload permanen dengan konfirmasi yang ramah pengguna.

### Status:
- **Selesai Diimplementasikan**.
- **Kompatibel Penuh** dengan sistem cloud sync & multi-unit.

## [04 Juli 2026 - Pembuat Jam Pelajaran Otomatis (Automatic Period Preset Generator)]
### Perubahan Frontend & UX:
- **Automatic Period Preset Generator**: Menambahkan modul pembuat rentang jam pelajaran otomatis di `/components/PengaturanWaktuTab.tsx` yang memungkinkan pengguna menghasilkan susunan Jam Pelajaran (JP) dalam sehari secara instan.
- **Konfigurasi Fleksibel & Istirahat**: Mendukung isian kustom berupa jam mulai KBM pertama, total JP harian (hingga 15 JP), durasi per JP (menit), serta opsi kustomisasi waktu istirahat (Istirahat 1 & Istirahat 2) dengan penentuan posisi JP pemicu beserta durasinya masing-masing.
- **Penghitungan Waktu Akurat**: Mengimplementasikan fungsi pembantu `addMinutesToTime` untuk kalkulasi aritmatika waktu secara presisi tanpa hambatan peralihan jam atau hari.
- **Real-Time Supabase Sync**: Menyediakan sinkronisasi cloud real-time yang menghapus jam lama secara berantai lalu mendaftarkan seluruh preset jam baru ke database Supabase secara transparan bagi pengguna.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026 - Jenjang Tingkat Kurikulum Dinamis (SD, SMP, SMA/SMK)]
### Perubahan Frontend & UX:
- **Segmented Jenjang Selector**: Menambahkan panel selektor jenjang interaktif di dalam formulir tambah rombel kelas (`/components/KelasTab.tsx`). Pengguna kini dapat dengan mudah beralih jenjang kurikulum antara **SD / MI** (Kelas I - VI), **SMP / MTs** (Kelas VII - IX), dan **SMA / SMK / MA** (Kelas X - XII).
- **Auto-Detection Jenjang Cerdas**: Mengintegrasikan algoritma deteksi otomatis jenjang sekolah berdasarkan nama unit aktif (Mode Yayasan) atau profil nama sekolah (Mode Mandiri). Sistem akan langsung memilih tab jenjang yang sesuai (misal: "SD IT" otomatis membuka Kelas I-VI, "SMK Negeri" membuka Kelas X-XII).
- **Key-based React Lifecycle Reset**: Mengimplementasikan pola kunci reaktif (`key={LocalDB.getActiveUnit()}`) pada komponen `KelasTab` di `app/page.tsx` guna mereset instansiasi state tab secara bersih tanpa adanya warning cascading render atau loop tak terbatas.
- **Tingkat Preservation UX**: Menghilangkan behavior hardcoded reset tingkat ke 'VII' pada fungsi pembuatan kelas baru. Sekarang, pilihan tingkat kurikulum terakhir yang dipilih akan tetap terjaga untuk memudahkan pembuatan rombongan belajar paralel yang efisien.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026 - Pengelolaan Multi-Unit Sekolah (Yayasan)]
### Perubahan Database & Backend:
- **Isolasi Virtual Multi-Unit**: Memodifikasi mekanisme prefiks penyimpanan lokal `LocalDB.getUserPrefix()` di `lib/db.ts` untuk secara dinamis mendeteksi unit aktif (misal: SD, SMP, SMA). Hal ini memungkinkan pembagian data (guru, mata pelajaran, kelas, ruangan, pengampu, preferensi, jadwal) secara terisolasi sempurna tanpa resiko tercampur antar jenjang.
- **Yayasan Helper API**: Menambahkan fungsi manajemen unit sekolah (`getActiveUnit`, `setActiveUnit`, `getUnitsList`, `addUnit`, `deleteUnit`) di kelas `LocalDB`.
- **Supabase ID Partitioning (Tanpa Migrasi DB)**: Menyempurnakan generator UUID deterministik di `IDMapper.getUUID()` pada `/lib/supabaseSync.ts` dengan menyisipkan garam (*salt*) nama unit sekolah aktif ke dalam proses pembuatan hash. Hal ini menjamin bahwa item dengan ID lokal yang sama (misal: `mapel-1` di SD dan `mapel-1` di SMP) akan diubah menjadi UUID yang berbeda di Supabase. Dengan ini, **TIDAK diperlukan pembuatan database baru atau migrasi skema tabel di Supabase!** Data otomatis terisolasi secara aman menggunakan skema tabel yang sudah ada.

### Perubahan Frontend:
- **Yayasan / Multi-Unit Switcher Widget**: Membuat komponen baru `/components/YayasanUnitSwitcher.tsx` berisi kontrol sakelar (toggle) Mode Yayasan, tombol dropdown pemilihan unit aktif instan (1-click), serta jendela interaktif pengelolaan daftar unit terdaftar (tambah/hapus unit).
- **Integrasi Sidebar & Live Reload**: Menyatukan widget unit switcher ke dalam layout sidebar di `app/page.tsx`. Saat unit beralih, sistem secara reaktif memuat ulang seluruh master data instan di halaman tanpa memerlukan segarkan (refresh) halaman secara penuh.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026 - Template Kurikulum Jenjang & Edit Mapel Aktif]
### Perubahan Database & Backend:
- Menambahkan backend sinkronisasi `handleUpdateMapel` dan `handleImportMapels` untuk menyimpan perubahan data mata pelajaran secara persisten di LocalDB dan diselaraskan secara otomatis (real-time) dengan Supabase Cloud jika akun terhubung secara online.

### Perubahan Frontend:
- **Preset Kurikulum Lengkap**: Menambahkan panel "Template Kurikulum Cepat" untuk semua jenjang pendidikan dasar dan menengah (SD, SMP, SMA, SMK, MI, MTs, MA, MAK) di dalam tab Mata Pelajaran.
- **Pelajaran Bisa Diedit**: Menyediakan editor live adaptif pada daftar mata pelajaran di template sebelum diimpor ke dalam daftar aktif sekolah. Pengguna dapat memilih (checkbox), mengubah kode mapel, mengedit nama mata pelajaran, dan menyesuaikan durasi (JP) langsung pada tabel pratinjau.
- **Inline Row-Editing Mapel Aktif**: Menyempurnakan antarmuka tabel mata pelajaran aktif dengan menambahkan fitur edit baris secara langsung (inline editing). Pengguna dapat mengubah kode, nama, dan durasi jam pelajaran aktif tanpa melalui jendela pop-up yang mengganggu alur kerja.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026 - Demo & Real Mode Integration Refinement v3]
### Perubahan Database & Backend:
- Menambahkan sistem status multi-mode di `lib/db.ts` dengan mendefinisikan metode `isDemoMode()` dan `setDemoMode(isDemo)`.
- Mengonfigurasi *data fallback* getter data master untuk mengembalikan array kosong `[]` saat berada di **Mode Asli (Real Mode)** agar database bersih total.
- Mengonfigurasi fallback untuk menggunakan data simulasi (`MOCK_*`) saat berada di **Mode Demo (Sandbox Mode)** untuk akses uji coba instan.
- **Sistem Deteksi Akun Lama**: Jika akun pengguna sudah memiliki data master buatan sendiri yang aktif (bukan bawaan), sistem secara pintar mendefinisikan default-nya sebagai **Mode Asli (Real Mode)** sehingga data riil mereka di browser/cloud tidak terganggu ataupun tertimpa data demo.
- Bagi pengguna baru atau akun kosong, sistem tetap memicu **Mode Sandbox** sebagai default awal untuk mempermudah visualisasi langsung saat pertama kali dicoba, dan begitu tombol beralih diklik, data master dikosongkan total ke 0 agar transisinya bersih tanpa bentrok data.

### Perubahan Frontend:
- Menghapus Sticky Demo Mode Banner dari bagian atas header utama untuk mencegah kekacauan visual.
- Menambahkan **Interactive Mode Selector Widget** di bagian bawah menu navigasi sidebar (di atas tombol Aksi Sistem) yang menampilkan status sistem saat ini (Sandbox vs Mode Asli) dengan tombol transisi yang responsif.
- **Header Navbar Adaptif (Sandbox Mode)**: Menyempurnakan header navbar utama. Saat berada di **Mode Sandbox**, label sinkronisasi cloud "Cloud Aktif" otomatis berubah menjadi label informatif **Mode Sandbox** (dengan aksen kuning/oranye dinamis yang indah).
- **Pembersihan Tombol Sinkronisasi**: Tombol sinkronisasi manual cloud dan indikator sync cloud disembunyikan seluruhnya dari navbar utama ketika Mode Sandbox sedang aktif untuk mencegah kebingungan pengguna dan menjaga antarmuka tetap bersih. Tombol dan indikator cloud ini akan kembali muncul secara otomatis saat pengguna beralih ke Mode Asli (Real Mode).
- **Transisi Dengan Pemuat Profesional**: Menambahkan overlay transisi professional dengan status pemuatan bertahap dinamis ("Mengosongkan cache simulasi lokal...", "Menghubungkan ke cloud database dan mengunduh data riil...", "Memvalidasi integritas basis data...").
- **Sinkronisasi Otomatis Pasca Transisi**: Mengintegrasikan `SupabaseSyncService.pullAll()` saat beralih dari Mode Sandbox ke Mode Asli (Real Mode). Jika pengguna sudah login, data riil sekolah mereka akan ditarik secara otomatis dari cloud dan dipulihkan secara instan tanpa mengacaukan atau menduplikasi database lokal.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026 - Tambahan]
### Perubahan Database & Backend:
- Memperbaiki bug isolasi multi-user di `lib/supabaseSync.ts` pada fungsi `pullAll` dengan menambahkan filter `.eq('id', user.id)` pada query tabel `profiles`. Hal ini mencegah kegagalan sinkronisasi (error `PGRST116: multiple rows returned`) saat terdapat lebih dari satu pengguna yang terdaftar di database cloud Supabase.

### Perubahan Frontend:
- Tidak ada perubahan frontend baru.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [03 Juli 2026]
### Perubahan Database & Backend:
- Tidak ada database perubahan.

### Perubahan Frontend:
- Mengubah struktur layout grafik distribusi Beban Kerja Guru di `BebanKerjaTab.tsx` agar responsif menggunakan pendekatan *mobile-first*.
- Memperbaiki penumpukan legenda status pada mode mobile dengan membuatnya terbungkus secara dinamis (*flex-wrap*) dan tersusun di bawah judul secara rapi.
- Menambahkan area scrollable horizontal (`overflow-x-auto`) yang didukung parameter `minWidth` dinamis pada kanvas grafik agar bar diagram tidak saling menindih atau terkompresi di layar sempit.
- Mengoptimalkan tabel data utama: Kolom `Jenis Kelamin` dan `Kelayakan Sertifikasi` sekarang disembunyikan pada ukuran layar kecil, lalu informasinya dipadatkan langsung ke dalam kolom detail nama guru di bawah nama masing-masing untuk menghemat ruang *viewport* ponsel.
- Menambahkan integrasi lencana (*badge*) kelayakan sertifikasi dan jenis kelamin khusus mode mobile pada tabel utama demi kenyamanan navigasi yang modern.

### Status:
- **LULUS LINTING** (0 error).
- **LULUS KOMPILASI** (Build sukses).

## [02 Juli 2026]
### Perubahan Database & Backend:
- Tidak ada (Menggunakan relasi tabel `teachers`, `teacher_assignments`, dan `schedules` yang sudah ada secara dinamis).
 
### Perubahan Frontend:
- Pembuatan komponen `BebanKerjaTab.tsx` yang mengimplementasikan visualisasi, analisis, pencarian, filter, penugasan tugas tambahan dinamis dengan ekuivalensi JP, serta kelayakan sertifikasi guru berdasarkan standar Permendikbud No. 15 Tahun 2018.
- Integrasi menu baru **Laporan Beban Kerja** pada Sidebar navigasi di `page.tsx`.
- Pemuatan dan penyimpanan tugas tambahan menggunakan *lazy state initialization* dari `localStorage` agar data persisten di sisi klien.
 
### Status:
- **LULUS LINTING** (0 error, 5 warning LCP standar).
- **LULUS KOMPILASI** (Build sukses).

## [07 Juli 2026 - Penyempurnaan Tata Letak Toolbar Filter & Aksi Jadwal (Simpan Cloud, Ekspor Excel, Cetak PDF)]
### Perubahan Frontend & UX:
- **Desain Toolbar Responsif Berbasis Grid**: Mendesain ulang wadah kontrol filter dan tombol aksi utama pada tabel jadwal (`/components/GridTab.tsx`) dari flex row kaku menjadi layout grid reaktif (`grid grid-cols-1 sm:grid-cols-3 lg:flex`) guna mencegah penumpukan elemen dan pemotongan teks tombol (*text-wrapping*) di layar mobile dan tablet.
- **Penyelarasan Tinggi & Padding Seragam**: Menyeragamkan tinggi seluruh elemen interaktif (pilihan tab filter, dropdown selektor, toggle kode guru, serta ketiga tombol aksi utama) secara presisi dengan tinggi tetap `h-10` dan border melingkar premium (`rounded-xl`).
- **Pemberian Aksen Tombol Premium**:
  - **Simpan ke Cloud**: Dilengkapi transisi efek hover halus, bayangan bayang hijau, serta animasi pintar di mana ikon `CloudUpload` otomatis berubah menjadi `RefreshCw` yang berputar (*spin*) ketika sinkronisasi cloud berlangsung.
  - **Ekspor Excel (CSV)**: Menambahkan status biner responsif; tombol berlatar belakang putih bersih dengan aksen ikon hijau premium saat aktif (PRO), dan beralih otomatis ke mode redup berkabut dengan lencana "PRO" kapsul jika fitur terkunci.
  - **Cetak PDF Profesional**: Menggunakan tombol solid indigo premium berkilau dengan efek bayangan elegan untuk kenyamanan akses cetak instan.
- **Pencegahan Pemotongan Teks**: Menambahkan aturan `whitespace-nowrap` pada seluruh tombol aksi utama untuk menjamin integritas tipografi yang kokoh di semua resolusi viewport.
- **Horizontal Scroll Filter Mobile (Scrollable Tabs)**: Memperbarui tombol filter kategori (`Berdasarkan Kelas`, `Berdasarkan Guru`, `Berdasarkan Ruangan`) di layar mobile sehingga mengalir horizontal (`flex-nowrap`, `overflow-x-auto`) dengan pergeseran mulus (`scroll-smooth`), mencegah penyusutan tombol (`shrink-0`), serta menyembunyikan scrollbar secara estetik (`no-scrollbar`) agar menyajikan interaksi navigasi yang sangat murni tanpa merusak kerapian tata letak desktop maupun landscape.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [07 Juli 2026 - Penambahan Pusat Panduan Interaktif: Menu Tutorial & FAQ Lengkap]
### Perubahan Frontend & UX:
- **Pusat Panduan & Bantuan Interaktif**: Membuat komponen baru `/components/TutorialTab.tsx` yang mengemas sistem tutorial alur kerja (workflow timeline) interaktif 7 langkah (dari pengaturan waktu, input guru, mata pelajaran, penugasan pengampu, eksekusi otomatisasi genetika, hingga langkah sinkronisasi dan ekspor).
- **Desain Stepper Reaktif & Navigasi Cepat**: Setiap langkah dilengkapi indikator lencana (*badge*), penjelasan detail, tips profesional, serta tombol pintasan langsung (*Quick Jump*) untuk membuka tab menu terkait.
- **Accordion FAQ Berbasis Kategori & Pencarian Real-time**: Menyediakan menu FAQ interaktif yang dikelompokkan berdasarkan kategori topik (Dasar Penggunaan, Algoritma & Bentrok, Cloud Database, Ekspor & Cetak) dengan fungsionalitas pencarian kata kunci dinamis serta efek transisi pembukaan accordion yang sangat mulus menggunakan Framer Motion (`motion/react`).
- **Integrasi Sidebar Navigasi**: Menambahkan tombol berikon bantuan (`HelpCircle`) "Tutorial & FAQ" pada daftar utama Sidebar navigasi di halaman dashboard utama (`/app/page.tsx`).

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Peningkatan UI Notifikasi: Sistem Dialog Alert Global Kustom & Premium]
### Perubahan Frontend & UX:
- **Sistem Dialog Kustom Global (`GlobalAlertProvider`)**: Membangun modul baru di `/components/GlobalAlertProvider.tsx` yang membajak fungsionalitas browser default `window.alert` secara anggun tanpa mengubah baris kode pemicu di puluhan file tab lainnya.
- **Deteksi Konteks Cerdas**: Sistem dialog secara otomatis menganalisis isi pesan teks untuk mengkategorikan dan menyajikan notifikasi ke dalam 4 mode visual yang berbeda:
  - **Berhasil (Success)**: Menampilkan lencana ikon centang lingkaran hijau yang memantul lembut (`CheckCircle2`), dengan tombol aksi bertema hijau zamrud.
  - **Terjadi Kesalahan (Error)**: Menampilkan lencana ikon silang merah tegas (`XCircle`) dengan tombol aksi bertema mawar mewah.
  - **Peringatan (Warning)**: Menampilkan lencana peringatan segitiga jingga yang berdenyut lambat (`AlertTriangle`) dengan tombol aksi bertema amber hangat.
  - **Informasi (Info)**: Menampilkan lencana info biru laut (`Info`) dengan tombol aksi bertema indigo premium.
- **Desain & Animasi Modern**: Menyajikan efek pemburaman latar belakang layar (`backdrop-blur-xs`) dengan kartu dialog melayang berskala lembut (*spring scale transition*) menggunakan Framer Motion, dilengkapi tombol aksi taktil "Paham & Lanjutkan" yang responsif saat disentuh/diklik.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Sinkronisasi Real-time Instan & Cloud-First untuk CRUD Data Guru]
### Perubahan Database & Backend:
- **Metode Cloud-First & Real-time**: Mengubah alur penyimpanan dan penghapusan data Guru agar langsung dikirimkan ke cloud database Supabase terlebih dahulu (`SupabaseSyncService.syncTeacher`).
- **Pemanfaatan Cascade Deletion**: Memanfaatkan properti `ON DELETE CASCADE` di sisi database Supabase sehingga ketika data guru berhasil dihapus dari cloud, seluruh relasi preferensi, tugas pengampu, dan jadwal terkait akan otomatis dibersihkan secara instan di cloud dan lokal tanpa risiko konflik cache memory.

### Perubahan Frontend & UX:
- **Bypass Unsaved Changes Alert**: Menghilangkan tanda peringatan kuning "Perubahan Data Belum Disimpan ke Cloud" untuk transaksi Guru karena penambahan, pembaruan, dan penghapusan guru kini langsung tersimpan reaktif ke Supabase.
- **Sistem Fallback Kuat**: Jika terjadi kegagalan jaringan saat mengirim data ke cloud, aplikasi secara otomatis melakukan fallback aman dengan menyimpannya ke memori lokal browser (LocalDB) dan menandai status belum sinkron agar pengguna dapat melakukan sinkronisasi ulang nanti.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Validasi Profesional Duplikasi NIP Guru]
### Perubahan Database & Backend:
- **Pencegahan Kegagalan Simpan**: Mengintegrasikan sistem validasi pre-flight lokal untuk memeriksa kecocokan NIP sebelum data dikirim ke Supabase Cloud. Hal ini mengeliminasi risiko raw database constraint violation error (`unique_nip_per_user`) yang membingungkan bagi pengguna.

### Perubahan Frontend & UX:
- **Validasi Cerdas Pendaftaran Guru Baru**: Saat pendaftaran guru baru, sistem secara otomatis melacak data lokal di memory untuk mendeteksi apakah ada guru aktif yang menggunakan NIP yang sama. Jika ada, sistem akan memblokir registrasi dan menampilkan dialog peringatan profesional: *"Peringatan Validasi: NIP [NIP] sudah terdaftar atas nama [Nama Guru]"*.
- **Validasi Modifikasi Biodata Guru**: Penerapan filter eksklusi ID yang memastikan bahwa saat memperbarui biodata guru aktif, perubahan tidak akan menabrak NIP guru lain, melainkan tetap memperbolehkan pembaruan jika NIP tersebut memang milik guru bersangkutan itu sendiri.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Loader State Sinkronisasi 1-100% Interaktif & Log Real-Time]
### Perubahan Database & Backend:
- **Callback Progress Pada SupabaseSync**: Memperbarui pustaka sync backend (`lib/supabaseSync.ts`) dengan menginstrumentasikan `onProgress` callback di sepanjang fungsi sinkronisasi push (`pushAll`) dan pull (`pullAll`).
- **Granularitas Tahapan Sinkronisasi**: Mengemas tahapan sinkronisasi ke dalam visual progress yang presisi (dari 5% persiapan profil sekolah hingga 100% penyelarasan total data konflik).

### Perubahan Frontend & UX:
- **Interactive Sync Progress Modal**: Membuat modal popup modern dengan indikator presentase 1-100% dan progress bar animasi elegan yang merespon dinamika pengiriman data ke Cloud.
- **Log Sinkronisasi Real-Time**: Mengintegrasikan panel logs collapsible di dalam modal untuk menyajikan jalannya sinkronisasi entitas tabel secara real-time demi transparansi aktivitas server yang profesional.
- **Modern Save-and-Navigate Flow**: Memperbarui transisi halaman menu di mana seluruh proses penyimpanan sebelum navigasi kini disajikan secara visual interaktif, menghapus ketidakpastian proses loading tanpa batas yang membingungkan.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Penggantian Control Dropdown Tingkat Kurikulum Dengan Segmented Buttons Grid Premium]
### Perubahan Database & Backend:
- *Tidak ada perubahan pada struktur database atau backend schema.* Data tersimpan tetap kompatibel penuh dengan skema yang ada.

### Perubahan Frontend & UX:
- **Custom Segmented Button Grid**: Mengganti dropdown native `<select>` tingkat kurikulum pada tab Kelola Kelas dengan *segmented grid* tombol kustom yang interaktif, elegan, dan *mobile-friendly*.
- **Multi-line Option Badging**: Setiap opsi menampilkan visual interaktif berupa angka Romawi tebal (bold) di baris pertama dan teks ejaan tingkatan dalam format huruf kapital kecil (uppercase) yang elegan di bawahnya.
- **Dynamic Grid Layout**: Grid tombol secara dinamis menyesuaikan tata letak kolom yang optimal (3 kolom) untuk SD (I-VI), SMP (VII-IX), dan SMA (X-XII) sehingga mencegah penumpukan layout pada layar ponsel yang sempit.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Perbaikan Bug Sesi Menggantung (Stuck 5%) & Otomasi Self-Healing Token Supabase]
### Perubahan Database & Backend:
- *Tidak ada perubahan pada tabel database.* Keamanan terjamin tanpa modifikasi RLS.

### Perubahan Frontend & UX:
- **Auth Timeout Protection**: Mengintegrasikan batas waktu pemanggilan (Timeout) pada setiap pemeriksaan otentikasi (`getUser` & `getSession`) menggunakan `Promise.race()`. Jika proses verifikasi dengan cloud melebihi 8 detik, sistem akan secara otomatis membatalkan pemanggilan dan melempar error penanganan yang aman daripada membiarkan user terjebak di progress "5%".
- **Programmatic Session Self-Healing**: Mengembangkan mekanisme pembersihan otomatis jika sesi terdeteksi rusak atau kedaluwarsa. Sistem sekarang secara otomatis memprogram pembersihan seluruh Supabase key (`sb-` tokens) di `localStorage` dan mereset status login lokal secara bersih jika verifikasi gagal/gantung. Ini meniadakan kebutuhan pengguna untuk menghapus cache browser secara manual.
- **Improved Background Sync Stability**: Menyesuaikan latar belakang penulisan instan (`syncSingleItem`) dengan proteksi timeout yang lebih ketat agar tidak memblokir antarmuka pengguna saat koneksi tidak stabil.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Otomatisasi Sinkronisasi Jam JP pada Ploting Pengampu]
### Perubahan Database & Backend:
- *Tidak ada perubahan.*

### Perubahan Frontend & UX:
- **Auto-Sync JP Allocation**: Mengimplementasikan pengisian alokasi jam mengajar secara otomatis (auto-fill) pada input "Alokasi (Jam JP/Minggu)" saat pengguna memilih Mata Pelajaran di menu "Kelola Pembagian Pengampu Mata Pelajaran". Beban jam mengajar diambil langsung dari konfigurasi `jumlah_jam_per_minggu` yang didefinisikan pada pengaturan mata pelajaran.
- **Dynamic Override Kept**: Menjamin alokasi jam JP yang terisi otomatis tetap sepenuhnya dinamis dan dapat diubah manual jika dibutuhkan sebelum mengunci alokasi tugas.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).

## [08 Juli 2026 - Desain Ulang Visual Sukses Sinkronisasi Supabase]
### Perubahan Database & Backend:
- *Tidak ada perubahan.*

### Perubahan Frontend & UX:
- **Sleek Component Grid Card**: Menggantikan teks mentah (berisi format markdown yang kotor/tidak rapi) dengan panel grid minimalis yang memetakan seluruh komponen data terarsip secara profesional menggunakan lencana status berikon checkmark berwarna Emerald yang elegan.
- **Dynamic Connection Heartbeat**: Menambahkan pulse-ping indicator mini real-time dengan label "Sistem Cloud Aktif" dan tag "100% SINKRON" modern untuk meningkatkan kepercayaan visual pengguna.

### Status:
- **LULUS LINTING** (0 error, 5 warning standar).
- **LULUS KOMPILASI** (Build sukses).


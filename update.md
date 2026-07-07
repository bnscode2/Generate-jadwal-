# Log Pembaruan Sistem - Jadwalify

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

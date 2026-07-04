# Log Pembaruan Sistem - Jadwalify

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

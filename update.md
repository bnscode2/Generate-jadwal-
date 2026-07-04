# Log Pembaruan Sistem - Jadwalify

## [03 Juli 2026 - Demo & Real Mode Integration]
### Perubahan Database & Backend:
- Menambahkan sistem status multi-mode di `lib/db.ts` dengan mendefinisikan metode `isDemoMode()` dan `setDemoMode(isDemo)`.
- Mengonfigurasi *data fallback* getter data master (`getGuru`, `getMapel`, `getKelas`, `getRuangan`, `getPengampu`, `getPreferensi`) untuk mengembalikan array kosong `[]` saat berada di **Mode Asli (Real Mode)** agar pengguna baru mendapatkan basis data yang bersih sejak awal pendaftaran.
- Mengonfigurasi fallback untuk tetap menggunakan data simulasi (`MOCK_*`) saat berada di **Mode Demo (Demo Mode)** guna memberikan akses coba-coba instan bagi pengguna baru.

### Perubahan Frontend:
- Menambahkan **Sticky Demo Mode Banner** yang modern dan elegan di bagian atas layar utama `/app/page.tsx` ketika Mode Demo aktif, lengkap dengan tombol ajakan bertindak profesional untuk beralih langsung ke Mode Asli.
- Mengintegrasikan dialog konfirmasi transisi interaktif di modal `'switch_to_real'` dan `'switch_to_demo'`.
- Menyinkronkan fungsionalitas tombol "Kosongkan Semua Data Master" untuk secara otomatis mematikan Mode Demo dan beralih ke Mode Asli (Mulai dari Nol) demi efisiensi navigasi sistem.

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
- Tidak ada perubahan database.

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

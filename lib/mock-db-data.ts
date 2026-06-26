import { Guru, MataPelajaran, Kelas, Ruangan, JamPelajaran, PengampuMataPelajaran, PreferensiGuru } from './types';

export const MOCK_GURU: Guru[] = [
  {
    id: 'g-1',
    nip: '198105122009021003',
    nama: 'Ahmad Subarjo, S.Pd. (Matematika)',
    jenis_kelamin: 'Laki-laki',
    no_hp: '081234567890',
    status_aktif: true,
  },
  {
    id: 'g-2',
    nip: '198503252011012004',
    nama: 'Siti Rahma, M.Pd. (B. Indonesia)',
    jenis_kelamin: 'Perempuan',
    no_hp: '081298765432',
    status_aktif: true,
  },
  {
    id: 'g-3',
    nip: '197911042005011002',
    nama: 'Drs. Bambang Wijaya (IPA)',
    jenis_kelamin: 'Laki-laki',
    no_hp: '085611223344',
    status_aktif: true,
  },
  {
    id: 'g-4',
    nip: '198801152015032001',
    nama: 'Rina Kartika, S.S. (B. Inggris)',
    jenis_kelamin: 'Perempuan',
    no_hp: '087755667788',
    status_aktif: true,
  },
  {
    id: 'g-5',
    nip: '199207222019081005',
    nama: 'Budi Hartono, S.Pd. (IPS)',
    jenis_kelamin: 'Laki-laki',
    no_hp: '089911223344',
    status_aktif: true,
  },
  {
    id: 'g-6',
    nip: '199009102018041002',
    nama: 'Eko Prasetyo, S.Pd.Or. (PJOK)',
    jenis_kelamin: 'Laki-laki',
    no_hp: '081377889900',
    status_aktif: true,
  },
  {
    id: 'g-7',
    nip: '198412032010012003',
    nama: 'Dewi Lestari, S.Sn. (Seni)',
    jenis_kelamin: 'Perempuan',
    no_hp: '082144556677',
    status_aktif: true,
  }
];

export const MOCK_MAPEL: MataPelajaran[] = [
  {
    id: 'm-1',
    kode_mapel: 'MAT',
    nama_mapel: 'Matematika',
    jumlah_jam_per_minggu: 5,
  },
  {
    id: 'm-2',
    kode_mapel: 'IND',
    nama_mapel: 'Bahasa Indonesia',
    jumlah_jam_per_minggu: 4,
  },
  {
    id: 'm-3',
    kode_mapel: 'IPA',
    nama_mapel: 'Ilmu Pengetahuan Alam',
    jumlah_jam_per_minggu: 4,
  },
  {
    id: 'm-4',
    kode_mapel: 'ING',
    nama_mapel: 'Bahasa Inggris',
    jumlah_jam_per_minggu: 4,
  },
  {
    id: 'm-5',
    kode_mapel: 'IPS',
    nama_mapel: 'Ilmu Pengetahuan Sosial',
    jumlah_jam_per_minggu: 3,
  },
  {
    id: 'm-6',
    kode_mapel: 'OJE',
    nama_mapel: 'Pendidikan Jasmani & Olahraga',
    jumlah_jam_per_minggu: 2,
  },
  {
    id: 'm-7',
    kode_mapel: 'SND',
    nama_mapel: 'Seni Budaya',
    jumlah_jam_per_minggu: 2,
  }
];

export const MOCK_KELAS: Kelas[] = [
  {
    id: 'c-1',
    nama_kelas: 'VII A',
    tingkat: 'VII',
    wali_kelas: 'Ahmad Subarjo, S.Pd.',
  },
  {
    id: 'c-2',
    nama_kelas: 'VII B',
    tingkat: 'VII',
    wali_kelas: 'Siti Rahma, M.Pd.',
  },
  {
    id: 'c-3',
    nama_kelas: 'VIII A',
    tingkat: 'VIII',
    wali_kelas: 'Drs. Bambang Wijaya',
  }
];

export const MOCK_RUANGAN: Ruangan[] = [
  {
    id: 'r-1',
    nama_ruangan: 'Kelas VII A',
    kapasitas: 32,
  },
  {
    id: 'r-2',
    nama_ruangan: 'Kelas VII B',
    kapasitas: 32,
  },
  {
    id: 'r-3',
    nama_ruangan: 'Kelas VIII A',
    kapasitas: 36,
  },
  {
    id: 'r-4',
    nama_ruangan: 'Laboratorium Komputer',
    kapasitas: 40,
  },
  {
    id: 'r-5',
    nama_ruangan: 'Lapangan Olahraga',
    kapasitas: 80,
  }
];

export const MOCK_JAM_PELAJARAN: JamPelajaran[] = [
  { id: 'p-1', jam_ke: 1, jam_mulai: '07:30', jam_selesai: '08:15' },
  { id: 'p-2', jam_ke: 2, jam_mulai: '08:15', jam_selesai: '09:00' },
  { id: 'p-3', jam_ke: 3, jam_mulai: '09:00', jam_selesai: '09:45' },
  { id: 'p-4', jam_ke: 4, jam_mulai: '10:00', jam_selesai: '10:45' },
  { id: 'p-5', jam_ke: 5, jam_mulai: '10:45', jam_selesai: '11:30' },
  { id: 'p-6', jam_ke: 6, jam_mulai: '11:30', jam_selesai: '12:15' },
  { id: 'p-7', jam_ke: 7, jam_mulai: '13:00', jam_selesai: '13:45' },
  { id: 'p-8', jam_ke: 8, jam_mulai: '13:45', jam_selesai: '14:30' }
];

export const MOCK_PENGAMPU: PengampuMataPelajaran[] = [
  // Matematika (g-1)
  { id: 'a-1', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-1', jumlah_jam: 5 }, // VII A
  { id: 'a-2', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-2', jumlah_jam: 5 }, // VII B
  { id: 'a-3', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-3', jumlah_jam: 4 }, // VIII A

  // Bahasa Indonesia (g-2)
  { id: 'a-4', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-1', jumlah_jam: 4 },
  { id: 'a-5', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-2', jumlah_jam: 4 },
  { id: 'a-6', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-3', jumlah_jam: 4 },

  // IPA (g-3)
  { id: 'a-7', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-1', jumlah_jam: 4 },
  { id: 'a-8', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-2', jumlah_jam: 4 },
  { id: 'a-9', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-3', jumlah_jam: 4 },

  // Bahasa Inggris (g-4)
  { id: 'a-10', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-1', jumlah_jam: 4 },
  { id: 'a-11', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-2', jumlah_jam: 4 },
  { id: 'a-12', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-3', jumlah_jam: 4 },

  // IPS (g-5)
  { id: 'a-13', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-1', jumlah_jam: 3 },
  { id: 'a-14', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-2', jumlah_jam: 3 },
  { id: 'a-15', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-3', jumlah_jam: 3 },

  // PJOK (g-6) - Diajar di Lapangan (r-5)
  { id: 'a-16', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-1', jumlah_jam: 2 },
  { id: 'a-17', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-2', jumlah_jam: 2 },
  { id: 'a-18', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-3', jumlah_jam: 2 },

  // Seni Budaya (g-7) - Diajar di Lab atau Kelas
  { id: 'a-19', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-1', jumlah_jam: 2 },
  { id: 'a-20', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-2', jumlah_jam: 2 },
  { id: 'a-21', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-3', jumlah_jam: 2 }
];

export const MOCK_PREFERENSI: PreferensiGuru[] = [
  {
    id: 'p-g-1',
    guru_id: 'g-1', // Ahmad
    hari_tidak_bersedia: ['Senin'],
    jam_tidak_bersedia: [1, 2], // Tidak bisa mengajar Senin pagi jam ke-1 dan ke-2
    hari_favorit: ['Selasa', 'Rabu'],
    jam_favorit: [3, 4],
    max_jam_per_hari: 6
  },
  {
    id: 'p-g-2',
    guru_id: 'g-2', // Siti
    hari_tidak_bersedia: ['Jumat'],
    jam_tidak_bersedia: [7, 8], // Tidak bisa Jumat sore
    hari_favorit: ['Kamis', 'Sabtu'],
    jam_favorit: [1, 2],
    max_jam_per_hari: 6
  },
  {
    id: 'p-g-3',
    guru_id: 'g-3', // Bambang
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Senin', 'Selasa'],
    jam_favorit: [2, 3],
    max_jam_per_hari: 6
  },
  {
    id: 'p-g-4',
    guru_id: 'g-4', // Rina
    hari_tidak_bersedia: ['Rabu'],
    jam_tidak_bersedia: [5, 6],
    hari_favorit: ['Senin', 'Jumat'],
    jam_favorit: [3, 4],
    max_jam_per_hari: 6
  },
  {
    id: 'p-g-5',
    guru_id: 'g-5', // Budi
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Kamis', 'Jumat'],
    jam_favorit: [1, 2],
    max_jam_per_hari: 6
  },
  {
    id: 'p-g-6',
    guru_id: 'g-6', // Eko
    hari_tidak_bersedia: ['Sabtu'],
    jam_tidak_bersedia: [7, 8],
    hari_favorit: ['Senin', 'Selasa'],
    jam_favorit: [1, 2, 3],
    max_jam_per_hari: 4
  },
  {
    id: 'p-g-7',
    guru_id: 'g-7', // Dewi
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Rabu', 'Kamis'],
    jam_favorit: [4, 5],
    max_jam_per_hari: 6
  }
];

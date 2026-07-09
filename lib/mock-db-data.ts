import { Guru, MataPelajaran, Kelas, Ruangan, JamPelajaran, PengampuMataPelajaran, PreferensiGuru } from './types';

export const MOCK_GURU: Guru[] = [
  { id: 'g-1', nip: '197205121998031003', nama: 'Drs. H. Ahmad Subarjo, M.Pd. (Matematika)', jenis_kelamin: 'Laki-laki', no_hp: '081234567890', status_aktif: true },
  { id: 'g-2', nip: '198103252009012004', nama: 'Siti Rahma, S.Pd., M.Pd. (B. Indonesia)', jenis_kelamin: 'Perempuan', no_hp: '081298765432', status_aktif: true },
  { id: 'g-3', nip: '197511042003121002', nama: 'Dr. Bambang Wijaya, M.Si. (IPA)', jenis_kelamin: 'Laki-laki', no_hp: '085611223344', status_aktif: true },
  { id: 'g-4', nip: '198501152011032001', nama: 'Rina Kartika, S.S., M.Hum. (B. Inggris)', jenis_kelamin: 'Perempuan', no_hp: '087755667788', status_aktif: true },
  { id: 'g-5', nip: '199007222015081005', nama: 'Budi Hartono, S.Pd. (IPS)', jenis_kelamin: 'Laki-laki', no_hp: '089911223344', status_aktif: true },
  { id: 'g-6', nip: '198809102014041002', nama: 'Eko Prasetyo, S.Pd.Or. (PJOK)', jenis_kelamin: 'Laki-laki', no_hp: '081377889900', status_aktif: true },
  { id: 'g-7', nip: '198312032010012003', nama: 'Dewi Lestari, S.Sn. (Seni Budaya)', jenis_kelamin: 'Perempuan', no_hp: '082144556677', status_aktif: true },
  { id: 'g-8', nip: '197804182005021001', nama: 'Haji Muhammad Rizal, S.Ag. (PAI)', jenis_kelamin: 'Laki-laki', no_hp: '081211223344', status_aktif: true },
  { id: 'g-9', nip: '198208102010012002', nama: 'Yosefina Maria, S.Th. (PKn / Agama)', jenis_kelamin: 'Perempuan', no_hp: '081355667788', status_aktif: true },
  { id: 'g-10', nip: '197003151996021001', nama: 'Drs. I Ketut Widana, M.Si. (PKn)', jenis_kelamin: 'Laki-laki', no_hp: '085744556677', status_aktif: true },
  { id: 'g-11', nip: '199211052019031008', nama: 'Hendra Wijaya, S.Kom. (Informatika)', jenis_kelamin: 'Laki-laki', no_hp: '089677889900', status_aktif: true },
  { id: 'g-12', nip: '198702202012012003', nama: 'Tri Astuti, S.Pd. (Prakarya)', jenis_kelamin: 'Perempuan', no_hp: '082211223344', status_aktif: true },
  { id: 'g-13', nip: '198905142016031002', nama: 'Agus Susanto, S.Pd. (Bahasa Daerah)', jenis_kelamin: 'Laki-laki', no_hp: '087855667788', status_aktif: true },
  { id: 'g-14', nip: '198904222010012005', nama: 'Sri Wahyuni, S.Psi. (BK)', jenis_kelamin: 'Perempuan', no_hp: '089511223344', status_aktif: true },
  { id: 'g-15', nip: '199406182020082001', nama: 'Mega Utama, M.Pd. (Matematika)', jenis_kelamin: 'Perempuan', no_hp: '081388990011', status_aktif: true },
  { id: 'g-16', nip: '199503122022012002', nama: 'Diana Putri, S.Pd. (IPA)', jenis_kelamin: 'Perempuan', no_hp: '081266778899', status_aktif: true },
  { id: 'g-17', nip: '197605152001121003', nama: 'Prof. Rudy Hermawan, M.Pd. (Matematika)', jenis_kelamin: 'Laki-laki', no_hp: '081299001122', status_aktif: true },
  { id: 'g-18', nip: '198004122006042002', nama: 'Dra. Endang Lestari (B. Indonesia)', jenis_kelamin: 'Perempuan', no_hp: '085277889900', status_aktif: true },
  { id: 'g-19', nip: '197103151996021002', nama: 'Dr. H. Mulyono, M.Pd. (B. Indonesia)', jenis_kelamin: 'Laki-laki', no_hp: '081122334455', status_aktif: true },
  { id: 'g-20', nip: '198308222009031004', nama: 'Yusuf Mansur, S.Pd. (IPA)', jenis_kelamin: 'Laki-laki', no_hp: '081344556677', status_aktif: true },
  { id: 'g-21', nip: '198610112011012003', nama: 'Sri Wahyuni, S.Pd. (B. Inggris)', jenis_kelamin: 'Perempuan', no_hp: '082255667788', status_aktif: true },
  { id: 'g-22', nip: '198402142010011002', nama: 'Ahmad Fauzi, M.Hum. (B. Inggris)', jenis_kelamin: 'Laki-laki', no_hp: '087822334455', status_aktif: true },
  { id: 'g-23', nip: '198205182009021001', nama: 'Slamet Riadi, S.Pd. (IPS)', jenis_kelamin: 'Laki-laki', no_hp: '085699001122', status_aktif: true },
  { id: 'g-24', nip: '198912242015032002', nama: 'Nur Hasanah, S.E. (IPS)', jenis_kelamin: 'Perempuan', no_hp: '081244332211', status_aktif: true },
  { id: 'g-25', nip: '199107292020081003', nama: 'Andi Wijaya, S.Pd. (PJOK)', jenis_kelamin: 'Laki-laki', no_hp: '089611223344', status_aktif: true },
  { id: 'g-26', nip: '199311052022032004', nama: 'Ratna Sari, S.Sn. (Seni Budaya)', jenis_kelamin: 'Perempuan', no_hp: '087711223344', status_aktif: true },
  { id: 'g-27', nip: '198108172008011003', nama: 'H. Burhanuddin, S.Ag. (PAI)', jenis_kelamin: 'Laki-laki', no_hp: '081399887766', status_aktif: true },
  { id: 'g-28', nip: '199504102022011001', nama: 'Farhan Azis, S.Kom. (Informatika)', jenis_kelamin: 'Laki-laki', no_hp: '089988776655', status_aktif: true }
];

export const MOCK_MAPEL: MataPelajaran[] = [
  { id: 'm-1', kode_mapel: 'MAT', nama_mapel: 'Matematika', jumlah_jam_per_minggu: 5 },
  { id: 'm-2', kode_mapel: 'IND', nama_mapel: 'Bahasa Indonesia', jumlah_jam_per_minggu: 5 },
  { id: 'm-3', kode_mapel: 'IPA', nama_mapel: 'Ilmu Pengetahuan Alam', jumlah_jam_per_minggu: 4 },
  { id: 'm-4', kode_mapel: 'ING', nama_mapel: 'Bahasa Inggris', jumlah_jam_per_minggu: 4 },
  { id: 'm-5', kode_mapel: 'IPS', nama_mapel: 'Ilmu Pengetahuan Sosial', jumlah_jam_per_minggu: 3 },
  { id: 'm-6', kode_mapel: 'PJK', nama_mapel: 'Pendidikan Jasmani, Olahraga & Kesehatan', jumlah_jam_per_minggu: 3 },
  { id: 'm-7', kode_mapel: 'SEN', nama_mapel: 'Seni Budaya', jumlah_jam_per_minggu: 2 },
  { id: 'm-8', kode_mapel: 'AGM', nama_mapel: 'Pendidikan Agama & Budi Pekerti', jumlah_jam_per_minggu: 3 },
  { id: 'm-9', kode_mapel: 'PPN', nama_mapel: 'Pendidikan Pancasila', jumlah_jam_per_minggu: 3 },
  { id: 'm-10', kode_mapel: 'INF', nama_mapel: 'Informatika', jumlah_jam_per_minggu: 2 },
  { id: 'm-12', kode_mapel: 'MLO', nama_mapel: 'Bahasa Daerah (Muatan Lokal)', jumlah_jam_per_minggu: 2 },
  { id: 'm-13', kode_mapel: 'BK', nama_mapel: 'Bimbingan Konseling', jumlah_jam_per_minggu: 1 }
];

export const MOCK_KELAS: Kelas[] = [
  { id: 'c-1', nama_kelas: 'VII A', tingkat: 'VII', wali_kelas: 'Drs. H. Ahmad Subarjo, M.Pd.' },
  { id: 'c-2', nama_kelas: 'VII B', tingkat: 'VII', wali_kelas: 'Siti Rahma, S.Pd., M.Pd.' },
  { id: 'c-3', nama_kelas: 'VII C', tingkat: 'VII', wali_kelas: 'Dr. Bambang Wijaya, M.Si.' },
  { id: 'c-4', nama_kelas: 'VII D', tingkat: 'VII', wali_kelas: 'Rina Kartika, S.S., M.Hum.' },
  { id: 'c-5', nama_kelas: 'VIII A', tingkat: 'VIII', wali_kelas: 'Budi Hartono, S.Pd.' },
  { id: 'c-6', nama_kelas: 'VIII B', tingkat: 'VIII', wali_kelas: 'Mega Utama, M.Pd.' },
  { id: 'c-7', nama_kelas: 'VIII C', tingkat: 'VIII', wali_kelas: 'Diana Putri, S.Pd.' },
  { id: 'c-8', nama_kelas: 'VIII D', tingkat: 'VIII', wali_kelas: 'Dra. Endang Lestari' },
  { id: 'c-9', nama_kelas: 'IX A', tingkat: 'IX', wali_kelas: 'Yusuf Mansur, S.Pd.' },
  { id: 'c-10', nama_kelas: 'IX B', tingkat: 'IX', wali_kelas: 'Ahmad Fauzi, M.Hum.' },
  { id: 'c-11', nama_kelas: 'IX C', tingkat: 'IX', wali_kelas: 'Slamet Riadi, S.Pd.' },
  { id: 'c-12', nama_kelas: 'IX D', tingkat: 'IX', wali_kelas: 'Farhan Azis, S.Kom.' }
];

export const MOCK_RUANGAN: Ruangan[] = [
  { id: 'r-1', nama_ruangan: 'Kelas VII A', kapasitas: 32 },
  { id: 'r-2', nama_ruangan: 'Kelas VII B', kapasitas: 32 },
  { id: 'r-3', nama_ruangan: 'Kelas VII C', kapasitas: 32 },
  { id: 'r-4', nama_ruangan: 'Kelas VII D', kapasitas: 32 },
  { id: 'r-5', nama_ruangan: 'Kelas VIII A', kapasitas: 32 },
  { id: 'r-6', nama_ruangan: 'Kelas VIII B', kapasitas: 32 },
  { id: 'r-7', nama_ruangan: 'Kelas VIII C', kapasitas: 32 },
  { id: 'r-8', nama_ruangan: 'Kelas VIII D', kapasitas: 32 },
  { id: 'r-9', nama_ruangan: 'Kelas IX A', kapasitas: 32 },
  { id: 'r-10', nama_ruangan: 'Kelas IX B', kapasitas: 32 },
  { id: 'r-11', nama_ruangan: 'Kelas IX C', kapasitas: 32 },
  { id: 'r-12', nama_ruangan: 'Kelas IX D', kapasitas: 32 },
  { id: 'r-13', nama_ruangan: 'Laboratorium Komputer', kapasitas: 40 },
  { id: 'r-14', nama_ruangan: 'Lapangan Olahraga', kapasitas: 80 },
  { id: 'r-15', nama_ruangan: 'Laboratorium IPA', kapasitas: 36 }
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
  // --- KELAS VII A ---
  { id: 'a-7a-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-1', jumlah_jam: 3 },
  { id: 'a-7a-2', guru_id: 'g-9', mapel_id: 'm-9', kelas_id: 'c-1', jumlah_jam: 3 },
  { id: 'a-7a-3', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-1', jumlah_jam: 5 },
  { id: 'a-7a-4', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-1', jumlah_jam: 5 },
  { id: 'a-7a-5', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-1', jumlah_jam: 4 },
  { id: 'a-7a-6', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-1', jumlah_jam: 4 },
  { id: 'a-7a-7', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-1', jumlah_jam: 3 },
  { id: 'a-7a-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-1', jumlah_jam: 3 },
  { id: 'a-7a-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-1', jumlah_jam: 2 },
  { id: 'a-7a-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-1', jumlah_jam: 2 },
  { id: 'a-7a-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-1', jumlah_jam: 2 },
  { id: 'a-7a-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-1', jumlah_jam: 1 },

  // --- KELAS VII B ---
  { id: 'a-7b-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-2', jumlah_jam: 3 },
  { id: 'a-7b-2', guru_id: 'g-9', mapel_id: 'm-9', kelas_id: 'c-2', jumlah_jam: 3 },
  { id: 'a-7b-3', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-2', jumlah_jam: 5 },
  { id: 'a-7b-4', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-2', jumlah_jam: 5 },
  { id: 'a-7b-5', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-2', jumlah_jam: 4 },
  { id: 'a-7b-6', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-2', jumlah_jam: 4 },
  { id: 'a-7b-7', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-2', jumlah_jam: 3 },
  { id: 'a-7b-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-2', jumlah_jam: 3 },
  { id: 'a-7b-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-2', jumlah_jam: 2 },
  { id: 'a-7b-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-2', jumlah_jam: 2 },
  { id: 'a-7b-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-2', jumlah_jam: 2 },
  { id: 'a-7b-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-2', jumlah_jam: 1 },

  // --- KELAS VII C ---
  { id: 'a-7c-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-3', jumlah_jam: 3 },
  { id: 'a-7c-2', guru_id: 'g-9', mapel_id: 'm-9', kelas_id: 'c-3', jumlah_jam: 3 },
  { id: 'a-7c-3', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-3', jumlah_jam: 5 },
  { id: 'a-7c-4', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-3', jumlah_jam: 5 },
  { id: 'a-7c-5', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-3', jumlah_jam: 4 },
  { id: 'a-7c-6', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-3', jumlah_jam: 4 },
  { id: 'a-7c-7', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-3', jumlah_jam: 3 },
  { id: 'a-7c-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-3', jumlah_jam: 3 },
  { id: 'a-7c-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-3', jumlah_jam: 2 },
  { id: 'a-7c-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-3', jumlah_jam: 2 },
  { id: 'a-7c-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-3', jumlah_jam: 2 },
  { id: 'a-7c-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-3', jumlah_jam: 1 },

  // --- KELAS VII D ---
  { id: 'a-7d-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-4', jumlah_jam: 3 },
  { id: 'a-7d-2', guru_id: 'g-9', mapel_id: 'm-9', kelas_id: 'c-4', jumlah_jam: 3 },
  { id: 'a-7d-3', guru_id: 'g-18', mapel_id: 'm-2', kelas_id: 'c-4', jumlah_jam: 5 },
  { id: 'a-7d-4', guru_id: 'g-15', mapel_id: 'm-1', kelas_id: 'c-4', jumlah_jam: 5 },
  { id: 'a-7d-5', guru_id: 'g-21', mapel_id: 'm-4', kelas_id: 'c-4', jumlah_jam: 4 },
  { id: 'a-7d-6', guru_id: 'g-16', mapel_id: 'm-3', kelas_id: 'c-4', jumlah_jam: 4 },
  { id: 'a-7d-7', guru_id: 'g-23', mapel_id: 'm-5', kelas_id: 'c-4', jumlah_jam: 3 },
  { id: 'a-7d-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-4', jumlah_jam: 3 },
  { id: 'a-7d-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-4', jumlah_jam: 2 },
  { id: 'a-7d-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-4', jumlah_jam: 2 },
  { id: 'a-7d-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-4', jumlah_jam: 2 },
  { id: 'a-7d-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-4', jumlah_jam: 1 },

  // --- KELAS VIII A ---
  { id: 'a-8a-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-5', jumlah_jam: 3 },
  { id: 'a-8a-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-5', jumlah_jam: 3 },
  { id: 'a-8a-3', guru_id: 'g-2', mapel_id: 'm-2', kelas_id: 'c-5', jumlah_jam: 5 },
  { id: 'a-8a-4', guru_id: 'g-1', mapel_id: 'm-1', kelas_id: 'c-5', jumlah_jam: 5 },
  { id: 'a-8a-5', guru_id: 'g-4', mapel_id: 'm-4', kelas_id: 'c-5', jumlah_jam: 4 },
  { id: 'a-8a-6', guru_id: 'g-3', mapel_id: 'm-3', kelas_id: 'c-5', jumlah_jam: 4 },
  { id: 'a-8a-7', guru_id: 'g-5', mapel_id: 'm-5', kelas_id: 'c-5', jumlah_jam: 3 },
  { id: 'a-8a-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-5', jumlah_jam: 3 },
  { id: 'a-8a-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-5', jumlah_jam: 2 },
  { id: 'a-8a-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-5', jumlah_jam: 2 },
  { id: 'a-8a-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-5', jumlah_jam: 2 },
  { id: 'a-8a-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-5', jumlah_jam: 1 },

  // --- KELAS VIII B ---
  { id: 'a-8b-1', guru_id: 'g-8', mapel_id: 'm-8', kelas_id: 'c-6', jumlah_jam: 3 },
  { id: 'a-8b-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-6', jumlah_jam: 3 },
  { id: 'a-8b-3', guru_id: 'g-18', mapel_id: 'm-2', kelas_id: 'c-6', jumlah_jam: 5 },
  { id: 'a-8b-4', guru_id: 'g-15', mapel_id: 'm-1', kelas_id: 'c-6', jumlah_jam: 5 },
  { id: 'a-8b-5', guru_id: 'g-21', mapel_id: 'm-4', kelas_id: 'c-6', jumlah_jam: 4 },
  { id: 'a-8b-6', guru_id: 'g-16', mapel_id: 'm-3', kelas_id: 'c-6', jumlah_jam: 4 },
  { id: 'a-8b-7', guru_id: 'g-23', mapel_id: 'm-5', kelas_id: 'c-6', jumlah_jam: 3 },
  { id: 'a-8b-8', guru_id: 'g-6', mapel_id: 'm-6', kelas_id: 'c-6', jumlah_jam: 3 },
  { id: 'a-8b-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-6', jumlah_jam: 2 },
  { id: 'a-8b-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-6', jumlah_jam: 2 },
  { id: 'a-8b-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-6', jumlah_jam: 2 },
  { id: 'a-8b-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-6', jumlah_jam: 1 },

  // --- KELAS VIII C ---
  { id: 'a-8c-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-7', jumlah_jam: 3 },
  { id: 'a-8c-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-7', jumlah_jam: 3 },
  { id: 'a-8c-3', guru_id: 'g-18', mapel_id: 'm-2', kelas_id: 'c-7', jumlah_jam: 5 },
  { id: 'a-8c-4', guru_id: 'g-15', mapel_id: 'm-1', kelas_id: 'c-7', jumlah_jam: 5 },
  { id: 'a-8c-5', guru_id: 'g-21', mapel_id: 'm-4', kelas_id: 'c-7', jumlah_jam: 4 },
  { id: 'a-8c-6', guru_id: 'g-16', mapel_id: 'm-3', kelas_id: 'c-7', jumlah_jam: 4 },
  { id: 'a-8c-7', guru_id: 'g-23', mapel_id: 'm-5', kelas_id: 'c-7', jumlah_jam: 3 },
  { id: 'a-8c-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-7', jumlah_jam: 3 },
  { id: 'a-8c-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-7', jumlah_jam: 2 },
  { id: 'a-8c-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-7', jumlah_jam: 2 },
  { id: 'a-8c-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-7', jumlah_jam: 2 },
  { id: 'a-8c-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-7', jumlah_jam: 1 },

  // --- KELAS VIII D ---
  { id: 'a-8d-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-8', jumlah_jam: 3 },
  { id: 'a-8d-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-8', jumlah_jam: 3 },
  { id: 'a-8d-3', guru_id: 'g-18', mapel_id: 'm-2', kelas_id: 'c-8', jumlah_jam: 5 },
  { id: 'a-8d-4', guru_id: 'g-15', mapel_id: 'm-1', kelas_id: 'c-8', jumlah_jam: 5 },
  { id: 'a-8d-5', guru_id: 'g-21', mapel_id: 'm-4', kelas_id: 'c-8', jumlah_jam: 4 },
  { id: 'a-8d-6', guru_id: 'g-16', mapel_id: 'm-3', kelas_id: 'c-8', jumlah_jam: 4 },
  { id: 'a-8d-7', guru_id: 'g-23', mapel_id: 'm-5', kelas_id: 'c-8', jumlah_jam: 3 },
  { id: 'a-8d-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-8', jumlah_jam: 3 },
  { id: 'a-8d-9', guru_id: 'g-7', mapel_id: 'm-7', kelas_id: 'c-8', jumlah_jam: 2 },
  { id: 'a-8d-10', guru_id: 'g-11', mapel_id: 'm-10', kelas_id: 'c-8', jumlah_jam: 2 },
  { id: 'a-8d-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-8', jumlah_jam: 2 },
  { id: 'a-8d-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-8', jumlah_jam: 1 },

  // --- KELAS IX A ---
  { id: 'a-9a-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-9', jumlah_jam: 3 },
  { id: 'a-9a-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-9', jumlah_jam: 3 },
  { id: 'a-9a-3', guru_id: 'g-19', mapel_id: 'm-2', kelas_id: 'c-9', jumlah_jam: 5 },
  { id: 'a-9a-4', guru_id: 'g-17', mapel_id: 'm-1', kelas_id: 'c-9', jumlah_jam: 5 },
  { id: 'a-9a-5', guru_id: 'g-22', mapel_id: 'm-4', kelas_id: 'c-9', jumlah_jam: 4 },
  { id: 'a-9a-6', guru_id: 'g-20', mapel_id: 'm-3', kelas_id: 'c-9', jumlah_jam: 4 },
  { id: 'a-9a-7', guru_id: 'g-24', mapel_id: 'm-5', kelas_id: 'c-9', jumlah_jam: 3 },
  { id: 'a-9a-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-9', jumlah_jam: 3 },
  { id: 'a-9a-9', guru_id: 'g-26', mapel_id: 'm-7', kelas_id: 'c-9', jumlah_jam: 2 },
  { id: 'a-9a-10', guru_id: 'g-28', mapel_id: 'm-10', kelas_id: 'c-9', jumlah_jam: 2 },
  { id: 'a-9a-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-9', jumlah_jam: 2 },
  { id: 'a-9a-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-9', jumlah_jam: 1 },

  // --- KELAS IX B ---
  { id: 'a-9b-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-10', jumlah_jam: 3 },
  { id: 'a-9b-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-10', jumlah_jam: 3 },
  { id: 'a-9b-3', guru_id: 'g-19', mapel_id: 'm-2', kelas_id: 'c-10', jumlah_jam: 5 },
  { id: 'a-9b-4', guru_id: 'g-17', mapel_id: 'm-1', kelas_id: 'c-10', jumlah_jam: 5 },
  { id: 'a-9b-5', guru_id: 'g-22', mapel_id: 'm-4', kelas_id: 'c-10', jumlah_jam: 4 },
  { id: 'a-9b-6', guru_id: 'g-20', mapel_id: 'm-3', kelas_id: 'c-10', jumlah_jam: 4 },
  { id: 'a-9b-7', guru_id: 'g-24', mapel_id: 'm-5', kelas_id: 'c-10', jumlah_jam: 3 },
  { id: 'a-9b-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-10', jumlah_jam: 3 },
  { id: 'a-9b-9', guru_id: 'g-26', mapel_id: 'm-7', kelas_id: 'c-10', jumlah_jam: 2 },
  { id: 'a-9b-10', guru_id: 'g-28', mapel_id: 'm-10', kelas_id: 'c-10', jumlah_jam: 2 },
  { id: 'a-9b-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-10', jumlah_jam: 2 },
  { id: 'a-9b-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-10', jumlah_jam: 1 },

  // --- KELAS IX C ---
  { id: 'a-9c-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-11', jumlah_jam: 3 },
  { id: 'a-9c-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-11', jumlah_jam: 3 },
  { id: 'a-9c-3', guru_id: 'g-19', mapel_id: 'm-2', kelas_id: 'c-11', jumlah_jam: 5 },
  { id: 'a-9c-4', guru_id: 'g-17', mapel_id: 'm-1', kelas_id: 'c-11', jumlah_jam: 5 },
  { id: 'a-9c-5', guru_id: 'g-22', mapel_id: 'm-4', kelas_id: 'c-11', jumlah_jam: 4 },
  { id: 'a-9c-6', guru_id: 'g-20', mapel_id: 'm-3', kelas_id: 'c-11', jumlah_jam: 4 },
  { id: 'a-9c-7', guru_id: 'g-24', mapel_id: 'm-5', kelas_id: 'c-11', jumlah_jam: 3 },
  { id: 'a-9c-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-11', jumlah_jam: 3 },
  { id: 'a-9c-9', guru_id: 'g-26', mapel_id: 'm-7', kelas_id: 'c-11', jumlah_jam: 2 },
  { id: 'a-9c-10', guru_id: 'g-28', mapel_id: 'm-10', kelas_id: 'c-11', jumlah_jam: 2 },
  { id: 'a-9c-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-11', jumlah_jam: 2 },
  { id: 'a-9c-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-11', jumlah_jam: 1 },

  // --- KELAS IX D ---
  { id: 'a-9d-1', guru_id: 'g-27', mapel_id: 'm-8', kelas_id: 'c-12', jumlah_jam: 3 },
  { id: 'a-9d-2', guru_id: 'g-10', mapel_id: 'm-9', kelas_id: 'c-12', jumlah_jam: 3 },
  { id: 'a-9d-3', guru_id: 'g-19', mapel_id: 'm-2', kelas_id: 'c-12', jumlah_jam: 5 },
  { id: 'a-9d-4', guru_id: 'g-17', mapel_id: 'm-1', kelas_id: 'c-12', jumlah_jam: 5 },
  { id: 'a-9d-5', guru_id: 'g-22', mapel_id: 'm-4', kelas_id: 'c-12', jumlah_jam: 4 },
  { id: 'a-9d-6', guru_id: 'g-20', mapel_id: 'm-3', kelas_id: 'c-12', jumlah_jam: 4 },
  { id: 'a-9d-7', guru_id: 'g-24', mapel_id: 'm-5', kelas_id: 'c-12', jumlah_jam: 3 },
  { id: 'a-9d-8', guru_id: 'g-25', mapel_id: 'm-6', kelas_id: 'c-12', jumlah_jam: 3 },
  { id: 'a-9d-9', guru_id: 'g-26', mapel_id: 'm-7', kelas_id: 'c-12', jumlah_jam: 2 },
  { id: 'a-9d-10', guru_id: 'g-28', mapel_id: 'm-10', kelas_id: 'c-12', jumlah_jam: 2 },
  { id: 'a-9d-11', guru_id: 'g-13', mapel_id: 'm-12', kelas_id: 'c-12', jumlah_jam: 2 },
  { id: 'a-9d-12', guru_id: 'g-14', mapel_id: 'm-13', kelas_id: 'c-12', jumlah_jam: 1 }
];

export const MOCK_PREFERENSI: PreferensiGuru[] = [
  {
    id: 'p-g-1',
    guru_id: 'g-1',
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Selasa', 'Rabu'],
    jam_favorit: [3, 4],
    max_jam_per_hari: 6,
    slot_tidak_bersedia: [
      { hari: 'Senin', jam_ke: 7 },
      { hari: 'Senin', jam_ke: 8 }
    ]
  },
  {
    id: 'p-g-2',
    guru_id: 'g-2',
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Kamis'],
    jam_favorit: [1, 2],
    max_jam_per_hari: 6,
    slot_tidak_bersedia: [
      { hari: 'Rabu', jam_ke: 1 },
      { hari: 'Rabu', jam_ke: 2 }
    ]
  },
  {
    id: 'p-g-3',
    guru_id: 'g-3',
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Senin', 'Selasa'],
    jam_favorit: [2, 3],
    max_jam_per_hari: 6,
    slot_tidak_bersedia: [
      { hari: 'Kamis', jam_ke: 5 },
      { hari: 'Kamis', jam_ke: 6 }
    ]
  },
  {
    id: 'p-g-4',
    guru_id: 'g-4',
    hari_tidak_bersedia: [],
    jam_tidak_bersedia: [],
    hari_favorit: ['Senin', 'Jumat'],
    jam_favorit: [3, 4],
    max_jam_per_hari: 6,
    slot_tidak_bersedia: [
      { hari: 'Selasa', jam_ke: 7 },
      { hari: 'Selasa', jam_ke: 8 }
    ]
  }
];

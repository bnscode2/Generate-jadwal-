import { getSupabaseClient, isSupabaseModeActive } from './supabaseClient';
import { LocalDB } from './db';
import { Guru, MataPelajaran, Kelas, Ruangan, JamPelajaran, PengampuMataPelajaran, PreferensiGuru, Jadwal, KonflikJadwal } from './types';

// Helper to check if string is a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Map local IDs to valid UUIDs to satisfy PostgreSQL constraints, ensuring relationships are preserved
class IDMapper {
  private static maps: { [key: string]: string } = {};

  static getUUID(localId: string): string {
    if (!localId) return '';
    if (isValidUUID(localId)) return localId;
    
    const key = `mapped_${localId}`;
    if (this.maps[key]) {
      return this.maps[key];
    }

    // Buat UUID baru secara acak
    const newUUID = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        
    this.maps[key] = newUUID;
    return newUUID;
  }

  static reset() {
    this.maps = {};
  }
}

export interface SyncResult {
  success: boolean;
  message: string;
  logs: string[];
}

export class SupabaseSyncService {
  // 1. Cek Koneksi ke Supabase
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase belum dikonfigurasi. Silakan isi URL dan Anon Key.' };
    }
    try {
      // Coba lakukan select sederhana ke tabel teachers atau profiles
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        // Jika error karena masalah auth rls atau tabel tidak ketemu, jelaskan detailnya
        return { 
          success: false, 
          message: `Koneksi tersambung, namun database mengembalikan error: ${error.message}. Pastikan Anda sudah menjalankan script migrasi SQL.` 
        };
      }
      return { success: true, message: 'Koneksi ke Supabase berhasil! Aplikasi siap mensinkronkan data.' };
    } catch (err: any) {
      return { success: false, message: `Gagal menyambung ke Supabase: ${err.message || String(err)}` };
    }
  }

  // 2. Push Semua Data dari LocalDB ke Supabase (Upload)
  static async pushAll(): Promise<SyncResult> {
    const logs: string[] = [];
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase tidak aktif atau belum terkonfigurasi.', logs };
    }

    try {
      logs.push('Memulai proses unggah data ke Supabase...');
      IDMapper.reset();

      // Ambil data lokal
      const teachers = LocalDB.getGuru();
      const subjects = LocalDB.getMapel();
      const classes = LocalDB.getKelas();
      const rooms = LocalDB.getRuangan();
      const periods = LocalDB.getJamPelajaran();
      const preferences = LocalDB.getPreferensi();
      const assignments = LocalDB.getPengampu();
      const schedules = LocalDB.getJadwal();
      const conflicts = LocalDB.getConflicts();

      // Coba dapatkan user authenticated jika ada, jika tidak, gunakan NULL (akan memicu RLS jika tidak login, jadi kami ingatkan)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      logs.push(userId && user ? `User authenticated terdeteksi: ${user.email}` : 'Menjalankan tanpa session auth Supabase (menggunakan default RLS bypass atau public access)');

      // Fungsi bantu upsert dengan payload terisi
      const upsertTable = async (table: string, items: any[]) => {
        if (items.length === 0) return;
        const { error } = await supabase.from(table).upsert(items);
        if (error) {
          throw new Error(`Gagal menulis ke tabel ${table}: ${error.message}`);
        }
      };

      // 1. Teachers
      const mappedTeachers = teachers.map(t => ({
        id: IDMapper.getUUID(t.id),
        nip: t.nip,
        nama: t.nama,
        jenis_kelamin: t.jenis_kelamin,
        no_hp: t.no_hp || '',
        status_aktif: t.status_aktif,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('teachers', mappedTeachers);
      logs.push(`Berhasil mengunggah ${mappedTeachers.length} data Guru.`);

      // 2. Subjects
      const mappedSubjects = subjects.map(s => ({
        id: IDMapper.getUUID(s.id),
        kode_mapel: s.kode_mapel,
        nama_mapel: s.nama_mapel,
        jumlah_jam_per_minggu: s.jumlah_jam_per_minggu,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('subjects', mappedSubjects);
      logs.push(`Berhasil mengunggah ${mappedSubjects.length} data Mata Pelajaran.`);

      // 3. Classes
      const mappedClasses = classes.map(c => ({
        id: IDMapper.getUUID(c.id),
        nama_kelas: c.nama_kelas,
        tingkat: c.tingkat,
        wali_kelas: c.wali_kelas || '',
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('classes', mappedClasses);
      logs.push(`Berhasil mengunggah ${mappedClasses.length} data Kelas.`);

      // 4. Rooms
      const mappedRooms = rooms.map(r => ({
        id: IDMapper.getUUID(r.id),
        nama_ruangan: r.nama_ruangan,
        kapasitas: r.kapasitas,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('rooms', mappedRooms);
      logs.push(`Berhasil mengunggah ${mappedRooms.length} data Ruangan.`);

      // 5. Periods (Jam Pelajaran)
      const mappedPeriods = periods.map(p => ({
        id: IDMapper.getUUID(p.id),
        jam_ke: p.jam_ke,
        jam_mulai: p.jam_mulai.includes(':') ? p.jam_mulai : `${p.jam_mulai}:00`,
        jam_selesai: p.jam_selesai.includes(':') ? p.jam_selesai : `${p.jam_selesai}:00`,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('periods', mappedPeriods);
      logs.push(`Berhasil mengunggah ${mappedPeriods.length} data Jam Pelajaran.`);

      // 6. Teacher Preferences
      const mappedPreferences = preferences.map(p => ({
        id: IDMapper.getUUID(p.id),
        guru_id: IDMapper.getUUID(p.guru_id),
        hari_tidak_bersedia: p.hari_tidak_bersedia,
        jam_tidak_bersedia: p.jam_tidak_bersedia,
        hari_favorit: p.hari_favorit || [],
        jam_favorit: p.jam_favorit || [],
        max_jam_per_hari: p.max_jam_per_hari,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('teacher_preferences', mappedPreferences);
      logs.push(`Berhasil mengunggah ${mappedPreferences.length} data Preferensi Guru.`);

      // 7. Teaching Assignments (Pengampu)
      const mappedAssignments = assignments.map(a => ({
        id: IDMapper.getUUID(a.id),
        guru_id: IDMapper.getUUID(a.guru_id),
        mapel_id: IDMapper.getUUID(a.mapel_id),
        kelas_id: IDMapper.getUUID(a.kelas_id),
        jumlah_jam: a.jumlah_jam,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('teaching_assignments', mappedAssignments);
      logs.push(`Berhasil mengunggah ${mappedAssignments.length} data Pengampu Mata Pelajaran.`);

      // 8. Schedules (Jadwal)
      const mappedSchedules = schedules.map(s => ({
        id: IDMapper.getUUID(s.id),
        assignment_id: s.assignment_id ? IDMapper.getUUID(s.assignment_id) : null,
        guru_id: IDMapper.getUUID(s.guru_id),
        mapel_id: IDMapper.getUUID(s.mapel_id),
        kelas_id: IDMapper.getUUID(s.kelas_id),
        ruangan_id: IDMapper.getUUID(s.ruangan_id),
        hari: s.hari,
        jam_ke: s.jam_ke,
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('schedules', mappedSchedules);
      logs.push(`Berhasil mengunggah ${mappedSchedules.length} data Jadwal Pelajaran.`);

      // 9. Schedule Conflicts (Konflik)
      const mappedConflicts = conflicts.map(c => ({
        id: IDMapper.getUUID(c.id),
        tipe_konflik: c.tipe_konflik,
        deskripsi: c.deskripsi,
        hari: c.hari,
        jam_ke: c.jam_ke,
        entities_involved: c.entities_involved || [],
        ...(userId ? { user_id: userId } : {})
      }));
      await upsertTable('schedule_conflicts', mappedConflicts);
      logs.push(`Berhasil mengunggah ${mappedConflicts.length} data Deteksi Konflik.`);

      logs.push('SINKRONISASI UNGGAH BERHASIL! Seluruh data lokal kini tersimpan dengan aman di Supabase cloud.');
      return { success: true, message: 'Seluruh data berhasil diunggah ke Supabase!', logs };

    } catch (err: any) {
      console.error('Error push ke Supabase:', err);
      logs.push(`ERROR: ${err.message || String(err)}`);
      return { success: false, message: `Gagal mengunggah data: ${err.message || String(err)}`, logs };
    }
  }

  // 3. Pull Semua Data dari Supabase ke LocalDB (Download)
  static async pullAll(): Promise<SyncResult> {
    const logs: string[] = [];
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase tidak aktif atau belum terkonfigurasi.', logs };
    }

    try {
      logs.push('Mengunduh seluruh data dari database Supabase cloud...');

      // Ambil data satu persatu dari Supabase
      const fetchTable = async (table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          throw new Error(`Gagal membaca dari tabel ${table}: ${error.message}`);
        }
        return data || [];
      };

      const teachersData = await fetchTable('teachers');
      logs.push(`Terunduh ${teachersData.length} data Guru.`);

      const subjectsData = await fetchTable('subjects');
      logs.push(`Terunduh ${subjectsData.length} data Mata Pelajaran.`);

      const classesData = await fetchTable('classes');
      logs.push(`Terunduh ${classesData.length} data Kelas.`);

      const roomsData = await fetchTable('rooms');
      logs.push(`Terunduh ${roomsData.length} data Ruangan.`);

      const periodsData = await fetchTable('periods');
      logs.push(`Terunduh ${periodsData.length} data Jam Pelajaran.`);

      const preferencesData = await fetchTable('teacher_preferences');
      logs.push(`Terunduh ${preferencesData.length} data Preferensi Guru.`);

      const assignmentsData = await fetchTable('teaching_assignments');
      logs.push(`Terunduh ${assignmentsData.length} data Pengampu Mata Pelajaran.`);

      const schedulesData = await fetchTable('schedules');
      logs.push(`Terunduh ${schedulesData.length} data Jadwal Pelajaran.`);

      // Petakan kembali ke format LocalDB
      const localTeachers: Guru[] = teachersData.map(t => ({
        id: t.id,
        nip: t.nip,
        nama: t.nama,
        jenis_kelamin: t.jenis_kelamin,
        no_hp: t.no_hp || '',
        status_aktif: t.status_aktif
      }));

      const localSubjects: MataPelajaran[] = subjectsData.map(s => ({
        id: s.id,
        kode_mapel: s.kode_mapel,
        nama_mapel: s.nama_mapel,
        jumlah_jam_per_minggu: s.jumlah_jam_per_minggu
      }));

      const localClasses: Kelas[] = classesData.map(c => ({
        id: c.id,
        nama_kelas: c.nama_kelas,
        tingkat: c.tingkat,
        wali_kelas: c.wali_kelas || ''
      }));

      const localRooms: Ruangan[] = roomsData.map(r => ({
        id: r.id,
        nama_ruangan: r.nama_ruangan,
        kapasitas: r.kapasitas
      }));

      const localPeriods: JamPelajaran[] = periodsData.map(p => ({
        id: p.id,
        jam_ke: p.jam_ke,
        jam_mulai: p.jam_mulai.substring(0, 5), // '07:30:00' -> '07:30'
        jam_selesai: p.jam_selesai.substring(0, 5)
      })).sort((a, b) => a.jam_ke - b.jam_ke);

      const localPreferences: PreferensiGuru[] = preferencesData.map(p => ({
        id: p.id,
        guru_id: p.guru_id,
        hari_tidak_bersedia: p.hari_tidak_bersedia || [],
        jam_tidak_bersedia: p.jam_tidak_bersedia || [],
        hari_favorit: p.hari_favorit || [],
        jam_favorit: p.jam_favorit || [],
        max_jam_per_hari: p.max_jam_per_hari || 6
      }));

      const localAssignments: PengampuMataPelajaran[] = assignmentsData.map(a => ({
        id: a.id,
        guru_id: a.guru_id,
        mapel_id: a.mapel_id,
        kelas_id: a.kelas_id,
        jumlah_jam: a.jumlah_jam
      }));

      const localSchedules: Jadwal[] = schedulesData.map(s => ({
        id: s.id,
        assignment_id: s.assignment_id || '',
        guru_id: s.guru_id,
        mapel_id: s.mapel_id,
        kelas_id: s.kelas_id,
        ruangan_id: s.ruangan_id,
        hari: s.hari,
        jam_ke: s.jam_ke
      }));

      // Tulis ulang seluruh data ke LocalDB
      LocalDB.saveGuru(localTeachers);
      LocalDB.saveMapel(localSubjects);
      LocalDB.saveKelas(localClasses);
      LocalDB.saveRuangan(localRooms);
      LocalDB.saveJamPelajaran(localPeriods);
      LocalDB.savePreferensi(localPreferences);
      LocalDB.savePengampu(localAssignments);
      LocalDB.saveJadwal(localSchedules);

      logs.push('SINKRONISASI UNDUH BERHASIL! Data lokal Anda kini sama persis dengan data di Supabase cloud.');
      return { success: true, message: 'Seluruh data berhasil diunduh dari Supabase!', logs };

    } catch (err: any) {
      console.error('Error pull dari Supabase:', err);
      logs.push(`ERROR: ${err.message || String(err)}`);
      return { success: false, message: `Gagal mengunduh data: ${err.message || String(err)}`, logs };
    }
  }

  // 4. Sinkronisasi Otomatis Item Tunggal ke Supabase saat Mengedit (Opsional background sync)
  static async syncSingleItem(table: string, action: 'upsert' | 'delete', itemPayload: any): Promise<void> {
    if (!isSupabaseModeActive()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const payload = {
        ...itemPayload,
        ...(userId ? { user_id: userId } : {})
      };

      if (action === 'upsert') {
        await supabase.from(table).upsert(payload);
      } else if (action === 'delete') {
        await supabase.from(table).delete().eq('id', itemPayload.id);
      }
    } catch (err) {
      console.error(`Gagal melakukan sync single item ke tabel ${table}:`, err);
    }
  }
}

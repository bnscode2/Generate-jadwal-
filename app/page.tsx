'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  BookOpen, 
  Layers, 
  Home, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Database, 
  Activity,
  Menu,
  Lock,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Info,
  X,
  ShieldCheck,
  School,
  CloudUpload,
  Check,
  Briefcase,
  HelpCircle
} from 'lucide-react';

import { 
  Guru, 
  MataPelajaran, 
  Kelas, 
  Ruangan, 
  JamPelajaran, 
  PengampuMataPelajaran, 
  PreferensiGuru, 
  Jadwal, 
  KonflikJadwal, 
  Hari,
  ScheduleVersion
} from '../lib/types';

import { LocalDB } from '../lib/db';
import { CalendarScheduler } from '../lib/scheduler';
import { getSupabaseClient, isSupabaseModeActive, getAuthenticatedSessionWithTimeout } from '../lib/supabaseClient';
import { SupabaseSyncService } from '../lib/supabaseSync';

import DashboardTab from '../components/DashboardTab';
import GuruTab from '../components/GuruTab';
import MapelTab from '../components/MapelTab';
import KelasTab from '../components/KelasTab';
import PengampuTab from '../components/PengampuTab';
import GenerateTab from '../components/GenerateTab';
import GridTab from '../components/GridTab';
import KonflikTab from '../components/KonflikTab';
import SupabaseTab from '../components/SupabaseTab';
import PengaturanWaktuTab from '../components/PengaturanWaktuTab';
import ActivationTab from '../components/ActivationTab';
import AdminTab from '../components/AdminTab';
import SchoolProfileTab from '../components/SchoolProfileTab';
import BebanKerjaTab from '../components/BebanKerjaTab';
import YayasanUnitSwitcher from '../components/YayasanUnitSwitcher';
import VersionsTab from '../components/VersionsTab';
import TutorialTab from '../components/TutorialTab';

export default function AdministrativeDashboard() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Data Master State
  const [guru, setGuru] = useState<Guru[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [jamPelajaran, setJamPelajaran] = useState<JamPelajaran[]>([]);
  const [pengampu, setPengampu] = useState<PengampuMataPelajaran[]>([]);
  const [preferensi, setPreferensi] = useState<PreferensiGuru[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [conflicts, setConflicts] = useState<KonflikJadwal[]>([]);
  const [hariAktif, setHariAktif] = useState<Hari[]>([]);
  const [batasJamHari, setBatasJamHari] = useState<Record<Hari, number>>({
    'Senin': 8,
    'Selasa': 8,
    'Rabu': 8,
    'Kamis': 8,
    'Jumat': 8,
    'Sabtu': 8,
    'Minggu': 8,
  });

  // Simulation settings
  const [algorithm, setAlgorithm] = useState<'csp' | 'genetic'>('csp');
  const [allowPartial, setAllowPartial] = useState<boolean>(true);
  const [connMode, setConnMode] = useState<'mock' | 'supabase'>('mock');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [stats, setStats] = useState<{
    executionTimeMs: number;
    score: number;
    totalLessonsNeeded?: number;
    totalLessonsPlotted?: number;
    totalConflicts?: number;
  }>({ executionTimeMs: 0, score: 0 });

  // Filter Grid State
  const [filterType, setFilterType] = useState<'kelas' | 'guru' | 'ruangan'>('kelas');
  const [filterId, setFilterId] = useState<string>('');

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Forms Input State
  const [newGuru, setNewGuru] = useState<Partial<Guru>>({ nama: '', nip: '', jenis_kelamin: 'Laki-laki', no_hp: '', status_aktif: true });
  const [newMapel, setNewMapel] = useState<Partial<MataPelajaran>>({ kode_mapel: '', nama_mapel: '', jumlah_jam_per_minggu: 4 });
  const [newKelas, setNewKelas] = useState<Partial<Kelas>>({ nama_kelas: '', tingkat: 'VII', wali_kelas: '' });
  const [newRuangan, setNewRuangan] = useState<Partial<Ruangan>>({ nama_ruangan: '', kapasitas: 32 });
  const [newPengampu, setNewPengampu] = useState<Partial<PengampuMataPelajaran>>({ guru_id: '', mapel_id: '', kelas_id: '', jumlah_jam: 4 });

  // Selected cell for manual swaps
  const [selectedCell, setSelectedCell] = useState<{ hari: Hari; jam_ke: number; scheduleId?: string | null } | null>(null);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'reset_master' | 'clear_schedule' | 'logout' | 'delete_guru' | 'delete_mapel' | 'delete_kelas' | 'delete_ruangan' | 'delete_pengampu' | 'delete_schedule' | 'save_pending_tab' | 'switch_to_real' | 'switch_to_demo';
    onConfirm?: () => void;
  } | null>(null);

  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Logout Loader States
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [logoutStatus, setLogoutStatus] = useState<'loading' | 'success'>('loading');

  // Mode Transition States
  const [isTransitioningMode, setIsTransitioningMode] = useState<boolean>(false);
  const [transitionStepText, setTransitionStepText] = useState<string>('');

  // Auth States
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const isAdmin = currentUser?.username?.toLowerCase() === 'admin' || 
                  currentUser?.role?.toLowerCase() === 'admin' || 
                  currentUser?.role?.toLowerCase() === 'administrator' ||
                  currentUser?.username?.toLowerCase() === 'balkhi05@gmail.com';
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authNamaSekolah, setAuthNamaSekolah] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');

  // Google Auth States
  const [showGooglePopup, setShowGooglePopup] = useState<boolean>(false);
  const [googleStep, setGoogleStep] = useState<'select' | 'new' | 'school'>('select');
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState<string>('');
  const [selectedGoogleName, setSelectedGoogleName] = useState<string>('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [customGoogleName, setCustomGoogleName] = useState<string>('');
  const [googleSchoolName, setGoogleSchoolName] = useState<string>('SMP Negeri 1 AI Indonesia');

  const checkSupabaseSession = async () => {
    if (!isSupabaseModeActive()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const session = await getAuthenticatedSessionWithTimeout(8000).catch((err: any) => {
        console.error('Gagal mengambil session Supabase (timeout/error):', err);
        return null;
      });

      if (session?.user) {
        const sbUser = session.user;
        
        // Ambil profil sekolah dan status PRO serta role dari table profiles Supabase
        let dbProfile = null;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('nama_sekolah, is_pro, serial_key, activated_at, role')
            .eq('id', sbUser.id)
            .maybeSingle();
          if (!error && data) {
            dbProfile = data;
          } else if (!error && !data) {
            // Profile does not exist, let's create a default profile on the fly!
            const defaultSchoolName = sbUser.user_metadata?.school_name || sbUser.user_metadata?.nama_sekolah || 'SMP Negeri 1 AI Indonesia';
            const defaultRole = sbUser.email?.toLowerCase() === 'balkhi05@gmail.com' ? 'admin' : 'user';
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: sbUser.id,
                nama_sekolah: defaultSchoolName,
                is_pro: false,
                email: sbUser.email,
                role: defaultRole
              })
              .select('nama_sekolah, is_pro, serial_key, activated_at, role')
              .maybeSingle();
              
            if (!insertError && newProfile) {
              dbProfile = newProfile;
              console.log("Profile baru otomatis dibuat di Supabase profiles.");
            } else if (insertError) {
              console.error("Gagal membuat profile baru otomatis:", insertError.message);
            }
          }
        } catch (dbErr) {
          console.error("Gagal membaca profiles dari Supabase:", dbErr);
        }

        const isPro = dbProfile ? !!dbProfile.is_pro : false;
        const serialKey = dbProfile ? dbProfile.serial_key : null;
        const activatedAt = dbProfile ? dbProfile.activated_at : null;
        const schoolName = dbProfile?.nama_sekolah || sbUser.user_metadata?.school_name || sbUser.user_metadata?.nama_sekolah || 'SMP Negeri 1 AI Indonesia';
        const userRole = dbProfile?.role || (sbUser.email?.toLowerCase() === 'balkhi05@gmail.com' ? 'admin' : 'user');
        
        // Mapped user in format LocalDB expects
        const mappedUser = {
          id: sbUser.id,
          username: sbUser.email || sbUser.id,
          password: '', // Google auth / Supabase auth
          nama_sekolah: schoolName,
          role: userRole,
          isGoogle: true,
          is_pro: isPro,
          serial_key: serialKey,
          activated_at: activatedAt,
          displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.displayName || sbUser.email?.split('@')[0] || 'User'
        };

        // Save to users list locally if not present
        const users = LocalDB.getUsers();
        const userIdx = users.findIndex(u => u.username.toLowerCase() === mappedUser.username.toLowerCase());
        if (userIdx === -1) {
          users.push(mappedUser);
          LocalDB.saveUsers(users);
        } else {
          users[userIdx] = { ...users[userIdx], ...mappedUser };
          LocalDB.saveUsers(users);
        }

        localStorage.setItem('sch_current_user', JSON.stringify(mappedUser));
        setCurrentUser(mappedUser);
        setAuthSuccess(`Berhasil masuk via Google: ${mappedUser.displayName}`);
        setAuthError('');
        
        // Let's also sync data down automatically if they just logged in!
        try {
          // Check if local database is NOT empty but cloud database is completely empty
          const hasLocalData = LocalDB.getGuru().length > 0 || LocalDB.getMapel().length > 0 || LocalDB.getKelas().length > 0;
          
          let pushedInsteadOfPulled = false;
          if (hasLocalData) {
            const supabaseInstance = getSupabaseClient();
            if (supabaseInstance) {
              const { data: cloudTeachers, error: checkError } = await supabaseInstance.from('teachers').select('id').limit(1);
              const cloudIsEmpty = !checkError && (!cloudTeachers || cloudTeachers.length === 0);
              
              if (cloudIsEmpty) {
                // If cloud is empty and we have local data, PUSH first so we don't wipe local data!
                const pushResult = await SupabaseSyncService.pushAll();
                if (pushResult.success) {
                  setLogMessages(prev => [`🔄 Data lokal Anda berhasil diunggah (disinkronkan) ke akun cloud Supabase baru Anda!`, ...prev]);
                  loadDatabase(true);
                  pushedInsteadOfPulled = true;
                }
              }
            }
          }

          if (!pushedInsteadOfPulled) {
            const pullResult = await SupabaseSyncService.pullAll();
            if (pullResult.success) {
              setLogMessages(prev => [`🔄 Data berhasil disinkronkan otomatis dari Supabase cloud!`, ...prev]);
              loadDatabase(true);
            }
          }
        } catch (pullErr) {
          console.error("Gagal auto-pull saat login:", pullErr);
        }
      }
    } catch (err) {
      console.error('Error saat memeriksa session Supabase:', err);
    }
  };

  const handleGoogleLoginClick = async () => {
    if (isSupabaseModeActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        setAuthError('');
        setAuthSuccess('Membuka Google Authentication...');
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/`,
              skipBrowserRedirect: true
            }
          });
          
          if (error) {
            setAuthError(`Gagal menghubungkan Google Auth: ${error.message}`);
            setAuthSuccess('');
            return;
          }

          if (data?.url) {
            // Open the real Google Auth url directly in a popup window
            const authWindow = window.open(
              data.url,
              'google_oauth_popup',
              'width=600,height=700'
            );

            if (!authWindow) {
              setAuthError('Popup diblokir! Izinkan pop-up untuk login menggunakan Google.');
              setAuthSuccess('');
            }
          } else {
            setAuthError('Gagal memuat URL autentikasi Google.');
            setAuthSuccess('');
          }
        } catch (err: any) {
          setAuthError(`Error Google Sign-In: ${err.message || String(err)}`);
          setAuthSuccess('');
        }
      }
    } else {
      // Fallback ke simulasi (Mock) untuk demo offline/lokal
      setGoogleStep('select');
      setShowGooglePopup(true);
    }
  };

  const handleGoogleAccountSelect = (email: string, name: string) => {
    setSelectedGoogleEmail(email);
    setSelectedGoogleName(name);
    
    // Check if user already exists
    const users = LocalDB.getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      // Already exists, direct login
      localStorage.setItem('sch_current_user', JSON.stringify(existingUser));
      setCurrentUser(existingUser);
      setAuthSuccess(`Berhasil masuk dengan Google sebagai ${name}!`);
      setShowGooglePopup(false);
      setAuthError('');
    } else {
      // First time, ask for School Name
      setGoogleSchoolName('SMP Negeri 1 AI Indonesia');
      setGoogleStep('school');
    }
  };

  const handleGoogleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSchoolName.trim()) return;

    // Register user locally via Google
    const users = LocalDB.getUsers();
    const newUser = {
      username: selectedGoogleEmail,
      password: '', // Google Auth does not use local password
      nama_sekolah: googleSchoolName.trim(),
      role: 'Administrator',
      isGoogle: true,
      displayName: selectedGoogleName
    };

    users.push(newUser);
    LocalDB.saveUsers(users);

    // Auto login
    localStorage.setItem('sch_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setAuthSuccess(`Registrasi berhasil! Selamat datang di JP Penjadwalan Sekolah.`);
    setShowGooglePopup(false);
    setAuthError('');
  };

  const syncTimeoutRef = useRef<any>(null);
  const generatorWorkerRef = useRef<Worker | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [backgroundSyncStatus, setBackgroundSyncStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');

  // Modern interactive sync states
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');
  const [syncShowModal, setSyncShowModal] = useState<boolean>(false);
  const [syncResultState, setSyncResultState] = useState<'syncing' | 'success' | 'failed' | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string>('');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Keep a ref of isCloudSyncing so our background sync interval is stable and does not get reset constantly
  const isCloudSyncingRef = useRef<boolean>(isCloudSyncing);
  useEffect(() => {
    isCloudSyncingRef.current = isCloudSyncing;
  }, [isCloudSyncing]);

  // Set initial sync time on load if Supabase mode is active
  useEffect(() => {
    if (isSupabaseModeActive() && currentUser && !lastSyncTime) {
      setLastSyncTime(new Date());
    }
  }, [currentUser, lastSyncTime]);

  const handleManualForceSync = async () => {
    if (!isSupabaseModeActive() || !currentUser) return;
    
    setSyncProgress(0);
    setSyncStatusText('Menghubungkan ke Supabase...');
    setSyncShowModal(true);
    setSyncResultState('syncing');
    setSyncErrorMessage('');
    setSyncLogs(['🔄 Memulai sinkronisasi paksa dari Cloud...']);

    setBackgroundSyncStatus('checking');
    setLogMessages(prev => ["🔄 Memulai sinkronisasi manual paksa...", ...prev]);
    try {
      const res = await Promise.race([
        SupabaseSyncService.pullAll((percent, msg) => {
          setSyncProgress(percent);
          setSyncStatusText(msg);
          setSyncLogs(prev => [...prev, msg]);
        }),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Batas waktu sinkronisasi terlampaui')), 25000)
        )
      ]);
      if (res.success) {
        setLastSyncTime(new Date());
        setBackgroundSyncStatus('success');
        loadDatabase(true);
        setLogMessages(prev => ["✅ Sinkronisasi manual berhasil! Data lokal diselaraskan dengan Cloud.", ...prev]);
        setSyncProgress(100);
        setSyncStatusText('Sinkronisasi Berhasil!');
        setSyncResultState('success');
        setSyncLogs(prev => [...prev, '✅ Seluruh data lokal Anda sekarang 100% selaras dengan cloud.']);
      } else {
        setBackgroundSyncStatus('failed');
        setLogMessages(prev => [`⚠️ Sinkronisasi gagal: ${res.message}`, ...prev]);
        setSyncResultState('failed');
        setSyncErrorMessage(res.message);
        setSyncLogs(prev => [...prev, `❌ Gagal: ${res.message}`]);
      }
    } catch (err: any) {
      setBackgroundSyncStatus('failed');
      setLogMessages(prev => [`❌ Error sinkronisasi manual: ${err.message || String(err)}`, ...prev]);
      setSyncResultState('failed');
      setSyncErrorMessage(err.message || String(err));
      setSyncLogs(prev => [...prev, `❌ Error: ${err.message || String(err)}`]);
    } finally {
      setTimeout(() => setBackgroundSyncStatus('idle'), 3000);
    }
  };

  const handlePushAllToCloud = async () => {
    if (!isSupabaseModeActive() || !currentUser) return;
    
    setSyncProgress(0);
    setSyncStatusText('Menyiapkan data penyimpanan...');
    setSyncShowModal(true);
    setSyncResultState('syncing');
    setSyncErrorMessage('');
    setSyncLogs(['🔄 Memulai pengunggahan seluruh data lokal ke Cloud...']);

    setIsCloudSyncing(true);
    setLogMessages(prev => ["🔄 Mengunggah seluruh data lokal Anda ke cloud...", ...prev]);
    try {
      const res = await SupabaseSyncService.pushAll((percent, msg) => {
        setSyncProgress(percent);
        setSyncStatusText(msg);
        setSyncLogs(prev => [...prev, msg]);
      });
      if (res.success) {
        setHasUnsavedChanges(false);
        setLastSyncTime(new Date());
        setLogMessages(prev => ["✅ Unggah seluruh data berhasil! Data cloud kini selaras dengan data browser Anda.", ...prev]);
        setSyncProgress(100);
        setSyncStatusText('Penyimpanan Berhasil!');
        setSyncResultState('success');
        setSyncLogs(prev => [...prev, '✅ Penyimpanan sukses! Seluruh data Anda tersimpan di Cloud.']);
      } else {
        setLogMessages(prev => [`⚠️ Gagal mengunggah data: ${res.message}`, ...prev]);
        setSyncResultState('failed');
        setSyncErrorMessage(res.message);
        setSyncLogs(prev => [...prev, `❌ Gagal menyimpan: ${res.message}`]);
      }
    } catch (err: any) {
      console.error(err);
      setLogMessages(prev => [`⚠️ Kesalahan saat mengunggah: ${err.message || err}`, ...prev]);
      setSyncResultState('failed');
      setSyncErrorMessage(err.message || String(err));
      setSyncLogs(prev => [...prev, `❌ Kesalahan: ${err.message || String(err)}`]);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Terminate any running web worker on component unmount
  useEffect(() => {
    return () => {
      if (generatorWorkerRef.current) {
        generatorWorkerRef.current.terminate();
      }
    };
  }, []);

  // Load and refresh state
  const loadDatabase = (skipCloudSync = false) => {
    setIsDemoMode(LocalDB.isDemoMode());
    setGuru(LocalDB.getGuru());
    setMapel(LocalDB.getMapel());
    setKelas(LocalDB.getKelas());
    setRuangan(LocalDB.getRuangan());
    setJamPelajaran(LocalDB.getJamPelajaran());
    setPengampu(LocalDB.getPengampu());
    setPreferensi(LocalDB.getPreferensi());
    setJadwal(LocalDB.getJadwal());
    setConflicts(LocalDB.getConflicts());
    setHariAktif(LocalDB.getHariAktif());
    setBatasJamHari(LocalDB.getBatasJamHari());

    // Sync currentUser state in React with the local storage if changed
    const currUser = LocalDB.getCurrentUser();
    if (currUser) {
      const hasChanged = !currentUser ||
        currentUser.id !== currUser.id ||
        currentUser.username !== currUser.username ||
        currentUser.role !== currUser.role ||
        currentUser.is_pro !== currUser.is_pro ||
        currentUser.nama_sekolah !== currUser.nama_sekolah;
      if (hasChanged) {
        setCurrentUser(currUser);
      }
    }
  };

  const handleSaveAndNavigate = async () => {
    if (!pendingTab) return;
    setConfirmModal(null);
    
    setSyncProgress(0);
    setSyncStatusText('Menyimpan data sebelum berpindah halaman...');
    setSyncShowModal(true);
    setSyncResultState('syncing');
    setSyncErrorMessage('');
    setSyncLogs([`🔄 Menyimpan seluruh data ke cloud sebelum berpindah ke halaman ${pendingTab}...`]);

    setIsCloudSyncing(true);
    setLogMessages(prev => [`🔄 Menyimpan seluruh data ke cloud sebelum berpindah ke halaman ${pendingTab}...`, ...prev]);
    try {
      const res = await SupabaseSyncService.pushAll((percent, msg) => {
        setSyncProgress(percent);
        setSyncStatusText(msg);
        setSyncLogs(prev => [...prev, msg]);
      });
      if (res.success) {
        setHasUnsavedChanges(false);
        setLastSyncTime(new Date());
        setLogMessages(prev => ["✅ Penyimpanan sukses sebelum berpindah halaman!", ...prev]);
        setSyncProgress(100);
        setSyncStatusText('Penyimpanan Berhasil!');
        setSyncResultState('success');
        setSyncLogs(prev => [...prev, `✅ Berhasil disimpan! Menunggu Anda mengklik lanjutkan untuk berpindah ke "${pendingTab}".`]);
      } else {
        setLogMessages(prev => [`⚠️ Gagal mengunggah data: ${res.message}`, ...prev]);
        setSyncResultState('failed');
        setSyncErrorMessage(res.message);
        setSyncLogs(prev => [...prev, `❌ Gagal menyimpan: ${res.message}`]);
      }
    } catch (err: any) {
      console.error(err);
      setLogMessages(prev => [`⚠️ Kesalahan saat mengunggah: ${err.message || err}`, ...prev]);
      setSyncResultState('failed');
      setSyncErrorMessage(err.message || String(err));
      setSyncLogs(prev => [...prev, `❌ Kesalahan: ${err.message || String(err)}`]);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleDiscardAndNavigate = () => {
    if (!pendingTab) return;
    const target = pendingTab;
    setPendingTab(null);
    setConfirmModal(null);
    setActiveTab(target);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSetActiveTab = (tab: string) => {
    if (tab === activeTab) return;

    if (isSupabaseModeActive() && currentUser && hasUnsavedChanges && !isDemoMode) {
      setPendingTab(tab);
      setConfirmModal({
        isOpen: true,
        title: 'Ada Perubahan Belum Disimpan',
        message: `Anda memiliki perubahan data terbaru di browser Anda yang belum disimpan ke Supabase Cloud. Apakah Anda ingin mengunggah seluruh data ke Cloud terlebih dahulu sebelum berpindah ke halaman "${tab}"?`,
        type: 'save_pending_tab'
      });
    } else {
      setActiveTab(tab);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  // Auth actions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (!authUsername || !authPassword) {
      setAuthError('Harap isi username dan password.');
      return;
    }
    
    const result = LocalDB.login(authUsername, authPassword);
    if (result.success) {
      setAuthSuccess('Berhasil masuk!');
      setCurrentUser(result.user);
      setAuthUsername('');
      setAuthPassword('');
    } else {
      setAuthError(result.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (!authUsername || !authPassword || !authNamaSekolah) {
      setAuthError('Semua kolom registrasi wajib diisi.');
      return;
    }
    
    const result = LocalDB.register(authUsername, authPassword, authNamaSekolah);
    if (result.success) {
      setAuthSuccess(result.message);
      // Auto login
      const loginRes = LocalDB.login(authUsername, authPassword);
      if (loginRes.success) {
        setCurrentUser(loginRes.user);
      }
      setAuthUsername('');
      setAuthPassword('');
      setAuthNamaSekolah('');
    } else {
      setAuthError(result.message);
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Keluar Sesi',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi pembuat jadwal? Sesi login Anda saat ini akan diakhiri.',
      type: 'logout'
    });
  };

  const executeLogout = async () => {
    setConfirmModal(null);
    setSelectedCell(null);
    
    // Aktifkan loader state logout yang profesional
    setIsLoggingOut(true);
    setLogoutStatus('loading');

    // Berikan jeda waktu sejenak agar transisi visual terasa memuaskan dan stabil
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (isSupabaseModeActive()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          // Memberikan batas waktu 3 detik untuk signOut agar tidak membuat UI tersangkut (stuck)
          await Promise.race([
            supabase.auth.signOut(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Sign out timeout')), 3000))
          ]);
        } catch (err) {
          console.warn("Supabase signOut timeout/error diabaikan untuk melanjutkan pembersihan sesi lokal:", err);
        }
      }
    }
    // Selalu pastikan status loading cloud disetel ke false & bersihkan timer sync yang tertunda
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    setIsCloudSyncing(false);
    LocalDB.logout();
    
    // Ubah status ke sukses untuk memberikan feedback checklist visual yang intuitif
    setLogoutStatus('success');
    
    // Berikan kesempatan kepada user untuk melihat konfirmasi sukses sebelum reload
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lakukan pembersihan total (hard reset) state React di memori browser dengan memicu reload halaman secara bersih.
    // Ini merupakan standar praktik terbaik aplikasi profesional untuk mencegah sisa-sisa cache di React memory saling bertabrakan/tersangkut saat berganti akun.
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      setCurrentUser(null);
      setIsLoggingOut(false);
    }
  };

  // Check auth state initially and handle popup redirect callback
  useEffect(() => {
    const user = LocalDB.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    let authSubscription: any = null;
    let pollInterval: any = null;

    if (isSupabaseModeActive()) {
      checkSupabaseSession();

      const supabase = getSupabaseClient();
      if (supabase) {
        // Subscribe to auth state changes - fires when session is created or refreshed anywhere in the browser
        const { data } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          console.log("Supabase Auth State Event:", event);
          if (session?.user) {
            await checkSupabaseSession();
          }
        });
        authSubscription = data.subscription;
      }

      // Add backup polling interval to ensure we check session every 1.5 seconds if not logged in
      pollInterval = setInterval(async () => {
        const currentUserNow = LocalDB.getCurrentUser();
        if (!currentUserNow) {
          const supabaseInstance = getSupabaseClient();
          if (supabaseInstance) {
            const { data: { session } } = await supabaseInstance.auth.getSession();
            if (session?.user) {
              console.log("Backup polling found active session!");
              await checkSupabaseSession();
            }
          }
        } else {
          // If we are logged in, we can clear this backup poll
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      }, 1500);
    }

    // 1. Listen for cross-window messages from the OAuth popup
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      // Allow from current origin or .run.app to support AI Studio Preview URL
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log("OAuth Success Message Received from popup");
        setAuthSuccess("Login Google Berhasil! Sedang menyinkronkan session...");
        
        // Explicity set the session in the parent's Supabase instance to sync immediately
        const receivedSession = event.data?.session;
        if (receivedSession) {
          const supabase = getSupabaseClient();
          if (supabase) {
            try {
              await supabase.auth.setSession({
                access_token: receivedSession.access_token,
                refresh_token: receivedSession.refresh_token
              });
              console.log("Session successfully set on parent window from popup payload!");
            } catch (setSessErr) {
              console.error("Error setting session on parent:", setSessErr);
            }
          }
        }
        
        // Wait a tiny moment for local storage / state changes to finalize, then check session
        setTimeout(async () => {
          await checkSupabaseSession();
        }, 150);
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // 2. If the current page itself is running inside a popup opened by opener, notify opener and close
    if (typeof window !== 'undefined' && window.opener) {
      try {
        console.log("Detecting that this window is an OAuth popup callback. Posting message back to opener...");
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase.auth.getSession().then((res: any) => {
            const session = res?.data?.session;
            window.opener.postMessage({ 
              type: 'OAUTH_AUTH_SUCCESS',
              session: session || null
            }, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          }).catch((err: any) => {
            console.error("Error getting session in popup:", err);
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          });
        } else {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          setTimeout(() => {
            window.close();
          }, 600);
        }
      } catch (err) {
        console.error("Failed to notify opener:", err);
      }
    }

    return () => {
      window.removeEventListener('message', handleOAuthMessage);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload database when user switches
  useEffect(() => {
    if (currentUser) {
      loadDatabase();
    }
  }, [currentUser]);

  // Update default filter options when master data loads
  useEffect(() => {
    if (filterType === 'kelas' && kelas.length > 0 && !filterId) {
      setFilterId(kelas[0].id);
    } else if (filterType === 'guru' && guru.length > 0 && !filterId) {
      setFilterId(guru[0].id);
    } else if (filterType === 'ruangan' && ruangan.length > 0 && !filterId) {
      setFilterId(ruangan[0].id);
    }
  }, [filterType, kelas, guru, ruangan, filterId]);

  // Handle resetting data
  const handleReset = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Atur Ulang & Pembersihan Data Master',
      message: 'Silakan pilih tindakan yang Anda inginkan untuk data master sistem Anda.',
      type: 'reset_master'
    });
  };

  const handleClearJadwal = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kosongkan Seluruh Jadwal',
      message: 'Apakah Anda yakin ingin menghapus/mengosongkan seluruh jadwal pelajaran yang telah disusun saat ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'clear_schedule'
    });
  };

  const executeResetDemo = () => {
    LocalDB.resetToDefault();
    loadDatabase();
    setLogMessages(prev => ['Sistem berhasil disetel ulang ke Data Demo Sekolah SMAN AI.', ...prev]);
    setSelectedCell(null);
    setConfirmModal(null);
  };

  const handleSwitchToRealMode = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Beralih ke Mode Asli (Mulai Bersih)',
      message: 'Apakah Anda yakin ingin menyelesaikan masa uji coba dan beralih ke Mode Asli? Seluruh data contoh/simulasi saat ini (guru, kelas, mapel, jadwal) akan dihapus secara total untuk memberikan Anda lembar kosong yang bersih guna menginput data riil sekolah Anda. Tindakan ini tidak akan merusak struktur data asli, melainkan menyiapkannya dari nol secara profesional. Tindakan ini tidak dapat dibatalkan.',
      type: 'switch_to_real'
    });
  };

  const handleSwitchToDemoMode = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Aktifkan Mode Demo (Data Simulasi)',
      message: 'Apakah Anda yakin ingin beralih kembali ke Mode Demo? Tindakan ini akan mengisi ulang database lokal Anda saat ini dengan data contoh/simulasi sekolah agar Anda dapat melakukan eksperimen dan uji coba fitur secara instan.',
      type: 'switch_to_demo'
    });
  };

  const executeSwitchToRealMode = async () => {
    setConfirmModal(null);
    setIsTransitioningMode(true);
    setTransitionStepText('Mengosongkan cache simulasi lokal secara aman...');
    
    // Berikan jeda waktu agar transisi visual terasa memuaskan dan stabil
    await new Promise(resolve => setTimeout(resolve, 800));

    LocalDB.setDemoMode(false);
    loadDatabase(true);

    const activeUser = LocalDB.getCurrentUser();
    if (isSupabaseModeActive() && activeUser) {
      setTransitionStepText('Menghubungkan ke cloud database dan mengunduh data riil...');
      await new Promise(resolve => setTimeout(resolve, 900));
      try {
        const pullResult = await SupabaseSyncService.pullAll();
        if (pullResult.success) {
          loadDatabase(true);
          setLogMessages(prev => ['Sistem berhasil beralih ke Mode Asli & data riil berhasil diunduh dari Supabase cloud!', ...prev]);
        } else {
          setLogMessages(prev => ['Sistem berhasil beralih ke Mode Asli. Cloud database kosong atau tidak dapat diakses.', ...prev]);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi otomatis dari Supabase:", err);
        setLogMessages(prev => ['Sistem berhasil beralih ke Mode Asli (Data kosong).', ...prev]);
      }
    } else {
      setLogMessages(prev => ['Sistem berhasil beralih ke Mode Asli. Seluruh data cache/simulasi telah dikosongkan secara profesional!', ...prev]);
    }

    setTransitionStepText('Memvalidasi integritas basis data...');
    await new Promise(resolve => setTimeout(resolve, 600));

    setSelectedCell(null);
    setIsTransitioningMode(false);
  };

  const executeSwitchToDemoMode = async () => {
    setConfirmModal(null);
    setIsTransitioningMode(true);
    setTransitionStepText('Mengaktifkan Mode Sandbox & menyiapkan instansi data...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    LocalDB.setDemoMode(true);
    loadDatabase(true);

    setLogMessages(prev => ['Sistem berhasil beralih ke Mode Demo dengan data simulasi sekolah SMP AI.', ...prev]);
    setTransitionStepText('Memuat data simulasi sekolah SMP Negeri 1 AI...');
    await new Promise(resolve => setTimeout(resolve, 600));

    setSelectedCell(null);
    setIsTransitioningMode(false);
  };

  const executeClearAllMaster = () => {
    LocalDB.setDemoMode(false);
    loadDatabase(true);
    setLogMessages(prev => ['Seluruh data master (Guru, Mapel, Kelas, Ruangan, Pengampu, Preferensi) & Jadwal berhasil dibersihkan. Sistem kini aktif dalam Mode Asli.', ...prev]);
    setSelectedCell(null);
    setConfirmModal(null);
  };

  const executeClearJadwal = () => {
    LocalDB.saveJadwal([]);
    loadDatabase();
    setLogMessages(prev => ['Jadwal pelajaran berhasil dikosongkan.', ...prev]);
    setSelectedCell(null);
    setConfirmModal(null);
  };

  // --- CRUD GURU ---
  const handleAddGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuru.nama || !newGuru.nip) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }

    // Validasi Duplikasi NIP (Standard Profesional)
    const normalizedNip = newGuru.nip.trim();
    const existingGuruWithSameNip = guru.find(
      g => g.nip.trim().toLowerCase() === normalizedNip.toLowerCase()
    );

    if (existingGuruWithSameNip) {
      alert(`Peringatan Validasi: NIP "${normalizedNip}" sudah terdaftar atas nama "${existingGuruWithSameNip.nama}". Mohon gunakan nomor NIP lain yang unik.`);
      return;
    }

    const created: Guru = {
      id: `guru-${Date.now()}`,
      nip: newGuru.nip,
      nama: newGuru.nama,
      jenis_kelamin: newGuru.jenis_kelamin || 'Laki-laki',
      no_hp: newGuru.no_hp || '',
      status_aktif: newGuru.status_aktif !== undefined ? newGuru.status_aktif : true,
    };
    
    // Auto populate basic preferences for this new teacher
    const defaultPref: PreferensiGuru = {
      id: `pref-${created.id}`,
      guru_id: created.id,
      hari_tidak_bersedia: [],
      jam_tidak_bersedia: [],
      hari_favorit: [],
      jam_favorit: [],
      max_jam_per_hari: 6
    };

    setNewGuru({ nama: '', nip: '', jenis_kelamin: 'Laki-laki', no_hp: '', status_aktif: true });

    if (isSupabaseModeActive() && currentUser) {
      try {
        // Direct and immediate cloud save first
        await SupabaseSyncService.syncTeacher(created, 'upsert');
        await SupabaseSyncService.syncPreference(defaultPref, 'upsert');
        
        // Save to LocalDB to keep cache identical
        const updated = [...guru, created];
        LocalDB.saveGuru(updated);
        LocalDB.savePreferensi([...preferensi, defaultPref]);
        loadDatabase(true);
        
        setLogMessages(prev => ["☁️ [Real-time] Guru baru dan preferensinya berhasil langsung disimpan ke Supabase Cloud!", ...prev]);
        alert("Guru baru berhasil didaftarkan langsung ke cloud database.");
      } catch (err: any) {
        console.error("Gagal sinkronisasi guru baru ke cloud:", err);
        // Fallback to local on failure
        const updated = [...guru, created];
        LocalDB.saveGuru(updated);
        LocalDB.savePreferensi([...preferensi, defaultPref]);
        setHasUnsavedChanges(true);
        loadDatabase(true);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal menyimpan ke Cloud (${err.message}). Data disimpan lokal.`, ...prev]);
        alert(`Gagal menyimpan langsung ke cloud: ${err.message || String(err)}. Data tetap disimpan di lokal.`);
      }
    } else {
      // Offline/sandbox mode
      const updated = [...guru, created];
      LocalDB.saveGuru(updated);
      LocalDB.savePreferensi([...preferensi, defaultPref]);
      loadDatabase(true);
      setLogMessages(prev => ["Guru baru disimpan di penyimpanan lokal.", ...prev]);
    }
  };

  const handleDeleteGuru = (id: string) => {
    const target = guru.find(g => g.id === id);
    const targetName = target ? target.nama : 'Guru';
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Guru',
      message: `Apakah Anda yakin ingin menghapus guru "${targetName}"? Seluruh data preferensi, tugas pengampu, dan jadwal terkait akan ikut dihapus secara permanen dari sistem.`,
      type: 'delete_guru',
      onConfirm: async () => {
        if (isSupabaseModeActive() && currentUser && target) {
          try {
            // Direct and immediate cloud deletion
            await SupabaseSyncService.syncTeacher(target, 'delete');
            
            // Delete locally as well
            const filteredGuru = guru.filter(g => g.id !== id);
            const filteredAssignment = pengampu.filter(a => a.guru_id !== id);
            const filteredPref = preferensi.filter(p => p.guru_id !== id);
            const filteredSched = jadwal.filter(s => s.guru_id !== id);
            
            LocalDB.saveGuru(filteredGuru);
            LocalDB.savePengampu(filteredAssignment);
            LocalDB.savePreferensi(filteredPref);
            LocalDB.saveJadwal(filteredSched);
            loadDatabase(true);

            setLogMessages(prev => [`☁️ [Real-time] Guru "${targetName}" beserta seluruh relasinya berhasil dihapus langsung dari Supabase Cloud!`, ...prev]);
            setSelectedCell(null);
            setConfirmModal(null);
            alert(`Guru "${targetName}" berhasil dihapus langsung dari cloud database.`);
          } catch (err: any) {
            console.error("Gagal sinkronisasi hapus guru:", err);
            // Fallback: Delete locally and mark unsaved changes
            const filteredGuru = guru.filter(g => g.id !== id);
            const filteredAssignment = pengampu.filter(a => a.guru_id !== id);
            const filteredPref = preferensi.filter(p => p.guru_id !== id);
            const filteredSched = jadwal.filter(s => s.guru_id !== id);
            
            LocalDB.saveGuru(filteredGuru);
            LocalDB.savePengampu(filteredAssignment);
            LocalDB.savePreferensi(filteredPref);
            LocalDB.saveJadwal(filteredSched);
            setHasUnsavedChanges(true);
            loadDatabase(true);

            setLogMessages(prev => [`⚠️ Peringatan: Gagal menghapus langsung dari Cloud (${err.message}). Terhapus lokal, harap sinkronkan nanti.`, ...prev]);
            setSelectedCell(null);
            setConfirmModal(null);
            alert(`Gagal menghapus langsung dari cloud: ${err.message || String(err)}. Data terhapus lokal, harap sinkronkan manual.`);
          }
        } else {
          // Offline/sandbox mode
          const filteredGuru = guru.filter(g => g.id !== id);
          const filteredAssignment = pengampu.filter(a => a.guru_id !== id);
          const filteredPref = preferensi.filter(p => p.guru_id !== id);
          const filteredSched = jadwal.filter(s => s.guru_id !== id);
          
          LocalDB.saveGuru(filteredGuru);
          LocalDB.savePengampu(filteredAssignment);
          LocalDB.savePreferensi(filteredPref);
          LocalDB.saveJadwal(filteredSched);
          loadDatabase(true);

          setLogMessages(prev => [`Data guru "${targetName}" berhasil dihapus secara lokal.`, ...prev]);
          setSelectedCell(null);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleUpdateGuru = async (updatedGuru: Guru) => {
    // Validasi Duplikasi NIP (Standard Profesional)
    const normalizedNip = updatedGuru.nip.trim();
    const existingGuruWithSameNip = guru.find(
      g => g.id !== updatedGuru.id && g.nip.trim().toLowerCase() === normalizedNip.toLowerCase()
    );

    if (existingGuruWithSameNip) {
      alert(`Peringatan Validasi: Gagal memperbarui data guru. NIP "${normalizedNip}" sudah digunakan oleh guru lain ("${existingGuruWithSameNip.nama}"). Silakan periksa atau ganti NIP.`);
      return;
    }

    if (isSupabaseModeActive() && currentUser) {
      try {
        // Direct and immediate cloud update
        await SupabaseSyncService.syncTeacher(updatedGuru, 'upsert');
        
        // Update locally
        const updated = guru.map(g => g.id === updatedGuru.id ? updatedGuru : g);
        LocalDB.saveGuru(updated);
        loadDatabase(true);
        
        setLogMessages(prev => [`☁️ [Real-time] Pembaruan biodata guru ${updatedGuru.nama} berhasil langsung disimpan ke Supabase Cloud!`, ...prev]);
        alert(`Biodata guru "${updatedGuru.nama}" berhasil diperbarui langsung ke cloud database.`);
      } catch (err: any) {
        console.error("Gagal sinkronisasi update guru:", err);
        // Fallback: Update locally and mark unsaved changes
        const updated = guru.map(g => g.id === updatedGuru.id ? updatedGuru : g);
        LocalDB.saveGuru(updated);
        setHasUnsavedChanges(true);
        loadDatabase(true);
        
        setLogMessages(prev => [`⚠️ Peringatan: Gagal memperbarui langsung ke Cloud (${err.message}). Diperbarui lokal.`, ...prev]);
        alert(`Gagal memperbarui ke cloud: ${err.message || String(err)}. Diperbarui lokal.`);
      }
    } else {
      // Offline/sandbox mode
      const updated = guru.map(g => g.id === updatedGuru.id ? updatedGuru : g);
      LocalDB.saveGuru(updated);
      loadDatabase(true);
      setLogMessages(prev => [`Biodata guru ${updatedGuru.nama} berhasil diperbarui secara lokal.`, ...prev]);
    }
  };

  // --- CRUD MAPEL ---
  const handleAddMapel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapel.nama_mapel || !newMapel.kode_mapel) {
      alert('Nama mapel dan kode mapel wajib diisi.');
      return;
    }
    const created: MataPelajaran = {
      id: `mapel-${Date.now()}`,
      kode_mapel: newMapel.kode_mapel.toUpperCase(),
      nama_mapel: newMapel.nama_mapel,
      jumlah_jam_per_minggu: Number(newMapel.jumlah_jam_per_minggu) || 4,
    };

    // Always save locally first!
    const updated = [...mapel, created];
    LocalDB.saveMapel(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setNewMapel({ kode_mapel: '', nama_mapel: '', jumlah_jam_per_minggu: 4 });

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncSubject(created, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Mata pelajaran "${created.nama_mapel}" diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi mapel ke cloud:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal mensinkronisasikan mapel ke Cloud (${err.message}). Data disimpan lokal, silakan simpan manual nanti.`, ...prev]);
      }
    }
  };

  const handleDeleteMapel = (id: string) => {
    const target = mapel.find(m => m.id === id);
    const targetName = target ? target.nama_mapel : 'Mata Pelajaran';
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Mata Pelajaran',
      message: `Apakah Anda yakin ingin menghapus mata pelajaran "${targetName}"? Pengampu dan slot jadwal pelajaran terkait akan dilepaskan secara permanen.`,
      type: 'delete_mapel',
      onConfirm: async () => {
        // Always save locally first!
        LocalDB.saveMapel(mapel.filter(m => m.id !== id));
        LocalDB.savePengampu(pengampu.filter(a => a.mapel_id !== id));
        LocalDB.saveJadwal(jadwal.filter(s => s.mapel_id !== id));
        setHasUnsavedChanges(true);
        loadDatabase(true);

        setLogMessages(prev => [`Mata pelajaran "${targetName}" beserta relasi terkait berhasil dihapus dari browser.`, ...prev]);
        setSelectedCell(null);
        setConfirmModal(null);

        if (isSupabaseModeActive() && currentUser && target) {
          try {
            await SupabaseSyncService.syncSubject(target, 'delete');
            setLogMessages(prev => [`☁️ [Real-time] Penghapusan Mapel "${targetName}" diselaraskan di cloud!`, ...prev]);
          } catch (err: any) {
            console.error("Gagal sinkronisasi hapus mapel:", err);
            setLogMessages(prev => [`⚠️ Peringatan: Gagal menghapus mapel di Cloud (${err.message}). Silakan lakukan klik Simpan ke Cloud nanti.`, ...prev]);
          }
        }
      }
    });
  };

  const handleUpdateMapel = async (updatedMapel: MataPelajaran) => {
    // Always save locally first!
    const updated = mapel.map(m => m.id === updatedMapel.id ? updatedMapel : m);
    LocalDB.saveMapel(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setLogMessages(prev => [`Mata pelajaran ${updatedMapel.nama_mapel} berhasil diperbarui di browser.`, ...prev]);

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncSubject(updatedMapel, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Pembaruan mata pelajaran "${updatedMapel.nama_mapel}" diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi update mapel:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal memperbarui mapel di Cloud (${err.message}). Klik Simpan ke Cloud nanti untuk menyelaraskan.`, ...prev]);
      }
    }
  };

  const handleImportMapels = async (newMapels: MataPelajaran[]) => {
    // Filter out subjects that have the exact same kode_mapel (case-insensitive)
    const existingCodes = new Set(mapel.map(m => m.kode_mapel.toUpperCase()));
    const filteredNew = newMapels.filter(m => !existingCodes.has(m.kode_mapel.toUpperCase()));

    if (filteredNew.length === 0) {
      setLogMessages(prev => [`⚠️ Semua mata pelajaran dari preset sudah ada di daftar aktif Anda.`, ...prev]);
      return;
    }

    const updated = [...mapel, ...filteredNew];
    LocalDB.saveMapel(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setLogMessages(prev => [`✅ Berhasil mengimpor ${filteredNew.length} mata pelajaran baru dari preset!`, ...prev]);

    if (isSupabaseModeActive() && currentUser) {
      try {
        for (const item of filteredNew) {
          await SupabaseSyncService.syncSubject(item, 'upsert');
        }
        setLogMessages(prev => [`☁️ [Real-time] ${filteredNew.length} mata pelajaran baru dari preset berhasil diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi impor mapel ke cloud:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal mensinkronisasikan beberapa mapel impor ke Cloud. Klik Simpan ke Cloud nanti.`, ...prev]);
      }
    }
  };

  // --- CRUD KELAS & RUANGAN ---
  const handleAddKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKelas.nama_kelas) {
      alert('Nama kelas wajib diisi.');
      return;
    }
    const created: Kelas = {
      id: `kelas-${Date.now()}`,
      nama_kelas: newKelas.nama_kelas,
      tingkat: newKelas.tingkat || 'VII',
      wali_kelas: newKelas.wali_kelas || '',
    };

    // Always save locally first!
    const updated = [...kelas, created];
    LocalDB.saveKelas(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setNewKelas({ nama_kelas: '', tingkat: newKelas.tingkat || 'VII', wali_kelas: '' });

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncClass(created, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Kelas "${created.nama_kelas}" diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi kelas ke cloud:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal mensinkronisasikan kelas ke Cloud (${err.message}). Data disimpan lokal, silakan simpan manual nanti.`, ...prev]);
      }
    }
  };

  const handleDeleteKelas = (id: string) => {
    const target = kelas.find(c => c.id === id);
    const targetName = target ? target.nama_kelas : 'Kelas';
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Kelas',
      message: `Apakah Anda yakin ingin menghapus kelas "${targetName}"? Pengampu dan rancangan jadwal untuk kelas ini akan ikut dihapus.`,
      type: 'delete_kelas',
      onConfirm: async () => {
        // Always save locally first!
        LocalDB.saveKelas(kelas.filter(c => c.id !== id));
        LocalDB.savePengampu(pengampu.filter(a => a.kelas_id !== id));
        LocalDB.saveJadwal(jadwal.filter(s => s.kelas_id !== id));
        setHasUnsavedChanges(true);
        loadDatabase(true);

        setLogMessages(prev => [`Data kelas "${targetName}" berhasil dihapus dari browser.`, ...prev]);
        setSelectedCell(null);
        setConfirmModal(null);

        if (isSupabaseModeActive() && currentUser && target) {
          try {
            await SupabaseSyncService.syncClass(target, 'delete');
            setLogMessages(prev => [`☁️ [Real-time] Penghapusan Kelas "${targetName}" diselaraskan di cloud!`, ...prev]);
          } catch (err: any) {
            console.error("Gagal sinkronisasi hapus kelas:", err);
            setLogMessages(prev => [`⚠️ Peringatan: Gagal menghapus kelas di Cloud (${err.message}). Silakan lakukan klik Simpan ke Cloud nanti.`, ...prev]);
          }
        }
      }
    });
  };

  const handleAddRuangan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuangan.nama_ruangan) {
      alert('Nama ruangan wajib diisi.');
      return;
    }
    const created: Ruangan = {
      id: `room-${Date.now()}`,
      nama_ruangan: newRuangan.nama_ruangan,
      kapasitas: Number(newRuangan.kapasitas) || 32,
    };

    // Always save locally first!
    const updated = [...ruangan, created];
    LocalDB.saveRuangan(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setNewRuangan({ nama_ruangan: '', kapasitas: 32 });

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncRoom(created, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Ruangan "${created.nama_ruangan}" diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi ruangan ke cloud:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal mensinkronisasikan ruangan ke Cloud (${err.message}). Data disimpan lokal, silakan simpan manual nanti.`, ...prev]);
      }
    }
  };

  const handleDeleteRuangan = (id: string) => {
    const target = ruangan.find(r => r.id === id);
    const targetName = target ? target.nama_ruangan : 'Ruangan';
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Ruangan',
      message: `Apakah Anda yakin ingin menghapus ruangan "${targetName}"? Alokasi ruangan pada jadwal akan dibersihkan.`,
      type: 'delete_ruangan',
      onConfirm: async () => {
        // Always save locally first!
        LocalDB.saveRuangan(ruangan.filter(r => r.id !== id));
        LocalDB.saveJadwal(jadwal.filter(s => s.ruangan_id !== id));
        setHasUnsavedChanges(true);
        loadDatabase(true);

        setLogMessages(prev => [`Data ruangan "${targetName}" berhasil dihapus dari browser.`, ...prev]);
        setSelectedCell(null);
        setConfirmModal(null);

        if (isSupabaseModeActive() && currentUser && target) {
          try {
            await SupabaseSyncService.syncRoom(target, 'delete');
            setLogMessages(prev => [`☁️ [Real-time] Penghapusan Ruangan "${targetName}" diselaraskan di cloud!`, ...prev]);
          } catch (err: any) {
            console.error("Gagal sinkronisasi hapus ruangan:", err);
            setLogMessages(prev => [`⚠️ Peringatan: Gagal menghapus ruangan di Cloud (${err.message}). Silakan lakukan klik Simpan ke Cloud nanti.`, ...prev]);
          }
        }
      }
    });
  };

  // --- CRUD ASSIGNMENTS (PENGAMPU) ---
  const handleAddPengampu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPengampu.guru_id || !newPengampu.mapel_id || !newPengampu.kelas_id) {
      alert('Harap pilih Guru, Mata Pelajaran, dan Kelas penerima.');
      return;
    }
    const created: PengampuMataPelajaran = {
      id: `assign-${Date.now()}`,
      guru_id: newPengampu.guru_id,
      mapel_id: newPengampu.mapel_id,
      kelas_id: newPengampu.kelas_id,
      jumlah_jam: Number(newPengampu.jumlah_jam) || 4,
    };

    // Always save locally first!
    const updated = [...pengampu, created];
    LocalDB.savePengampu(updated);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setNewPengampu({ guru_id: '', mapel_id: '', kelas_id: '', jumlah_jam: 4 });

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncAssignment(created, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Tugas pengampu berhasil diselaraskan ke Supabase Cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi pengampu ke cloud:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal mensinkronisasikan tugas pengampu ke Cloud (${err.message}). Data disimpan lokal, silakan simpan manual nanti.`, ...prev]);
      }
    }
  };

  const handleDeletePengampu = (id: string) => {
    const target = pengampu.find(a => a.id === id);
    const guruTarget = target ? guru.find(g => g.id === target.guru_id) : null;
    const mapelTarget = target ? mapel.find(m => m.id === target.mapel_id) : null;
    const desc = (guruTarget && mapelTarget) ? `${guruTarget.nama} - ${mapelTarget.nama_mapel}` : 'Tugas Pengampu';

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Tugas Mengajar (Pengampu)',
      message: `Apakah Anda yakin ingin menghapus tugas mengajar "${desc}"? Slot jadwal terkait akan otomatis dikosongkan.`,
      type: 'delete_pengampu',
      onConfirm: async () => {
        // Always save locally first!
        LocalDB.savePengampu(pengampu.filter(a => a.id !== id));
        LocalDB.saveJadwal(jadwal.filter(s => s.assignment_id !== id));
        setHasUnsavedChanges(true);
        loadDatabase(true);

        setLogMessages(prev => [`Tugas mengajar "${desc}" berhasil dihapus dari browser.`, ...prev]);
        setSelectedCell(null);
        setConfirmModal(null);

        if (isSupabaseModeActive() && currentUser && target) {
          try {
            await SupabaseSyncService.syncAssignment(target, 'delete');
            setLogMessages(prev => [`☁️ [Real-time] Penghapusan Tugas Pengampu diselaraskan di cloud!`, ...prev]);
          } catch (err: any) {
            console.error("Gagal sinkronisasi hapus pengampu:", err);
            setLogMessages(prev => [`⚠️ Peringatan: Gagal menghapus pengampu di Cloud (${err.message}). Silakan lakukan klik Simpan ke Cloud nanti.`, ...prev]);
          }
        }
      }
    });
  };

  // --- PREFERENCES SAVE CALLBACK ---
  const handleSavePreferensi = async (guruId: string, updatedPref: {
    hari_tidak_bersedia: Hari[];
    jam_tidak_bersedia: number[];
    hari_favorit: Hari[];
    jam_favorit: number[];
    max_jam_per_hari: number;
    slot_tidak_bersedia?: { hari: Hari; jam_ke: number }[];
  }) => {
    const existingIdx = preferensi.findIndex(p => p.guru_id === guruId);
    const updated: PreferensiGuru = {
      id: existingIdx !== -1 ? preferensi[existingIdx].id : `pref-${guruId}`,
      guru_id: guruId,
      hari_tidak_bersedia: updatedPref.hari_tidak_bersedia,
      jam_tidak_bersedia: updatedPref.jam_tidak_bersedia,
      hari_favorit: updatedPref.hari_favorit,
      jam_favorit: updatedPref.jam_favorit,
      max_jam_per_hari: updatedPref.max_jam_per_hari,
      slot_tidak_bersedia: updatedPref.slot_tidak_bersedia
    };

    // Always save locally first!
    let newPrefList = [...preferensi];
    if (existingIdx !== -1) {
      newPrefList[existingIdx] = updated;
    } else {
      newPrefList.push(updated);
    }
    LocalDB.savePreferensi(newPrefList);
    setHasUnsavedChanges(true);
    loadDatabase(true);

    setLogMessages(prev => [`Preferensi guru ${guru.find(g => g.id === guruId)?.nama} berhasil disimpan dan dievaluasi lokal.`, ...prev]);

    if (isSupabaseModeActive() && currentUser) {
      try {
        await SupabaseSyncService.syncPreference(updated, 'upsert');
        setLogMessages(prev => [`☁️ [Real-time] Preferensi guru berhasil diselaraskan langsung ke cloud!`, ...prev]);
      } catch (err: any) {
        console.error("Gagal sinkronisasi preferensi:", err);
        setLogMessages(prev => [`⚠️ Peringatan: Gagal menyimpan preferensi ke Cloud (${err.message}). Klik Simpan ke Cloud nanti untuk menyelaraskan.`, ...prev]);
      }
    }
  };

  const handleUpdateBatasJamHari = (updatedBatas: Record<Hari, number>) => {
    LocalDB.saveBatasJamHari(updatedBatas);
    loadDatabase();
  };

  // --- AUTOMATIC TIMETABLE GENERATION ENGINE ---
  const handleCancelGeneration = () => {
    if (generatorWorkerRef.current) {
      generatorWorkerRef.current.terminate();
      generatorWorkerRef.current = null;
    }
    setIsGenerating(false);
    setLogMessages(prev => ['🛑 Proses penyusunan jadwal dibatalkan oleh pengguna.', ...prev]);
  };

  const handleGenerateAutomatedTimetable = () => {
    if (guru.length === 0 || mapel.length === 0 || kelas.length === 0 || ruangan.length === 0 || pengampu.length === 0) {
      alert('Mohon lengkapi seluruh Data Master (Guru, Mapel, Kelas, Ruangan, & Pengampu) terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setLogMessages(['Menginisialisasi pemrosesan di latar belakang...', 'Menganalisis skema pembagian kelas penjadwalan...']);

    // Check if Web Worker is supported in the browser
    if (typeof window !== 'undefined' && (window as any).Worker) {
      try {
        if (generatorWorkerRef.current) {
          generatorWorkerRef.current.terminate();
        }

        // Create a new worker instance
        const worker = new Worker(new URL('../lib/scheduler.worker.ts', import.meta.url));
        generatorWorkerRef.current = worker;

        worker.onmessage = (e: MessageEvent) => {
          const { type, message, percent, result, error } = e.data;

          if (type === 'progress') {
            setLogMessages(prev => [message, ...prev]);
            if (percent !== undefined) {
              setGenerationProgress(percent);
            }
          } else if (type === 'success') {
            if (result && result.schedules && result.schedules.length > 0) {
              LocalDB.saveJadwal(result.schedules);
              
              const finalConflicts = LocalDB.getConflicts();
              const totalLessonsNeeded = pengampu.reduce((acc, curr) => acc + curr.jumlah_jam, 0);

              setStats({
                executionTimeMs: result.executionTimeMs,
                score: Math.round(result.score),
                totalLessonsNeeded,
                totalLessonsPlotted: result.schedules.length,
                totalConflicts: finalConflicts.length
              });
              setGenerationProgress(100);
              setLogMessages(prev => [
                `🎉 SUKSES GENERATOR (Latar Belakang): Jadwal berhasil dibuat secara otomatis dalam ${result.executionTimeMs} ms dengan total ${result.schedules.length} slot terisi!`,
                ...prev
              ]);
              setActiveTab('grid');
            } else {
              setLogMessages(prev => ['⚠️ Gagal menyusun jadwal. Constraints terlalu ketat, mohon kurangi batasan preferensi guru atau tambahkan ruangan.', ...prev]);
            }
            setIsGenerating(false);
            loadDatabase();
            worker.terminate();
            generatorWorkerRef.current = null;
          } else if (type === 'error') {
            setLogMessages(prev => [`Error: ${error}`, ...prev]);
            setIsGenerating(false);
            worker.terminate();
            generatorWorkerRef.current = null;
          }
        };

        worker.onerror = (err) => {
          console.error("Worker error, falling back to sync mode:", err);
          runSyncTimetableGeneration();
        };

        // Send payload to start processing in the background Worker thread!
        worker.postMessage({
          guru,
          mapel,
          kelas,
          ruangan,
          jamPelajaran,
          pengampu,
          preferensi,
          hariAktif,
          batasJamHari,
          algorithm,
          allowPartial,
          isPro: currentUser?.is_pro
        });

      } catch (workerErr) {
        console.warn("Failed to spawn Web Worker, falling back to synchronous execution:", workerErr);
        runSyncTimetableGeneration();
      }
    } else {
      // Fallback to synchronous execution
      runSyncTimetableGeneration();
    }
  };

  const runSyncTimetableGeneration = () => {
    setGenerationProgress(0);
    setTimeout(() => {
      try {
        const solver = new CalendarScheduler(
          guru,
          mapel,
          kelas,
          ruangan,
          jamPelajaran,
          pengampu,
          preferensi,
          hariAktif,
          batasJamHari
        );

        let result;
        if (algorithm === 'csp') {
          result = solver.solveCSP((msg, percent) => {
            setLogMessages(prev => [msg, ...prev]);
            if (percent !== undefined) setGenerationProgress(percent);
          }, allowPartial);
        } else {
          result = solver.solveGenetic((msg, percent) => {
            setLogMessages(prev => [msg, ...prev]);
            if (percent !== undefined) setGenerationProgress(percent);
          }, currentUser?.is_pro);
        }

        if (result.schedules.length > 0) {
          LocalDB.saveJadwal(result.schedules);
          
          const finalConflicts = LocalDB.getConflicts();
          const totalLessonsNeeded = pengampu.reduce((acc, curr) => acc + curr.jumlah_jam, 0);

          setStats({
            executionTimeMs: result.executionTimeMs,
            score: Math.round(result.score),
            totalLessonsNeeded,
            totalLessonsPlotted: result.schedules.length,
            totalConflicts: finalConflicts.length
          });
          setGenerationProgress(100);
          setLogMessages(prev => [
            `🎉 SUKSES GENERATOR: Jadwal berhasil dibuat secara otomatis dalam ${result.executionTimeMs} ms dengan total ${result.schedules.length} slot terisi!`,
            ...prev
          ]);
          setActiveTab('grid');
        } else {
          setLogMessages(prev => ['⚠️ Gagal menyusun jadwal. Constraints terlalu ketat, mohon kurangi batasan preferensi guru atau tambahkan ruangan.', ...prev]);
        }
      } catch (err: any) {
        setLogMessages(prev => [`Error: ${err.message}`, ...prev]);
      } finally {
        setIsGenerating(false);
        loadDatabase();
      }
    }, 400);
  };

  // --- INTERRUPTED MANUAL SCHEDULING INTERACTIVE EDITS (CLICK / SWAP) ---
  const handleCellClick = (hari: Hari, jamKe: number, scheduleId: string | null | undefined) => {
    if (!selectedCell) {
      setSelectedCell({ hari, jam_ke: jamKe, scheduleId });
      setLogMessages(prev => [`Sel dipilih: ${hari} Jam ke-${jamKe}. Pilih slot lain untuk dipindahkan atau tukarkan posisi (Swap).`, ...prev]);
    } else {
      const source = selectedCell;
      setSelectedCell(null);

      if (source.hari === hari && source.jam_ke === jamKe) {
        return;
      }

      const updatedSchedules = [...jadwal];
      
      const sourceIdx = updatedSchedules.findIndex(s => s.id === source.scheduleId);
      const targetIdx = updatedSchedules.findIndex(s => s.hari === hari && s.jam_ke === jamKe && (
        filterType === 'kelas' ? s.kelas_id === filterId :
        filterType === 'guru' ? s.guru_id === filterId :
        s.ruangan_id === filterId
      ));

      if (sourceIdx !== -1 && targetIdx !== -1) {
        const tempHari = updatedSchedules[sourceIdx].hari;
        const tempJam = updatedSchedules[sourceIdx].jam_ke;

        updatedSchedules[sourceIdx].hari = updatedSchedules[targetIdx].hari;
        updatedSchedules[sourceIdx].jam_ke = updatedSchedules[targetIdx].jam_ke;

        updatedSchedules[targetIdx].hari = tempHari;
        updatedSchedules[targetIdx].jam_ke = tempJam;

        setLogMessages(prev => [`Berhasil menukarkan jadwal hari ${source.hari} Jam-${source.jam_ke} dengan hari ${hari} Jam-${jamKe}.`, ...prev]);
      } else if (sourceIdx !== -1 && targetIdx === -1) {
        updatedSchedules[sourceIdx].hari = hari;
        updatedSchedules[sourceIdx].jam_ke = jamKe;
        
        if (filterType === 'ruangan') {
          updatedSchedules[sourceIdx].ruangan_id = filterId;
        }

        setLogMessages(prev => [`Berhasil memindahkan jadwal dari ${source.hari} Jam-${source.jam_ke} ke tempat kosong yaitu ${hari} Jam-${jamKe}.`, ...prev]);
      } else {
        setLogMessages(prev => [`Slot target kosong dan tidak ada data pengampu asal untuk dipindahkan.`, ...prev]);
        return;
      }

      LocalDB.saveJadwal(updatedSchedules);
      loadDatabase();
    }
  };

  const handleManualDeleteSlot = (scheduleId: string, skipConfirm = false) => {
    const executeDelete = () => {
      const updated = jadwal.filter(s => s.id !== scheduleId);
      LocalDB.saveJadwal(updated);
      loadDatabase();
      setSelectedCell(null);
      setLogMessages(prev => [`Satu slot pelajaran berhasil dilepaskan secara manual dari rancangan jadwal.`, ...prev]);
    };

    if (skipConfirm) {
      executeDelete();
    } else {
      const slot = jadwal.find(s => s.id === scheduleId);
      const m = slot ? mapel.find(map => map.id === slot.mapel_id) : null;
      const g = slot ? guru.find(gur => gur.id === slot.guru_id) : null;
      const info = (m && g) ? `mata pelajaran "${m.nama_mapel}" oleh "${g.nama}"` : "pelajaran ini";

      setConfirmModal({
        isOpen: true,
        title: 'Lepaskan Slot Jadwal',
        message: `Apakah Anda yakin ingin mengosongkan/melepaskan slot ${info}? Slot ini akan kosong kembali.`,
        type: 'delete_schedule',
        onConfirm: () => {
          executeDelete();
          setConfirmModal(null);
        }
      });
    }
  };

  // --- COMPILING DETAILED TIMETABLE VIEWS FOR RENDER ---
  const filteredScheduleMatrix = useMemo(() => {
    const matrix: { [key: number]: { [key in Hari]?: Jadwal[] } } = {};

    for (const p of jamPelajaran) {
      matrix[p.jam_ke] = {};
      for (const d of hariAktif) {
        matrix[p.jam_ke][d] = [];
      }
    }

    for (const s of jadwal) {
      let match = false;
      if (filterType === 'kelas' && s.kelas_id === filterId) match = true;
      if (filterType === 'guru' && s.guru_id === filterId) match = true;
      if (filterType === 'ruangan' && s.ruangan_id === filterId) match = true;

      if (match && matrix[s.jam_ke] && matrix[s.jam_ke][s.hari]) {
        matrix[s.jam_ke][s.hari]!.push(s);
      }
    }

    return matrix;
  }, [jadwal, filterType, filterId, jamPelajaran, hariAktif]);

  // --- EXPORTS TO EXCEL AND PDF ---
  const handleExportExcel = () => {
    const daysArr: Hari[] = hariAktif;
    const currentName = 
      filterType === 'kelas' ? (kelas.find(c => c.id === filterId)?.nama_kelas || 'Kelas') :
      filterType === 'guru' ? (guru.find(g => g.id === filterId)?.nama || 'Guru') :
      (ruangan.find(r => r.id === filterId)?.nama_ruangan || 'Ruangan');

    let csvContent = `DATA JADWAL PELAJARAN - ${currentName.toUpperCase()}\n`;
    csvContent += `Jam Ke,Mulai,Selesai,${daysArr.join(',')}\n`;

    for (const p of jamPelajaran) {
      let row = `${p.jam_ke},${p.jam_mulai},${p.jam_selesai}`;
      for (const d of daysArr) {
        const slots = filteredScheduleMatrix[p.jam_ke]?.[d] || [];
        if (slots.length > 0) {
          const names = slots.map(s => {
            const mName = mapel.find(m => m.id === s.mapel_id)?.nama_mapel || 'Mapel';
            const gName = guru.find(g => g.id === s.guru_id)?.nama.split(',')[0] || 'Guru';
            const rName = ruangan.find(r => r.id === s.ruangan_id)?.nama_ruangan || 'Ruang';
            return `${mName} (${gName} - ${rName})`;
          }).join(' / ');
          row += `,"${names}"`;
        } else {
          row += `,"-"`;
        }
      }
      csvContent += row + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jadwal_sekolah_${currentName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLogMessages(prev => [`Jadwal ${currentName} berhasil diekspor menjadi format CSV/Excel.`, ...prev]);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6" id="auth-root">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white text-center">
              <div className="inline-flex bg-white p-3 rounded-2xl mb-3 shadow-md w-16 h-16 items-center justify-center">
                <img src="/logo.svg" alt="Jadwalify Logo" className="w-12 h-12 object-contain" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Jadwalify</h2>
              <p className="text-xs text-indigo-100/95 mt-1 font-medium">Asisten Cerdas Penjadwalan Bebas Bentrok</p>
            </div>

            <div className="p-6 md:p-8">
              {/* Tabs */}
              <div className="flex border-b border-slate-100 mb-6 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowPassword(false);
                  }}
                  className={`flex-1 pb-3 text-center text-sm transition cursor-pointer ${authMode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Masuk (Login)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                    setShowPassword(false);
                  }}
                  className={`flex-1 pb-3 text-center text-sm transition cursor-pointer ${authMode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-100 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 font-semibold flex items-center gap-2">
                  <span>✓ {authSuccess}</span>
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Sekolah / Instansi</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Users className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Contoh: SMP Negeri 1 Jakarta"
                        value={authNamaSekolah}
                        onChange={(e) => setAuthNamaSekolah(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan username"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition focus:outline-none cursor-pointer"
                      title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  {authMode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" /> Masuk Aplikasi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Registrasi &amp; Mulai
                    </>
                  )}
                </button>

                <div className="relative flex py-1 items-center justify-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">atau</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 rounded-lg text-sm transition shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>
              </form>


              
              <div className="mt-6 text-center border-t border-slate-100 pt-4">
                <span className="text-[11px] text-slate-400 font-medium">
                  Database Akun Terisolasi: Setiap akun memiliki penyimpanan jadwal sendiri secara aman.
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Google Sign-In Popup Modal inside !currentUser */}
        {showGooglePopup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300">
              {/* Google Header */}
              <div className="p-6 text-center border-b border-slate-100 bg-slate-50 relative">
                <button 
                  onClick={() => setShowGooglePopup(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
                <div className="inline-flex justify-center mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Login dengan Google</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">untuk melanjutkan ke JP Penjadwalan Sekolah</p>
              </div>

              {/* Step 1: Select Account */}
              {googleStep === 'select' && (
                <div className="p-6 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Pilih akun Anda</span>
                  
                  {/* Account list */}
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleGoogleAccountSelect('balkhi05@gmail.com', 'Balkhi')}
                      className="w-full p-3.5 flex items-center gap-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-left transition cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        B
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm text-slate-800 block">Balkhi</span>
                        <span className="text-xs text-slate-500 block truncate">balkhi05@gmail.com</span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">Profil Aktif</span>
                    </button>

                    <button
                      onClick={() => {
                        setCustomGoogleEmail('');
                        setCustomGoogleName('');
                        setGoogleStep('new');
                      }}
                      className="w-full p-3.5 flex items-center gap-3.5 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left transition cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg">
                        +
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-700 block">Gunakan Akun Lain</span>
                        <span className="text-xs text-slate-400 block">Masuk menggunakan email Google baru</span>
                      </div>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-4">
                    Aplikasi Penjadwalan Sekolah menggunakan standar keamanan terisolasi. Kredensial akun Google diproses secara aman dalam runtime terisolasi Anda.
                  </p>
                </div>
              )}

              {/* Step 2: Input Custom Google Account */}
              {googleStep === 'new' && (
                <div className="p-6 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tambah Akun Google Baru</span>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Google</label>
                      <input
                        type="email"
                        placeholder="Contoh: budi@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('select')}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer text-center"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customGoogleEmail || !customGoogleName) {
                          alert('Harap isi nama dan email.');
                          return;
                        }
                        handleGoogleAccountSelect(customGoogleEmail, customGoogleName);
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer text-center"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Input School Name for New Account Registration */}
              {googleStep === 'school' && (
                <form onSubmit={handleGoogleRegisterSubmit} className="p-6 space-y-4">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">✓ Autentikasi Google Berhasil</span>
                  
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-800 leading-relaxed font-medium">
                    Selamat datang <strong>{selectedGoogleName}</strong>! Ini adalah pertama kalinya Anda masuk. Kami memerlukan nama sekolah atau instansi Anda untuk membuatkan database terisolasi.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Sekolah / Instansi</label>
                    <input
                      type="text"
                      placeholder="Contoh: SMP Negeri 1 AI Indonesia"
                      value={googleSchoolName}
                      onChange={(e) => setGoogleSchoolName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('select')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition shadow-md cursor-pointer text-center"
                    >
                      Buat Database &amp; Masuk
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" id="main-root">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-45 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 transition rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 active:scale-95 flex items-center justify-center border border-slate-200 cursor-pointer"
            title="Sembunyikan/Tampilkan Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-9 h-9 flex items-center justify-center overflow-hidden rounded-lg bg-indigo-50 p-1 border border-indigo-100 shadow-xs">
            <img src="/logo.svg" alt="Jadwalify Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Jadwalify 
              {currentUser?.is_pro ? (
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold font-sans">PRO</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md font-bold font-sans">TRIAL</span>
              )}
              {isDemoMode ? (
                <span className="inline-flex items-center">
                  <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold font-sans flex items-center gap-1.5" title="Sistem terisi data sekolah simulasi SMP Negeri 1 AI">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Mode Sandbox
                  </span>
                </span>
              ) : (
                isSupabaseModeActive() && (
                  <span className="inline-flex items-center gap-1.5">
                    {isCloudSyncing ? (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold font-sans flex items-center gap-1.5 animate-pulse" title="Sedang mengunggah perubahan otomatis ke Supabase Cloud">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        Menyimpan ke Cloud...
                      </span>
                    ) : backgroundSyncStatus === 'checking' ? (
                      <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-md font-bold font-sans flex items-center gap-1.5 animate-pulse" title="Sedang memeriksa pembaruan data di cloud">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                        Memeriksa Cloud...
                      </span>
                    ) : (
                      <span 
                        className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold font-sans flex items-center gap-1 cursor-help" 
                        title={lastSyncTime ? `Sinkron otomatis aktif. Terakhir diperiksa: ${lastSyncTime.toLocaleTimeString()}` : "Terhubung secara aman ke Supabase Cloud"}
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Cloud Aktif {lastSyncTime && `• ${lastSyncTime.toLocaleTimeString()}`}
                      </span>
                    )}
                    

                    
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (isCloudSyncing || backgroundSyncStatus === 'checking') return;
                        await handleManualForceSync();
                      }}
                      disabled={isCloudSyncing || backgroundSyncStatus === 'checking'}
                      className="p-1 hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded-md border border-slate-200 transition cursor-pointer flex items-center justify-center shrink-0"
                      title="Paksa Sinkronisasi Penuh Sekarang (Sinergikan lokal & cloud)"
                    >
                      <RefreshCw className={`w-3 h-3 ${isCloudSyncing || backgroundSyncStatus === 'checking' ? 'animate-spin' : ''}`} />
                    </button>
                  </span>
                )
              )}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Penyusunan Jadwal Tanpa Bentrok • {currentUser?.nama_sekolah || (typeof window !== 'undefined' ? LocalDB.getSchoolProfile()?.nama_sekolah : '') || 'SMP Negeri 1 AI'} (Akun: @{currentUser?.username})</p>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CORE FRAMEWORK GRID WITH INTEGRAL SIDEBAR NAVIGATION */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className={`shrink-0 border-slate-200 bg-white flex flex-col justify-between transition-all duration-300 ease-in-out z-50 print:hidden
          fixed inset-y-0 left-0 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-y-auto lg:translate-x-0
          ${sidebarOpen 
            ? 'translate-x-0 w-72 p-4 border-r shadow-2xl lg:shadow-xs lg:w-64' 
            : '-translate-x-full w-72 p-4 border-r lg:w-0 lg:p-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none'
          }
        `}>
          <div className="flex flex-col gap-1.5 min-w-[220px]">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-slate-400 font-mono text-[10px] tracking-widest uppercase font-bold">Menu Utama</div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold text-sm"
                title="Tutup Menu"
              >
                ✕
              </button>
            </div>
            
            <button 
              onClick={() => handleSetActiveTab('dashboard')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Home className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Ringkasan Dashboard</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('tutorial')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'tutorial' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'tutorial' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Tutorial &amp; FAQ</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('guru')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'guru' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Users className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'guru' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Guru &amp; Preferensi</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('mapel')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'mapel' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'mapel' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Mata Pelajaran</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('kelas')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'kelas' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Layers className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'kelas' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Kelas &amp; Ruangan</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('pengampu')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'pengampu' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'pengampu' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Pengampu Pelajaran</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('pengaturan_waktu')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'pengaturan_waktu' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Settings className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'pengaturan_waktu' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Pengaturan Kalender &amp; Jam</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('school_profile')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'school_profile' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <School className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'school_profile' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Profil &amp; Logo Sekolah</span>
            </button>

            <div className="text-slate-400 font-mono text-[10px] tracking-widest px-2 mt-4 mb-2 uppercase border-t border-slate-100 pt-4 font-bold">Penjadwalan</div>

            <button 
              onClick={() => handleSetActiveTab('generate')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
            >
              <Play className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'generate' ? 'text-white' : 'text-indigo-600'} animate-pulse`} />
              <span className="text-left leading-tight">Generator Otomatis</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('grid')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'grid' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Calendar className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'grid' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Grid Kalender Jadwal</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('konflik')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold relative cursor-pointer ${activeTab === 'konflik' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'konflik' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight pr-6">Validasi Konflik</span>
              {conflicts.length > 0 && (
                <span className="absolute right-3 top-3.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white font-mono">
                  {conflicts.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => handleSetActiveTab('beban_kerja')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold relative cursor-pointer ${activeTab === 'beban_kerja' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Briefcase className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'beban_kerja' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Laporan Beban Kerja</span>
            </button>

            <button 
              onClick={() => handleSetActiveTab('versions')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold relative cursor-pointer ${activeTab === 'versions' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <Layers className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'versions' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Versi Jadwal (Payload)</span>
            </button>

            <div className="text-slate-400 font-mono text-[10px] tracking-widest px-2 mt-4 mb-2 uppercase border-t border-slate-100 pt-4 font-bold">Lisensi &amp; Aktivasi</div>

            <button 
              onClick={() => handleSetActiveTab('activation')} 
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'activation' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'activation' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-left leading-tight">Aktivasi Lisensi PRO</span>
            </button>

            {isAdmin && (
              <button 
                onClick={() => handleSetActiveTab('admin')} 
                className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all font-semibold cursor-pointer ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
              >
                <Database className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-left leading-tight">Admin Panel</span>
              </button>
            )}

            {/* YAYASAN / MULTI-UNIT switcher widget */}
            <div className="text-slate-400 font-mono text-[10px] tracking-widest px-2 mt-4 mb-2 uppercase border-t border-slate-100 pt-4 font-bold">Lembaga / Yayasan</div>
            <YayasanUnitSwitcher 
              onUnitChanged={() => loadDatabase(true)}
              addLog={(msg) => setLogMessages(prev => [`🏢 [Yayasan] ${msg}`, ...prev])}
            />

            <div className="text-slate-400 font-mono text-[10px] tracking-widest px-2 mt-4 mb-2 uppercase border-t border-slate-100 pt-4 font-bold">Mode Simulasi / Riil</div>

            {isDemoMode ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 mb-1.5 mx-1 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Mode Sandbox (Aktif)
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Sistem terisi data sekolah simulasi SMP Negeri 1 AI untuk memudahkan uji coba instan.
                </p>
                <button
                  onClick={handleSwitchToRealMode}
                  className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm shadow-indigo-100 flex items-center justify-center gap-1"
                >
                  🚀 Mulai Mode Asli (Bersih)
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 mb-1.5 mx-1 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Mode Asli (Bersih)
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Database bersih, siap untuk menginput data riil sekolah Anda secara profesional.
                </p>
                <button
                  onClick={handleSwitchToDemoMode}
                  className="w-full text-center py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm shadow-amber-100 flex items-center justify-center gap-1"
                >
                  🧪 Muat Data Sandbox
                </button>
              </div>
            )}

            <div className="text-slate-400 font-mono text-[10px] tracking-widest px-2 mt-4 mb-2 uppercase border-t border-slate-100 pt-4 font-bold">Aksi Sistem</div>

            <button 
              onClick={handleReset} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-colors cursor-pointer"
              title="Kembalikan semua data ke default pabrik"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Atur Ulang Master
            </button>

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" /> Keluar
            </button>
          </div>

          {/* Console / Log panel */}
          <div className="mt-auto border-t border-slate-100 pt-4 px-1 min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400 font-mono font-bold">
              <span>LOG AKTIVITAS SISTEM</span>
              <Activity className="w-3 h-3 text-slate-400" />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] font-mono h-32 overflow-y-auto flex flex-col gap-1 text-slate-600 shadow-inner">
              {logMessages.length === 0 ? (
                <span className="text-slate-400 italic">Belum ada aktivitas baru.</span>
              ) : (
                logMessages.map((msg, i) => (
                  <div key={i} className="leading-tight border-b border-slate-200/40 pb-0.5">
                    <span className="text-indigo-600 select-none mr-1 font-bold">&gt;</span>{msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT WINDOW */}
        <main className="flex-1 bg-slate-50/50 p-6 overflow-y-auto print:p-0 print:bg-white">
          {isSupabaseModeActive() && currentUser && hasUnsavedChanges && !isDemoMode && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in print:hidden">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    ⚠️ Perubahan Data Belum Disimpan ke Cloud
                  </h5>
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    Anda telah melakukan penambahan atau modifikasi data di browser Anda. Klik tombol di samping kanan untuk menyelaraskannya dengan Supabase Cloud agar data Anda aman dan sinkron.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (isCloudSyncing) return;
                  await handlePushAllToCloud();
                }}
                disabled={isCloudSyncing}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer select-none shrink-0"
              >
                {isCloudSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    Simpan ke Cloud Sekarang
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab 
              guru={guru}
              kelas={kelas}
              mapel={mapel}
              jadwal={jadwal}
              conflicts={conflicts}
              pengampu={pengampu}
              setActiveTab={handleSetActiveTab}
              handleClearJadwal={handleClearJadwal}
              loadDatabase={loadDatabase}
              setLogMessages={setLogMessages}
            />
          )}

          {activeTab === 'guru' && (
            <GuruTab 
              guru={guru}
              preferensi={preferensi}
              newGuru={newGuru}
              setNewGuru={setNewGuru}
              handleAddGuru={handleAddGuru}
              handleDeleteGuru={handleDeleteGuru}
              onUpdateGuru={handleUpdateGuru}
              onSavePreferensi={handleSavePreferensi}
              hariAktif={hariAktif}
              jamPelajaran={jamPelajaran}
            />
          )}

          {activeTab === 'mapel' && (
            <MapelTab 
              mapel={mapel}
              newMapel={newMapel}
              setNewMapel={setNewMapel}
              handleAddMapel={handleAddMapel}
              handleDeleteMapel={handleDeleteMapel}
              handleUpdateMapel={handleUpdateMapel}
              handleImportMapels={handleImportMapels}
              hariAktif={hariAktif}
              jamPelajaran={jamPelajaran}
            />
          )}

          {activeTab === 'kelas' && (
            <KelasTab 
              key={LocalDB.getActiveUnit() || 'standalone'}
              kelas={kelas}
              ruangan={ruangan}
              newKelas={newKelas}
              setNewKelas={setNewKelas}
              newRuangan={newRuangan}
              setNewRuangan={setNewRuangan}
              handleAddKelas={handleAddKelas}
              handleDeleteKelas={handleDeleteKelas}
              handleAddRuangan={handleAddRuangan}
              handleDeleteRuangan={handleDeleteRuangan}
            />
          )}

          {activeTab === 'pengampu' && (
            <PengampuTab 
              guru={guru}
              mapel={mapel}
              kelas={kelas}
              pengampu={pengampu}
              newPengampu={newPengampu}
              setNewPengampu={setNewPengampu}
              handleAddPengampu={handleAddPengampu}
              handleDeletePengampu={handleDeletePengampu}
            />
          )}

          {activeTab === 'generate' && (
            <GenerateTab 
              guru={guru}
              kelas={kelas}
              pengampu={pengampu}
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              allowPartial={allowPartial}
              setAllowPartial={setAllowPartial}
              isGenerating={isGenerating}
              stats={stats}
              handleGenerateAutomatedTimetable={handleGenerateAutomatedTimetable}
              handleCancelGeneration={handleCancelGeneration}
              generationProgress={generationProgress}
            />
          )}

          {activeTab === 'grid' && (
            <GridTab 
              guru={guru}
              kelas={kelas}
              mapel={mapel}
              ruangan={ruangan}
              jamPelajaran={jamPelajaran}
              jadwal={jadwal}
              conflicts={conflicts}
              filterType={filterType}
              setFilterType={setFilterType}
              filterId={filterId}
              setFilterId={setFilterId}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              handleCellClick={handleCellClick}
              handleManualDeleteSlot={handleManualDeleteSlot}
              handleExportExcel={handleExportExcel}
              handlePrintPDF={handlePrintPDF}
              filteredScheduleMatrix={filteredScheduleMatrix}
              setActiveTab={handleSetActiveTab}
              hariAktif={hariAktif}
              pengampu={pengampu}
              onRefresh={loadDatabase}
              addLogMessage={(msg: string) => setLogMessages(prev => [msg, ...prev])}
            />
          )}

          {activeTab === 'pengaturan_waktu' && (
            <PengaturanWaktuTab
              hariAktif={hariAktif}
              jamPelajaran={jamPelajaran}
              batasJamHari={batasJamHari}
              onUpdateHariAktif={setHariAktif}
              onUpdateJamPelajaran={setJamPelajaran}
              onUpdateBatasJamHari={handleUpdateBatasJamHari}
              loadDatabase={loadDatabase}
              setLogMessages={setLogMessages}
              onPushAllToCloud={handlePushAllToCloud}
            />
          )}

          {activeTab === 'school_profile' && (
            <SchoolProfileTab
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              addLogMessage={(msg: string) => setLogMessages(prev => [msg, ...prev])}
              onProfileUpdated={loadDatabase}
            />
          )}

          {activeTab === 'konflik' && (
            <KonflikTab conflicts={conflicts} />
          )}

          {activeTab === 'beban_kerja' && (
            <BebanKerjaTab 
              guru={guru}
              pengampu={pengampu}
              jadwal={jadwal}
            />
          )}

          {activeTab === 'versions' && (
            <VersionsTab 
              jadwal={jadwal}
              conflicts={conflicts}
              stats={stats}
              onLoadVersion={(v) => {
                loadDatabase(true);
                setStats({
                  executionTimeMs: v.stats.executionTimeMs || 0,
                  score: v.stats.score,
                  totalLessonsNeeded: v.stats.totalLessonsNeeded || pengampu.reduce((acc, curr) => acc + curr.jumlah_jam, 0),
                  totalLessonsPlotted: v.stats.totalLessonsPlotted,
                  totalConflicts: v.stats.totalConflicts
                });
              }}
              onRefresh={loadDatabase}
              addLogMessage={(msg: string) => setLogMessages(prev => [msg, ...prev])}
            />
          )}

          {activeTab === 'tutorial' && (
            <TutorialTab 
              setActiveTab={handleSetActiveTab} 
              isSupabaseActive={isSupabaseModeActive()} 
            />
          )}

          {activeTab === 'supabase' && (
            <SupabaseTab 
              setLogMessages={setLogMessages} 
              hasUnsavedChanges={hasUnsavedChanges}
              setHasUnsavedChanges={setHasUnsavedChanges}
            />
          )}

          {activeTab === 'activation' && (
            <ActivationTab
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              setLogMessages={setLogMessages}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminTab
              currentUser={currentUser}
              setLogMessages={setLogMessages}
            />
          )}
        </main>
      </div>

      {/* SYNC PROGRESS MODAL */}
      {syncShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className={`p-2 rounded-full border ${
                syncResultState === 'syncing' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 animate-pulse' :
                syncResultState === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                'bg-rose-50 border-rose-200 text-rose-600'
              }`}>
                {syncResultState === 'syncing' ? (
                  <CloudUpload className="w-5 h-5 animate-bounce-slow" />
                ) : syncResultState === 'success' ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {syncResultState === 'syncing' ? 'Penyelarasan Supabase' :
                   syncResultState === 'success' ? 'Sinkronisasi Berhasil!' :
                   'Sinkronisasi Gagal'}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">
                  {syncResultState === 'syncing' ? 'SEDANG MENGIRIM DATA' : 'STATUS PENYIMPANAN'}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-1 text-xs text-slate-600">
              {syncResultState === 'syncing' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="truncate text-slate-800">{syncStatusText}</span>
                    <span className="font-mono text-indigo-600 font-bold ml-2 shrink-0">{syncProgress}%</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 relative">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Mohon jangan menutup halaman ini selama proses sinkronisasi berlangsung.
                  </p>
                </div>
              )}

              {syncResultState === 'success' && (
                <div className="space-y-4">
                  {/* Deskripsi Utama */}
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Seluruh konfigurasi dan jadwal pelajaran Anda telah berhasil disinkronkan secara aman ke <span className="font-semibold text-emerald-600">Supabase Cloud</span>.
                  </p>

                  {/* Grid Komponen Terarsip & Sinkron */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Komponen Terarsip &amp; Sinkron:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Profil Sekolah',
                        'Data Guru',
                        'Mata Pelajaran',
                        'Rombel &amp; Kelas',
                        'Ruang Belajar',
                        'Jam Pelajaran',
                        'Preferensi Guru',
                        'Ploting Pengampu',
                        'Draf Jadwal',
                        'Laporan Konflik'
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-150/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3px]" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indikator Status Cloud */}
                  <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        Sistem Cloud Aktif
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      100% Sinkron
                    </span>
                  </div>
                </div>
              )}

              {syncResultState === 'failed' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl text-rose-850 font-medium leading-relaxed break-words">
                    <p className="font-bold mb-1 text-rose-900">Detail Kesalahan:</p>
                    {syncErrorMessage || 'Terjadi kesalahan tidak dikenal saat menghubungi server Supabase.'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Silakan periksa koneksi internet Anda atau coba beberapa saat lagi. Data Anda masih tersimpan dengan aman di browser lokal Anda.
                  </p>
                </div>
              )}

              {/* Collapsible Logs Panel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-3.5 py-2 border-b border-slate-200 bg-slate-100/80 flex justify-between items-center">
                  <span className="font-mono text-[9px] tracking-wider uppercase font-bold text-slate-500">Log Sinkronisasi Real-Time</span>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-mono font-bold">{syncLogs.length} Entri</span>
                </div>
                <div className="p-3 max-h-24 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1.5 scrollbar-thin">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="leading-tight truncate">
                      {log.startsWith('✅') || log.includes('berhasil') || log.includes('Sukses') ? (
                        <span className="text-emerald-600 font-semibold">{log}</span>
                      ) : log.startsWith('⚠️') ? (
                        <span className="text-amber-600 font-semibold">{log}</span>
                      ) : log.startsWith('❌') || log.startsWith('ERROR') ? (
                        <span className="text-rose-600 font-bold">{log}</span>
                      ) : (
                        <span>{log}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-slate-100 gap-2">
              {syncResultState === 'syncing' ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 bg-slate-50 text-slate-400 font-bold rounded-xl cursor-not-allowed text-xs flex items-center justify-center gap-2 border border-slate-100"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sedang Menyingkronkan...
                </button>
              ) : syncResultState === 'success' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSyncShowModal(false);
                    // Jika ada pending tab hasil simpan saat berpindah tab, lakukan perpindahan tab di sini
                    if (pendingTab) {
                      const target = pendingTab;
                      setPendingTab(null);
                      setActiveTab(target);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-sm shadow-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Oke, Sangat Bagus &amp; Lanjutkan
                </button>
              ) : (
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSyncShowModal(false);
                    }}
                    className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs text-center font-semibold"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // Coba lagi berdasarkan operasi terakhir
                      if (syncLogs[0]?.includes('pengunggahan') || syncLogs[0]?.includes('berpindah') || syncLogs[0]?.includes('Menyimpan')) {
                        await handlePushAllToCloud();
                      } else {
                        await handleManualForceSync();
                      }
                    }}
                    className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in font-sans text-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-5 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {confirmModal.type === 'reset_master' ? (
                  <div className="bg-amber-50 p-2 rounded-full border border-amber-200 text-amber-600">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  </div>
                ) : confirmModal.type === 'logout' ? (
                  <div className="bg-slate-50 p-2 rounded-full border border-slate-200 text-slate-600">
                    <LogOut className="w-5 h-5" />
                  </div>
                ) : confirmModal.type === 'save_pending_tab' ? (
                  <div className="bg-indigo-50 p-2 rounded-full border border-indigo-200 text-indigo-600 animate-bounce-slow">
                    <CloudUpload className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="bg-rose-50 p-2 rounded-full border border-rose-200 text-rose-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{confirmModal.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium font-mono">KONFIRMASI SISTEM</p>
                </div>
              </div>
              <button 
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="text-slate-600 font-medium leading-relaxed whitespace-normal py-1">
              {confirmModal.message}
            </div>

            {/* Actions for Reset Master */}
            {confirmModal.type === 'reset_master' && (
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="button"
                  onClick={isDemoMode ? executeResetDemo : () => { setConfirmModal(null); handleSwitchToDemoMode(); }}
                  className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-850 border border-amber-220 rounded-xl text-left font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="block">{isDemoMode ? "1. Atur Ulang ke Data Demo SMAN AI" : "1. Aktifkan Mode Demo (Uji Coba)"}</span>
                    <span className="block text-[10px] text-amber-600/80 font-medium mt-0.5 normal-case">
                      {isDemoMode 
                        ? "Mengisi ulang sistem dengan data contoh guru, kelas & mapel" 
                        : "Beralih kembali ke Mode Demo dengan data simulasi lengkap untuk dicoba"}
                    </span>
                  </div>
                  <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
                </button>

                <button 
                  type="button"
                  onClick={executeClearAllMaster}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-105 text-rose-850 border border-rose-220 rounded-xl text-left font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="block">2. Kosongkan Semua Data Master (Mode Asli / Mulai dari Nol)</span>
                    <span className="block text-[10px] text-rose-600/80 font-medium mt-0.5 normal-case">Hapus total semua biodata guru, mapel, kelas & jadwal serta setel ke Mode Asli</span>
                  </div>
                  <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                </button>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            )}

            {/* Actions for Unsaved Changes Navigation Callback */}
            {confirmModal.type === 'save_pending_tab' && (
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="button"
                  onClick={handleSaveAndNavigate}
                  className="w-full py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-left font-bold transition flex items-center justify-between cursor-pointer shadow-sm shadow-indigo-100"
                >
                  <div>
                    <span className="block text-white">💾 Ya, Simpan ke Cloud &amp; Pindah Halaman</span>
                    <span className="block text-[10px] text-indigo-100 font-medium mt-0.5 normal-case">Unggah data terbaru Anda ke cloud, lalu selaraskan secara instan</span>
                  </div>
                  <CloudUpload className="w-4 h-4 text-white shrink-0" />
                </button>

                <button 
                  type="button"
                  onClick={handleDiscardAndNavigate}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-left font-bold transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="block text-rose-800">⚠️ Lewati Penyimpanan &amp; Pindah</span>
                    <span className="block text-[10px] text-rose-600/80 font-medium mt-0.5 normal-case">Lanjutkan berpindah halaman tanpa menyimpan data terbaru ke cloud</span>
                  </div>
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                </button>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => {
                      setConfirmModal(null);
                      setPendingTab(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Actions for Clear Schedule */}
            {confirmModal.type === 'clear_schedule' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={executeClearJadwal}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan Jadwal
                </button>
              </div>
            )}

            {/* Actions for Logout */}
            {confirmModal.type === 'logout' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={executeLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" /> Ya, Keluar Sesi
                </button>
              </div>
            )}

            {/* Actions for Switch to Real Mode */}
            {confirmModal.type === 'switch_to_real' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                >
                  Kembali Uji Coba
                </button>
                <button 
                  type="button"
                  onClick={executeSwitchToRealMode}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-indigo-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Ya, Bersihkan &amp; Masuk Mode Asli
                </button>
              </div>
            )}

            {/* Actions for Switch to Demo Mode */}
            {confirmModal.type === 'switch_to_demo' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={executeSwitchToDemoMode}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ya, Muat Data Demo
                </button>
              </div>
            )}

            {/* Actions for Generic Deletions */}
            {confirmModal.type !== 'reset_master' && confirmModal.type !== 'clear_schedule' && confirmModal.type !== 'logout' && confirmModal.type !== 'switch_to_real' && confirmModal.type !== 'switch_to_demo' && confirmModal.onConfirm && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Data
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* PROFESSIONAL MODE TRANSITION OVERLAY */}
      {isTransitioningMode && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white font-sans text-xs">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center space-y-5">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-slate-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100">Transisi Mode Berjalan</h4>
              <p className="text-[11px] text-indigo-400 font-mono font-bold leading-relaxed">{transitionStepText}</p>
              <p className="text-[10px] text-slate-400 font-medium">Harap tunggu sementara sistem mengonfigurasi database...</p>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL LOGOUT LOADER OVERLAY */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white font-sans text-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center space-y-5">
            {logoutStatus === 'loading' ? (
              <>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-100">Sedang Keluar Sesi</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Membersihkan sesi aktif dan cache lokal secara aman...</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-400">Berhasil Keluar Sesi</h4>
                  <p className="text-[11px] text-slate-300 font-medium font-sans">Sesi Anda telah diakhiri dengan sukses.</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-1 font-bold">Mengalihkan ke halaman masuk...</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

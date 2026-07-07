'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Sparkles, BookOpen, Download, Calendar } from 'lucide-react';
import { MataPelajaran, Hari, JamPelajaran } from '../lib/types';

interface MapelTabProps {
  mapel: MataPelajaran[];
  newMapel: Partial<MataPelajaran>;
  setNewMapel: React.Dispatch<React.SetStateAction<Partial<MataPelajaran>>>;
  handleAddMapel: (e: React.FormEvent) => void;
  handleDeleteMapel: (id: string) => void;
  handleUpdateMapel: (updatedMapel: MataPelajaran) => void;
  handleImportMapels: (newMapels: MataPelajaran[]) => void;
  hariAktif: Hari[];
  jamPelajaran?: JamPelajaran[];
}

interface SubjectPreset {
  kode_mapel: string;
  nama_mapel: string;
  jumlah_jam_per_minggu: number;
}

const PRESETS: Record<string, { label: string; description: string; subjects: SubjectPreset[] }> = {
  SD: {
    label: "SD",
    description: "Kurikulum standar Sekolah Dasar (Fase A-C)",
    subjects: [
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPAS", nama_mapel: "Ilmu Pengetahuan Alam dan Sosial", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AGM", nama_mapel: "Pendidikan Agama dan Budi Pekerti", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "SNB", nama_mapel: "Seni dan Budaya", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "PJOK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "ING", nama_mapel: "Bahasa Inggris", jumlah_jam_per_minggu: 2 },
    ]
  },
  SMP: {
    label: "SMP",
    description: "Kurikulum Merdeka standar tingkat SMP",
    subjects: [
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "ING", nama_mapel: "Bahasa Inggris", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPA", nama_mapel: "Ilmu Pengetahuan Alam", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPS", nama_mapel: "Ilmu Pengetahuan Sosial", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AGM", nama_mapel: "Pendidikan Agama dan Budi Pekerti", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "INF", nama_mapel: "Informatika", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SBR", nama_mapel: "Seni dan Prakarya", jumlah_jam_per_minggu: 2 },
    ]
  },
  SMA: {
    label: "SMA",
    description: "Kurikulum Merdeka Fase F tingkat SMA",
    subjects: [
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "ING", nama_mapel: "Bahasa Inggris", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AGM", nama_mapel: "Pendidikan Agama", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "SJR", nama_mapel: "Sejarah", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "FIS", nama_mapel: "Fisika", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "KIM", nama_mapel: "Kimia", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "BIO", nama_mapel: "Biologi", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "EKO", nama_mapel: "Ekonomi", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "SOS", nama_mapel: "Sosiologi", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "GEO", nama_mapel: "Geografi", jumlah_jam_per_minggu: 3 },
    ]
  },
  SMK: {
    label: "SMK",
    description: "Kurikulum vokasi standar tingkat SMK",
    subjects: [
      { kode_mapel: "MTKK", nama_mapel: "Matematika Kejuruan", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "INGK", nama_mapel: "Bahasa Inggris & Komunikasi", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AGM", nama_mapel: "Pendidikan Agama", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SJR", nama_mapel: "Sejarah", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "INF", nama_mapel: "Informatika", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "DKJ", nama_mapel: "Dasar-Dasar Kejuruan", jumlah_jam_per_minggu: 6 },
      { kode_mapel: "PKK", nama_mapel: "Projek Kreatif dan Kewirausahaan", jumlah_jam_per_minggu: 4 },
    ]
  },
  MI: {
    label: "MI",
    description: "Kurikulum Kementerian Agama untuk Madrasah Ibtidaiyah",
    subjects: [
      { kode_mapel: "QRH", nama_mapel: "Al-Qur'an Hadis", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AKH", nama_mapel: "Akidah Akhlak", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "FIH", nama_mapel: "Fikih", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "ARB", nama_mapel: "Bahasa Arab", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPAS", nama_mapel: "Ilmu Pengetahuan Alam dan Sosial", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "PJOK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "SNB", nama_mapel: "Seni dan Budaya", jumlah_jam_per_minggu: 2 },
    ]
  },
  MTS: {
    label: "MTs",
    description: "Kurikulum Kementerian Agama untuk Madrasah Tsanawiyah",
    subjects: [
      { kode_mapel: "QRH", nama_mapel: "Al-Qur'an Hadis", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AKH", nama_mapel: "Akidah Akhlak", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "FIH", nama_mapel: "Fikih", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "ARB", nama_mapel: "Bahasa Arab", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "ING", nama_mapel: "Bahasa Inggris", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPA", nama_mapel: "Ilmu Pengetahuan Alam", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IPS", nama_mapel: "Ilmu Pengetahuan Sosial", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "INF", nama_mapel: "Informatika", jumlah_jam_per_minggu: 2 },
    ]
  },
  MA: {
    label: "MA",
    description: "Kurikulum Kementerian Agama untuk Madrasah Aliyah",
    subjects: [
      { kode_mapel: "QRH", nama_mapel: "Al-Qur'an Hadis", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AKH", nama_mapel: "Akidah Akhlak", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "FIH", nama_mapel: "Fikih", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "ARB", nama_mapel: "Bahasa Arab", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "MTK", nama_mapel: "Matematika", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "ING", nama_mapel: "Bahasa Inggris", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "FIS", nama_mapel: "Fisika", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "KIM", nama_mapel: "Kimia", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "BIO", nama_mapel: "Biologi", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "EKO", nama_mapel: "Ekonomi", jumlah_jam_per_minggu: 3 },
    ]
  },
  MAK: {
    label: "MAK",
    description: "Kurikulum Kemenag untuk Madrasah Aliyah Kejuruan",
    subjects: [
      { kode_mapel: "QRH", nama_mapel: "Al-Qur'an Hadis", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "AKH", nama_mapel: "Akidah Akhlak", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "FIH", nama_mapel: "Fikih", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "SKI", nama_mapel: "Sejarah Kebudayaan Islam", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "ARB", nama_mapel: "Bahasa Arab", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "MTKK", nama_mapel: "Matematika Kejuruan", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "IND", nama_mapel: "Bahasa Indonesia", jumlah_jam_per_minggu: 3 },
      { kode_mapel: "INGK", nama_mapel: "Bahasa Inggris & Komunikasi", jumlah_jam_per_minggu: 4 },
      { kode_mapel: "PPN", nama_mapel: "Pendidikan Pancasila", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "PJK", nama_mapel: "Pendidikan Jasmani, Olahraga, dan Kesehatan", jumlah_jam_per_minggu: 2 },
      { kode_mapel: "DKK", nama_mapel: "Dasar-Dasar Kejuruan Keagamaan", jumlah_jam_per_minggu: 6 },
      { kode_mapel: "PKK", nama_mapel: "Projek Kreatif dan Kewirausahaan", jumlah_jam_per_minggu: 4 },
    ]
  }
};

export default function MapelTab({
  mapel,
  newMapel,
  setNewMapel,
  handleAddMapel,
  handleDeleteMapel,
  handleUpdateMapel,
  handleImportMapels,
  hariAktif,
  jamPelajaran = []
}: MapelTabProps) {
  const periodsList = jamPelajaran && jamPelajaran.length > 0 
    ? [...jamPelajaran].map(p => p.jam_ke).sort((a, b) => a - b)
    : [1, 2, 3, 4, 5, 6, 7, 8];
  // Subject specific availability modal state
  const [ketersediaanModalMapelId, setKetersediaanModalMapelId] = useState<string | null>(null);
  const [tempSlotTidakBersedia, setTempSlotTidakBersedia] = useState<{ hari: Hari; jam_ke: number }[]>([]);

  const activeDays = hariAktif && hariAktif.length > 0 ? hariAktif : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as Hari[];

  // Inline edit state for existing subjects
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MataPelajaran>>({});

  // Preset state
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(null);
  const [presetSubjects, setPresetSubjects] = useState<SubjectPreset[]>([]);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());

  // Handle direct preset selection synchronously on click
  const handleSelectPreset = (key: string) => {
    if (selectedPresetKey === key) {
      setSelectedPresetKey(null);
      setPresetSubjects([]);
      setCheckedIndices(new Set());
    } else {
      setSelectedPresetKey(key);
      if (PRESETS[key]) {
        const defaultSubjects = PRESETS[key].subjects.map(s => ({ ...s }));
        setPresetSubjects(defaultSubjects);
        setCheckedIndices(new Set(defaultSubjects.map((_, i) => i)));
      }
    }
  };

  // Start editing an active subject
  const startEditing = (m: MataPelajaran) => {
    setEditingId(m.id);
    setEditForm({ ...m });
  };

  // Cancel editing an active subject
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save changes to active subject
  const saveEditing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nama_mapel || !editForm.kode_mapel) return;
    
    handleUpdateMapel({
      id: editingId!,
      kode_mapel: editForm.kode_mapel.toUpperCase(),
      nama_mapel: editForm.nama_mapel,
      jumlah_jam_per_minggu: Number(editForm.jumlah_jam_per_minggu) || 4
    });

    setEditingId(null);
    setEditForm({});
  };

  // Open subject-specific availability modal
  const openKetersediaanModal = (m: MataPelajaran) => {
    setKetersediaanModalMapelId(m.id);
    setTempSlotTidakBersedia(m.slot_tidak_bersedia || []);
  };

  // Toggle specific slot for subject availability
  const toggleSpecificSlotBlocked = (d: Hari, s: number) => {
    setTempSlotTidakBersedia(prev => {
      const exists = prev.some(x => x.hari === d && x.jam_ke === s);
      if (exists) {
        return prev.filter(x => !(x.hari === d && x.jam_ke === s));
      } else {
        return [...prev, { hari: d, jam_ke: s }];
      }
    });
  };

  // Save subject availability preferences
  const handleSaveKetersediaan = () => {
    const m = mapel.find(x => x.id === ketersediaanModalMapelId);
    if (m) {
      handleUpdateMapel({
        ...m,
        slot_tidak_bersedia: tempSlotTidakBersedia
      });
    }
    setKetersediaanModalMapelId(null);
  };

  // Reset subject availability preferences
  const handleResetKetersediaan = () => {
    setTempSlotTidakBersedia([]);
  };

  // Handle preset checkbox toggle
  const togglePresetIndex = (index: number) => {
    const next = new Set(checkedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedIndices(next);
  };

  // Handle changes to a preset subject's name, code, or JP
  const handlePresetSubjectChange = (index: number, field: keyof SubjectPreset, value: string | number) => {
    setPresetSubjects(prev => prev.map((s, idx) => {
      if (idx === index) {
        return {
          ...s,
          [field]: field === 'jumlah_jam_per_minggu' ? Number(value) : value
        };
      }
      return s;
    }));
  };

  // Import custom selected preset subjects
  const importSelectedPreset = () => {
    if (checkedIndices.size === 0) return;

    const subjectsToImport: MataPelajaran[] = [];
    presetSubjects.forEach((s, i) => {
      if (checkedIndices.has(i) && s.nama_mapel && s.kode_mapel) {
        subjectsToImport.push({
          id: `mapel-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          kode_mapel: s.kode_mapel.toUpperCase(),
          nama_mapel: s.nama_mapel,
          jumlah_jam_per_minggu: Number(s.jumlah_jam_per_minggu) || 4
        });
      }
    });

    handleImportMapels(subjectsToImport);
    // Reset selection
    setSelectedPresetKey(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kelola Mata Pelajaran Sekolah</h2>
        <p className="text-xs text-slate-500">Merumuskan daftar mata pelajaran kurikulum beserta total alokasi jam tatap muka per minggu.</p>
      </div>

      {/* SECTION PRESETS & TEMPLATES */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Template Kurikulum Cepat</h3>
            <p className="text-[11px] text-slate-500">Gunakan preset kurikulum resmi berbagai jenjang sekolah di Indonesia. Pelajaran bisa diedit sebelum diimpor.</p>
          </div>
        </div>

        {/* Buttons for Levels */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer select-none ${
                selectedPresetKey === key
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Preset Preview & Live Editor */}
        {selectedPresetKey && PRESETS[selectedPresetKey] && (
          <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Pratinjau &amp; Sesuaikan Template</span>
                <h4 className="font-bold text-slate-800 text-sm">{PRESETS[selectedPresetKey].label} - {PRESETS[selectedPresetKey].description}</h4>
              </div>
              <button
                onClick={importSelectedPreset}
                disabled={checkedIndices.size === 0}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Download className="w-3.5 h-3.5" />
                Impor ({checkedIndices.size}) Mapel Terpilih
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
              <table className="w-full text-left text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                    <th className="py-2 px-3 w-10">Pilih</th>
                    <th className="py-2 px-3 w-28">Kode (Edit)</th>
                    <th className="py-2 px-3">Nama Mata Pelajaran (Edit)</th>
                    <th className="py-2 px-3 w-24">JP/Minggu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {presetSubjects.map((subject, index) => {
                    const isChecked = checkedIndices.has(index);
                    return (
                      <tr key={index} className={`hover:bg-slate-50/70 transition ${isChecked ? 'bg-indigo-50/10' : 'opacity-65'}`}>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePresetIndex(index)}
                            className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={subject.kode_mapel}
                            disabled={!isChecked}
                            onChange={(e) => handlePresetSubjectChange(index, 'kode_mapel', e.target.value)}
                            className="w-full font-mono font-bold text-indigo-700 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 transition-all uppercase"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={subject.nama_mapel}
                            disabled={!isChecked}
                            onChange={(e) => handlePresetSubjectChange(index, 'nama_mapel', e.target.value)}
                            className="w-full font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={subject.jumlah_jam_per_minggu}
                            disabled={!isChecked}
                            onChange={(e) => handlePresetSubjectChange(index, 'jumlah_jam_per_minggu', e.target.value)}
                            className="w-16 font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FORM ADD SUBJECT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" /> Tambah Mata Pelajaran
          </h3>

          <form onSubmit={handleAddMapel} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nama Mata Pelajaran</label>
              <input 
                type="text" 
                value={newMapel.nama_mapel || ''}
                onChange={(e) => setNewMapel({...newMapel, nama_mapel: e.target.value})}
                placeholder="contoh: Pendidikan Kewarganegaraan"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Kode Mapel (Singkat)</label>
                <input 
                  type="text" 
                  value={newMapel.kode_mapel || ''}
                  onChange={(e) => setNewMapel({...newMapel, kode_mapel: e.target.value})}
                  placeholder="contoh: PKN"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Durasi (JP/Minggu)</label>
                <input 
                  type="number" 
                  min={1}
                  max={10}
                  value={newMapel.jumlah_jam_per_minggu || 4}
                  onChange={(e) => setNewMapel({...newMapel, jumlah_jam_per_minggu: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Daftarkan Mapel
            </button>
          </form>
        </div>

        {/* SUBJECTS LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="font-semibold text-slate-800 text-sm">Daftar Mata Pelajaran Aktif</h3>
          
          <div className="overflow-x-auto text-xs font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Kode Mapel</th>
                  <th className="py-2.5 px-3">Nama Lengkap Mata Pelajaran</th>
                  <th className="py-2.5 px-3 w-40">Jumlah Jam Mengajar Seminggu</th>
                  <th className="py-2.5 px-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mapel.map((m) => {
                  const isEditing = editingId === m.id;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/55">
                      {isEditing ? (
                        <>
                          <td className="py-2 px-2" colSpan={4}>
                            <form onSubmit={saveEditing} className="flex flex-wrap items-center gap-3 w-full">
                              <div className="w-24">
                                <input
                                  type="text"
                                  value={editForm.kode_mapel || ''}
                                  onChange={(e) => setEditForm({ ...editForm, kode_mapel: e.target.value })}
                                  className="w-full font-mono font-bold text-indigo-700 border border-slate-200 rounded px-2 py-1 text-xs uppercase focus:outline-none focus:border-indigo-500"
                                  placeholder="KODE"
                                  required
                                />
                              </div>
                              <div className="flex-1 min-w-[150px]">
                                <input
                                  type="text"
                                  value={editForm.nama_mapel || ''}
                                  onChange={(e) => setEditForm({ ...editForm, nama_mapel: e.target.value })}
                                  className="w-full font-bold text-slate-800 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                                  placeholder="Nama Mapel"
                                  required
                                />
                              </div>
                              <div className="w-20">
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editForm.jumlah_jam_per_minggu || 4}
                                  onChange={(e) => setEditForm({ ...editForm, jumlah_jam_per_minggu: Number(e.target.value) })}
                                  className="w-full font-bold text-slate-700 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-indigo-500"
                                  required
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="submit"
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                                  title="Simpan Perubahan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded transition cursor-pointer"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </form>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">{m.kode_mapel}</td>
                          <td className="py-3 px-3 text-slate-800 font-bold">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{m.nama_mapel}</span>
                              {m.slot_tidak_bersedia && m.slot_tidak_bersedia.length > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-55 text-rose-600 border border-rose-100">
                                  {m.slot_tidak_bersedia.length} Jam Blokir
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            <span className="font-bold text-slate-900">{m.jumlah_jam_per_minggu}</span> JP (Jam Pelajaran)
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openKetersediaanModal(m)}
                                className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50 transition cursor-pointer"
                                title="Atur Ketersediaan Mapel"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => startEditing(m)}
                                className="text-amber-600 hover:text-amber-850 p-1.5 rounded hover:bg-amber-50 transition cursor-pointer"
                                title="Edit Mapel"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMapel(m.id)}
                                className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Mapel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {mapel.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      Belum ada mata pelajaran aktif. Gunakan formulir di kiri atau pilih template kurikulum di atas untuk memulai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SUBJECT AVAILABILITY / KETERSEDIAAN MODAL */}
      {ketersediaanModalMapelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in text-xs max-h-[90vh] flex flex-col font-sans">
            
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Konstruksi Aturan Ketersediaan Mata Pelajaran (Opsional)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Mengatur slot larangan waktu penempatan untuk mapel: <span className="text-indigo-600 font-bold">{mapel.find(m => m.id === ketersediaanModalMapelId)?.nama_mapel}</span></p>
              </div>
              <button 
                onClick={() => setKetersediaanModalMapelId(null)}
                className="text-slate-600 hover:text-slate-900 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-700">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-700 block text-xs">Penjelasan Aturan Ketersediaan Mata Pelajaran:</span>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Beberapa mata pelajaran tidak cocok diletakkan di akhir hari sekolah (misalnya olahraga/PJOK, matematika rumit, atau praktikum melelahkan). Anda dapat memblokir slot hari &amp; jam pelajaran tertentu di bawah ini agar sistem otomatis meletakkannya hanya pada slot waktu yang diperbolehkan.
                </p>
              </div>

              {/* SPECIFIC SLOTS BLOCK GRID */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <span className="font-bold text-rose-700 block uppercase tracking-tight font-mono text-[10px] border-b border-slate-200 pb-1">
                    Slot Hari &amp; Jam TIDAK DIPERBOLEHKAN (Blok)
                  </span>
                  <span className="text-slate-500 text-[11px] font-medium block mt-1">
                    Pilih kotak di bawah untuk memblokir slot hari dan jam pelajaran spesifik (tanda ✕ berarti mapel dilarang keras di slot tersebut).
                  </span>
                </div>
                
                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="w-full border-collapse bg-white text-center text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-2 text-left font-bold text-slate-500">Hari \ Jam</th>
                        {periodsList.map((s) => (
                          <th key={s} className="p-2 font-mono font-bold text-slate-500">
                            Ke-{s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDays.map((d) => (
                        <tr key={d} className="hover:bg-slate-50/50">
                          <td className="p-2 text-left font-semibold text-slate-700 whitespace-nowrap bg-slate-50/30">
                            {d}
                          </td>
                          {periodsList.map((s) => {
                            const isSlotBlocked = tempSlotTidakBersedia.some(x => x.hari === d && x.jam_ke === s);
                            return (
                              <td key={s} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSpecificSlotBlocked(d, s)}
                                  className={`w-full py-2 font-semibold rounded-md transition border cursor-pointer ${
                                    isSlotBlocked
                                      ? 'bg-rose-100 text-rose-700 border-rose-300 font-bold'
                                      : 'bg-slate-50/60 hover:bg-slate-100 text-slate-400 hover:text-slate-650 border-slate-200/50'
                                  }`}
                                  title={`${d} Jam Ke-${s}: Klik untuk ${isSlotBlocked ? 'izinkan' : 'blokir'}`}
                                >
                                  {isSlotBlocked ? '✕' : '✔'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* ACTIONS BAR */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetKetersediaan}
                className="mr-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Bebaskan Semua Slot
              </button>
              <button 
                onClick={() => setKetersediaanModalMapelId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveKetersediaan}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

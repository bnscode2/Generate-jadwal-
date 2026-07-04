'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Check, ChevronDown, Settings, AlertCircle, Info } from 'lucide-react';
import { LocalDB } from '../lib/db';

interface YayasanUnitSwitcherProps {
  onUnitChanged: () => void;
  addLog: (msg: string) => void;
}

export default function YayasanUnitSwitcher({ onUnitChanged, addLog }: YayasanUnitSwitcherProps) {
  const [isYayasanMode, setIsYayasanMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const active = LocalDB.getActiveUnit();
    const list = LocalDB.getUnitsList();
    return active !== null || list.length > 0;
  });
  const [units, setUnits] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return LocalDB.getUnitsList();
  });
  const [activeUnit, setActiveUnit] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return LocalDB.getActiveUnit();
  });
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [newUnitName, setNewUnitName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);

  const handleToggleYayasanMode = (checked: boolean) => {
    if (!checked) {
      // Deactivating yayasan mode, set active unit to null
      LocalDB.setActiveUnit(null);
      setActiveUnit(null);
      setIsYayasanMode(false);
      addLog('Mengaktifkan Mode Mandiri (Default Single-School)');
      onUnitChanged();
    } else {
      setIsYayasanMode(true);
      const list = LocalDB.getUnitsList();
      if (list.length === 0) {
        // Create default units if empty
        LocalDB.addUnit('SD IT');
        LocalDB.addUnit('SMP IT');
        LocalDB.addUnit('SMA IT');
        const updatedList = LocalDB.getUnitsList();
        setUnits(updatedList);
        LocalDB.setActiveUnit(updatedList[0]);
        setActiveUnit(updatedList[0]);
        addLog(`Mengaktifkan Mode Yayasan dengan unit default: ${updatedList[0]}`);
      } else {
        LocalDB.setActiveUnit(list[0]);
        setActiveUnit(list[0]);
        addLog(`Mengaktifkan Mode Yayasan. Unit aktif: ${list[0]}`);
      }
      onUnitChanged();
    }
  };

  const handleSelectUnit = (unit: string) => {
    LocalDB.setActiveUnit(unit);
    setActiveUnit(unit);
    setIsOpenDropdown(false);
    addLog(`Beralih ke Unit Sekolah: ${unit}`);
    onUnitChanged();
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newUnitName.trim()) {
      setErrorMsg('Nama unit tidak boleh kosong.');
      return;
    }

    const res = LocalDB.addUnit(newUnitName);
    if (res.success) {
      const updatedList = LocalDB.getUnitsList();
      setUnits(updatedList);
      setNewUnitName('');
      setSuccessMsg(res.message);
      addLog(`Menambahkan unit sekolah baru: ${newUnitName}`);
      
      // If no active unit, set this as active
      if (!activeUnit) {
        LocalDB.setActiveUnit(updatedList[updatedList.length - 1]);
        setActiveUnit(updatedList[updatedList.length - 1]);
        onUnitChanged();
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDeleteUnit = (unit: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus Unit "${unit}"? Semua data lokal yang terisolasi di dalam unit ini akan tetap aman di memori browser, namun unit tidak akan terdaftar di switcher.`)) {
      const res = LocalDB.deleteUnit(unit);
      if (res.success) {
        const updatedList = LocalDB.getUnitsList();
        setUnits(updatedList);
        const currentActive = LocalDB.getActiveUnit();
        setActiveUnit(currentActive);
        addLog(`Menghapus registrasi unit sekolah: ${unit}`);
        onUnitChanged();
      }
    }
  };

  return (
    <div id="yayasan-unit-switcher-panel" className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-1.5 mx-1 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 font-sans">Kelola Multi-Unit (Yayasan)</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={isYayasanMode}
            onChange={(e) => handleToggleYayasanMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600" />
        </label>
      </div>

      {isYayasanMode ? (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-slate-500 leading-normal">
            Penyusunan jadwal terisolasi per unit sekolah untuk mencegah bentrok dan tabrakan mapel lintas jenjang.
          </p>

          {/* UNIT SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsOpenDropdown(!isOpenDropdown)}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-bold text-slate-700 transition shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                {activeUnit || 'Pilih Unit Sekolah...'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpenDropdown ? 'rotate-180' : ''}`} />
            </button>

            {isOpenDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                {units.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => handleSelectUnit(unit)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
                  >
                    <span>{unit}</span>
                    {activeUnit === unit && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsOpenDropdown(false);
                      setShowManageModal(true);
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-[11px] font-bold text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    Atur Daftar Unit...
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/40">
            <Info className="w-3 h-3 text-indigo-500 shrink-0" />
            <span>Preset Mapel &amp; Data aktif terpisah mandiri.</span>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-slate-400 leading-normal italic">
          Mode mandiri aktif. Sistem beroperasi untuk satu sekolah tunggal (default).
        </p>
      )}

      {/* MANAGE UNITS DIALOG MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Atur Unit Sekolah (Yayasan)</h3>
              </div>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[350px] overflow-y-auto">
              {/* Alert message */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-xs text-amber-800 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Informasi Isolasi Data:</p>
                  <p className="font-medium text-[11px] text-slate-600 mt-0.5">
                    Setiap unit sekolah memiliki daftar guru, mata pelajaran, kelas, ruangan, dan hasil jadwal yang terisolasi secara mandiri. Hal ini menjamin kurikulum jenjang SD tidak tercampur dengan SMP/SMA.
                  </p>
                </div>
              </div>

              {/* Form Add Unit */}
              <form onSubmit={handleAddUnit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: SD IT Al-Hikmah, SMP, SMA..."
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-semibold outline-none text-slate-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </form>

              {errorMsg && <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">{errorMsg}</div>}
              {successMsg && <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">{successMsg}</div>}

              {/* List of registered units */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">Daftar Unit Terdaftar</label>
                {units.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada unit terdaftar.</p>
                ) : (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 overflow-hidden">
                    {units.map((unit) => (
                      <div key={unit} className="flex items-center justify-between px-3 py-2 bg-slate-50/50 hover:bg-slate-50 transition">
                        <span className="text-xs font-bold text-slate-700">{unit}</span>
                        <div className="flex items-center gap-1.5">
                          {activeUnit === unit ? (
                            <span className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-bold">AKTIF</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUnit(unit)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                              title={`Hapus unit ${unit}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition cursor-pointer shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

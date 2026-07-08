'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
}

export default function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
    title: 'Pemberitahuan',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalAlert = window.alert;
      
      window.alert = (message: string) => {
        const msgStr = String(message || '');
        const msgLower = msgStr.toLowerCase();
        let type: 'success' | 'error' | 'warning' | 'info' = 'info';
        let title = 'Pemberitahuan';

        if (
          msgLower.includes('berhasil') || 
          msgLower.includes('sukses') || 
          msgLower.includes('saved') || 
          msgLower.includes('disimpan') || 
          msgLower.includes('selaras') ||
          msgLower.includes('disalin')
        ) {
          type = 'success';
          title = 'Berhasil';
        } else if (
          msgLower.includes('gagal') || 
          msgLower.includes('kesalahan') || 
          msgLower.includes('error') || 
          msgLower.includes('tidak valid') || 
          msgLower.includes('wajib diisi') ||
          msgLower.includes('harus ada') ||
          msgLower.includes('tidak boleh kosong') ||
          msgLower.includes('belum diisi')
        ) {
          type = 'error';
          title = 'Terjadi Kesalahan';
        } else if (
          msgLower.includes('mohon') || 
          msgLower.includes('harap') || 
          msgLower.includes('peringatan') || 
          msgLower.includes('periksa kembali') ||
          msgLower.includes('belum mendeteksi') ||
          msgLower.includes('terlebih dahulu')
        ) {
          type = 'warning';
          title = 'Peringatan';
        }

        setAlertState({
          isOpen: true,
          message: msgStr,
          type,
          title,
        });
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, []);

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const renderIcon = () => {
    switch (alertState.type) {
      case 'success':
        return (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-sm animate-bounce">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-100 shadow-sm">
            <XCircle className="h-7 w-7 text-rose-600" />
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-100 shadow-sm">
            <AlertTriangle className="h-7 w-7 text-amber-600 animate-pulse" />
          </div>
        );
      default:
        return (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
            <Info className="h-7 w-7 text-indigo-600" />
          </div>
        );
    }
  };

  const getButtonClass = () => {
    switch (alertState.type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20 shadow-emerald-100';
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20 shadow-rose-100';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20 shadow-amber-100';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 shadow-indigo-100';
    }
  };

  return (
    <>
      {children}
      
      <AnimatePresence>
        {alertState.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-4 sm:p-6" id="global-alert-portal">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeAlert}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              className="relative transform overflow-hidden rounded-3xl bg-white border border-slate-100/80 px-6 pb-6 pt-8 text-center shadow-2xl transition-all max-w-sm w-full mx-auto z-10"
            >
              {/* Dynamic Icon */}
              <div className="mb-4">
                {renderIcon()}
              </div>

              {/* Title & Message */}
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                  {alertState.title}
                </h3>
                <p className="text-[11px] font-medium leading-relaxed text-slate-500 max-h-[160px] overflow-y-auto px-1 no-scrollbar whitespace-pre-line">
                  {alertState.message}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={closeAlert}
                  className={`inline-flex w-full justify-center items-center rounded-xl px-4 py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-4 ${getButtonClass()}`}
                >
                  Paham &amp; Lanjutkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

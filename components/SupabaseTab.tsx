'use client';

import React from 'react';
import { Database, Info } from 'lucide-react';
import { SUPABASE_SQL_MIGRATION } from '../lib/database-schema';

interface SupabaseTabProps {
  setLogMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SupabaseTab({ setLogMessages }: SupabaseTabProps) {
  return (
    <div className="space-y-6 lg:col-span-1">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Supabase SQL Schema &amp; Panduan Integrasi</h2>
        <p className="text-xs text-slate-500 font-medium font-sans">Salin skrip DDL/DML migrasi database di bawah ini untuk digunakan di cloud Supabase SQL Editor Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
        
        {/* TUTORIAL CARD IN INDONESIAN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs shadow-xs text-slate-600 font-medium">
          <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-600 font-bold" /> Panduan Langkah (Langkah-ke-Langkah)
          </h3>

          <ol className="list-decimal pl-4.5 space-y-3 text-slate-605 leading-relaxed">
            <li>
              <strong className="text-slate-800 font-semibold">Buat Proyek Baru:</strong> Buka akun konsol <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-650 font-bold hover:underline">Supabase.com</a>, dan daftarkan sebuah proyek database baru.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Buka SQL Editor:</strong> Di menu navigasi sidebar sebelah kiri Supabase, klik tab <i>SQL Editor</i> lalu buat tab baru <i>&quot;New Query&quot;</i>.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Jalankan Migrasi:</strong> Salin seluruh kode schema SQL migrasi di sebelah kanan, tempel ke editor, lalu klik tombol <b className="text-indigo-700 bg-indigo-50 px-1 py-0.5 border border-indigo-200 rounded text-[10px]">Run</b>.
            </li>
            <li>
              <strong className="text-slate-800 font-semibold">Koneksikan Client UI:</strong> Tambahkan variabel environment berikut di dalam file <code className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-indigo-700 font-mono font-bold">.env.local</code> di aplikasi lokal Anda saat deploy di Vercel:
              <pre className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10px] font-mono mt-1.5 leading-normal text-slate-700 font-bold">
NEXT_PUBLIC_SUPABASE_URL=&quot;url-kamu&quot;{"\n"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=&quot;anon-key-kamu&quot;
              </pre>
            </li>
          </ol>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-slate-600">
            <span className="font-semibold text-indigo-850 block mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Penjelasan Teknis:</span>
            Kami telah melengkapi index pencarian komposit dan relasi kunci asing (Foreign Keys CASCADE) di semua tabel guna memberikan performa penjadwalan query tercepat!
          </div>
        </div>

        {/* COPYABLE CODE CONSOLE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Skrip SQL Migrasi Database</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
                alert('Skrip migrasi SQL berhasil disalin ke papan klip Anda.');
                setLogMessages(prev => ['Skrip DDL migrasi SQL berhasil disalin ke clipboard.', ...prev]);
              }}
              className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Salin SQL Schema
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-[10px] text-slate-600 overflow-x-auto h-96 shadow-inner leading-relaxed">
            <pre>{SUPABASE_SQL_MIGRATION}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}

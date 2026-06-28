import type {Metadata} from 'next';
import './globals.css'; // Global styles
import PWARegister from '../components/PWARegister';

export const metadata: Metadata = {
  title: 'Jadwalify - Penjadwalan Sekolah Otomatis',
  description: 'Penyusunan Jadwal Pelajaran Sekolah Otomatis Bebas Bentrok menggunakan Algoritma CSP, Backtracking, MRV, & Forward Checking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Jadwalify',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body suppressHydrationWarning>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}


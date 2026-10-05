import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/context/AuthContext';
import { MobileShell } from '@/components/layout/MobileShell';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Dapur Nia - Katering Harian Rumahan',
  description: 'Sistem manajemen katering harian terintegrasi Dapur Nia: Kelola menu, pelanggan, pesanan, dan laporan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, 'font-sans', geist.variable)}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <MobileShell>{children}</MobileShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

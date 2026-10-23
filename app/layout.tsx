
import type { Metadata } from 'next';
import ThemeProvider from './components/ThemeProvider';
import AppShell from './components/AppShell';
import AuthGuard from './components/AuthGuard';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyFlow',
  description: 'A cute study management app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fff9fc] text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider />

        <AuthGuard>
          <AppShell>
            {children}
          </AppShell>
        </AuthGuard>
      </body>
    </html>
  );
}

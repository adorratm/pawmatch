import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { AdminShell } from '@/components/AdminShell';
import { ConfirmProvider } from '@/components/ConfirmProvider';
import { ToastProvider } from '@/components/ToastProvider';

const ubuntu = Ubuntu({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PawMatch Admin',
  description: 'PawMatch yönetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={ubuntu.className}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AdminShell>{children}</AdminShell>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

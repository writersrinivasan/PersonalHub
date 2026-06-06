import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'PersonalHub — Your Life Dashboard',
  description: 'Personal productivity and finance dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#4f46e5', borderRadius: '0.75rem' },
      }}
    >
      <html lang="en">
        <body className="bg-gray-50">{children}</body>
      </html>
    </ClerkProvider>
  );
}

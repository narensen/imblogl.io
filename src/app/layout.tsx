import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TrpcProvider from '@/src/trpc/Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blog Platform',
  description: 'A multi-user blogging platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
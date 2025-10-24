import type { Metadata } from 'next';
import './globals.css';
import TrpcProvider from '@/src/trpc/Provider';
import Header from '@/components/Header';


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
    <html lang="en" className="h-full bg-white">
      <body className="h-full">
        <TrpcProvider>
          {/* This layout excludes the admin section */}
          {/* We'll handle that by *not* adding it to /admin/layout.tsx */}
          <Header /> 
          {children}
        </TrpcProvider>
      </body>
    </html>
  );
}
import { Metadata } from 'next';
import '../globals.css';
import { Inter } from 'next/font/google';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import {Left , Right , Footer} from '@/components/component/Sidebar';
import { Toaster } from 'react-hot-toast';  
import Navbar from '@/components/component/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Stringz",
  description: " ",
  keywords: "tweet, social media, Next.js , post , ",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar/>
          <main className="flex flex-row">
            <Left />
            <section className="flex min-h-screen flex-1 flex-col items-center bg-color1 px-6 pb-10 pt-28 max-md:pb-32 sm:px-10 ">
              <div className="w-full max-w-4xl">{children}</div>
            </section>
             <Right />
          </main>
          <Footer />
       
          <Toaster position="top-right" reverseOrder={false} />
        </body>
      </html>
    </ClerkProvider>
  );
}
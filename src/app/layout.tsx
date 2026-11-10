import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Class 12 Commerce – Board Sample Papers & Model Solutions',
  description:
    'Explore Class 12 Commerce sample papers, understand important questions, and prepare smarter with authentic Maharashtra Board solutions.',
  keywords: [
    'Class 12 Commerce',
    'Sample Papers',
    'Book Keeping and Accountancy',
    'OCM',
    'Economics',
    'Secretarial Practice',
    'Model Solutions',
    'Board Exam 2026'
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-main)] text-[var(--text-primary)] min-h-screen flex flex-col font-sans antialiased selection:bg-[#8B5CF6] selection:text-white transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

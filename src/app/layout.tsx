import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eid Al-Adha Card Generator — LPL',
  description: 'Generate your personalized Eid Al-Adha Mubarak greeting card',
  keywords: ['Eid Al-Adha', 'greeting card', 'Eid Mubarak', 'Dr Lal PathLabs'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Hind Siliguri — Bengali + Latin support */}
        {/* Dancing Script — cursive "Mubarak" heading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

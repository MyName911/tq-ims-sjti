import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap', axes: ['opsz'] });

export const metadata = {
  title: { default: 'IMS Digital System | PT Safarijunie Textindo', template: '%s | IMS Digital System' },
  description: 'Sistem manajemen mutu digital ISO 9001:2026 PT Safarijunie Textindo — dashboard terintegrasi untuk monitoring kualitas, risiko, audit, dan CAPA.',
  applicationName: 'IMS Digital System — PT Safarijunie Textindo',
  robots: { index: false, follow: false },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Terapkan pilihan sidebar tersembunyi sebelum halaman tergambar agar tidak berkedip. */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('sidebar')==='hidden')document.documentElement.dataset.sidebar='hidden'}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

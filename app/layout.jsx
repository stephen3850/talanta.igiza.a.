import './globals.css';
import PWAServiceWorkerRegister from '../components/PWAServiceWorkerRegister';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import MobileBottomNav from '../components/MobileBottomNav';
import VisitorChatAssistant from '../components/VisitorChatAssistant';

export const viewport = {
  themeColor: '#10B981',
};

export const metadata = {
  title: 'Talanta Stadium Smart Digital Infrastructure | Official Portal',
  description: 'Integrated digital ticketing, cashless payments, workforce accreditation, and real-time gate operations for Talanta Sports City (60,000 Capacity), Nairobi, Kenya. Developed by ST-Tech ICT Consultants.',
  keywords: ['Talanta Stadium', 'Smart Infrastructure', 'ST-Tech ICT', 'M-PESA Ticketing', 'Kenya Sports', 'Nairobi', 'PWA'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Talanta Stadium',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950 pb-16 lg:pb-0 text-neutral-900 dark:text-slate-100" suppressHydrationWarning>
        <PWAServiceWorkerRegister />
        <PWAInstallPrompt />
        <VisitorChatAssistant />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}

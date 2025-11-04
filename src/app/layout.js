import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import ParticlesBackground from '@/components/particles-background';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Deadline Tracker - Stay Organized",
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  description: "Track your deadlines and stay organized with our beautiful deadline management system",
};

export default function RootLayout({ children }) {
  // ParticlesBackground is a client-only component, loaded dynamically with ssr:false
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-white dark:bg-black`}
      >
        {/* Remove common extension-injected attributes (e.g. Grammarly) before React hydrates to avoid dev hydration warnings */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var el=document.documentElement; if(el){el.removeAttribute('data-gr-ext-installed'); el.removeAttribute('data-new-gr-c-s-check-loaded');}}catch(e){} })();`,
          }}
        />
        <ThemeProvider>
          {/* Particles background (client-only) - render after ThemeProvider mounts so theme class is available */}
          <ParticlesBackground />

          <AuthProvider>
            <div className="relative z-10">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

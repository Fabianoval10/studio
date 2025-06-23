import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '600'], // Light & Semi-Bold
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'VETLD',
  description: 'AI-powered veterinary report generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={montserrat.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

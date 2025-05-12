
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FarmDataProvider } from '@/hooks/useFarmData';
import { AutomationRulesProvider } from '@/contexts/AutomationRulesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'AgriView',
  description: 'Smart Agriculture Monitoring and Control',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        Ensure no whitespace (like newlines or spaces that can be interpreted as text nodes)
        exists directly between the <html> tag and the <body> tag.
        Next.js automatically handles the <head> element.
      */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable
        )}
      >
        <ThemeProvider>
            <SettingsProvider>
              <FarmDataProvider>
                <AutomationRulesProvider>
                  {children}
                </AutomationRulesProvider>
              </FarmDataProvider>
            </SettingsProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}


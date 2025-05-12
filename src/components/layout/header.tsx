
import { Leaf, Settings } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle'; 

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-lg">AgriView</span>
      </Link>
      
      <nav className="ml-auto flex items-center gap-2">
        <ThemeToggle /> 
        <Link href="/settings" passHref legacyBehavior>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
        {/* Future User menu can go here */}
      </nav>
    </header>
  );
}


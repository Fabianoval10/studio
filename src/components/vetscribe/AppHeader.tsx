
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={cn("bg-card border-b shadow-sm", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="bg-primary text-primary-foreground p-2 rounded-md">
             <PawPrint className="w-6 h-6" />
           </div>
           <h1 className="text-2xl font-headline text-primary font-bold">VETLD</h1>
        </div>
        <p className="font-sans italic text-muted-foreground">Laudos de Ultrassom Inteligentes</p>
      </div>
    </header>
  );
}

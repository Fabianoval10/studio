
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={cn("bg-card border-b shadow-sm", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
           <h1 className="text-2xl text-primary font-bold">Baddha Ultrassonografia</h1>
        </div>
        <p className="italic text-muted-foreground">Laudos de Ultrassom Inteligentes para meu amor</p>
      </div>
    </header>
  );
}

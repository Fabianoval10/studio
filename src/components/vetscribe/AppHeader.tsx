
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={cn("bg-accent text-accent-foreground shadow-md", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src="/baddha-logo.png" 
            alt="Baddha Ultrassonografia Logo" 
            width={180} 
            height={40} 
            data-ai-hint="baddha ultrasound logo" 
            className="rounded" 
            priority
          />
        </div>
        <p className="text-sm font-body italic text-accent-foreground/80">Ultrassonografia Veterinária</p>
      </div>
    </header>
  );
}

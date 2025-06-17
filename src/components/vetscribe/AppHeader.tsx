
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={cn("bg-primary text-primary-foreground shadow-md", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="https://placehold.co/150x50.png?text=VETLD&font=belleza" alt="VETLD Logo" width={150} height={50} data-ai-hint="logo health" className="rounded" />
        </div>
        <p className="text-sm font-body italic">Laudos Veterinários Ultrassom por Miriam Barp</p>
      </div>
    </header>
  );
}

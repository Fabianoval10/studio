import { Stethoscope } from 'lucide-react';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Placeholder for a more distinct logo icon if available */}
          {/* <Stethoscope size={36} className="text-accent" /> */}
          <Image src="https://placehold.co/150x50.png?text=VETLD&font=belleza" alt="VETscribe Logo" width={150} height={50} data-ai-hint="logo health" className="rounded" />
          {/* <h1 className="text-3xl font-headline">VETscribe</h1> */}
        </div>
        <p className="text-sm font-body italic">Laudos Veterinários Ultrassom por Miriam Barp</p>
      </div>
    </header>
  );
}

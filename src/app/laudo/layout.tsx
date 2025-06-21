import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pré-visualização do Laudo - Baddha Ultrassonografia',
  description: 'Pré-visualização do laudo de ultrassonografia veterinária.',
};

export default function LaudoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProtoFácil',
  description: 'Ferramenta de prototipagem acessível para todos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
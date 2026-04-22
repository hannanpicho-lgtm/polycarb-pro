import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @media print {
            @page { margin: 18mm 16mm; size: A4; }
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #1e293b; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

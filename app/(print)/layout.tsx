import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Standalone root layout for print documents — no navbar, no footer
export default function PrintRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          @media print {
            @page { margin: 18mm 16mm; size: A4; }
            .no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body {
            margin: 0;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            background: #fff;
            color: #1e293b;
            font-size: 14px;
            line-height: 1.5;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

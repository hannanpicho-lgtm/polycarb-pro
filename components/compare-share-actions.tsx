'use client';

import { useState } from 'react';
import { Check, Copy, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductSpec } from '@/lib/data';

interface CompareExportProduct {
  name: string;
  brand: string;
  grade: string;
  category: string;
  certifications: string[];
  industries: string[];
  features: string[];
  specifications: ProductSpec;
}

interface CompareShareActionsProps {
  comparePath: string;
  selectedCount: number;
  selectedNames: string[];
  selectedProducts: CompareExportProduct[];
  onlyDifferences: boolean;
}

function hasDifferences(values: string[]) {
  if (values.length <= 1) return false;
  return new Set(values.map((v) => v.trim().toLowerCase())).size > 1;
}

function escapeCsv(value: string) {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

export function CompareShareActions({
  comparePath,
  selectedCount,
  selectedNames,
  selectedProducts,
  onlyDifferences,
}: CompareShareActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const absoluteUrl = new URL(comparePath, window.location.origin).toString();
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function handleEmail() {
    const absoluteUrl = new URL(comparePath, window.location.origin).toString();
    const subject = `Polycarbonate grade comparison: ${selectedNames.join(' vs ')}`;
    const body = `Here is the comparison link for the selected grades:\n\n${absoluteUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handlePrint() {
    window.print();
  }

  function handleCsvExport() {
    const specMap: Record<keyof ProductSpec, string> = {
      density: 'Density',
      tensileStrength: 'Tensile Strength',
      flexuralModulus: 'Flexural Modulus',
      impactStrength: 'Impact Strength',
      heatDeflection: 'Heat Deflection Temp',
      lightTransmittance: 'Light Transmittance',
      flamabilityRating: 'Flammability Rating',
      thicknessRange: 'Thickness Range',
      dimensions: 'Sheet Dimensions',
      meltFlowIndex: 'Melt Flow Index',
    };

    const specRows = (Object.entries(specMap) as Array<[keyof ProductSpec, string]>)
      .map(([key, label]) => {
        const values = selectedProducts.map((p) => p.specifications[key] ?? '—');
        return {
          label,
          values,
          differs: hasDifferences(values),
        };
      })
      .filter((row) => (onlyDifferences ? row.differs : true));

    const metadataRows = [
      {
        label: 'Category',
        values: selectedProducts.map((p) => p.category),
      },
      {
        label: 'Certifications',
        values: selectedProducts.map((p) =>
          p.certifications.length > 0 ? p.certifications.join(' | ') : '—'
        ),
      },
      {
        label: 'Industries',
        values: selectedProducts.map((p) => p.industries.join(' | ')),
      },
      {
        label: 'Key Features',
        values: selectedProducts.map((p) => p.features.slice(0, 4).join(' | ')),
      },
    ].filter((row) => (onlyDifferences ? hasDifferences(row.values) : true));

    const rows = [...specRows, ...metadataRows];
    const header = ['Field', ...selectedProducts.map((p) => `${p.brand} ${p.grade}`)];
    const csvLines = [header, ...rows.map((row) => [row.label, ...row.values])].map((line) =>
      line.map((cell) => escapeCsv(cell)).join(',')
    );

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polycarb-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Comparing {selectedCount} grade{selectedCount !== 1 ? 's' : ''}. Share this exact setup with
        your team.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row print:hidden">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="w-full sm:w-auto"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1.5" />
          )}
          {copied ? 'Copied' : 'Copy Link'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleEmail}
          className="w-full sm:w-auto"
        >
          <Mail className="h-3.5 w-3.5 mr-1.5" />
          Email Link
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCsvExport}
          className="w-full sm:w-auto"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
          Export CSV
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handlePrint}
          className="w-full sm:w-auto"
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print / PDF
        </Button>
      </div>
    </div>
  );
}

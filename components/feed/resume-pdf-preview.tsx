'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { ResumePdfPreviewProps } from '@/types/resume';

// Keep this next to `Document` and `Page`: React-PDF can otherwise initialize
// its default worker after this setting and overwrite it.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function ResumePdfPreview({ pdfUrl, label }: ResumePdfPreviewProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex min-h-80 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        This preview is no longer available. Refresh the feed to request a new secure PDF link.
      </div>
    );
  }

  return (
    <Document
      file={pdfUrl}
      loading={
        <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
          Loading preview…
        </div>
      }
      error={null}
      onLoadError={() => setError(true)}
    >
      <Page
        pageNumber={1}
        width={640}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        aria-label={`First page of ${label}`}
        className="[&_canvas]:!h-auto [&_canvas]:!w-full"
      />
    </Document>
  );
}

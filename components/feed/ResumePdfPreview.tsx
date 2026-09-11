'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { ResumePdfPreviewProps } from '@/types/resume';

// Keep this next to `Document` and `Page`: React-PDF can otherwise initialize
// its default worker after this setting and overwrite it.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function ResumePdfPreview(props: ResumePdfPreviewProps) {
  return <PdfPreview key={props.pdfUrl} {...props} />;
}

function PdfPreview({ pdfUrl, label, detailHref }: ResumePdfPreviewProps) {
  const router = useRouter();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [error, setError] = useState(false);
  const [numPages, setNumPages] = useState<number>();

  function openDetails(event: React.MouseEvent<HTMLDivElement>) {
    if (!detailHref || event.defaultPrevented) return;
    if (event.target instanceof Element && event.target.closest('button')) return;

    const start = pointerStart.current;
    pointerStart.current = null;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;

    router.push(detailHref);
  }

  if (error) {
    return (
      <div className="flex min-h-80 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        This preview is no longer available. Refresh the feed to request a new secure PDF link.
      </div>
    );
  }

  const page = (pageNumber: number) => (
    <Page
      pageNumber={pageNumber}
      width={640}
      renderAnnotationLayer={false}
      renderTextLayer={false}
      aria-label={`Page ${pageNumber}${numPages ? ` of ${numPages}` : ''} of ${label}`}
      className="[&_canvas]:!h-auto [&_canvas]:!w-full"
    />
  );

  return (
    <div
      className={detailHref ? 'relative cursor-pointer' : 'relative'}
      role={detailHref ? 'link' : undefined}
      aria-label={detailHref ? `Open ${label} details` : undefined}
      tabIndex={detailHref ? 0 : undefined}
      onPointerDown={
        detailHref
          ? (event) => {
              pointerStart.current = { x: event.clientX, y: event.clientY };
            }
          : undefined
      }
      onClick={openDetails}
      onKeyDown={
        detailHref
          ? (event) => {
              if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
                return;
              }
              event.preventDefault();
              router.push(detailHref);
            }
          : undefined
      }
    >
      <Document
        file={pdfUrl}
        loading={
          <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
            Loading preview…
          </div>
        }
        error={null}
        onLoadError={() => setError(true)}
        onLoadSuccess={({ numPages: loadedPageCount }) => setNumPages(loadedPageCount)}
      >
        {numPages && numPages > 1 ? (
          <Carousel aria-label={`${label} pages`} opts={{ align: 'start' }}>
            <CarouselContent className="ml-0">
              {Array.from({ length: numPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <CarouselItem key={pageNumber} className="pl-0" aria-label={`Page ${pageNumber}`}>
                    {page(pageNumber)}
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious aria-label="Previous page" />
            <CarouselNext aria-label="Next page" />
          </Carousel>
        ) : (
          page(1)
        )}
      </Document>

    </div>
  );
}

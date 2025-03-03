"use client";

import * as pdfjsLib from "pdfjs-dist";

// Set the PDF.js worker source
// !NOTE: The CDN path should be updated according to the pdfjs version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs'

interface PDFViewerProps {
  pdfUrl?: string;
}

export function PDFViewer({
  pdfUrl,
}: PDFViewerProps) {

  return (
    <div>PDF Viewer</div>
  );
}

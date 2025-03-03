"use client";

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';
import { useRef, useState } from "react";

import { PDFField } from "@/lib/types";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface PDFViewerProps {
  // pdfUrl: string;
  editedFile: Blob | null;
  fields: PDFField[];
  selectedFieldId: string | null;
}

export default function PDFViewer({
  // pdfUrl,
  editedFile,
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1);
    }
  };

  const onDocumentLoaded = ({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    console.log('on load success')
    setTotalPages(nextNumPages);
    setCurrentPage(1);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            disabled={isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div 
        className="pdf-container flex-1 overflow-auto"
        onDragOver={(e) => e.preventDefault()}
        // onDrop={handleDrop}
      >
        {error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <div 
            className="relative pt-10"
            ref={containerRef}
          >
            { editedFile && (
              <Document
                file={editedFile}
                onLoadSuccess={onDocumentLoaded}
                className={'flex justify-center items-start h-screen overflow-auto'}
              >
                <Page
                  width={1000}
                  scale={scale}
                  pageNumber={currentPage}
                />
              </Document>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { Document, pdfjs } from "react-pdf"
import React, { useState, memo } from "react";

import FileUpload from "./FileUpload";
import { DocumentPage } from "./DocumentPage";

import { useEditorStore } from "@/store/useEditorStore";
import { useEditorKeyboardShortcuts } from "@/hooks/useEditorKeyboardShortcuts";

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

export const DocumentCanvas: React.FC = memo(() => {
  const [numPages, setNumPages] = useState<number>();

  // Use individual selectors for each value to avoid shallow comparison issues
  const pdfFile = useEditorStore((state) => state.pdfFile)
  const scale = useEditorStore((state) => state.scale);
  const selectField = useEditorStore((state) => state.selectField);

  // Initialize keyboard shortcuts
  useEditorKeyboardShortcuts();

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
  }

  // Render the document canvas
  return (
    <div
      className="relative h-full w-full overflow-auto bg-gray-100 p-8"
      onClick={() => selectField(null)}
    >
      {/* Document pages */}
      <div className="relative mx-auto flex flex-col items-center space-y-8">
        {/* No PDF message when no pages are available */}
        {pdfFile === null ? (
          <FileUpload />
        ) : (
          // Render pages when available
          <Document
            file={pdfFile}
            className={"flex flex-col w-full justify-center items-center gap-4 no-scrollbar"}
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (_el, index) => (
              <DocumentPage
                key={`page_${index + 1}`}
                pageIndex={index + 1}
                scale={scale}
              />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
});

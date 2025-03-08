import React, { memo, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { DocumentField } from "./DocumentField";
import { renderPage } from "@/lib/pdf-loader";
import { toast } from "sonner";

interface DocumentPageProps {
  pageIndex: number;
  width: number;
  height: number;
  scale: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => void;
  children?: React.ReactNode;
}

export const DocumentPage: React.FC<DocumentPageProps> = memo(
  ({ pageIndex, width, height, scale, onDrop, children }) => {
    // Canvas reference for PDF rendering
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    // Use a selector that returns a string key instead of an array
    // This is more stable and less likely to cause infinite loops
    const fieldIdsKey = useEditorStore((state) => {
      const ids = state.fields
        .filter((field) => field.position.pageIndex === pageIndex)
        .map((field) => field.id)
        .join(",");
      return ids;
    });

    // Parse the comma-separated string back into an array
    const pageFieldIds = fieldIdsKey ? fieldIdsKey.split(",") : [];

    // Render the PDF page when the component mounts or scale changes
    useEffect(() => {
      const renderPdfPage = async () => {
        if (!canvasRef.current) {
          console.error("Canvas ref is null");
          return;
        }

        if (!window._pdfDocument) {
          console.error("No PDF document loaded");
          setRenderError("No PDF document loaded");
          return;
        }

        try {
          setIsRendering(true);
          setRenderError(null);

          // Add 1 to pageIndex because PDF.js uses 1-indexed page numbers
          await renderPage(pageIndex + 1, canvasRef.current, scale);

          setIsRendering(false);
        } catch (error) {
          console.error(`Error rendering page ${pageIndex + 1}:`, error);
          setRenderError(`Failed to render page ${pageIndex + 1}`);
          setIsRendering(false);

          // Show toast only for the first page to avoid multiple toasts
          if (pageIndex === 0) {
            toast.error("Failed to render PDF page", {
              description:
                "There was an error rendering the PDF. Please try uploading again.",
            });
          }
        }
      };

      renderPdfPage();
    }, [pageIndex, scale]);

    return (
      <div
        className="document-page"
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          margin: "20px auto",
        }}
        onDrop={(e) => onDrop(e, pageIndex)}
        onDragOver={(e) => {
          e.preventDefault(); // Allow drop
        }}
        data-page-index={pageIndex}
      >
        {/* Canvas for PDF rendering */}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* Show loading or error state */}
        {(isRendering || renderError) && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 5,
            }}
          >
            {isRendering ? (
              <p>Rendering page {pageIndex + 1}...</p>
            ) : (
              <p className="text-red-500">{renderError}</p>
            )}
          </div>
        )}

        {/* Render fields using their IDs */}
        {pageFieldIds.length > 0 &&
          pageFieldIds.map((fieldId) => (
            <DocumentField key={fieldId} fieldId={fieldId} />
          ))}

        {/* Render any additional children */}
        {children}
      </div>
    );
  },
);

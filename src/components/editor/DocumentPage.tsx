import React, { memo } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { DocumentField } from "./DocumentField";
import { Page } from "react-pdf";

interface DocumentPageProps {
  pageIndex: number;
  scale: number;
  children?: React.ReactNode;
}

export const DocumentPage: React.FC<DocumentPageProps> = memo(({
  pageIndex,
  scale,
  children
}) => {

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

  return (
    <>
      <Page
        width={1000}
        pageNumber={pageIndex}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />

      {/* Render fields using their IDs */}
      {pageFieldIds.length > 0 &&
        pageFieldIds.map((fieldId) => (
          <DocumentField key={fieldId} fieldId={fieldId} />
        ))}

      {/* Render any additional children */}
      {children}
    </>
  );
},
);

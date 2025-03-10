import React, { memo, useRef } from "react";
import { Page } from "react-pdf";

import { DocumentField } from "./DocumentField";

import { useEditorStore } from "@/store/useEditorStore";
import { FieldPosition, FieldType } from "@/types/pdf-editor";

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
  const pageRef = useRef<HTMLDivElement>(null);

  const addField = useEditorStore((state) => state.addField);

  // Use a selector that returns a string key instead of an array
  // This is more stable and less likely to cause infinite loops
  const fieldIdsKey = useEditorStore((state) => {
    const ids = state.fields
      .filter((field) => field.position.pageIndex === pageIndex)
      .map((field) => field.id)
      .join(",");
    return ids;
  });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const fieldType = e.dataTransfer.getData("field-type") as FieldType;

    if (!fieldType || !pageRef.current) return

    // TODO: update to switch statement in case of covering all field types
    const newFieldSize =
      fieldType === "signature" || fieldType === "initials"
        ? { width: 200, height: 70 }
        : { width: 150, height: 40 };

    const pageRect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - pageRect.left - newFieldSize.width / 2;
    const y = e.clientY - pageRect.top - newFieldSize.height / 2;

    const newFieldPosition: FieldPosition = {
      x: Math.min(Math.max(x, 0), pageRect.right - pageRect.left - newFieldSize.width),
      y: Math.min(Math.max(y, 0), pageRect.bottom - pageRect.top - newFieldSize.height),
      pageIndex
    }

    addField(fieldType, newFieldPosition, newFieldSize)
  }

  // Parse the comma-separated string back into an array
  const pageFieldIds = fieldIdsKey ? fieldIdsKey.split(",") : [];

  return (
    <div
      ref={pageRef}
      className="relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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
    </div>
  );
});

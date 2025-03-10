import React, { memo, useMemo } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { FieldTypeIcon } from "./FieldTypeIcon";

interface DocumentFieldProps {
  fieldId: string;
}

export const DocumentField: React.FC<DocumentFieldProps> = memo(
  ({ fieldId }) => {
    // Use primitive selectors instead of object selectors
    const field = useEditorStore((state) =>
      state.fields.find((f) => f.id === fieldId),
    );

    const isSelected = useEditorStore(
      (state) => state.selectedFieldId === fieldId,
    );

    // Get recipient using a stable selector
    const recipient = useEditorStore((state) => {
      if (!field?.recipientId) return null;
      return state.recipients.find((r) => r.id === field.recipientId) || null;
    });

    // Fix: Use the correct API for shallow comparison
    const updateField = useEditorStore((state) => state.updateField);
    const selectField = useEditorStore((state) => state.selectField);
    const setDragging = useEditorStore((state) => state.setDragging);
    const setResizing = useEditorStore((state) => state.setResizing);

    // Get scale as a primitive value
    const scale = useEditorStore((state) => state.scale);

    // If field is not found, don't render anything
    if (!field) return null;
    
    return (
      <div
        className="field-container"
        style={{
          position: "absolute",
          left: `${field.position.x}px`,
          top: `${field.position.y}px`,
          width: `${field.size.width}px`,
          height: `${field.size.height}px`,
          backgroundColor: "transparent",
          border: isSelected
            ? `1px solid ${recipient.color}`
            : `2px dashed ${recipient.color}`,
          borderRadius: "4px",
          cursor: "move",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected
            ? `0 0 0 1px ${recipient.color}, 0 0 8px rgba(0, 0, 0, 0.1)`
            : "none",
          zIndex: isSelected ? 10 : 1,
          transition: "box-shadow 0.2s ease",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        data-field-id={fieldId}
        data-field-type={field.type}
      >
        <div
          className="field-content"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: "2px",
            pointerEvents: "none",
            padding: "4px",
          }}
        >
          <FieldTypeIcon type={field.type} />
          {field.label && (
            <span
              className="field-label"
              style={{ marginLeft: "4px", fontSize: "12px" }}
            >
              {field.label}
            </span>
          )}
        </div>

        {isSelected && (
          <div
            className="resize-handle"
            style={{
              position: "absolute",
              right: "-4px",
              bottom: "-4px",
              width: "8px",
              height: "8px",
              backgroundColor: recipient.color,
              cursor: "nwse-resize",
              borderRadius: "2px",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setResizing(true);
            }}
          />
        )}
      </div>
    );
  },
);

import React, { memo } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { FieldTypeIcon } from "./FieldTypeIcon";
import { Rnd } from "react-rnd";

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

    // Get scale as a primitive value
    const scale = useEditorStore((state) => state.scale);

    // If field is not found, don't render anything
    if (!field) return null;

    return (
      <Rnd
        onDragStop={(e, d) => {
          updateField({
            id: fieldId,
            position: {
              x: Math.round(d.x / scale),
              y: Math.round(d.y / scale),
              pageIndex: field.position.pageIndex
            }
          });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = Number.parseFloat(ref.style.width);
          const newHeight = Number.parseFloat(ref.style.height);
          
          // Update both position and size, accounting for scale
          updateField({
            id: fieldId,
            position: {
              x: Math.round(position.x / scale),
              y: Math.round(position.y / scale),
              pageIndex: field.position.pageIndex
            },
            size: {
              width: Math.round(newWidth / scale),
              height: Math.round(newHeight / scale)
            }
          });
        }}
        bounds="parent"
        position={{
          x: Math.round(field.position.x * scale),
          y: Math.round(field.position.y * scale),
        }}
        size={{
          width: Math.round(field.size.width * scale),
          height: Math.round(field.size.height * scale)
        }}
        default={{
          x: Math.round(field.position.x * scale),
          y: Math.round(field.position.y * scale),
          width: Math.round(field.size.width * scale),
          height: Math.round(field.size.height * scale)
        }}
        disableDragging={isSelected}
        style={{
          zIndex: 20,
          position: "absolute",
          backgroundColor: "transparent",
          border: isSelected
            ? `1px solid ${recipient.color}`
            : `2px dashed ${recipient.color}`,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected
            ? `0 0 0 1px ${recipient.color}, 0 0 8px rgba(0, 0, 0, 0.1)`
            : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <div
          className="w-full h-full"
          onDoubleClick={(e) => {
            e.stopPropagation();
            selectField(field.id)
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
        </div>
      </Rnd>
    )
  },
);

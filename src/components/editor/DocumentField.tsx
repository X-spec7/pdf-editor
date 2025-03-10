import type React from "react"
import { memo } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { useUserStore } from "@/store/useUserStore"
import { FieldTypeIcon } from "./FieldTypeIcon"
import { Rnd } from "react-rnd"
import { format } from "date-fns"

interface DocumentFieldProps {
  fieldId: string
}

export const DocumentField: React.FC<DocumentFieldProps> = memo(({ fieldId }) => {
  // Use primitive selectors instead of object selectors
  const field = useEditorStore((state) => state.fields.find((f) => f.id === fieldId))

  const isSelected = useEditorStore((state) => state.selectedFieldId === fieldId)

  // Get recipient using a stable selector
  const recipient = useEditorStore((state) => {
    if (!field?.recipientId) return null
    return state.recipients.find((r) => r.id === field.recipientId) || null
  })

  // Fix: Use the correct API for shallow comparison
  const updateField = useEditorStore((state) => state.updateField)
  const selectField = useEditorStore((state) => state.selectField)

  // Get scale as a primitive value
  const scale = useEditorStore((state) => state.scale)

  // Get user type
  const userType = useUserStore((state) => state.userType)

  // If field is not found, don't render anything
  if (!field || !recipient) return null

  // Common field content for both creator and signer with no value
  const renderDefaultFieldContent = () => (
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
        <span className="field-label" style={{ marginLeft: "4px", fontSize: "12px" }}>
          {field.label}
        </span>
      )}
    </div>
  )

  // Render field value based on field type
  const renderFieldValue = () => {
    if (!field.value) return renderDefaultFieldContent()

    switch (field.type) {
      case "text":
        return <div className="w-full h-full flex items-center px-2 text-sm">{field.value}</div>
      case "date":
        try {
          const date = new Date(field.value)
          return <div className="w-full h-full flex items-center px-2 text-sm">{format(date, "MMM d, yyyy")}</div>
        } catch (e) {
          return renderDefaultFieldContent()
        }
      case "signature":
      case "initials":
        if (field.value.startsWith("data:image")) {
          // Render image signature
          return (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={field.value || "/placeholder.svg"}
                alt={field.type === "signature" ? "Signature" : "Initials"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )
        } else {
          // Render text signature
          return (
            <div
              className="w-full h-full flex items-center justify-center text-lg"
              style={{ fontFamily: field.fontFamily || "cursive" }}
            >
              {field.value}
            </div>
          )
        }
      default:
        return renderDefaultFieldContent()
    }
  }

  // For creator mode, use Rnd for draggable/resizable fields
  if (userType === "creator") {
    return (
      <Rnd
        onDragStop={(e, d) => {
          updateField({
            id: fieldId,
            position: {
              x: Math.round(d.x / scale),
              y: Math.round(d.y / scale),
              pageIndex: field.position.pageIndex,
            },
          })
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = Number.parseFloat(ref.style.width)
          const newHeight = Number.parseFloat(ref.style.height)

          // Update both position and size, accounting for scale
          updateField({
            id: fieldId,
            position: {
              x: Math.round(position.x / scale),
              y: Math.round(position.y / scale),
              pageIndex: field.position.pageIndex,
            },
            size: {
              width: Math.round(newWidth / scale),
              height: Math.round(newHeight / scale),
            },
          })
        }}
        bounds="parent"
        position={{
          x: Math.round(field.position.x * scale),
          y: Math.round(field.position.y * scale),
        }}
        size={{
          width: Math.round(field.size.width * scale),
          height: Math.round(field.size.height * scale),
        }}
        default={{
          x: Math.round(field.position.x * scale),
          y: Math.round(field.position.y * scale),
          width: Math.round(field.size.width * scale),
          height: Math.round(field.size.height * scale),
        }}
        disableDragging={isSelected}
        style={{
          zIndex: 20,
          position: "absolute",
          backgroundColor: "transparent",
          border: isSelected ? `1px solid ${recipient.color}` : `2px dashed ${recipient.color}`,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected ? `0 0 0 1px ${recipient.color}, 0 0 8px rgba(0, 0, 0, 0.1)` : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <div
          className="w-full h-full"
          onDoubleClick={(e) => {
            e.stopPropagation()
            selectField(field.id)
          }}
          data-field-id={fieldId}
          data-field-type={field.type}
        >
          {renderDefaultFieldContent()}
        </div>
      </Rnd>
    )
  }

  // For signer mode, use a static div (no dragging/resizing)
  return (
    <div
      style={{
        zIndex: 20,
        position: "absolute",
        left: Math.round(field.position.x * scale),
        top: Math.round(field.position.y * scale),
        width: Math.round(field.size.width * scale),
        height: Math.round(field.size.height * scale),
        backgroundColor: "transparent",
        border: isSelected
          ? `2px solid ${recipient.color}`
          : field.value
            ? `1px solid ${recipient.color}`
            : `2px dashed ${recipient.color}`,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected ? `0 0 0 1px ${recipient.color}, 0 0 8px rgba(0, 0, 0, 0.1)` : "none",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectField(field.id)
      }}
      data-field-id={fieldId}
      data-field-type={field.type}
    >
      {renderFieldValue()}
    </div>
  )
})


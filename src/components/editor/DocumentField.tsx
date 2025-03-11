import type React from "react"
import { memo } from "react"
import { Rnd } from "react-rnd"

import { useEditorStore } from "@/store/useEditorStore"
import { useUserStore } from "@/store/useUserStore"
import { FieldTypeIcon } from "./FieldTypeIcon"

interface DocumentFieldProps {
  fieldId: string
}

export const DocumentField: React.FC<DocumentFieldProps> = memo(({ fieldId }) => {
  // Use primitive selectors instead of object selectors
  const field = useEditorStore((state) => state.fields.find((f) => f.id === fieldId))

  const isSelected = useEditorStore((state) => state.selectedFieldId === fieldId)

  // Get user type to determine rendering mode
  const userType = useUserStore((state) => state.userType)

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

  // If field is not found, don't render anything
  if (!field || !recipient) return null

  // Render field content based on field type and value
  const renderFieldContent = () => {
    if (!field.value || userType === "creator") {
      // Default content when no value is present
      return (
        <div className="flex items-center justify-center w-full h-full bg-white/50 rounded-sm pointer-events-none p-1">
          <FieldTypeIcon type={field.type} />
          {field.label && (
            <span className="" style={{ marginLeft: "4px", fontSize: "12px" }}>
              {field.label}
            </span>
          )}
        </div>
      )
    }

    // Render content based on field type when value is present
    switch (field.type) {
      case "text":
        return (
          <div className="flex items-center w-full h-full rounded-sm p-1 bg-white/70 overflow-hidden text-ellipsis">
            <span style={{ fontSize: "14px" }}>{field.value}</span>
          </div>
        )
      case "date":
        return (
          <div className="flex items-center w-full h-full rounded-sm p-1 bg-white/70">
            <span style={{ fontSize: "14px" }}>{new Date(field.value).toLocaleDateString()}</span>
          </div>
        )
      case "signature":
      case "initials":
        if (field.value.startsWith("data:image")) {
          // Render image signature
          return (
            <div className="flex justify-start items-center w-full h-full bg-white/70 rounded-sm p-1">
              <img
                src={field.value || "/placeholder.svg"}
                alt={field.type === "signature" ? "Signature" : "Initials"}
                className="h-full object-contain"
              />
            </div>
          )
        } else {
          // Render text signature
          return (
            <div className="flex items-center justify-start text-black/70 w-full h-full rounded-sm p-1">
              <span className={`${field.type === "signature" ? 'text-lg' : 'text-base'}`}
                style={{
                  fontFamily: field.fontFamily || "cursive",
                }}
              >
                {field.value}
              </span>
            </div>
          )
        }
      default:
        return (
          <div className="flex items-center justify-start text-black/50 w-full h-full rounded-sm p-1">
            <FieldTypeIcon type={field.type} />
            {field.label && (
              <span className="ml-1 text-xs">
                {field.label}
              </span>
            )}
          </div>
        )
    }
  }

  // For signer mode, render a non-draggable field
  if (userType === "signer") {
    return (
      <div
        className="absolute z-20 rounded-sm bg-transparent"
        style={{
          left: Math.round(field.position.x * scale),
          top: Math.round(field.position.y * scale),
          width: Math.round(field.size.width * scale),
          height: Math.round(field.size.height * scale),
          border: isSelected ? `1px solid ${recipient.color}` : `2px dashed ${recipient.color}`,
          boxShadow: isSelected ? `0 0 0 1px ${recipient.color}, 0 0 8px rgba(0, 0, 0, 0.1)` : "none",
          transition: "box-shadow 0.2s ease",
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectField(field.id)
        }}
        data-field-id={fieldId}
        data-field-type={field.type}
      >
        {renderFieldContent()}
      </div>
    )
  }

  // For creator mode, render a draggable field with Rnd
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
        {renderFieldContent()}
      </div>
    </Rnd>
  )
})


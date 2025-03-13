import type React from "react"
import { X } from "lucide-react"

import { useEditorStore } from "@/store/useEditorStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { FieldEditorWrapper } from "./field-editor/FieldEditorWrapper"

export const FieldValueEditor: React.FC = () => {
  const selectedFieldId = useEditorStore((state) => state.selectedFieldId)
  const fields = useEditorStore((state) => state.fields)
  const selectField = useEditorStore((state) => state.selectField)

  const selectedField = fields.find((field) => field.id === selectedFieldId)

  if (!selectedField || selectedField.type === "text") {
    return null
  }

  const handleClose = () => {
    selectField(null)
  }

  // Get field type name for display
  const getFieldTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      text: "Text Field",
      signature: "Signature",
      date: "Date",
      initials: "Initials",
      checkbox: "Checkbox",
      radio: "Radio Button",
      dropdown: "Dropdown",
      card: "Card",
      file: "File Upload",
      stamp: "Stamp",
    }
    return typeMap[type] || type
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 z-50 w-80 rounded-lg border bg-white p-4 shadow-lg",
        "transition-all duration-200 ease-out -translate-x-1/2 -translate-y-1/2",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">{selectedField.label || getFieldTypeName(selectedField.type)}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <FieldEditorWrapper field={selectedField} onClose={handleClose} />
    </div>
  )
}


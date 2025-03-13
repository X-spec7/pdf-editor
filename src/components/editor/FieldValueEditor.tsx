import type React from "react"
import { useEffect, useState } from "react"

import { useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { FieldEditorWrapper } from "./field-editor/FieldEditorWrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export const FieldValueEditor: React.FC = () => {
  const selectedFieldId = useEditorStore((state) => state.selectedFieldId)
  const fields = useEditorStore((state) => state.fields)
  const selectField = useEditorStore((state) => state.selectField)
  const [open, setOpen] = useState(false)

  const selectedField = fields.find((field) => field.id === selectedFieldId)

  // Control dialog open state based on selectedFieldId
  useEffect(() => {
    if (selectedField && selectedField.type !== "text") {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [selectedField])

  const handleClose = () => {
    setOpen(false)
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

  // Don't render anything if no field is selected or it's a text field
  if (!selectedField || selectedField.type === "text") {
    return null
  }

  // Handler to prevent dialog from closing when clicking inside
  const preventClose = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-[500px] p-0 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
        )}
        onInteractOutside={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={preventClose}
        // Remove the default close button
        closeButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-2" onClick={preventClose}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{selectedField.label || getFieldTypeName(selectedField.type)}</DialogTitle>
            {/* Add custom close button */}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6" onClick={preventClose}>
          <FieldEditorWrapper field={selectedField} onClose={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}


import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Field } from "@/types/pdf-editor"
import { useEditorStore } from "@/store/useEditorStore"
import { toast } from "sonner"

interface TextFieldEditorProps {
  field: Field
  onClose: () => void
}

export const TextFieldEditor: React.FC<TextFieldEditorProps> = ({ field, onClose }) => {
  const updateField = useEditorStore((state) => state.updateField)
  const [value, setValue] = useState<string>(field.value || "")

  const handleSave = () => {
    updateField({
      id: field.id,
      value,
    })
    toast.success("Text field updated")
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-field-input">{field.label || "Enter text"}</Label>
        <Input
          id="text-field-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your text"
          autoFocus
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}


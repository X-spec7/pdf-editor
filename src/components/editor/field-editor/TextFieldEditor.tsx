import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Field } from "@/types/pdf-editor"
import { useEditorStore } from "@/store/useEditorStore"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

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

  const handleDelete = () => {
    updateField({
      id: field.id,
      value: undefined,
    })
    toast.success("Text field cleared")
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-field-input">{field.label || "Enter text"}</Label>
        <Textarea
          id="text-field-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your text"
          className="min-h-[100px] resize-none"
          autoFocus
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
          disabled={!field.value}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}


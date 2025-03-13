import type React from "react"
import type { Field } from "@/types/pdf-editor"

import { TextFieldEditor } from "./TextFieldEditor"
import { DateFieldEditor } from "./DateFieldEditor"
import { SignatureFieldEditor } from "./SignatureFieldEditor"

interface FieldEditorWrapperProps {
  field: Field
  onClose: () => void
}

export const FieldEditorWrapper: React.FC<FieldEditorWrapperProps> = ({ field, onClose }) => {
  // Render the appropriate editor based on field type
  switch (field.type) {
    case "text":
      return <TextFieldEditor field={field} onClose={onClose} />
    case "date":
      return <DateFieldEditor field={field} onClose={onClose} />
    case "signature":
    case "initials":
      return <SignatureFieldEditor field={field} onClose={onClose} />
    default:
      return (
        <div className="p-4 text-center">
          <p>Editor not available for this field type.</p>
          <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Close
          </button>
        </div>
      )
  }
}


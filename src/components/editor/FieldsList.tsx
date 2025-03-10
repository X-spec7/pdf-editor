import type React from "react"
import { Pen } from "lucide-react"

import { FieldTypeIcon } from "./FieldTypeIcon"
import { useEditorStore } from "@/store/useEditorStore"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export const FieldsList: React.FC = () => {
  const fields = useEditorStore((state) => state.fields)
  const recipients = useEditorStore((state) => state.recipients)
  const selectField = useEditorStore((state) => state.selectField)

  // Group fields by page
  const fieldsByPage = fields.reduce(
    (acc, field) => {
      const pageIndex = field.position.pageIndex
      if (!acc[pageIndex]) {
        acc[pageIndex] = []
      }
      acc[pageIndex].push(field)
      return acc
    },
    {} as Record<number, typeof fields>,
  )

  // Get recipient by ID
  const getRecipientName = (recipientId: string) => {
    const recipient = recipients.find((r) => r.id === recipientId)
    return recipient ? recipient.name : "Unknown"
  }

  // Get recipient color by ID
  const getRecipientColor = (recipientId: string) => {
    const recipient = recipients.find((r) => r.id === recipientId)
    return recipient ? recipient.color : "#ccc"
  }

  // Get field type name
  const getFieldTypeName = (type: string) => {
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

  if (fields.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Pen className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No fields to sign</h3>
        <p className="text-sm text-gray-500">There are no fields in this document that require your attention.</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Fields to Complete</h2>
        <p className="text-sm text-gray-500">Click on a field to navigate to it</p>
      </div>

      <ScrollArea className="h-[calc(100%-65px)]">
        <div className="p-4">
          {Object.keys(fieldsByPage)
            .map(Number)
            .sort((a, b) => a - b)
            .map((pageIndex) => (
              <div key={pageIndex} className="mb-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">Page {pageIndex + 1}</h3>
                <div className="space-y-2">
                  {fieldsByPage[pageIndex].map((field) => (
                    <div
                      key={field.id}
                      className="group flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 hover:border-primary/40 hover:bg-gray-50"
                    >
                      <div className="flex flex-1 cursor-pointer items-center" onClick={() => selectField(field.id)}>
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                          <FieldTypeIcon type={field.type} />
                        </div>
                        <div>
                          <div className="font-medium">{field.label || getFieldTypeName(field.type)}</div>
                          <div className="flex items-center text-xs text-gray-500">
                            <div
                              className="mr-1.5 h-2 w-2 rounded-full"
                              style={{ backgroundColor: getRecipientColor(field.recipientId) }}
                            ></div>
                            {getRecipientName(field.recipientId)}
                            {field.required && (
                              <Badge variant="outline" className="ml-2 border-red-200 bg-red-50 text-red-700">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}


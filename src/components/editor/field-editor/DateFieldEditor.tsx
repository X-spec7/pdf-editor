import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Field } from "@/types/pdf-editor"
import { useEditorStore } from "@/store/useEditorStore"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateFieldEditorProps {
  field: Field
  onClose: () => void
}

export const DateFieldEditor: React.FC<DateFieldEditorProps> = ({ field, onClose }) => {
  const updateField = useEditorStore((state) => state.updateField)
  const [date, setDate] = useState<Date | undefined>(field.value ? new Date(field.value) : undefined)

  const handleSave = () => {
    if (!date) {
      toast.error("Please select a date")
      return
    }

    updateField({
      id: field.id,
      value: date.toISOString(),
    })
    toast.success("Date field updated")
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{field.label || "Select date"}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Select a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!date}>
          Save
        </Button>
      </div>
    </div>
  )
}


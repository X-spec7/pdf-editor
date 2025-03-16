

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Trash2, Bold, Italic, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Field } from "@/types/pdf-editor"
import { useEditorStore } from "@/store/useEditorStore"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TextFieldEditorProps {
  field: Field
  onClose: () => void
}

export const TextFieldEditor: React.FC<TextFieldEditorProps> = ({ field, onClose }) => {
  const updateField = useEditorStore((state) => state.updateField)
  const [value, setValue] = useState<string>(field.value || "")

  // Font families
  const fontFamilies = [
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Courier New", value: "Courier New, monospace" },
    { name: "Helvetica", value: "Helvetica, sans-serif" },
  ]

  // Font sizes
  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32]

  // Font colors
  const fontColors = [
    { name: "Black", value: "#000000" },
    { name: "Dark Gray", value: "#444444" },
    { name: "Gray", value: "#888888" },
    { name: "Blue", value: "#0066cc" },
    { name: "Red", value: "#cc0000" },
    { name: "Green", value: "#00cc00" },
    { name: "Purple", value: "#6600cc" },
  ]

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

  // Update font family
  const handleFontFamilyChange = (fontFamily: string) => {
    updateField({
      id: field.id,
      fontFamily,
    })
  }

  // Update font size
  const handleFontSizeChange = (fontSize: number) => {
    updateField({
      id: field.id,
      fontSize,
    })
  }

  // Update font color
  const handleFontColorChange = (fontColor: string) => {
    updateField({
      id: field.id,
      fontColor,
    })
  }

  // Toggle bold
  const toggleBold = () => {
    updateField({
      id: field.id,
      fontWeight: field.fontWeight === "bold" ? "normal" : "bold",
    })
  }

  // Toggle italic
  const toggleItalic = () => {
    updateField({
      id: field.id,
      fontStyle: field.fontStyle === "italic" ? "normal" : "italic",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-field-input">{field.label || "Enter text"}</Label>
        <div className="flex items-center gap-1 mb-2 p-1 border rounded-md bg-gray-50">
          {/* Font Family */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                {fontFamilies.find((f) => f.value === field.fontFamily)?.name || "Font"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {fontFamilies.map((font) => (
                <DropdownMenuItem
                  key={font.value}
                  onClick={() => handleFontFamilyChange(font.value)}
                  style={{ fontFamily: font.value }}
                  className="text-sm"
                >
                  {font.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Font Size */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                {field.fontSize || "Size"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-20">
              {fontSizes.map((size) => (
                <DropdownMenuItem key={size} onClick={() => handleFontSizeChange(size)} className="text-sm">
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Font Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: field.fontColor || "#000000" }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="grid grid-cols-4 gap-1">
                {fontColors.map((color) => (
                  <div
                    key={color.value}
                    className="w-8 h-8 rounded-sm cursor-pointer border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleFontColorChange(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Bold */}
          <Button
            variant={field.fontWeight === "bold" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleBold}
          >
            <Bold className="h-4 w-4" />
          </Button>

          {/* Italic */}
          <Button
            variant={field.fontStyle === "italic" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleItalic}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          id="text-field-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your text"
          className="min-h-[100px] resize-none"
          style={{
            fontFamily: field.fontFamily || "inherit",
            fontSize: field.fontSize ? `${field.fontSize}px` : "inherit",
            color: field.fontColor || "inherit",
            fontWeight: field.fontWeight || "inherit",
            fontStyle: field.fontStyle || "inherit",
          }}
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


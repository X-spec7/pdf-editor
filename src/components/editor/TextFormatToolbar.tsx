import type React from "react"
import { Bold, Italic, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/store/useEditorStore"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface TextFormatToolbarProps {
  fieldId: string
  onClose: () => void
}

export const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({ fieldId, onClose }) => {
  const field = useEditorStore((state) => state.fields.find((f) => f.id === fieldId))
  const updateField = useEditorStore((state) => state.updateField)

  if (!field) return null

  // Font families
  const fontFamilies = [
    { name: "Default", value: "inherit" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Courier New", value: "Courier New, monospace" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
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

  // Update font family
  const handleFontFamilyChange = (fontFamily: string) => {
    updateField({
      id: fieldId,
      fontFamily,
    })
  }

  // Update font size
  const handleFontSizeChange = (fontSize: number) => {
    updateField({
      id: fieldId,
      fontSize,
    })
  }

  // Update font color
  const handleFontColorChange = (fontColor: string) => {
    updateField({
      id: fieldId,
      fontColor,
    })
  }

  // Toggle bold
  const toggleBold = () => {
    updateField({
      id: fieldId,
      fontWeight: field.fontWeight === "bold" ? "normal" : "bold",
    })
  }

  // Toggle italic
  const toggleItalic = () => {
    updateField({
      id: fieldId,
      fontStyle: field.fontStyle === "italic" ? "normal" : "italic",
    })
  }

  return (
    <div className="absolute -top-10 left-0 z-30 flex items-center gap-1 bg-white rounded-md shadow-md p-1 border">
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

      {/* Close */}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}


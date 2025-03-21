import type React from "react"
import { toast } from "sonner"
import { useRef, useState, useEffect } from "react"
import { Eraser, Trash2, Undo } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"

import { handwritingFonts } from "@/fonts"
import { Button } from "@/components/ui/button"
import type { Field } from "@/types/pdf-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useEditorStore } from "@/store/useEditorStore"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface SignatureFieldEditorProps {
  field: Field
  onClose: () => void
}

export const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({ field, onClose }) => {
  const updateField = useEditorStore((state) => state.updateField)
  const [activeTab, setActiveTab] = useState<string>("type")
  const [inputValue, setInputValue] = useState(field.value && !field.value.startsWith("data:image") ? field.value : "")
  const [selectedFont, setSelectedFont] = useState(field.fontFamily || handwritingFonts[0].fontFamily)

  const sigCanvas = useRef<SignatureCanvas>(null)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialize canvas with existing signature if available
  useEffect(() => {
    if (activeTab === "draw" && field.value && field.value.startsWith("data:image")) {
      loadExistingSignature()
    }
  }, [activeTab, field.value])

  const loadExistingSignature = () => {
    if (field.value && field.value.startsWith("data:image") && sigCanvas.current) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = sigCanvas.current
        if (canvas) {
          canvas.clear()
          const ctx = canvas.getCanvas().getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.getCanvas().width, canvas.getCanvas().height)
            setHasSignature(true)
          }
        }
      }
      img.src = field.value
    }
  }

  // Clear the signature canvas
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setHasSignature(false)
    }
  }

  // Undo the last stroke
  const undoSignature = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.toData()
      if (data.length > 0) {
        data.pop() // Remove the last stroke
        sigCanvas.current.fromData(data)
        setHasSignature(data.length > 0)
      }
    }
  }

  const handleSave = () => {
    let value = ""
    let fontFamily = undefined

    if (activeTab === "type") {
      // Save typed signature with font info
      value = inputValue
      fontFamily = selectedFont
    } else {
      // Save drawn signature as data URL
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        value = sigCanvas.current.toDataURL("image/png", { backgroundColor: "transparent" })
      }
    }

    updateField({
      id: field.id,
      value,
      fontFamily,
    })

    toast.success(`${field.type === "signature" ? "Signature" : "Initials"} updated`)
    onClose()
  }

  const handleDelete = () => {
    updateField({
      id: field.id,
      value: undefined,
      fontFamily: undefined,
    })
    toast.success(`${field.type === "signature" ? "Signature" : "Initials"} cleared`)
    onClose()
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="type" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature-font">Select Font Style</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger id="signature-font">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {handwritingFonts.map((font) => (
                    <SelectItem key={font.variable} value={font.fontFamily} style={{ fontFamily: font.fontFamily }}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature-input">Type your {field.type === "signature" ? "signature" : "initials"}</Label>
              <Input
                id="signature-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={field.type === "signature" ? "Your signature" : "Your initials"}
                style={{ fontFamily: selectedFont }}
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="border rounded-md p-4 min-h-[100px] flex items-center justify-center">
              {inputValue ? (
                <p className="text-3xl" style={{ fontFamily: selectedFont }}>
                  {inputValue}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Your {field.type === "signature" ? "signature" : "initials"} will appear here
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="draw" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Draw your {field.type === "signature" ? "signature" : "initials"}</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={undoSignature}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={clearSignature}>
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-md bg-transparent">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-[150px] cursor-crosshair",
                  style: {
                    width: "100%",
                    height: "150px",
                    backgroundColor: "transparent",
                  },
                }}
                backgroundColor="transparent"
                penColor="black"
                onBegin={() => setHasSignature(true)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {field.type === "signature" ? "Signature" : "Initials"} will have a transparent background
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between space-x-2 pt-2">
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
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={activeTab === "draw" ? !hasSignature : !inputValue}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eraser, Undo } from "lucide-react"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (value: string) => void
  initialValue?: string
}

export function SignatureModal({ isOpen, onClose, onSave, initialValue }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<string>("input")
  const [inputValue, setInputValue] = useState(
    initialValue && !initialValue.startsWith("data:image") ? initialValue : "",
  )

  const sigCanvas = useRef<SignatureCanvas>(null)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialize canvas with existing signature if available
  const loadExistingSignature = () => {
    if (initialValue && initialValue.startsWith("data:image") && sigCanvas.current) {
      const img = new Image()
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
      img.src = initialValue
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

  // Handle save button click
  const handleSave = () => {
    if (activeTab === "input") {
      onSave(inputValue)
    } else {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const dataURL = sigCanvas.current.toDataURL("image/png")
        onSave(dataURL)
      } else {
        onSave("")
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="input" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Type</TabsTrigger>
            <TabsTrigger value="draw" onClick={loadExistingSignature}>
              Draw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature-input">Type your signature</Label>
                <Input
                  id="signature-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Your signature"
                  className="font-handwriting text-lg"
                />
              </div>

              <div className="border rounded-md p-4 min-h-[100px] flex items-center justify-center">
                {inputValue ? (
                  <p className="font-handwriting text-xl">{inputValue}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Your signature will appear here</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Draw your signature</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={undoSignature}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={clearSignature}>
                    <Eraser className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-md bg-white">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: "w-full h-[150px] cursor-crosshair",
                    style: { width: "100%", height: "150px" },
                  }}
                  backgroundColor="white"
                  penColor="black"
                  onBegin={() => setHasSignature(true)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={activeTab === "draw" && !hasSignature}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


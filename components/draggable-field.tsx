  "use client"

  import React, { useState, useEffect, useRef } from "react"
  import { X } from "lucide-react"
  import { Input } from "@/components/ui/input"
  import type { PDFField } from "@/lib/types"
  import { format } from "date-fns"
  import { SignatureModal } from "./signature-modal"
  import Image from "next/image"
  import { Rnd } from "react-rnd"

  interface DraggableFieldProps {
    field: PDFField
    isSelected: boolean
    onSelect: () => void
    onMove: (id: string, x: number, y: number) => void
    onResize: (id: string, width: number, height: number) => void
    onDelete: (id: string) => void
    onValueChange: (id: string, value: string) => void
  }

  export function DraggableField({
    field,
    isSelected,
    onSelect,
    onMove,
    onResize,
    onDelete,
    onValueChange,
  }: DraggableFieldProps) {
    const [size, setSize] = useState({ width: field.width, height: field.height })
    const [position, setPosition] = useState({ x: field.x, y: field.y })
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

    const fieldContainerRef = useRef<HTMLDivElement>(null)

    // Update local state when field props change
    useEffect(() => {
      setSize({ width: field.width, height: field.height })
      setPosition({ x: field.x, y: field.y })
    }, [field.width, field.height, field.x, field.y])

    const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()

      console.log('is selected: ', isSelected)

      if (field.type === "signature" && isSelected) {
        setIsSignatureModalOpen(true)
      }
    }

    const handleSignatureSave = (value: string) => {
      onValueChange(field.id, value)
    }

    const onMouseDown = () => {
      console.log('is selected: ', isSelected)
      onSelect()
    }

    const renderFieldContent = () => {
      switch (field.type) {
        case "text":
          return (
            <Input
              value={field.value}
              onChange={(e) => onValueChange(field.id, e.target.value)}
              placeholder="Text field"
              className="w-full h-full border-none focus:border-none focus:ring-0 focus-visible:ring-0 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        case "signature":
          return (
            <div
              className="w-full h-full flex items-center justify-center border border-dashed border-primary/50 text-sm text-muted-foreground cursor-pointer bg-transparent"
              onClick={handleFieldClick}
            >
              {field.value ? (
                field.value.startsWith("data:image") ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={field.value || "/placeholder.svg"}
                      alt="Signature"
                      width={field.width}
                      height={field.height}
                      className="max-h-full max-w-full object-contain"
                      unoptimized
                      style={{ backgroundColor: "transparent" }}
                    />
                  </div>
                ) : (
                  <span className="font-handwriting text-lg">{field.value}</span>
                )
              ) : (
                "Click to add signature"
              )}
            </div>
          )
        case "date":
          return (
            <Input
              value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
              onChange={(e) => onValueChange(field.id, e.target.value)}
              type="date"
              className="w-full h-full border-none focus:border-none focus:ring-0 focus-visible:ring-0 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        default:
          return null
      }
    }

    return (
      <>
        <Rnd
          position={{ x: position.x, y: position.y }}
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y })
            onMove(field.id, d.x, d.y)
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            if (!fieldContainerRef.current) return
            const newWidth = Number.parseInt(fieldContainerRef.current.style.width)
            const newHeight = Number.parseInt(fieldContainerRef.current.style.height)
            setSize({ width: newWidth, height: newHeight })
            setPosition(position)
            onResize(field.id, newWidth, newHeight)
            onMove(field.id, position.x, position.y)
          }}
          className={`relative flex items-start justify-center min-w-[100px] min-h-[40px] z-10 rounded-md overflow-visible border border-dashed border-gray-400
            ${isSelected ? "bg-white/80" : ""}`}
          bounds="parent"
          default={{
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
          }}
          disableDragging={false}
        >
          <div className="relative w-full h-full" ref={fieldContainerRef}>
            {renderFieldContent()}

            {isSelected && (
              <button
                className="absolute -top-1 -right-1 text-destructive-foreground rounded-full p-1 bg-gray-300 shadow-sm z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(field.id)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {!isSelected && (
              <div
                className="absolute top-0 left-0 right-0 bottom-0 cursor-pointer border-dashed border-gray-400 z-20"
                onMouseUp={onSelect}
              />
            )}
          </div>
        </Rnd>

        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSave={handleSignatureSave}
          initialValue={field.value}
        />
      </>
    )
  }


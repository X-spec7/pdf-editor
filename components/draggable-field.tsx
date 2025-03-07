"use client"

import { X } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { Rnd } from "react-rnd"
import type React from "react"
import { useState, useEffect, useRef } from "react"

import { Input } from "@/components/ui/input"
import type { PDFField } from "@/lib/types"
import { SignatureModal } from "./signature-modal"

interface DraggableFieldProps {
  field: PDFField
  isSelected: boolean
  onSelect: () => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
  onDelete: (id: string) => void
  onValueChange: (id: string, value: string, fontFamily?: string) => void
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

    if (field.type === "signature" && isSelected) {
      setIsSignatureModalOpen(true)
    }
  }

  const handleSignatureSave = (value: string, fontFamily?: string) => {
    onValueChange(field.id, value, fontFamily)
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
            className={`w-full h-full flex items-center border border-dashed border-primary/50 text-sm text-muted-foreground cursor-pointer bg-transparent ${
              field.value ? 'justify-start' : 'justify-center'
            }`}
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
                    className="max-h-full max-w-full object-contain bg-transparent"
                    unoptimized
                  />
                </div>
              ) : (
                <span style={{ fontFamily: field.fontFamily }} className="text-lg">
                  {field.value}
                </span>
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

          const newWidth = Number.parseInt(ref.style.width)
          const newHeight = Number.parseInt(ref.style.height)

          setSize({ width: newWidth, height: newHeight })
          setPosition(position)
          onResize(field.id, newWidth, newHeight)
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
        disableDragging={isSelected}
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
        initialFont={field.fontFamily}
      />
    </>
  )
}


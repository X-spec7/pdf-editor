"use client"

import type React from "react"
import { X } from "lucide-react"
import { format } from "date-fns"
import { useRef, useState, useEffect, useCallback } from "react"

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
  const fieldRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: field.width, height: field.height })
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

  // Set initial position and size
  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.style.left = `${field.x}px`
      fieldRef.current.style.top = `${field.y}px`
      fieldRef.current.style.width = `${field.width}px`
      fieldRef.current.style.height = `${field.height}px`
    }
  }, [field.x, field.y, field.width, field.height])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fieldRef.current) return

    e.stopPropagation()

    // Don't start dragging if we're clicking on an input
    if ((e.target as HTMLElement).tagName === "INPUT") return

    setIsDragging(true)

    const rect = fieldRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !fieldRef.current) return

      if (isSelected) {
        const parentRect = fieldRef.current.parentElement?.getBoundingClientRect()
        if (!parentRect) return

        let newWidth = e.clientX - fieldRef.current.getBoundingClientRect().left
        let newHeight = e.clientY - fieldRef.current.getBoundingClientRect().top

        newWidth = Math.max(50, Math.min(newWidth, parentRect.width - field.x))
        newHeight = Math.max(30, Math.min(newHeight, parentRect.height - field.y))

        onResize(field.id, newWidth, newHeight)
      } else {
        const parentRect = fieldRef.current.parentElement?.getBoundingClientRect()
        if (!parentRect) return

        const fieldRect = fieldRef.current.getBoundingClientRect()

        const parentWidth = parentRect.width
        const parentHeight = parentRect.height

        const fieldWidth = fieldRect.width
        const fieldHeight = fieldRect.height

        let x = e.clientX - parentRect.left - dragOffset.x
        let y = e.clientY - parentRect.top - dragOffset.y

        x = Math.max(0, Math.min(x, parentWidth - fieldWidth))
        y = Math.max(0, Math.min(y, parentHeight - fieldHeight))

        // Update position
        fieldRef.current.style.left = `${x}px`
        fieldRef.current.style.top = `${y}px`

        onMove(field.id, x, y)
      }
    },
    [isDragging, isSelected, dragOffset, onMove, field.id, onResize, field.x, field.y],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleFieldClick = () => {
    if (field.type === "signature") {
      setIsSignatureModalOpen(true)
    }
  }

  const handleSignatureSave = (value: string) => {
    onValueChange(field.id, value)
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
          />
        )
      case "signature":
        return (
          <div
            className="w-full h-full flex items-center justify-center border border-dashed border-primary/50 text-sm text-muted-foreground cursor-pointer"
            onClick={handleFieldClick}
          >
            {field.value ? (
              field.value.startsWith("data:image") ? (
                <img
                  src={field.value || "/placeholder.svg"}
                  alt="Signature"
                  className="max-h-full max-w-full object-contain"
                />
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
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <div
        ref={fieldRef}
        className={`absolute flex items-start justify-center min-w-[100px] min-h-[40px] z-10 rounded-md overflow-hidden border border-dashed border-gray-400
          ${isSelected ? "resize bg-white/80" : "resize-none"}`}
        onClick={(e) => {
          e.stopPropagation()
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={onSelect}
      >
        {renderFieldContent()}

        {isSelected && (
          <button
            className="absolute top-0 right-0 text-destructive-foreground rounded-bl-md p-1"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(field.id)
            }}
          >
            <X className="h-3 w-3 rounded-full bg-gray-400" />
          </button>
        )}

        {!isSelected && (
          <div
            className="absolute w-full h-full cursor-pointer border-dashed border-gray-400 z-20"
            onMouseUp={onSelect}
          />
        )}
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSave}
        initialValue={field.value}
      />
    </>
  )
}


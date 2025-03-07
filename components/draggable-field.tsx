"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { PDFField } from "@/lib/types"
import { format } from "date-fns"
import { SignatureModal } from "./signature-modal"
import Image from "next/image"

interface DraggableFieldProps {
  field: PDFField
  isSelected: boolean
  onSelect: () => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
  onDelete: (id: string) => void
  onValueChange: (id: string, value: string) => void
}

type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | null

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
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null)
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

  const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (!isSelected) return

    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    // Set initial position for resize calculation
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX,
        y: e.clientY,
      })
      setSize({
        width: rect.width,
        height: rect.height,
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fieldRef.current) return

    e.stopPropagation()

    // Don't start dragging if we're clicking on an input
    if ((e.target as HTMLElement).tagName === "INPUT") return

    // Don't start dragging if we're clicking on a resize handle
    if ((e.target as HTMLElement).classList.contains("resize-handle")) return

    // Only allow dragging when not selected or when clicking on the content area when selected
    if (!isSelected || (isSelected && !(e.target as HTMLElement).classList.contains("resize-handle"))) {
      setIsDragging(true)

      const rect = fieldRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!isDragging && !isResizing) || !fieldRef.current) return

      const parentRect = fieldRef.current.parentElement?.getBoundingClientRect()
      if (!parentRect) return

      if (isResizing && resizeDirection) {
        // Handle resizing
        let newWidth = size.width
        let newHeight = size.height
        let newX = field.x
        let newY = field.y

        const deltaX = e.clientX - dragOffset.x
        const deltaY = e.clientY - dragOffset.y

        // Handle horizontal resizing
        if (resizeDirection === "right" || resizeDirection === "topRight" || resizeDirection === "bottomRight") {
          newWidth = Math.max(50, size.width + deltaX)
        } else if (resizeDirection === "left" || resizeDirection === "topLeft" || resizeDirection === "bottomLeft") {
          const possibleWidth = size.width - deltaX
          if (possibleWidth >= 50) {
            newWidth = possibleWidth
            newX = field.x + deltaX
          }
        }

        // Handle vertical resizing
        if (resizeDirection === "bottom" || resizeDirection === "bottomLeft" || resizeDirection === "bottomRight") {
          newHeight = Math.max(30, size.height + deltaY)
        } else if (resizeDirection === "top" || resizeDirection === "topLeft" || resizeDirection === "topRight") {
          const possibleHeight = size.height - deltaY
          if (possibleHeight >= 30) {
            newHeight = possibleHeight
            newY = field.y + deltaY
          }
        }

        // Ensure we don't resize beyond parent boundaries
        const parentRect = fieldRef.current.parentElement?.getBoundingClientRect()
        if (parentRect) {
          newWidth = Math.min(newWidth, parentRect.width - newX)
          newHeight = Math.min(newHeight, parentRect.height - newY)
        }

        // Update position if needed (for left/top resizing)
        if (newX !== field.x) {
          fieldRef.current.style.left = `${newX}px`
          onMove(field.id, newX, field.y)
        }

        if (newY !== field.y) {
          fieldRef.current.style.top = `${newY}px`
          onMove(field.id, field.x, newY)
        }

        // Update size
        onResize(field.id, newWidth, newHeight)
      } else if (isDragging && !isSelected) {
        // Handle dragging
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
    [isDragging, isResizing, resizeDirection, dragOffset, size, onMove, field.id, field.x, field.y, onResize, isSelected],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }, [])

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

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
        className={`absolute flex items-start justify-center min-w-[100px] min-h-[40px] z-10 rounded-md overflow-visible border border-dashed border-gray-400
          ${isSelected ? "bg-white/80" : "resize-none"}`}
        onClick={(e) => {
          e.stopPropagation()
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={onSelect}
      >
        {renderFieldContent()}

        {isSelected && (
          <>
            <button
              className="absolute -top-1 -right-1 text-destructive-foreground rounded-full p-1 bg-gray-300 shadow-sm z-30"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(field.id)
              }}
            >
              <X className="h-3 w-3" />
            </button>

            {/* Resize handles */}
            <div
              className="resize-handle absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "top")}
            />
            <div
              className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "bottom")}
            />
            <div
              className="resize-handle absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "left")}
            />
            <div
              className="resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "right")}
            />

            {/* Corner resize handles */}
            <div
              className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "topLeft")}
            />
            <div
              className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "topRight")}
            />
            <div
              className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "bottomLeft")}
            />
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20"
              onMouseDown={(e) => handleResizeStart(e, "bottomRight")}
            />
          </>
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


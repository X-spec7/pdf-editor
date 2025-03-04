"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { PDFField } from "@/lib/types"
import { format } from "date-fns"

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

  // Set initial position and size
  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.style.left = `${field.x}px`
      fieldRef.current.style.top = `${field.y}px`
      fieldRef.current.style.width = `${field.width}px`
      fieldRef.current.style.height = `${field.height}px`
    }
  }, [field.x, field.y, field.width, field.height])

  // Handle resize observer
  useEffect(() => {
    if (!fieldRef.current || !isSelected) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        onResize(field.id, width, height)
      }
    })

    resizeObserver.observe(fieldRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [field.id, isSelected, onResize])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!fieldRef.current) return

    console.log('stop bubbling up')
    e.stopPropagation()
    onSelect()

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

      const parentRect = fieldRef.current.parentElement?.getBoundingClientRect()
      if (!parentRect) return

      const x = e.clientX - parentRect.left - dragOffset.x
      const y = e.clientY - parentRect.top - dragOffset.y

      // Update position
      fieldRef.current.style.left = `${x}px`
      fieldRef.current.style.top = `${y}px`

      onMove(field.id, x, y)
    },
    [isDragging, dragOffset, onMove, field.id],
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
          <div className="w-full h-full flex items-center justify-center border border-dashed border-primary/50 text-sm text-muted-foreground">
            {field.value ? field.value : "Signature"}
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
    <div
      ref={fieldRef}
      className={`absolute cursor-move flex items-center justify-center min-w-[100px] min-h-[40px] z-10 p-2 bg-white/80 rounded-md overflow-hidden ${isSelected ? "border-2 border-primary resize" : "border border-gray-100 resize-none"}`}
      onClick={onSelect}
      onMouseDown={handleMouseDown}
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
    </div>
  )
}

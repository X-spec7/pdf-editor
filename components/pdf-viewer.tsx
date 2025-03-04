"use client"

import type React from "react"

import type { PDFDocumentProxy } from "pdfjs-dist"
import { Document, Page, pdfjs } from "react-pdf"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import type { FieldType, PDFField } from "@/lib/types"
import { Button } from "./ui/button"
import { DraggableField } from "./draggable-field"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

interface PDFViewerProps {
  editedFile: Blob | null
  fields: PDFField[]
  selectedFieldId: string | null
  onFieldsChange: (fields: PDFField[]) => void
  onSelectField: (id: string | null) => void
  onFileDownload: () => void
  onFileDelete: () => void
}

export default function PDFViewer({
  editedFile,
  fields,
  selectedFieldId,
  onFieldsChange,
  onSelectField,
  onFileDownload,
  onFileDelete,
}: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setScale(scale + 0.1)
  }

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1)
    }
  }

  const onDocumentLoaded = ({ numPages: nextNumPages }: PDFDocumentProxy): void => {
    console.log("on load success")
    setTotalPages(nextNumPages)
    setCurrentPage(1)
    setIsLoading(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    // Get the field type from the drag event
    const fieldType = e.dataTransfer.getData("fieldType") as FieldType
    if (!fieldType || !pageRef.current) return

    // Calculate position relative to the PDF page
    const pageRect = pageRef.current.getBoundingClientRect()
    const x = e.clientX - pageRect.left
    const y = e.clientY - pageRect.top

    // Create a new field
    const newField: PDFField = {
      id: uuidv4(),
      type: fieldType,
      x,
      y,
      width: fieldType === "signature" ? 200 : 150,
      height: fieldType === "signature" ? 80 : 40,
      value: fieldType === "date" ? new Date().toISOString() : "",
      page: currentPage,
    }

    // Add the new field to the fields array
    const updatedFields = [...fields, newField]
    onFieldsChange(updatedFields)

    // Select the new field
    onSelectField(newField.id)
  }

  const handleFieldMove = (id: string, x: number, y: number) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, x, y } : field))
    onFieldsChange(updatedFields)
  }

  const handleFieldResize = (id: string, width: number, height: number) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, width, height } : field))
    onFieldsChange(updatedFields)
  }

  const handleFieldDelete = (id: string) => {
    const updatedFields = fields.filter((field) => field.id !== id)
    onFieldsChange(updatedFields)
    onSelectField(null)
  }

  const handleFieldValueChange = (id: string, value: string) => {
    const updatedFields = fields.map((field) => (field.id === id ? { ...field, value } : field))
    onFieldsChange(updatedFields)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // NOTE: D&D field can't be clicked here because it has stopped bubbling up of click event in D&D field.
    onSelectField(null)
  }

  // Filter fields for the current page
  const currentPageFields = fields.filter((field) => field.page === currentPage)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="flex items-center justify-end gap-8">
          <Button variant="destructive" onClick={onFileDelete}>
            Delete
          </Button>
          <Button variant="default" onClick={onFileDownload}>
            Download
          </Button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={isLoading}
              className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
            >
              -
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={isLoading}
              className="px-2 py-1 bg-secondary rounded disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div
        className="pdf-container flex-1 overflow-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleContainerClick}
      >
        {error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <div className="relative pt-10 bg-gray-100" ref={containerRef}>
            {editedFile && (
              <Document
                file={editedFile}
                onLoadSuccess={onDocumentLoaded}
                className={"flex justify-center items-start h-screen overflow-auto no-scrollbar"}
              >
                <div ref={pageRef} className="relative">
                  <Page width={1000} scale={scale} pageNumber={currentPage} />

                  {/* Render fields for the current page */}
                  {currentPageFields.map((field) => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => {
                        console.log('field clicked: ', field.id)
                        onSelectField(field.id)
                      }}
                      onMove={handleFieldMove}
                      onResize={handleFieldResize}
                      onDelete={handleFieldDelete}
                      onValueChange={handleFieldValueChange}
                    />
                  ))}
                </div>
              </Document>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

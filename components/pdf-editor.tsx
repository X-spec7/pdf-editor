"use client"

import { useCallback, useState } from "react"
import { Menu } from "lucide-react"
import { PDFDocument, rgb } from "pdf-lib"

import type { FieldType, PDFField } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { PDFUploader } from "@/components/pdf-uploader"
import PDFViewer from "./pdf-viewer"

export function PDFEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [editedFile, setEditedFile] = useState<Blob | null>(null)
  const [originalPdfDoc, setOriginalPdfDoc] = useState<PDFDocument | null>(null)
  const [fields, setFields] = useState<PDFField[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const { toast } = useToast()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleFileUpload = useCallback(
    async (file: File) => {
      setFields([])
      setSelectedFieldId(null)

      try {
        // Convert uploaded file to an array buffer
        const arrayBuffer = await file.arrayBuffer()
        // Load PDF document from the array buffer
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        // Save the loaded PDF document
        setOriginalPdfDoc(pdfDoc)
        // Save the loaded PDF document back to bytes
        const pdfBytes = await pdfDoc.save()
        // Create a Blob from the saved PDF bytes
        const editedPDFFile = new Blob([pdfBytes], { type: "application/pdf" })

        setEditedFile(editedPDFFile)

        toast({
          title: "PDF uploaded successfully",
          description: `File: ${file.name}`,
        })
      } catch (error) {
        console.error("Error loading PDF:", error)
        toast({
          title: "Error uploading PDF",
          description: "There was an error loading the PDF file.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleAddField = (type: FieldType) => {
    // This is handled by drag and drop in the PDFViewer component
    console.log(`Add field of type: ${type}`)
  }

  const handleFileDownload = async () => {
    if (!editedFile || !originalPdfDoc) return

    console.log('fields when downloading: ', fields)

    try {
      // Create a copy of the original PDF document
      const pdfDoc = await PDFDocument.load(await editedFile.arrayBuffer())

      // Process each field and add it to the PDF
      for (const field of fields) {
        const page = pdfDoc.getPage(field.page - 1)
        const { width, height } = page.getSize()

        // Calculate the position in PDF coordinates (bottom-left origin)
        // Assuming the field coordinates are relative to the top-left of the page
        const pdfX = field.x
        const pdfY = height - field.y - field.height

        switch (field.type) {
          case "text":
            // Add text field
            page.drawText(field.value || "", {
              x: pdfX,
              y: pdfY,
              size: 12,
              color: rgb(0, 0, 0),
            })
            break

          case "signature":
            // For signature, draw a placeholder or the actual signature
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
              opacity: 0.5,
            })

            if (field.value) {
              page.drawText(field.value, {
                x: pdfX + 10,
                y: pdfY + field.height / 2 - 6,
                size: 12,
                color: rgb(0, 0, 0),
              })
            }
            break

          case "date":
            // Add date field
            const dateValue = field.value ? new Date(field.value).toLocaleDateString() : new Date().toLocaleDateString()

            page.drawText(dateValue, {
              x: pdfX,
              y: pdfY,
              size: 12,
              color: rgb(0, 0, 0),
            })
            break
        }
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save()
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" })

      // Create a URL for the edited file Blob
      const url = URL.createObjectURL(modifiedPdfBlob)
      // Create a temporary anchor element
      const a = document.createElement("a")

      // Set the href and download attributes of the anchor element
      a.href = url
      a.download = "edited.pdf"
      // Append the anchor to the document body and click it to trigger the download
      document.body.appendChild(a)
      a.click()
      // Remove the anchor from the document body and revoke the object URL
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "PDF downloaded successfully",
        description: "Your edited PDF has been downloaded.",
      })
    } catch (error) {
      console.error("Error saving PDF:", error)
      toast({
        title: "Error saving PDF",
        description: "There was an error saving the PDF file.",
        variant: "destructive",
      })
    }
  }

  const handleFileDelete = () => {
    setEditedFile(null)
    setOriginalPdfDoc(null)
    setFields([])
    setSelectedFieldId(null)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Button variant="outline" size="icon" className="absolute top-4 left-4 z-10 md:hidden" onClick={toggleSidebar}>
        <Menu className="h-4 w-4" />
      </Button>

      <Sidebar isOpen={isSidebarOpen} onAddField={handleAddField} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {!editedFile ? (
          <div className="flex items-center justify-center h-full">
            <PDFUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <PDFViewer
            fields={fields}
            selectedFieldId={selectedFieldId}
            editedFile={editedFile}
            onFieldsChange={setFields}
            onSelectField={setSelectedFieldId}
            onFileDownload={handleFileDownload}
            onFileDelete={handleFileDelete}
          />
        )}
      </div>
    </div>
  )
}

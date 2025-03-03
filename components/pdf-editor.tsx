"use client";

import { useCallback, useState } from "react";
import { Menu } from "lucide-react";
import { PDFDocument } from 'pdf-lib';

import { FieldType, PDFField } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { PDFUploader } from "@/components/pdf-uploader";
import PDFViewer from "./pdf-viewer";

export function PDFEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [editedFile, setEditedFile] = useState<Blob | null>(null);

  const [fields, setFields] = useState<PDFField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setFields([]);

    // Convert uploaded file to an array buffer
    const arrayBuffer = await file.arrayBuffer();
    // Load PDF document from the array buffer
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    // Save the loaded PDF document back to bytes
    const pdfBytes = await pdfDoc.save();
    // Create a Blob from the saved PDF bytes
    const editedPDFFile = new Blob([pdfBytes], { type: 'application/pdf' });

    setEditedFile(editedPDFFile);

    toast({
      title: "PDF uploaded successfully",
      description: `File: ${file.name}`,
    });
  }, [toast]);

  const handleFileDownload = () => {
    if (editedFile) {
      // Create a URL for the edited file Blob
      const url = URL.createObjectURL(editedFile);
      // Create a temporary anchor element
      const a = document.createElement('a');

      // Set the href and download attributes of the anchor element
      a.href = url;
      a.download = 'edited.pdf';
      // Append the anchor to the document body and click it to trigger the download
      document.body.appendChild(a);
      a.click();
      // Remove the anchor from the document body and revoke the object URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Button
        variant="outline"
        size="icon"
        className="sidebar-toggle"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
            onFileDownload={handleFileDownload}
          />
        )}
      </div>
    </div>
  );
}

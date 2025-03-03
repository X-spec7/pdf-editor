"use client";

import { useCallback, useState } from "react";
import { Menu } from "lucide-react";

import { PDFField } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "@/components/pdf-viewer";
import { PDFUploader } from "@/components/pdf-uploader";

export function PDFEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fields, setFields] = useState<PDFField[]>([]);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFileUpload = useCallback((file: File) => {
    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFields([]);
    toast({
      title: "PDF uploaded successfully",
      description: `File: ${file.name}`,
    });
  }, [toast])

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
        {!pdfUrl ? (
          <div className="flex items-center justify-center h-full">
            <PDFUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <PDFViewer />
        )}
      </div>
    </div>
  );
}

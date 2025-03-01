"use client";

import { useState } from "react";
import { PDFUploader } from "@/components/pdf-uploader";
import { PDFViewer } from "@/components/pdf-viewer";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function PDFEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string>('')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            <PDFUploader />
          </div>
        ) : (
          <PDFViewer />
        )}
      </div>
    </div>
  );
}
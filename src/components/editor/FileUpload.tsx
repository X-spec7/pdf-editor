import { useCallback } from 'react'
import { loadPdfDocument } from '@/lib/pdf-loader';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

const FileUpload = () => {

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      // Use await with toast.promise to properly handle the promise
      toast.promise(loadPdfDocument(file), {
        loading: "Loading PDF document...",
        success: "PDF document loaded successfully",
        error: "Failed to load PDF document",
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF document");
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type === "application/pdf") {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-[80vh] w-[600px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center cursor-pointer ${isDragActive
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50"
        }`}
    >
      <input {...getInputProps()} />
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <Upload className="h-8 w-8 text-gray-400" />
        {/* <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /> */}
      </div>
      <h3 className="mb-2 text-xl font-medium text-gray-900">
        No PDF document loaded
      </h3>
      <p className="mb-6 text-sm text-gray-500">
        Upload a PDF document to get started with placing fields
      </p>
      <Button className="mt-2">
        <Upload className="mr-2 h-4 w-4" />
        Upload PDF
      </Button>
    </div>
  )
}

export default FileUpload

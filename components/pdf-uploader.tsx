"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PDFUploaderProps {
  onFileUpload: (file: File) => void;
}

export function PDFUploader({ onFileUpload }: PDFUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type === "application/pdf") {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Upload PDF Document</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop a PDF file here, or click to select a file
          </p>
          <Button variant="secondary">Select PDF</Button>
        </div>
      </CardContent>
    </Card>
  );
}

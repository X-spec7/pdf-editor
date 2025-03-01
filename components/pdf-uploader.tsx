"use client";

interface PDFUploaderProps {
  onFileUpload?: (file: File) => void;
}

export function PDFUploader({ onFileUpload }: PDFUploaderProps) {

  return (
    <div>PDF Uploader</div>
  );
}
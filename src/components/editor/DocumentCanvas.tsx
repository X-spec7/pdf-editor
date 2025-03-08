import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useEditorHistoryStore } from "@/store/useEditorHistoryStore";
import { FieldType } from "@/types/pdf-editor";
import { DocumentField } from "./DocumentField";
import { DocumentPage } from "./DocumentPage";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useEditorKeyboardShortcuts } from "@/hooks/useEditorKeyboardShortcuts";
import {
  calculateSnapPoints,
  renderAlignmentGuides,
  AlignmentLine,
} from "@/lib/smart-placement";
import { loadPdfDocument } from "@/lib/pdf-loader";
import { toast } from "sonner";
import { getFieldTemplate } from "@/data/field-templates";

export const DocumentCanvas: React.FC = memo(() => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const alignmentCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reference to track field being dragged
  const draggedFieldRef = useRef<string | null>(null);

  // State for alignment guides
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentLine[]>([]);

  // Use individual selectors for each value to avoid shallow comparison issues
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);
  const addField = useEditorStore((state) => state.addField);
  const updateField = useEditorStore((state) => state.updateField);
  const selectField = useEditorStore((state) => state.selectField);
  const fields = useEditorStore((state) => state.fields);
  const pages = useEditorStore((state) => state.pages);
  const isDragging = useEditorStore((state) => state.isDragging);
  const setDragging = useEditorStore((state) => state.setDragging);

  // Get history functions
  const saveState = useEditorHistoryStore((state) => state.saveState);

  // Initialize keyboard shortcuts
  useEditorKeyboardShortcuts();

  // Handle upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    } finally {
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setScale(Math.min(scale + 0.1, 2.0));
  }, [scale, setScale]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setScale(Math.max(scale - 0.1, 0.5));
  }, [scale, setScale]);

  // Handle rotation (placeholder for future implementation)
  const handleRotate = useCallback(() => {
    toast("Rotation functionality will be implemented in a future update");
  }, []);

  // Handle dropping a field onto a page
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => {
      e.preventDefault();

      // Get the field type from the drag data
      const fieldType = e.dataTransfer.getData("fieldType") as FieldType;
      if (!fieldType) return;

      // Calculate position relative to the page
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      // Check for snap points
      const template = getFieldTemplate(fieldType);

      if (!template) return;

      const position = { x, y, pageIndex };
      const snapPoints = calculateSnapPoints(
        null,
        fields,
        position,
        template.defaultSize,
      );

      // Apply snap points if available
      if (snapPoints.x !== null) {
        position.x = snapPoints.x;
      }

      if (snapPoints.y !== null) {
        position.y = snapPoints.y;
      }

      // Add the field at the drop position
      addField(fieldType, position);

      // Save state for undo history
      saveState();

      // Clear alignment guides after drop
      setAlignmentGuides([]);
    },
    [addField, fields, scale, saveState],
  );

  // Handle field dragging
  useEffect(() => {
    if (!canvasRef.current) return;

    // Function to handle mouse move during dragging
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !draggedFieldRef.current) return;

      // Find the dragged field
      const draggedField = fields.find(
        (field) => field.id === draggedFieldRef.current,
      );

      if (!draggedField) return;

      // Get the page element that contains the field
      const pageElements = document.querySelectorAll(".document-page");
      const pageElement = Array.from(pageElements).find((el) => {
        const pageIndex = parseInt(
          el.getAttribute("data-page-index") || "-1",
          10,
        );
        return pageIndex === draggedField.position.pageIndex;
      });

      if (!pageElement) return;

      // Calculate new position
      const rect = pageElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      // Check for snap points
      const position = { x, y, pageIndex: draggedField.position.pageIndex };
      const snapPoints = calculateSnapPoints(
        draggedField,
        fields,
        position,
        draggedField.size,
      );

      // Apply snap points if available
      if (snapPoints.x !== null) {
        position.x = snapPoints.x;
      }

      if (snapPoints.y !== null) {
        position.y = snapPoints.y;
      }

      // Update field position
      updateField({
        id: draggedField.id,
        position,
      });

      // Update alignment guides
      setAlignmentGuides(snapPoints.alignmentLines);
    };

    // Function to handle mouse up to end dragging
    const handleMouseUp = () => {
      if (isDragging) {
        setDragging(false);
        draggedFieldRef.current = null;

        // Clear alignment guides
        setAlignmentGuides([]);

        // Save state for undo history
        saveState();
      }
    };

    // Function to handle drag start on a field
    const handleFieldDragStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldElement = target.closest("[data-field-id]");

      if (fieldElement) {
        // Get the field ID and select it
        const fieldId = fieldElement.getAttribute("data-field-id");
        if (fieldId) {
          draggedFieldRef.current = fieldId;
          selectField(fieldId);
        }
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleFieldDragStart);

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleFieldDragStart);
    };
  }, [
    isDragging,
    fields,
    scale,
    updateField,
    setDragging,
    selectField,
    saveState,
  ]);

  // Render alignment guides when they change
  useEffect(() => {
    if (!alignmentCanvasRef.current || alignmentGuides.length === 0) {
      return;
    }

    const ctx = alignmentCanvasRef.current.getContext("2d");
    if (!ctx) return;

    // Update canvas size to match container
    if (canvasRef.current) {
      alignmentCanvasRef.current.width = canvasRef.current.clientWidth;
      alignmentCanvasRef.current.height = canvasRef.current.clientHeight;
    }

    // Render the guides
    renderAlignmentGuides(ctx, alignmentGuides, scale);

    // Clear guides after a short delay (for better UX)
    const timeout = setTimeout(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [alignmentGuides, scale]);

  // Render the document canvas
  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-auto bg-gray-100 p-8"
      onClick={() => selectField(null)}
    >
      {/* Alignment guides canvas (overlay) */}
      <canvas
        ref={alignmentCanvasRef}
        className="pointer-events-none absolute inset-0 z-50"
      />

      {/* Document pages */}
      <div className="mx-auto flex flex-col items-center space-y-8">
        {/* No PDF message when no pages are available */}
        {pages.length === 0 ? (
          <div className="flex h-[80vh] w-[600px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              No PDF document loaded
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Upload a PDF document to get started with placing fields
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
            <Button onClick={handleUploadClick} className="mt-2">
              <Upload className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
          </div>
        ) : (
          // Render pages when available
          pages.map((page, index) => (
            <div
              key={`page-${index}`}
              className="relative shadow-lg"
              style={{
                width: page.width * scale,
                height: page.height * scale,
              }}
            >
              <DocumentPage
                pageIndex={page.pageIndex}
                width={page.width}
                height={page.height}
                scale={scale}
                onDrop={(e) => handleDrop(e, page.pageIndex)}
                data-page-index={page.pageIndex}
              />

              {/* Render fields on this page */}
              {fields
                .filter((field) => field.position.pageIndex === index)
                .map((field) => (
                  <DocumentField key={field.id} fieldId={field.id} />
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

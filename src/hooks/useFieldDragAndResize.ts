import { useRef, useCallback } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { FieldPosition, FieldSize } from "@/types/pdf-editor";

/**
 * Hook to handle field dragging and resizing
 *
 * @param fieldId - The ID of the field
 * @returns Drag and resize handlers
 */
export function useFieldDragAndResize(fieldId: string) {
  const field = useEditorStore((state) =>
    state.fields.find((f) => f.id === fieldId),
  );

  const scale = useEditorStore((state) => state.scale);
  const updateField = useEditorStore((state) => state.updateField);
  const setDragging = useEditorStore((state) => state.setDragging);
  const setResizing = useEditorStore((state) => state.setResizing);

  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!field) return;

      e.preventDefault();
      startPos.current = { x: e.clientX, y: e.clientY };
      setDragging(true);

      const handleDrag = (e: MouseEvent) => {
        const dx = (e.clientX - startPos.current.x) / scale;
        const dy = (e.clientY - startPos.current.y) / scale;

        updateField({
          id: fieldId,
          position: {
            x: field.position.x + dx,
            y: field.position.y + dy,
            pageIndex: field.position.pageIndex,
          },
        });

        startPos.current = { x: e.clientX, y: e.clientY };
      };

      const handleDragEnd = () => {
        setDragging(false);
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", handleDragEnd);
      };

      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);
    },
    [field, fieldId, scale, updateField, setDragging],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!field) return;

      e.preventDefault();
      e.stopPropagation();
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = {
        width: field.size.width,
        height: field.size.height,
      };
      setResizing(true);

      const handleResize = (e: MouseEvent) => {
        const dx = (e.clientX - startPos.current.x) / scale;
        const dy = (e.clientY - startPos.current.y) / scale;

        updateField({
          id: fieldId,
          size: {
            width: Math.max(50, startSize.current.width + dx),
            height: Math.max(30, startSize.current.height + dy),
          },
        });
      };

      const handleResizeEnd = () => {
        setResizing(false);
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [field, fieldId, scale, updateField, setResizing],
  );

  return {
    handleDragStart,
    handleResizeStart,
  };
}

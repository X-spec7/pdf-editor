import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useEditorHistoryStore } from "@/store/useEditorHistoryStore";

export function useEditorKeyboardShortcuts() {
  const deleteField = useEditorStore((state) => state.deleteField);
  const selectedFieldId = useEditorStore((state) => state.selectedFieldId);
  const { undo, redo, canUndo, canRedo } = useEditorHistoryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected field with Delete or Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFieldId) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return; // Don't delete field if user is typing in an input
        }
        deleteField(selectedFieldId);
      }

      // Undo with Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }

      // Redo with Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteField, selectedFieldId, undo, redo, canUndo, canRedo]);
}

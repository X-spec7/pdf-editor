import React from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { DocumentCanvas } from "./DocumentCanvas";
import { FieldsPalette } from "./FieldsPalette";
import { FieldProperties } from "./FieldProperties";
import { useEditorStore } from "@/store/useEditorStore";

export const PDFEditor: React.FC = () => {
  const selectedFieldId = useEditorStore((state) => state.selectedFieldId);

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader />
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <DocumentCanvas />
        </div>

        {/* Right sidebar */}
        <div className="w-96 border-l">
          <FieldsPalette />
        </div>
      </div>

      {/* Field properties panel (shows when a field is selected) */}
      {selectedFieldId && <FieldProperties />}
    </div>
  );
};

"use client";

import { useState } from "react";
import { X, Type, Signature, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import { FieldType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SidebarProps {
  isOpen: boolean;
  onAddField?: (type: FieldType) => void;
  onClose: () => void;
}

export function Sidebar({ isOpen, onAddField, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("fields");

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: FieldType) => {
    e.dataTransfer.setData("fieldType", type);
  };

  return (
    <div
      className={cn(
        "sidebar bg-card border-r h-full overflow-y-auto",
        isOpen ? "open" : ""
      )}
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">PDF Editor</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="fields" className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields" onClick={() => setActiveTab("fields")}>Fields</TabsTrigger>
          <TabsTrigger value="properties" onClick={() => setActiveTab("properties")}>Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Drag fields to your document</h3>
            
            <div
              className="draggable-field"
              draggable
              onDragStart={(e) => handleDragStart(e, "text")}
              // onClick={() => onAddField("text")}
            >
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                <span>Text Field</span>
              </div>
            </div>
            
            <div
              className="draggable-field"
              draggable
              onDragStart={(e) => handleDragStart(e, "signature")}
              // onClick={() => onAddField("signature")}
            >
              <div className="flex items-center">
                <Signature className="h-4 w-4 mr-2" />
                <span>Signature Field</span>
              </div>
            </div>
            
            <div
              className="draggable-field"
              draggable
              onDragStart={(e) => handleDragStart(e, "date")}
              // onClick={() => onAddField("date")}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Date Field</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Instructions</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Drag fields onto the document</li>
              <li>• Click to select a field</li>
              <li>• Drag to reposition</li>
              <li>• Resize by dragging corners</li>
              <li>• Delete with the X button</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="mt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Document Properties</h3>
            <p className="text-sm text-muted-foreground">
              Select a field to view and edit its properties.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
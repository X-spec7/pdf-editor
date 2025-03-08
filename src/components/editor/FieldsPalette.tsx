import React from "react";
import { fieldTemplates } from "@/data/field-templates";
import { useEditorStore } from "@/store/useEditorStore";
import { FieldType } from "@/types/pdf-editor";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const FieldsPalette: React.FC = () => {
  const currentRecipient = useEditorStore((state) => state.currentRecipient);
  const recipients = useEditorStore((state) => state.recipients);
  const setDragging = useEditorStore((state) => state.setDragging);
  const setCurrentRecipient = useEditorStore(
    (state) => state.setCurrentRecipient,
  );

  // Create and append custom drag image
  const createDragImage = (fieldType: FieldType, fieldLabel: string) => {
    // Create a div element for the drag image
    const dragImage = document.createElement("div");
    dragImage.className = "fixed top-0 left-0 pointer-events-none";
    dragImage.style.cssText =
      "background: white; border-radius: 4px; padding: 8px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; width: 120px; z-index: 9999;";

    // Create the field label element
    const labelElement = document.createElement("span");
    labelElement.textContent = fieldLabel;
    labelElement.style.cssText = "font-size: 14px; color: #333;";

    // Append label to drag image
    dragImage.appendChild(labelElement);

    // Create the icon container
    const iconContainer = document.createElement("div");
    iconContainer.style.cssText = "display: flex; align-items: center;";

    // Get the SVG icon string based on field type and append it
    let iconSvg = "";
    switch (fieldType) {
      case "text":
        iconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 15V9" /><path d="M12 9v6" /></svg>';
        break;
      case "signature":
        iconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9l-6 6-6-6" /></svg>';
        break;
      default:
        iconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /></svg>';
    }

    iconContainer.innerHTML = iconSvg;
    dragImage.appendChild(iconContainer);

    // Append to body temporarily
    document.body.appendChild(dragImage);

    return dragImage;
  };

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    fieldType: FieldType,
  ) => {
    e.dataTransfer.setData("field-type", fieldType);
    setDragging(true);

    // Find the field template to get the label
    const fieldTemplate = fieldTemplates.find(
      (template) => template.type === fieldType,
    );
    if (fieldTemplate) {
      // Create custom drag image
      const dragImage = createDragImage(fieldType, fieldTemplate.label);

      // Set the drag image
      e.dataTransfer.setDragImage(dragImage, 60, 20);

      // Remove the element after a short delay
      setTimeout(() => {
        if (dragImage.parentNode) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragging(false);
  };

  // Filter templates by category
  const basicFields = fieldTemplates.filter((f) => f.category === "basic");
  const advancedFields = fieldTemplates.filter(
    (f) => f.category === "advanced",
  );

  // Handle recipient selection
  const handleRecipientChange = (recipientId: string) => {
    setCurrentRecipient(recipientId);
    // Would update the current recipient in the context
    toast(
      `Fields will now be assigned to ${
        recipients.find((r) => r.id === recipientId)?.name ||
        "the selected recipient"
      }`,
      {
        description: "Drag fields onto the document to place them",
      },
    );
  };

  return (
    <div className="h-full animate-fade-in overflow-y-auto bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Content</h2>
      </div>

      <div className="p-4">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          Blocks
        </h3>

        <div className="space-y-4">
          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-2">
            {basicFields.map((field) => (
              <div
                key={field.type}
                className="field-item flex flex-col items-center justify-center"
                draggable
                onDragStart={(e) => handleDragStart(e, field.type)}
                onDragEnd={handleDragEnd}
              >
                <field.icon className="h-4 w-4" />
                <span className="text-xs">{field.label}</span>
              </div>
            ))}
          </div>

          {/* Advanced Fields */}
          <div className="grid grid-cols-2 gap-2">
            {advancedFields.map((field) => (
              <div
                key={field.type}
                className="field-item flex flex-col items-center justify-center"
                draggable
                onDragStart={(e) => handleDragStart(e, field.type)}
                onDragEnd={handleDragEnd}
              >
                <field.icon className="h-4 w-4" />
                <span className="text-xs">{field.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipient selector */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Fillable Fields For
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        recipients.find((r) => r.id === currentRecipient)
                          ?.color || "#4f46e5",
                    }}
                  ></div>
                  <span>
                    {recipients.find((r) => r.id === currentRecipient)?.name ||
                      "Select Recipient"}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px]">
              {recipients.map((recipient) => (
                <DropdownMenuItem
                  key={recipient.id}
                  className="cursor-pointer"
                  onClick={() => handleRecipientChange(recipient.id)}
                >
                  <div className="flex w-full items-center">
                    <div
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: recipient.color }}
                    ></div>
                    <span>{recipient.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

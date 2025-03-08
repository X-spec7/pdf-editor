import React from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFieldTemplate } from "@/data/field-templates";
import { FieldType } from "@/types/pdf-editor";

export const FieldProperties: React.FC = () => {
  const selectedFieldId = useEditorStore((state) => state.selectedFieldId);
  const fields = useEditorStore((state) => state.fields);
  const recipients = useEditorStore((state) => state.recipients);
  const updateField = useEditorStore((state) => state.updateField);
  const selectField = useEditorStore((state) => state.selectField);
  const deleteField = useEditorStore((state) => state.deleteField);

  const selectedField = fields.find((field) => field.id === selectedFieldId);

  if (!selectedField) {
    return null;
  }

  const template = getFieldTemplate(selectedField.type);

  // Get name for field type
  const getFieldName = (type: FieldType): string => {
    return template?.label || "Field";
  };

  const handleClose = () => {
    selectField(null);
  };

  const handleRequiredToggle = (checked: boolean) => {
    updateField({
      id: selectedField.id,
      required: checked,
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField({
      id: selectedField.id,
      label: e.target.value,
    });
  };

  const handleRecipientChange = (value: string) => {
    updateField({
      id: selectedField.id,
      recipientId: value,
    });
  };

  const handleDelete = () => {
    deleteField(selectedField.id);
  };

  return (
    <div
      className={cn(
        "fixed right-[400px] top-[120px] z-10 w-80 rounded-lg border bg-white p-4 shadow-lg",
        "animate-scale-in transition-all duration-200 ease-out",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">
          {getFieldName(selectedField.type)} Properties
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-label">Field Label</Label>
          <Input
            id="field-label"
            value={selectedField.label || ""}
            onChange={handleLabelChange}
            placeholder="Enter label"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required" className="cursor-pointer">
            Required Field
          </Label>
          <Switch
            id="field-required"
            checked={selectedField.required || false}
            onCheckedChange={handleRequiredToggle}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-recipient">Assign to</Label>
          <Select
            value={selectedField.recipientId}
            onValueChange={handleRecipientChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  <div className="flex items-center">
                    <div
                      className="mr-2 h-2 w-2 rounded-full"
                      style={{ backgroundColor: recipient.color }}
                    ></div>
                    <span>{recipient.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field type specific options would go here */}

        <Separator className="my-4" />

        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          Delete Field
        </Button>
      </div>
    </div>
  );
};

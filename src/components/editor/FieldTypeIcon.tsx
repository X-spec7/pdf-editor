import React from "react";
import { FieldType } from "@/types/pdf-editor";
import {
  TextIcon,
  PenToolIcon,
  CalendarIcon,
  CheckSquareIcon,
  CircleIcon,
  ListIcon,
  CreditCardIcon,
  FileIcon,
  StampIcon,
  PenIcon,
} from "lucide-react";

interface FieldTypeIconProps {
  type: FieldType;
  size?: number;
}

export const FieldTypeIcon: React.FC<FieldTypeIconProps> = ({
  type,
  size = 16,
}) => {
  switch (type) {
    case "text":
      return <TextIcon size={size} />;
    case "signature":
      return <PenToolIcon size={size} />;
    case "date":
      return <CalendarIcon size={size} />;
    case "initials":
      return <PenIcon size={size} />;
    case "checkbox":
      return <CheckSquareIcon size={size} />;
    case "radio":
      return <CircleIcon size={size} />;
    case "dropdown":
      return <ListIcon size={size} />;
    case "card":
      return <CreditCardIcon size={size} />;
    case "file":
      return <FileIcon size={size} />;
    case "stamp":
      return <StampIcon size={size} />;
    default:
      return null;
  }
};

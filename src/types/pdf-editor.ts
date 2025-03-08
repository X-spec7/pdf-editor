import { LucideIcon } from "lucide-react";

export type FieldType =
  | "text"
  | "signature"
  | "date"
  | "initials"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "card"
  | "file"
  | "stamp";

export type FieldSize = {
  width: number;
  height: number;
};

export type FieldPosition = {
  x: number;
  y: number;
  pageIndex: number;
};

export interface Field {
  id: string;
  type: FieldType;
  position: FieldPosition;
  size: FieldSize;
  recipientId: string;
  required?: boolean;
  label?: string;
  value?: string;
  options?: string[];
  scale?: number;
}

export class Recipient {
  id: string;
  name: string;
  email: string;
  color: string;

  // Predefined set of distinct colors that work well for UI elements
  private static colorPalette = [
    "#4f46e5", // Indigo
    "#0ea5e9", // Sky blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#a855f7", // Purple
    "#f43f5e", // Rose
    "#0284c7", // Light blue
    "#059669", // Green
    "#d946ef", // Fuchsia
    "#6d28d9", // Purple
  ];

  /**
   * Generates a random color from the color palette
   *
   * @returns A color string from the palette
   */
  private static getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colorPalette.length);
    return this.colorPalette[randomIndex];
  }

  /**
   * Creates a new Recipient instance
   *
   * @param params - The recipient parameters
   */
  constructor(params: {
    id?: string;
    name: string;
    email?: string;
    color?: string;
  }) {
    this.id =
      params.id ||
      `recipient-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.name = params.name.trim();
    this.email = (params.email || "").trim();
    this.color = params.color || Recipient.getRandomColor();
  }

  /**
   * Creates a formatted display name for the recipient
   *
   * @returns The formatted name with email if available
   */
  getDisplayName(): string {
    return this.email ? `${this.name} <${this.email}>` : this.name;
  }

  /**
   * Validates if the recipient has all required fields
   *
   * @returns True if the recipient is valid
   */
  isValid(): boolean {
    return Boolean(this.name && this.id);
  }

  /**
   * Validates if the email is in a valid format
   *
   * @returns True if the email is valid or empty
   */
  hasValidEmail(): boolean {
    if (!this.email) return true; // Empty email is considered valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Updates recipient properties
   *
   * @param updates - The properties to update
   * @returns The updated recipient instance
   */
  update(updates: Partial<Omit<Recipient, "id">>): Recipient {
    if (updates.name) this.name = updates.name.trim();
    if (updates.email !== undefined) this.email = updates.email.trim();
    if (updates.color) this.color = updates.color;
    return this;
  }

  /**
   * Creates a clone of this recipient
   *
   * @returns A new Recipient instance with the same properties
   */
  clone(): Recipient {
    return new Recipient({
      id: this.id,
      name: this.name,
      email: this.email,
      color: this.color,
    });
  }

  /**
   * Serializes the recipient to a plain object
   *
   * @returns A plain object representation of the recipient
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      color: this.color,
    };
  }

  /**
   * Creates a Recipient instance from a plain object
   *
   * @param data - The plain object data
   * @returns A new Recipient instance
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(data: Record<string, any>): Recipient {
    return new Recipient({
      id: data.id,
      name: data.name,
      email: data.email,
      color: data.color,
    });
  }
}

export interface DocumentPage {
  pageIndex: number;
  width: number;
  height: number;
}

export interface EditorState {
  fields: Field[];
  selectedFieldId: string | null;
  recipients: Recipient[];
  currentRecipient: string | null;
  pages: DocumentPage[];
  scale: number;
  isDragging: boolean;
  isResizing: boolean;
}

export type FieldTemplate = {
  type: FieldType;
  icon: LucideIcon;
  label: string;
  defaultSize: FieldSize;
  category: "basic" | "advanced";
};

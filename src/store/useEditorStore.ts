import { create } from "zustand";
import { toast } from "sonner";
import { devtools, persist } from "zustand/middleware";
import {
  EditorState,
  Field,
  FieldPosition,
  FieldSize,
  FieldType,
  DocumentPage,
  Recipient,
} from "@/types/pdf-editor";

// Define the store type with state and actions
interface EditorStore extends EditorState {
  // Actions
  addField: (
    type: FieldType,
    position: FieldPosition,
    size?: FieldSize,
  ) => void;
  updateField: (field: Partial<Field> & { id: string }) => void;
  deleteField: (id: string) => void;
  selectField: (id: string | null) => void;
  addRecipient: (recipientData: {
    name: string;
    email?: string;
    color?: string;
  }) => void;
  updateRecipient: (
    id: string,
    updates: Partial<Omit<Recipient, "id">>,
  ) => void;
  deleteRecipient: (id: string) => void;
  setCurrentRecipient: (id: string | null) => void;
  setPages: (pages: DocumentPage[]) => void;
  setScale: (scale: number) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;

  // Selectors
  getRecipientById: (id: string | null) => Recipient | null;
  getCurrentRecipient: () => Recipient | null;
  getFieldRecipient: (fieldId: string) => Recipient | null;
}

// Mock data for initial state
const initialRecipients: Recipient[] = [
  new Recipient({
    id: "unique_id",
    name: "John Doe",
    email: "john.doe@example.com",
  }),
  new Recipient({
    id: "unique_id_2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
  }),
];

// Initial state
const initialState: EditorState = {
  fields: [],
  selectedFieldId: null,
  recipients: initialRecipients,
  currentRecipient: initialRecipients[0].id,
  pages: [],
  scale: 1,
  isDragging: false,
  isResizing: false,
};

// Create the store with persistence
export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Actions
        addField: (type, position, size) => {
          const id = `field-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const defaultSize = { width: 150, height: 40 };

          // Get the current recipient ID
          const currentRecipientId = get().currentRecipient;

          // Make sure we have a valid recipient ID
          if (!currentRecipientId) {
            toast.error("No recipient selected");
            return;
          }

          const field: Field = {
            id,
            type,
            position,
            size: size || defaultSize,
            recipientId: currentRecipientId, // Store the recipient ID
            required: false,
          };

          toast.success(`${field.type} field added`);
          set((state) => ({
            fields: [...state.fields, field],
            selectedFieldId: field.id,
          }));
        },

        updateField: (field) =>
          set((state) => ({
            fields: state.fields.map((f) =>
              f.id === field.id ? { ...f, ...field } : f,
            ),
          })),

        deleteField: (id) => {
          toast.info("Field deleted");
          set((state) => ({
            fields: state.fields.filter((field) => field.id !== id),
            selectedFieldId:
              state.selectedFieldId === id ? null : state.selectedFieldId,
          }));
        },

        selectField: (id) => set({ selectedFieldId: id }),

        addRecipient: (recipientData) => {
          const newRecipient = new Recipient(recipientData);

          if (!newRecipient.isValid()) {
            toast.error("Invalid recipient data");
            return;
          }

          set((state) => ({
            recipients: [...state.recipients, newRecipient],
          }));

          toast.success(`Recipient ${newRecipient.name} added`);
        },

        updateRecipient: (id, updates) => {
          set((state) => {
            const recipients = [...state.recipients];
            const index = recipients.findIndex((r) => r.id === id);

            if (index === -1) return state;

            // Create a new instance with the updates
            recipients[index] = recipients[index].update(updates);

            return { recipients };
          });
        },

        deleteRecipient: (id) => {
          // Don't allow deleting the last recipient
          const { recipients, currentRecipient, fields } = get();

          if (recipients.length <= 1) {
            toast.error("Cannot delete the last recipient");
            return;
          }

          // If deleting current recipient, switch to another one
          let newCurrentRecipient = currentRecipient;
          if (currentRecipient === id) {
            const otherRecipient = recipients.find((r) => r.id !== id);
            newCurrentRecipient = otherRecipient ? otherRecipient.id : null;
          }

          // Update fields assigned to this recipient
          const updatedFields = fields.map((field) =>
            field.recipientId === id
              ? { ...field, recipientId: newCurrentRecipient }
              : field,
          );

          set({
            recipients: recipients.filter((r) => r.id !== id),
            currentRecipient: newCurrentRecipient,
            fields: updatedFields,
          });

          toast.info("Recipient deleted");
        },

        setCurrentRecipient: (id) => set({ currentRecipient: id }),

        setPages: (pages) => set({ pages }),

        setScale: (scale) => set({ scale }),

        setDragging: (isDragging) => set({ isDragging }),

        setResizing: (isResizing) => set({ isResizing }),

        // Selectors
        getRecipientById: (id: string | null) => {
          if (!id) return null;
          return get().recipients.find((r) => r.id === id) || null;
        },

        getCurrentRecipient: () => {
          const state = get();
          if (!state.currentRecipient) return null;
          return (
            state.recipients.find((r) => r.id === state.currentRecipient) ||
            null
          );
        },

        getFieldRecipient: (fieldId: string) => {
          const state = get();
          const field = state.fields.find((f) => f.id === fieldId);
          if (!field?.recipientId) return null;
          return (
            state.recipients.find((r) => r.id === field.recipientId) || null
          );
        },
      }),
      {
        name: "editor-storage",
        partialize: (state) => ({
          fields: [],
          recipients: state.recipients.map((r) => r.toJSON()),
          currentRecipient: state.currentRecipient,
          pages: [],
          scale: state.scale,
        }),
        onRehydrateStorage: () => (state) => {
          // Convert plain recipient objects back to class instances
          if (state && state.recipients) {
            state.recipients = state.recipients.map((r) =>
              typeof r.toJSON === "function" ? r : Recipient.fromJSON(r),
            );
          }

          // Ensure pages and fields are empty on reload
          if (state) {
            state.pages = [];
            state.fields = [];
          }
        },
      },
    ),
    { name: "editor-store" },
  ),
);

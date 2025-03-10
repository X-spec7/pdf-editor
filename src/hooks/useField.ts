import { useEditorStore } from "@/store/useEditorStore";
import { Field } from "@/types/pdf-editor";

/**
 * Hook to get and manage a specific field
 *
 * @param fieldId - The ID of the field
 * @returns Field data and actions
 */
export function useField(fieldId: string) {
  const field = useEditorStore((state) =>
    state.fields.find((f) => f.id === fieldId),
  );

  const isSelected = useEditorStore(
    (state) => state.selectedFieldId === fieldId,
  );

  const recipient = useEditorStore((state) => {
    if (!field?.recipientId) return null;
    return state.recipients.find((r) => r.id === field.recipientId) || null;
  });

  const updateField = useEditorStore((state) => state.updateField);
  const deleteField = useEditorStore((state) => state.deleteField);
  const selectField = useEditorStore((state) => state.selectField);

  return {
    field,
    isSelected,
    recipient,
    updateField: (updates: Partial<Field>) =>
      updateField({ ...updates, id: fieldId }),
    deleteField: () => deleteField(fieldId),
    selectField: () => selectField(fieldId),
  };
}

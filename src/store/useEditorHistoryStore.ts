import { create } from "zustand";
import { useEditorStore } from "./useEditorStore";
import { Field, Recipient } from "@/types/pdf-editor";

interface HistoryState {
  past: Array<{
    fields: Field[];
    recipients: Recipient[];
    currentRecipient: string | null;
  }>;
  future: Array<{
    fields: Field[];
    recipients: Recipient[];
    currentRecipient: string | null;
  }>;
  canUndo: boolean;
  canRedo: boolean;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useEditorHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  saveState: () => {
    const currentState = useEditorStore.getState();
    const { fields, recipients, currentRecipient } = currentState;

    set((state) => {
      const newPast = [
        ...state.past,
        {
          fields: JSON.parse(JSON.stringify(fields)),
          recipients: recipients.map((r) => r.clone()),
          currentRecipient,
        },
      ].slice(-20); // Limit history to 20 states

      return {
        past: newPast,
        future: [],
        canUndo: newPast.length > 0,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const currentState = useEditorStore.getState();
    const { fields, recipients, currentRecipient } = currentState;

    const newPast = [...past];
    const previousState = newPast.pop();

    if (previousState) {
      useEditorStore.setState({
        fields: previousState.fields,
        recipients: previousState.recipients,
        currentRecipient: previousState.currentRecipient,
      });

      set((state) => ({
        past: newPast,
        future: [
          {
            fields: JSON.parse(JSON.stringify(fields)),
            recipients: recipients.map((r) => r.clone()),
            currentRecipient,
          },
          ...state.future,
        ],
        canUndo: newPast.length > 0,
        canRedo: true,
      }));
    }
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const currentState = useEditorStore.getState();
    const { fields, recipients, currentRecipient } = currentState;

    const newFuture = [...future];
    const nextState = newFuture.shift();

    if (nextState) {
      useEditorStore.setState({
        fields: nextState.fields,
        recipients: nextState.recipients,
        currentRecipient: nextState.currentRecipient,
      });

      set((state) => ({
        past: [
          ...state.past,
          {
            fields: JSON.parse(JSON.stringify(fields)),
            recipients: recipients.map((r) => r.clone()),
            currentRecipient,
          },
        ],
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      }));
    }
  },

  clear: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));

import { create } from 'zustand';
import { Linking, Platform } from 'react-native';

export type FeedbackType = 'suggestion' | 'bug' | 'rating' | 'general';

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  screen: string;
  text: string;
  rating?: number; // 1-5
  timestamp: number;
  sent: boolean;
}

interface DogfoodState {
  enabled: boolean;
  entries: FeedbackEntry[];

  toggle: () => void;
  addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'timestamp' | 'sent'>) => void;
  sendFeedback: (entry: FeedbackEntry) => void;
  sendAll: () => void;
}

const FEEDBACK_EMAIL = 't3mpofeedback@outlook.com';

function buildEmailBody(entries: FeedbackEntry[]): string {
  return entries
    .map(
      (e) =>
        `[${e.type.toUpperCase()}] ${e.screen}\n${e.text}${e.rating ? ` (${e.rating}/5)` : ''}\n${new Date(e.timestamp).toLocaleString()}`
    )
    .join('\n\n---\n\n');
}

function openMailto(subject: string, body: string) {
  const encoded = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(encoded);
}

export const useDogfoodStore = create<DogfoodState>((set, get) => ({
  enabled: false,
  entries: [],

  toggle: () => set((s) => ({ enabled: !s.enabled })),

  addFeedback: (partial) => {
    const entry: FeedbackEntry = {
      ...partial,
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      sent: false,
    };
    set((s) => ({ entries: [...s.entries, entry] }));
  },

  sendFeedback: (entry) => {
    openMailto(
      `Tempo Feedback: ${entry.type} on ${entry.screen}`,
      buildEmailBody([entry])
    );
    set((s) => ({
      entries: s.entries.map((e) => (e.id === entry.id ? { ...e, sent: true } : e)),
    }));
  },

  sendAll: () => {
    const unsent = get().entries.filter((e) => !e.sent);
    if (unsent.length === 0) return;
    openMailto(
      `Tempo Feedback: ${unsent.length} items`,
      buildEmailBody(unsent)
    );
    set((s) => ({
      entries: s.entries.map((e) => ({ ...e, sent: true })),
    }));
  },
}));

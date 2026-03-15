import { create } from 'zustand';

export interface Idea {
  id: string;
  text: string;
  timestamp: number;
}

interface IdeasState {
  ideas: Idea[];
  add: (text: string) => void;
  remove: (id: string) => void;
}

export const useIdeasStore = create<IdeasState>((set) => ({
  ideas: [],

  add: (text) => {
    const idea: Idea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: text.trim(),
      timestamp: Date.now(),
    };
    set((s) => ({ ideas: [idea, ...s.ideas] }));
  },

  remove: (id) =>
    set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),
}));

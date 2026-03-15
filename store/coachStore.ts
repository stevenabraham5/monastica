import { create } from 'zustand';
import { getCoachResponse } from '../services/coachLLM';

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: number;
}

interface CoachState {
  messages: CoachMessage[];
  isThinking: boolean;

  sendMessage: (text: string) => void;
  clearConversation: () => void;
}

export const useCoachStore = create<CoachState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'coach',
      text: 'This is private. Say what you need to say.',
      timestamp: Date.now() - 1000,
    },
  ],
  isThinking: false,

  sendMessage: async (text: string) => {
    const userMsg: CoachMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
    }));

    try {
      const allMessages = [...get().messages];
      const response = await getCoachResponse(allMessages);

      const coachMsg: CoachMessage = {
        id: `c-${Date.now()}`,
        role: 'coach',
        text: response,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, coachMsg],
        isThinking: false,
      }));
    } catch (e) {
      const errorMsg: CoachMessage = {
        id: `c-${Date.now()}`,
        role: 'coach',
        text: 'Something went wrong. Try again.',
        timestamp: Date.now(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isThinking: false,
      }));
    }
  },

  clearConversation: () =>
    set({
      messages: [
        {
          id: 'welcome',
          role: 'coach',
          text: 'This is private. Say what you need to say.',
          timestamp: Date.now(),
        },
      ],
      isThinking: false,
    }),
}));

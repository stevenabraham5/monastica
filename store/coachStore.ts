import { create } from 'zustand';

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: number;
}

// The coach personality: listens, then cross-examines, looks for patterns and opportunities
const COACH_RESPONSES: string[] = [
  'What makes you say that?',
  'Is that what actually happened, or what you think should have happened?',
  'What would you do differently if there were no consequences?',
  'You said something similar last week. Do you see a pattern?',
  'What are you avoiding by focusing on this?',
  'That sounds like a constraint you accepted. Is it real?',
  'If someone you respect described this situation, what would you tell them?',
  'What is the simplest version of what you actually want here?',
  'You are describing the problem well. What about the opportunity?',
  'What would enough look like in this situation?',
  'Is this urgent, or just loud?',
  'What did you learn from this that you did not expect?',
  'Where is the tension between what you want and what you are doing?',
  'You are being hard on yourself. Is that useful right now?',
  'What would change if you trusted yourself on this?',
];

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

  sendMessage: (text: string) => {
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

    // Simulate coach response — in production this would hit an LLM API
    // with the full conversation context + user's tempo data
    setTimeout(() => {
      const msgs = get().messages;
      const seed = msgs.length + text.length;
      const response = COACH_RESPONSES[seed % COACH_RESPONSES.length];

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
    }, 800 + Math.random() * 600);
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

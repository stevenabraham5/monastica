import { create } from 'zustand';

export interface SubGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface Domain {
  id: string;
  name: string;
  goal: string;
  targetHours: number;
  actualHours: number;
  subGoals: SubGoal[];
}

export interface Reflection {
  id: string;
  date: string;
  text: string;
}

interface LifeModelState {
  intention: string;
  domains: Domain[];
  reflections: Reflection[];

  setIntention: (text: string) => void;
  addDomain: (domain: Domain) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  removeDomain: (id: string) => void;
  addReflection: (reflection: Reflection) => void;
}

export const useLifeModel = create<LifeModelState>((set) => ({
  intention: '',
  domains: [
    {
      id: '1',
      name: 'Health & Body',
      goal: 'Move every day. Sleep deeply. Eat with intention.',
      targetHours: 5,
      actualHours: 3,
      subGoals: [
        { id: 's1', text: 'Morning movement', completed: false },
        { id: 's2', text: 'Sleep by 10:30pm', completed: true },
        { id: 's3', text: 'Cook 4x/week', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Creative Work',
      goal: 'Write without judgment. Ship without perfection.',
      targetHours: 8,
      actualHours: 5.5,
      subGoals: [
        { id: 's4', text: 'Daily writing practice', completed: true },
        { id: 's5', text: 'Publish monthly', completed: false },
        { id: 's6', text: 'Sketch ideas freely', completed: false },
      ],
    },
    {
      id: '3',
      name: 'Relationships',
      goal: 'Be present with the people who matter most.',
      targetHours: 4,
      actualHours: 2,
      subGoals: [
        { id: 's7', text: 'Weekly family dinner', completed: true },
        { id: 's8', text: 'Monthly friend catch-up', completed: false },
        { id: 's9', text: 'Daily check-in with partner', completed: true },
      ],
    },
    {
      id: '4',
      name: 'Learning',
      goal: 'Read widely. Think slowly. Connect ideas.',
      targetHours: 3,
      actualHours: 2.5,
      subGoals: [
        { id: 's10', text: 'Read 30min daily', completed: true },
        { id: 's11', text: 'One deep-dive topic per month', completed: false },
      ],
    },
  ],
  reflections: [
    {
      id: 'r1',
      date: 'March 14',
      text: 'Felt scattered today. Too many context switches between meetings. The creative work suffered.',
    },
    {
      id: 'r2',
      date: 'March 12',
      text: "Good day. Finished the draft I'd been putting off. Went for a long walk after.",
    },
    {
      id: 'r3',
      date: 'March 10',
      text: "Realized I haven't called Mom in two weeks. That bothers me more than the missed deadlines.",
    },
    {
      id: 'r4',
      date: 'March 8',
      text: 'Energy was low all day. Slept poorly. Skipped everything and just read. That was the right call.',
    },
  ],

  setIntention: (text) => set({ intention: text }),

  addDomain: (domain) =>
    set((state) => ({ domains: [...state.domains, domain] })),

  updateDomain: (id, updates) =>
    set((state) => ({
      domains: state.domains.map((d) =>
        d.id === id ? { ...d, ...updates } : d,
      ),
    })),

  removeDomain: (id) =>
    set((state) => ({
      domains: state.domains.filter((d) => d.id !== id),
    })),

  addReflection: (reflection) =>
    set((state) => ({
      reflections: [reflection, ...state.reflections],
    })),
}));

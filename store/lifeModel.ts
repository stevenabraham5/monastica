import { create } from 'zustand';
import type { Relationship, StandingPolicy, EnergyProfile } from './types';

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
  subjectiveLevel: number | null;   // 0–1 manual override, null = use hours ratio
  lastAdjusted: number | null;      // timestamp of last manual or auto adjustment
}

export interface Reflection {
  id: string;
  date: string;
  text: string;
  agentResponse?: string;
}

export interface Checkin {
  feeling: string;
  timestamp: number;
  note?: string;
}

export interface DomainEntry {
  id: string;
  domainId: string;
  level: number;       // 0–1 rating at time of entry
  note: string;        // free-text
  timestamp: number;
}

interface LifeModelState {
  intention: string;
  intentionSet: boolean;
  domains: Domain[];
  reflections: Reflection[];
  checkins: Checkin[];
  lastCheckin: Checkin | null;
  domainEntries: DomainEntry[];
  relationships: Relationship[];
  standingPolicies: StandingPolicy[];
  energyProfile: EnergyProfile;

  setIntention: (text: string) => void;
  commitIntention: () => void;
  editIntention: () => void;
  addDomain: (domain: Domain) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  removeDomain: (id: string) => void;
  addReflection: (reflection: Reflection) => void;
  updateReflection: (id: string, updates: Partial<Reflection>) => void;
  addCheckin: (checkin: Checkin) => void;
  addRelationship: (rel: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  addPolicy: (policy: StandingPolicy) => void;
  setEnergyProfile: (profile: EnergyProfile) => void;
  adjustDomainLevel: (id: string, level: number) => void;
  nudgeDomain: (name: string, delta: number) => void;
  addDomainEntry: (entry: DomainEntry) => void;
}

export const useLifeModel = create<LifeModelState>((set) => ({
  intention: '',
  intentionSet: false,
  checkins: [],
  lastCheckin: null,
  domainEntries: [],
  relationships: [
    {
      id: 'rel-1',
      name: 'David',
      role: 'mentor',
      targetFrequencyDays: 30,
      lastContactDate: new Date(Date.now() - 34 * 86400000),
      relationshipTier: 'critical',
    },
    {
      id: 'rel-2',
      name: 'Audrey',
      role: 'partner',
      targetFrequencyDays: 1,
      lastContactDate: new Date(),
      relationshipTier: 'critical',
    },
    {
      id: 'rel-3',
      name: 'Mom',
      role: 'family',
      targetFrequencyDays: 7,
      lastContactDate: new Date(Date.now() - 14 * 86400000),
      relationshipTier: 'critical',
    },
  ],
  standingPolicies: [
    {
      id: 'pol-1',
      organizerType: 'vendor',
      action: 'always_decline',
      delegationTierRequired: 1,
      notes: 'Decline all vendor outreach',
    },
    {
      id: 'pol-2',
      organizerType: 'team',
      action: 'async_first',
      delegationTierRequired: 2,
      notes: 'Prefer async for team syncs',
    },
  ],
  energyProfile: {
    peakHoursStart: 8,
    peakHoursEnd: 12,
    lowEnergyStart: 14,
    lowEnergyEnd: 15,
    contextSwitchTolerance: 'low',
    hardStopTime: 18,
  },
  domains: [
    {
      id: '1',
      name: 'Sleep & Recovery',
      goal: 'The foundation everything else depends on.',
      targetHours: 56,
      actualHours: 48,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's1', text: 'Wind down by 10pm', completed: true },
        { id: 's2', text: 'No screens in bed', completed: false },
        { id: 's3', text: 'Weekend mornings without alarms', completed: true },
      ],
    },
    {
      id: '2',
      name: 'Movement & Body',
      goal: 'Move because it feels good.',
      targetHours: 7,
      actualHours: 4.5,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's4', text: 'Morning walk or stretch', completed: false },
        { id: 's5', text: 'Something vigorous twice a week', completed: true },
        { id: 's6', text: 'Move between long sitting blocks', completed: false },
      ],
    },
    {
      id: '3',
      name: 'Nourishment',
      goal: 'Cook more. Eat slowly.',
      targetHours: 5,
      actualHours: 3,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's7', text: 'Cook a real meal most nights', completed: false },
        { id: 's8', text: 'Grocery shop with a plan', completed: true },
        { id: 's9', text: 'Eat lunch away from a screen', completed: false },
      ],
    },
    {
      id: '4',
      name: 'Creative Expression',
      goal: 'Make things without purpose.',
      targetHours: 6,
      actualHours: 3.5,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's10', text: 'Daily writing or sketching', completed: true },
        { id: 's11', text: 'Finish one creative project per month', completed: false },
        { id: 's12', text: 'Play music or make something with hands', completed: false },
      ],
    },
    {
      id: '5',
      name: 'Professional Work',
      goal: 'Fewer things, more depth.',
      targetHours: 35,
      actualHours: 38,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's13', text: 'Deep work blocks most mornings', completed: true },
        { id: 's14', text: 'Decline meetings that could be async', completed: false },
        { id: 's15', text: 'End work by a consistent time', completed: false },
      ],
    },
    {
      id: '6',
      name: 'Learning & Growth',
      goal: 'Stay curious. Think slowly.',
      targetHours: 4,
      actualHours: 2.5,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's16', text: 'Read before bed instead of scrolling', completed: true },
        { id: 's17', text: 'One deep-dive topic per month', completed: false },
        { id: 's18', text: 'Listen to something challenging on walks', completed: true },
      ],
    },
    {
      id: '7',
      name: 'People I Love',
      goal: 'Present, not just available.',
      targetHours: 10,
      actualHours: 6,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's19', text: 'Undistracted time with Audrey', completed: true },
        { id: 's20', text: 'Call a family member weekly', completed: false },
        { id: 's21', text: 'See a friend in person monthly', completed: false },
      ],
    },
    {
      id: '8',
      name: 'Professional Relationships',
      goal: 'Invest in the people you build with.',
      targetHours: 3,
      actualHours: 2,
      subjectiveLevel: null,
      lastAdjusted: null,
      subGoals: [
        { id: 's22', text: 'Meaningful 1:1s, not status updates', completed: true },
        { id: 's23', text: 'Reach out to someone outside your team monthly', completed: false },
        { id: 's24', text: 'Give feedback generously', completed: true },
      ],
    },
  ],
  reflections: [
    {
      id: 'r1',
      date: 'Fri evening',
      text: 'Slept well. Ate badly. Skipped lunch, ordered dinner. The creative block in the morning was the best part.',
    },
    {
      id: 'r2',
      date: 'Wed evening',
      text: 'Work bled into the evening again. Audrey noticed. Walk after dinner helped.',
    },
    {
      id: 'r3',
      date: 'Mon afternoon',
      text: 'Haven\'t called Mom in two weeks. That bothers me more than the missed deadlines.',
    },
    {
      id: 'r4',
      date: 'Sat morning',
      text: 'Energy low all day. Slept badly, skipped gym. But cooked dinner and ate together without screens.',
    },
  ],

  setIntention: (text) => set({ intention: text }),

  commitIntention: () => set({ intentionSet: true }),

  editIntention: () => set({ intentionSet: false }),

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

  updateReflection: (id, updates) =>
    set((state) => ({
      reflections: state.reflections.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    })),

  addCheckin: (checkin) =>
    set((state) => ({
      checkins: [checkin, ...state.checkins],
      lastCheckin: checkin,
    })),

  addRelationship: (rel) =>
    set((state) => ({
      relationships: [...state.relationships, rel],
    })),

  updateRelationship: (id, updates) =>
    set((state) => ({
      relationships: state.relationships.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    })),

  addPolicy: (policy) =>
    set((state) => ({
      standingPolicies: [...state.standingPolicies, policy],
    })),

  setEnergyProfile: (profile) => set({ energyProfile: profile }),

  adjustDomainLevel: (id, level) =>
    set((state) => ({
      domains: state.domains.map((d) =>
        d.id === id
          ? { ...d, subjectiveLevel: Math.max(0, Math.min(1, level)), lastAdjusted: Date.now() }
          : d,
      ),
    })),

  nudgeDomain: (name, delta) =>
    set((state) => ({
      domains: state.domains.map((d) => {
        if (d.name !== name) return d;
        const current = d.subjectiveLevel ?? (d.targetHours > 0 ? d.actualHours / d.targetHours : 0.5);
        return {
          ...d,
          subjectiveLevel: Math.max(0, Math.min(1, current + delta)),
          lastAdjusted: Date.now(),
        };
      }),
    })),

  addDomainEntry: (entry) =>
    set((state) => ({
      domainEntries: [entry, ...state.domainEntries],
    })),
}));

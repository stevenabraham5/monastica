import { create } from 'zustand';
import type { CalendarProvider } from '../services/calendar';
import type {
  PersonaId,
  DelegationTier,
  Escalation,
  SentinelAction,
  BookingProposal,
  BookedItem,
  UrgencyItem,
  AgentScopeCard,
} from './types';

// ─────────────────────────────────────────────────────
// Personas — the user's delegation tolerance
// ─────────────────────────────────────────────────────

export interface Persona {
  id: PersonaId;
  name: string;
  philosophy: string;
  behaviors: string[];
}

export const personas: Record<PersonaId, Persona> = {
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    philosophy: 'You see everything. Tempo advises. You decide.',
    behaviors: [
      'All meetings require your approval',
      'Sentinel drafts responses, you send them',
      'Cultivator proposes, you book',
      'Full visibility into every action',
    ],
  },
  pragmatist: {
    id: 'pragmatist',
    name: 'Pragmatist',
    philosophy: 'Trust Tempo for the routine. Review what matters.',
    behaviors: [
      'Low-stakes meetings handled autonomously',
      'External or senior meetings escalated to you',
      'Cultivator books recovery and body blocks automatically',
      'Weekly summary of autonomous actions',
    ],
  },
  delegator: {
    id: 'delegator',
    name: 'Delegator',
    philosophy: 'Set policies. Tempo executes. You get a digest.',
    behaviors: [
      'Sentinel acts on standing policies without asking',
      'Only policy violations or novel situations surfaced',
      'Cultivator books proactively across all categories',
      'Silent operation — weekly sovereignty report only',
    ],
  },
};

// ─────────────────────────────────────────────────────
// Delegation tier descriptions
// ─────────────────────────────────────────────────────

export const TIER_DESCRIPTIONS: Record<DelegationTier, { label: string; description: string }> = {
  1: { label: 'Advise', description: 'Tempo observes and suggests. You take every action.' },
  2: { label: 'Draft', description: 'Tempo drafts responses. You review and send.' },
  3: { label: 'Act low-stakes', description: 'Tempo handles routine meetings. Escalates the rest.' },
  4: { label: 'Act with scope', description: 'Tempo sends an agent with a mission brief you approve.' },
  5: { label: 'Full policy', description: 'Full autonomy within standing policies. Weekly summary.' },
};

// ─────────────────────────────────────────────────────
// Sentinel state
// ─────────────────────────────────────────────────────

interface SentinelState {
  active: boolean;
  interceptedThisWeek: number;
  declinedThisWeek: number;
  deflectedAsyncThisWeek: number;
  agentAttendedThisWeek: number;
  hoursReclaimed: number;
  pendingEscalations: Escalation[];
  recentActions: SentinelAction[];
}

// ─────────────────────────────────────────────────────
// Cultivator state
// ─────────────────────────────────────────────────────

interface CultivatorState {
  active: boolean;
  pendingProposals: BookingProposal[];
  bookedThisWeek: BookedItem[];
  urgencyQueue: UrgencyItem[];
}

// ─────────────────────────────────────────────────────
// Calendar state (preserved from v0.1)
// ─────────────────────────────────────────────────────

interface CalendarState {
  calendarConsent: boolean;
  calendarProvider: CalendarProvider;
  calendarId: string | null;
  outlookToken: string | null;
}

// ─────────────────────────────────────────────────────
// Combined agent store
// ─────────────────────────────────────────────────────

interface AgentState extends CalendarState {
  persona: PersonaId | null;
  delegationTier: DelegationTier;
  onboardingComplete: boolean;

  sentinel: SentinelState;
  cultivator: CultivatorState;

  // Persona + tier
  setPersona: (persona: PersonaId) => void;
  setDelegationTier: (tier: DelegationTier) => void;
  completeOnboarding: () => void;

  // Sentinel
  resolveEscalation: (id: string, decision: 'attend' | 'agent' | 'decline' | 'clarify', scopeCard?: AgentScopeCard) => void;
  addSentinelAction: (action: SentinelAction) => void;

  // Cultivator
  acceptProposal: (id: string) => void;
  deferProposal: (id: string) => void;
  dismissProposal: (id: string) => void;

  // Calendar
  setCalendarConsent: (consent: boolean) => void;
  setCalendarProvider: (provider: CalendarProvider) => void;
  setCalendarId: (id: string | null) => void;
  setOutlookToken: (token: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  persona: null,
  delegationTier: 1,
  onboardingComplete: false,

  calendarConsent: false,
  calendarProvider: 'none',
  calendarId: null,
  outlookToken: null,

  // ── Sentinel ──
  sentinel: {
    active: true,
    interceptedThisWeek: 29,
    declinedThisWeek: 12,
    deflectedAsyncThisWeek: 8,
    agentAttendedThisWeek: 3,
    hoursReclaimed: 14,
    pendingEscalations: [
      {
        id: 'e1',
        meetingTitle: 'Q2 Planning Review',
        organizer: 'Sarah Chen',
        reason: 'protected_block_conflict',
        sentinelConfidence: 61,
        suggestedAction: 'clarify',
        suggestedQuestions: [
          'What specific outcome should this meeting reach?',
          'Is there a way to contribute asynchronously instead?',
        ],
        roleClassification: 'contributor',
        status: 'pending',
      },
      {
        id: 'e2',
        meetingTitle: 'Investor intro — Series B',
        organizer: 'Marcus Webb',
        reason: 'relationship_critical',
        sentinelConfidence: 42,
        suggestedAction: 'attend',
        roleClassification: 'decider',
        status: 'pending',
      },
    ],
    recentActions: [
      {
        id: 'sa1',
        timestamp: new Date(Date.now() - 3600000),
        actionType: 'declined',
        meetingTitle: 'Weekly sync — Marketing',
        organizer: 'Jamie Torres',
        minutesSaved: 30,
      },
      {
        id: 'sa2',
        timestamp: new Date(Date.now() - 7200000),
        actionType: 'deflected_async',
        meetingTitle: '1:1 — Project update',
        organizer: 'Alex Kim',
        minutesSaved: 25,
        clarificationQuestions: ['Can we handle this in a 3-minute Loom instead?'],
      },
      {
        id: 'sa3',
        timestamp: new Date(Date.now() - 10800000),
        actionType: 'agent_attended',
        meetingTitle: 'Design review — Mobile',
        organizer: 'Priya Sharma',
        minutesSaved: 45,
      },
    ],
  },

  // ── Cultivator ──
  cultivator: {
    active: true,
    pendingProposals: [
      {
        id: 'bp1',
        category: 'mind_thought_partner',
        title: 'Thought partner session',
        reason: 'You\'ve had 4 consecutive days of reactive work with no thinking time. Your product strategy goal is 60% behind.',
        durationMinutes: 45,
        proposedSlot: new Date(Date.now() + 86400000),
        energyType: 'peak',
        urgencyScore: 82,
        status: 'pending',
        relatedGoalId: '5',
      },
      {
        id: 'bp2',
        category: 'body_maintenance',
        title: 'Movement block',
        reason: 'Movement is at 43% this week. Last time you walked, you came back with the pricing model insight.',
        durationMinutes: 30,
        proposedSlot: new Date(Date.now() + 43200000),
        energyType: 'low',
        urgencyScore: 71,
        status: 'pending',
        relatedGoalId: '2',
      },
      {
        id: 'bp3',
        category: 'serendipity',
        title: 'Wander block',
        reason: 'You haven\'t had unstructured time in 11 days. No agenda. No output. Just yours.',
        durationMinutes: 60,
        proposedSlot: new Date(Date.now() + 172800000),
        energyType: 'medium',
        urgencyScore: 65,
        status: 'pending',
      },
      {
        id: 'bp4',
        category: 'relationships_mentor',
        title: 'Call with David',
        reason: 'David made your relationship-critical list. You haven\'t spoken in 34 days. Your board review is in 3 weeks — his perspective would land well.',
        durationMinutes: 30,
        proposedSlot: new Date(Date.now() + 259200000),
        energyType: 'medium',
        urgencyScore: 58,
        status: 'pending',
        relatedPersonId: 'rel-1',
      },
    ],
    bookedThisWeek: [
      {
        id: 'bk1',
        category: 'recovery',
        title: 'Post-standup buffer',
        slot: new Date(Date.now() - 86400000),
        durationMinutes: 15,
        bookedAt: new Date(Date.now() - 172800000),
      },
      {
        id: 'bk2',
        category: 'body_maintenance',
        title: 'Morning walk',
        slot: new Date(Date.now() - 43200000),
        durationMinutes: 30,
        bookedAt: new Date(Date.now() - 86400000),
      },
    ],
    urgencyQueue: [],
  },

  // ── Actions ──

  setPersona: (persona) => set({ persona }),

  setDelegationTier: (tier) => set({ delegationTier: tier }),

  completeOnboarding: () => set({ onboardingComplete: true, persona: 'guardian' }),

  resolveEscalation: (id, decision, scopeCard) =>
    set((state) => ({
      sentinel: {
        ...state.sentinel,
        pendingEscalations: state.sentinel.pendingEscalations.map((e) =>
          e.id === id ? { ...e, status: 'resolved' as const } : e,
        ),
      },
    })),

  addSentinelAction: (action) =>
    set((state) => ({
      sentinel: {
        ...state.sentinel,
        recentActions: [action, ...state.sentinel.recentActions],
      },
    })),

  acceptProposal: (id) =>
    set((state) => {
      const proposal = state.cultivator.pendingProposals.find((p) => p.id === id);
      const booked: BookedItem | undefined = proposal
        ? {
            id: `bk-${Date.now()}`,
            category: proposal.category,
            title: proposal.title,
            slot: proposal.proposedSlot,
            durationMinutes: proposal.durationMinutes,
            bookedAt: new Date(),
          }
        : undefined;
      return {
        cultivator: {
          ...state.cultivator,
          pendingProposals: state.cultivator.pendingProposals.map((p) =>
            p.id === id ? { ...p, status: 'accepted' as const } : p,
          ),
          bookedThisWeek: booked
            ? [...state.cultivator.bookedThisWeek, booked]
            : state.cultivator.bookedThisWeek,
        },
      };
    }),

  deferProposal: (id) =>
    set((state) => ({
      cultivator: {
        ...state.cultivator,
        pendingProposals: state.cultivator.pendingProposals.map((p) =>
          p.id === id ? { ...p, status: 'deferred' as const } : p,
        ),
      },
    })),

  dismissProposal: (id) =>
    set((state) => ({
      cultivator: {
        ...state.cultivator,
        pendingProposals: state.cultivator.pendingProposals.map((p) =>
          p.id === id ? { ...p, status: 'dismissed' as const } : p,
        ),
      },
    })),

  setCalendarConsent: (consent) => set({ calendarConsent: consent }),
  setCalendarProvider: (provider) => set({ calendarProvider: provider }),
  setCalendarId: (id) => set({ calendarId: id }),
  setOutlookToken: (token) => set({ outlookToken: token }),
}));

export type { PersonaId };

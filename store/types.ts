// ─────────────────────────────────────────────────────
// Tempo v0.2 — Type system
// Two-agent model, booking taxonomy, escalation tiers
// ─────────────────────────────────────────────────────

export type MeetingRole = 'decider' | 'contributor' | 'informed' | 'political' | 'unknown';

export type EscalationReason =
  | 'no_agenda'
  | 'protected_block_conflict'
  | 'first_time_organizer'
  | 'relationship_critical'
  | 'below_confidence_threshold'
  | 'outside_policy'
  | 'confidential_or_legal';

export type BookingCategory =
  | 'body_maintenance'
  | 'body_appointment'
  | 'mind_deep_work'
  | 'mind_thought_partner'
  | 'relationships_mentor'
  | 'relationships_maintenance'
  | 'professional_craft'
  | 'self_knowledge'
  | 'life_logistics'
  | 'serendipity'
  | 'recovery';

export type DelegationTier = 1 | 2 | 3 | 4 | 5;

export type PersonaId = 'guardian' | 'pragmatist' | 'delegator';

export interface BookingProposal {
  id: string;
  category: BookingCategory;
  title: string;
  reason: string;
  durationMinutes: number;
  proposedSlot: Date;
  energyType: 'peak' | 'medium' | 'low';
  urgencyScore: number;
  status: 'pending' | 'accepted' | 'deferred' | 'dismissed';
  relatedGoalId?: string;
  relatedPersonId?: string;
}

export interface SentinelAction {
  id: string;
  timestamp: Date;
  actionType: 'declined' | 'deflected_async' | 'agent_attended' | 'interrogated' | 'accepted';
  meetingTitle: string;
  organizer: string;
  minutesSaved?: number;
  clarificationQuestions?: string[];
  agentScopeCard?: AgentScopeCard;
}

export interface Escalation {
  id: string;
  meetingTitle: string;
  organizer: string;
  reason: EscalationReason;
  sentinelConfidence: number;
  suggestedAction: 'attend' | 'agent' | 'decline' | 'clarify';
  suggestedQuestions?: string[];
  proposedAlternativeSlots?: Date[];
  roleClassification?: MeetingRole;
  status: 'pending' | 'resolved';
}

export interface AgentScopeCard {
  meetingTitle: string;
  canAgreeToItems: string[];
  willNoteItems: string[];
  offLimitsItems: string[];
  confirmedByUser: boolean;
}

export interface UrgencyItem {
  category: BookingCategory;
  score: number;
  triggerReason: string;
  daysSinceTarget: number;
  relatedGoalId?: string;
}

export interface BookedItem {
  id: string;
  category: BookingCategory;
  title: string;
  slot: Date;
  durationMinutes: number;
  bookedAt: Date;
}

export interface Relationship {
  id: string;
  name: string;
  role: string;
  targetFrequencyDays: number;
  lastContactDate: Date | null;
  relationshipTier: 'critical' | 'important' | 'maintain';
}

export interface StandingPolicy {
  id: string;
  organizerType: string;
  action: 'always_accept' | 'always_decline' | 'send_agent' | 'async_first' | 'ask';
  delegationTierRequired: number;
  notes: string;
}

export interface EnergyProfile {
  peakHoursStart: number;
  peakHoursEnd: number;
  lowEnergyStart: number;
  lowEnergyEnd: number;
  contextSwitchTolerance: 'low' | 'medium' | 'high';
  hardStopTime: number;
}

// Category colors for BookingProposalCard
export const CATEGORY_COLORS: Record<string, string> = {
  body_maintenance: '#5DCAA5',
  body_appointment: '#5DCAA5',
  mind_deep_work: '#7F77DD',
  mind_thought_partner: '#7F77DD',
  relationships_mentor: '#EF9F27',
  relationships_maintenance: '#EF9F27',
  professional_craft: '#378ADD',
  self_knowledge: '#D4537E',
  life_logistics: '#888780',
  serendipity: '#D85A30',
  recovery: '#639922',
};

// Human-readable category labels
export const CATEGORY_LABELS: Record<BookingCategory, string> = {
  body_maintenance: 'Body',
  body_appointment: 'Body',
  mind_deep_work: 'Mind',
  mind_thought_partner: 'Thought Partner',
  relationships_mentor: 'Relationships',
  relationships_maintenance: 'Relationships',
  professional_craft: 'Craft',
  self_knowledge: 'Self',
  life_logistics: 'Logistics',
  serendipity: 'Serendipity',
  recovery: 'Recovery',
};

// Role classification colors
export const ROLE_COLORS: Record<MeetingRole, string> = {
  decider: '#2D5A3D',
  contributor: '#378ADD',
  informed: '#888780',
  political: '#8B6914',
  unknown: 'transparent',
};

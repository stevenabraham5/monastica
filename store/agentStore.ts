import { create } from 'zustand';

export interface AgentAction {
  id: string;
  action: 'Declined' | 'Attended' | 'Deflected to async';
  meeting: string;
  time: string;
  detail: string;
}

export interface Escalation {
  id: string;
  meeting: string;
  time: string;
  reason: string;
}

interface AgentStats {
  hoursReclaimed: number;
  deflected: number;
  attended: number;
}

interface AgentState {
  activeSince: string;
  stats: AgentStats;
  escalations: Escalation[];
  activityFeed: AgentAction[];

  resolveEscalation: (id: string, decision: 'attend' | 'agent' | 'decline') => void;
  addAction: (action: AgentAction) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  activeSince: 'March 1',
  stats: {
    hoursReclaimed: 14,
    deflected: 23,
    attended: 6,
  },
  escalations: [
    {
      id: 'e1',
      meeting: 'Q2 Planning Review',
      time: 'Tomorrow, 2:00 PM',
      reason: 'Director-level attendees — may require your presence',
    },
  ],
  activityFeed: [
    {
      id: 'a1',
      action: 'Declined',
      meeting: 'Weekly sync — Marketing',
      time: '2:30 PM',
      detail: '"Steven is focused on deep work this afternoon. He\'ll review the async summary and follow up on Slack by EOD."',
    },
    {
      id: 'a2',
      action: 'Attended',
      meeting: 'Design review — Mobile',
      time: '11:00 AM',
      detail: "Took notes and raised two questions on Steven's behalf. No action items assigned.",
    },
    {
      id: 'a3',
      action: 'Deflected to async',
      meeting: '1:1 — Project update',
      time: '9:30 AM',
      detail: '"Can we handle this in a 3-minute Loom instead? Steven will watch and reply by noon."',
    },
    {
      id: 'a4',
      action: 'Declined',
      meeting: 'All-hands optional Q&A',
      time: 'Yesterday',
      detail: '"Steven will watch the recording. No questions at this time."',
    },
  ],

  resolveEscalation: (id, decision) =>
    set((state) => ({
      escalations: state.escalations.filter((e) => e.id !== id),
      // In a real app, this would trigger the agent to take action
    })),

  addAction: (action) =>
    set((state) => ({
      activityFeed: [action, ...state.activityFeed],
    })),
}));

// ─────────────────────────────────────────────────────
// Sentinel clarification question library
// Max 3 per message. Organised by situation.
// ─────────────────────────────────────────────────────

export interface ClarificationQuestion {
  text: string;
  toneNote: string;
}

export const QUESTION_BANK: Record<string, ClarificationQuestion[]> = {
  purpose: [
    {
      text: 'What specific outcome should this meeting reach — and what does success look like at the end?',
      toneNote: 'Warm \u00B7 Outcome-focused',
    },
    {
      text: 'What\u2019s the one thing you need from [name] specifically that no one else in the meeting can provide?',
      toneNote: 'Direct \u00B7 Respectful',
    },
    {
      text: 'Is there a decision that needs to be made, or is this primarily informational?',
      toneNote: 'Neutral \u00B7 Clarifying',
    },
    {
      text: 'Could you share a brief agenda so I can prepare the most useful contribution?',
      toneNote: 'Warm \u00B7 Assumes good intent',
    },
  ],
  async_alternatives: [
    {
      text: 'Would a short Loom or written summary work instead of a live meeting for this?',
      toneNote: 'Warm \u00B7 Offers alternative',
    },
    {
      text: 'I want to give this proper attention — could I review the materials async and send detailed thoughts by end of day?',
      toneNote: 'Warm \u00B7 Non-confrontational',
    },
    {
      text: 'Would it work to replace this with a 10-minute call instead of the full block?',
      toneNote: 'Direct \u00B7 Time-conscious',
    },
  ],
  goal_alignment: [
    {
      text: 'How does this connect to the goals we discussed for this quarter?',
      toneNote: 'Warm \u00B7 Alignment-seeking',
    },
    {
      text: 'I\u2019m trying to protect deep work time this week — is there flexibility on timing?',
      toneNote: 'Honest \u00B7 Boundary-setting',
    },
    {
      text: 'What would happen if we pushed this by a week? Would anything break?',
      toneNote: 'Direct \u00B7 Stakes-testing',
    },
  ],
  role_clarity: [
    {
      text: 'Am I needed as a decision-maker here, or more as an observer?',
      toneNote: 'Neutral \u00B7 Role-clarifying',
    },
    {
      text: 'Who else will be there, and what role are you hoping I play?',
      toneNote: 'Warm \u00B7 Collaborative',
    },
    {
      text: 'Could someone on my team attend on my behalf and brief me after?',
      toneNote: 'Direct \u00B7 Delegation-opening',
    },
  ],
};

// Closing line — always appended, never editable by Sentinel
export const SENTINEL_CLOSING = 'Looking forward to finding the best path forward.';

// Max questions per outgoing message
export const MAX_QUESTIONS_PER_MESSAGE = 3;

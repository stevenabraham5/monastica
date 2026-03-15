import { useLifeModel, Domain, Checkin, Reflection } from '../store/lifeModel';
import { useIdeasStore } from '../store/ideasStore';

// ─────────────────────────────────────────────────────
// The Cultivator: Offense layer
// Reads your tempo data, emotional state, and open time.
// Suggests what to plant in the space the Sentinel won.
// ─────────────────────────────────────────────────────

export type SuggestionType =
  | 'wander'        // Do nothing. The most radical booking.
  | 'movement'      // Body needs attention
  | 'creative'      // Make something
  | 'connection'    // Reach out to someone
  | 'learning'      // Read, listen, explore
  | 'nourishment'   // Cook, eat well
  | 'recovery'      // Sleep, rest, decompress
  | 'thought'       // Thought partner session with Coach
  | 'idea'          // Surface a stashed idea worth exploring
  | 'serendipity';  // Leave room for the unexpected

export interface CultivatorSuggestion {
  id: string;
  type: SuggestionType;
  headline: string;
  detail: string;
  domain?: string;
  emotionallyAware: boolean; // true if this was shaped by emotional signals
}

// Emotional signals parsed from check-ins and reflections
interface EmotionalState {
  recentFeeling: string | null;
  isEmpty: boolean;      // "empty", "flat", "numb"
  isDrained: boolean;    // "drained", "exhausted", "tired"
  isScattered: boolean;  // "scattered", "overwhelmed", "restless"
  isGrieving: boolean;   // signals of loss or sadness in reflections
  isStuck: boolean;      // "stuck", "blocked" in reflections
}

function readEmotionalState(): EmotionalState {
  const { checkins, reflections } = useLifeModel.getState();
  const recent = checkins[0] ?? null;
  const recentFeeling = recent?.feeling ?? null;

  // Scan last 3 reflections for emotional keywords
  const recentText = reflections
    .slice(0, 3)
    .map((r) => r.text.toLowerCase())
    .join(' ');

  return {
    recentFeeling,
    isEmpty: recentFeeling === 'flat' || /empty|numb|nothing|hollow/.test(recentText),
    isDrained: recentFeeling === 'drained' || /exhausted|tired|burnt|burned/.test(recentText),
    isScattered: recentFeeling === 'scattered' || recentFeeling === 'restless' || /overwhelm|chaos|spinning/.test(recentText),
    isGrieving: /miss|loss|grief|sad|lonely|gone/.test(recentText),
    isStuck: /stuck|block|can't|won't move|paralyz/.test(recentText),
  };
}

function findStarvingDomains(): Domain[] {
  const { domains } = useLifeModel.getState();
  return domains.filter((d) => {
    if (d.targetHours <= 0) return false;
    return d.actualHours / d.targetHours < 0.5;
  });
}

function findOverfedDomains(): Domain[] {
  const { domains } = useLifeModel.getState();
  return domains.filter((d) => d.actualHours > d.targetHours);
}

export function getCultivatorSuggestions(): CultivatorSuggestion[] {
  const emotional = readEmotionalState();
  const starving = findStarvingDomains();
  const overfed = findOverfedDomains();
  const ideas = useIdeasStore.getState().ideas;
  const suggestions: CultivatorSuggestion[] = [];

  // ── EMOTIONAL STATE TAKES PRIORITY ──

  if (emotional.isEmpty) {
    suggestions.push({
      id: 'cult-empty',
      type: 'wander',
      headline: 'Leave the next hour open',
      detail: 'You said you feel flat. Don\'t fill this with tasks. Walk somewhere without a destination. See what surfaces.',
      emotionallyAware: true,
    });
    suggestions.push({
      id: 'cult-empty-creative',
      type: 'creative',
      headline: 'Make something small and pointless',
      detail: 'When everything feels empty, making something — anything — with your hands can restart the circuit.',
      domain: 'Creative Expression',
      emotionallyAware: true,
    });
    return suggestions; // Don't overwhelm someone who feels empty
  }

  if (emotional.isDrained) {
    suggestions.push({
      id: 'cult-drained',
      type: 'recovery',
      headline: 'Protect tonight',
      detail: 'Your energy is low. The Sentinel can block your evening. No commitments after 7pm.',
      domain: 'Sleep & Recovery',
      emotionallyAware: true,
    });
    return suggestions;
  }

  if (emotional.isScattered) {
    suggestions.push({
      id: 'cult-scattered',
      type: 'wander',
      headline: 'One slow thing',
      detail: 'When everything feels urgent, do one thing slowly on purpose. Cook a meal. Walk without your phone. Break the pattern.',
      emotionallyAware: true,
    });
  }

  if (emotional.isStuck) {
    suggestions.push({
      id: 'cult-stuck',
      type: 'thought',
      headline: 'Talk it through',
      detail: 'You\'ve been circling something. Open the Coach and say it out loud. Sometimes the block is just silence.',
      emotionallyAware: true,
    });
  }

  // ── DOMAIN GAP ANALYSIS ──

  for (const domain of starving) {
    const suggestion = domainSuggestion(domain);
    if (suggestion) suggestions.push(suggestion);
  }

  // ── OVERFED DOMAINS (usually work) ──

  const overwork = overfed.find((d) => d.name === 'Professional Work');
  if (overwork) {
    suggestions.push({
      id: 'cult-overwork',
      type: 'wander',
      headline: 'You\'re overdrawn on work',
      detail: `${Math.round(overwork.actualHours - overwork.targetHours)}h over target. The Sentinel can hold the line, but what do you want in that time instead?`,
      domain: 'Professional Work',
      emotionallyAware: false,
    });
  }

  // ── STASHED IDEAS ──

  if (ideas.length > 0) {
    const newest = ideas[0];
    suggestions.push({
      id: 'cult-idea',
      type: 'idea',
      headline: 'You stashed something',
      detail: `"${newest.text}" — is now the time to explore this?`,
      emotionallyAware: false,
    });
  }

  // ── THE WANDER BLOCK (always offered if nothing urgent) ──

  if (suggestions.length < 2) {
    suggestions.push({
      id: 'cult-wander',
      type: 'wander',
      headline: 'Book an empty hour',
      detail: 'No agenda. No goal. The Sentinel will guard it. You decide in the moment what it becomes.',
      emotionallyAware: false,
    });
  }

  // ── SERENDIPITY ──

  if (suggestions.length < 3) {
    suggestions.push({
      id: 'cult-serendipity',
      type: 'serendipity',
      headline: 'Leave room for the unexpected',
      detail: 'The best things that happened to you last month — were any of them planned?',
      emotionallyAware: false,
    });
  }

  return suggestions.slice(0, 3); // Never overwhelm. Three max.
}

function domainSuggestion(domain: Domain): CultivatorSuggestion | null {
  const pct = Math.round((domain.actualHours / domain.targetHours) * 100);

  switch (domain.name) {
    case 'Movement & Body':
      return {
        id: `cult-${domain.id}`,
        type: 'movement',
        headline: 'Your body is asking',
        detail: `Movement is at ${pct}%. Even a short walk changes everything. The Sentinel can clear 30 minutes.`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'Creative Expression':
      return {
        id: `cult-${domain.id}`,
        type: 'creative',
        headline: 'Make something',
        detail: `Creative time is at ${pct}%. What would you make if it didn't have to be useful?`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'People I Love':
      return {
        id: `cult-${domain.id}`,
        type: 'connection',
        headline: 'Reach out',
        detail: `You haven't spent much time with the people who matter this week. Who would be glad to hear from you?`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'Learning & Growth':
      return {
        id: `cult-${domain.id}`,
        type: 'learning',
        headline: 'Feed your curiosity',
        detail: `Learning is at ${pct}%. What question have you been carrying around? Give yourself an hour with it.`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'Nourishment':
      return {
        id: `cult-${domain.id}`,
        type: 'nourishment',
        headline: 'Cook tonight',
        detail: `You've been eating on autopilot. Cook something real. Eat it slowly.`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'Sleep & Recovery':
      return {
        id: `cult-${domain.id}`,
        type: 'recovery',
        headline: 'Protect your sleep',
        detail: `Recovery is at ${pct}%. Wind-down starts now — the Sentinel blocks everything after 9pm.`,
        domain: domain.name,
        emotionallyAware: false,
      };
    case 'Professional Relationships':
      return {
        id: `cult-${domain.id}`,
        type: 'connection',
        headline: 'Invest in someone you build with',
        detail: `When did you last have a real conversation — not a status update — with someone on your team?`,
        domain: domain.name,
        emotionallyAware: false,
      };
    default:
      return null;
  }
}

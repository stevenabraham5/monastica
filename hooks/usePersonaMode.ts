import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAgentStore } from '../store/agentStore';
import type { DelegationTier, PersonaId } from '../store/types';
import { TIER_DESCRIPTIONS } from '../store/agentStore';

/**
 * Returns current persona + delegation tier.
 * Controls which UX elements are visible:
 *   guardian:   all 4 escalation actions, no autonomous booking
 *   pragmatist: "Send agent" for tier >= 3
 *   delegator:  Sentinel acts within policies, digest only
 */
export function usePersonaMode() {
  const { persona, delegationTier, setDelegationTier } = useAgentStore();

  const canSendAgent = delegationTier >= 3;

  const canActAutonomously =
    persona === 'delegator' || (persona === 'pragmatist' && delegationTier >= 4);

  const graduateTier = useCallback(() => {
    const next = Math.min(delegationTier + 1, 5) as DelegationTier;
    if (next === delegationTier) return;

    const { label, description } = TIER_DESCRIPTIONS[next];

    Alert.alert(
      `Move to Tier ${next}: ${label}?`,
      description,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => setDelegationTier(next) },
      ],
    );
  }, [delegationTier, setDelegationTier]);

  return {
    persona,
    tier: delegationTier,
    canSendAgent,
    canActAutonomously,
    graduateTier,
  };
}

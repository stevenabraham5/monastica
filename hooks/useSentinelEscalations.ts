import { useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import type { Escalation, AgentScopeCard } from '../store/types';

/**
 * Returns pending escalations requiring human decision.
 * Escalation triggers (regardless of delegation tier):
 *   - First-time organizer
 *   - Confidence score < 80%
 *   - Confidential / legal tag
 *   - Organizer in relationship-critical list
 *   - Meeting duration > 90 min
 *   - Escalation pending > 24h (re-surfaces)
 */
export function useSentinelEscalations() {
  const { sentinel, resolveEscalation } = useAgentStore();

  const escalations = useMemo(
    () => sentinel.pendingEscalations.filter((e) => e.status === 'pending'),
    [sentinel.pendingEscalations],
  );

  const pendingCount = escalations.length;

  return {
    escalations,
    resolveEscalation,
    pendingCount,
  };
}

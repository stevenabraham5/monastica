import { useMemo } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useLifeModel } from '../store/lifeModel';
import type { BookingProposal } from '../store/types';

/**
 * Returns sorted pending proposals by urgency score.
 * Trigger conditions checked against the life model:
 *   - Goal drift: actual < 60% of target
 *   - Relationship overdue: 1.5x target frequency
 *   - Recovery: 3h+ meeting block without buffer
 *   - Serendipity: 14+ days without unstructured slot
 *   - Body: 6+ weeks since last appointment booking
 */
export function useCultivatorProposals() {
  const { cultivator, acceptProposal, deferProposal, dismissProposal } = useAgentStore();

  const proposals = useMemo(
    () =>
      [...cultivator.pendingProposals]
        .filter((p) => p.status === 'pending')
        .sort((a, b) => b.urgencyScore - a.urgencyScore),
    [cultivator.pendingProposals],
  );

  const topProposal = proposals.length > 0 ? proposals[0] : null;

  return {
    proposals,
    topProposal,
    acceptProposal,
    deferProposal,
    dismissProposal,
  };
}

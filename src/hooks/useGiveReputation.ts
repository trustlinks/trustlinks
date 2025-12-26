import { useNostrPublish } from './useNostrPublish';
import type { UnsignedEvent } from '@nostrify/nostrify';

export interface GiveReputationParams {
  targetPubkey: string;
  rating: number;
  context?: string;
  tag?: string;
  comment?: string;
}

export function useGiveReputation() {
  const { mutate: createEvent, ...rest } = useNostrPublish();

  const giveReputation = (params: GiveReputationParams) => {
    const { targetPubkey, rating, context, tag, comment } = params;

    if (rating !== 0 && rating !== 1) {
      throw new Error('Rating must be either 0 (not real) or 1 (real)');
    }

    const tags: string[][] = [
      ['p', targetPubkey],
      ['rating', rating.toString()]
    ];

    if (tag) {
      tags.push(['t', tag]);
    }

    if (context) {
      tags.push(['context', context]);
    }

    const event: UnsignedEvent = {
      kind: 4101,
      content: comment || '',
      tags,
      created_at: Math.floor(Date.now() / 1000),
    };

    createEvent(event);
  };

  return {
    giveReputation,
    ...rest
  };
}

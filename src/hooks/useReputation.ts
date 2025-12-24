import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ReputationEvent extends NostrEvent {
  kind: 4101;
}

function validateReputationEvent(event: NostrEvent): event is ReputationEvent {
  if (event.kind !== 4101) return false;

  const pTag = event.tags.find(([name]) => name === 'p')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];

  if (!pTag || !rating) return false;

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < -1 || ratingNum > 5) return false;

  return true;
}

export function useReputation(pubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputation', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{ 
          kinds: [4101],
          '#p': [pubkey],
          limit: 200
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useMyReputation(targetPubkey: string, myPubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['my-reputation', targetPubkey, myPubkey],
    queryFn: async (c) => {
      if (!myPubkey) return null;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      
      const events = await nostr.query(
        [{ 
          kinds: [4101],
          authors: [myPubkey],
          '#p': [targetPubkey],
          limit: 1
        }],
        { signal }
      );

      const validEvents = events.filter(validateReputationEvent);
      return validEvents[0] || null;
    },
    enabled: !!myPubkey,
    staleTime: 30000,
  });
}

export function useTrustedReputation(targetPubkey: string, trustedPubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['trusted-reputation', targetPubkey, trustedPubkeys],
    queryFn: async (c) => {
      if (trustedPubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{ 
          kinds: [4101],
          authors: trustedPubkeys,
          '#p': [targetPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: trustedPubkeys.length > 0,
    staleTime: 30000,
  });
}

export function useReputationGivenBy(authorPubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputation-given-by', authorPubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{ 
          kinds: [4101],
          authors: [authorPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    staleTime: 60000,
  });
}

export interface ReputationStats {
  total: number;
  average: number;
  distribution: Record<number, number>;
  myRating?: number;
  trustedAverage?: number;
  trustedCount: number;
}

export function calculateReputationStats(
  allReputations: ReputationEvent[],
  myReputation?: ReputationEvent | null,
  trustedReputations?: ReputationEvent[]
): ReputationStats {
  const distribution: Record<number, number> = {
    '-1': 0, '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
  };

  let total = 0;
  let sum = 0;

  allReputations.forEach(event => {
    const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
    distribution[rating] = (distribution[rating] || 0) + 1;
    sum += rating;
    total++;
  });

  const average = total > 0 ? sum / total : 0;

  let myRating: number | undefined;
  if (myReputation) {
    myRating = parseInt(myReputation.tags.find(([name]) => name === 'rating')?.[1] || '0');
  }

  let trustedAverage: number | undefined;
  let trustedCount = 0;
  if (trustedReputations && trustedReputations.length > 0) {
    let trustedSum = 0;
    trustedReputations.forEach(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      trustedSum += rating;
      trustedCount++;
    });
    trustedAverage = trustedCount > 0 ? trustedSum / trustedCount : undefined;
  }

  return {
    total,
    average,
    distribution,
    myRating,
    trustedAverage,
    trustedCount
  };
}

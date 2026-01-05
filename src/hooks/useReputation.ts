import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ReputationEvent extends NostrEvent {
  kind: 4101 | 4102; // 4101 = public, 4102 = private
}

export interface PrivateReputationData {
  proof: string;
  merkleRoot: string;
  nullifierHash: string;
  isPrivate: true;
}

function validateReputationEvent(event: NostrEvent): event is ReputationEvent {
  // Support both public (4101) and private (4102) verifications
  if (event.kind !== 4101 && event.kind !== 4102) return false;

  const pTag = event.tags.find(([name]) => name === 'p')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];

  if (!pTag) return false;

  // For public verifications (4101), rating is required
  if (event.kind === 4101) {
    if (!rating) return false;
    // Rating must be either "1" (real) or "0" (not real)
    if (rating !== '0' && rating !== '1') return false;
  }

  // For private verifications (4102), proof is required
  if (event.kind === 4102) {
    const proofTag = event.tags.find(([name]) => name === 'proof')?.[1];
    if (!proofTag) return false;
  }

  return true;
}

export function useReputation(pubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputation', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query both public (4101) and private (4102) verifications
      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          '#p': [pubkey],
          limit: 200
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: !!pubkey,
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

      // Query both public and private verifications
      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: [myPubkey],
          '#p': [targetPubkey],
          limit: 2 // May have both public and private
        }],
        { signal }
      );

      const validEvents = events.filter(validateReputationEvent);
      // Prefer public over private for display
      return validEvents.find(e => e.kind === 4101) || validEvents[0] || null;
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
          kinds: [4101, 4102],
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

export function useSecondDegreeReputation(targetPubkey: string, secondDegreePubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['second-degree-reputation', targetPubkey, secondDegreePubkeys],
    queryFn: async (c) => {
      if (secondDegreePubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: secondDegreePubkeys,
          '#p': [targetPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: secondDegreePubkeys.length > 0,
    staleTime: 30000,
  });
}

export function useThirdDegreeReputation(targetPubkey: string, thirdDegreePubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['third-degree-reputation', targetPubkey, thirdDegreePubkeys],
    queryFn: async (c) => {
      if (thirdDegreePubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: thirdDegreePubkeys,
          '#p': [targetPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: thirdDegreePubkeys.length > 0,
    staleTime: 30000,
  });
}

export function useFourthDegreeReputation(targetPubkey: string, fourthDegreePubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['fourth-degree-reputation', targetPubkey, fourthDegreePubkeys],
    queryFn: async (c) => {
      if (fourthDegreePubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: fourthDegreePubkeys,
          '#p': [targetPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: fourthDegreePubkeys.length > 0,
    staleTime: 30000,
  });
}

export function useReputationGivenBy(authorPubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputation-given-by', authorPubkey],
    queryFn: async (c) => {
      if (!authorPubkey) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: [authorPubkey],
          limit: 100
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: !!authorPubkey,
    staleTime: 60000,
  });
}

export function useReputationsGivenByMultiple(authorPubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputations-given-by-multiple', authorPubkeys],
    queryFn: async (c) => {
      if (authorPubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query(
        [{
          kinds: [4101, 4102],
          authors: authorPubkeys,
          limit: 500
        }],
        { signal }
      );

      return events.filter(validateReputationEvent);
    },
    enabled: authorPubkeys.length > 0,
    staleTime: 60000,
  });
}

export interface ReputationStats {
  total: number;
  realCount: number;
  notRealCount: number;
  privateCount: number;
  myRating?: number;
  myIsPrivate?: boolean;
  trustedRealCount: number;
  trustedNotRealCount: number;
  trustedPrivateCount: number;
  secondDegreeRealCount: number;
  secondDegreeNotRealCount: number;
  secondDegreePrivateCount: number;
  thirdDegreeRealCount: number;
  thirdDegreeNotRealCount: number;
  thirdDegreePrivateCount: number;
  fourthDegreeRealCount: number;
  fourthDegreeNotRealCount: number;
  fourthDegreePrivateCount: number;
}

export function calculateReputationStats(
  allReputations: ReputationEvent[],
  myReputation?: ReputationEvent | null,
  trustedReputations?: ReputationEvent[],
  secondDegreeReputations?: ReputationEvent[],
  thirdDegreeReputations?: ReputationEvent[],
  fourthDegreeReputations?: ReputationEvent[]
): ReputationStats {
  let total = 0;
  let realCount = 0;
  let notRealCount = 0;
  let privateCount = 0;

  allReputations.forEach(event => {
    total++;

    if (event.kind === 4102) {
      // Private verification - we can't know if it's real or not
      privateCount++;
    } else {
      // Public verification
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      if (rating === 1) {
        realCount++;
      } else {
        notRealCount++;
      }
    }
  });

  let myRating: number | undefined;
  let myIsPrivate: boolean | undefined;
  if (myReputation) {
    myIsPrivate = myReputation.kind === 4102;
    if (!myIsPrivate) {
      myRating = parseInt(myReputation.tags.find(([name]) => name === 'rating')?.[1] || '0');
    }
  }

  let trustedRealCount = 0;
  let trustedNotRealCount = 0;
  let trustedPrivateCount = 0;
  if (trustedReputations && trustedReputations.length > 0) {
    trustedReputations.forEach(event => {
      if (event.kind === 4102) {
        trustedPrivateCount++;
      } else if (event.kind === 4101) {
        const ratingTag = event.tags.find(([name]) => name === 'rating');
        if (ratingTag && ratingTag[1]) {
          const rating = parseInt(ratingTag[1]);
          if (rating === 1) {
            trustedRealCount++;
          } else {
            trustedNotRealCount++;
          }
        }
      }
    });
  }

  let secondDegreeRealCount = 0;
  let secondDegreeNotRealCount = 0;
  let secondDegreePrivateCount = 0;
  if (secondDegreeReputations && secondDegreeReputations.length > 0) {
    secondDegreeReputations.forEach(event => {
      if (event.kind === 4102) {
        secondDegreePrivateCount++;
      } else if (event.kind === 4101) {
        const ratingTag = event.tags.find(([name]) => name === 'rating');
        if (ratingTag && ratingTag[1]) {
          const rating = parseInt(ratingTag[1]);
          if (rating === 1) {
            secondDegreeRealCount++;
          } else {
            secondDegreeNotRealCount++;
          }
        }
      }
    });
  }

  let thirdDegreeRealCount = 0;
  let thirdDegreeNotRealCount = 0;
  let thirdDegreePrivateCount = 0;
  if (thirdDegreeReputations && thirdDegreeReputations.length > 0) {
    thirdDegreeReputations.forEach(event => {
      if (event.kind === 4102) {
        thirdDegreePrivateCount++;
      } else if (event.kind === 4101) {
        const ratingTag = event.tags.find(([name]) => name === 'rating');
        if (ratingTag && ratingTag[1]) {
          const rating = parseInt(ratingTag[1]);
          if (rating === 1) {
            thirdDegreeRealCount++;
          } else {
            thirdDegreeNotRealCount++;
          }
        }
      }
    });
  }

  let fourthDegreeRealCount = 0;
  let fourthDegreeNotRealCount = 0;
  let fourthDegreePrivateCount = 0;
  if (fourthDegreeReputations && fourthDegreeReputations.length > 0) {
    fourthDegreeReputations.forEach(event => {
      if (event.kind === 4102) {
        fourthDegreePrivateCount++;
      } else if (event.kind === 4101) {
        const ratingTag = event.tags.find(([name]) => name === 'rating');
        if (ratingTag && ratingTag[1]) {
          const rating = parseInt(ratingTag[1]);
          if (rating === 1) {
            fourthDegreeRealCount++;
          } else {
            fourthDegreeNotRealCount++;
          }
        }
      }
    });
  }

  return {
    total,
    realCount,
    notRealCount,
    privateCount,
    myRating,
    myIsPrivate,
    trustedRealCount,
    trustedNotRealCount,
    trustedPrivateCount,
    secondDegreeRealCount,
    secondDegreeNotRealCount,
    secondDegreePrivateCount,
    thirdDegreeRealCount,
    thirdDegreeNotRealCount,
    thirdDegreePrivateCount,
    fourthDegreeRealCount,
    fourthDegreeNotRealCount,
    fourthDegreePrivateCount,
  };
}

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

  // Rating must be either "1" (real) or "0" (not real)
  if (rating !== '0' && rating !== '1') return false;

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

export function useSecondDegreeReputation(targetPubkey: string, secondDegreePubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['second-degree-reputation', targetPubkey, secondDegreePubkeys],
    queryFn: async (c) => {
      if (secondDegreePubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [4101],
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
          kinds: [4101],
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
          kinds: [4101],
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

export function useReputationsGivenByMultiple(authorPubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reputations-given-by-multiple', authorPubkeys],
    queryFn: async (c) => {
      if (authorPubkeys.length === 0) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query(
        [{
          kinds: [4101],
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
  myRating?: number;
  trustedRealCount: number;
  trustedNotRealCount: number;
  secondDegreeRealCount: number;
  secondDegreeNotRealCount: number;
  thirdDegreeRealCount: number;
  thirdDegreeNotRealCount: number;
  fourthDegreeRealCount: number;
  fourthDegreeNotRealCount: number;
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

  allReputations.forEach(event => {
    const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
    total++;
    if (rating === 1) {
      realCount++;
    } else {
      notRealCount++;
    }
  });

  let myRating: number | undefined;
  if (myReputation) {
    myRating = parseInt(myReputation.tags.find(([name]) => name === 'rating')?.[1] || '0');
  }

  let trustedRealCount = 0;
  let trustedNotRealCount = 0;
  if (trustedReputations && trustedReputations.length > 0) {
    trustedReputations.forEach(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      if (rating === 1) {
        trustedRealCount++;
      } else {
        trustedNotRealCount++;
      }
    });
  }

  let secondDegreeRealCount = 0;
  let secondDegreeNotRealCount = 0;
  if (secondDegreeReputations && secondDegreeReputations.length > 0) {
    secondDegreeReputations.forEach(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      if (rating === 1) {
        secondDegreeRealCount++;
      } else {
        secondDegreeNotRealCount++;
      }
    });
  }

  let thirdDegreeRealCount = 0;
  let thirdDegreeNotRealCount = 0;
  if (thirdDegreeReputations && thirdDegreeReputations.length > 0) {
    thirdDegreeReputations.forEach(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      if (rating === 1) {
        thirdDegreeRealCount++;
      } else {
        thirdDegreeNotRealCount++;
      }
    });
  }

  let fourthDegreeRealCount = 0;
  let fourthDegreeNotRealCount = 0;
  if (fourthDegreeReputations && fourthDegreeReputations.length > 0) {
    fourthDegreeReputations.forEach(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      if (rating === 1) {
        fourthDegreeRealCount++;
      } else {
        fourthDegreeNotRealCount++;
      }
    });
  }

  return {
    total,
    realCount,
    notRealCount,
    myRating,
    trustedRealCount,
    trustedNotRealCount,
    secondDegreeRealCount,
    secondDegreeNotRealCount,
    thirdDegreeRealCount,
    thirdDegreeNotRealCount,
    fourthDegreeRealCount,
    fourthDegreeNotRealCount,
  };
}

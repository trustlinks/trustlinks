import { useNostrPublish } from './useNostrPublish';
import { useCurrentUser } from './useCurrentUser';
import type { UnsignedEvent } from '@nostrify/nostrify';
import { generatePrivateVerificationProof, getGroupRoot } from '@/lib/semaphore';
import { useState } from 'react';

export interface GiveReputationParams {
  targetPubkey: string;
  rating: number;
  context?: string;
  tag?: string;
  comment?: string;
  isPrivate?: boolean;
  verifiedPubkeys?: string[]; // Required for private verifications
}

export function useGiveReputation() {
  const { mutate: createEvent, isPending: isPublishing, ...rest } = useNostrPublish();
  const { user } = useCurrentUser();
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  const giveReputation = async (params: GiveReputationParams) => {
    const { targetPubkey, rating, context, tag, comment, isPrivate, verifiedPubkeys } = params;

    if (rating !== 0 && rating !== 1) {
      throw new Error('Rating must be either 0 (not real) or 1 (real)');
    }

    // Private verification
    if (isPrivate) {
      if (!user?.signer) {
        throw new Error('User must be logged in to create private verifications');
      }

      if (!verifiedPubkeys || verifiedPubkeys.length === 0) {
        throw new Error('Cannot create private verification: no verified connections in your network');
      }

      try {
        setIsGeneratingProof(true);

        // For ZK-proof, we use the user's pubkey as deterministic seed
        // This ensures same Semaphore identity across sessions
        const userPubkey = user.pubkey;

        // Generate ZK proof
        const proof = await generatePrivateVerificationProof(
          userPubkey,
          targetPubkey,
          verifiedPubkeys
        );

        // Get merkle root for verification
        const merkleRoot = getGroupRoot(verifiedPubkeys);

        const tags: string[][] = [
          ['p', targetPubkey],
          ['proof', JSON.stringify(proof)],
          ['merkle_root', merkleRoot.toString()],
        ];

        if (tag) {
          tags.push(['t', tag]);
        }

        if (context) {
          tags.push(['context', context]);
        }

        const event: UnsignedEvent = {
          kind: 4102, // Private verification
          content: comment || '',
          tags,
          created_at: Math.floor(Date.now() / 1000),
        };

        createEvent(event);
      } catch (error) {
        console.error('Failed to generate private verification:', error);
        throw new Error('Failed to generate private verification proof');
      } finally {
        setIsGeneratingProof(false);
      }
    } else {
      // Public verification
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
        kind: 4101, // Public verification
        content: comment || '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      createEvent(event);
    }
  };

  return {
    giveReputation,
    isPending: isPublishing || isGeneratingProof,
    isGeneratingProof,
    ...rest
  };
}

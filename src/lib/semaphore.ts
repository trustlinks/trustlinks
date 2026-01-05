import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';

export type SemaphoreProof = {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  points: string[];
};

// Group ID for TrustLinks network
export const TRUSTLINKS_GROUP_ID = 'trustlinks-verification-network';

// External nullifier to prevent double-verification
export const VERIFICATION_NULLIFIER = 'trustlinks-verify-v1';

/**
 * Generate or retrieve Semaphore identity
 */
export function getSemaphoreIdentity(seed: string): Identity {
  try {
    // Use seed (pubkey) for deterministic identity generation
    // This ensures same identity across sessions
    const identity = new Identity(seed);
    return identity;
  } catch (error) {
    console.error('Failed to create Semaphore identity:', error);
    throw new Error('Failed to initialize cryptographic identity');
  }
}

/**
 * Create a group from verified pubkeys
 * This is used to build the merkle tree for ZK proofs
 */
export function createVerificationGroup(verifiedPubkeys: string[]): Group {
  try {
    const group = new Group();

    // Add each verified pubkey's commitment to the group
    verifiedPubkeys.forEach(pubkey => {
      // Create deterministic identity from pubkey for commitment
      const identity = new Identity(pubkey);
      group.addMember(identity.commitment);
    });

    return group;
  } catch (error) {
    console.error('Failed to create verification group:', error);
    throw new Error('Failed to create cryptographic group');
  }
}

/**
 * Generate a private verification proof
 */
export async function generatePrivateVerificationProof(
  userPubkey: string,
  targetPubkey: string,
  verifiedPubkeys: string[]
): Promise<SemaphoreProof> {
  try {
    // Get user's Semaphore identity (using pubkey as seed)
    const identity = getSemaphoreIdentity(userPubkey);

    // Create group from verified pubkeys
    const group = createVerificationGroup(verifiedPubkeys);

    // The signal is what we're proving (target pubkey)
    const signal = targetPubkey;

    // Generate proof - this can take 3-5 seconds
    const proof = await generateProof(identity, group, signal, VERIFICATION_NULLIFIER);

    return proof;
  } catch (error) {
    console.error('Semaphore proof generation error:', error);
    throw new Error('Failed to generate ZK-proof. This may be due to browser compatibility or missing dependencies.');
  }
}

/**
 * Verify a private verification proof
 */
export async function verifyPrivateVerificationProof(
  proof: SemaphoreProof,
  targetPubkey: string,
  groupRoot: bigint
): Promise<boolean> {
  try {
    await verifyProof(proof, groupRoot);

    // Verify the signal matches the target pubkey
    if (proof.signal !== targetPubkey) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Proof verification failed:', error);
    return false;
  }
}

/**
 * Get group merkle root for a set of pubkeys
 */
export function getGroupRoot(verifiedPubkeys: string[]): bigint {
  const group = createVerificationGroup(verifiedPubkeys);
  return group.root;
}

/**
 * Check if user can generate private proofs
 * (requires at least 1 verified connection)
 */
export function canGeneratePrivateProof(verifiedPubkeys: string[]): boolean {
  return verifiedPubkeys.length > 0;
}

import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import type { SemaphoreProof } from '@semaphore-protocol/proof';

// Group ID for TrustLinks network
export const TRUSTLINKS_GROUP_ID = 'trustlinks-verification-network';

// External nullifier to prevent double-verification
export const VERIFICATION_NULLIFIER = 'trustlinks-verify-v1';

/**
 * Generate or retrieve Semaphore identity from localStorage
 */
export function getSemaphoreIdentity(nostrPrivkey: string): Identity {
  // Use Nostr privkey as seed for deterministic identity generation
  // This ensures same identity across sessions
  const identity = new Identity(nostrPrivkey);
  return identity;
}

/**
 * Create a group from verified pubkeys
 * This is used to build the merkle tree for ZK proofs
 */
export function createVerificationGroup(verifiedPubkeys: string[]): Group {
  const group = new Group();
  
  // Add each verified pubkey's commitment to the group
  verifiedPubkeys.forEach(pubkey => {
    // Create deterministic identity from pubkey for commitment
    const identity = new Identity(pubkey);
    group.addMember(identity.commitment);
  });
  
  return group;
}

/**
 * Generate a private verification proof
 */
export async function generatePrivateVerificationProof(
  userPrivkey: string,
  targetPubkey: string,
  verifiedPubkeys: string[]
): Promise<SemaphoreProof> {
  // Get user's Semaphore identity
  const identity = getSemaphoreIdentity(userPrivkey);
  
  // Create group from verified pubkeys
  const group = createVerificationGroup(verifiedPubkeys);
  
  // The signal is what we're proving (target pubkey)
  const signal = targetPubkey;
  
  // Generate proof
  const proof = await generateProof(identity, group, signal, VERIFICATION_NULLIFIER);
  
  return proof;
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

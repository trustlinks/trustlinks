// Lazy import Semaphore to avoid loading WASM when not needed
// This prevents CSP errors in environments that block WebAssembly

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
 * Check if WebAssembly is supported
 */
export function isWasmSupported(): boolean {
  try {
    return typeof WebAssembly !== 'undefined' && typeof WebAssembly.compile === 'function';
  } catch {
    return false;
  }
}

/**
 * Generate or retrieve Semaphore identity
 */
async function getSemaphoreIdentity(seed: string) {
  const { Identity } = await import('@semaphore-protocol/identity');
  try {
    const identity = new Identity(seed);
    return identity;
  } catch (error) {
    console.error('Failed to create Semaphore identity:', error);
    throw new Error('Failed to initialize cryptographic identity');
  }
}

/**
 * Create a group from verified pubkeys
 */
async function createVerificationGroup(verifiedPubkeys: string[]) {
  const { Group } = await import('@semaphore-protocol/group');
  const { Identity } = await import('@semaphore-protocol/identity');
  
  try {
    const group = new Group();
    
    for (const pubkey of verifiedPubkeys) {
      const identity = new Identity(pubkey);
      group.addMember(identity.commitment);
    }
    
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
  if (!isWasmSupported()) {
    throw new Error('WebAssembly is not supported or blocked by Content Security Policy');
  }

  try {
    const { generateProof } = await import('@semaphore-protocol/proof');
    
    // Get user's Semaphore identity (using pubkey as seed)
    const identity = await getSemaphoreIdentity(userPubkey);
    
    // Create group from verified pubkeys
    const group = await createVerificationGroup(verifiedPubkeys);
    
    // The signal is what we're proving (target pubkey)
    const signal = targetPubkey;
    
    // Generate proof - this can take 3-5 seconds
    const proof = await generateProof(identity, group, signal, VERIFICATION_NULLIFIER);
    
    return proof as SemaphoreProof;
  } catch (error) {
    console.error('Semaphore proof generation error:', error);
    throw new Error('Failed to generate ZK-proof. This may be due to browser compatibility or CSP restrictions.');
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
  if (!isWasmSupported()) {
    return false;
  }

  try {
    const { verifyProof } = await import('@semaphore-protocol/proof');
    
    await verifyProof(proof, groupRoot);
    
    // Verify the signal matches the target pubkey
    if (proof.message !== targetPubkey) {
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
export async function getGroupRoot(verifiedPubkeys: string[]): Promise<bigint> {
  const group = await createVerificationGroup(verifiedPubkeys);
  return group.root;
}

/**
 * Check if user can generate private proofs
 * (requires at least 1 verified connection AND WASM support)
 */
export function canGeneratePrivateProof(verifiedPubkeys: string[]): boolean {
  return verifiedPubkeys.length > 0 && isWasmSupported();
}

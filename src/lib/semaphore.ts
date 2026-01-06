// Lazy import Semaphore to avoid loading WASM when not needed

export type SemaphoreProof = {
  merkleTreeDepth: number;
  merkleTreeRoot: string;
  nullifier: string;
  message: string;
  points: string[];
};

export const TRUSTLINKS_GROUP_ID = 'trustlinks-verification-network';
export const VERIFICATION_NULLIFIER = 'trustlinks-verify-v1';

export function isWasmSupported(): boolean {
  try {
    return typeof WebAssembly !== 'undefined' && typeof WebAssembly.compile === 'function';
  } catch {
    return false;
  }
}

async function getSemaphoreIdentity(seed: string) {
  const { Identity } = await import('@semaphore-protocol/identity');
  return new Identity(seed);
}

async function createVerificationGroup(verifiedPubkeys: string[]) {
  const { Group } = await import('@semaphore-protocol/group');
  const { Identity } = await import('@semaphore-protocol/identity');
  
  const group = new Group();
  for (const pubkey of verifiedPubkeys) {
    const identity = new Identity(pubkey);
    group.addMember(identity.commitment);
  }
  return group;
}

export async function generatePrivateVerificationProof(
  userPubkey: string,
  targetPubkey: string,
  verifiedPubkeys: string[]
): Promise<SemaphoreProof> {
  if (!isWasmSupported()) {
    throw new Error('WebAssembly not supported');
  }

  const { generateProof } = await import('@semaphore-protocol/proof');
  const identity = await getSemaphoreIdentity(userPubkey);
  const group = await createVerificationGroup(verifiedPubkeys);
  const proof = await generateProof(identity, group, targetPubkey, VERIFICATION_NULLIFIER);
  return proof as SemaphoreProof;
}

export async function verifyPrivateVerificationProof(
  proof: SemaphoreProof,
  targetPubkey: string,
  groupRoot: bigint
): Promise<boolean> {
  if (!isWasmSupported()) return false;
  
  const { verifyProof } = await import('@semaphore-protocol/proof');
  await verifyProof(proof, groupRoot);
  return proof.message === targetPubkey;
}

export async function getGroupRoot(verifiedPubkeys: string[]): Promise<bigint> {
  const group = await createVerificationGroup(verifiedPubkeys);
  return group.root;
}

export function canGeneratePrivateProof(verifiedPubkeys: string[]): boolean {
  return verifiedPubkeys.length > 0 && isWasmSupported();
}

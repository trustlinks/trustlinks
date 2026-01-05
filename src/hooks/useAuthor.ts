import { type NostrEvent, type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export function useAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<{ event?: NostrEvent; metadata?: NostrMetadata }>({
    queryKey: ['author', pubkey ?? ''],
    queryFn: async ({ signal }) => {
      if (!pubkey || pubkey.length === 0) {
        return {};
      }

      try {
        const [event] = await nostr.query(
          [{ kinds: [0], authors: [pubkey!], limit: 1 }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]) },
        );

        if (!event) {
          return {}; // Return empty object instead of throwing
        }

        try {
          const metadata = n.json().pipe(n.metadata()).parse(event.content);
          return { metadata, event };
        } catch {
          return { event };
        }
      } catch (error) {
        console.warn('Failed to fetch author metadata:', error);
        return {};
      }
    },
    enabled: !!pubkey && pubkey.length > 0,
    staleTime: 5 * 60 * 1000, // Keep cached data fresh for 5 minutes
    retry: 1,
    throwOnError: false,
  });
}

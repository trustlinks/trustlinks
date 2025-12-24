import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import NotFound from './NotFound';
import { UserProfileCard } from '@/components/reputation/UserProfileCard';
import { LoginArea } from "@/components/auth/LoginArea";

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  useSeoMeta({
    title: 'Profile - Nostr Live Reputation',
    description: 'View user reputation and profile on Nostr',
  });

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
      return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profil użytkownika
                </h1>
                <LoginArea className="max-w-60" />
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <UserProfileCard pubkey={data} showGiveReputationButton />
            </div>
          </div>
        </div>
      );

    case 'nprofile':
      return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profil użytkownika
                </h1>
                <LoginArea className="max-w-60" />
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <UserProfileCard pubkey={data.pubkey} showGiveReputationButton />
            </div>
          </div>
        </div>
      );

    case 'note':
    case 'nevent':
    case 'naddr':
      return <NotFound />;

    default:
      return <NotFound />;
  }
}
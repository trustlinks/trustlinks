import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthor } from "@/hooks/useAuthor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReputation, useMyReputation, useTrustedReputation, calculateReputationStats, useReputationGivenBy } from "@/hooks/useReputation";
import { genUserName } from "@/lib/genUserName";
import { GiveReputationDialog } from "./GiveReputationDialog";
import { Star, Users, TrendingUp, User } from "lucide-react";
import { nip19 } from "nostr-tools";

interface UserProfileCardProps {
  pubkey: string;
  showGiveReputationButton?: boolean;
}

export function UserProfileCard({ pubkey, showGiveReputationButton = false }: UserProfileCardProps) {
  const { user } = useCurrentUser();
  const author = useAuthor(pubkey);
  const { data: allReputations, isLoading: isLoadingAll } = useReputation(pubkey);
  const { data: myReputation } = useMyReputation(pubkey, user?.pubkey);
  
  const { data: myGivenReputations } = useReputationGivenBy(user?.pubkey || '');
  const trustedPubkeys = (myGivenReputations || [])
    .filter(event => {
      const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
      return rating >= 4;
    })
    .map(event => event.tags.find(([name]) => name === 'p')?.[1])
    .filter((pk): pk is string => !!pk);

  const { data: trustedReputations } = useTrustedReputation(pubkey, trustedPubkeys);

  const metadata = author.data?.metadata;
  const displayName = metadata?.name || metadata?.display_name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const about = metadata?.about;

  const stats = calculateReputationStats(
    allReputations || [],
    myReputation,
    trustedReputations
  );

  const npub = nip19.npubEncode(pubkey);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.max(0, Math.floor(rating));
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  if (author.isLoading || isLoadingAll) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-800">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate font-mono">
              {npub.slice(0, 16)}...{npub.slice(-8)}
            </p>
            {about && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {about}
              </p>
            )}
          </div>

          {showGiveReputationButton && user && user.pubkey !== pubkey && (
            <GiveReputationDialog targetPubkey={pubkey} currentRating={stats.myRating} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* My Rating */}
        {stats.myRating !== undefined && (
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Star className="h-4 w-4 fill-purple-600 text-purple-600" />
                Twoja ocena
              </span>
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                {stats.myRating}/5
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.myRating)}
            </div>
          </div>
        )}

        {/* Trusted Network Rating */}
        {stats.trustedAverage !== undefined && stats.trustedCount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Twoja sieć zaufania
              </span>
              <Badge variant="outline" className="border-blue-600 text-blue-900 dark:text-blue-100">
                {stats.trustedAverage.toFixed(1)}/5 ({stats.trustedCount})
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.trustedAverage)}
            </div>
          </div>
        )}

        {/* Overall Rating */}
        {stats.total > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                Ogólna reputacja
              </span>
              <Badge variant="outline">
                {stats.average.toFixed(1)}/5 ({stats.total})
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.average)}
            </div>
          </div>
        )}

        {stats.total === 0 && stats.myRating === undefined && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Brak reputacji dla tego użytkownika</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthor } from "@/hooks/useAuthor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReputation, useMyReputation, useTrustedReputation, useSecondDegreeReputation, calculateReputationStats, useReputationGivenBy, useReputationsGivenByMultiple } from "@/hooks/useReputation";
import { genUserName } from "@/lib/genUserName";
import { GiveReputationDialog } from "./GiveReputationDialog";
import { Star, Users, TrendingUp, User, Network, ThumbsUp } from "lucide-react";
import { nip19 } from "nostr-tools";
import { useMemo } from "react";

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

  // Level 1: People I directly verified as real (rating >= 4)
  const trustedPubkeys = useMemo(() => {
    return (myGivenReputations || [])
      .filter(event => {
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating >= 4;
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk);
  }, [myGivenReputations]);

  const { data: trustedReputations } = useTrustedReputation(pubkey, trustedPubkeys);

  // Level 2: Get reputations given by my trusted network to find second-degree connections
  const { data: trustedNetworkReputations } = useReputationsGivenByMultiple(trustedPubkeys);

  const secondDegreePubkeys = useMemo(() => {
    if (!trustedNetworkReputations) return [];

    return trustedNetworkReputations
      .filter(event => {
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating >= 4;
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk && !trustedPubkeys.includes(pk) && pk !== user?.pubkey);
  }, [trustedNetworkReputations, trustedPubkeys, user?.pubkey]);

  const { data: secondDegreeReputations } = useSecondDegreeReputation(pubkey, secondDegreePubkeys);

  const metadata = author.data?.metadata;
  const displayName = metadata?.name || metadata?.display_name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const about = metadata?.about;

  const stats = calculateReputationStats(
    allReputations || [],
    myReputation,
    trustedReputations,
    secondDegreeReputations
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

      <CardContent className="space-y-3">
        {/* Level 1: My Rating */}
        {stats.myRating !== undefined && (
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-purple-600 text-purple-600" />
                  Twoja ocena realności
                </span>
              </div>
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                {stats.myRating}/5
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.myRating)}
            </div>
          </div>
        )}

        {/* Level 2: Direct Trust Network */}
        {stats.trustedAverage !== undefined && stats.trustedCount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Osoby przez Ciebie zweryfikowane
                </span>
              </div>
              <Badge variant="outline" className="border-blue-600 text-blue-900 dark:text-blue-100">
                {stats.trustedAverage.toFixed(1)}/5 ({stats.trustedCount})
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.trustedAverage)}
            </div>
          </div>
        )}

        {/* Level 3: Second Degree Network */}
        {stats.secondDegreeAverage !== undefined && stats.secondDegreeCount > 0 && (
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <Network className="h-4 w-4 text-green-600" />
                  Sieć drugiego stopnia
                </span>
              </div>
              <Badge variant="outline" className="border-green-600 text-green-900 dark:text-green-100">
                {stats.secondDegreeAverage.toFixed(1)}/5 ({stats.secondDegreeCount})
              </Badge>
            </div>
            <div className="flex gap-1">
              {renderStars(stats.secondDegreeAverage)}
            </div>
          </div>
        )}

        {/* Level 4: Total Positive Ratings */}
        {stats.positiveCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-amber-600" />
                  Łączna liczba pozytywnych ocen
                </span>
              </div>
              <Badge variant="outline" className="border-amber-600 text-amber-900 dark:text-amber-100">
                {stats.positiveCount} ocen (≥4/5)
              </Badge>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Średnia ze wszystkich: {stats.average.toFixed(1)}/5 ({stats.total} ocen)
            </p>
          </div>
        )}

        {stats.total === 0 && stats.myRating === undefined && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Brak reputacji dla tego użytkownika</p>
            <p className="text-xs mt-1">Bądź pierwszą osobą, która go zweryfikuje!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

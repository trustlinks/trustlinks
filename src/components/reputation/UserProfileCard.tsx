import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthor } from "@/hooks/useAuthor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReputation, useMyReputation, useTrustedReputation, useSecondDegreeReputation, useThirdDegreeReputation, useFourthDegreeReputation, calculateReputationStats, useReputationGivenBy, useReputationsGivenByMultiple } from "@/hooks/useReputation";
import { genUserName } from "@/lib/genUserName";
import { GiveReputationDialog } from "./GiveReputationDialog";
import { Star, Users, TrendingUp, User, Network, ThumbsUp, EyeOff } from "lucide-react";
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

  // Level 1: People I directly verified as real (rating === 1)
  const trustedPubkeys = useMemo(() => {
    return (myGivenReputations || [])
      .filter(event => {
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating === 1; // Only "real" ratings
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
        return rating === 1; // Only "real" ratings
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk && !trustedPubkeys.includes(pk) && pk !== user?.pubkey);
  }, [trustedNetworkReputations, trustedPubkeys, user?.pubkey]);

  const { data: secondDegreeReputations } = useSecondDegreeReputation(pubkey, secondDegreePubkeys);

  // Level 3: Get reputations from second degree network to find third-degree connections
  const { data: secondDegreeNetworkReputations } = useReputationsGivenByMultiple(secondDegreePubkeys);

  const thirdDegreePubkeys = useMemo(() => {
    if (!secondDegreeNetworkReputations) return [];

    const allPreviousPubkeys = [...trustedPubkeys, ...secondDegreePubkeys];

    return secondDegreeNetworkReputations
      .filter(event => {
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating === 1; // Only "real" ratings
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk && !allPreviousPubkeys.includes(pk) && pk !== user?.pubkey);
  }, [secondDegreeNetworkReputations, trustedPubkeys, secondDegreePubkeys, user?.pubkey]);

  const { data: thirdDegreeReputations } = useThirdDegreeReputation(pubkey, thirdDegreePubkeys);

  // Level 4: Get reputations from third degree network to find fourth-degree connections
  const { data: thirdDegreeNetworkReputations } = useReputationsGivenByMultiple(thirdDegreePubkeys);

  const fourthDegreePubkeys = useMemo(() => {
    if (!thirdDegreeNetworkReputations) return [];

    const allPreviousPubkeys = [...trustedPubkeys, ...secondDegreePubkeys, ...thirdDegreePubkeys];

    return thirdDegreeNetworkReputations
      .filter(event => {
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating === 1; // Only "real" ratings
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk && !allPreviousPubkeys.includes(pk) && pk !== user?.pubkey);
  }, [thirdDegreeNetworkReputations, trustedPubkeys, secondDegreePubkeys, thirdDegreePubkeys, user?.pubkey]);

  const { data: fourthDegreeReputations } = useFourthDegreeReputation(pubkey, fourthDegreePubkeys);

  const metadata = author.data?.metadata;
  const displayName = metadata?.name || metadata?.display_name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const about = metadata?.about;

  const stats = calculateReputationStats(
    allReputations || [],
    myReputation,
    trustedReputations,
    secondDegreeReputations,
    thirdDegreeReputations,
    fourthDegreeReputations
  );

  const npub = nip19.npubEncode(pubkey);

  const renderVerificationBadge = (isReal: boolean) => {
    return isReal ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        ✓ Realny
      </Badge>
    ) : (
      <Badge variant="destructive">
        ✗ Nierealny
      </Badge>
    );
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
        {(stats.myRating !== undefined || stats.myIsPrivate) && (
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  Twoja ocena realności
                </span>
              </div>
              {stats.myIsPrivate ? (
                <Badge className="bg-gray-700 hover:bg-gray-800 text-white">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Prywatna
                </Badge>
              ) : stats.myRating !== undefined ? (
                renderVerificationBadge(stats.myRating === 1)
              ) : null}
            </div>
          </div>
        )}

        {/* Level 2: Direct Trust Network */}
        {(stats.trustedRealCount > 0 || stats.trustedNotRealCount > 0 || stats.trustedPrivateCount > 0) && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Osoby przez Ciebie zweryfikowane
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {stats.trustedRealCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  ✓ {stats.trustedRealCount}
                </Badge>
              )}
              {stats.trustedNotRealCount > 0 && (
                <Badge variant="destructive">
                  ✗ {stats.trustedNotRealCount}
                </Badge>
              )}
              {stats.trustedPrivateCount > 0 && (
                <Badge className="bg-gray-700 hover:bg-gray-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {stats.trustedPrivateCount} prywatnych
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Level 3: Second Degree Network */}
        {(stats.secondDegreeRealCount > 0 || stats.secondDegreeNotRealCount > 0 || stats.secondDegreePrivateCount > 0) && (
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Sieć drugiego stopnia
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {stats.secondDegreeRealCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  ✓ {stats.secondDegreeRealCount}
                </Badge>
              )}
              {stats.secondDegreeNotRealCount > 0 && (
                <Badge variant="destructive">
                  ✗ {stats.secondDegreeNotRealCount}
                </Badge>
              )}
              {stats.secondDegreePrivateCount > 0 && (
                <Badge className="bg-gray-700 hover:bg-gray-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {stats.secondDegreePrivateCount}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Level 4: Third Degree Network */}
        {(stats.thirdDegreeRealCount > 0 || stats.thirdDegreeNotRealCount > 0 || stats.thirdDegreePrivateCount > 0) && (
          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  Sieć trzeciego stopnia
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {stats.thirdDegreeRealCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  ✓ {stats.thirdDegreeRealCount}
                </Badge>
              )}
              {stats.thirdDegreeNotRealCount > 0 && (
                <Badge variant="destructive">
                  ✗ {stats.thirdDegreeNotRealCount}
                </Badge>
              )}
              {stats.thirdDegreePrivateCount > 0 && (
                <Badge className="bg-gray-700 hover:bg-gray-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {stats.thirdDegreePrivateCount}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Level 5: Fourth Degree Network */}
        {(stats.fourthDegreeRealCount > 0 || stats.fourthDegreeNotRealCount > 0 || stats.fourthDegreePrivateCount > 0) && (
          <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">5</div>
                <span className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                  Sieć czwartego stopnia
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {stats.fourthDegreeRealCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  ✓ {stats.fourthDegreeRealCount}
                </Badge>
              )}
              {stats.fourthDegreeNotRealCount > 0 && (
                <Badge variant="destructive">
                  ✗ {stats.fourthDegreeNotRealCount}
                </Badge>
              )}
              {stats.fourthDegreePrivateCount > 0 && (
                <Badge className="bg-gray-700 hover:bg-gray-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {stats.fourthDegreePrivateCount}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Level 6: Total Ratings */}
        {stats.total > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">6</div>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Łączne weryfikacje z całej sieci
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              {stats.realCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  ✓ {stats.realCount} realnych
                </Badge>
              )}
              {stats.notRealCount > 0 && (
                <Badge variant="destructive">
                  ✗ {stats.notRealCount} nierealnych
                </Badge>
              )}
              {stats.privateCount > 0 && (
                <Badge className="bg-gray-700 hover:bg-gray-800">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {stats.privateCount} prywatnych
                </Badge>
              )}
            </div>
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

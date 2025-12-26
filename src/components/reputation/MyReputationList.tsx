import { useReputationGivenBy } from "@/hooks/useReputation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthor } from "@/hooks/useAuthor";
import { genUserName } from "@/lib/genUserName";
import { Star, Calendar, Tag, User } from "lucide-react";
import { nip19 } from "nostr-tools";

interface MyReputationListProps {
  userPubkey: string;
}

function ReputationItem({ targetPubkey, rating, context, tag, content, createdAt }: {
  targetPubkey: string;
  rating: number;
  context?: string;
  tag?: string;
  content: string;
  createdAt: number;
}) {
  const author = useAuthor(targetPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || metadata?.display_name || genUserName(targetPubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(targetPubkey);

  const renderVerificationBadge = (rating: number) => {
    return rating === 1 ? (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        ✓ Realny
      </Badge>
    ) : (
      <Badge variant="destructive">
        ✗ Nierealny
      </Badge>
    );
  };

  const date = new Date(createdAt * 1000).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {displayName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                  {npub.slice(0, 16)}...{npub.slice(-8)}
                </p>
              </div>
              {renderVerificationBadge(rating)}
            </div>

            {content && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {content}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {date}
              </span>
              {context && (
                <Badge variant="outline" className="text-xs">
                  {context}
                </Badge>
              )}
              {tag && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyReputationList({ userPubkey }: MyReputationListProps) {
  const { data: reputations, isLoading } = useReputationGivenBy(userPubkey);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reputations || reputations.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Nie nadałeś jeszcze żadnej reputacji
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Użyj zakładki "Szukaj", aby znaleźć użytkowników i nadać im reputację
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Nadane reputacje ({reputations.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {reputations
        .sort((a, b) => b.created_at - a.created_at)
        .map((event) => {
          const targetPubkey = event.tags.find(([name]) => name === 'p')?.[1];
          const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
          const context = event.tags.find(([name]) => name === 'context')?.[1];
          const tag = event.tags.find(([name]) => name === 't')?.[1];

          if (!targetPubkey) return null;

          return (
            <ReputationItem
              key={event.id}
              targetPubkey={targetPubkey}
              rating={rating}
              context={context}
              tag={tag}
              content={event.content}
              createdAt={event.created_at}
            />
          );
        })}
    </div>
  );
}

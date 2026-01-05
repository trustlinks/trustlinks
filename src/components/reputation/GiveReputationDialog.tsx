import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star, Shield, Eye, EyeOff } from "lucide-react";
import { useGiveReputation } from "@/hooks/useGiveReputation";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useReputationGivenBy } from "@/hooks/useReputation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMemo } from "react";

interface GiveReputationDialogProps {
  targetPubkey: string;
  currentRating?: number;
}

export function GiveReputationDialog({ targetPubkey, currentRating }: GiveReputationDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(currentRating ?? 1);
  const [context, setContext] = useState("");
  const [tag, setTag] = useState("conference");
  const [comment, setComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const { user } = useCurrentUser();
  const { mutateAsync: giveReputation, isPending } = useGiveReputation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's verified connections for private proof
  const { data: myGivenReputations } = useReputationGivenBy(user?.pubkey || '');

  const verifiedPubkeys = useMemo(() => {
    return (myGivenReputations || [])
      .filter(event => {
        if (event.kind === 4102) return true; // Include private verifications
        const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return rating === 1; // Only "real" ratings
      })
      .map(event => event.tags.find(([name]) => name === 'p')?.[1])
      .filter((pk): pk is string => !!pk);
  }, [myGivenReputations]);

  // Check if browser supports WASM (required for ZK-proofs)
  const wasmSupported = typeof WebAssembly !== 'undefined';
  const canUsePrivate = verifiedPubkeys.length > 0 && wasmSupported;

  const handleSubmit = async () => {
    try {
      await giveReputation({
        targetPubkey,
        rating,
        context: context.trim() || undefined,
        tag: tag.trim() || undefined,
        comment: comment.trim() || undefined,
        isPrivate,
        verifiedPubkeys: isPrivate ? verifiedPubkeys : undefined,
      });

      toast({
        title: "Weryfikacja nadana!",
        description: isPrivate
          ? "Prywatna weryfikacja utworzona (ZK-proof)"
          : (rating === 1 ? "Osoba oznaczona jako realna" : "Osoba oznaczona jako nierealna"),
      });

      queryClient.invalidateQueries({ queryKey: ['reputation', targetPubkey] });
      queryClient.invalidateQueries({ queryKey: ['my-reputation', targetPubkey] });

      setOpen(false);
      setComment("");
      setContext("");
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się nadać weryfikacji",
        variant: "destructive",
      });
      console.error(error);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Star className="h-4 w-4 mr-2" />
          {currentRating !== undefined ? 'Aktualizuj weryfikację' : 'Zweryfikuj'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Zweryfikuj użytkownika</DialogTitle>
          <DialogDescription>
            Określ czy ta osoba jest realna czy nierealna
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Binary Rating */}
          <div className="space-y-3">
            <Label>Status weryfikacji</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRating(1)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  rating === 1
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">✓</div>
                  <span className="font-semibold text-green-700 dark:text-green-400">Realny</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Zweryfikowana osoba</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRating(0)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  rating === 0
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">✗</div>
                  <span className="font-semibold text-red-700 dark:text-red-400">Nierealny</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Bot lub fake</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <Label htmlFor="tag">Kategoria (opcjonalne)</Label>
            <Input
              id="tag"
              placeholder="np. conference, meetup, workshop..."
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Wydarzenie (opcjonalne)</Label>
            <Input
              id="context"
              placeholder="np. Baltic Honeybadger 2025, Bitcoin Warsaw..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Komentarz (opcjonalny)</Label>
            <Textarea
              id="comment"
              placeholder="Dlaczego nadajesz tę weryfikację?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="private-mode" className="text-base font-semibold">
                    {isPrivate ? (
                      <span className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Weryfikacja prywatna
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Weryfikacja publiczna
                      </span>
                    )}
                  </Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isPrivate ? (
                    <>
                      <Shield className="inline h-3 w-3 mr-1" />
                      Używa ZK-proof - nikt nie będzie wiedział kto weryfikował
                    </>
                  ) : (
                    "Twoja weryfikacja będzie widoczna publicznie"
                  )}
                </p>
                {!wasmSupported && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Prywatne weryfikacje wymagają WebAssembly (zablokowane przez CSP lub przeglądarkę)
                  </p>
                )}
                {wasmSupported && verifiedPubkeys.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Potrzebujesz co najmniej 1 zweryfikowanej osoby aby utworzyć prywatną weryfikację
                  </p>
                )}
              </div>
              <Switch
                id="private-mode"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={!canUsePrivate}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isPending ? (
              isPrivate ? (
                <>
                  <Shield className="h-4 w-4 mr-2 animate-spin" />
                  Generowanie ZK-proof...
                </>
              ) : (
                'Wysyłanie...'
              )
            ) : (
              'Zweryfikuj użytkownika'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

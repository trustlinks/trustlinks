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
import { Star } from "lucide-react";
import { useGiveReputation } from "@/hooks/useGiveReputation";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

interface GiveReputationDialogProps {
  targetPubkey: string;
  currentRating?: number;
}

export function GiveReputationDialog({ targetPubkey, currentRating }: GiveReputationDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(currentRating ?? 5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [context, setContext] = useState("");
  const [tag, setTag] = useState("conference");
  const [comment, setComment] = useState("");
  
  const { giveReputation, isPending } = useGiveReputation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = () => {
    try {
      giveReputation({
        targetPubkey,
        rating,
        context: context.trim() || undefined,
        tag: tag.trim() || undefined,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Reputacja nadana!",
        description: `Nadano ocenę ${rating}/5`,
      });

      queryClient.invalidateQueries({ queryKey: ['reputation', targetPubkey] });
      queryClient.invalidateQueries({ queryKey: ['my-reputation', targetPubkey] });
      
      setOpen(false);
      setComment("");
      setContext("");
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się nadać reputacji",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const ratingLabels = {
    '-1': 'Bardzo negatywna',
    '0': 'Neutralna',
    '1': 'Słaba',
    '2': 'Przeciętna',
    '3': 'Dobra',
    '4': 'Bardzo dobra',
    '5': 'Doskonała'
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Star className="h-4 w-4 mr-2" />
          {currentRating !== undefined ? 'Aktualizuj' : 'Nadaj reputację'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nadaj reputację</DialogTitle>
          <DialogDescription>
            Oceń tego użytkownika w skali od -1 do 5
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-3">
            <Label>Ocena: {ratingLabels[displayRating as keyof typeof ratingLabels]}</Label>
            <div className="flex items-center gap-2">
              {[-1, 0, 1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  {value === -1 ? (
                    <Star
                      className={`h-8 w-8 ${
                        displayRating === -1
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ) : value === 0 ? (
                    <Star
                      className={`h-8 w-8 ${
                        displayRating >= 0
                          ? 'fill-gray-400 text-gray-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ) : (
                    <Star
                      className={`h-8 w-8 ${
                        displayRating >= value
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  )}
                </button>
              ))}
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
              placeholder="Dlaczego nadajesz tę ocenę?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
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
            {isPending ? 'Wysyłanie...' : 'Nadaj reputację'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { UserProfileCard } from "./UserProfileCard";
import { nip19 } from "nostr-tools";

export function UserSearch() {
  const [searchInput, setSearchInput] = useState("");
  const [searchedPubkey, setSearchedPubkey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setError(null);
    
    if (!searchInput.trim()) {
      setError("Wprowadź npub lub hex pubkey");
      return;
    }

    try {
      let pubkey: string;
      
      if (searchInput.startsWith('npub1')) {
        const decoded = nip19.decode(searchInput.trim());
        if (decoded.type !== 'npub') {
          setError("Nieprawidłowy format npub");
          return;
        }
        pubkey = decoded.data;
      } else if (searchInput.startsWith('nprofile1')) {
        const decoded = nip19.decode(searchInput.trim());
        if (decoded.type !== 'nprofile') {
          setError("Nieprawidłowy format nprofile");
          return;
        }
        pubkey = decoded.data.pubkey;
      } else if (/^[0-9a-f]{64}$/i.test(searchInput.trim())) {
        pubkey = searchInput.trim().toLowerCase();
      } else {
        setError("Wprowadź prawidłowy npub, nprofile lub hex pubkey");
        return;
      }

      setSearchedPubkey(pubkey);
    } catch (err) {
      setError("Błąd dekodowania adresu Nostr");
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Wpisz npub, nprofile lub hex pubkey..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} size="icon" className="bg-purple-600 hover:bg-purple-700">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {searchedPubkey && (
        <UserProfileCard pubkey={searchedPubkey} showGiveReputationButton />
      )}
    </div>
  );
}

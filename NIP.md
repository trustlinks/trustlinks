# NIP - Live Reputation System with Privacy

## Abstrakt

Ten NIP definiuje system żywej reputacji dla sieci Nostr, zaprojektowany specjalnie do nadawania reputacji w czasie rzeczywistym podczas wydarzeń takich jak konferencje, meetupy i inne spotkania społeczności. System wspiera zarówno **publiczne** jak i **prywatne** weryfikacje (używając Zero-Knowledge Proofs).

## Specyfikacja

### Kind 4101: Public Verification Event

Kind 4101 jest używany do publikowania **publicznych** weryfikacji realności dla innych użytkowników Nostr.

### Kind 4102: Private Verification Event (ZK-Proof)

Kind 4102 jest używany do publikowania **prywatnych** weryfikacji z użyciem Semaphore Zero-Knowledge Proofs. Zapewnia to anonimowość weryfikatora - nikt nie może określić kto weryfikował, ale można potwierdzić że weryfikacja pochodzi z zaufanej sieci.

#### Struktura wydarzenia publicznego (Kind 4101)

```json
{
  "kind": 4101,
  "content": "[opcjonalny komentarz lub uzasadnienie weryfikacji]",
  "tags": [
    ["p", "<pubkey-otrzymującego-weryfikację>", "<relay-url>"],
    ["rating", "<0-lub-1>"],
    ["t", "<kategoria>"],
    ["context", "<nazwa-wydarzenia>"]
  ]
}
```

#### Struktura wydarzenia prywatnego (Kind 4102)

```json
{
  "kind": 4102,
  "content": "[opcjonalny komentarz]",
  "tags": [
    ["p", "<pubkey-otrzymującego-weryfikację>", "<relay-url>"],
    ["proof", "<semaphore-zk-proof-json>"],
    ["merkle_root", "<group-merkle-root>"],
    ["t", "<kategoria>"],
    ["context", "<nazwa-wydarzenia>"]
  ]
}
```

#### Wymagane tagi

- **`p`**: Publiczny klucz użytkownika, któremu nadajemy reputację (HEX)
  - Opcjonalnie może zawierać relay hint
- **`rating`**: Status weryfikacji (string)
  - `"1"` = Realny (zweryfikowana osoba)
  - `"0"` = Nierealny (bot, fake account, lub niesprawdzona tożsamość)

#### Opcjonalne tagi

- **`t`**: Tag tematyczny określający kontekst reputacji (np. "conference", "meetup")
- **`context`**: Nazwa wydarzenia lub kontekstu (np. "NostrCon 2025", "Bitcoin Warsaw")

#### Pole content

Pole `content` może zawierać opcjonalny komentarz tekstowy wyjaśniający powód nadania danej oceny. Może być puste.

### Mechanizm agregacji reputacji - Web of Trust

Klienci implementujące ten NIP powinny wyświetlać reputację w następującej hierarchii (6 poziomów):

1. **Poziom 1 - Moja weryfikacja**
   - Bezpośrednia weryfikacja przez zalogowanego użytkownika
   - Pokazuje czy użytkownik oznaczył daną osobę jako realną (1) czy nierealną (0)
   - Najwyższy priorytet wyświetlania

2. **Poziom 2 - Weryfikacje od bezpośrednio zweryfikowanych osób**
   - Weryfikacje od osób, którym JA nadałem status "realnej osoby" (rating = 1)
   - Pokazuje liczbę weryfikacji "realny" vs "nierealny"

3. **Poziom 3 - Sieć drugiego stopnia**
   - Weryfikacje od osób zweryfikowanych przez moją bezpośrednią sieć zaufania
   - Osoby, którym osoby z poziomu 2 nadały status realności (rating = 1)
   - Pokazuje liczbę weryfikacji "realny" vs "nierealny"

4. **Poziom 4 - Sieć trzeciego stopnia**
   - Weryfikacje od osób zweryfikowanych przez sieć drugiego stopnia
   - Osoby, którym osoby z poziomu 3 nadały status realności (rating = 1)
   - Pokazuje liczbę weryfikacji "realny" vs "nierealny"

5. **Poziom 5 - Sieć czwartego stopnia**
   - Weryfikacje od osób zweryfikowanych przez sieć trzeciego stopnia
   - Osoby, którym osoby z poziomu 4 nadały status realności (rating = 1)
   - Pokazuje liczbę weryfikacji "realny" vs "nierealny"

6. **Poziom 6 - Łączne weryfikacje z całej sieci**
   - Suma wszystkich weryfikacji z całej sieci Nostr
   - Pokazuje łączną liczbę weryfikacji "realny" vs "nierealny"

### Przykład zapytania

Aby pobrać wszystkie reputacje nadane danemu użytkownikowi:

```javascript
{
  kinds: [4101],
  '#p': [<target_pubkey>],
  limit: 100
}
```

Aby pobrać reputacje w określonym kontekście:

```javascript
{
  kinds: [4101],
  '#p': [<target_pubkey>],
  '#t': ['conference'],
  limit: 100
}
```

### Przykładowe wydarzenie publiczne (Kind 4101)

```json
{
  "id": "abc123...",
  "pubkey": "79dff8f82963424e0bb02708a22e44b4980893e3a4be0fa3cb60a43b946764e3",
  "created_at": 1703001234,
  "kind": 4101,
  "tags": [
    ["p", "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d", "wss://relay.damus.io"],
    ["rating", "1"],
    ["t", "conference"],
    ["context", "Baltic Honeybadger 2025"]
  ],
  "content": "Spotkałem osobiście na konferencji - zweryfikowana realna osoba.",
  "sig": "..."
}
```

### Przykładowe wydarzenie prywatne (Kind 4102)

```json
{
  "id": "def456...",
  "pubkey": "79dff8f82963424e0bb02708a22e44b4980893e3a4be0fa3cb60a43b946764e3",
  "created_at": 1703001234,
  "kind": 4102,
  "tags": [
    ["p", "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"],
    ["proof", "{\"merkleTreeDepth\":20,\"merkleTreeRoot\":\"12345...\",\"nullifier\":\"67890...\",\"proof\":[...]}"],
    ["merkle_root", "12345678901234567890"],
    ["t", "conference"],
    ["context", "Baltic Honeybadger 2025"]
  ],
  "content": "",
  "sig": "..."
}
```

## Zastosowania

- Nadawanie reputacji podczas konferencji i wydarzeń na żywo
- Budowanie sieci zaufania w społeczności Nostr
- Identyfikacja wartościowych członków społeczności
- Wsparcie dla moderacji i odkrywania treści

## Implementacja w kliencie

Klienty powinny:

1. Umożliwiać użytkownikom łatwe nadawanie reputacji poprzez prosty interfejs (np. ocena 1-5 gwiazdek)
2. Wyświetlać zagregowane wyniki reputacji z wyraźnym wskazaniem własnej oceny użytkownika
3. Pokazywać reputacje z sieci zaufania osobno od ogólnych statystyk
4. Filtrować reputacje według kontekstu/wydarzenia
5. Obsługiwać aktualizacje w czasie rzeczywistym podczas wydarzeń na żywo

## Prywatne weryfikacje (Kind 4102)

### Mechanizm Zero-Knowledge Proof

Prywatne weryfikacje wykorzystują **Semaphore Protocol** do tworzenia Zero-Knowledge Proofs, które pozwalają na:

1. **Dowód członkostwa** - Potwierdzenie że weryfikator jest częścią zaufanej sieci
2. **Anonimowość** - Nikt nie może określić KTO konkretnie weryfikował
3. **Przeciwdziałanie duplikatom** - Nullifier hash zapobiega podwójnym weryfikacjom
4. **Weryfikowalność** - Każdy może zweryfikować proof matematycznie

### Generowanie prywatnej weryfikacji

```typescript
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';

// 1. Utwórz tożsamość z klucza Nostr
const identity = new Identity(nostrPrivkey);

// 2. Utwórz grupę z zweryfikowanych pubkey
const group = new Group();
verifiedPubkeys.forEach(pk => {
  const memberIdentity = new Identity(pk);
  group.addMember(memberIdentity.commitment);
});

// 3. Generuj proof
const proof = await generateProof(
  identity,
  group,
  targetPubkey, // signal
  'trustlinks-verify-v1' // external nullifier
);

// 4. Publikuj Kind 4102
const event = {
  kind: 4102,
  tags: [
    ['p', targetPubkey],
    ['proof', JSON.stringify(proof)],
    ['merkle_root', group.root.toString()]
  ],
  content: ''
};
```

### Weryfikacja prywatnej weryfikacji

```typescript
import { verifyProof } from '@semaphore-protocol/proof';

const proofTag = event.tags.find(([name]) => name === 'proof')?.[1];
const merkleRootTag = event.tags.find(([name]) => name === 'merkle_root')?.[1];

const proof = JSON.parse(proofTag);
const merkleRoot = BigInt(merkleRootTag);

// Zweryfikuj proof
const isValid = await verifyProof(proof, merkleRoot);
```

## Względy prywatności

### Zalety prywatnych weryfikacji:

- **Przeciwdziałanie inwigilacji** - Rządy/korporacje nie mogą mapować sieci społecznych
- **Ochrona aktywistów** - W reżimach autorytarnych ujawnianie kontaktów = niebezpieczeństwo
- **Zapobieganie profilowaniu** - Niemożliwość budowania grafów znajomości
- **Anonimowy głos zaufania** - Weryfikacja bez ujawniania tożsamości

### Wady prywatnych weryfikacji:

- **Wolniejsze** - Generowanie ZK-proof trwa 2-5 sekund
- **Większe wydarzenia** - ~1KB na proof (vs ~200 bajtów publiczny)
- **Wymaga sieci** - Musisz mieć co najmniej 1 zweryfikowaną osobę

## Względy bezpieczeństwa

- Klienty powinny implementować mechanizmy przeciwdziałające spamowi i manipulacji
- Uwzględniać timestamp wydarzeń przy obliczaniu wag
- Możliwość ignorowania reputacji od zablokowanych użytkowników
- Weryfikacja autentyczności podpisów wydarzeń (Kind 4101) i ZK-proofs (Kind 4102)
- Prywatne weryfikacje są odpornejsze na cenzurę i targeted attacks

## Kompatybilność

Ten NIP jest w pełni kompatybilny wstecz:
- Klienty nieobsługujące Kind 4101/4102 po prostu je ignorują
- Klienty obsługujące tylko Kind 4101 traktują Kind 4102 jako nieznany typ (zgodnie z NIP-31)
- Pełna implementacja obsługuje oba tryby: publiczny i prywatny

# NIP - Live Reputation System

## Abstrakt

Ten NIP definiuje system żywej reputacji dla sieci Nostr, zaprojektowany specjalnie do nadawania reputacji w czasie rzeczywistym podczas wydarzeń takich jak konferencje, meetupy i inne spotkania społeczności.

## Specyfikacja

### Kind 4101: Live Reputation Event

Kind 4101 jest używany do publikowania ocen reputacji dla innych użytkowników Nostr.

#### Struktura wydarzenia

```json
{
  "kind": 4101,
  "content": "[opcjonalny komentarz lub uzasadnienie oceny]",
  "tags": [
    ["p", "<pubkey-otrzymującego-reputację>", "<relay-url>"],
    ["rating", "<wartość-numeryczna>"],
    ["t", "<kontekst>"],
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

### Przykładowe wydarzenie

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

## Względy bezpieczeństwa

- Klienty powinny implementować mechanizmy przeciwdziałające spamowi i manipulacji
- Uwzględniać timestamp wydarzeń przy obliczaniu wag
- Możliwość ignorowania reputacji od zablokowanych użytkowników
- Weryfikacja autentyczności podpisów wydarzeń

## Kompatybilność

Ten NIP jest w pełni kompatybilny wstecz - klienty, które go nie implementują, po prostu ignorują wydarzenia kind 4101.

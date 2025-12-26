# Nostr Live Reputation

Aplikacja do żywego zarządzania reputacją na protokole Nostr, zaprojektowana specjalnie do nadawania reputacji podczas konferencji, meetupów i innych wydarzeń społeczności.

## ✨ Funkcje

- **Nadawanie reputacji na żywo** - Oceń użytkowników w czasie rzeczywistym podczas wydarzeń
- **Sieć zaufania** - Priorytetowe wyświetlanie reputacji nadanej przez osoby, którym ufasz
- **Inteligentna agregacja** - Automatyczne obliczanie średniej reputacji z priorytetem dla twojej sieci
- **Kompatybilność z Amethyst** - Pełna współpraca z Amethyst i innymi klientami Nostr
- **Context-aware** - Możliwość tagowania reputacji według wydarzeń i kategorii

## 🎯 Jak to działa

### Hierarchia wyświetlania reputacji - Web of Trust

Gdy przeglądasz profil użytkownika, reputacja jest wyświetlana w następującej hierarchii (6 poziomów):

1. **Poziom 1 - Twoja ocena realności**
   - Twoja bezpośrednia weryfikacja tej osoby
   - Najważniejszy poziom - czy TY uważasz tę osobę za realną (✓/✗)

2. **Poziom 2 - Osoby przez Ciebie zweryfikowane**
   - Weryfikacje od osób, którym TY nadałeś status realności (✓ Realny)
   - Twoja bezpośrednia sieć zaufania
   - Pokazuje: ✓ X realnych / ✗ Y nierealnych

3. **Poziom 3 - Sieć drugiego stopnia**
   - Weryfikacje od osób zweryfikowanych przez Twoją sieć zaufania
   - Rozszerzona sieć Web of Trust
   - Pokazuje: ✓ X / ✗ Y

4. **Poziom 4 - Sieć trzeciego stopnia**
   - Weryfikacje od osób zweryfikowanych przez sieć drugiego stopnia
   - Dalsze rozszerzenie Web of Trust
   - Pokazuje: ✓ X / ✗ Y

5. **Poziom 5 - Sieć czwartego stopnia**
   - Weryfikacje od osób zweryfikowanych przez sieć trzeciego stopnia
   - Maksymalne rozszerzenie Web of Trust
   - Pokazuje: ✓ X / ✗ Y

6. **Poziom 6 - Łączna liczba pozytywnych ocen**
   - Suma wszystkich weryfikacji z całej sieci
   - Wskaźnik ogólnego zaufania społeczności
   - Pokazuje: ✓ X realnych / ✗ Y nierealnych

### System weryfikacji

Weryfikacja jest binarna - prosta i czytelna:

- **✓ Realny** (1) - Zweryfikowana osoba, spotkana osobiście lub potwierdzona jako prawdziwa
- **✗ Nierealny** (0) - Bot, fake account, lub niesprawdzona tożsamość

## 🚀 Rozpoczęcie pracy

### Logowanie

1. Kliknij "Zaloguj się" na stronie głównej
2. Użyj swojego rozszerzenia Nostr (np. Alby, nos2x) lub podaj klucz prywatny (nsec)

### Szukanie użytkowników

1. Przejdź do zakładki "Szukaj"
2. Wprowadź npub, nprofile lub hex pubkey użytkownika
3. Zobacz pełną reputację użytkownika

### Weryfikacja użytkowników

1. Po znalezieniu użytkownika kliknij "Zweryfikuj"
2. Wybierz status:
   - **✓ Realny** - Zweryfikowana osoba (spotkana osobiście, potwierdzona tożsamość)
   - **✗ Nierealny** - Bot, fake account, lub niesprawdzona tożsamość
3. Opcjonalnie dodaj:
   - **Kategorię** (np. "conference", "meetup")
   - **Wydarzenie** (np. "Baltic Honeybadger 2025")
   - **Komentarz** wyjaśniający weryfikację
4. Kliknij "Zweryfikuj użytkownika"

### Przeglądanie reputacji

- **Zakładka "Nadane"** - Zobacz wszystkie reputacje, które nadałeś
- **Zakładka "Otrzymane"** - Zobacz reputacje, które otrzymałeś od innych

## 🔧 Technologia

### Stack technologiczny

- **React 18** - Nowoczesny framework UI
- **TailwindCSS 3** - Utility-first CSS
- **Nostrify** - Framework protokołu Nostr
- **shadcn/ui** - Komponenty UI
- **Vite** - Szybki bundler

### Protokół Nostr

Aplikacja wykorzystuje **Kind 4101** dla wydarzeń reputacji z następującymi tagami:

```json
{
  "kind": 4101,
  "content": "Spotkałem osobiście na konferencji",
  "tags": [
    ["p", "<pubkey-otrzymującego>"],
    ["rating", "1"],
    ["t", "conference"],
    ["context", "Baltic Honeybadger 2025"]
  ]
}
```

Pełna specyfikacja znajduje się w pliku `NIP.md`.

## 🌐 Współpraca z innymi klientami

### Amethyst

Aplikacja jest w pełni kompatybilna z Amethyst. Wydarzenia reputacji publikowane przez tę aplikację będą widoczne w Amethyst i odwrotnie.

### Inne klienty Nostr

Każdy klient Nostr może implementować Kind 4101 i współpracować z tym systemem reputacji.

## 📱 Funkcje społecznościowe

- **Profile użytkowników** - Dostęp przez npub/nprofile URLs
- **Agregacja w czasie rzeczywistym** - Natychmiastowe aktualizacje reputacji
- **Filtry kontekstowe** - Filtrowanie według wydarzeń i kategorii
- **Nostr Login** - Bezpieczne logowanie przez rozszerzenia przeglądarki

## 🔐 Bezpieczeństwo

- Wszystkie wydarzenia są podpisane kryptograficznie
- Prywatne klucze nigdy nie opuszczają Twojego urządzenia
- Możliwość blokowania spamerów i złych aktorów
- Weryfikacja autentyczności wszystkich wydarzeń

## 🎨 Interfejs

- **Responsywny design** - Działa na wszystkich urządzeniach
- **Tryb ciemny** - Automatyczne przełączanie motywów
- **Intuicyjna nawigacja** - Prosta obsługa zakładek
- **Animacje** - Płynne przejścia i efekty

## 📄 Licencja

MIT License - Zobacz plik LICENSE

## 🤝 Wkład w projekt

Projekt jest open source. Pull requesty są mile widziane!

## 🔗 Linki

- [Dokumentacja NIP](./NIP.md) - Szczegóły techniczne protokołu
- [Nostr Protocol](https://github.com/nostr-protocol/nostr) - Specyfikacja protokołu Nostr
- [Shakespeare](https://shakespeare.diy) - Narzędzie użyte do stworzenia tej aplikacji

---

**Vibed with [Shakespeare](https://shakespeare.diy)** 🎭

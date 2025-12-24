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

Gdy przeglądasz profil użytkownika, reputacja jest wyświetlana w następującej hierarchii:

1. **Poziom 1 - Twoja ocena realności**
   - Twoja bezpośrednia ocena tej osoby
   - Najważniejszy poziom - czy TY uważasz tę osobę za realną

2. **Poziom 2 - Osoby przez Ciebie zweryfikowane**
   - Średnia ocen od osób, którym TY nadałeś status realności (≥4/5)
   - Twoja bezpośrednia sieć zaufania

3. **Poziom 3 - Sieć drugiego stopnia**
   - Oceny od osób zweryfikowanych przez Twoją sieć zaufania
   - Rozszerzona sieć Web of Trust

4. **Poziom 4 - Łączna liczba pozytywnych ocen**
   - Suma wszystkich pozytywnych weryfikacji (≥4/5) z całej sieci
   - Wskaźnik ogólnego zaufania społeczności

### Skala ocen

Reputacja jest oceniana w skali od -1 do 5:

- **-1** - Bardzo negatywna
- **0** - Neutralna
- **1** - Słaba
- **2** - Przeciętna
- **3** - Dobra
- **4** - Bardzo dobra
- **5** - Doskonała

## 🚀 Rozpoczęcie pracy

### Logowanie

1. Kliknij "Zaloguj się" na stronie głównej
2. Użyj swojego rozszerzenia Nostr (np. Alby, nos2x) lub podaj klucz prywatny (nsec)

### Szukanie użytkowników

1. Przejdź do zakładki "Szukaj"
2. Wprowadź npub, nprofile lub hex pubkey użytkownika
3. Zobacz pełną reputację użytkownika

### Nadawanie reputacji

1. Po znalezieniu użytkownika kliknij "Nadaj reputację"
2. Wybierz ocenę od -1 do 5
3. Opcjonalnie dodaj:
   - **Kategorię** (np. "conference", "meetup")
   - **Wydarzenie** (np. "Baltic Honeybadger 2025")
   - **Komentarz** wyjaśniający Twoją ocenę
4. Kliknij "Nadaj reputację"

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
  "content": "Opcjonalny komentarz",
  "tags": [
    ["p", "<pubkey-otrzymującego>"],
    ["rating", "5"],
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

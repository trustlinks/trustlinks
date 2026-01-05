# 📱 Jak wdrożyć TrustLinks i zainstalować na telefonie

## Krok 1: Włącz GitHub Pages

1. Idź do: **https://github.com/trustlinks/trustlinks/settings/pages**
2. W sekcji "Build and deployment":
   - **Source**: wybierz "GitHub Actions"
3. Kliknij Save

## Krok 2: Dodaj GitHub Actions Workflow

1. W swoim repozytorium, stwórz plik `.github/workflows/deploy.yml`
2. Wklej poniższy kod:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Commit i push:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push
```

## Krok 3: Poczekaj na deployment

1. GitHub Actions automatycznie zbuduje i wdroży aplikację
2. Sprawdź status na: **https://github.com/trustlinks/trustlinks/actions**
3. Po około 2-3 minutach aplikacja będzie dostępna pod:
   - **https://trustlinks.github.io/trustlinks/**

## Krok 4: Zainstaluj na telefonie Android

### 📱 Instalacja jako PWA (bez APK):

1. **Otwórz przeglądarkę** na telefonie (Chrome, Brave, Firefox)
2. **Wejdź na**: https://trustlinks.github.io/trustlinks/
3. **Kliknij menu** (⋮) → **"Dodaj do ekranu głównego"** / **"Add to Home Screen"**
4. **Potwierdź** instalację
5. **Gotowe!** Ikona pojawi się na ekranie głównym

### ✨ Działa jak natywna aplikacja:

- ✅ Ikona na ekranie głównym
- ✅ Otwiera się pełnoekranowo
- ✅ Działa offline (po pierwszym uruchomieniu)
- ✅ Powiadomienia (jeśli włączone)
- ✅ Brak paska adresu przeglądarki

## 🔐 Po deployment na GitHub Pages:

### WASM będzie działać!

- ✅ **Prywatne weryfikacje** - ZK-proof dostępne
- ✅ **Privacy by default** - Domyślnie anonimowe
- ✅ **Pełna funkcjonalność** - Wszystkie 6 poziomów Web of Trust

## 🚀 Alternatywne opcje deploymentu:

### Opcja 2: Netlify (łatwiejsze)
1. Połącz repo z Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Auto-deploy przy każdym pushu

### Opcja 3: Vercel
1. Połącz repo z Vercel
2. Auto-detect framework (Vite)
3. Deploy automatically

### Opcja 4: Własny serwer
1. Zbuduj: `npm run build`
2. Upload folder `dist/` na serwer
3. Skonfiguruj nginx/apache
4. Gotowe!

## 📝 Notatki:

- **NIE POTRZEBUJESZ APK** - PWA działa jak natywna aplikacja
- **GitHub Pages = DARMOWE** - Bez kosztów hostingu
- **HTTPS automatyczne** - GitHub Pages zapewnia SSL
- **Custom domena** - Możesz dodać własną domenę (opcjonalnie)

## 🎯 Po deployment URL będzie:

**https://trustlinks.github.io/trustlinks/**

Możesz wtedy podzielić się tym linkiem i każdy zainstaluje aplikację na swoim telefonie w kilka sekund! 🎉

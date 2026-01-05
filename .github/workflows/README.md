# GitHub Actions Workflows

Ten folder nie może być pushowany przez token bez uprawnienia `workflow`.

## Jak dodać deployment workflow:

1. **Wygeneruj nowy token** z uprawnieniem `workflow`:
   - https://github.com/settings/tokens/new
   - Zaznacz: ✅ `repo` + ✅ `workflow`

2. **Lub dodaj plik ręcznie** przez interfejs GitHub:
   - Idź do: https://github.com/trustlinks/trustlinks
   - Kliknij "Add file" → "Create new file"
   - Nazwa: `.github/workflows/deploy.yml`
   - Wklej zawartość z `DEPLOYMENT.md`
   - Commit

## Plik deploy.yml

Zobacz `DEPLOYMENT.md` w root projektu dla pełnej zawartości pliku workflow.

Workflow automatycznie wdroży aplikację na GitHub Pages przy każdym pushu do `main`.

# Zarządzanie Projektami

Minimalistyczna aplikacja do zarządzania projektami, inspirowana narzędziami takimi jak ClickUp czy Monday. Aplikacja została zaprojektowana z myślą o prostocie, intuicyjności i przejrzystości.

## Funkcjonalności

- Dodawanie, edycja i usuwanie projektów
- Dodawanie, edycja i usuwanie sekcji w ramach projektów
- Dodawanie, edycja i usuwanie zadań w ramach sekcji
- Zarządzanie statusami zadań (domyślnie: nie rozpoczęte, w trakcie, weryfikacja, opóźnione, zakończone)
- Przypisywanie osób do zadań
- Śledzenie postępu zadań na podstawie podzadań
- Zarządzanie datami rozpoczęcia i zakończenia zadań
- Time sheet - śledzenie czasu pracy nad zadaniami
- Panel ustawień do zarządzania statusami i użytkownikami

## Technologie

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- LocalStorage do przechowywania danych

## Uruchomienie

Aby uruchomić aplikację, wystarczy otworzyć plik `index.html` w przeglądarce internetowej.

## Struktura projektu

```
projektEwy/
├── css/
│   ├── styles.css      # Główny plik CSS
│   └── variables.css   # Zmienne CSS
├── js/
│   └── app.js          # Główny plik JavaScript
└── index.html          # Główny plik HTML
```

## Instrukcja użytkowania

1. **Dodawanie projektu**
   - Kliknij przycisk "Dodaj projekt" w nagłówku
   - Wprowadź nazwę projektu i kliknij "Zapisz"

2. **Dodawanie sekcji**
   - W projekcie kliknij przycisk "Dodaj sekcję"
   - Wprowadź nazwę sekcji i kliknij "Zapisz"

3. **Dodawanie zadania**
   - W sekcji kliknij przycisk "Dodaj zadanie"
   - Wypełnij formularz zadania i kliknij "Zapisz"

4. **Zarządzanie time sheet**
   - Kliknij na link "Dodaj czas" lub liczbę godzin przy zadaniu
   - Dodaj wpis z datą i liczbą godzin

5. **Zarządzanie ustawieniami**
   - Kliknij przycisk "Ustawienia" w nagłówku
   - Przełączaj się między zakładkami "Statusy zadań" i "Użytkownicy"
   - Dodawaj, edytuj lub usuwaj statusy i użytkowników

## Dane

Wszystkie dane są przechowywane lokalnie w przeglądarce użytkownika za pomocą LocalStorage. Dane nie są wysyłane na żaden serwer.

## Autor

Projekt stworzony przez [Twoje Imię]
# Instrukcje rozwoju projektu

## Wykonane prace

- Stworzono podstawową strukturę projektu
- Zaimplementowano interfejs użytkownika z wykorzystaniem HTML, CSS i JavaScript
- Dodano funkcjonalność zarządzania projektami, sekcjami i zadaniami
- Zaimplementowano system statusów zadań i przypisywania użytkowników
- Dodano funkcjonalność time sheet do śledzenia czasu pracy
- Zaimplementowano zapisywanie danych w LocalStorage

## Następne kroki

### Priorytetowe zadania

1. **Optymalizacja wydajności**
   - Zoptymalizować renderowanie dużej liczby zadań
   - Dodać paginację dla projektów z wieloma zadaniami

2. **Rozszerzenie funkcjonalności**
   - Dodać możliwość importu/eksportu danych (CSV, JSON)
   - Zaimplementować funkcję wyszukiwania i filtrowania zadań
   - Dodać możliwość komentowania zadań

3. **Ulepszenia UX**
   - Dodać funkcję drag-and-drop do zmiany kolejności zadań
   - Zaimplementować skróty klawiaturowe dla częstych operacji
   - Dodać tryb ciemny

### Długoterminowe cele

1. **Rozbudowa systemu**
   - Dodać możliwość tworzenia szablonów projektów
   - Zaimplementować system powiadomień o zbliżających się terminach
   - Dodać widok kalendarza dla zadań

2. **Integracje**
   - Dodać możliwość synchronizacji z kalendarzem Google
   - Zaimplementować integrację z popularnymi narzędziami (Slack, Teams)

## Napotkane problemy i wyzwania

- **Zarządzanie stanem aplikacji** - Rozwiązano poprzez centralizację stanu w obiekcie `appData` i konsekwentne używanie funkcji do jego aktualizacji
- **Wydajność przy dużej liczbie zadań** - Wymaga dalszej optymalizacji, szczególnie przy renderowaniu wielu zadań
- **Responsywność interfejsu** - Zaimplementowano podstawową responsywność, ale wymaga dalszych testów na różnych urządzeniach

## Przykłady implementacji

### Dodawanie nowego zadania

```javascript
function addTask(sectionId, taskData) {
    for (const project of appData.projects) {
        const section = project.sections.find(s => s.id === sectionId);
        if (section) {
            const newTask = {
                id: generateId(),
                name: taskData.name,
                statusId: taskData.statusId,
                assigneeId: taskData.assigneeId,
                startDate: taskData.startDate,
                endDate: taskData.endDate,
                subtasks: taskData.subtasks || [],
                timesheet: []
            };
            
            section.tasks.push(newTask);
            saveData();
            renderSections(project);
            return;
        }
    }
}
```

### Obliczanie postępu zadania

```javascript
function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
}
```

## Dokumentacja komponentów

### Projekt

Główny kontener dla sekcji i zadań.

```javascript
{
    id: Number,
    name: String,
    sections: Array
}
```

### Sekcja

Grupuje zadania w ramach projektu.

```javascript
{
    id: Number,
    name: String,
    tasks: Array
}
```

### Zadanie

Podstawowa jednostka pracy.

```javascript
{
    id: Number,
    name: String,
    statusId: Number,
    assigneeId: Number,
    startDate: String,
    endDate: String,
    subtasks: Array,
    timesheet: Array
}
```

### Podzadanie

Mniejsza jednostka pracy w ramach zadania.

```javascript
{
    id: Number,
    name: String,
    completed: Boolean
}
```

### Wpis timesheet

Śledzenie czasu pracy nad zadaniem.

```javascript
{
    date: String,
    hours: Number,
    description: String
}
```
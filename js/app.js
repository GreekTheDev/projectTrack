// Inicjalizacja danych aplikacji
let appData = {
    projects: [],
    settings: {
        statuses: [
            { id: 1, name: 'Nie rozpoczęte', color: '#adb5bd' },
            { id: 2, name: 'W trakcie', color: '#3498db' },
            { id: 3, name: 'Weryfikacja', color: '#f39c12' },
            { id: 4, name: 'Opóźnione', color: '#e74c3c' },
            { id: 5, name: 'Zakończone', color: '#2ecc71' }
        ],
        users: []
    }
};

// Funkcje pomocnicze
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}

function calculateProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
}

function calculateProjectProgress(project) {
    if (!project.sections || project.sections.length === 0) {
        return 0;
    }
    
    let totalTasks = 0;
    let totalProgress = 0;
    
    project.sections.forEach(section => {
        if (section.tasks && section.tasks.length > 0) {
            section.tasks.forEach(task => {
                totalTasks++;
                totalProgress += calculateProgress(task);
            });
        }
    });
    
    return totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
}

// Zapisywanie i wczytywanie danych
function saveData() {
    localStorage.setItem('projectManagerData', JSON.stringify(appData));
}

function loadData() {
    const savedData = localStorage.getItem('projectManagerData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Obsługa projektów
function renderProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    projectsContainer.innerHTML = '';
    
    if (appData.projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <p>Brak projektów. Kliknij "Dodaj projekt", aby rozpocząć.</p>
            </div>
        `;
        updateTasksCounter(); // Aktualizujemy licznik zadań
        return;
    }
    
    appData.projects.forEach(project => {
        const projectProgress = calculateProjectProgress(project);
        
        const projectElement = document.createElement('div');
        projectElement.className = 'project';
        projectElement.innerHTML = `
            <div class="project-header">
                <div class="project-header-left">
                    <h2 class="project-title">${project.name}</h2>
                    <div class="project-progress-container">
                        <div class="project-progress">
                            <div class="project-progress-bar" style="width: ${projectProgress}%"></div>
                        </div>
                        <div class="project-progress-text">${projectProgress}% ukończono</div>
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-small btn-secondary add-section-btn" data-project-id="${project.id}">Dodaj sekcję</button>
                    <button class="btn btn-small btn-secondary edit-project-btn" data-project-id="${project.id}">Edytuj</button>
                    <button class="btn btn-small btn-danger delete-project-btn" data-project-id="${project.id}">Usuń</button>
                </div>
            </div>
            <div class="project-content">
                <div class="sections-container" id="sections-${project.id}">
                    ${project.sections && project.sections.length > 0 ? '' : `
                        <div class="empty-state">
                            <p>Brak sekcji. Kliknij "Dodaj sekcję", aby rozpocząć.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        projectsContainer.appendChild(projectElement);
        
        if (project.sections && project.sections.length > 0) {
            renderSections(project);
        }
    });
    
    // Dodajemy nasłuchiwanie zdarzeń
    addProjectEventListeners();
    
    // Aktualizujemy licznik zadań
    updateTasksCounter();
}

function addProject(name) {
    const newProject = {
        id: generateId(),
        name: name,
        sections: []
    };
    
    appData.projects.push(newProject);
    saveData();
    renderProjects();
}

function updateProject(projectId, name) {
    const project = appData.projects.find(p => p.id === projectId);
    if (project) {
        project.name = name;
        saveData();
        renderProjects();
    }
}

function deleteProject(projectId) {
    appData.projects = appData.projects.filter(p => p.id !== projectId);
    saveData();
    renderProjects();
}

// Obsługa sekcji
function renderSections(project) {
    const sectionsContainer = document.getElementById(`sections-${project.id}`);
    sectionsContainer.innerHTML = '';
    
    project.sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        sectionElement.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">${section.name}</h3>
                <div class="section-actions">
                    <button class="btn btn-small btn-secondary add-task-btn" data-project-id="${project.id}" data-section-id="${section.id}">Dodaj zadanie</button>
                    <button class="btn btn-small btn-secondary edit-section-btn" data-project-id="${project.id}" data-section-id="${section.id}">Edytuj</button>
                    <button class="btn btn-small btn-danger delete-section-btn" data-project-id="${project.id}" data-section-id="${section.id}">Usuń</button>
                </div>
            </div>
            <div class="section-content">
                <table class="tasks-table">
                    <thead>
                        <tr>
                            <th>Nazwa zadania</th>
                            <th>Status</th>
                            <th>Przypisana osoba</th>
                            <th>Postęp</th>
                            <th>Data rozpoczęcia</th>
                            <th>Data zakończenia</th>
                            <th>Time sheet</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody id="tasks-${section.id}">
                        ${section.tasks && section.tasks.length > 0 ? '' : `
                            <tr>
                                <td colspan="8" class="empty-state">Brak zadań. Kliknij "Dodaj zadanie", aby rozpocząć.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
        
        sectionsContainer.appendChild(sectionElement);
        
        if (section.tasks && section.tasks.length > 0) {
            renderTasks(section);
        }
    });
    
    // Dodajemy nasłuchiwanie zdarzeń
    addSectionEventListeners();
}

function addSection(projectId, name) {
    const project = appData.projects.find(p => p.id === projectId);
    if (project) {
        const newSection = {
            id: generateId(),
            name: name,
            tasks: []
        };
        
        project.sections.push(newSection);
        saveData();
        renderProjects();
    }
}

function updateSection(projectId, sectionId, name) {
    const project = appData.projects.find(p => p.id === projectId);
    if (project) {
        const section = project.sections.find(s => s.id === sectionId);
        if (section) {
            section.name = name;
            saveData();
            renderProjects();
        }
    }
}

function deleteSection(projectId, sectionId) {
    const project = appData.projects.find(p => p.id === projectId);
    if (project) {
        project.sections = project.sections.filter(s => s.id !== sectionId);
        saveData();
        renderProjects();
    }
}

// Obsługa zadań
function renderTasks(section) {
    const tasksContainer = document.getElementById(`tasks-${section.id}`);
    tasksContainer.innerHTML = '';
    
    // Usuwamy istniejące dropdowny statusów
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
        dropdown.remove();
    });
    
    if (!section.tasks || section.tasks.length === 0) {
        tasksContainer.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">Brak zadań. Kliknij "Dodaj zadanie", aby rozpocząć.</td>
            </tr>
        `;
        return;
    }
    
    section.tasks.forEach(task => {
        const progress = calculateProgress(task);
        const status = appData.settings.statuses.find(s => s.id === task.statusId) || { name: 'Nieznany', color: '#adb5bd' };
        const assignee = task.assigneeId ? (appData.settings.users.find(u => u.id === task.assigneeId)?.name || 'Nieznany') : 'Brak';
        
        const taskRow = document.createElement('tr');
        taskRow.className = 'task-row';
        taskRow.setAttribute('data-task-id', task.id);
        taskRow.innerHTML = `
            <td>
                <div class="task-name-container">
                    <span class="task-name">${task.name}</span>
                    <button class="btn btn-small btn-secondary quick-add-subtask-btn" data-task-id="${task.id}" data-section-id="${section.id}">+ Podzadanie</button>
                </div>
            </td>
            <td>
                <div class="status-dropdown-container">
                    <span class="task-status" style="background-color: ${status.color}; color: white;">
                        ${status.name}
                    </span>
                    <button class="btn btn-small btn-icon status-dropdown-toggle" data-task-id="${task.id}">
                        <span class="dropdown-icon">▼</span>
                    </button>
                </div>
            </td>
            <td>${assignee}</td>
            <td>
                <div class="task-progress">
                    <div class="task-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="task-progress-text">${progress}%</div>
            </td>
            <td>${formatDate(task.startDate)}</td>
            <td>${formatDate(task.endDate)}</td>
            <td>
                <span class="timesheet-toggle" data-task-id="${task.id}">
                    ${task.timesheet && task.timesheet.length > 0 ? `${task.timesheet.reduce((sum, entry) => sum + entry.hours, 0)} godz.` : 'Dodaj czas'}
                </span>
            </td>
            <td class="task-actions">
                <button class="btn btn-small btn-secondary edit-task-btn" data-task-id="${task.id}" data-section-id="${section.id}">Edytuj</button>
                <button class="btn btn-small ${status.name === 'Zakończone' ? 'btn-success' : 'btn-primary'} complete-task-btn" data-task-id="${task.id}" data-section-id="${section.id}">
                    ${status.name === 'Zakończone' ? 'Ukończone' : 'Ukończ'}
                </button>
                <button class="btn btn-small btn-danger delete-task-btn" data-task-id="${task.id}" data-section-id="${section.id}">Usuń</button>
            </td>
        `;
        
        tasksContainer.appendChild(taskRow);
        
        // Tworzymy dropdown statusu i dodajemy go do body
        const statusDropdown = document.createElement('div');
        statusDropdown.className = 'status-dropdown';
        statusDropdown.id = `status-dropdown-${task.id}`;
        statusDropdown.innerHTML = appData.settings.statuses.map(s => `
            <div class="status-dropdown-item" data-task-id="${task.id}" data-status-id="${s.id}">
                <span class="status-color" style="background-color: ${s.color}"></span>
                <span class="status-name">${s.name}</span>
            </div>
        `).join('');
        document.body.appendChild(statusDropdown);
        
        // Dodajemy wiersz z podzadaniami, jeśli istnieją
        if (task.subtasks && task.subtasks.length > 0) {
            const subtasksRow = document.createElement('tr');
            subtasksRow.className = 'subtasks-row';
            
            const subtasksCell = document.createElement('td');
            subtasksCell.colSpan = 8;
            subtasksCell.className = 'subtasks-cell';
            
            const subtasksList = document.createElement('div');
            subtasksList.className = 'subtasks-list';
            
            task.subtasks.forEach(subtask => {
                const subtaskItem = document.createElement('div');
                subtaskItem.className = 'subtask-list-item';
                subtaskItem.innerHTML = `
                    <input type="checkbox" id="subtask-${subtask.id}" class="subtask-checkbox" 
                        data-task-id="${task.id}" 
                        data-subtask-id="${subtask.id}" 
                        ${subtask.completed ? 'checked' : ''}>
                    <label for="subtask-${subtask.id}" class="subtask-label ${subtask.completed ? 'completed' : ''}">${subtask.name}</label>
                `;
                subtasksList.appendChild(subtaskItem);
            });
            
            subtasksCell.appendChild(subtasksList);
            subtasksRow.appendChild(subtasksCell);
            tasksContainer.appendChild(subtasksRow);
        }
    });
    
    // Dodajemy nasłuchiwanie zdarzeń
    addTaskEventListeners();
}

function findTaskById(taskId) {
    for (const project of appData.projects) {
        for (const section of project.sections) {
            const task = section.tasks.find(t => t.id === taskId);
            if (task) {
                return { task, section, project };
            }
        }
    }
    return null;
}

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

function updateTask(taskId, taskData) {
    const result = findTaskById(taskId);
    if (result) {
        const { task, section, project } = result;
        
        task.name = taskData.name;
        task.statusId = taskData.statusId;
        task.assigneeId = taskData.assigneeId;
        task.startDate = taskData.startDate;
        task.endDate = taskData.endDate;
        task.subtasks = taskData.subtasks;
        
        saveData();
        renderSections(project);
    }
}

function deleteTask(taskId) {
    for (const project of appData.projects) {
        for (const section of project.sections) {
            const taskIndex = section.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                section.tasks.splice(taskIndex, 1);
                saveData();
                renderSections(project);
                return;
            }
        }
    }
}

// Obsługa timesheet
function renderTimesheet(taskId) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task } = result;
    const timesheetEntries = document.getElementById('timesheetEntries');
    timesheetEntries.innerHTML = '';
    
    if (!task.timesheet || task.timesheet.length === 0) {
        timesheetEntries.innerHTML = `
            <div class="empty-state">
                <p>Brak wpisów. Dodaj nowy wpis, aby rozpocząć.</p>
            </div>
        `;
        return;
    }
    
    task.timesheet.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'timesheet-entry';
        entryElement.innerHTML = `
            <div class="timesheet-date">${formatDate(entry.date)}</div>
            <div class="timesheet-hours">${entry.hours} godz.</div>
            ${entry.description ? `<div class="timesheet-description">${entry.description}</div>` : ''}
            <button class="btn btn-small btn-danger delete-timesheet-entry-btn" data-entry-index="${index}">Usuń</button>
        `;
        
        timesheetEntries.appendChild(entryElement);
    });
    
    // Dodajemy nasłuchiwanie zdarzeń
    document.querySelectorAll('.delete-timesheet-entry-btn').forEach(button => {
        button.addEventListener('click', function() {
            const entryIndex = parseInt(this.getAttribute('data-entry-index'));
            deleteTimesheetEntry(taskId, entryIndex);
        });
    });
}

function addTimesheetEntry(taskId, entryData) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    if (!task.timesheet) {
        task.timesheet = [];
    }
    
    task.timesheet.push({
        date: entryData.date,
        hours: entryData.hours,
        description: entryData.description
    });
    
    saveData();
    renderTimesheet(taskId);
    renderSections(project);
}

function deleteTimesheetEntry(taskId, entryIndex) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    if (task.timesheet && task.timesheet.length > entryIndex) {
        task.timesheet.splice(entryIndex, 1);
        saveData();
        renderTimesheet(taskId);
        renderSections(project);
    }
}

// Obsługa ustawień
function renderSettings() {
    // Renderowanie statusów
    const statusesContainer = document.getElementById('statusesContainer');
    statusesContainer.innerHTML = '';
    
    appData.settings.statuses.forEach(status => {
        const statusElement = document.createElement('div');
        statusElement.className = 'status-item';
        statusElement.innerHTML = `
            <div class="status-color" style="background-color: ${status.color}"></div>
            <div class="status-name">${status.name}</div>
            <button class="btn btn-small btn-danger delete-status-btn" data-status-id="${status.id}">Usuń</button>
        `;
        
        statusesContainer.appendChild(statusElement);
    });
    
    // Renderowanie użytkowników
    const usersContainer = document.getElementById('usersContainer');
    usersContainer.innerHTML = '';
    
    if (appData.settings.users.length === 0) {
        usersContainer.innerHTML = `
            <div class="empty-state">
                <p>Brak użytkowników. Dodaj nowego użytkownika, aby rozpocząć.</p>
            </div>
        `;
    } else {
        appData.settings.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-name">${user.name}</div>
                <button class="btn btn-small btn-danger delete-user-btn" data-user-id="${user.id}">Usuń</button>
            `;
            
            usersContainer.appendChild(userElement);
        });
    }
    
    // Dodajemy nasłuchiwanie zdarzeń
    document.querySelectorAll('.delete-status-btn').forEach(button => {
        button.addEventListener('click', function() {
            const statusId = parseInt(this.getAttribute('data-status-id'));
            deleteStatus(statusId);
        });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-user-id'));
            deleteUser(userId);
        });
    });
}

function addStatus(name, color) {
    const newStatus = {
        id: generateId(),
        name: name,
        color: color
    };
    
    appData.settings.statuses.push(newStatus);
    saveData();
    renderSettings();
}

function deleteStatus(statusId) {
    // Sprawdzamy, czy status jest używany
    let isUsed = false;
    
    for (const project of appData.projects) {
        for (const section of project.sections) {
            for (const task of section.tasks) {
                if (task.statusId === statusId) {
                    isUsed = true;
                    break;
                }
            }
            if (isUsed) break;
        }
        if (isUsed) break;
    }
    
    if (isUsed) {
        alert('Nie można usunąć statusu, który jest używany w zadaniach.');
        return;
    }
    
    appData.settings.statuses = appData.settings.statuses.filter(s => s.id !== statusId);
    saveData();
    renderSettings();
}

function addUser(name) {
    const newUser = {
        id: generateId(),
        name: name
    };
    
    appData.settings.users.push(newUser);
    saveData();
    renderSettings();
}

function deleteUser(userId) {
    // Sprawdzamy, czy użytkownik jest przypisany do zadań
    let isUsed = false;
    
    for (const project of appData.projects) {
        for (const section of project.sections) {
            for (const task of section.tasks) {
                if (task.assigneeId === userId) {
                    isUsed = true;
                    break;
                }
            }
            if (isUsed) break;
        }
        if (isUsed) break;
    }
    
    if (isUsed) {
        alert('Nie można usunąć użytkownika, który jest przypisany do zadań.');
        return;
    }
    
    appData.settings.users = appData.settings.users.filter(u => u.id !== userId);
    saveData();
    renderSettings();
}

// Obsługa modali
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Funkcja do renderowania ukończonych zadań
function renderCompletedTasks() {
    const completedTasksList = document.querySelector('.completed-tasks-list');
    completedTasksList.innerHTML = '';
    
    // Znajdujemy status "Zakończone"
    const completedStatus = appData.settings.statuses.find(s => s.name === 'Zakończone');
    if (!completedStatus) return;
    
    // Zbieramy wszystkie ukończone zadania ze wszystkich projektów
    const completedTasks = [];
    
    appData.projects.forEach(project => {
        project.sections.forEach(section => {
            if (section.tasks) {
                section.tasks.forEach(task => {
                    if (task.statusId === completedStatus.id) {
                        completedTasks.push({
                            task: task,
                            section: section,
                            project: project
                        });
                    }
                });
            }
        });
    });
    
    if (completedTasks.length === 0) {
        completedTasksList.innerHTML = `
            <div class="empty-state">
                <p>Brak ukończonych zadań.</p>
            </div>
        `;
        return;
    }
    
    // Sortujemy zadania od najnowszych do najstarszych (zakładając, że id jest rosnące w czasie)
    completedTasks.sort((a, b) => b.task.id - a.task.id);
    
    completedTasks.forEach(({ task, section, project }) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'completed-task-item';
        
        const assignee = task.assigneeId ? (appData.settings.users.find(u => u.id === task.assigneeId)?.name || 'Nieznany') : 'Brak';
        
        taskElement.innerHTML = `
            <div class="completed-task-info">
                <div class="completed-task-name">${task.name}</div>
                <div class="completed-task-details">
                    <span class="completed-task-project">Projekt: ${project.name} / ${section.name}</span>
                    <span class="completed-task-assignee">Przypisane do: ${assignee}</span>
                    <span class="completed-task-dates">
                        ${task.startDate ? `Od: ${formatDate(task.startDate)}` : ''}
                        ${task.endDate ? `Do: ${formatDate(task.endDate)}` : ''}
                    </span>
                </div>
            </div>
            <div class="completed-task-actions">
                <button class="btn btn-small btn-secondary view-task-btn" data-task-id="${task.id}">Szczegóły</button>
                <button class="btn btn-small btn-danger delete-completed-task-btn" data-task-id="${task.id}">Usuń</button>
            </div>
        `;
        
        completedTasksList.appendChild(taskElement);
    });
    
    // Dodajemy nasłuchiwanie zdarzeń
    document.querySelectorAll('.view-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            const result = findTaskById(taskId);
            
            if (result) {
                const { task, section } = result;
                
                document.getElementById('taskModalTitle').textContent = 'Szczegóły zadania';
                document.getElementById('taskName').value = task.name;
                document.getElementById('taskStartDate').value = task.startDate || '';
                document.getElementById('taskEndDate').value = task.endDate || '';
                
                // Wypełniamy opcje statusów
                const taskStatus = document.getElementById('taskStatus');
                taskStatus.innerHTML = '';
                appData.settings.statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status.id;
                    option.textContent = status.name;
                    if (status.id === task.statusId) {
                        option.selected = true;
                    }
                    taskStatus.appendChild(option);
                });
                
                // Wypełniamy opcje użytkowników
                const taskAssignee = document.getElementById('taskAssignee');
                taskAssignee.innerHTML = '<option value="">Brak</option>';
                appData.settings.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.name;
                    if (user.id === task.assigneeId) {
                        option.selected = true;
                    }
                    taskAssignee.appendChild(option);
                });
                
                // Wypełniamy podzadania
                const subtasksContainer = document.getElementById('subtasksContainer');
                subtasksContainer.innerHTML = '';
                
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        const subtaskItem = document.createElement('div');
                        subtaskItem.className = 'subtask-item';
                        subtaskItem.setAttribute('data-subtask-id', subtask.id);
                        subtaskItem.innerHTML = `
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <input type="text" placeholder="Nazwa podzadania" value="${subtask.name}">
                            <button type="button" class="btn btn-small btn-danger remove-subtask-btn">Usuń</button>
                        `;
                        
                        subtasksContainer.appendChild(subtaskItem);
                        
                        // Dodajemy nasłuchiwanie zdarzenia dla przycisku usuwania
                        subtaskItem.querySelector('.remove-subtask-btn').addEventListener('click', function() {
                            subtaskItem.remove();
                        });
                    });
                }
                
                document.getElementById('taskForm').setAttribute('data-mode', 'edit');
                document.getElementById('taskForm').setAttribute('data-task-id', taskId);
                document.getElementById('taskForm').setAttribute('data-section-id', section.id);
                
                openModal('taskModal');
            }
        });
    });
    
    document.querySelectorAll('.delete-completed-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            
            showConfirmDialog('Czy na pewno chcesz usunąć to zadanie?', function() {
                deleteTask(taskId);
                renderCompletedTasks();
            });
        });
    });
}

// Obsługa zdarzeń
function setupEventListeners() {
    // Przyciski w nagłówku
    document.getElementById('addProjectBtn').addEventListener('click', function() {
        document.getElementById('projectModalTitle').textContent = 'Dodaj nowy projekt';
        document.getElementById('projectForm').reset();
        document.getElementById('projectForm').setAttribute('data-mode', 'add');
        openModal('projectModal');
    });
    
    document.getElementById('completedTasksBtn').addEventListener('click', function() {
        document.getElementById('projectsContainer').style.display = 'none';
        document.getElementById('completedTasksContainer').style.display = 'block';
        renderCompletedTasks();
    });
    
    document.getElementById('backToProjectsBtn').addEventListener('click', function() {
        document.getElementById('completedTasksContainer').style.display = 'none';
        document.getElementById('projectsContainer').style.display = 'flex';
    });
    
    document.getElementById('settingsBtn').addEventListener('click', function() {
        renderSettings();
        openModal('settingsModal');
    });
    
    // Zamykanie modali
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Kliknięcie poza modalem
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Formularz projektu
    document.getElementById('projectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectName = document.getElementById('projectName').value.trim();
        const mode = this.getAttribute('data-mode');
        const projectId = this.getAttribute('data-project-id');
        
        if (mode === 'add') {
            addProject(projectName);
        } else if (mode === 'edit' && projectId) {
            updateProject(parseInt(projectId), projectName);
        }
        
        closeAllModals();
    });
    
    // Formularz sekcji
    document.getElementById('sectionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sectionName = document.getElementById('sectionName').value.trim();
        const mode = this.getAttribute('data-mode');
        const projectId = parseInt(this.getAttribute('data-project-id'));
        const sectionId = this.getAttribute('data-section-id');
        
        if (mode === 'add') {
            addSection(projectId, sectionName);
        } else if (mode === 'edit' && sectionId) {
            updateSection(projectId, parseInt(sectionId), sectionName);
        }
        
        closeAllModals();
    });
    
    // Formularz zadania
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskName = document.getElementById('taskName').value.trim();
        const statusId = parseInt(document.getElementById('taskStatus').value);
        const assigneeId = document.getElementById('taskAssignee').value ? parseInt(document.getElementById('taskAssignee').value) : null;
        const startDate = document.getElementById('taskStartDate').value;
        const endDate = document.getElementById('taskEndDate').value;
        
        // Zbieranie podzadań
        const subtasksContainer = document.getElementById('subtasksContainer');
        const subtaskItems = subtasksContainer.querySelectorAll('.subtask-item');
        const subtasks = [];
        
        subtaskItems.forEach(item => {
            const subtaskName = item.querySelector('input[type="text"]').value.trim();
            const completed = item.querySelector('input[type="checkbox"]').checked;
            
            if (subtaskName) {
                subtasks.push({
                    id: item.getAttribute('data-subtask-id') || generateId(),
                    name: subtaskName,
                    completed: completed
                });
            }
        });
        
        const taskData = {
            name: taskName,
            statusId: statusId,
            assigneeId: assigneeId,
            startDate: startDate,
            endDate: endDate,
            subtasks: subtasks
        };
        
        const mode = this.getAttribute('data-mode');
        
        if (mode === 'add') {
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            addTask(sectionId, taskData);
        } else if (mode === 'edit') {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            updateTask(taskId, taskData);
        }
        
        closeAllModals();
    });
    
    // Dodawanie podzadania
    document.getElementById('addSubtaskBtn').addEventListener('click', function() {
        const subtasksContainer = document.getElementById('subtasksContainer');
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        subtaskItem.setAttribute('data-subtask-id', generateId());
        subtaskItem.innerHTML = `
            <input type="checkbox">
            <input type="text" placeholder="Nazwa podzadania">
            <button type="button" class="btn btn-small btn-danger remove-subtask-btn">Usuń</button>
        `;
        
        subtasksContainer.appendChild(subtaskItem);
        
        // Dodajemy nasłuchiwanie zdarzenia dla przycisku usuwania
        subtaskItem.querySelector('.remove-subtask-btn').addEventListener('click', function() {
            subtaskItem.remove();
        });
    });
    
    // Formularz timesheet
    document.getElementById('addTimesheetEntryBtn').addEventListener('click', function() {
        const taskId = parseInt(document.getElementById('timesheetModal').getAttribute('data-task-id'));
        const date = document.getElementById('timesheetDate').value;
        const hours = parseFloat(document.getElementById('timesheetHours').value);
        const description = document.getElementById('timesheetDescription').value.trim();
        
        if (!date || isNaN(hours)) {
            alert('Proszę wypełnić wszystkie wymagane pola.');
            return;
        }
        
        addTimesheetEntry(taskId, { date, hours, description });
        
        // Resetujemy formularz
        document.getElementById('timesheetDate').value = '';
        document.getElementById('timesheetHours').value = '';
        document.getElementById('timesheetDescription').value = '';
    });
    
    // Ustawienia - zakładki
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Usuwamy klasę active ze wszystkich przycisków i paneli
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Dodajemy klasę active do wybranego przycisku i panelu
            this.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
    
    // Dodawanie statusu
    document.getElementById('addStatusBtn').addEventListener('click', function() {
        const statusName = document.getElementById('newStatus').value.trim();
        const statusColor = document.getElementById('statusColor').value;
        
        if (statusName) {
            addStatus(statusName, statusColor);
            document.getElementById('newStatus').value = '';
        }
    });
    
    // Dodawanie użytkownika
    document.getElementById('addUserBtn').addEventListener('click', function() {
        const userName = document.getElementById('newUser').value.trim();
        
        if (userName) {
            addUser(userName);
            document.getElementById('newUser').value = '';
        }
    });
    
    // Zapisywanie ustawień
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveData();
        closeAllModals();
        renderProjects();
    });
    
    // Obsługa modalu potwierdzenia
    document.getElementById('confirmYesBtn').addEventListener('click', function() {
        const callback = window.confirmCallback;
        if (callback) {
            callback();
            window.confirmCallback = null;
        }
        closeModal('confirmModal');
    });
    
    document.getElementById('confirmNoBtn').addEventListener('click', function() {
        window.confirmCallback = null;
        closeModal('confirmModal');
    });
}

function showConfirmDialog(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    window.confirmCallback = callback;
    openModal('confirmModal');
}

// Dodawanie nasłuchiwania zdarzeń dla projektów
function addProjectEventListeners() {
    // Edycja projektu
    document.querySelectorAll('.edit-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            const project = appData.projects.find(p => p.id === projectId);
            
            if (project) {
                document.getElementById('projectModalTitle').textContent = 'Edytuj projekt';
                document.getElementById('projectName').value = project.name;
                document.getElementById('projectForm').setAttribute('data-mode', 'edit');
                document.getElementById('projectForm').setAttribute('data-project-id', projectId);
                openModal('projectModal');
            }
        });
    });
    
    // Usuwanie projektu
    document.querySelectorAll('.delete-project-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            
            showConfirmDialog('Czy na pewno chcesz usunąć ten projekt? Wszystkie sekcje i zadania zostaną usunięte.', function() {
                deleteProject(projectId);
            });
        });
    });
    
    // Dodawanie sekcji
    document.querySelectorAll('.add-section-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            
            document.getElementById('sectionModalTitle').textContent = 'Dodaj nową sekcję';
            document.getElementById('sectionForm').reset();
            document.getElementById('sectionForm').setAttribute('data-mode', 'add');
            document.getElementById('sectionForm').setAttribute('data-project-id', projectId);
            openModal('sectionModal');
        });
    });
}

// Dodawanie nasłuchiwania zdarzeń dla sekcji
function addSectionEventListeners() {
    // Edycja sekcji
    document.querySelectorAll('.edit-section-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            
            const project = appData.projects.find(p => p.id === projectId);
            if (project) {
                const section = project.sections.find(s => s.id === sectionId);
                if (section) {
                    document.getElementById('sectionModalTitle').textContent = 'Edytuj sekcję';
                    document.getElementById('sectionName').value = section.name;
                    document.getElementById('sectionForm').setAttribute('data-mode', 'edit');
                    document.getElementById('sectionForm').setAttribute('data-project-id', projectId);
                    document.getElementById('sectionForm').setAttribute('data-section-id', sectionId);
                    openModal('sectionModal');
                }
            }
        });
    });
    
    // Usuwanie sekcji
    document.querySelectorAll('.delete-section-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-project-id'));
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            
            showConfirmDialog('Czy na pewno chcesz usunąć tę sekcję? Wszystkie zadania zostaną usunięte.', function() {
                deleteSection(projectId, sectionId);
            });
        });
    });
    
    // Dodawanie zadania
    document.querySelectorAll('.add-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            
            document.getElementById('taskModalTitle').textContent = 'Dodaj nowe zadanie';
            document.getElementById('taskForm').reset();
            document.getElementById('subtasksContainer').innerHTML = '';
            document.getElementById('taskForm').setAttribute('data-mode', 'add');
            document.getElementById('taskForm').setAttribute('data-section-id', sectionId);
            
            // Wypełniamy opcje statusów
            const taskStatus = document.getElementById('taskStatus');
            taskStatus.innerHTML = '';
            appData.settings.statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status.id;
                option.textContent = status.name;
                taskStatus.appendChild(option);
            });
            
            // Wypełniamy opcje użytkowników
            const taskAssignee = document.getElementById('taskAssignee');
            taskAssignee.innerHTML = '<option value="">Brak</option>';
            appData.settings.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                taskAssignee.appendChild(option);
            });
            
            openModal('taskModal');
        });
    });
}

// Funkcja do szybkiego dodawania podzadania
function quickAddSubtask(taskId, subtaskName) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    if (!task.subtasks) {
        task.subtasks = [];
    }
    
    const newSubtask = {
        id: generateId(),
        name: subtaskName,
        completed: false
    };
    
    task.subtasks.push(newSubtask);
    saveData();
    renderSections(project);
}

// Funkcja do aktualizacji statusu podzadania
function updateSubtaskStatus(taskId, subtaskId, completed) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    if (task.subtasks) {
        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = completed;
            
            // Aktualizujemy status zadania na podstawie postępu
            updateTaskStatusBasedOnProgress(task);
            
            saveData();
            renderSections(project);
            updateTasksCounter(); // Aktualizujemy licznik zadań
        }
    }
}

// Funkcja do aktualizacji statusu zadania na podstawie postępu
function updateTaskStatusBasedOnProgress(task) {
    const progress = calculateProgress(task);
    
    // Znajdujemy odpowiednie statusy
    const notStartedStatus = appData.settings.statuses.find(s => s.name === 'Nie rozpoczęte');
    const inProgressStatus = appData.settings.statuses.find(s => s.name === 'W trakcie');
    const completedStatus = appData.settings.statuses.find(s => s.name === 'Zakończone');
    
    // Aktualizujemy status zadania
    if (progress === 0 && notStartedStatus) {
        task.statusId = notStartedStatus.id;
    } else if (progress === 100 && completedStatus) {
        task.statusId = completedStatus.id;
    } else if (progress > 0 && progress < 100 && inProgressStatus) {
        task.statusId = inProgressStatus.id;
    }
}

// Funkcja do zmiany statusu zadania
function changeTaskStatus(taskId, statusId) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    task.statusId = statusId;
    saveData();
    renderSections(project);
    updateTasksCounter(); // Aktualizujemy licznik zadań
}

// Funkcja do oznaczania zadania jako ukończone
function completeTask(taskId) {
    const result = findTaskById(taskId);
    if (!result) return;
    
    const { task, project } = result;
    
    // Znajdujemy status "Zakończone"
    const completedStatus = appData.settings.statuses.find(s => s.name === 'Zakończone');
    
    // Jeśli zadanie ma już status "Zakończone", zmieniamy na "W trakcie"
    if (task.statusId === completedStatus?.id) {
        const inProgressStatus = appData.settings.statuses.find(s => s.name === 'W trakcie');
        if (inProgressStatus) {
            task.statusId = inProgressStatus.id;
        }
    } else if (completedStatus) {
        // W przeciwnym razie ustawiamy status "Zakończone"
        task.statusId = completedStatus.id;
        
        // Oznaczamy wszystkie podzadania jako ukończone
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                subtask.completed = true;
            });
        }
    }
    
    saveData();
    renderSections(project);
    
    // Odświeżamy widok ukończonych zadań, jeśli jest aktywny
    if (document.querySelector('.completed-tasks-container').style.display === 'block') {
        renderCompletedTasks();
    }
    
    // Aktualizujemy licznik zadań (funkcja zostanie dodana później)
    updateTasksCounter();
}

// Dodawanie nasłuchiwania zdarzeń dla zadań
function addTaskEventListeners() {
    // Edycja zadania
    document.querySelectorAll('.edit-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            const sectionId = parseInt(this.getAttribute('data-section-id'));
            
            const result = findTaskById(taskId);
            if (result) {
                const { task } = result;
                
                document.getElementById('taskModalTitle').textContent = 'Edytuj zadanie';
                document.getElementById('taskName').value = task.name;
                document.getElementById('taskStartDate').value = task.startDate || '';
                document.getElementById('taskEndDate').value = task.endDate || '';
                
                // Wypełniamy opcje statusów
                const taskStatus = document.getElementById('taskStatus');
                taskStatus.innerHTML = '';
                appData.settings.statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status.id;
                    option.textContent = status.name;
                    if (status.id === task.statusId) {
                        option.selected = true;
                    }
                    taskStatus.appendChild(option);
                });
                
                // Wypełniamy opcje użytkowników
                const taskAssignee = document.getElementById('taskAssignee');
                taskAssignee.innerHTML = '<option value="">Brak</option>';
                appData.settings.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.name;
                    if (user.id === task.assigneeId) {
                        option.selected = true;
                    }
                    taskAssignee.appendChild(option);
                });
                
                // Wypełniamy podzadania
                const subtasksContainer = document.getElementById('subtasksContainer');
                subtasksContainer.innerHTML = '';
                
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        const subtaskItem = document.createElement('div');
                        subtaskItem.className = 'subtask-item';
                        subtaskItem.setAttribute('data-subtask-id', subtask.id);
                        subtaskItem.innerHTML = `
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <input type="text" placeholder="Nazwa podzadania" value="${subtask.name}">
                            <button type="button" class="btn btn-small btn-danger remove-subtask-btn">Usuń</button>
                        `;
                        
                        subtasksContainer.appendChild(subtaskItem);
                        
                        // Dodajemy nasłuchiwanie zdarzenia dla przycisku usuwania
                        subtaskItem.querySelector('.remove-subtask-btn').addEventListener('click', function() {
                            subtaskItem.remove();
                        });
                    });
                }
                
                document.getElementById('taskForm').setAttribute('data-mode', 'edit');
                document.getElementById('taskForm').setAttribute('data-task-id', taskId);
                document.getElementById('taskForm').setAttribute('data-section-id', sectionId);
                
                openModal('taskModal');
            }
        });
    });
    
    // Usuwanie zadania
    document.querySelectorAll('.delete-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            
            showConfirmDialog('Czy na pewno chcesz usunąć to zadanie?', function() {
                deleteTask(taskId);
            });
        });
    });
    
    // Timesheet
    document.querySelectorAll('.timesheet-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            
            document.getElementById('timesheetModal').setAttribute('data-task-id', taskId);
            renderTimesheet(taskId);
            openModal('timesheetModal');
        });
    });
    
    // Dropdown statusów
    document.querySelectorAll('.status-dropdown-toggle').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Zapobiegamy propagacji zdarzenia
            
            const taskId = parseInt(this.getAttribute('data-task-id'));
            const dropdown = document.getElementById(`status-dropdown-${taskId}`);
            
            if (!dropdown) return;
            
            // Zamykamy wszystkie inne dropdowny
            document.querySelectorAll('.status-dropdown.show').forEach(dropdown => {
                if (dropdown.id !== `status-dropdown-${taskId}`) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Przełączamy widoczność dropdownu
            dropdown.classList.toggle('show');
            
            // Pozycjonujemy dropdown względem przycisku
            if (dropdown.classList.contains('show')) {
                const buttonRect = this.getBoundingClientRect();
                
                // Ustawiamy pozycję dropdownu
                dropdown.style.position = 'fixed';
                dropdown.style.top = `${buttonRect.bottom + window.scrollY}px`;
                dropdown.style.left = `${buttonRect.left + window.scrollX}px`;
            }
        });
    });
    
    // Wybór statusu z dropdownu
    document.querySelectorAll('.status-dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            const statusId = parseInt(this.getAttribute('data-status-id'));
            
            changeTaskStatus(taskId, statusId);
            
            // Zamykamy dropdown
            const dropdown = document.getElementById(`status-dropdown-${taskId}`);
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        });
    });
    
    // Oznaczanie zadania jako ukończone
    document.querySelectorAll('.complete-task-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            completeTask(taskId);
        });
    });
    
    // Szybkie dodawanie podzadania
    document.querySelectorAll('.quick-add-subtask-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            
            // Tworzymy prosty formularz inline
            const taskRow = document.querySelector(`.task-row[data-task-id="${taskId}"]`);
            const nextRow = taskRow.nextElementSibling;
            
            // Sprawdzamy, czy następny wiersz to wiersz z podzadaniami
            let subtasksRow;
            if (nextRow && nextRow.classList.contains('subtasks-row')) {
                subtasksRow = nextRow;
            } else {
                // Jeśli nie, tworzymy nowy wiersz
                subtasksRow = document.createElement('tr');
                subtasksRow.className = 'subtasks-row';
                
                const subtasksCell = document.createElement('td');
                subtasksCell.colSpan = 8;
                subtasksCell.className = 'subtasks-cell';
                
                const subtasksList = document.createElement('div');
                subtasksList.className = 'subtasks-list';
                
                subtasksCell.appendChild(subtasksList);
                subtasksRow.appendChild(subtasksCell);
                
                // Wstawiamy po wierszu zadania
                taskRow.parentNode.insertBefore(subtasksRow, taskRow.nextSibling);
            }
            
            // Dodajemy formularz do szybkiego dodawania podzadania
            const subtasksList = subtasksRow.querySelector('.subtasks-list');
            const quickAddForm = document.createElement('div');
            quickAddForm.className = 'quick-add-subtask-form';
            quickAddForm.innerHTML = `
                <input type="text" class="quick-subtask-input" placeholder="Wpisz nazwę podzadania i naciśnij Enter">
            `;
            
            subtasksList.appendChild(quickAddForm);
            
            // Ustawiamy focus na input
            const input = quickAddForm.querySelector('.quick-subtask-input');
            input.focus();
            
            // Obsługujemy zdarzenie naciśnięcia klawisza
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    const subtaskName = this.value.trim();
                    if (subtaskName) {
                        quickAddSubtask(taskId, subtaskName);
                        // Formularz zostanie usunięty przy ponownym renderowaniu
                    }
                } else if (e.key === 'Escape') {
                    quickAddForm.remove();
                }
            });
            
            // Obsługujemy utratę focusu
            input.addEventListener('blur', function() {
                // Dajemy chwilę na przetworzenie kliknięcia Enter
                setTimeout(() => {
                    quickAddForm.remove();
                }, 200);
            });
        });
    });
    
    // Obsługa checkboxów podzadań
    document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = parseInt(this.getAttribute('data-task-id'));
            const subtaskId = parseInt(this.getAttribute('data-subtask-id'));
            const completed = this.checked;
            
            // Aktualizujemy wygląd etykiety
            const label = this.nextElementSibling;
            if (completed) {
                label.classList.add('completed');
            } else {
                label.classList.remove('completed');
            }
            
            updateSubtaskStatus(taskId, subtaskId, completed);
        });
    });
    
    // Zamykanie dropdownów po kliknięciu poza nimi
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.status-dropdown-container') && !e.target.closest('.status-dropdown')) {
            document.querySelectorAll('.status-dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
}

// Funkcja do aktualizacji licznika zadań
function updateTasksCounter() {
    const tasksCounter = document.getElementById('tasksCounter');
    if (!tasksCounter) return;
    
    // Inicjalizujemy liczniki
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let notStartedTasks = 0;
    let delayedTasks = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    // Znajdujemy odpowiednie statusy
    const completedStatus = appData.settings.statuses.find(s => s.name === 'Zakończone');
    const inProgressStatus = appData.settings.statuses.find(s => s.name === 'W trakcie');
    const notStartedStatus = appData.settings.statuses.find(s => s.name === 'Nie rozpoczęte');
    const delayedStatus = appData.settings.statuses.find(s => s.name === 'Opóźnione');
    
    // Zliczamy zadania i podzadania
    appData.projects.forEach(project => {
        project.sections.forEach(section => {
            if (section.tasks && section.tasks.length > 0) {
                section.tasks.forEach(task => {
                    totalTasks++;
                    
                    // Zliczamy zadania według statusów
                    if (task.statusId === completedStatus?.id) {
                        completedTasks++;
                    } else if (task.statusId === inProgressStatus?.id) {
                        inProgressTasks++;
                    } else if (task.statusId === notStartedStatus?.id) {
                        notStartedTasks++;
                    } else if (task.statusId === delayedStatus?.id) {
                        delayedTasks++;
                    }
                    
                    // Zliczamy podzadania
                    if (task.subtasks && task.subtasks.length > 0) {
                        totalSubtasks += task.subtasks.length;
                        completedSubtasks += task.subtasks.filter(subtask => subtask.completed).length;
                    }
                });
            }
        });
    });
    
    // Tworzymy HTML dla licznika
    tasksCounter.innerHTML = `
        <div class="counter-item">
            <span>Wszystkie zadania:</span>
            <span class="counter-badge" style="background-color: var(--color-gray-600);">${totalTasks}</span>
        </div>
        <div class="counter-item">
            <span>Ukończone:</span>
            <span class="counter-badge" style="background-color: var(--color-success);">${completedTasks}</span>
        </div>
        <div class="counter-item">
            <span>W trakcie:</span>
            <span class="counter-badge" style="background-color: var(--color-primary);">${inProgressTasks}</span>
        </div>
        <div class="counter-item">
            <span>Nie rozpoczęte:</span>
            <span class="counter-badge" style="background-color: var(--color-gray-500);">${notStartedTasks}</span>
        </div>
        <div class="counter-item">
            <span>Opóźnione:</span>
            <span class="counter-badge" style="background-color: var(--color-danger);">${delayedTasks}</span>
        </div>
        <div class="counter-item">
            <span>Podzadania:</span>
            <span class="counter-badge" style="background-color: var(--color-secondary);">${completedSubtasks}/${totalSubtasks}</span>
        </div>
    `;
}

// Inicjalizacja aplikacji
function initApp() {
    loadData();
    renderProjects();
    updateTasksCounter(); // Dodajemy wywołanie funkcji licznika
    setupEventListeners();
}

// Uruchamiamy aplikację po załadowaniu strony
document.addEventListener('DOMContentLoaded', initApp);
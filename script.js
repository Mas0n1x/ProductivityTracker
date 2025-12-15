// DOM Elemente
const coffeeFill = document.getElementById('coffeeFill');
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const completedCount = document.getElementById('completedCount');
const totalTime = document.getElementById('totalTime');
const steam = document.querySelector('.steam');
const activeTaskEl = document.getElementById('activeTask');
const clearDoneBtn = document.getElementById('clearDoneBtn');

// Modal Elemente
const taskModal = document.getElementById('taskModal');
const modalClose = document.getElementById('modalClose');
const modalTaskTitle = document.getElementById('modalTaskTitle');
const modalTaskDesc = document.getElementById('modalTaskDesc');
const modalTaskTime = document.getElementById('modalTaskTime');
const labelPicker = document.getElementById('labelPicker');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');

// Kanban Spalten
const columns = {
    backlog: document.getElementById('backlog-tasks'),
    inprogress: document.getElementById('inprogress-tasks'),
    done: document.getElementById('done-tasks')
};

// Timer Variablen
let timerInterval = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let isRunning = false;

// Task Variablen
let tasks = [];
let activeTaskId = null;
let editingTaskId = null;
let completedToday = 0;
let totalMinutes = 0;

// Labels Konfiguration
const labelConfig = {
    '#f44336': 'Dringend',
    '#ff9800': 'Medium',
    '#4CAF50': 'Einfach',
    '#2196F3': 'Feature',
    '#9c27b0': 'Bug'
};

// Daten aus LocalStorage laden
function loadData() {
    const savedTasks = localStorage.getItem('kanbanTasks');
    const savedStats = localStorage.getItem('productivityStats');
    const savedDate = localStorage.getItem('productivityDate');

    const today = new Date().toDateString();

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedStats && savedDate === today) {
        const stats = JSON.parse(savedStats);
        completedToday = stats.completed;
        totalMinutes = stats.totalMinutes;
    } else {
        localStorage.setItem('productivityDate', today);
        completedToday = 0;
        totalMinutes = 0;
        saveStats();
    }

    renderAllTasks();
    updateStats();
}

// Daten speichern
function saveTasks() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
}

function saveStats() {
    localStorage.setItem('productivityStats', JSON.stringify({
        completed: completedToday,
        totalMinutes: totalMinutes
    }));
    localStorage.setItem('productivityDate', new Date().toDateString());
}

// Task erstellen
function createTask(title, time, status = 'backlog') {
    const task = {
        id: Date.now(),
        title: title,
        description: '',
        time: time || 25,
        status: status,
        labels: [],
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderAllTasks();
    return task;
}

// Task Card HTML erstellen
function createTaskCardHTML(task) {
    const labelsHTML = task.labels.map(color =>
        `<span class="task-label" style="background: ${color}">${labelConfig[color] || ''}</span>`
    ).join('');

    return `
        <div class="task-card ${task.id === activeTaskId ? 'selected' : ''}"
             draggable="true"
             data-id="${task.id}">
            <div class="task-card-header">
                <span class="task-title">${task.title}</span>
                <button class="task-edit-btn" onclick="openEditModal(${task.id}, event)">✎</button>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-footer">
                <div class="task-labels">${labelsHTML}</div>
                <span class="task-time">${task.time} Min</span>
            </div>
        </div>
    `;
}

// Alle Tasks rendern
function renderAllTasks() {
    // Spalten leeren
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Tasks in Spalten einfügen
    tasks.forEach(task => {
        const column = columns[task.status];
        if (column) {
            column.insertAdjacentHTML('beforeend', createTaskCardHTML(task));
        }
    });

    // Drag & Drop Events hinzufügen
    document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('click', handleTaskClick);
    });

    // Task Counts aktualisieren
    updateTaskCounts();

    // Aktive Task anzeigen
    updateActiveTaskDisplay();
}

// Task Counts aktualisieren
function updateTaskCounts() {
    document.getElementById('backlog-count').textContent =
        tasks.filter(t => t.status === 'backlog').length;
    document.getElementById('inprogress-count').textContent =
        tasks.filter(t => t.status === 'inprogress').length;
    document.getElementById('done-count').textContent =
        tasks.filter(t => t.status === 'done').length;
}

// Drag & Drop Handler
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.column-content').forEach(col => {
        col.classList.remove('drag-over');
    });
}

// Drop Zones einrichten
Object.entries(columns).forEach(([status, column]) => {
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', (e) => {
        column.classList.remove('drag-over');
    });

    column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');

        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            const oldStatus = task.status;
            task.status = status;

            // Wenn Task nach "In Arbeit" verschoben wird
            if (status === 'inprogress' && oldStatus !== 'inprogress') {
                // Prüfen ob schon eine Task in Arbeit ist
                const otherInProgress = tasks.find(t => t.id !== taskId && t.status === 'inprogress');
                if (otherInProgress && isRunning) {
                    // Timer läuft noch, Task zurücksetzen
                    task.status = oldStatus;
                    alert('Bitte beende erst die aktuelle Aufgabe!');
                    saveTasks();
                    renderAllTasks();
                    return;
                }

                // Timer für diese Task setzen
                setActiveTask(taskId);
            }

            // Wenn aktive Task verschoben wird
            if (taskId === activeTaskId) {
                if (status === 'done') {
                    completeTask();
                } else if (status === 'backlog') {
                    resetActiveTask();
                }
            }

            saveTasks();
            renderAllTasks();
        }
    });
});

// Task anklicken
function handleTaskClick(e) {
    if (e.target.classList.contains('task-edit-btn')) return;

    const taskId = parseInt(e.currentTarget.dataset.id);
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status === 'inprogress' && !isRunning) {
        setActiveTask(taskId);
    }
}

// Aktive Task setzen
function setActiveTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    activeTaskId = taskId;
    totalSeconds = task.time * 60;
    remainingSeconds = totalSeconds;

    startBtn.disabled = false;
    updateTimerDisplay();
    updateCoffeeFill();
    renderAllTasks();
}

// Aktive Task zurücksetzen
function resetActiveTask() {
    if (isRunning) {
        pauseTimer();
    }
    activeTaskId = null;
    totalSeconds = 0;
    remainingSeconds = 0;
    startBtn.disabled = true;
    updateTimerDisplay();
    updateCoffeeFill();
    updateActiveTaskDisplay();
}

// Aktive Task Anzeige aktualisieren
function updateActiveTaskDisplay() {
    if (activeTaskId) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
            activeTaskEl.innerHTML = `
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <span>${task.time} Minuten</span>
                </div>
            `;
            return;
        }
    }
    activeTaskEl.innerHTML = '<p class="no-task">Ziehe eine Aufgabe nach "In Arbeit"</p>';
}

// Task als erledigt markieren
function completeTask() {
    const task = tasks.find(t => t.id === activeTaskId);
    if (task) {
        task.status = 'done';
        completedToday++;
        totalMinutes += task.time;

        saveTasks();
        saveStats();
        updateStats();
    }

    resetActiveTask();
    renderAllTasks();
}

// Statistiken aktualisieren
function updateStats() {
    completedCount.textContent = completedToday;
    totalTime.textContent = totalMinutes;
}

// Timer starten
function startTimer() {
    if (!activeTaskId) return;

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    steam.classList.add('active');

    timerInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            timerComplete();
            return;
        }

        updateTimerDisplay();
        updateCoffeeFill();
    }, 1000);
}

// Timer pausieren
function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    steam.classList.remove('active');
}

// Timer zurücksetzen
function resetTimer() {
    pauseTimer();

    if (activeTaskId) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
            totalSeconds = task.time * 60;
            remainingSeconds = totalSeconds;
        }
    } else {
        totalSeconds = 0;
        remainingSeconds = 0;
    }

    startBtn.disabled = !activeTaskId;
    updateTimerDisplay();
    updateCoffeeFill();
}

// Timer abgeschlossen
function timerComplete() {
    isRunning = false;
    steam.classList.remove('active');

    // Benachrichtigung
    if (Notification.permission === 'granted') {
        new Notification('Aufgabe erledigt!', {
            body: 'Dein Kaffee ist leer - Zeit für eine Pause!',
            icon: '☕'
        });
    }

    playCompletionSound();

    // Task als erledigt markieren und verschieben
    const task = tasks.find(t => t.id === activeTaskId);
    if (task) {
        task.status = 'done';
        saveTasks();
    }
    completeTask();
}

// Completion Sound
function playCompletionSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio nicht verfügbar');
    }
}

// Timer Anzeige aktualisieren
function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Kaffee-Füllstand aktualisieren
function updateCoffeeFill() {
    if (totalSeconds === 0) {
        coffeeFill.style.height = '0%';
        return;
    }

    const fillPercentage = (remainingSeconds / totalSeconds) * 100;
    coffeeFill.style.height = `${fillPercentage}%`;
}

// Modal öffnen
function openEditModal(taskId, event) {
    if (event) event.stopPropagation();

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    modalTaskTitle.value = task.title;
    modalTaskDesc.value = task.description || '';
    modalTaskTime.value = task.time;

    // Labels zurücksetzen und setzen
    document.querySelectorAll('.label-option').forEach(opt => {
        opt.classList.remove('selected');
        if (task.labels.includes(opt.dataset.color)) {
            opt.classList.add('selected');
        }
    });

    taskModal.classList.add('active');
}

// Modal schließen
function closeModal() {
    taskModal.classList.remove('active');
    editingTaskId = null;
}

// Task speichern
function saveTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    task.title = modalTaskTitle.value.trim() || task.title;
    task.description = modalTaskDesc.value.trim();
    task.time = parseInt(modalTaskTime.value) || task.time;

    // Labels sammeln
    task.labels = [];
    document.querySelectorAll('.label-option.selected').forEach(opt => {
        task.labels.push(opt.dataset.color);
    });

    // Wenn aktive Task bearbeitet wurde, Timer aktualisieren
    if (editingTaskId === activeTaskId && !isRunning) {
        totalSeconds = task.time * 60;
        remainingSeconds = totalSeconds;
        updateTimerDisplay();
        updateCoffeeFill();
    }

    saveTasks();
    renderAllTasks();
    closeModal();
}

// Task löschen
function deleteTask() {
    if (editingTaskId === activeTaskId) {
        resetActiveTask();
    }

    tasks = tasks.filter(t => t.id !== editingTaskId);
    saveTasks();
    renderAllTasks();
    closeModal();
}

// Erledigte Tasks löschen
function clearDoneTasks() {
    tasks = tasks.filter(t => t.status !== 'done');
    saveTasks();
    renderAllTasks();
}

// Event Listener für Modal
modalClose.addEventListener('click', closeModal);
saveTaskBtn.addEventListener('click', saveTask);
deleteTaskBtn.addEventListener('click', deleteTask);
clearDoneBtn.addEventListener('click', clearDoneTasks);

taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal();
});

// Label Picker
labelPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('label-option')) {
        e.target.classList.toggle('selected');
    }
});

// Timer Buttons
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Add Task Forms
document.querySelectorAll('.btn-add-task').forEach(btn => {
    btn.addEventListener('click', () => {
        const column = btn.dataset.column;
        const taskInput = document.querySelector(`.task-input[data-column="${column}"]`);
        const timeInput = document.querySelector(`.time-input[data-column="${column}"]`);

        const title = taskInput.value.trim();
        const time = parseInt(timeInput.value) || 25;

        if (title) {
            createTask(title, time, column);
            taskInput.value = '';
            timeInput.value = '';
            taskInput.focus();
        }
    });
});

// Enter-Taste für Input
document.querySelectorAll('.task-input, .time-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const column = input.dataset.column;
            document.querySelector(`.btn-add-task[data-column="${column}"]`).click();
        }
    });
});

// Benachrichtigungen anfragen
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Globale Funktion für Edit Button
window.openEditModal = openEditModal;

// ========================================
// STOPPUHR FUNKTIONALITÄT
// ========================================

// Stoppuhr DOM Elemente
const stopwatchDisplay = document.getElementById('stopwatchDisplay');
const stopwatchStartBtn = document.getElementById('stopwatchStartBtn');
const stopwatchStopBtn = document.getElementById('stopwatchStopBtn');
const stopwatchResetBtn = document.getElementById('stopwatchResetBtn');

// Stoppuhr Variablen
let stopwatchInterval = null;
let stopwatchSeconds = 0;
let isStopwatchRunning = false;

// Stoppuhr Anzeige aktualisieren
function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;
    stopwatchDisplay.textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Stoppuhr starten
function startStopwatch() {
    if (!activeTaskId) return;

    isStopwatchRunning = true;
    stopwatchStartBtn.disabled = true;
    stopwatchStopBtn.disabled = false;
    stopwatchDisplay.classList.add('running');

    stopwatchInterval = setInterval(() => {
        stopwatchSeconds++;
        updateStopwatchDisplay();
    }, 1000);
}

// Stoppuhr stoppen
function stopStopwatch() {
    isStopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchStartBtn.disabled = !activeTaskId;
    stopwatchStopBtn.disabled = true;
    stopwatchDisplay.classList.remove('running');
}

// Stoppuhr zurücksetzen
function resetStopwatch() {
    stopStopwatch();
    stopwatchSeconds = 0;
    updateStopwatchDisplay();
}

// Stoppuhr aktivieren wenn Task aktiv wird
function enableStopwatch() {
    stopwatchStartBtn.disabled = false;
    stopwatchResetBtn.disabled = false;
}

// Stoppuhr deaktivieren wenn keine Task aktiv
function disableStopwatch() {
    stopStopwatch();
    stopwatchStartBtn.disabled = true;
    stopwatchStopBtn.disabled = true;
}

// Originale setActiveTask Funktion erweitern
const originalSetActiveTask = setActiveTask;
setActiveTask = function(taskId) {
    originalSetActiveTask(taskId);
    resetStopwatch();
    enableStopwatch();
};

// Originale resetActiveTask Funktion erweitern
const originalResetActiveTask = resetActiveTask;
resetActiveTask = function() {
    originalResetActiveTask();
    resetStopwatch();
    disableStopwatch();
};

// Stoppuhr Event Listener
stopwatchStartBtn.addEventListener('click', startStopwatch);
stopwatchStopBtn.addEventListener('click', stopStopwatch);
stopwatchResetBtn.addEventListener('click', resetStopwatch);

// Initial laden
loadData();
updateTimerDisplay();
updateCoffeeFill();
updateStopwatchDisplay();

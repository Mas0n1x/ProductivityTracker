// DOM Elemente
const coffeeFill = document.getElementById('coffeeFill');
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const todoInput = document.getElementById('todoInput');
const todoTime = document.getElementById('todoTime');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const completedCount = document.getElementById('completedCount');
const totalTime = document.getElementById('totalTime');
const steam = document.querySelector('.steam');

// Timer Variablen
let timerInterval = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let isRunning = false;

// Todo Variablen
let todos = [];
let selectedTodoId = null;
let completedToday = 0;
let totalMinutes = 0;

// Daten aus LocalStorage laden
function loadData() {
    const savedTodos = localStorage.getItem('productivityTodos');
    const savedStats = localStorage.getItem('productivityStats');
    const savedDate = localStorage.getItem('productivityDate');

    const today = new Date().toDateString();

    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }

    if (savedStats && savedDate === today) {
        const stats = JSON.parse(savedStats);
        completedToday = stats.completed;
        totalMinutes = stats.totalMinutes;
        updateStats();
    } else {
        // Neuer Tag - Statistiken zurücksetzen
        localStorage.setItem('productivityDate', today);
        completedToday = 0;
        totalMinutes = 0;
        saveStats();
    }
}

// Daten speichern
function saveTodos() {
    localStorage.setItem('productivityTodos', JSON.stringify(todos));
}

function saveStats() {
    localStorage.setItem('productivityStats', JSON.stringify({
        completed: completedToday,
        totalMinutes: totalMinutes
    }));
    localStorage.setItem('productivityDate', new Date().toDateString());
}

// Todo hinzufügen
function addTodo() {
    const text = todoInput.value.trim();
    const time = parseInt(todoTime.value) || 25;

    if (!text) {
        todoInput.focus();
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        time: time,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    renderTodos();

    todoInput.value = '';
    todoTime.value = '';
    todoInput.focus();
}

// Todos rendern
function renderTodos() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.id === selectedTodoId ? 'selected' : ''}`;
        li.innerHTML = `
            <span class="todo-text">${todo.text}</span>
            <span class="todo-time">${todo.time} Min</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id}, event)">✕</button>
        `;

        if (!todo.completed) {
            li.onclick = () => selectTodo(todo.id);
        }

        todoList.appendChild(li);
    });
}

// Todo auswählen
function selectTodo(id) {
    if (isRunning) return;

    const todo = todos.find(t => t.id === id);
    if (!todo || todo.completed) return;

    selectedTodoId = id;
    totalSeconds = todo.time * 60;
    remainingSeconds = totalSeconds;

    updateTimerDisplay();
    updateCoffeeFill();
    renderTodos();

    startBtn.disabled = false;
}

// Todo löschen
function deleteTodo(id, event) {
    event.stopPropagation();

    if (selectedTodoId === id) {
        resetTimer();
    }

    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Todo als erledigt markieren
function completeTodo() {
    const todo = todos.find(t => t.id === selectedTodoId);
    if (todo) {
        todo.completed = true;
        completedToday++;
        totalMinutes += todo.time;

        saveTodos();
        saveStats();
        updateStats();
        renderTodos();
    }

    selectedTodoId = null;
    resetTimer();
}

// Statistiken aktualisieren
function updateStats() {
    completedCount.textContent = completedToday;
    totalTime.textContent = totalMinutes;
}

// Timer starten
function startTimer() {
    if (!selectedTodoId) return;

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
    isRunning = false;
    clearInterval(timerInterval);

    if (selectedTodoId) {
        const todo = todos.find(t => t.id === selectedTodoId);
        if (todo) {
            totalSeconds = todo.time * 60;
            remainingSeconds = totalSeconds;
        }
    } else {
        totalSeconds = 0;
        remainingSeconds = 0;
    }

    startBtn.disabled = !selectedTodoId;
    pauseBtn.disabled = true;
    steam.classList.remove('active');

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

    // Sound abspielen (optional - wenn Audio Element vorhanden)
    playCompletionSound();

    // Todo als erledigt markieren
    completeTodo();
}

// Completion Sound
function playCompletionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
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

// Event Listener
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTodoBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

todoTime.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Benachrichtigungen anfragen
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initial laden
loadData();
updateTimerDisplay();
updateCoffeeFill();
startBtn.disabled = true;

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
const modalTaskCategory = document.getElementById('modalTaskCategory');
const modalTaskNotes = document.getElementById('modalTaskNotes');
const labelPicker = document.getElementById('labelPicker');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');

// Gamification DOM Elemente
const levelNumber = document.getElementById('levelNumber');
const xpBar = document.getElementById('xpBar');
const xpText = document.getElementById('xpText');
const streakCount = document.getElementById('streakCount');
const streakBadge = document.getElementById('streakBadge');
const dailyGoalProgress = document.getElementById('dailyGoalProgress');
const dailyGoalValue = document.getElementById('dailyGoalValue');
const editDailyGoal = document.getElementById('editDailyGoal');
const statsToggle = document.getElementById('statsToggle');
const statsPanel = document.getElementById('statsPanel');
const statsClose = document.getElementById('statsClose');
const statsTabContent = document.getElementById('statsTabContent');
const achievementsToggle = document.getElementById('achievementsToggle');
const achievementsPanel = document.getElementById('achievementsPanel');
const achievementsClose = document.getElementById('achievementsClose');
const achievementsGrid = document.getElementById('achievementsGrid');
const achievementNotification = document.getElementById('achievementNotification');
const achievementIcon = document.getElementById('achievementIcon');
const achievementName = document.getElementById('achievementName');
const levelupNotification = document.getElementById('levelupNotification');
const levelupLevel = document.getElementById('levelupLevel');

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

// Gamification Variablen
let playerData = {
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    lastActiveDate: null,
    dailyGoal: 120,
    achievements: [],
    weeklyStats: {},
    completedTasks: []
};

// Labels Konfiguration
const labelConfig = {
    '#f44336': 'Dringend',
    '#ff9800': 'Medium',
    '#4CAF50': 'Einfach',
    '#2196F3': 'Feature',
    '#9c27b0': 'Bug'
};

// Kategorie Konfiguration
const categoryConfig = {
    'arbeit': { icon: '💼', name: 'Arbeit' },
    'privat': { icon: '🏠', name: 'Privat' },
    'lernen': { icon: '📚', name: 'Lernen' },
    'sport': { icon: '💪', name: 'Sport' },
    'projekt': { icon: '🚀', name: 'Projekt' }
};

// Achievements Definition
const achievementsList = [
    { id: 'first_task', name: 'Erste Schritte', desc: 'Erste Aufgabe erledigt', icon: '🎯', condition: (data) => data.completedTasks.length >= 1 },
    { id: 'five_tasks', name: 'Produktiv', desc: '5 Aufgaben erledigt', icon: '⭐', condition: (data) => data.completedTasks.length >= 5 },
    { id: 'ten_tasks', name: 'Fleißig', desc: '10 Aufgaben erledigt', icon: '🌟', condition: (data) => data.completedTasks.length >= 10 },
    { id: 'twentyfive_tasks', name: 'Taskmaster', desc: '25 Aufgaben erledigt', icon: '💫', condition: (data) => data.completedTasks.length >= 25 },
    { id: 'fifty_tasks', name: 'Produktivitäts-König', desc: '50 Aufgaben erledigt', icon: '👑', condition: (data) => data.completedTasks.length >= 50 },
    { id: 'streak_3', name: 'Durchhalter', desc: '3 Tage Streak', icon: '🔥', condition: (data) => data.streak >= 3 },
    { id: 'streak_7', name: 'Wochenkrieger', desc: '7 Tage Streak', icon: '🔥🔥', condition: (data) => data.streak >= 7 },
    { id: 'streak_14', name: 'Unstoppbar', desc: '14 Tage Streak', icon: '💪', condition: (data) => data.streak >= 14 },
    { id: 'streak_30', name: 'Legende', desc: '30 Tage Streak', icon: '🏆', condition: (data) => data.streak >= 30 },
    { id: 'level_5', name: 'Aufsteiger', desc: 'Level 5 erreicht', icon: '⚡', condition: (data) => data.level >= 5 },
    { id: 'level_10', name: 'Veteran', desc: 'Level 10 erreicht', icon: '⚡⚡', condition: (data) => data.level >= 10 },
    { id: 'daily_goal', name: 'Tagesziel', desc: 'Tagesziel erreicht', icon: '🎯', condition: (data) => totalMinutes >= data.dailyGoal },
    { id: 'speed_demon', name: 'Speedrunner', desc: 'Task 20% schneller erledigt', icon: '⚡', condition: () => false }, // Special check
    { id: 'night_owl', name: 'Nachteule', desc: 'Task nach 22 Uhr erledigt', icon: '🦉', condition: () => new Date().getHours() >= 22 },
    { id: 'early_bird', name: 'Frühaufsteher', desc: 'Task vor 7 Uhr erledigt', icon: '🐦', condition: () => new Date().getHours() < 7 },
    { id: 'category_master', name: 'Allrounder', desc: 'Tasks in allen Kategorien', icon: '🎨', condition: (data) => {
        const cats = new Set(data.completedTasks.map(t => t.category).filter(c => c));
        return cats.size >= 5;
    }}
];

// XP pro Level berechnen
function getXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Daten aus LocalStorage laden
function loadData() {
    const savedTasks = localStorage.getItem('kanbanTasks');
    const savedStats = localStorage.getItem('productivityStats');
    const savedDate = localStorage.getItem('productivityDate');
    const savedPlayerData = localStorage.getItem('playerData');

    const today = new Date().toDateString();

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedPlayerData) {
        playerData = { ...playerData, ...JSON.parse(savedPlayerData) };
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

    // Streak überprüfen
    checkStreak();

    renderAllTasks();
    updateStats();
    updateGamificationUI();
    renderAchievements();
}

// Player Data speichern
function savePlayerData() {
    localStorage.setItem('playerData', JSON.stringify(playerData));
}

// Streak prüfen
function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (playerData.lastActiveDate === today) {
        // Heute schon aktiv, nichts tun
    } else if (playerData.lastActiveDate === yesterday) {
        // Gestern aktiv, Streak weiterführen (wird bei Task-Abschluss erhöht)
    } else if (playerData.lastActiveDate && playerData.lastActiveDate !== today) {
        // Mehr als ein Tag vergangen, Streak zurücksetzen
        playerData.streak = 0;
        savePlayerData();
    }
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
function createTask(title, time, status = 'backlog', category = '') {
    const task = {
        id: Date.now(),
        title: title,
        description: '',
        notes: '',
        time: time || 25,
        actualTime: null,
        status: status,
        category: category,
        labels: [],
        createdAt: new Date().toISOString(),
        completedAt: null
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

    const categoryHTML = task.category && categoryConfig[task.category]
        ? `<span class="task-category">${categoryConfig[task.category].icon} ${categoryConfig[task.category].name}</span>`
        : '';

    // Zeit-Vergleich für erledigte Tasks
    let timeComparisonHTML = '';
    if (task.status === 'done' && task.actualTime !== null) {
        const diff = task.actualTime - task.time;
        const diffClass = diff < 0 ? 'faster' : (diff > 0 ? 'slower' : '');
        const diffText = diff < 0 ? `${Math.abs(diff)} Min schneller` : (diff > 0 ? `${diff} Min länger` : 'Perfekt!');
        timeComparisonHTML = `
            <div class="time-comparison">
                <span class="time-estimated">Geplant: ${task.time}m</span>
                <span class="time-actual ${diffClass}">Tatsächlich: ${task.actualTime}m (${diffText})</span>
            </div>
        `;
    }

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
                <div class="task-labels">
                    ${categoryHTML}
                    ${labelsHTML}
                </div>
                <span class="task-time">${task.time} Min</span>
            </div>
            ${timeComparisonHTML}
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
        task.completedAt = new Date().toISOString();

        // Tatsächliche Zeit speichern (von Stoppuhr)
        const actualMinutes = Math.ceil(stopwatchSeconds / 60);
        task.actualTime = actualMinutes > 0 ? actualMinutes : task.time;

        completedToday++;
        totalMinutes += task.time;

        // XP vergeben
        const xpEarned = calculateXP(task);
        addXP(xpEarned);

        // Streak aktualisieren
        updateStreak();

        // Task zu completedTasks hinzufügen
        playerData.completedTasks.push({
            id: task.id,
            title: task.title,
            category: task.category,
            estimatedTime: task.time,
            actualTime: task.actualTime,
            completedAt: task.completedAt
        });

        // Wöchentliche Stats aktualisieren
        updateWeeklyStats(task);

        // Achievements prüfen
        checkAchievements(task);

        saveTasks();
        saveStats();
        savePlayerData();
        updateStats();
        updateGamificationUI();
    }

    resetActiveTask();
    renderAllTasks();
}

// XP berechnen
function calculateXP(task) {
    let xp = 10; // Basis-XP
    xp += Math.floor(task.time / 5); // +2 XP pro 10 Minuten

    // Bonus für schnelleres Erledigen
    if (task.actualTime && task.actualTime < task.time * 0.8) {
        xp += 5; // Speed Bonus
    }

    return xp;
}

// XP hinzufügen
function addXP(amount) {
    playerData.xp += amount;
    playerData.totalXp += amount;

    // Level-Up prüfen
    const xpNeeded = getXpForLevel(playerData.level);
    while (playerData.xp >= xpNeeded) {
        playerData.xp -= xpNeeded;
        playerData.level++;
        showLevelUp(playerData.level);
    }

    savePlayerData();
    updateGamificationUI();
}

// Level-Up Anzeige
function showLevelUp(level) {
    levelupLevel.textContent = `Level ${level}`;
    levelupNotification.classList.add('show');
    playCompletionSound();

    setTimeout(() => {
        levelupNotification.classList.remove('show');
    }, 3000);

    // Level Achievements prüfen
    checkAchievements();
}

// Streak aktualisieren
function updateStreak() {
    const today = new Date().toDateString();

    if (playerData.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (playerData.lastActiveDate === yesterday || !playerData.lastActiveDate) {
            playerData.streak++;
        } else {
            playerData.streak = 1;
        }

        playerData.lastActiveDate = today;
        savePlayerData();
    }
}

// Wöchentliche Stats aktualisieren
function updateWeeklyStats(task) {
    const today = new Date().toISOString().split('T')[0];

    if (!playerData.weeklyStats[today]) {
        playerData.weeklyStats[today] = {
            completed: 0,
            totalMinutes: 0,
            categories: {}
        };
    }

    playerData.weeklyStats[today].completed++;
    playerData.weeklyStats[today].totalMinutes += task.actualTime || task.time;

    if (task.category) {
        playerData.weeklyStats[today].categories[task.category] =
            (playerData.weeklyStats[today].categories[task.category] || 0) + 1;
    }

    // Alte Stats entfernen (älter als 30 Tage)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    Object.keys(playerData.weeklyStats).forEach(date => {
        if (date < thirtyDaysAgo) {
            delete playerData.weeklyStats[date];
        }
    });
}

// Achievements prüfen
function checkAchievements(task = null) {
    achievementsList.forEach(achievement => {
        if (!playerData.achievements.includes(achievement.id)) {
            let unlocked = false;

            // Spezial-Check für Speedrunner
            if (achievement.id === 'speed_demon' && task) {
                if (task.actualTime && task.actualTime < task.time * 0.8) {
                    unlocked = true;
                }
            } else {
                unlocked = achievement.condition(playerData);
            }

            if (unlocked) {
                playerData.achievements.push(achievement.id);
                showAchievementUnlock(achievement);
                savePlayerData();
                renderAchievements();
            }
        }
    });
}

// Achievement Unlock anzeigen
function showAchievementUnlock(achievement) {
    achievementIcon.textContent = achievement.icon;
    achievementName.textContent = achievement.name;
    achievementNotification.classList.add('show');
    playCompletionSound();

    setTimeout(() => {
        achievementNotification.classList.remove('show');
    }, 4000);
}

// Gamification UI aktualisieren
function updateGamificationUI() {
    // Level
    levelNumber.textContent = playerData.level;

    // XP Bar
    const xpNeeded = getXpForLevel(playerData.level);
    const xpPercent = (playerData.xp / xpNeeded) * 100;
    xpBar.style.width = `${xpPercent}%`;
    xpText.textContent = `${playerData.xp} / ${xpNeeded} XP`;

    // Streak
    streakCount.textContent = playerData.streak;
    if (playerData.streak > 0) {
        streakBadge.classList.remove('inactive');
    } else {
        streakBadge.classList.add('inactive');
    }

    // Daily Goal
    const goalPercent = Math.min((totalMinutes / playerData.dailyGoal) * 100, 100);
    dailyGoalProgress.style.width = `${goalPercent}%`;
    dailyGoalValue.textContent = `${totalMinutes} / ${playerData.dailyGoal} Min`;

    if (totalMinutes >= playerData.dailyGoal) {
        dailyGoalProgress.classList.add('complete');
    } else {
        dailyGoalProgress.classList.remove('complete');
    }
}

// Achievements rendern
function renderAchievements() {
    achievementsGrid.innerHTML = achievementsList.map(achievement => {
        const isUnlocked = playerData.achievements.includes(achievement.id);
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-card-icon">${achievement.icon}</span>
                <span class="achievement-card-name">${achievement.name}</span>
                <span class="achievement-card-desc">${achievement.desc}</span>
            </div>
        `;
    }).join('');
}

// Stats Panel rendern
function renderStatsPanel(tab = 'today') {
    let html = '';

    if (tab === 'today') {
        html = `
            <div class="stats-section">
                <div class="stats-section-title">Heute</div>
                <div class="stats-grid">
                    <div class="stats-item">
                        <span class="stats-value">${completedToday}</span>
                        <span class="stats-label">Erledigt</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${totalMinutes}</span>
                        <span class="stats-label">Minuten</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.streak}</span>
                        <span class="stats-label">Tage Streak</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.level}</span>
                        <span class="stats-label">Level</span>
                    </div>
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-section-title">Kategorien heute</div>
                <div class="category-stats">
                    ${renderCategoryStats()}
                </div>
            </div>
        `;
    } else if (tab === 'week') {
        const weekStats = getWeekStats();
        html = `
            <div class="stats-section">
                <div class="stats-section-title">Diese Woche</div>
                <div class="stats-grid">
                    <div class="stats-item">
                        <span class="stats-value">${weekStats.completed}</span>
                        <span class="stats-label">Erledigt</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${weekStats.totalMinutes}</span>
                        <span class="stats-label">Minuten</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${Math.round(weekStats.completed / 7 * 10) / 10}</span>
                        <span class="stats-label">Ø pro Tag</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.completedTasks.length}</span>
                        <span class="stats-label">Gesamt</span>
                    </div>
                </div>
            </div>
        `;
    } else if (tab === 'compare') {
        html = `
            <div class="stats-section">
                <div class="stats-section-title">Zeit-Vergleich (letzte 10 Tasks)</div>
                ${renderTimeComparison()}
            </div>
        `;
    }

    statsTabContent.innerHTML = html;
}

// Kategorie-Stats für heute
function renderCategoryStats() {
    const todayTasks = tasks.filter(t => t.status === 'done' &&
        t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString());

    const catCounts = {};
    todayTasks.forEach(t => {
        if (t.category) {
            catCounts[t.category] = (catCounts[t.category] || 0) + 1;
        }
    });

    const maxCount = Math.max(...Object.values(catCounts), 1);

    return Object.entries(categoryConfig).map(([key, config]) => {
        const count = catCounts[key] || 0;
        const percent = (count / maxCount) * 100;
        return `
            <div class="category-stat-item">
                <span class="category-stat-icon">${config.icon}</span>
                <div class="category-stat-bar">
                    <div class="category-stat-fill" style="width: ${percent}%"></div>
                </div>
                <span class="category-stat-value">${count}</span>
            </div>
        `;
    }).join('');
}

// Wochen-Stats berechnen
function getWeekStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    let completed = 0;
    let totalMins = 0;

    Object.entries(playerData.weeklyStats).forEach(([date, stats]) => {
        if (date >= oneWeekAgo) {
            completed += stats.completed;
            totalMins += stats.totalMinutes;
        }
    });

    return { completed, totalMinutes: totalMins };
}

// Zeit-Vergleich rendern
function renderTimeComparison() {
    const recentTasks = playerData.completedTasks.slice(-10).reverse();

    if (recentTasks.length === 0) {
        return '<p style="color: var(--text-secondary); text-align: center;">Noch keine erledigten Tasks</p>';
    }

    return recentTasks.map(task => {
        const diff = (task.actualTime || task.estimatedTime) - task.estimatedTime;
        const diffClass = diff < 0 ? 'faster' : (diff > 0 ? 'slower' : '');
        return `
            <div class="comparison-item">
                <span class="comparison-task">${task.title.substring(0, 20)}${task.title.length > 20 ? '...' : ''}</span>
                <div class="comparison-times">
                    <span class="comparison-estimated">${task.estimatedTime}m</span>
                    <span class="comparison-actual ${diffClass}">${task.actualTime || task.estimatedTime}m</span>
                </div>
            </div>
        `;
    }).join('');
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
    modalTaskCategory.value = task.category || '';
    modalTaskNotes.value = task.notes || '';

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
    task.category = modalTaskCategory.value;
    task.notes = modalTaskNotes.value.trim();

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
        const categorySelect = document.querySelector(`.category-select[data-column="${column}"]`);

        const title = taskInput.value.trim();
        const time = parseInt(timeInput.value) || 25;
        const category = categorySelect ? categorySelect.value : '';

        if (title) {
            createTask(title, time, column, category);
            taskInput.value = '';
            timeInput.value = '';
            if (categorySelect) categorySelect.value = '';
            taskInput.focus();
        }
    });
});

// Stats Panel Events
statsToggle.addEventListener('click', () => {
    statsPanel.classList.add('active');
    achievementsPanel.classList.remove('active');
    renderStatsPanel('today');
});

statsClose.addEventListener('click', () => {
    statsPanel.classList.remove('active');
});

// Stats Tabs
document.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderStatsPanel(tab.dataset.tab);
    });
});

// Achievements Panel Events
achievementsToggle.addEventListener('click', () => {
    achievementsPanel.classList.add('active');
    statsPanel.classList.remove('active');
});

achievementsClose.addEventListener('click', () => {
    achievementsPanel.classList.remove('active');
});

// Daily Goal bearbeiten
editDailyGoal.addEventListener('click', () => {
    const newGoal = prompt('Neues Tagesziel in Minuten:', playerData.dailyGoal);
    if (newGoal && !isNaN(parseInt(newGoal))) {
        playerData.dailyGoal = parseInt(newGoal);
        savePlayerData();
        updateGamificationUI();
    }
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

// ========================================
// NOTES PANEL FUNKTIONALITÄT
// ========================================

const notesToggle = document.getElementById('notesToggle');
const notesPanel = document.getElementById('notesPanel');
const notesClose = document.getElementById('notesClose');
const globalNotes = document.getElementById('globalNotes');
const notesSaved = document.getElementById('notesSaved');
const exportNotesBtn = document.getElementById('exportNotes');

let notesTimeout = null;

// Notes laden
function loadNotes() {
    const savedNotes = localStorage.getItem('globalNotes');
    if (savedNotes) {
        globalNotes.value = savedNotes;
    }
}

// Notes speichern mit Debounce
function saveNotes() {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(() => {
        localStorage.setItem('globalNotes', globalNotes.value);
        notesSaved.classList.add('show');
        setTimeout(() => notesSaved.classList.remove('show'), 2000);
    }, 500);
}

// Notes Panel Events
notesToggle.addEventListener('click', () => {
    notesPanel.classList.add('active');
    statsPanel.classList.remove('active');
    achievementsPanel.classList.remove('active');
});

notesClose.addEventListener('click', () => {
    notesPanel.classList.remove('active');
});

globalNotes.addEventListener('input', saveNotes);

// Notes exportieren
exportNotesBtn.addEventListener('click', () => {
    const text = globalNotes.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notizen_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// ========================================
// PRODUKTIVITÄTS-HEATMAP
// ========================================

function getProductivityHeatmapData() {
    const heatmap = {};
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    // Initialisiere Heatmap
    days.forEach(day => {
        heatmap[day] = {};
        for (let h = 0; h < 24; h++) {
            heatmap[day][h] = 0;
        }
    });

    // Analysiere erledigte Tasks
    playerData.completedTasks.forEach(task => {
        if (task.completedAt) {
            const date = new Date(task.completedAt);
            const day = days[date.getDay()];
            const hour = date.getHours();
            const minutes = task.actualTime || task.estimatedTime || 0;
            heatmap[day][hour] += minutes;
        }
    });

    return heatmap;
}

function renderHeatmap() {
    const heatmap = getProductivityHeatmapData();
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    // Finde Maximum für Skalierung
    let maxMinutes = 0;
    Object.values(heatmap).forEach(dayData => {
        Object.values(dayData).forEach(minutes => {
            if (minutes > maxMinutes) maxMinutes = minutes;
        });
    });

    // Stunden-Labels (nur jede 3. Stunde anzeigen)
    let hoursRow = '<div class="heatmap-day-label"></div>';
    for (let h = 0; h < 24; h++) {
        if (h % 3 === 0) {
            hoursRow += `<div class="heatmap-hour-label">${h}</div>`;
        } else {
            hoursRow += `<div class="heatmap-hour-label"></div>`;
        }
    }

    let gridHTML = hoursRow;

    days.forEach(day => {
        gridHTML += `<div class="heatmap-day-label">${day}</div>`;
        for (let h = 0; h < 24; h++) {
            const minutes = heatmap[day][h];
            let level = 0;
            if (maxMinutes > 0) {
                const percent = minutes / maxMinutes;
                if (percent > 0.8) level = 5;
                else if (percent > 0.6) level = 4;
                else if (percent > 0.4) level = 3;
                else if (percent > 0.2) level = 2;
                else if (percent > 0) level = 1;
            }
            gridHTML += `<div class="heatmap-cell level-${level}" title="${day} ${h}:00 - ${minutes} Min"></div>`;
        }
    });

    return `
        <div class="heatmap-container">
            <div class="heatmap-title">🔥 Produktivitäts-Heatmap</div>
            <div class="heatmap-grid">${gridHTML}</div>
            <div class="heatmap-legend">
                <span>Weniger</span>
                <div class="heatmap-legend-cell level-0"></div>
                <div class="heatmap-legend-cell level-1"></div>
                <div class="heatmap-legend-cell level-2"></div>
                <div class="heatmap-legend-cell level-3"></div>
                <div class="heatmap-legend-cell level-4"></div>
                <div class="heatmap-legend-cell level-5"></div>
                <span>Mehr</span>
            </div>
        </div>
    `;
}

// ========================================
// KATEGORIE-ANALYSE
// ========================================

function getCategoryAnalysis() {
    const categories = {};
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    playerData.completedTasks.forEach(task => {
        if (task.completedAt && new Date(task.completedAt) >= oneWeekAgo) {
            const cat = task.category || 'keine';
            if (!categories[cat]) {
                categories[cat] = { count: 0, minutes: 0 };
            }
            categories[cat].count++;
            categories[cat].minutes += task.actualTime || task.estimatedTime || 0;
        }
    });

    return categories;
}

function renderCategoryAnalysis() {
    const analysis = getCategoryAnalysis();
    const maxMinutes = Math.max(...Object.values(analysis).map(c => c.minutes), 1);

    const catInfo = {
        'arbeit': { icon: '💼', name: 'Arbeit' },
        'privat': { icon: '🏠', name: 'Privat' },
        'lernen': { icon: '📚', name: 'Lernen' },
        'sport': { icon: '💪', name: 'Sport' },
        'projekt': { icon: '🚀', name: 'Projekt' },
        'keine': { icon: '📋', name: 'Ohne Kategorie' }
    };

    let html = '';
    Object.entries(catInfo).forEach(([key, info]) => {
        const data = analysis[key] || { count: 0, minutes: 0 };
        const percent = maxMinutes > 0 ? (data.minutes / maxMinutes) * 100 : 0;
        html += `
            <div class="category-chart-item">
                <span class="category-chart-icon">${info.icon}</span>
                <div class="category-chart-info">
                    <div class="category-chart-name">${info.name}</div>
                    <div class="category-chart-bar">
                        <div class="category-chart-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                <span class="category-chart-value">${data.minutes}m</span>
            </div>
        `;
    });

    return `
        <div class="category-analysis">
            <div class="heatmap-title">📊 Zeit pro Kategorie (Woche)</div>
            <div class="category-chart">${html}</div>
        </div>
    `;
}

// ========================================
// ZEITSCHÄTZUNGS-GENAUIGKEIT
// ========================================

function getEstimationAccuracy() {
    let faster = 0, onTime = 0, slower = 0;
    let totalDiff = 0;
    let count = 0;

    playerData.completedTasks.forEach(task => {
        if (task.actualTime && task.estimatedTime) {
            const diff = task.actualTime - task.estimatedTime;
            const diffPercent = Math.abs(diff) / task.estimatedTime;

            if (diffPercent <= 0.1) {
                onTime++;
            } else if (diff < 0) {
                faster++;
            } else {
                slower++;
            }

            totalDiff += diff;
            count++;
        }
    });

    const avgDiff = count > 0 ? Math.round(totalDiff / count) : 0;
    const total = faster + onTime + slower;

    return {
        faster,
        onTime,
        slower,
        total,
        avgDiff,
        accuracy: total > 0 ? Math.round((onTime / total) * 100) : 0
    };
}

function renderEstimationAccuracy() {
    const acc = getEstimationAccuracy();
    const total = Math.max(acc.total, 1);

    let accuracyClass = 'good';
    if (acc.accuracy < 30) accuracyClass = 'bad';
    else if (acc.accuracy < 60) accuracyClass = 'medium';

    let avgDiffText = acc.avgDiff === 0 ? '±0' :
                     acc.avgDiff > 0 ? `+${acc.avgDiff}` : `${acc.avgDiff}`;

    return `
        <div class="estimation-accuracy">
            <div class="heatmap-title">⏱️ Zeitschätzungs-Genauigkeit</div>
            <div class="accuracy-summary">
                <div class="accuracy-stat">
                    <span class="accuracy-value ${accuracyClass}">${acc.accuracy}%</span>
                    <span class="accuracy-label">Genauigkeit</span>
                </div>
                <div class="accuracy-stat">
                    <span class="accuracy-value">${avgDiffText}m</span>
                    <span class="accuracy-label">Ø Abweichung</span>
                </div>
            </div>
            <div class="accuracy-breakdown">
                <div class="accuracy-row">
                    <span class="accuracy-row-label">Schneller</span>
                    <div class="accuracy-row-bar">
                        <div class="accuracy-row-fill faster" style="width: ${(acc.faster / total) * 100}%"></div>
                    </div>
                    <span class="accuracy-row-value">${acc.faster}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-row-label">Pünktlich</span>
                    <div class="accuracy-row-bar">
                        <div class="accuracy-row-fill on-time" style="width: ${(acc.onTime / total) * 100}%"></div>
                    </div>
                    <span class="accuracy-row-value">${acc.onTime}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-row-label">Langsamer</span>
                    <div class="accuracy-row-bar">
                        <div class="accuracy-row-fill slower" style="width: ${(acc.slower / total) * 100}%"></div>
                    </div>
                    <span class="accuracy-row-value">${acc.slower}</span>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// BACKUP / EXPORT FUNKTIONALITÄT
// ========================================

function exportAllData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tasks: tasks,
        playerData: playerData,
        globalNotes: localStorage.getItem('globalNotes') || '',
        productivityStats: {
            completed: completedToday,
            totalMinutes: totalMinutes,
            date: localStorage.getItem('productivityDate')
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produktivitaet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Letzten Export speichern
    localStorage.setItem('lastBackup', new Date().toISOString());
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.version || !data.tasks || !data.playerData) {
                alert('Ungültiges Backup-Format!');
                return;
            }

            if (confirm('Achtung: Alle aktuellen Daten werden überschrieben! Fortfahren?')) {
                tasks = data.tasks;
                playerData = { ...playerData, ...data.playerData };

                if (data.globalNotes) {
                    localStorage.setItem('globalNotes', data.globalNotes);
                    globalNotes.value = data.globalNotes;
                }

                if (data.productivityStats) {
                    completedToday = data.productivityStats.completed || 0;
                    totalMinutes = data.productivityStats.totalMinutes || 0;
                }

                saveTasks();
                savePlayerData();
                saveStats();

                renderAllTasks();
                updateStats();
                updateGamificationUI();
                renderAchievements();
                renderStatsPanel('backup');

                alert('Backup erfolgreich importiert!');
            }
        } catch (err) {
            alert('Fehler beim Importieren: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function renderBackupSection() {
    const lastBackup = localStorage.getItem('lastBackup');
    const lastBackupText = lastBackup
        ? `Letzter Export: ${new Date(lastBackup).toLocaleString('de-DE')}`
        : 'Noch kein Backup erstellt';

    return `
        <div class="backup-section">
            <div class="heatmap-title">💾 Backup & Export</div>
            <div class="backup-buttons">
                <button class="btn-backup btn-export" onclick="exportAllData()">
                    📤 Exportieren
                </button>
                <button class="btn-backup btn-import" onclick="document.getElementById('importFileInput').click()">
                    📥 Importieren
                </button>
                <input type="file" id="importFileInput" accept=".json" onchange="if(this.files[0]) importData(this.files[0])">
            </div>
            <div class="backup-info">
                <p>Exportiere alle deine Daten (Tasks, Statistiken, Notizen, Achievements) als JSON-Datei.</p>
                <div class="backup-last">${lastBackupText}</div>
            </div>
        </div>
    `;
}

// ========================================
// ERWEITERTE STATS PANEL RENDERING
// ========================================

// Originale renderStatsPanel Funktion überschreiben
const originalRenderStatsPanel = renderStatsPanel;
renderStatsPanel = function(tab = 'today') {
    let html = '';

    if (tab === 'today') {
        html = `
            <div class="stats-section">
                <div class="stats-section-title">Heute</div>
                <div class="stats-grid">
                    <div class="stats-item">
                        <span class="stats-value">${completedToday}</span>
                        <span class="stats-label">Erledigt</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${totalMinutes}</span>
                        <span class="stats-label">Minuten</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.streak}</span>
                        <span class="stats-label">Tage Streak</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.level}</span>
                        <span class="stats-label">Level</span>
                    </div>
                </div>
            </div>
            <div class="stats-section">
                <div class="stats-section-title">Kategorien heute</div>
                <div class="category-stats">
                    ${renderCategoryStats()}
                </div>
            </div>
        `;
    } else if (tab === 'week') {
        const weekStats = getWeekStats();
        html = `
            <div class="stats-section">
                <div class="stats-section-title">Diese Woche</div>
                <div class="stats-grid">
                    <div class="stats-item">
                        <span class="stats-value">${weekStats.completed}</span>
                        <span class="stats-label">Erledigt</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${weekStats.totalMinutes}</span>
                        <span class="stats-label">Minuten</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${Math.round(weekStats.completed / 7 * 10) / 10}</span>
                        <span class="stats-label">Ø pro Tag</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-value">${playerData.completedTasks.length}</span>
                        <span class="stats-label">Gesamt</span>
                    </div>
                </div>
            </div>
            ${renderTimeComparison() ? `
            <div class="stats-section">
                <div class="stats-section-title">Zeit-Vergleich (letzte 10 Tasks)</div>
                ${renderTimeComparison()}
            </div>
            ` : ''}
        `;
    } else if (tab === 'analyse') {
        html = renderHeatmap() + renderCategoryAnalysis() + renderEstimationAccuracy();
    } else if (tab === 'backup') {
        html = renderBackupSection();
    }

    statsTabContent.innerHTML = html;
};

// Globale Funktionen verfügbar machen
window.exportAllData = exportAllData;
window.importData = importData;

// Initial laden
loadData();
loadNotes();
updateTimerDisplay();
updateCoffeeFill();
updateStopwatchDisplay();

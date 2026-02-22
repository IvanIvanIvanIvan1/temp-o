let tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;
let playerName = "";
let ageGroup = "";

// Завантаження завдань
async function loadTasks() {
    try {
        const res = await fetch('data/tasks.json');
        tasks = await res.json();
        const select = document.getElementById('trainingSelect');

        select.innerHTML = '<option value="" disabled selected>Оберіть тренування</option>';

        tasks.forEach((t, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.text = t.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Помилка завантаження тренувань: " + err);
        alert("Не вдалося завантажити тренування!");
    }
}

loadTasks();

// Початок тренування
function startTraining() {
    playerName = document.getElementById('playerName').value.trim();
    if(playerName === "") {
        alert("Будь ласка, введіть своє ім'я!");
        return;
    }

    ageGroup = document.getElementById('ageGroupSelect').value;
    if(ageGroup === "") {
        alert("Будь ласка, оберіть вікову групу!");
        return;
    }

    const trainingSelect = document.getElementById('trainingSelect');
    const trainingIndex = parseInt(trainingSelect.value);
    if(isNaN(trainingIndex)) {
        alert("Будь ласка, оберіть тренування!");
        return;
    }

    score = 0;
    time = 0;
    currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(() => time++, 1000);

    showTask(trainingIndex);
}

// Показ завдання
function showTask(trainingIndex) {
    if(currentTaskIndex >= tasks[trainingIndex].stations.length) {
        endTraining();
        return;
    }

    const task = tasks[trainingIndex].stations[currentTaskIndex];
    document.getElementById('questionTitle').innerText = `Станція ${currentTaskIndex + 1}`;
    document.getElementById('questionImage').src = task.image;

    const buttonsDiv = document.getElementById('answerButtons');
    buttonsDiv.innerHTML = '';

    const allLabels = ['A','B','C','D','E','F','Z'];
    allLabels.forEach(label => {
        const btn = document.createElement('button');
        btn.innerText = label;

        const option = task.options.find(o => o.label === label);
        btn.onclick = () => checkAnswer(option ? option.correct : false, trainingIndex);

        buttonsDiv.appendChild(btn);
    });
}

// Перевірка відповіді
function checkAnswer(isCorrect, trainingIndex) {
    if(!isCorrect) time += 30; // штраф за неправильну відповідь
    else score += 10;

    currentTaskIndex++;
    showTask(trainingIndex);
}

// Завершення тренування
function endTraining() {
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');

    // Зберігаємо рекорд у localStorage
    const key = `record_${ageGroup}`;
    let records = JSON.parse(localStorage.getItem(key) || '[]');
    records.push({ name: playerName, score, time });
    // сортуємо по часу
    records.sort((a,b) => a.time - b.time);
    localStorage.setItem(key, JSON.stringify(records));

    // Показуємо привітання
    document.getElementById('congratsMessage').innerText = `Вітаємо, ${playerName}! Ви завершили тренування.`;
    document.getElementById('congrats').classList.remove('hidden');
}

// Закриття привітання
function closeCongrats() {
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// Адмін-панель
const ADMIN_PASSWORD = "Результати";
const allGroups = ["Ч10","Ч12","Ч14","Ч16","Ч18","Ч-О","Ж10","Ж12","Ж14","Ж16","Ж18","Ж-О"];

function showAdminPanel() {
    const password = prompt("Введіть пароль для доступу до адмін-панелі:");
    if(password !== ADMIN_PASSWORD) {
        alert("Неправильний пароль!");
        return;
    }

    const recordsDiv = document.getElementById('recordsList');
    recordsDiv.innerHTML = "";

    allGroups.forEach(group => {
        const recs = JSON.parse(localStorage.getItem(`record_${group}`) || '[]');
        const table = document.createElement('table');
        table.innerHTML = `<tr><th>Місце</th><th>Ім'я</th><th>Бали</th><th>Час</th></tr>`;
        recs.forEach((r,i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i+1}</td><td>${r.name}</td><td>${r.score}</td><td>${r.time}</td>`;
            table.appendChild(tr);
        });
        const h3 = document.createElement('h3');
        h3.innerText = group;
        recordsDiv.appendChild(h3);
        recordsDiv.appendChild(table);
    });

    document.getElementById('adminPanel').classList.remove('hidden');
}

function hideAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

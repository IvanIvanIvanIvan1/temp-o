const tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;
let playerName = "";
let ageGroup = "";

const allGroups = ["Ч10","Ч12","Ч14","Ч16","Ч18","Ч-О","Ж10","Ж12","Ж14","Ж16","Ж18","Ж-О"];
const ADMIN_PASSWORD = "Результати";

// --- Завантаження завдань ---
async function loadTasks() {
    try {
        const res = await fetch('data/tasks.json');
        tasks.push(...await res.json());
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

// --- Початок тренування ---
function startTraining() {
    playerName = document.getElementById('playerName').value.trim();
    if(!playerName) { alert("Будь ласка, введіть своє ім'я!"); return; }
    ageGroup = document.getElementById('ageGroupSelect').value;
    if(!ageGroup) { alert("Будь ласка, оберіть вікову групу!"); return; }

    score = 0; time = 0; currentTaskIndex = 0;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(() => { time++; }, 1000);

    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);
    showTask(trainingIndex);
}

// --- Показати завдання ---
function showTask(trainingIndex) {
    if(currentTaskIndex >= tasks[trainingIndex].stations.length) {
        endTraining();
        return;
    }
    const task = tasks[trainingIndex].stations[currentTaskIndex];
    document.getElementById('questionTitle').innerText = `Станція ${currentTaskIndex+1}`;
    document.getElementById('questionImage').src = task.image;

    const buttonsDiv = document.getElementById('answerButtons');
    buttonsDiv.innerHTML = '';
    ['A','B','C','D','E','F','Z'].forEach(label => {
        const btn = document.createElement('button');
        btn.innerText = label;
        const option = task.options.find(o => o.label === label);
        btn.onclick = () => checkAnswer(option ? option.correct : false, trainingIndex);
        buttonsDiv.appendChild(btn);
    });
}

// --- Перевірка відповіді ---
function checkAnswer(isCorrect, trainingIndex) {
    if(isCorrect) score += 10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// --- Завершення тренування ---
function endTraining() {
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');

    // Зберігаємо рекорд
    const key = `record_${ageGroup}`;
    const prevRecord = localStorage.getItem(key);
    const newRecord = { score, time, name: playerName };
    if(!prevRecord || score > JSON.parse(prevRecord).score || (score === JSON.parse(prevRecord).score && time < JSON.parse(prevRecord).time)) {
        localStorage.setItem(key, JSON.stringify(newRecord));
    }

    // Показати HTML-привітання
    document.getElementById('congratsMessage').innerText = `Вітаємо, ${playerName}! Ви завершили тренування.`;
    document.getElementById('congrats').classList.remove('hidden');
}

// --- Закрити привітання ---
function closeCongrats() {
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// --- Адмін-панель ---
function showAdminPanel() {
    const password = prompt("Введіть пароль для доступу до адмін-панелі:");
    if(password !== ADMIN_PASSWORD) { alert("Неправильний пароль!"); return; }

    const recordsDiv = document.getElementById('recordsList');
    recordsDiv.innerHTML = "";
    allGroups.forEach(group => {
        const record = JSON.parse(localStorage.getItem(`record_${group}`));
        const p = document.createElement('p');
        p.innerText = record ? `${group}: ${record.name} — ${record.score} балів за ${record.time} сек` : `${group}: ще немає рекорду`;
        recordsDiv.appendChild(p);
    });

    document.getElementById('adminPanel').classList.remove('hidden');
}

function hideAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

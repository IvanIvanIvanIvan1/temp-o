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

    score = 0;
    time = 0;
    currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(() => {
        time++;
        // не оновлюємо score і timer на екрані
    }, 1000);

    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);
    showTask(trainingIndex);
}

// Показати завдання
function showTask(trainingIndex) {
    if (currentTaskIndex >= tasks[trainingIndex].stations.length) {
        endTraining();
        return;
    }

    const task = tasks[trainingIndex].stations[currentTaskIndex];

    document.getElementById('questionTitle').innerText = `Станція ${currentTaskIndex+1}`;
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
    if (isCorrect) score += 10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// Завершення тренування
function endTraining() {
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden'); // повертаємо меню

    // Зберігаємо рекорд для вікової групи
    const key = `record_${ageGroup}`;
    const prevRecord = localStorage.getItem(key);
    const newRecord = { score: score, time: time, name: playerName };

    if (!prevRecord) {
        localStorage.setItem(key, JSON.stringify(newRecord));
    } else {
        const prev = JSON.parse(prevRecord);
        // Можна зберігати рекорд за найвищим score, або швидший час при однаковому score
        if (score > prev.score || (score === prev.score && time < prev.time)) {
            localStorage.setItem(key, JSON.stringify(newRecord));
        }
    }
}

// Перезапуск тренування
function restart() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

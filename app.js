let tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;

async function loadTasks() {
    const res = await fetch('data/tasks.json');
    tasks = await res.json();
    const select = document.getElementById('trainingSelect');
    tasks.forEach((t, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.text = t.name;
        select.appendChild(option);
    });
}

loadTasks();

function startTraining() {
    score = 0;
    time = 0;
    currentTaskIndex = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(() => {
        time++;
        document.getElementById('timer').innerText = time;
    }, 1000);

    showTask(parseInt(document.getElementById('trainingSelect').value));
}

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
    task.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.label;
        btn.onclick = () => checkAnswer(opt.correct, trainingIndex);
        buttonsDiv.appendChild(btn);
    });
}

function checkAnswer(isCorrect, trainingIndex) {
    if (isCorrect) score += 10;
    document.getElementById('score').innerText = score;
    currentTaskIndex++;
    showTask(trainingIndex);
}

function endTraining() {
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('finalScore').innerText = `Ваш результат: ${score} балів за ${time} секунд.`;
}

function restart() {
    document.getElementById('result').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

let tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;
let playerName = "";
let ageGroup = "";
const ADMIN_PASSWORD = "Результати";
const allGroups = ["Ч10","Ч12","Ч14","Ч16","Ч18","Ч-О","Ж10","Ж12","Ж14","Ж16","Ж18","Ж-О"];

// Завантаження тренувань
async function loadTasks() {
    try {
        const res = await fetch('data/tasks.json');
        tasks = await res.json();
        const select = document.getElementById('trainingSelect');
        select.innerHTML = '<option value="" disabled selected>Оберіть тренування</option>';
        tasks.forEach((t,i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.text = t.name;
            select.appendChild(opt);
        });
    } catch(err) {
        console.error(err);
        alert("Не вдалося завантажити тренування!");
    }
}
loadTasks();

// Початок тренування
function startTraining() {
    playerName = document.getElementById('playerName').value.trim();
    ageGroup = document.getElementById('ageGroupSelect').value;
    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);

    if(!playerName || !ageGroup || isNaN(trainingIndex)) {
        alert("Будь ласка, введіть ім'я, виберіть групу та тренування!");
        return;
    }

    score = 0;
    time = 0;
    currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(()=> time++,1000);

    showTask(trainingIndex);
}

// Показати станцію
function showTask(trainingIndex) {
    if(currentTaskIndex >= tasks[trainingIndex].stations.length) {
        endTraining();
        return;
    }
    const task = tasks[trainingIndex].stations[currentTaskIndex];
    document.getElementById('questionTitle').innerText = `Станція ${currentTaskIndex+1}`;
    document.getElementById('questionImage').src = task.image;

    const btnDiv = document.getElementById('answerButtons');
    btnDiv.innerHTML = '';
    ['A','B','C','D','E','F','Z'].forEach(label=>{
        const btn = document.createElement('button');
        btn.innerText = label;
        const option = task.options.find(o=>o.label===label);
        btn.onclick = ()=>checkAnswer(option?option.correct:false,trainingIndex);
        btnDiv.appendChild(btn);
    });
}

// Перевірка відповіді
function checkAnswer(isCorrect,trainingIndex){
    if(!isCorrect) time += 30; // штраф за неправильну
    else score += 10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// Завершення тренування
function endTraining(){
    clearInterval(timerInterval);

    // Зберігання результату
    const key = `records_${ageGroup}`;
    const prev = JSON.parse(localStorage.getItem(key)) || [];
    prev.push({name: playerName, score, time});
    localStorage.setItem(key, JSON.stringify(prev));

    // Привітання
    document.getElementById('congratsMessage').innerText = `Вітаємо, ${playerName}! Ви завершили тренування.`;
    document.getElementById('game').classList.add('hidden');
    document.getElementById('congrats').classList.remove('hidden');
}

function closeCongrats(){
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// Адмінка
function showAdminPanel(){
    const password = prompt("Пароль:");
    if(password!==ADMIN_PASSWORD){ alert("Неправильний пароль"); return;}
    const div = document.getElementById('recordsList');
    div.innerHTML = '';
    allGroups.forEach(group=>{
        const recs = JSON.parse(localStorage.getItem(`records_${group}`)) || [];
        const h3 = document.createElement('h3'); h3.innerText = group; div.appendChild(h3);
        if(recs.length===0){ div.appendChild(document.createElement('p')).innerText="Ще немає результатів"; return;}
        recs.sort((a,b)=>a.time-b.time);
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['Місце','Ім’я','Бали','Час (сек)'].forEach(txt=>{
            const th=document.createElement('th'); th.innerText=txt; th.style.border="1px solid #333"; th.style.padding="5px"; header.appendChild(th);
        });
        table.appendChild(header);
        recs.forEach((r,i)=>{
            const tr=document.createElement('tr');
            [i+1,r.name,r.score,r.time].forEach(val=>{
                const td=document.createElement('td'); td.innerText=val; td.style.border="1px solid #333"; td.style.padding="5px"; tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        div.appendChild(table);
    });
    document.getElementById('adminPanel').classList.remove('hidden');
}

function hideAdminPanel(){
    document.getElementById('adminPanel').classList.add('hidden');
}

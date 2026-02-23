// ----- FIREBASE -----
// використовуємо глобальний app з HTML
const db = firebase.firestore();

let tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;
let playerName = "";
let ageGroup = "";

const allGroups = ["Ч10","Ч12","Ч14","Ч16","Ч18","Ч-О","Ж10","Ж12","Ж14","Ж16","Ж18","Ж-О"];
const ADMIN_PASSWORD = "Результати";

// -------------------- Завантаження завдань --------------------
async function loadTasks() {
    try {
        const res = await fetch('data/tasks.json');
        tasks = await res.json();

        const select = document.getElementById('trainingSelect');
        select.innerHTML = '<option value="" disabled selected>Оберіть тренування</option>';

        tasks.forEach((t, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = t.name;
            select.appendChild(opt);
        });

    } catch(err){
        console.error(err);
        alert("Не вдалося завантажити тренування!");
    }
}

window.addEventListener("DOMContentLoaded", loadTasks);

// -------------------- Початок --------------------
function startTraining() {

    playerName = document.getElementById('playerName').value.trim();
    if(!playerName){ alert("Введіть ім'я!"); return; }

    ageGroup = document.getElementById('ageGroupSelect').value;
    if(!ageGroup){ alert("Оберіть групу!"); return; }

    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);
    if(isNaN(trainingIndex)){ alert("Оберіть тренування!"); return; }

    score = 0;
    time = 0;
    currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(()=>time++,1000);

    showTask(trainingIndex);
}

// -------------------- Показ завдання --------------------
function showTask(trainingIndex){

    if(currentTaskIndex >= tasks[trainingIndex].stations.length){
        endTraining();
        return;
    }

    const task = tasks[trainingIndex].stations[currentTaskIndex];

    document.getElementById('questionTitle').innerText =
        `Станція ${currentTaskIndex+1}`;

    document.getElementById('questionImage').src = task.image;

    const buttonsDiv = document.getElementById('answerButtons');
    buttonsDiv.innerHTML = '';

    const labels = ['A','B','C','D','E','F','Z'];

    labels.forEach(label=>{
        const btn = document.createElement('button');
        btn.innerText = label;

        const option = task.options.find(o=>o.label===label);

        btn.onclick = ()=>{
            if(option && !option.correct) time += 30;
            checkAnswer(option ? option.correct : false, trainingIndex);
        };

        buttonsDiv.appendChild(btn);
    });
}

// -------------------- Перевірка --------------------
function checkAnswer(isCorrect, trainingIndex){
    if(isCorrect) score += 10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// -------------------- Завершення --------------------
async function endTraining(){

    clearInterval(timerInterval);

    document.getElementById('game').classList.add('hidden');

    try{
        await db.collection("results").add({
            name: playerName,
            group: ageGroup,
            score: score,
            time: time,
            createdAt: new Date()
        });
    } catch(err){
        console.error(err);
        alert("Помилка збереження!");
    }

    document.getElementById('congratsMessage').innerText =
        `Вітаємо, ${playerName}! Ви завершили тренування.`;

    document.getElementById('congrats').classList.remove('hidden');
}

// -------------------- Продовжити --------------------
function closeCongrats(){
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// -------------------- Адмінка --------------------
async function showAdminPanel(){

    const password = prompt("Пароль:");
    if(password !== ADMIN_PASSWORD){
        alert("Неправильний пароль!");
        return;
    }

    const div = document.getElementById('recordsList');
    div.innerHTML = '';

    try{

        const snapshot = await db.collection("results").get();
        const allResults = snapshot.docs.map(d=>d.data());

        allGroups.forEach(group=>{

            const groupResults = allResults
                .filter(r=>r.group===group)
                .sort((a,b)=>a.time - b.time);

            const h3 = document.createElement('h3');
            h3.innerText = group;
            div.appendChild(h3);

            if(groupResults.length===0){
                const p = document.createElement('p');
                p.innerText = "Ще немає результатів";
                div.appendChild(p);
                return;
            }

            const table = document.createElement('table');
            table.innerHTML =
                "<tr><th>Місце</th><th>Ім'я</th><th>Бали</th><th>Час</th></tr>";

            groupResults.forEach((r,i)=>{
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${i+1}</td>
                     <td>${r.name}</td>
                     <td>${r.score}</td>
                     <td>${r.time}</td>`;
                table.appendChild(tr);
            });

            div.appendChild(table);
        });

    } catch(err){
        console.error(err);
        alert("Не вдалося завантажити результати!");
    }

    document.getElementById('adminPanel').classList.remove('hidden');
}

function hideAdminPanel(){
    document.getElementById('adminPanel').classList.add('hidden');
}

// ----- Глобальний доступ для кнопок -----
window.startTraining = startTraining;
window.showAdminPanel = showAdminPanel;
window.hideAdminPanel = hideAdminPanel;
window.closeCongrats = closeCongrats;

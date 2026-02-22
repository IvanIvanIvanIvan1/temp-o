import { getFirestore, collection, addDoc, getDocs, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const db = getFirestore();

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
        tasks.forEach((t,i)=>{
            const opt = document.createElement('option');
            opt.value = i;
            opt.text = t.name;
            select.appendChild(opt);
        });
    } catch(err){
        console.error(err);
        alert("Не вдалося завантажити тренування!");
    }
}
loadTasks();

// -------------------- Початок --------------------
function startTraining() {
    playerName = document.getElementById('playerName').value.trim();
    if(!playerName){ alert("Введіть ім'я!"); return; }

    ageGroup = document.getElementById('ageGroupSelect').value;
    if(!ageGroup){ alert("Оберіть групу!"); return; }

    score = 0; time = 0; currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(()=>time++,1000);

    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);
    showTask(trainingIndex);
}

// -------------------- Показ завдання --------------------
function showTask(trainingIndex){
    if(currentTaskIndex >= tasks[trainingIndex].stations.length){ endTraining(); return; }

    const task = tasks[trainingIndex].stations[currentTaskIndex];
    document.getElementById('questionTitle').innerText = `Станція ${currentTaskIndex+1}`;
    document.getElementById('questionImage').src = task.image;

    const buttonsDiv = document.getElementById('answerButtons');
    buttonsDiv.innerHTML = '';

    const allLabels = ['A','B','C','D','E','F','Z'];
    allLabels.forEach(label=>{
        const btn = document.createElement('button');
        btn.innerText = label;
        const option = task.options.find(o=>o.label===label);
        btn.onclick = ()=>{
            if(option && !option.correct) time+=30;
            checkAnswer(option?option.correct:false, trainingIndex);
        };
        buttonsDiv.appendChild(btn);
    });
}

// -------------------- Перевірка --------------------
function checkAnswer(isCorrect, trainingIndex){
    if(isCorrect) score+=10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// -------------------- Завершення --------------------
async function endTraining(){
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');

    try{
        await addDoc(collection(db,"results"),{
            name: playerName,
            group: ageGroup,
            score: score,
            time: time,
            timestamp: serverTimestamp()
        });
    } catch(err){
        console.error(err);
        alert("Не вдалося зберегти результат!");
    }

    document.getElementById('congratsMessage').innerText = `Вітаємо, ${playerName}! Ви завершили тренування.`;
    document.getElementById('congrats').classList.remove('hidden');
}

function closeCongrats(){
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// -------------------- Адмінка --------------------
async function showAdminPanel(){
    const password = prompt("Пароль:");
    if(password !== ADMIN_PASSWORD){ alert("Неправильний пароль!"); return; }

    const div = document.getElementById('recordsList');
    div.innerHTML = '';

    try{
        const snapshot = await getDocs(collection(db,"results"));
        const allResults = snapshot.docs.map(d=>d.data());

        allGroups.forEach(group=>{
            const groupResults = allResults.filter(r=>r.group===group)
                                           .sort((a,b)=>a.time-b.time);

            const h3 = document.createElement('h3');
            h3.innerText = group;
            div.appendChild(h3);

            if(groupResults.length===0){
                const p = document.createElement('p');
                p.innerText="Ще немає результатів";
                div.appendChild(p);
                return;
            }

            const table = document.createElement('table');
            const header = document.createElement('tr');
            ['Місце','Ім’я','Бали','Час (сек)'].forEach(txt=>{
                const th = document.createElement('th');
                th.innerText = txt;
                header.appendChild(th);
            });
            table.appendChild(header);

            groupResults.forEach((r,i)=>{
                const tr = document.createElement('tr');
                [i+1,r.name,r.score,r.time].forEach(val=>{
                    const td = document.createElement('td');
                    td.innerText = val;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });

            div.appendChild(table);
        });

    } catch(err){ console.error(err); alert("Не вдалося завантажити результати!"); }

    document.getElementById('adminPanel').classList.remove('hidden');
}

function hideAdminPanel(){
    document.getElementById('adminPanel').classList.add('hidden');
}

export { startTraining, showAdminPanel };

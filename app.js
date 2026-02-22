let tasks = [];
let currentTaskIndex = 0;
let score = 0;
let time = 0;
let timerInterval;
let playerName = "";
let ageGroup = "";
const allGroups = ["Ч10","Ч12","Ч14","Ч16","Ч18","Ч-О","Ж10","Ж12","Ж14","Ж16","Ж18","Ж-О"];
const ADMIN_PASSWORD = "Результати"; // постав свій пароль

// -------------------- Завантаження завдань --------------------
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

// -------------------- Початок тренування --------------------
function startTraining() {
    playerName = document.getElementById('playerName').value.trim();
    if(playerName === "") { alert("Введіть своє ім'я!"); return; }

    ageGroup = document.getElementById('ageGroupSelect').value;
    if(ageGroup === "") { alert("Оберіть вікову групу!"); return; }

    score = 0; time = 0; currentTaskIndex = 0;

    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    timerInterval = setInterval(()=>time++, 1000);

    const trainingIndex = parseInt(document.getElementById('trainingSelect').value);
    showTask(trainingIndex);
}

// -------------------- Показ завдання --------------------
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

    const allLabels = ['A','B','C','D','E','F','Z'];
    allLabels.forEach(label=>{
        const btn = document.createElement('button');
        btn.innerText = label;

        const option = task.options.find(o => o.label === label);
        btn.onclick = ()=>{
            if(option && !option.correct) time += 30; // штраф за неправильну
            checkAnswer(option ? option.correct : false, trainingIndex);
        };
        buttonsDiv.appendChild(btn);
    });
}

// -------------------- Перевірка відповіді --------------------
function checkAnswer(isCorrect, trainingIndex) {
    if(isCorrect) score += 10;
    currentTaskIndex++;
    showTask(trainingIndex);
}

// -------------------- Завершення тренування --------------------
async function endTraining() {
    clearInterval(timerInterval);
    document.getElementById('game').classList.add('hidden');

    try {
        // Зберігаємо результат у Firebase
        await db.collection('results').add({
            name: playerName,
            group: ageGroup,
            score: score,
            time: time,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(err){
        console.error("Помилка запису у Firebase:", err);
        alert("Не вдалося зберегти результат!");
    }

    // Показ привітання
    document.getElementById('congratsMessage').innerText =
        `Вітаємо, ${playerName}! Ви завершили тренування.`;
    document.getElementById('congrats').classList.remove('hidden');
}

// -------------------- Закрити привітання --------------------
function closeCongrats(){
    document.getElementById('congrats').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

// -------------------- Адмінка --------------------
async function showAdminPanel() {
    const password = prompt("Пароль:");
    if(password !== ADMIN_PASSWORD){ alert("Неправильний пароль!"); return; }

    const div = document.getElementById('recordsList');
    div.innerHTML = '';

    try {
        const snapshot = await db.collection('results').get();
        const allResults = snapshot.docs.map(doc=>doc.data());

        allGroups.forEach(group=>{
            const groupResults = allResults.filter(r=>r.group===group)
                                           .sort((a,b)=>a.time-b.time);

            const h3 = document.createElement('h3');
            h3.innerText = group;
            div.appendChild(h3);

            if(groupResults.length===0){
                div.appendChild(document.createElement('p')).innerText = "Ще немає результатів";
                return;
            }

            const table = document.createElement('table');
            const header = document.createElement('tr');
            ['Місце','Ім’я','Бали','Час (сек)'].forEach(txt=>{
                const th=document.createElement('th'); th.innerText=txt; th.style.border="1px solid #333"; th.style.padding="5px"; header.appendChild(th);
            });
            table.appendChild(header);

            groupResults.forEach((r,i)=>{
                const tr=document.createElement('tr');
                [i+1, r.name, r.score, r.time].forEach(val=>{
                    const td=document.createElement('td'); td.innerText=val; td.style.border="1px solid #333"; td.style.padding="5px"; tr.appendChild(td);
                });
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

function hideAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

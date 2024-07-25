document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskTime = document.getElementById('taskTime');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const successSound = document.getElementById('successSound');

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.sort((a, b) => {
            const [hourA, minuteA] = a.time.split(':').map(Number);
            const [hourB, minuteB] = b.time.split(':').map(Number);
            return hourA - hourB || minuteA - minuteB;
        });
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.time, task.completed);
        });
        resetDailyTasks();
        checkTasks(); // Start checking tasks immediately
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const taskText = li.querySelector('span').textContent.split(' - ')[1];
            const taskTime = li.querySelector('span').textContent.split(' - ')[0];
            const completed = li.querySelector('input[type="checkbox"]').checked;
            tasks.push({ text: taskText, time: taskTime, completed });
        });
        tasks.sort((a, b) => {
            const [hourA, minuteA] = a.time.split(':').map(Number);
            const [hourB, minuteB] = b.time.split(':').map(Number);
            return hourA - hourB || minuteA - minuteB;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function addTaskToDOM(text, time, completed) {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox"${completed ? ' checked' : ''}>
            <span>${time} - ${text}</span>
            <button class="delete">Eliminar</button>
        `;

        li.querySelector('.delete').addEventListener('click', () => {
            taskList.removeChild(li);
            saveTasks();
        });

        li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
            li.classList.toggle('completed');
            if (li.querySelector('input[type="checkbox"]').checked) {
                successSound.play();
                alert('ENHORABUENA TAREA CUMPLIDA');
            }
            saveTasks();
        });

        const items = Array.from(taskList.querySelectorAll('li'));
        const insertIndex = items.findIndex(item => {
            const itemTime = item.querySelector('span').textContent.split(' - ')[0];
            return itemTime > time;
        });

        if (insertIndex === -1) {
            taskList.appendChild(li);
        } else {
            taskList.insertBefore(li, items[insertIndex]);
        }
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const startTime = taskTime.value.trim();

        if (taskText === '' || startTime === '') {
            alert('Por favor, complete tanto el texto de la tarea como la hora de inicio.');
            return;
        }

        addTaskToDOM(taskText, startTime, false);
        saveTasks();
        taskInput.value = '';
        taskTime.value = '';
    }

    function resetDailyTasks() {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('lastDate');

        if (today !== lastDate) {
            taskList.querySelectorAll('li').forEach(li => {
                li.querySelector('input[type="checkbox"]').checked = false;
                li.classList.remove('completed');
            });
            localStorage.setItem('lastDate', today);
            saveTasks();
        }
    }

    function speakTask(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(utterance);
    }

    function checkTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        tasks.forEach(task => {
            if (task.time === currentTime && !task.completed) {
                speakTask(`Son las ${task.time}. Tarea: ${task.text}`);
            }
        });
    }

    function startChecking() {
        checkTasks(); // Initial check
        setInterval(checkTasks, 60000); // Check every minute
    }

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    loadTasks();
    startChecking(); // Start periodic task checking
});
document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Cargar tareas almacenadas al iniciar
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task.title, task.category));
    }

    loadTasks();

    // Agregar tarea
    addTaskBtn.addEventListener('click', () => {
        const taskTitle = prompt('¿Cuál es la tarea que deseas agregar?');
        const taskCategory = prompt('¿A qué categoría pertenece esta tarea?');

        if (taskTitle && taskCategory) {
            addTaskToDOM(taskTitle, taskCategory);
            saveTask(taskTitle, taskCategory);
        } else {
            alert('Debes completar todos los campos');
        }
    });

    // Función para agregar tarea al DOM
    function addTaskToDOM(title, category) {
        const newTask = document.createElement('div');
        newTask.classList.add('task');
        newTask.innerHTML = `
            <h3>${title}</h3>
            <p><strong>Categoría:</strong> ${category}</p>
            <button class="remove-task">Eliminar</button>
        `;
        taskList.appendChild(newTask);

        // Agregar funcionalidad de eliminación
        const removeBtn = newTask.querySelector('.remove-task');
        removeBtn.addEventListener('click', () => {
            taskList.removeChild(newTask);
            removeTask(title);
        });
    }

    // Guardar tarea en LocalStorage
    function saveTask(title, category) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ title, category });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Eliminar tarea de LocalStorage
    function removeTask(title) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.title !== title);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});

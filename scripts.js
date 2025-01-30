// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Función para agregar tarea
    addTaskBtn.addEventListener('click', () => {
        const taskTitle = prompt('¿Cuál es la tarea que deseas agregar?');
        const taskCategory = prompt('¿A qué categoría pertenece esta tarea?');

        if (taskTitle && taskCategory) {
            const newTask = document.createElement('div');
            newTask.classList.add('task');
            newTask.innerHTML = `
                <h3>${taskTitle}</h3>
                <p><strong>Categoría:</strong> ${taskCategory}</p>
                <button class="remove-task">Eliminar</button>
            `;
            taskList.appendChild(newTask);

            // Agregar funcionalidad de eliminación
            const removeBtn = newTask.querySelector('.remove-task');
            removeBtn.addEventListener('click', () => {
                taskList.removeChild(newTask);
            });
        } else {
            alert('Debes completar todos los campos');
        }
    });
});
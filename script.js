/************************************************************************************************************
 ********************************* CARGA DE DATOS AL INICIAR LA APLICACIÓN **********************************
 ************************************************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();           // Cargar las tareas
    loadCategorias();      // Cargar las categorías
    loadGoals();           // Cargar los objetivos
    checkTaskDeadlines();  // Verificar tareas que vencen hoy
    updateTaskListForGoals();  // Actualizar tareas en los objetivos
});

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".menu-buttons button");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Remover la clase "active" de todos los botones
            buttons.forEach(btn => btn.classList.remove("active"));

            // Agregar la clase "active" al botón seleccionado
            this.classList.add("active");
        });
    });
});

/************************************************************************************************************
 ******************************** FUNCIONES PARA ELEGIR EL GESTOR A MOSTRAR *********************************
 ************************************************************************************************************/
function showCategoryManager() {
    document.getElementById("categoryManager").style.display = "block";
    document.getElementById("taskManager").style.display = "none";
    document.getElementById("goalManager").style.display = "none";
}

function showTaskManager() {
    document.getElementById("categoryManager").style.display = "none";
    document.getElementById("taskManager").style.display = "block";
    document.getElementById("goalManager").style.display = "none";
}

function showGoalManager() {
    document.getElementById("categoryManager").style.display = "none";
    document.getElementById("taskManager").style.display = "none";
    document.getElementById("goalManager").style.display = "block";
    updateTaskListForGoals(); // Actualiza la lista de tareas en Mis Objetivos
}


/***********************************************************************************************************
**************************************** FUNCIONES GESTOR DE TAREAS ****************************************
************************************************************************************************************/
function addTask() {
    let name = document.getElementById("taskName").value;
    let date = document.getElementById("taskDate").value;
    let time = document.getElementById("taskTime").value;
    let category = document.getElementById("taskCategory").value;
    let recurring = document.querySelector('input[name="recurrence"]:checked')
        ? document.querySelector('input[name="recurrence"]:checked').value
        : '';

    // Validación de los campos con SweetAlert2:
    if (!name) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Escribe una tarea' });
        return;
    }
    if (!date) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Especifica una fecha para la tarea' });
        return;
    }
    if (!time) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Especifica una hora para la tarea' });
        return;
    }
    if (!category) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Selecciona una categoría para la tarea' });
        return;
    }

    // Validación de fecha y hora
    let now = new Date();
    let taskDateTime = new Date(date + 'T' + time);

    if (taskDateTime < now) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'La fecha y hora de la tarea no pueden ser anteriores a la actual' });
        return;
    }

    // Guardamos la tarea en localStorage
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ name, date, time, category, recurring, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));

    Swal.fire({ icon: 'success', title: '¡Éxito!', text: `La tarea "${name}" se ha añadido correctamente.` });

    // Actualizamos las vistas
    loadTasks();
    updateTaskListForGoals();

    // Limpiar campos
    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
    document.getElementById("taskCategory").value = "";
    document.querySelectorAll('input[name="recurrence"]').forEach(radio => radio.checked = false);
}

document.addEventListener("DOMContentLoaded", () => {
    loadTasks(); // Cargar las tareas al iniciar
    makeTasksDraggable(); // Habilitar el arrastrar y soltar
});

/****************************************************************************************************
************************************Hacer las tareas arrastrables************************************
/*****************************************************************************************************/

function makeTasksDraggable() {
    let taskContainer = document.getElementById("tasks");

    new Sortable(taskContainer, {
        animation: 150, // Animación suave
        ghostClass: "sortable-ghost", // Clase para el elemento arrastrado
        onEnd: function (evt) {
            updateTaskOrder();
        }
    });
}

// Guardar el nuevo orden de tareas en localStorage
function updateTaskOrder() {
    let taskContainer = document.getElementById("tasks");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let newOrder = [];

    taskContainer.childNodes.forEach(taskElement => {
        let taskName = taskElement.querySelector("strong").textContent;
        let task = tasks.find(t => t.name === taskName);
        if (task) {
            newOrder.push(task);
        }
    });

    localStorage.setItem("tasks", JSON.stringify(newOrder));
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskContainer = document.getElementById("tasks");
    taskContainer.innerHTML = ""; // Limpiar tareas anteriores

    // Ordenar las tareas por fecha y hora de vencimiento más próxima
    tasks.sort((a, b) => {
        let dateA = new Date(a.date + 'T' + a.time);
        let dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB; // Orden ascendente
    });

    // Cargar tareas al Gestor de Tareas
    tasks.forEach((task, index) => {
        let taskElement = document.createElement("div");
        taskElement.className = "task" + (task.completed ? " completed" : "");
        taskElement.draggable = true;  

        // Estilos condicionales si la tarea está completada
        let textDecoration = task.completed ? "text-decoration: line-through; color: black;" : "";
        let fadedText = task.completed ? "color: gray;" : "";
        let editButtonState = task.completed ? "disabled" : "";
        let editButtonStyle = task.completed ? "background-color: gray; cursor: not-allowed;" : "background-color: orange;";
        let taskColor = task.completed ? "green" : "#00609c";

        taskElement.innerHTML = `
            <div style="${textDecoration}">
                <strong style="color: ${taskColor}; font-weight: bold;">
                    <i class="fa-solid fa-circle" style="color: ${taskColor}; font-size: 0.8em;"></i> ${task.name}
                </strong>  
                <strong style="${fadedText}">Categoría:</strong> <span style="${fadedText}">${task.category}</span>  
                <strong style="${fadedText}">Fecha:</strong> <span style="${fadedText}">${task.date}</span>  
                <strong style="${fadedText}">Hora:</strong> <span style="${fadedText}">${task.time}</span>  
                ${task.recurring ? "(Recurrencia: " + task.recurring + ")" : ""}
            </div>
            <button class="btnTasks push" onclick="toggleTask(${index})">✔</button>
            <button class="btnTasks" onclick="deleteTask(${index})">🗑</button>
            <button class="btnTasks" onclick="editTask(${index})" ${editButtonState} style="${editButtonStyle}">✏️</button>
        `;

        taskContainer.appendChild(taskElement);
    });

    // Guardar la lista ordenada en localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function updateTaskListForGoals() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskSelectForGoal = document.getElementById("goalTask");

    taskSelectForGoal.innerHTML = ""; // Limpiar las opciones actuales

    // Filtrar las tareas para mostrar solo las que NO están completadas
    let uncompletedTasks = tasks.filter(task => !task.completed);

    // Si no hay tareas pendientes, mostramos un único option con el placeholder
    if (uncompletedTasks.length === 0) {
        let noTasksOption = document.createElement("option");
        noTasksOption.value = "";
        noTasksOption.textContent = "No hay tareas";
        taskSelectForGoal.appendChild(noTasksOption);
    } else {
        // Crear opción por defecto
        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccionar tarea";
        taskSelectForGoal.appendChild(defaultOption);

        // Agregar las tareas no completadas al selector
        uncompletedTasks.forEach(task => {
            let option = document.createElement("option");
            option.value = task.name;
            option.textContent = task.name;
            taskSelectForGoal.appendChild(option);
        });
    }
}


function loadTasksForEditGoal(selectedTasks) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editGoalTaskSelect = document.getElementById("editGoalTask");

    editGoalTaskSelect.innerHTML = "";

    // Filtrar para que solo aparezcan las tareas no completadas
    let uncompletedTasks = tasks.filter(task => !task.completed);

    if (uncompletedTasks.length === 0) {
        let noTasksOption = document.createElement("option");
        noTasksOption.value = "";
        noTasksOption.textContent = "No hay tareas";
        editGoalTaskSelect.appendChild(noTasksOption);
    } else {
        // Agregar las tareas no completadas al selector
        uncompletedTasks.forEach(task => {
            let option = document.createElement("option");
            option.value = task.name;
            option.textContent = task.name;

            // Seleccionar las tareas previamente asignadas
            if (selectedTasks.includes(task.name)) {
                option.selected = true;
            }

            editGoalTaskSelect.appendChild(option);
        });
    }
}

function toggleTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    let task = tasks[index];
    let wasCompleted = task.completed;

    // Cambiar el estado de completado
    task.completed = !task.completed;
    console.log("Tarea modificada:", task);

    // Si se marca como completada (y no lo estaba antes) y es recurrente, crear una nueva tarea
    if (!wasCompleted && task.completed && task.recurring) {
        let newTask = { ...task, completed: false };
        let currentDate = new Date(task.date);

        if (task.recurring === "diaria") {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (task.recurring === "semanal") {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (task.recurring === "mensual") {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        newTask.date = currentDate.toISOString().split('T')[0];
        console.log("Nueva tarea recurrente creada:", newTask);
        tasks.push(newTask);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks(); // Actualiza la lista visual de tareas
    updateTaskListForGoals(); // Actualiza la lista de tareas en Mis Objetivos
}

function editTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    let task = tasks[index];

    // Cambiar el título
    document.getElementById("taskTitle").textContent = "Editar tarea:";

    // Rellenar los campos del formulario con los datos de la tarea
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskTime").value = task.time;
    document.getElementById("taskCategory").value = task.category;

    // Marcar la recurrencia si existe
    if (task.recurring) {
        document.querySelector(`input[name="recurrence"][value="${task.recurring}"]`).checked = true;
    }

    // Cambiar el texto y la función del botón
    let addButton = document.querySelector('button[onclick="addTask()"]');
    addButton.textContent = "Actualizar Tarea";
    addButton.onclick = function() { updateTask(index); };

    // Hacer scroll suave hacia arriba con offset
    const offset = 150; // Puedes ajustar este valor según necesites
    const elementPosition = document.getElementById("taskName").getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

function updateTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    let task = tasks[index];

    // Guardamos el nombre antiguo para actualizar los objetivos
    let oldName = task.name;

    // Obtener los valores actualizados del formulario
    task.name = document.getElementById("taskName").value;
    task.date = document.getElementById("taskDate").value;
    task.time = document.getElementById("taskTime").value;
    task.category = document.getElementById("taskCategory").value;
    task.recurring = document.querySelector('input[name="recurrence"]:checked')
        ? document.querySelector('input[name="recurrence"]:checked').value
        : '';

    // Validaciones...
    if (!task.name || !task.date || !task.time || !task.category) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Todos los campos son obligatorios' });
        return;
    }

    let now = new Date();
    let taskDateTime = new Date(task.date + 'T' + task.time);
    if (taskDateTime < now) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'La fecha y hora de la tarea no pueden ser anteriores a la actual' });
        return;
    }

    // Guardar las tareas actualizadas
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizar el nombre de la tarea en los objetivos
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    goals.forEach(goal => {
        if (goal.tasks.includes(oldName)) {
            goal.tasks = goal.tasks.map(taskName => 
                taskName === oldName ? task.name : taskName
            );
        }
    });
    localStorage.setItem("goals", JSON.stringify(goals));

    // Mostrar mensaje de éxito
    Swal.fire({ icon: 'success', title: '¡Éxito!', text: `La tarea "${task.name}" se ha actualizado correctamente.` });

    // Restablecer el formulario
    document.getElementById("taskName").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskTime").value = "";
    document.getElementById("taskCategory").value = "";
    document.querySelectorAll('input[name="recurrence"]').forEach(radio => radio.checked = false);

    // Restaurar el título y el botón
    document.getElementById("taskTitle").textContent = "Nueva tarea:";
    let addButton = document.querySelector('button[onclick="addTask()"]');
    addButton.onclick = null;
    addButton.textContent = "Añadir Tarea";
    addButton.onclick = addTask;

    // Actualizar vistas
    loadTasks();
    updateTaskListForGoals();
    loadGoals(); // 🔹 Recargar los objetivos para mostrar los nuevos nombres
}



function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    let deletedTaskName = tasks[index].name;

    // Verificar si la tarea está asociada a algún objetivo
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    let isAssociatedWithGoal = goals.some(goal => Array.isArray(goal.tasks) && goal.tasks.includes(deletedTaskName));

    if (isAssociatedWithGoal) {
        Swal.fire({
            icon: 'error',
            title: 'No se puede eliminar',
            text: `La tarea "${deletedTaskName}" está asociada a un objetivo. Debes desvincularla primero.`
        });
        return;
    }

    // Si no está asociada a ningún objetivo, procedemos a eliminarla
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizar vista de tareas
    loadTasks();
    updateTaskListForGoals();
    loadGoals();
}

function checkTaskDeadlines() {
    if (!("Notification" in window)) return;
 
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let now = new Date();
    const thresholdDays = 2;
    let upcomingTasks = [];
 
    tasks.forEach(task => {
        let taskDateTime = new Date(task.date + 'T' + task.time);
        let diffTime = taskDateTime - now;
        let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
 
        if (diffDays <= thresholdDays && diffDays >= 0 && !task.completed) {
            upcomingTasks.push({
                name: task.name,
                days: diffDays,
                hours: diffHours,
                minutes: diffMinutes
            });
        }
    });
 
    if (upcomingTasks.length > 0) {
        let message = upcomingTasks.map(task => {
            if (task.days > 0) {
                return `"${task.name}": ${task.days} días y ${task.hours} horas`;
            } else if (task.hours > 0) {
                return `"${task.name}": ${task.hours} horas y ${task.minutes} minutos`;
            } else {
                return `"${task.name}": ${task.minutes} minutos`;
            }
        }).join('\n');
 
        let notificationsRequested = localStorage.getItem("notificationsRequested");
        
        if (Notification.permission === "granted") {
            new Notification("Tareas Próximas a Vencer", { body: message });
        } else if (Notification.permission !== "denied" && !notificationsRequested) {
            Notification.requestPermission().then(permission => {
                localStorage.setItem("notificationsRequested", "true");
                if (permission === "granted") {
                    new Notification("Tareas Próximas a Vencer", { body: message });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Tareas Próximas a Vencer',
                html: message.replace(/\n/g, '<br>')
            });
        }
    }
 }

/************************************************************************************************************
**************************************** FUNCIONES GESTOR DE OBJETIVOS **************************************
*************************************************************************************************************/
function addGoal() {
    let nameInput = document.getElementById("goalName");
    let dateInput = document.getElementById("goalDate");
    let taskSelect = document.getElementById("goalTask");

    let name = nameInput.value.trim();
    let date = dateInput.value;
    let progress = 0;

    if (!name || !date) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Por favor, completa todos los campos correctamente' });
        return;
    }

    let selectedTasks = Array.from(taskSelect.selectedOptions).map(option => option.value);

    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    goals.push({
        name,
        date,
        progress,
        tasks: selectedTasks,
        completed: false
    });

    localStorage.setItem("goals", JSON.stringify(goals));

    Swal.fire({ icon: 'success', title: '¡Éxito!', text: `El objetivo "${name}" se ha añadido correctamente.` });

    loadGoals(); // Cargar los objetivos después de añadir uno nuevo

    // Limpiar los campos de entrada y eliminar placeholders
    nameInput.value = "";
    nameInput.placeholder = "";
    
    dateInput.value = "";
    
    progressInput.value = "";
    progressInput.placeholder = "";
    
    taskSelect.selectedIndex = -1; // Desseleccionar todas las tareas
}

function loadGoals() {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    let goalsContainer = document.getElementById("goals");
    goalsContainer.innerHTML = ""; // Limpiar la lista antes de recargar

    goals.forEach((goal, index) => {
        let goalElement = document.createElement("div");
        goalElement.className = "goal" + (goal.completed ? " completed" : "");
        goalElement.draggable = true;  

        // Estilos condicionales si el objetivo está completado
        let textDecoration = goal.completed ? "text-decoration: line-through; color: black;" : "";
        let fadedText = goal.completed ? "color: gray;" : "";
        let editButtonState = goal.completed ? "disabled" : "";
        let editButtonStyle = goal.completed ? "background-color: gray; cursor: not-allowed;" : "";
        let goalColor = goal.completed ? "green" : "#00609c"; 

        // Crear botones de progreso con estilos
        let progressButtons = !goal.completed ? `
            <button class="btnProgress" onclick="updateGoalProgress(${index}, -10)" title="Reducir progreso">-</button>
            <button class="btnProgress" onclick="updateGoalProgress(${index}, 10)" title="Aumentar progreso">+</button>
            ` : '';

            goalElement.innerHTML = `
            <div style="${textDecoration}">
                <strong style="color: ${goalColor}; font-weight: bold;">
                    <i class="fa-solid fa-star" style="color: ${goalColor};"></i> ${goal.name}
                </strong>  
                <strong style="${fadedText}">Fecha:</strong> <span style="${fadedText}">${goal.date}</span>  
                <strong style="${fadedText}">Progreso:</strong> 
                <span style="${fadedText}">
                    ${goal.progress}% ${progressButtons}
                </span>
                ${goal.completed ? "(Completado)" : "(En progreso)"}
                <strong style="${fadedText}">Tareas asignadas:</strong> <span style="${fadedText}">${goal.tasks}</span>
            </div>
            <button class="btnGoals push" onclick="toggleGoal(${index})">✔</button>
            <button class="btnGoals" onclick="deleteGoal(${index})">🗑</button>
            <button class="btnGoals2" onclick="editGoal(${index})" ${editButtonState} style="${editButtonStyle}">✏️</button>
            `;

        goalsContainer.appendChild(goalElement);

        
        // Añadir los eventos de drag and drop
        goalElement.addEventListener("dragstart", (e) => {
            goalElement.classList.add("dragging");
            e.dataTransfer.setData("text", index); // Guardamos el índice del objetivo que estamos arrastrando
        });

        goalElement.addEventListener("dragend", () => {
            goalElement.classList.remove("dragging");
        });

        goalsContainer.appendChild(goalElement);
    });

    // Permitir soltar los objetivos arrastrados
    goalsContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(goalsContainer, e.clientY);
        if (afterElement == null) {
            goalsContainer.appendChild(draggingElement);
        } else {
            goalsContainer.insertBefore(draggingElement, afterElement);
        }
    });

    goalsContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedIndex = e.dataTransfer.getData("text");  // Obtener el índice del objetivo arrastrado
        const draggingGoal = goals[draggedIndex];

        // Mover el objetivo en la lista
        const afterElement = getDragAfterElement(goalsContainer, e.clientY);
        const currentIndex = Array.from(goalsContainer.children).indexOf(afterElement);

        goals.splice(draggedIndex, 1);
        goals.splice(currentIndex, 0, draggingGoal);

        localStorage.setItem("goals", JSON.stringify(goals));
        loadGoals(); // Recargar la lista de objetivos después del cambio
    });
}

// Función para obtener el elemento después de donde se encuentra el cursor
function getDragAfterElement(goalsContainer, y) {
    const draggableElements = [...goalsContainer.querySelectorAll(".goal:not(.dragging)")];
    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

function editGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals"));
    let goal = goals[index];

    // Establecer los valores en el formulario
    document.getElementById("editGoalName").value = goal.name;
    document.getElementById("editGoalDate").value = goal.date;
    
    // Mostrar el progreso como texto de solo lectura
    let editGoalProgress = document.getElementById("editGoalProgress");
    editGoalProgress.value = goal.progress;
    editGoalProgress.readOnly = true;
    editGoalProgress.style.backgroundColor = "#f0f0f0"; // Estilo visual de solo lectura

    // Cargar las tareas en el selector
    loadTasksForEditGoal(goal.tasks || []);
    
    // Mostrar el formulario de edición
    document.getElementById("createGoalForm").style.display = "none";
    document.getElementById("editGoalFormContainer").style.display = "block";
    document.getElementById("updateGoalButton").dataset.index = index;
}

function updateGoal() {
    let index = document.getElementById("updateGoalButton").dataset.index;
    let name = document.getElementById("editGoalName").value;
    let date = document.getElementById("editGoalDate").value;
    let goals = JSON.parse(localStorage.getItem("goals"));
    
    // Mantener el progreso existente
    let progress = goals[index].progress;

    // Obtener las tareas seleccionadas
    let taskSelect = document.getElementById("editGoalTask");
    let selectedTasks = Array.from(taskSelect.selectedOptions).map(option => option.value);

    // Validación de campos obligatorios
    if (!name || !date) {
        return Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'El nombre y la fecha son obligatorios.',
        });
    }

    // Actualizar el objetivo manteniendo el progreso original
    goals[index] = {
        name,
        date,
        progress,
        tasks: selectedTasks,
        completed: goals[index].completed
    };

    localStorage.setItem("goals", JSON.stringify(goals));
    
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: `El objetivo "${name}" se ha editado correctamente.`,
    });

    // Restaurar la vista del formulario de creación
    document.getElementById("editGoalFormContainer").style.display = "none";
    document.getElementById("createGoalForm").style.display = "block";
    
    // Recargar la lista de objetivos
    loadGoals();
}

function updateGoalProgress(index, increment) {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    let goal = goals[index];
    
    // Convertir el progreso actual a número
    let currentProgress = parseInt(goal.progress);
    
    // Calcular el nuevo progreso
    let newProgress = currentProgress + increment;
    
    // Limitar el progreso entre 0 y 100
    newProgress = Math.min(Math.max(newProgress, 0), 100);
    
    // Actualizar solo si el valor ha cambiado
    if (currentProgress !== newProgress) {
        goal.progress = newProgress;

        if (newProgress === 100) {
            goal.completed = true;
            
        }

        localStorage.setItem("goals", JSON.stringify(goals));
        loadGoals(); // Recargar la vista
    }
}


function toggleGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];

    if (goals[index]) {
        
        if (goals[index].progress < 100) {
            Swal.fire({
                title: '¿Seguro que quieres completar este objetivo?',
                text: `El progreso actual es ${goals[index].progress}%`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.isConfirmed) {
                    goals[index].completed = !goals[index].completed;
                    goals[index].progress = 100;
                    localStorage.setItem("goals", JSON.stringify(goals));
                    loadGoals();
                }
            });
        } else {
            goals[index].completed = !goals[index].completed;
            localStorage.setItem("goals", JSON.stringify(goals));
            loadGoals();
        }
    }
}

function deleteGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];

    if (goals[index]) {  // Asegurarse de que el índice es válido
        goals.splice(index, 1);
        localStorage.setItem("goals", JSON.stringify(goals));
        loadGoals(); // Actualiza la lista de objetivos
    }
}


/***********************************************************************************************************
************************************ FUNCIONES GESTOR DE CATEGORIAS ****************************************
************************************************************************************************************/
function addCat() {
    let catInput = document.getElementById("catName");
    let catName = catInput.value.trim(); // Evitar espacios vacíos

    if (!catName) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Escribe un nombre para la categoría'
        });
    }

    // Obtener las categorías del localStorage
    let categories = JSON.parse(localStorage.getItem("categories")) || [];

    // Validar si la categoría ya existe
    if (categories.includes(catName)) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `La categoría "${catName}" ya existe.`
        });
    }

    // Agregar la nueva categoría
    categories.push(catName);
    localStorage.setItem("categories", JSON.stringify(categories));

    loadCategorias();  // Recargar las categorías después de añadir

    Swal.fire({
        icon: 'success',
        title: 'Categoría creada',
        text: `Categoría "${catName}" creada correctamente`
    });

    // Limpiar el campo de entrada y eliminar el placeholder
    catInput.value = "";
    catInput.placeholder = "";
}




function loadCategorias() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];

    // Actualizar el selector de tareas (si se usa en otras partes)
    let taskCategorySelect = document.getElementById("taskCategory");
    taskCategorySelect.innerHTML = "";
    categories.forEach(cat => {
        let taskOption = document.createElement("option");
        taskOption.value = cat;
        taskOption.textContent = cat;
        taskCategorySelect.appendChild(taskOption);
    });

    // Actualizar el contenedor de tags para eliminar categorías
    let categoriesTagsContainer = document.getElementById("categoriesTags");
    if (categoriesTagsContainer) {
        categoriesTagsContainer.innerHTML = "";
        categories.forEach(cat => {
            let tag = document.createElement("span");
            tag.className = "category-tag";
            tag.textContent = cat;
            // Almacena el nombre en un atributo
            tag.setAttribute("data-category", cat);
            // Permite seleccionar/desseleccionar el tag al hacer clic
            tag.addEventListener("click", function () {
                tag.classList.toggle("selected");
            });
            categoriesTagsContainer.appendChild(tag);
        });
    }
}

function eliminarCategoriasSeleccionadas() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    // Obtener todos los tags seleccionados
    let selectedTags = document.querySelectorAll("#categoriesTags .category-tag.selected");
    let categoriesToDelete = Array.from(selectedTags).map(tag => tag.getAttribute("data-category"));

    if (categoriesToDelete.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona al menos una categoría para eliminar.'
        });
        return;
    }

    // Verificar si alguna tarea está usando estas categorías
    let usedCategories = categoriesToDelete.filter(category => 
        tasks.some(task => task.category === category)
    );

    if (usedCategories.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No se pueden eliminar estas categorías',
            text: `Las siguientes categorías están en uso por tareas activas: ${usedCategories.join(", ")}`,
        });
        return;
    }

    // Filtrar las categorías eliminando las seleccionadas
    categories = categories.filter(cat => !categoriesToDelete.includes(cat));
    localStorage.setItem("categories", JSON.stringify(categories));

    Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: `Categorías eliminadas: ${categoriesToDelete.join(", ")}`
    });

    // Recargar la vista de categorías
    loadCategorias();
}




/***********************************************************************************************************
************************************ FUNCIONES VALIDACIÓN CALVICIE *****************************************
************************************************************************************************************/

function validarAcceso() {
    Swal.fire({
        title: "¿Eres calvo?",
        icon: "question",
        showDenyButton: true,
        confirmButtonText: "Sí",
        denyButtonText: "No",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
    }).then((result) => {
        if (result.isConfirmed) {
            // Si es calvo, preguntamos si es Zinedine Zidane
            Swal.fire({
                title: "¿Eres Zinedine Zidane?",
                imageUrl: 'img/zidaneguapo.jpg',
                imageHeight: 330,
                imageWidth: 250,
                showDenyButton: true,
                confirmButtonText: "Sí",
                denyButtonText: "No",
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
            }).then((result2) => {
                if (result2.isConfirmed) {
                    // Si es Zidane, se concede acceso y se muestra el mensaje de felicitación
                    document.getElementById("contenido").style.display = "block";
                    Swal.fire(
                        "Acceso concedido",
                        "¡Bienvenido, Zizou!",
                        "success"
                    ).then(() => {
                        checkTaskDeadlines();
                    });
                } else {
                    // Si no es Zidane, se niega el acceso
                    Swal.fire({
                        title: "Acceso restringido: \nNo se admiten calvos y menos si son feos🤦‍♂️",
                        text: "PD: Vete a Turquía si quieres entrar.",
                        icon: "error",
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        timer: 3000 
                    }).then(() => {
                        window.close();
                    });
                }
            });
        } else {
            // Si no es calvo, se concede el acceso normalmente
            document.getElementById("contenido").style.display = "block";
            Swal.fire(
                "Acceso concedido",
                "¡Enhorabuena por tu pelazo!",
                "success"
            ).then(() => {
                checkTaskDeadlines();
            });
        }
    });
}

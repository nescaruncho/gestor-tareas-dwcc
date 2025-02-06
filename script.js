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

    // Cargar tareas al Gestor de Tareas
    tasks.forEach((task, index) => {
        let taskElement = document.createElement("div");
        taskElement.className = "task" + (task.completed ? " completed" : "");
        taskElement.innerHTML = `
            <strong>${task.name}</strong> 
            <strong>Categoría:</strong> ${task.category} 
            <strong>Fecha:</strong> ${task.date} 
            <strong>Hora:</strong> ${task.time} 
            ${task.recurring ? "(Recurrencia: " + task.recurring + ")" : ""}
            <button class="btnTasks push" onclick="toggleTask(${index})">✔</button>
            <button class="btnTasks" onclick="deleteTask(${index})">🗑</button>
        `;
        taskContainer.appendChild(taskElement);
    });
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



function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    // Capturamos el nombre de la tarea que se va a eliminar
    let deletedTaskName = tasks[index].name;

    // Eliminamos la tarea del array de tareas
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizamos los objetivos: eliminar la tarea eliminada de cada objetivo
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    goals.forEach(goal => {
        if (Array.isArray(goal.tasks)) {
            goal.tasks = goal.tasks.filter(taskName => taskName !== deletedTaskName);
        }
    });
    localStorage.setItem("goals", JSON.stringify(goals));

    // Actualizamos la vista: tareas y objetivos
    loadTasks();
    updateTaskListForGoals();
    loadGoals();
}


// function checkTaskDeadlines() {
//     if (!("Notification" in window)) {
//         console.log("Este navegador no soporta notificaciones de escritorio.");
//         return;
//     }

//     if (Notification.permission !== "granted") {
//         Notification.requestPermission();
//     }

//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     let now = new Date();
//     const thresholdDays = 2; // Umbral de 2 días

//     tasks.forEach(task => {
//         // Combina la fecha y la hora en formato ISO
//         let taskDateTime = new Date(task.date + 'T' + task.time);
//         let diffTime = taskDateTime - now;
//         let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//         if (diffDays <= thresholdDays && diffDays >= 0 && !task.completed) {
//             if (Notification.permission === "granted") {
//                 new Notification("Tarea Próxima a Vencer", {
//                     body: `La tarea "${task.name}" vence en ${diffDays} día(s).`
//                 });
//             } else {
//                 Swal.fire({
//                     icon: 'warning',
//                     title: 'Tarea Próxima a Vencer',
//                     text: `La tarea "${task.name}" vence en ${diffDays} día(s).`
//                 });
//             }
//         }
//     });
// }

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
    let name = document.getElementById("goalName").value;
    let date = document.getElementById("goalDate").value;
    let progress = document.getElementById("goalProgress").value;

    if (!name || !date || progress === "" || isNaN(progress) || progress < 0 || progress > 100) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Por favor, completa todos los campos correctamente' });
        return;
    }

    let taskSelect = document.getElementById("goalTask");
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

    // Comprobar si el objetivo se guarda correctamente
    console.log(JSON.parse(localStorage.getItem("goals")));

    Swal.fire({ icon: 'success', title: '¡Éxito!', text: `El objetivo "${name}" se ha añadido correctamente.` });

    loadGoals(); // Cargar los objetivos después de añadir uno nuevo
}

function loadGoals() {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    let goalsContainer = document.getElementById("goals");
    goalsContainer.innerHTML = ""; // Limpiar la lista de objetivos antes de volver a cargarla

    goals.forEach((goal, index) => {
        let goalElement = document.createElement("div");
        goalElement.className = "goal" + (goal.completed ? " completed" : "");
        goalElement.draggable = true;  // Hace el objetivo arrastrable

        // Añadir los datos del objetivo
        goalElement.innerHTML = `
            <strong>${goal.name}</strong> <strong>Fecha:</strong> ${goal.date}  
            <strong>Progreso:</strong> ${goal.progress}%  
            ${goal.completed ? "(Completado)" : "(En progreso)"}
            <button class="btnGoals push" onclick="toggleGoal(${index})">✔</button>
            <button class="btnGoals" onclick="deleteGoal(${index})">🗑</button>
            <button class="btnGoals2" onclick="editGoal(${index})">✏️</button>

        `;

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

    document.getElementById("editGoalName").value = goal.name;
    document.getElementById("editGoalDate").value = goal.date;
    document.getElementById("editGoalProgress").value = goal.progress;

    // Cargar las tareas en el selector
    loadTasksForEditGoal(goal.tasks || []);
    document.getElementById("createGoalForm").style.display = "none";
    document.getElementById("editGoalFormContainer").style.display = "block";
    document.getElementById("updateGoalButton").dataset.index = index;
}

function updateGoal() {
    let index = document.getElementById("updateGoalButton").dataset.index;
    let name = document.getElementById("editGoalName").value;
    let date = document.getElementById("editGoalDate").value;
    let progress = document.getElementById("editGoalProgress").value;

    // Obtener las tareas seleccionadas (puede estar vacío)
    let taskSelect = document.getElementById("editGoalTask");
    let selectedTasks = Array.from(taskSelect.selectedOptions).map(option => option.value);

    // Validar los campos obligatorios (se elimina la validación de tareas)
    if (!name || !date || !progress) {
        return alert("Todos los campos (excepto las tareas) son obligatorios.");
    }

    let goals = JSON.parse(localStorage.getItem("goals"));

    goals[index] = {
        name,
        date,
        progress,
        tasks: selectedTasks, // Puede ser un array vacío
        completed: goals[index].completed
    };

    localStorage.setItem("goals", JSON.stringify(goals));
    alert(`El objetivo "${name}" se ha editado correctamente.`);
    document.getElementById("editGoalFormContainer").style.display = "none";
    document.getElementById("createGoalForm").style.display = "block";
    loadGoals();
}


function toggleGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];

    if (goals[index]) {  // Asegurarse de que el índice es válido
        goals[index].completed = !goals[index].completed;
        localStorage.setItem("goals", JSON.stringify(goals));
        loadGoals(); // Actualiza la lista de objetivos
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
    let catName = document.getElementById("catName").value;

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
    // Obtener todos los tags seleccionados
    let selectedTags = document.querySelectorAll("#categoriesTags .category-tag.selected");
    let categoriesToDelete = Array.from(selectedTags).map(tag => tag.getAttribute("data-category"));

    if (categoriesToDelete.length === 0) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona al menos una categoría para eliminar.'
        });
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
            Swal.fire({
                title: "Acceso restringido: \nNo se admiten calvos.",
                text: "PD: Vete a Turquía si quieres entrar.",
                icon: "error",
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        } else {
            document.getElementById("contenido").style.display = "block";
            Swal.fire("Acceso concedido", "Enorabuena por tu pelazo!", "success");
        }
    });
}




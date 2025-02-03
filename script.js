/********************************* CARGA DE DATOS AL INICIAR LA APLICACIÓN **************************************/
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();           // Cargar las tareas
    loadCategorias();      // Cargar las categorías
    loadGoals();           // Cargar los objetivos
    checkTaskDeadlines();  // Verificar tareas que vencen hoy
    updateTaskListForGoals();  // Actualizar tareas en los objetivos
});

/********************************* FUNCIONES PARA ELEGIR EL GESTOR A MOSTRAR **************************************/
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

/********************************* FUNCIONES GESTOR DE TAREAS**************************************/
function addTask() {
    let name = document.getElementById("taskName").value;
    let date = document.getElementById("taskDate").value;
    let category = document.getElementById("taskCategory").value;
    let recurring = document.querySelector('input[name="recurrence"]:checked') ? document.querySelector('input[name="recurrence"]:checked').value : '';

    if (!name) return alert("Escribe una tarea");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ name, date, category, recurring, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizar ambas vistas
    loadTasks(); // Actualiza el Gestor de Tareas
    updateTaskListForGoals(); // Actualiza la lista de tareas en Mis Objetivos
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskContainer = document.getElementById("tasks");
    let taskSelect = document.getElementById("taskCategory");

    taskContainer.innerHTML = ""; // Limpiar tareas anteriores
    taskSelect.innerHTML = ""; // Limpiar categorías de tareas

    // Cargar tareas al Gestor de Tareas
    tasks.forEach((task, index) => {
        let taskElement = document.createElement("div");
        taskElement.className = "task" + (task.completed ? " completed" : "");
        taskElement.innerHTML = `
            <strong>${task.name}</strong> Categoría: ${task.category}  -  Fecha: ${task.date} 
            ${task.recurring ? "(Recorrente: " + task.recurring + ")" : ""}
            <button class="btnTasks push" onclick="toggleTask(${index})">✔</button>
            <button class="btnTasks" onclick="deleteTask(${index})">🗑</button>
            
        `;
        taskContainer.appendChild(taskElement);

        // Agregar tareas al selector de categorías
        let option = document.createElement("option");
        option.value = task.name; // Usamos el nombre de la tarea como valor
        option.textContent = task.name; // Mostramos el nombre de la tarea
        taskSelect.appendChild(option);
    });
}

function updateTaskListForGoals() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskSelectForGoal = document.getElementById("goalTask");

    taskSelectForGoal.innerHTML = ""; // Limpiar las opciones actuales
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar tarea";
    taskSelectForGoal.appendChild(defaultOption);

    // Cargar tareas al selector de tareas para los objetivos
    tasks.forEach(task => {
        let option = document.createElement("option");
        option.value = task.name;
        option.textContent = task.name;
        taskSelectForGoal.appendChild(option);
    });
}

function toggleTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizar ambas vistas
    loadTasks(); // Actualiza el Gestor de Tareas
    updateTaskListForGoals(); // Actualiza la lista de tareas en Mis Objetivos
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Actualizar ambas vistas
    loadTasks(); // Actualiza el Gestor de Tareas
    updateTaskListForGoals(); // Actualiza la lista de tareas en Mis Objetivos
}


/********************************* FUNCIONES GESTOR DE MIS OBJETIVOS**************************************/
function addGoal() {
    let name = document.getElementById("goalName").value;
    let date = document.getElementById("goalDate").value;
    let progress = document.getElementById("goalProgress").value;
    let task = document.getElementById("goalTask").value;

    if (!name || !date || !progress) return alert("Todos los campos son obligatorios");

    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    goals.push({ name, date, progress, task, completed: false });
    localStorage.setItem("goals", JSON.stringify(goals));
    loadGoals();
}

function loadGoals() {
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    let goalsContainer = document.getElementById("goals");
    goalsContainer.innerHTML = "";

    goals.forEach((goal, index) => {
        let goalElement = document.createElement("div");
        goalElement.className = "goal";
        goalElement.innerHTML = `
            <strong>${goal.name}</strong> <strong>Fecha:</strong> ${goal.date}  <strong>Progreso:</strong> ${goal.progress}% 
            ${goal.completed ? "(Completado)" : "(En progreso)"}
            <div><strong>Tareas Asignadas:</strong> ${goal.task || "No hay tareas asignadas"}</div>
            <button class="btnGoals push" onclick="toggleGoal(${index})">✔</button>
            <button class="btnGoals" onclick="deleteGoal(${index})">🗑</button>
            <button class="btnGoals" onclick="editGoal(${index})">✏️</button>
            
        `;
        goalsContainer.appendChild(goalElement);
    });
}

function toggleGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals"));
    goals[index].completed = !goals[index].completed;
    localStorage.setItem("goals", JSON.stringify(goals));
    loadGoals();
}

function deleteGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals"));
    goals.splice(index, 1);
    localStorage.setItem("goals", JSON.stringify(goals));
    loadGoals();
}

// Nuevo formulario de edición de objetivo
function editGoal(index) {
    let goals = JSON.parse(localStorage.getItem("goals"));
    let goal = goals[index];

    // Mostrar formulario de edición debajo
    let createFormContainer = document.getElementById("createGoalForm");
    createFormContainer.style.display = "none";
    let editFormContainer = document.getElementById("editGoalFormContainer");
    editFormContainer.style.display = "block"; // Mostrar formulario de edición
    document.getElementById("editGoalName").value = goal.name;
    document.getElementById("editGoalDate").value = goal.date;
    document.getElementById("editGoalProgress").value = goal.progress;
    document.getElementById("editGoalTask").value = goal.task;

    // Cargar las tareas disponibles en el selector de tareas
    loadTasksForEditGoal(goal.task);

    // Cambiar el botón para "Actualizar objetivo"
    let updateGoalButton = document.getElementById("updateGoalButton");
    updateGoalButton.dataset.index = index; // Guardar el índice del objetivo a editar
}

function loadTasksForEditGoal(selectedTask) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let editGoalTaskSelect = document.getElementById("editGoalTask");

    // Limpiar el selector de tareas para editar
    editGoalTaskSelect.innerHTML = "";

    // Crear una opción por defecto
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona una tarea";
    editGoalTaskSelect.appendChild(defaultOption);

    // Cargar las tareas disponibles en el selector
    tasks.forEach(task => {
        let option = document.createElement("option");
        option.value = task.name;
        option.textContent = task.name;
        if (task.name === selectedTask) {
            option.selected = true; // Seleccionar la tarea actual
        }
        editGoalTaskSelect.appendChild(option);
    });
}

function updateGoal() {
    let index = document.getElementById("updateGoalButton").dataset.index;
    let name = document.getElementById("editGoalName").value;
    let date = document.getElementById("editGoalDate").value;
    let progress = document.getElementById("editGoalProgress").value;
    let task = document.getElementById("editGoalTask").value;

    if (!name || !date || !progress) return alert("Todos los campos son obligatorios");

    let goals = JSON.parse(localStorage.getItem("goals"));

    // Actualizar el objetivo en lugar de crear uno nuevo
    goals[index] = { name, date, progress, task, completed: goals[index].completed };
    localStorage.setItem("goals", JSON.stringify(goals));

    // Limpiar el formulario y ocultarlo
    let createFormContainer = document.getElementById("createGoalForm");
    createFormContainer.style.display = "block";
    document.getElementById("editGoalFormContainer").style.display = "none";
    document.getElementById("editGoalName").value = "";
    document.getElementById("editGoalDate").value = "";
    document.getElementById("editGoalProgress").value = "";
    document.getElementById("editGoalTask").value = "";

    loadGoals();
}


/********************************* FUNCIONES GESTOR DE CATEGORIAS**************************************/
function addCat() {
    let catName = document.getElementById("catName").value;
    if (!catName) return alert("Escribe un nombre para la categoría");
    
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    categories.push(catName);  // Agregamos la nueva categoría
    localStorage.setItem("categories", JSON.stringify(categories));

    loadCategorias();  // Recargar las categorías después de añadir

    alert(`Categoría "${catName}" creada correctamente`); // Mensaje de confirmación
}


function loadCategorias() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let categorySelect = document.getElementById("categorySelect");
    let taskCategorySelect = document.getElementById("taskCategory");

    // Limpiar los selectores actuales
    categorySelect.innerHTML = "";
    taskCategorySelect.innerHTML = "";

    // Crear una opción por cada categoría
    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);

        // Añadir las categorías al selector de tareas
        let taskOption = document.createElement("option");
        taskOption.value = cat;
        taskOption.textContent = cat;
        taskCategorySelect.appendChild(taskOption);
    });
}

function eliminarCategoria() {
    let catSelect = document.getElementById("categorySelect");
    let categoryToDelete = catSelect.value;
    if (!categoryToDelete) return alert("Selecciona una categoría para eliminar");

    let categories = JSON.parse(localStorage.getItem("categories"));
    categories = categories.filter(cat => cat !== categoryToDelete);  // Filtramos la categoría seleccionada
    localStorage.setItem("categories", JSON.stringify(categories));

    loadCategorias();  // Recargamos las categorías después de eliminar
}

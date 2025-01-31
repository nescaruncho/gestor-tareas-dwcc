/* script.js */
document.addEventListener("DOMContentLoaded", loadTasks);
document.addEventListener("DOMContentLoaded", loadCategorias());
function addTask() {
    let name = document.getElementById("taskName").value;
    let date = document.getElementById("taskDate").value;
    let category = document.getElementById("taskCategory").value;
    
    if (!name) return alert("Escribe una tarea");
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ name, date, category, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = "";
    
    tasks.forEach((task, index) => {
        let taskElement = document.createElement("div");
        taskElement.className = "task" + (task.completed ? " completed" : "");
        taskElement.innerHTML = `
            <strong>${task.name}</strong> - ${task.category} - ${task.date}
            <button onclick="toggleTask(${index})">✔</button>
            <button onclick="deleteTask(${index})">🗑</button>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

function toggleTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
}



function addCat() {
    let select = document.getElementById("taskCategory");
    let catInput = document.getElementById("catName").value.trim(); // Obtener el valor del input

    if (catInput === "") {
        alert("Por favor, ingresa un nombre de categoría.");
        return;
    }

    let nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = catInput; // Asignar el valor
    nuevaOpcion.text = catInput; // Asignar el texto visible
    select.appendChild(nuevaOpcion); // Agregar la opción al select

    // Guardar en localStorage
    let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
    categorias.push({ name: catInput });
    localStorage.setItem("categorias", JSON.stringify(categorias));

    loadCategorias(); // Recargar las tareas
}

function loadCategorias() {
    let tasks = JSON.parse(localStorage.getItem("categorias")) || [];
    let tasksContainer = document.getElementById("categorias");
    tasksContainer.innerHTML = "";
}

function eliminarCategoria() {
    let select = document.getElementById("taskCategory");
    let categoriaSeleccionada = select.value; // Obtener el valor de la categoría seleccionada

    if (categoriaSeleccionada === "") {
        alert("Por favor, selecciona una categoría para eliminar.");
        return;
    }

    // Eliminar la opción del <select>
    let options = select.getElementsByTagName("option");
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === categoriaSeleccionada) {
            select.removeChild(options[i]);
            break;
        }
    }

    // Eliminar la categoría de las tareas en localStorage
    let tasks = JSON.parse(localStorage.getItem("categorias")) || [];
    tasks = tasks.filter(task => task.category !== categoriaSeleccionada); // Filtrar tareas sin la categoría eliminada

    localStorage.setItem("tasks", JSON.stringify(tasks));

    loadTasks(); // Recargar las tareas
}



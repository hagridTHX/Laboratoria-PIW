let tasks = []; 
let deletedTask = null; 
let taskToDeleteId = null; 

const taskInput = document.getElementById('new-task-input');
const listSelector = document.getElementById('list-selector');
const addBtn = document.getElementById('add-btn');
const listsContainer = document.getElementById('lists-container');
const undoBtn = document.getElementById('undo-btn');

const searchInput = document.getElementById('search-input');
const caseSensitiveCb = document.getElementById('case-sensitive-cb');

const deleteModal = document.getElementById('delete-modal');
const modalText = document.getElementById('modal-text');
const modalYesBtn = document.getElementById('modal-yes');
const modalNoBtn = document.getElementById('modal-no');

function renderTasks() {
    listsContainer.innerHTML = '';

    const searchText = searchInput.value;
    const isCaseSensitive = caseSensitiveCb.checked;

    const categories = [
        { id: 'list-normal', name: 'Mało pilne' },
        { id: 'list-urgent', name: 'Pilne' },
        { id: 'list-yesterday', name: 'Bardzo pilne' }
    ];

    categories.forEach(function(category) {
        const categoryTasks = tasks.filter(function(task) {
            const matchesCategory = task.listId === category.id;
            
            let matchesSearch = false;
            if (isCaseSensitive) {
                matchesSearch = task.text.includes(searchText);
            } else {
                matchesSearch = task.text.toLowerCase().includes(searchText.toLowerCase());
            }

            return matchesCategory && matchesSearch;
        });

        const section = document.createElement('div');
        section.className = 'todo-list-section';

        const header = document.createElement('div');
        header.className = 'list-header';
        header.textContent = category.name + ' (' + categoryTasks.length + ')';
        
        const ul = document.createElement('ul');
        ul.className = 'task-list';

        header.addEventListener('click', function() {
            if (ul.style.display === 'none') {
                ul.style.display = 'block';
            } else {
                ul.style.display = 'none';
            }
        });

        categoryTasks.forEach(function(task) {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed === true) {
                li.classList.add('completed');
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'task-content';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;
            contentDiv.appendChild(textSpan);

            if (task.completed === true && task.completedDate !== null) {
                const dateSpan = document.createElement('span');
                dateSpan.className = 'task-date';
                dateSpan.textContent = '(Wykonano: ' + task.completedDate + ')';
                contentDiv.appendChild(dateSpan);
            }

            contentDiv.addEventListener('click', function() {
                toggleTask(task.id);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'X';
            delBtn.addEventListener('click', function(event) {
                event.stopPropagation(); 
                requestDelete(task.id);
            });

            li.appendChild(contentDiv);
            li.appendChild(delBtn);
            ul.appendChild(li);
        });

        section.appendChild(header);
        section.appendChild(ul);
        listsContainer.appendChild(section);
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
        alert('Zadanie nie może być puste!');
        return;
    }

    const newTask = {
        id: Date.now(), 
        text: text,
        listId: listSelector.value,
        completed: false,
        completedDate: null
    };

    tasks.push(newTask);
    taskInput.value = ''; 
    renderTasks();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task !== undefined) {
        task.completed = !task.completed; 
        
        if (task.completed === true) {
            const now = new Date();
            task.completedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        } else {
            task.completedDate = null;
        }
        renderTasks();
    }
}

function requestDelete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task !== undefined) {
        taskToDeleteId = taskId;
        modalText.textContent = 'Czy na pewno chcesz usunąć zadanie o treści: ' + task.text;
        deleteModal.classList.remove('hidden'); 
    }
}

function confirmDelete() {
    if (taskToDeleteId !== null) {
        const index = tasks.findIndex(t => t.id === taskToDeleteId);
        if (index !== -1) {
            deletedTask = tasks[index]; 
            tasks.splice(index, 1); 
            
            undoBtn.classList.remove('hidden'); 
        }
        
        taskToDeleteId = null;
        deleteModal.classList.add('hidden'); 
        renderTasks();
    }
}

function cancelDelete() {
    taskToDeleteId = null;
    deleteModal.classList.add('hidden');
}

function undoDelete() {
    if (deletedTask !== null) {
        tasks.push(deletedTask); 
        deletedTask = null; 
        undoBtn.classList.add('hidden'); 
        renderTasks();
    }
}

addBtn.addEventListener('click', addTask);

searchInput.addEventListener('input', renderTasks);
caseSensitiveCb.addEventListener('change', renderTasks);

modalYesBtn.addEventListener('click', confirmDelete);
modalNoBtn.addEventListener('click', cancelDelete);

undoBtn.addEventListener('click', undoDelete);

renderTasks();
const API_URL = 'api/tasks';

// DOM Elements
let currentEditTaskId = null;

// Check API Status
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_URL}`, { method: 'GET' });
        const statusElement = document.getElementById('apiStatus');

        if (response.ok) {
            statusElement.className = 'status-online';
            statusElement.innerHTML = '<i class="fas fa-circle"></i> API доступно';
        } else {
            statusElement.className = 'status-offline';
            statusElement.innerHTML = '<i class="fas fa-circle"></i> API недоступно';
        }
    } catch (error) {
        const statusElement = document.getElementById('apiStatus');
        statusElement.className = 'status-offline';
        statusElement.innerHTML = '<i class="fas fa-circle"></i> API недоступно';
    }
}

// Load all tasks
async function loadAllTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch tasks');

        const tasks = await response.json();
        displayTasks(tasks);
        updateFilterButtons('all');
    } catch (error) {
        showError('Не удалось загрузить задачи');
    }
}

// Filter by status
async function filterByStatus(status) {
    try {
        const response = await fetch(`${API_URL}/status/${status}`);
        if (!response.ok) throw new Error('Failed to filter tasks');

        const tasks = await response.json();
        displayTasks(tasks);
        updateFilterButtons(status);
    } catch (error) {
        showError('Не удалось отфильтровать задачи');
    }
}

// Create new task
async function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();

    if (!title) {
        alert('Пожалуйста, введите название задачи');
        return;
    }

    const taskData = {
        title: title,
        description: description || '',
        status: 'ACTIVE'
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to create task');

        clearForm();
        loadAllTasks();
        showSuccess('Задача успешно создана!');
    } catch (error) {
        showError('Не удалось создать задачу');
    }
}

// Update task
async function updateTask() {
    const id = currentEditTaskId;
    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const status = document.getElementById('editTaskStatus').value;

    if (!title) {
        alert('Пожалуйста, введите название задачи');
        return;
    }

    const taskData = {
        title: title,
        description: description,
        status: status
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to update task');

        closeEditModal();
        loadAllTasks();
        showSuccess('Задача успешно обновлена!');
    } catch (error) {
        showError('Не удалось обновить задачу');
    }
}

// Update task status
async function updateTaskStatusDirect(id, status) {
    try {
        const response = await fetch(`${API_URL}/${id}/status?status=${status}`, {
            method: 'PATCH'
        });

        if (!response.ok) throw new Error('Failed to update status');

        loadAllTasks();
        showSuccess('Статус задачи обновлен!');
    } catch (error) {
        showError('Не удалось обновить статус');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        loadAllTasks();
        showSuccess('Задача успешно удалена!');
    } catch (error) {
        showError('Не удалось удалить задачу');
    }
}

// Delete all tasks
async function deleteAllTasks() {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ задачи? Это действие нельзя отменить.')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete all tasks');

        loadAllTasks();
        showSuccess('Все задачи успешно удалены!');
    } catch (error) {
        showError('Не удалось удалить все задачи');
    }
}

// Display tasks in UI
// Display tasks in UI
function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard"></i>
                <p>Задачи не найдены</p>
                <p>Создайте первую задачу!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-card ${task.status === 'COMPLETED' ? 'completed' : ''}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status ${task.status === 'ACTIVE' ? 'status-active' : 'status-completed'}">
                    ${task.status === 'ACTIVE' ? 'Активная' : 'Завершенная'}
                </span>
            </div>

            ${task.description ? `
                <p class="task-description">${escapeHtml(task.description)}</p>
            ` : ''}

            <div class="task-meta">
                <div class="task-actions">
                    <button onclick="openEditModal(${task.id}, '${escapeHtml(task.title)}', '${escapeHtml(task.description || '')}', '${task.status}')"
                            class="icon-btn edit-btn" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>

                    ${task.status === 'ACTIVE' ? `
                        <button onclick="updateTaskStatusDirect(${task.id}, 'COMPLETED')"
                                class="icon-btn complete-btn" title="Завершить задачу">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    ` : ''}

                    <button onclick="deleteTask(${task.id})"
                            class="icon-btn delete-btn" title="Удалить задачу">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Open edit modal
function openEditModal(id, title, description, status) {
    currentEditTaskId = id;
    document.getElementById('editTaskId').value = id;
    document.getElementById('editTaskTitle').value = title;
    document.getElementById('editTaskDescription').value = description;
    document.getElementById('editTaskStatus').value = status;
    document.getElementById('editModal').style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditTaskId = null;
    document.getElementById('editTaskId').value = '';
    document.getElementById('editTaskTitle').value = '';
    document.getElementById('editTaskDescription').value = '';
}

// Clear form
function clearForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
}

// Update filter buttons
function updateFilterButtons(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (activeFilter === 'all') {
        document.querySelector('.filter-btn:nth-child(1)').classList.add('active');
    } else if (activeFilter === 'ACTIVE') {
        document.querySelector('.filter-btn:nth-child(2)').classList.add('active');
    } else if (activeFilter === 'COMPLETED') {
        document.querySelector('.filter-btn:nth-child(3)').classList.add('active');
    }
}

// Show success message
function showSuccess(message) {
    alert(message);
}

// Show error message
function showError(message) {
    alert(`Ошибка: ${message}`);
}
// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllTasks();
    checkApiStatus();

    // Check API status every 30 seconds
    setInterval(checkApiStatus, 30000);

    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    }
});
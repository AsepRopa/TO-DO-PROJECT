class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.dateInput = document.getElementById('dateInput');
        this.todoList = document.getElementById('todoList');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.taskCounter = document.getElementById('taskCounter');
        this.emptyState = document.getElementById('emptyState');
        this.todoError = document.getElementById('todoError');
        this.dateError = document.getElementById('dateError');
    }

    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    validateForm() {
        let isValid = true;
        
        
        this.todoError.textContent = '';
        this.dateError.textContent = '';

        
        const todoText = this.todoInput.value.trim();
        if (!todoText) {
            this.todoError.textContent = 'Task description is required';
            isValid = false;
        } else if (todoText.length < 3) {
            this.todoError.textContent = 'Task description must be at least 3 characters';
            isValid = false;
        } else if (todoText.length > 100) {
            this.todoError.textContent = 'Task description must be less than 100 characters';
            isValid = false;
        }

        
        const dateValue = this.dateInput.value;
        if (!dateValue) {
            this.dateError.textContent = 'Due date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(dateValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.dateError.textContent = 'Due date cannot be in the past';
                isValid = false;
            }
        }

        return isValid;
    }

    handleAddTodo(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const todoText = this.todoInput.value.trim();
        const dueDate = this.dateInput.value;

        const newTodo = {
            id: this.generateId(),
            text: todoText,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(newTodo);
        this.saveTodos();
        this.render();
        this.todoForm.reset();
    }

    handleFilter(e) {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    getTaskStatus(todo) {
        if (todo.completed) return 'completed';
        
        const today = new Date();
        const dueDate = new Date(todo.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) return 'overdue';
        return 'pending';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        
        if (date.getTime() === today.getTime()) return '📅 Today';
        if (date.getTime() === tomorrow.getTime()) return '📅 Tomorrow';
        
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return '📅 ' + date.toLocaleDateString('en-US', options);
    }

    getFilteredTodos() {
        return this.todos.filter(todo => {
            const status = this.getTaskStatus(todo);
            switch (this.currentFilter) {
                case 'completed': return todo.completed;
                case 'pending': return !todo.completed && status !== 'overdue';
                case 'overdue': return !todo.completed && status === 'overdue';
                default: return true;
            }
        });
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        this.taskCounter.textContent = `${totalTasks} total, ${completedTasks} completed`;

        
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.todoList.innerHTML = '';
            return;
        }

        this.emptyState.classList.add('hidden');

        
        this.todoList.innerHTML = filteredTodos.map(todo => {
            const status = this.getTaskStatus(todo);
            return `
                <li class="todo-item ${status}" data-id="${todo.id}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="todoApp.toggleTodo('${todo.id}')">
                    <div class="todo-content">
                        <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                        <div class="todo-date ${status === 'overdue' ? 'overdue' : ''}">${this.formatDate(todo.dueDate)}</div>
                    </div>
                    <span class="todo-status status-${status}">${status}</span>
                    <button class="delete-btn" onclick="todoApp.deleteTodo('${todo.id}')">🗑️ Delete</button>
                </li>
            `;
        }).join('');
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

const todoApp = new TodoApp();
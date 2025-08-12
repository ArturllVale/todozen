// Módulo de gerenciamento de tarefas
import { storage } from './storage.js';
import { elements } from './dom-elements.js';
import { utils } from './utils.js';

export class TaskManager {
  constructor() {
    this.activeTagFilters = [];
    this.showArchived = false;
    this.taskToDeleteId = null;
    this.activeListId = localStorage.getItem('todo_zen_active_list');
  }

  /**
   * Renderiza a lista de tarefas na tela, aplicando filtros e ordenação.
   */
  renderTasks() {
    const query = elements.searchInput.value.toLowerCase();
    let tasks = storage.getTasks();

    // 1. Filtrar
    // Primeiro, filtra pela lista ativa
    if (this.activeListId) {
      tasks = tasks.filter(task => task.listId === this.activeListId);
    }

    if (!this.showArchived) {
      tasks = tasks.filter(task => !task.archived);
    }
    if (query) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    if (this.activeTagFilters.length > 0) {
      tasks = tasks.filter(task =>
        task.tags && this.activeTagFilters.every(tagId => task.tags.includes(tagId))
      );
    }

    // 2. Ordenar
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.favorited !== b.favorited) return a.favorited ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

    // 3. Renderizar
    elements.tasksListContainer.innerHTML = '';
    if (tasks.length === 0) {
      elements.emptyState.classList.remove('hidden');
      elements.emptyStateTitle.textContent = query || this.activeTagFilters.length > 0 ? 'Nenhuma tarefa encontrada' : 'Sua lista está vazia';
      elements.emptyStateMessage.textContent = query || this.activeTagFilters.length > 0 ? 'Tente uma busca ou filtro diferente.' : 'Adicione uma nova tarefa para começar.';
    } else {
      elements.emptyState.classList.add('hidden');
      tasks.forEach(task => this.createTaskElement(task));
    }
  }

  /**
   * Cria o elemento HTML para uma única tarefa.
   * @param {object} task - O objeto da tarefa.
   */
  createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.classList.toggle('completed', task.completed);
    taskEl.classList.toggle('favorited', task.favorited);
    taskEl.classList.toggle('archived', task.archived);
    if (task.priority) {
      taskEl.classList.add(`priority-${task.priority}`);
    }
    taskEl.dataset.taskId = task.id;

    const tags = storage.getTags();

    // Determinar a cor da faixa lateral baseada na primeira tag
    if (task.tags && task.tags.length > 0) {
      const firstTag = tags.find(t => t.id === task.tags[0]);
      if (firstTag) {
        taskEl.classList.add('has-tag');
        taskEl.style.setProperty('--tag-color', firstTag.color);
      }
    }

    const taskTagsHtml = (task.tags || []).map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? `<span class="tag clickable" style="background-color: ${tag.color};" data-tag-id="${tag.id}">${tag.name}</span>` : '';
    }).join('');

    const descriptionHtml = task.description ? `<div class="task-description">${task.description}</div>` : '';

    taskEl.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title-text">${task.title}</div>
        ${descriptionHtml}
        ${task.dueDate ? `
          <div class="task-due-date ${utils.isOverdue(task.dueDate) ? 'overdue' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${utils.formatDueDate(task.dueDate)}
          </div>
        ` : ''}
        ${task.recurrence && task.recurrence !== 'none' ? `
          <div class="task-recurrence">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
            ${utils.getRecurrenceText(task.recurrence)}
          </div>
        ` : ''}
        <div class="task-tags">${taskTagsHtml}</div>
      </div>
      <div class="task-actions">
        <button class="button icon-button favorite-btn ${task.favorited ? 'active' : ''}" title="Favoritar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>
        <button class="button icon-button move-btn" title="Mover para outra lista">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right-circle"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </button>
        <button class="button icon-button archive-btn" title="Arquivar">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
        </button>
        <button class="button icon-button edit-btn" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>
        <button class="button icon-button danger delete-btn" title="Excluir">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    elements.tasksListContainer.appendChild(taskEl);
  }

  /**
   * Move uma tarefa para outra lista
   */
  moveTask(taskId, newListId) {
    let tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].listId = newListId;
      storage.saveTasks(tasks);
      this.renderTasks();
      utils.showNotification('Tarefa movida com sucesso!', 'success');
    }
  }

  /**
   * Adiciona filtro de tag
   */
  addTagFilter(tagId) {
    if (!this.activeTagFilters.includes(tagId)) {
      this.activeTagFilters.push(tagId);
      return true;
    }
    return false;
  }

  /**
   * Remove filtro de tag
   */
  removeTagFilter(tagId) {
    this.activeTagFilters = this.activeTagFilters.filter(id => id !== tagId);
  }

  /**
   * Limpa todos os filtros de tag
   */
  clearTagFilters() {
    this.activeTagFilters = [];
  }

  /**
   * Alterna exibição de tarefas arquivadas
   */
  toggleArchived() {
    this.showArchived = !this.showArchived;
    return this.showArchived;
  }

  /**
   * Define a lista ativa
   */
  setActiveList(listId) {
    this.activeListId = listId;
    localStorage.setItem('todo_zen_active_list', listId);
  }
}
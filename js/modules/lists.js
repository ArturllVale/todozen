// Módulo de gerenciamento de listas
import { storage } from './storage.js';
import { elements } from './dom-elements.js';
import { utils } from './utils.js';

export class ListManager {
  constructor(taskManager = null) {
    this.activeListId = localStorage.getItem('todo_zen_active_list');
    this.taskManager = taskManager;
  }

  /**
   * Define a referência do TaskManager para poder atualizar a visualização
   */
  setTaskManager(taskManager) {
    this.taskManager = taskManager;
  }

  /**
   * Renderiza as listas na barra lateral.
   */
  renderLists() {
    const lists = storage.getLists();
    elements.listsContainer.innerHTML = '';
    lists.forEach(list => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item';
      listItem.textContent = list.name;
      listItem.dataset.listId = list.id;
      if (list.id === this.activeListId) {
        listItem.classList.add('active');
        elements.listTitleDisplay.textContent = list.name;
      }
      elements.listsContainer.appendChild(listItem);
    });
  }

  /**
   * Troca a lista ativa e re-renderiza as tarefas.
   * @param {string} listId - O ID da lista para ativar.
   */
  switchActiveList(listId) {
    this.activeListId = listId;
    localStorage.setItem('todo_zen_active_list', listId);
    this.renderLists();
    return listId;
  }

  /**
   * Cria uma nova lista
   */
  createNewList(name) {
    const newList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now()
    };
    const lists = storage.getLists();
    lists.push(newList);
    storage.saveLists(lists);
    this.switchActiveList(newList.id);
    utils.showNotification('Lista criada com sucesso!', 'success');
    return newList;
  }

  /**
   * Abre o diálogo de mover tarefa
   */
  openMoveTaskDialog(taskId) {
    const lists = storage.getLists().filter(list => list.id !== this.activeListId);
    elements.moveTaskListsContainer.innerHTML = '';

    if (lists.length === 0) {
      elements.moveTaskListsContainer.innerHTML = '<p>Não há outras listas para mover.</p>';
    } else {
      lists.forEach(list => {
        const listEl = document.createElement('div');
        listEl.className = 'list-item';
        listEl.textContent = list.name;
        listEl.dataset.listId = list.id;
        listEl.addEventListener('click', () => {
          this.moveTask(taskId, list.id);
        });
        elements.moveTaskListsContainer.appendChild(listEl);
      });
    }
    elements.moveTaskDialog.classList.remove('hidden');
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
      elements.moveTaskDialog.classList.add('hidden');

      // A tarefa foi movida, mas a visualização do usuário não deve mudar.
      // Apenas re-renderizamos a lista atual, e a tarefa movida desaparecerá.
      if (this.taskManager && typeof this.taskManager.renderTasks === 'function') {
        this.taskManager.renderTasks();
        utils.showNotification('Tarefa movida com sucesso!', 'success');
      } else {
        console.error('TaskManager não está disponível para renderizar tarefas.');
        utils.showNotification('Erro ao mover tarefa: TaskManager não encontrado.', 'error');
      }
      
      return true;
    }
    return false;
  }

  /**
   * Obtém a lista ativa atual
   */
  getActiveListId() {
    return this.activeListId;
  }

  /**
   * Define a lista ativa
   */
  setActiveListId(listId) {
    this.activeListId = listId;
  }
}
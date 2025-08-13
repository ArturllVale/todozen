// Arquivo principal da aplicação TodoZen
// Importa todos os módulos necessários
import { storage } from './modules/storage.js';
import { elements } from './modules/dom-elements.js';
import { utils } from './modules/utils.js';
import { NotificationManager } from './modules/notifications.js';
import { TaskManager } from './modules/tasks.js';
import { TagManager } from './modules/tags.js';
import { ListManager } from './modules/lists.js';
import { DialogManager } from './modules/dialogs.js';
import { CalendarManager } from './modules/calendar.js';
import { ImportExportManager } from './modules/import-export.js';
import { SidebarManager } from './modules/sidebar.js';
import { PWAManager } from './modules/pwa.js';
import { KeyboardShortcuts } from './modules/keyboard-shortcuts.js';

// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar gerenciadores
  const notificationManager = new NotificationManager();
  const taskManager = new TaskManager();
  const tagManager = new TagManager();
  const listManager = new ListManager();
  const dialogManager = new DialogManager(tagManager);
  const calendarManager = new CalendarManager(dialogManager);
  const importExportManager = new ImportExportManager(listManager);
  const sidebarManager = new SidebarManager();
  const pwaManager = new PWAManager();
  const keyboardShortcuts = new KeyboardShortcuts(dialogManager);

  // Conecta o ListManager ao TaskManager
  listManager.setTaskManager(taskManager);

  // Migrar dados se necessário
  const migratedActiveListId = storage.migrateData(listManager.getActiveListId());
  listManager.setActiveListId(migratedActiveListId);
  taskManager.setActiveList(migratedActiveListId);

  // --- Event Listeners Principais ---

  // Busca de tarefas
  elements.searchInput.addEventListener('input', () => taskManager.renderTasks());

  // Ordenação de tarefas
  elements.sortTasksSelect.addEventListener('change', (e) => {
    taskManager.setSortBy(e.target.value);
    taskManager.renderTasks();
  });

  // Botões de adicionar tarefa
  elements.addTaskBtn.addEventListener('click', () => dialogManager.openTaskDialog('add'));
  elements.emptyStateAddBtn.addEventListener('click', () => dialogManager.openTaskDialog('add'));

  // Diálogo de tarefa
  elements.closeDialogBtn.addEventListener('click', () => dialogManager.closeTaskDialog());
  elements.cancelDialogBtn.addEventListener('click', () => dialogManager.closeTaskDialog());

  // Formulário de tarefa
  elements.addEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = elements.taskIdInput.value;
    const title = elements.taskTitleInput.value.trim();
    const description = elements.taskDescriptionInput.value.trim();

    if (!title) return;

    // Obter tags selecionadas
    const selectedTags = Array.from(elements.taskTagsContainer.querySelectorAll('.tag.selected')).map(t => t.dataset.tagId);

    let tasks = storage.getTasks();

    if (id) { // Editando
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex > -1) {
        tasks[taskIndex].title = title;
        tasks[taskIndex].description = description;
        tasks[taskIndex].tags = selectedTags;
        tasks[taskIndex].dueDate = elements.taskDueDateInput.value || null;
        tasks[taskIndex].priority = elements.taskPrioritySelect.value;
        tasks[taskIndex].recurrence = elements.taskRecurrenceSelect.value;
        tasks[taskIndex].notificationMinutes = elements.taskDueDateInput.value ? parseInt(elements.taskNotificationTimeSelect.value) : null;
        tasks[taskIndex].notificationSent = false;
      }
    } else { // Adicionando
      const newTask = {
        id: crypto.randomUUID(),
        title,
        description,
        tags: selectedTags,
        listId: listManager.getActiveListId(),
        completed: false,
        favorited: false,
        archived: false,
        createdAt: Date.now(),
        dueDate: elements.taskDueDateInput.value || null,
        priority: elements.taskPrioritySelect.value,
        recurrence: elements.taskRecurrenceSelect.value,
        notificationMinutes: elements.taskDueDateInput.value ? parseInt(elements.taskNotificationTimeSelect.value) : null,
        notificationSent: false
      };
      tasks.unshift(newTask);
    }

    storage.saveTasks(tasks);
    taskManager.renderTasks();
    dialogManager.closeTaskDialog();
    utils.showNotification(id ? 'Tarefa atualizada!' : 'Tarefa adicionada!', 'success');
  });

  // Diálogo de visualização de tarefa
  elements.closeViewTaskDialogBtn.addEventListener('click', () => dialogManager.closeViewTaskDialog());
  elements.viewTaskEditBtn.addEventListener('click', (e) => {
    const taskId = e.target.dataset.taskId;
    dialogManager.closeViewTaskDialog();
    dialogManager.openTaskDialog('edit', taskId);
  });

  // Event listeners para ações das tarefas
  elements.tasksListContainer.addEventListener('click', (e) => {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.taskId;
    const tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Filtro por tag quando clicar em uma tag
    if (target.classList.contains('clickable') && target.dataset.tagId) {
      const tagId = target.dataset.tagId;
      if (taskManager.addTagFilter(tagId)) {
        tagManager.updateTagFiltersUI(taskManager.activeTagFilters);
        taskManager.renderTasks();
      }
      return;
    }

    if (target.classList.contains('task-checkbox')) {
      tasks[taskIndex].completed = target.checked;
    } else if (target.closest('.favorite-btn')) {
      tasks[taskIndex].favorited = !tasks[taskIndex].favorited;
    } else if (target.closest('.archive-btn')) {
      tasks[taskIndex].archived = !tasks[taskIndex].archived;
    } else if (target.closest('.move-btn')) {
      listManager.openMoveTaskDialog(taskId);
      return;
    } else if (target.closest('.edit-btn')) {
      dialogManager.openTaskDialog('edit', taskId);
      return;
    } else if (target.closest('.delete-btn')) {
      taskManager.taskToDeleteId = taskId;
      elements.confirmDialog.classList.remove('hidden');
      return;
    } else if (target.closest('.task-content')) {
      // Abre o diálogo de visualização se clicar no conteúdo da tarefa
      dialogManager.openViewTaskDialog(taskId);
      return;
    } else {
      return;
    }

    storage.saveTasks(tasks);
    taskManager.renderTasks();
  });

  // Menu dropdown
  elements.menuBtn.addEventListener('click', () => elements.menuDropdown.classList.toggle('hidden'));
  document.addEventListener('click', (e) => {
    if (!elements.menuBtn.contains(e.target) && !elements.menuDropdown.contains(e.target)) {
      elements.menuDropdown.classList.add('hidden');
    }
  });

  // Ações do menu
  elements.toggleArchivedBtn.addEventListener('click', () => {
    const showArchived = taskManager.toggleArchived();
    elements.toggleArchivedBtn.querySelector('span').textContent = showArchived ? 'Ocultar Arquivados' : 'Mostrar Arquivados';
    taskManager.renderTasks();
  });

  elements.clearDataBtn.addEventListener('click', () => {
    importExportManager.clearAllData();
  });

  elements.exportBtn.addEventListener('click', () => dialogManager.openExportDialog());
  elements.closeExportDialogBtn.addEventListener('click', () => dialogManager.closeExportDialog());
  elements.cancelExportBtn.addEventListener('click', () => dialogManager.closeExportDialog());

  elements.exportCurrentListBtn.addEventListener('click', () => {
    importExportManager.exportCurrentList();
    dialogManager.closeExportDialog();
  });

  elements.exportAllListsBtn.addEventListener('click', () => {
    importExportManager.exportAllLists();
    dialogManager.closeExportDialog();
  });

  elements.importBtn.addEventListener('click', () => elements.importInput.click());
  elements.importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importExportManager.importData(file);
      taskManager.renderTasks();
      listManager.renderLists();
    }
  });

  elements.toggleDarkModeBtn.addEventListener('click', utils.toggleDarkMode);

  // Diálogo de confirmação
  elements.cancelConfirmBtn.addEventListener('click', () => dialogManager.closeConfirmDialog());
  elements.closeConfirmDialogBtn.addEventListener('click', () => dialogManager.closeConfirmDialog());
  elements.confirmDeleteBtn.addEventListener('click', () => {
    if (taskManager.taskToDeleteId) {
      let tasks = storage.getTasks();
      tasks = tasks.filter(t => t.id !== taskManager.taskToDeleteId);
      storage.saveTasks(tasks);
      taskManager.renderTasks();
      utils.showNotification('Tarefa excluída.', 'danger');
    }
    dialogManager.closeConfirmDialog();
  });

  // Gerenciamento de tags
  elements.manageTagsBtn.addEventListener('click', () => dialogManager.openManageTagsDialog());
  elements.closeManageTagsDialogBtn.addEventListener('click', () => dialogManager.closeManageTagsDialog());
  elements.addTagForm.addEventListener('submit', (e) => tagManager.handleTagFormSubmit(e));
  elements.tagsList.addEventListener('click', (e) => tagManager.handleTagListClick(e));
  elements.cancelEditTagBtn.addEventListener('click', () => tagManager.resetTagForm());

  // Filtros de tag
  elements.clearFiltersBtn.addEventListener('click', () => {
    taskManager.clearTagFilters();
    tagManager.updateTagFiltersUI(taskManager.activeTagFilters);
    taskManager.renderTasks();
  });

  elements.activeTagFiltersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-close')) {
      const tagId = e.target.dataset.id;
      taskManager.removeTagFilter(tagId);
      tagManager.updateTagFiltersUI(taskManager.activeTagFilters);
      taskManager.renderTasks();
    }
  });

  // Sidebar
  elements.toggleSidebarBtn.addEventListener('click', () => sidebarManager.toggleSidebar());
  elements.sidebarOverlay.addEventListener('click', () => sidebarManager.closeSidebar());

  // Listas
  elements.addListBtn.addEventListener('click', () => dialogManager.openCreateListDialog());
  elements.closeCreateListDialogBtn.addEventListener('click', () => dialogManager.closeCreateListDialog());
  elements.cancelCreateListBtn.addEventListener('click', () => dialogManager.closeCreateListDialog());

  elements.createListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listName = elements.listNameInput.value.trim();
    if (listName) {
      listManager.createNewList(listName);
      taskManager.setActiveList(listManager.getActiveListId());
      listManager.renderLists();
      taskManager.renderTasks();
      dialogManager.closeCreateListDialog();
      sidebarManager.closeSidebar();
    }
  });

  elements.listsContainer.addEventListener('click', (e) => {
    const listItem = e.target.closest('.list-item');
    if (listItem && listItem.dataset.listId) {
      const newActiveListId = listManager.switchActiveList(listItem.dataset.listId);
      taskManager.setActiveList(newActiveListId);
      taskManager.renderTasks();
    }
  });

  // Mover tarefa
  elements.closeMoveTaskDialogBtn.addEventListener('click', () => dialogManager.closeMoveTaskDialog());

  // Calendário
  elements.toggleCalendarBtn.addEventListener('click', () => calendarManager.toggleCalendar());
  elements.prevMonthBtn.addEventListener('click', () => calendarManager.previousMonth());
  elements.nextMonthBtn.addEventListener('click', () => calendarManager.nextMonth());

  // --- Inicialização ---
  function init() {
    // Aplica o tema salvo
    utils.applyTheme();
    
    // Renderiza as listas primeiro
    listManager.renderLists();
    
    // Define o valor inicial do seletor de ordenação
    elements.sortTasksSelect.value = taskManager.sortBy;

    // Renderiza as tarefas
    taskManager.renderTasks();
    
    // Atualiza a UI dos filtros de tag
    tagManager.updateTagFiltersUI(taskManager.activeTagFilters);
  }

  // Função para criar tarefa de teste (se necessário)
  function createTestTaskForToday() {
    // Esta função pode ser implementada se necessário para testes
  }

  // Inicia a aplicação
  init();
  createTestTaskForToday();
});
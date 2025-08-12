// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {

  // Mapeamento dos elementos do DOM para variáveis
  const searchInput = document.getElementById('search-input');
  const taskDueDateInput = document.getElementById('task-due-date');
  const taskPrioritySelect = document.getElementById('task-priority');
  const taskRecurrenceSelect = document.getElementById('task-recurrence');
  const taskNotificationTimeSelect = document.getElementById('task-notification-time');
  const notificationTimeGroup = document.querySelector('.notification-time');
  const tasksListContainer = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateMessage = document.getElementById('empty-state-message');
  const emptyStateAddBtn = document.getElementById('empty-state-add-btn');

  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const listsSidebar = document.getElementById('lists-sidebar');
  const listsContainer = document.getElementById('lists-container');
  const addListBtn = document.getElementById('add-list-btn');
  const listTitleDisplay = document.getElementById('list-title-display');
  const appBody = document.querySelector('.app-body');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const createListDialog = document.getElementById('create-list-dialog');
  const closeCreateListDialogBtn = document.getElementById('close-create-list-dialog-btn');
  const cancelCreateListBtn = document.getElementById('cancel-create-list-btn');
  const createListForm = document.getElementById('create-list-form');
  const listNameInput = document.getElementById('list-name-input');

  const tagsFilterContainer = document.getElementById('tags-filter-container');
  const activeTagFiltersContainer = document.getElementById('active-tag-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');

  const addTaskBtn = document.getElementById('add-task-btn');
  const addEditDialog = document.getElementById('add-edit-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  const cancelDialogBtn = document.getElementById('cancel-dialog-btn');
  const addEditForm = document.getElementById('add-edit-form');
  const taskIdInput = document.getElementById('task-id');
  const taskTitleInput = document.getElementById('task-title');
  const taskDescriptionInput = document.getElementById('task-description');
  const taskTagsContainer = document.getElementById('task-tags-container');

  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const exportBtn = document.getElementById('export-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');
  const toggleArchivedBtn = document.getElementById('toggle-archived-btn');
  const toggleDarkModeBtn = document.getElementById('toggle-dark-mode-btn');
  const manageTagsBtn = document.getElementById('manage-tags-btn');

  const manageTagsDialog = document.getElementById('manage-tags-dialog');
  const closeManageTagsDialogBtn = document.getElementById('close-manage-tags-dialog-btn');
  const addTagForm = document.getElementById('add-tag-form');
  const tagNameInput = document.getElementById('tag-name-input');
  const tagIdInput = document.getElementById('tag-id-input');
  const tagColorContainer = document.getElementById('tag-color-container');
  const tagsList = document.getElementById('tags-list');
  const cancelEditTagBtn = document.getElementById('cancel-edit-tag-btn');

  const confirmDialog = document.getElementById('confirm-dialog');
  const closeConfirmDialogBtn = document.getElementById('close-confirm-dialog-btn');
  const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const moveTaskDialog = document.getElementById('move-task-dialog');
  const closeMoveTaskDialogBtn = document.getElementById('close-move-task-dialog-btn');
  const moveTaskListsContainer = document.getElementById('move-task-lists-container');

  const notificationContainer = document.getElementById('notification-container');
  const installPwaBtn = document.getElementById('install-pwa-btn');

  // Constantes para chaves do Local Storage
  const TASKS_STORAGE_KEY = 'todo_zen_tasks';
  const TAGS_STORAGE_KEY = 'todo_zen_tags';
  const LISTS_STORAGE_KEY = 'todo_zen_lists';
  const ACTIVE_LIST_KEY = 'todo_zen_active_list';

  // Variáveis de estado
  let activeTagFilters = [];
  let notificationPermission = false;

  // Solicitar permissão para notificações
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      notificationPermission = permission === 'granted';
    });
  }

  // Atalhos de teclado
  document.addEventListener('keydown', (e) => {
    // Evita atalhos quando estiver em campos de input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      addTaskBtn.click();
    } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      const openDialog = document.querySelector('.dialog:not(.hidden)');
      if (openDialog) {
        openDialog.querySelector('.close-button').click();
      }
    }
  });

  // Verificar tarefas vencidas e enviar notificações
  function checkOverdueTasks() {
    if (!notificationPermission) return;

    const tasks = getTasks();
    const now = new Date();

    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !task.notificationSent) {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - now;
        const notificationTime = (task.notificationMinutes || 60) * 60000; // Converter minutos para milissegundos

        // Notificar X minutos antes do vencimento (padrão: 60 minutos)
        if (timeDiff > 0 && timeDiff <= notificationTime) {
          const minutesText = task.notificationMinutes === 1 ? 'minuto' : 'minutos';
          new Notification('Tarefa próxima do vencimento', {
            body: `A tarefa "${task.title}" vence em ${task.notificationMinutes || 60} ${minutesText}!`,
            icon: 'assets/icon.svg'
          });

          // Marcar como notificado
          task.notificationSent = true;
          const tasks = getTasks();
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex].notificationSent = true;
            saveTasks(tasks);
          }
        }
      }
    });
  }

  // Verificar tarefas vencidas a cada minuto
  setInterval(checkOverdueTasks, 60000);

  let showArchived = false;
  let taskToDeleteId = null;
  let deferredPrompt;
  let activeListId = localStorage.getItem(ACTIVE_LIST_KEY);

  // --- Lógica do PWA (Progressive Web App) ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPwaBtn.style.display = 'flex';
  });

  installPwaBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        installPwaBtn.style.display = 'none';
      }
    }
  });

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service worker registrado:', reg))
        .catch(err => console.log('Erro no registro do Service worker:', err));
    });
  }

  // --- Gerenciamento de Dados (LocalStorage) ---

  const getFromStorage = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const getTasks = () => getFromStorage(TASKS_STORAGE_KEY);
  const saveTasks = (tasks) => saveToStorage(TASKS_STORAGE_KEY, tasks);
  const getTags = () => getFromStorage(TAGS_STORAGE_KEY);
  const saveTags = (tags) => saveToStorage(TAGS_STORAGE_KEY, tags);
  const getLists = () => getFromStorage(LISTS_STORAGE_KEY);
  const saveLists = (lists) => saveToStorage(LISTS_STORAGE_KEY, lists);

  /**
   * Migra os dados de uma estrutura antiga (sem listas) para a nova.
   * Cria uma lista padrão e associa todas as tarefas existentes a ela.
   */
  function migrateData() {
    let lists = getLists();
    if (lists.length === 0) {
      const tasks = getTasks();
      const defaultList = {
        id: crypto.randomUUID(),
        name: 'Minhas Tarefas',
        createdAt: Date.now()
      };
      lists.push(defaultList);

      // Se houver tarefas, associa-as à lista padrão
      if (tasks.length > 0) {
        const updatedTasks = tasks.map(task => ({
          ...task,
          listId: defaultList.id
        }));
        saveTasks(updatedTasks);
      }

      saveLists(lists);
      localStorage.setItem(ACTIVE_LIST_KEY, defaultList.id);
      activeListId = defaultList.id;
    } else if (!activeListId || !lists.some(l => l.id === activeListId)) {
      // Garante que sempre haja uma lista ativa válida
      const defaultListId = lists[0].id;
      localStorage.setItem(ACTIVE_LIST_KEY, defaultListId);
      activeListId = defaultListId;
    }
  }

  // --- Funções Principais de Tarefas ---

  /**
   * Renderiza a lista de tarefas na tela, aplicando filtros e ordenação.
   */
  function renderTasks() {
    const query = searchInput.value.toLowerCase();
    let tasks = getTasks();

    // 1. Filtrar
    // Primeiro, filtra pela lista ativa
    if (activeListId) {
      tasks = tasks.filter(task => task.listId === activeListId);
    }

    if (!showArchived) {
      tasks = tasks.filter(task => !task.archived);
    }
    if (query) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    if (activeTagFilters.length > 0) {
      tasks = tasks.filter(task =>
        task.tags && activeTagFilters.every(tagId => task.tags.includes(tagId))
      );
    }

    // 2. Ordenar
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.favorited !== b.favorited) return a.favorited ? -1 : 1;
      return b.createdAt - a.createdAt;
    });

    // 3. Renderizar
    tasksListContainer.innerHTML = '';
    if (tasks.length === 0) {
      emptyState.classList.remove('hidden');
      emptyStateTitle.textContent = query || activeTagFilters.length > 0 ? 'Nenhuma tarefa encontrada' : 'Sua lista está vazia';
      emptyStateMessage.textContent = query || activeTagFilters.length > 0 ? 'Tente uma busca ou filtro diferente.' : 'Adicione uma nova tarefa para começar.';
    } else {
      emptyState.classList.add('hidden');
      tasks.forEach(createTaskElement);
    }
  }

  /**
   * Cria o elemento HTML para uma única tarefa.
   * @param {object} task - O objeto da tarefa.
   */
  function formatDueDate(dueDate) {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  function getRecurrenceText(recurrence) {
    const texts = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      monthly: 'Mensalmente'
    };
    return texts[recurrence] || '';
  }

  function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.classList.toggle('completed', task.completed);
    taskEl.classList.toggle('favorited', task.favorited);
    taskEl.classList.toggle('archived', task.archived);
    if (task.priority) {
      taskEl.classList.add(`priority-${task.priority}`);
    }
    taskEl.dataset.taskId = task.id;

    const tags = getTags();

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
          <div class="task-due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${formatDueDate(task.dueDate)}
          </div>
        ` : ''}
        ${task.recurrence && task.recurrence !== 'none' ? `
          <div class="task-recurrence">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
            ${getRecurrenceText(task.recurrence)}
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
    tasksListContainer.appendChild(taskEl);
  }

  // --- Manipuladores de Eventos (Event Handlers) ---

  tasksListContainer.addEventListener('click', (e) => {
    const target = e.target;
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.taskId;
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Filtro por tag quando clicar em uma tag
    if (target.classList.contains('clickable') && target.dataset.tagId) {
      const tagId = target.dataset.tagId;
      if (!activeTagFilters.includes(tagId)) {
        activeTagFilters.push(tagId);
        updateTagFiltersUI();
        renderTasks();
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
      openMoveTaskDialog(taskId);
      return;
    } else if (target.closest('.edit-btn')) {
      openDialog('edit', taskId);
      return; // Evita salvar e renderizar desnecessariamente
    } else if (target.closest('.delete-btn')) {
      taskToDeleteId = taskId;
      confirmDialog.classList.remove('hidden');
      return;
    } else {
      return;
    }

    saveTasks(tasks);
    renderTasks();
  });

  addEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = taskIdInput.value;
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();

    if (!title) return;

    // Obter tags selecionadas e novas tags criadas
    const selectedTags = Array.from(taskTagsContainer.querySelectorAll('.tag.selected')).map(t => t.dataset.tagId);

    let tasks = getTasks();

    if (id) { // Editando
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex > -1) {
        tasks[taskIndex].title = title;
        tasks[taskIndex].description = description;
        tasks[taskIndex].tags = selectedTags;
        tasks[taskIndex].dueDate = taskDueDateInput.value || null;
        tasks[taskIndex].priority = taskPrioritySelect.value;
        tasks[taskIndex].recurrence = taskRecurrenceSelect.value;
        tasks[taskIndex].notificationMinutes = taskDueDateInput.value ? parseInt(taskNotificationTimeSelect.value) : null;
        tasks[taskIndex].notificationSent = false;
      }
    } else { // Adicionando
      const newTask = {
        id: crypto.randomUUID(),
        title,
        description,
        tags: selectedTags,
        listId: activeListId,
        completed: false,
        favorited: false,
        archived: false,
        createdAt: Date.now(),
        dueDate: taskDueDateInput.value || null,
        priority: taskPrioritySelect.value,
        recurrence: taskRecurrenceSelect.value,
        notificationMinutes: taskDueDateInput.value ? parseInt(taskNotificationTimeSelect.value) : null,
        notificationSent: false
      };
      tasks.unshift(newTask);
    }

    saveTasks(tasks);
    renderTasks();
    closeDialog();
    showNotification(id ? 'Tarefa atualizada!' : 'Tarefa adicionada!', 'success');
  });

  // --- Funções do Diálogo ---

  function openDialog(mode, id = null) {
    const resetForm = () => {
      taskDueDateInput.value = '';
      taskPrioritySelect.value = 'medium';
      taskRecurrenceSelect.value = 'none';
      taskNotificationTimeSelect.value = '60';
      notificationTimeGroup.classList.add('hidden');
    };

    addEditForm.reset();
    if (mode === 'edit') {
      const task = getTasks().find(t => t.id === id);
      if (task) {
        dialogTitle.textContent = 'Editar Tarefa';
      taskIdInput.value = task.id;
      taskTitleInput.value = task.title;
      taskDescriptionInput.value = task.description || '';
      taskDueDateInput.value = task.dueDate || '';
      taskPrioritySelect.value = task.priority || 'medium';
      taskRecurrenceSelect.value = task.recurrence || 'none';
      taskNotificationTimeSelect.value = task.notificationMinutes || '60';
      notificationTimeGroup.classList.toggle('hidden', !task.dueDate);
        renderSelectableTags(task.tags || []);
      }
    } else {
      dialogTitle.textContent = 'Adicionar Nova Tarefa';
      resetForm();
      renderSelectableTags([]);
    }
    addEditDialog.classList.remove('hidden');
    taskTitleInput.focus();

    // Mostrar/ocultar campo de notificação quando a data de vencimento é preenchida/limpa
    taskDueDateInput.addEventListener('change', () => {
      notificationTimeGroup.classList.toggle('hidden', !taskDueDateInput.value);
    });
  }

  function closeDialog() {
    addEditDialog.classList.add('hidden');
  }

  // --- Funções de Tags ---

  const PREDEFINED_TAG_COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6',
    '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775',
    '#fff176', '#ffd54f', '#ffb74d', '#ff8a65'
  ];

  function renderSelectableTags(selectedTagIds = []) {
    taskTagsContainer.innerHTML = '';
    const allTags = getTags();

    if (allTags.length === 0) {
      taskTagsContainer.innerHTML = '<p style="font-size: 0.8rem; color: var(--archived-text);">Crie tags em "Gerenciar Tags" ou adicione uma nova abaixo.</p>';
    } else {
      allTags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag selectable';
        tagEl.textContent = tag.name;
        tagEl.dataset.tagId = tag.id;
        tagEl.style.backgroundColor = tag.color;
        if (selectedTagIds.includes(tag.id)) {
          tagEl.classList.add('selected');
        }
        tagEl.addEventListener('click', () => tagEl.classList.toggle('selected'));
        taskTagsContainer.appendChild(tagEl);
      });
    }

    // Adicionar input para criar nova tag
    const newTagContainer = document.createElement('div');
    newTagContainer.className = 'new-tag-input';
    newTagContainer.innerHTML = `
      <input type="text" placeholder="Nova tag..." maxlength="20">
      <button type="button" class="button primary">+</button>
    `;

    const newTagInput = newTagContainer.querySelector('input');
    const addNewTagBtn = newTagContainer.querySelector('button');

    addNewTagBtn.addEventListener('click', () => {
      const tagName = newTagInput.value.trim();
      if (tagName) {
        createNewTag(tagName, selectedTagIds);
        newTagInput.value = '';
      }
    });

    newTagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewTagBtn.click();
      }
    });

    taskTagsContainer.appendChild(newTagContainer);
  }

  function createNewTag(name, selectedTagIds = []) {
    const existingTags = getTags();

    // Verificar se a tag já existe
    if (existingTags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      showNotification('Tag já existe!', 'danger');
      return;
    }

    // Escolher uma cor aleatória
    const randomColor = PREDEFINED_TAG_COLORS[Math.floor(Math.random() * PREDEFINED_TAG_COLORS.length)];

    const newTag = {
      id: crypto.randomUUID(),
      name,
      color: randomColor
    };

    existingTags.push(newTag);
    saveTags(existingTags);

    // Adicionar a nova tag às selecionadas
    selectedTagIds.push(newTag.id);

    // Re-renderizar as tags
    renderSelectableTags(selectedTagIds);

    showNotification('Nova tag criada!', 'success');
  }

  // --- Funções do Menu e Ações ---

  function setupMenuActions() {
    toggleArchivedBtn.addEventListener('click', () => {
      showArchived = !showArchived;
      toggleArchivedBtn.querySelector('span').textContent = showArchived ? 'Ocultar Arquivados' : 'Mostrar Arquivados';
      renderTasks();
    });

    clearDataBtn.addEventListener('click', () => {
      const dialog = document.createElement('dialog');
      dialog.classList.add('confirmation-dialog');
      dialog.innerHTML = `
        <div class="dialog-content">
          <h3>Limpar Dados</h3>
          <p>Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.</p>
          <div class="dialog-buttons">
            <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button class="btn btn-danger" data-action="confirm">Limpar Dados</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
      dialog.showModal();

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.close();
          document.body.removeChild(dialog);
        }
      });

      dialog.addEventListener('close', () => {
        document.body.removeChild(dialog);
      });

      const buttons = dialog.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          if (button.dataset.action === 'confirm') {
            saveTasks([]);
            saveTags([]);
            saveLists([]);
            renderTasks();
            renderLists();
            showNotification('Dados apagados com sucesso.', 'danger');
            dialog.close();
          } else {
            dialog.close();
          }
        });
      });
    });

    const exportDialog = document.getElementById('export-dialog');
    const closeExportDialogBtn = document.getElementById('close-export-dialog-btn');
    const exportCurrentListBtn = document.getElementById('export-current-list-btn');
    const exportAllListsBtn = document.getElementById('export-all-lists-btn');
    const cancelExportBtn = document.getElementById('cancel-export-btn');

    exportBtn.addEventListener('click', () => {
      exportDialog.classList.remove('hidden');
    });

    closeExportDialogBtn.addEventListener('click', () => {
      exportDialog.classList.add('hidden');
    });

    cancelExportBtn.addEventListener('click', () => {
      exportDialog.classList.add('hidden');
    });

    exportCurrentListBtn.addEventListener('click', () => {
      if (!activeListId) {
        showNotification('Selecione uma lista para exportar', 'danger');
        return;
      }

      const lists = getLists();
      const tasks = getTasks();
      const tags = getTags();
      
      const activeList = lists.find(l => l.id === activeListId);
      const listTasks = tasks.filter(t => t.listId === activeListId);
      const usedTagIds = new Set();
      listTasks.forEach(task => {
        if (task.tags) {
          task.tags.forEach(tagId => usedTagIds.add(tagId));
        }
      });
      const listTags = tags.filter(tag => usedTagIds.has(tag.id));
      
      const data = {
        lists: [activeList],
        tasks: listTasks,
        tags: listTags
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-zen-${activeList.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      exportDialog.classList.add('hidden');
      showNotification('Lista exportada com sucesso!', 'success');
    });

    exportAllListsBtn.addEventListener('click', () => {
      const data = {
        lists: getLists(),
        tasks: getTasks(),
        tags: getTags()
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-zen-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      exportDialog.classList.add('hidden');
      showNotification('Backup completo exportado com sucesso!', 'success');
    });

    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Verifica se é um arquivo de backup válido
          if (!data.tasks || !data.tags || !data.lists) {
            throw new Error('Formato de arquivo inválido.');
          }
          
          // Se houver apenas uma lista no arquivo, pergunta se deseja importar como nova lista
          if (data.lists.length === 1) {
            const importAsList = confirm('Deseja importar como uma nova lista? Clique em OK para criar uma nova lista ou Cancelar para mesclar com os dados existentes.');
            
            if (importAsList) {
              // Gera novos IDs para evitar conflitos
              const newListId = crypto.randomUUID();
              const idMap = new Map();
              
              // Cria a nova lista
              const newList = {
                ...data.lists[0],
                id: newListId,
                name: `${data.lists[0].name} (Importada)`,
                createdAt: Date.now()
              };
              
              // Atualiza os IDs das tarefas
              const newTasks = data.tasks.map(task => {
                const newTaskId = crypto.randomUUID();
                idMap.set(task.id, newTaskId);
                return {
                  ...task,
                  id: newTaskId,
                  listId: newListId
                };
              });
              
              // Atualiza os IDs das tags
              const existingTags = getTags();
              const newTags = data.tags.map(tag => {
                // Verifica se já existe uma tag com o mesmo nome
                const existingTag = existingTags.find(t => t.name === tag.name);
                if (existingTag) {
                  idMap.set(tag.id, existingTag.id);
                  return existingTag;
                } else {
                  const newTagId = crypto.randomUUID();
                  idMap.set(tag.id, newTagId);
                  return { ...tag, id: newTagId };
                }
              });
              
              // Atualiza as referências de tags nas tarefas
              newTasks.forEach(task => {
                if (task.tags) {
                  task.tags = task.tags.map(tagId => idMap.get(tagId) || tagId);
                }
              });
              
              // Salva os dados
              const lists = getLists();
              lists.push(newList);
              saveLists(lists);
              
              const tasks = getTasks();
              tasks.push(...newTasks);
              saveTasks(tasks);
              
              const uniqueTags = [...existingTags];
              newTags.forEach(tag => {
                if (!uniqueTags.some(t => t.id === tag.id)) {
                  uniqueTags.push(tag);
                }
              });
              saveTags(uniqueTags);
              
              // Ativa a nova lista
              switchActiveList(newListId);
              showNotification('Lista importada com sucesso!', 'success');
              return;
            }
          }
          
          // Importação normal (mescla com dados existentes)
          saveLists([...getLists(), ...data.lists]);
          saveTasks([...getTasks(), ...data.tasks]);
          saveTags([...getTags(), ...data.tags]);
          renderTasks();
          showNotification('Dados importados com sucesso!', 'success');
          
        } catch (error) {
          showNotification('Erro ao importar arquivo.', 'danger');
        }
      };
      reader.readAsText(file);
    });
  }

  // --- Inicialização ---
  function init() {
    migrateData(); // Garante que a estrutura de dados esteja atualizada

    // Adiciona os event listeners que não dependem de elementos dinâmicos
    searchInput.addEventListener('input', renderTasks);
    addTaskBtn.addEventListener('click', () => openDialog('add'));
    emptyStateAddBtn.addEventListener('click', () => openDialog('add'));
    closeDialogBtn.addEventListener('click', closeDialog);
    cancelDialogBtn.addEventListener('click', closeDialog);
    toggleDarkModeBtn.addEventListener('click', toggleDarkMode);



    // Configura o menu
    menuBtn.addEventListener('click', () => menuDropdown.classList.toggle('hidden'));
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.add('hidden');
      }
    });
    setupMenuActions();

    // Configura o diálogo de confirmação
    cancelConfirmBtn.addEventListener('click', () => confirmDialog.classList.add('hidden'));
    closeConfirmDialogBtn.addEventListener('click', () => confirmDialog.classList.add('hidden'));
    confirmDeleteBtn.addEventListener('click', () => {
      if (taskToDeleteId) {
        let tasks = getTasks();
        tasks = tasks.filter(t => t.id !== taskToDeleteId);
        saveTasks(tasks);
        renderTasks();
        showNotification('Tarefa excluída.', 'danger');
      }
      confirmDialog.classList.add('hidden');
    });

    // Lógica das Tags
    manageTagsBtn.addEventListener('click', openManageTagsDialog);
    closeManageTagsDialogBtn.addEventListener('click', closeManageTagsDialog);
    addTagForm.addEventListener('submit', handleTagFormSubmit);
    tagsList.addEventListener('click', handleTagListClick);
    cancelEditTagBtn.addEventListener('click', resetTagForm);
    clearFiltersBtn.addEventListener('click', () => {
      activeTagFilters = [];
      updateTagFiltersUI();
      renderTasks();
    });

    // Aplica o tema salvo e renderiza as tarefas iniciais
    applyTheme();
    renderLists(); // Renderiza as listas primeiro
    renderTasks();
    updateTagFiltersUI();
  }

  // --- Funções Auxiliares ---
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('fade-out');
      notification.addEventListener('animationend', () => notification.remove());
    }, 3000);
  }

  function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  }

  function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  // Funções de Gerenciamento de Tags
  function openManageTagsDialog() {
    renderTagColorOptions();
    renderTagsList();
    manageTagsDialog.classList.remove('hidden');
  }

  function closeManageTagsDialog() {
    manageTagsDialog.classList.add('hidden');
    resetTagForm();
  }

  function renderTagColorOptions() {
    tagColorContainer.innerHTML = '';
    PREDEFINED_TAG_COLORS.forEach(color => {
      const option = document.createElement('input');
      option.type = 'radio';
      option.name = 'tag-color';
      option.value = color;
      option.className = 'tag-color-option';
      option.style.backgroundColor = color;
      tagColorContainer.appendChild(option);
    });
    if (tagColorContainer.firstChild) {
      tagColorContainer.firstChild.checked = true;
    }
  }

  function renderTagsList() {
    tagsList.innerHTML = '';
    const tags = getTags();
    tags.forEach(tag => {
      const item = document.createElement('div');
      item.className = 'tag-item';
      item.innerHTML = `
            <span class="tag" style="background-color:${tag.color}">${tag.name}</span>
            <div>
                <button class="button icon-button edit-tag-btn" data-id="${tag.id}">✏️</button>
                <button class="button icon-button danger delete-tag-btn" data-id="${tag.id}">🗑️</button>
            </div>
        `;
      tagsList.appendChild(item);
    });
  }

  function handleTagFormSubmit(e) {
    e.preventDefault();
    const name = tagNameInput.value.trim();
    const color = addTagForm.querySelector('input[name="tag-color"]:checked')?.value;
    const id = tagIdInput.value;

    if (!name || !color) return;

    let tags = getTags();
    if (id) {
      const tagIndex = tags.findIndex(t => t.id === id);
      if (tagIndex > -1) {
        tags[tagIndex] = { ...tags[tagIndex], name, color };
      }
    } else {
      tags.push({ id: crypto.randomUUID(), name, color });
    }
    saveTags(tags);
    renderTagsList();
    renderTasks();
    updateTagFiltersUI();
    resetTagForm();
  }

  function handleTagListClick(e) {
    const target = e.target;
    const id = target.closest('button')?.dataset.id;
    if (!id) return;

    if (target.closest('.edit-tag-btn')) {
      const tag = getTags().find(t => t.id === id);
      if (tag) {
        tagIdInput.value = tag.id;
        tagNameInput.value = tag.name;
        addTagForm.querySelector(`input[value="${tag.color}"]`).checked = true;
        addTagForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
        cancelEditTagBtn.classList.remove('hidden');
      }
    } else if (target.closest('.delete-tag-btn')) {
      if (confirm('Excluir esta tag também a removerá de todas as tarefas. Continuar?')) {
        let tags = getTags().filter(t => t.id !== id);
        saveTags(tags);
        let tasks = getTasks();
        tasks.forEach(task => {
          if (task.tags) {
            task.tags = task.tags.filter(tagId => tagId !== id);
          }
        });
        saveTasks(tasks);
        renderTagsList();
        renderTasks();
        updateTagFiltersUI();
      }
    }
  }

  function resetTagForm() {
    tagIdInput.value = '';
    addTagForm.reset();
    addTagForm.querySelector('button[type="submit"]').textContent = 'Salvar Tag';
    cancelEditTagBtn.classList.add('hidden');
    if (tagColorContainer.firstChild) {
      tagColorContainer.firstChild.checked = true;
    }
  }

  function updateTagFiltersUI() {
    activeTagFiltersContainer.innerHTML = '';
    if (activeTagFilters.length === 0) {
      tagsFilterContainer.classList.add('hidden');
      return;
    }
    tagsFilterContainer.classList.remove('hidden');

    activeTagFilters.forEach(tagId => {
      const tag = getTags().find(t => t.id === tagId);
      if (tag) {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.style.backgroundColor = tag.color;
        tagEl.innerHTML = `${tag.name} <span class="tag-close" data-id="${tag.id}">&times;</span>`;
        activeTagFiltersContainer.appendChild(tagEl);
      }
    });
  }

  activeTagFiltersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-close')) {
      const tagId = e.target.dataset.id;
      activeTagFilters = activeTagFilters.filter(id => id !== tagId);
      updateTagFiltersUI();
      renderTasks();
    }
  });

  // --- Funções de Listas ---

  /**
   * Renderiza as listas na barra lateral.
   */
  function renderLists() {
    const lists = getLists();
    listsContainer.innerHTML = '';
    lists.forEach(list => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item';
      listItem.textContent = list.name;
      listItem.dataset.listId = list.id;
      if (list.id === activeListId) {
        listItem.classList.add('active');
        listTitleDisplay.textContent = list.name;
      }
      listsContainer.appendChild(listItem);
    });
  }

  /**
   * Troca a lista ativa e re-renderiza as tarefas.
   * @param {string} listId - O ID da lista para ativar.
   */
  function switchActiveList(listId) {
    activeListId = listId;
    localStorage.setItem(ACTIVE_LIST_KEY, listId);
    renderLists();
    renderTasks();
  }

  // --- Funções do Menu Off Canvas ---
  
  function toggleSidebar() {
    const isActive = listsSidebar.classList.contains('active');
    
    if (isActive) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openSidebar() {
    listsSidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    toggleSidebarBtn.classList.add('active');
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  }

  function closeSidebar() {
    listsSidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    toggleSidebarBtn.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll do body
  }

  // --- Funções do Popup de Criação de Lista ---
  
  function openCreateListDialog() {
    createListDialog.classList.remove('hidden');
    listNameInput.focus();
  }

  function closeCreateListDialog() {
    createListDialog.classList.add('hidden');
    createListForm.reset();
  }

  function createNewList(name) {
    const newList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now()
    };
    const lists = getLists();
    lists.push(newList);
    saveLists(lists);
    switchActiveList(newList.id);
    closeSidebar(); // Fecha o menu após criar a lista
    showNotification('Lista criada com sucesso!', 'success');
  }

  // Event Listeners para o menu off canvas
  toggleSidebarBtn.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Event Listeners para o popup de criação de lista
  addListBtn.addEventListener('click', openCreateListDialog);
  closeCreateListDialogBtn.addEventListener('click', closeCreateListDialog);
  cancelCreateListBtn.addEventListener('click', closeCreateListDialog);

  createListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listName = listNameInput.value.trim();
    if (listName) {
      createNewList(listName);
      closeCreateListDialog();
    }
  });

  listsContainer.addEventListener('click', (e) => {
    const listItem = e.target.closest('.list-item');
    if (listItem && listItem.dataset.listId) {
      switchActiveList(listItem.dataset.listId);
    }
  });

  function openMoveTaskDialog(taskId) {
    const lists = getLists().filter(list => list.id !== activeListId);
    moveTaskListsContainer.innerHTML = '';

    if (lists.length === 0) {
      moveTaskListsContainer.innerHTML = '<p>Não há outras listas para mover.</p>';
    } else {
      lists.forEach(list => {
        const listEl = document.createElement('div');
        listEl.className = 'list-item';
        listEl.textContent = list.name;
        listEl.dataset.listId = list.id;
        listEl.addEventListener('click', () => {
          moveTask(taskId, list.id);
        });
        moveTaskListsContainer.appendChild(listEl);
      });
    }
    moveTaskDialog.classList.remove('hidden');
  }

  function closeMoveTaskDialog() {
    moveTaskDialog.classList.add('hidden');
  }

  function moveTask(taskId, newListId) {
    let tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      tasks[taskIndex].listId = newListId;
      saveTasks(tasks);
      renderTasks();
      closeMoveTaskDialog();
      showNotification('Tarefa movida com sucesso!', 'success');
    }
  }

  closeMoveTaskDialogBtn.addEventListener('click', closeMoveTaskDialog);


  // Funções do Calendário
  const calendarView = document.getElementById('calendar-view');
  const calendarMonthYear = document.getElementById('calendar-month-year');
  const calendarDays = document.getElementById('calendar-days');
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');
  const toggleCalendarBtn = document.getElementById('toggle-calendar-btn');
  const calendarContainer = document.getElementById('calendar-container');

  let currentDate = new Date();

  function updateCalendar() {
    console.log('Atualizando calendário...');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    calendarMonthYear.textContent = firstDay.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    calendarDays.innerHTML = '';

    // Cabeçalho dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header-day';
      dayHeader.textContent = day;
      calendarDays.appendChild(dayHeader);
    });

    // Dias do mês anterior
    for (let i = 0; i < startingDay; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const dayEl = createCalendarDay(prevMonthLastDay - startingDay + i + 1, true);
      calendarDays.appendChild(dayEl);
    }

    // Dias do mês atual
    const allTasks = getTasks();
    console.log('Total de tarefas:', allTasks.length);
    
    // Filtrar tarefas da lista ativa
    const tasks = allTasks.filter(task => task.listId === activeListId);
    console.log('Tarefas na lista ativa:', tasks.length);
    
    // Contar tarefas com data de vencimento
    const tasksWithDueDate = tasks.filter(task => task.dueDate);
    console.log('Tarefas com data de vencimento:', tasksWithDueDate.length);
    
    for (let day = 1; day <= totalDays; day++) {
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === day &&
               taskDate.getMonth() === month &&
               taskDate.getFullYear() === year;
      });

      if (dayTasks.length > 0) {
        console.log(`Dia ${day}: ${dayTasks.length} tarefas`);
      }

      const dayEl = createCalendarDay(day, false, dayTasks);
      calendarDays.appendChild(dayEl);
    }

    // Dias do próximo mês
    const remainingDays = 35 - (startingDay + totalDays); // 5 semanas * 7 dias = 35
    for (let i = 1; i <= remainingDays; i++) {
      const dayEl = createCalendarDay(i, true);
      calendarDays.appendChild(dayEl);
    }
  }



  toggleCalendarBtn.addEventListener('click', () => {
    const mainContainer = document.querySelector('main.container');
    const calendarContainer = document.getElementById('calendar-container');
    
    if (mainContainer && calendarContainer) {
      mainContainer.classList.toggle('hidden');
      calendarContainer.classList.toggle('hidden');
      
      if (!calendarContainer.classList.contains('hidden')) {
        updateCalendar();
      }
    }
  });

  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });

  function createCalendarDay(day, otherMonth = false, tasks = []) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (otherMonth) dayEl.classList.add('other-month');

    const today = new Date();
    if (!otherMonth &&
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()) {
      dayEl.classList.add('today');
    }

    // Limitar a 3 tarefas por dia para não sobrecarregar a visualização
    const displayTasks = tasks.slice(0, 3);
    
    // Criar o número do dia
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    // Criar o container de tarefas
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'calendar-tasks';
    dayEl.appendChild(tasksContainer);
    
    // Adicionar cada tarefa individualmente
    displayTasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = `calendar-task priority-${task.priority || 'medium'}`;
      taskEl.title = task.title;
      taskEl.textContent = task.title;
      taskEl.dataset.taskId = task.id;
      
      // Adicionar evento de clique para abrir a tarefa para edição
      taskEl.addEventListener('click', () => {
        openDialog('edit', task.id);
      });
      
      tasksContainer.appendChild(taskEl);
    });
    
    // Adicionar indicador de mais tarefas se necessário
    if (tasks.length > 3) {
      const moreEl = document.createElement('div');
      moreEl.className = 'calendar-more';
      moreEl.textContent = `+${tasks.length - 3} mais`;
      tasksContainer.appendChild(moreEl);
    }

    // Adicionar evento de clique no dia para criar nova tarefa
    if (!otherMonth) {
      dayEl.addEventListener('click', (e) => {
        // Evita propagar o clique se clicar em uma tarefa
        if (e.target.classList.contains('calendar-task')) return;
        
        // Configura a data para o dia clicado
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const formattedDate = selectedDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
        
        // Abre o diálogo de criação de tarefa com a data preenchida
        taskDueDateInput.value = formattedDate;
        openDialog('add');
      });
    }

    return dayEl;
  }

  // Inicia a aplicação
  init();
  
  // Cria uma tarefa de teste para o calendário se necessário
  createTestTaskForToday();
});
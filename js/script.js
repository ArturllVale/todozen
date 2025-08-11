// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {

  // Mapeamento dos elementos do DOM para variáveis
  const searchInput = document.getElementById('search-input');
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
  function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.classList.toggle('completed', task.completed);
    taskEl.classList.toggle('favorited', task.favorited);
    taskEl.classList.toggle('archived', task.archived);
    taskEl.dataset.taskId = task.id;

    const tags = getTags();

    // Determinar a cor da faixa lateral baseada na primeira tag
    let tagColor = null;
    if (task.tags && task.tags.length > 0) {
      const firstTag = tags.find(t => t.id === task.tags[0]);
      if (firstTag) {
        tagColor = firstTag.color;
        taskEl.classList.add('has-tag');
        taskEl.style.setProperty('--tag-color', tagColor);
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
      }
    } else { // Adicionando
      const newTask = {
        id: crypto.randomUUID(),
        title,
        description,
        tags: selectedTags,
        listId: activeListId, // Adiciona o ID da lista ativa
        completed: false,
        favorited: false,
        archived: false,
        createdAt: Date.now()
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
    addEditForm.reset();
    if (mode === 'edit') {
      const task = getTasks().find(t => t.id === id);
      if (task) {
        dialogTitle.textContent = 'Editar Tarefa';
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description || '';
        renderSelectableTags(task.tags || []);
      }
    } else {
      dialogTitle.textContent = 'Adicionar Nova Tarefa';
      renderSelectableTags([]);
    }
    addEditDialog.classList.remove('hidden');
    taskTitleInput.focus();
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
      if (confirm('Tem certeza que deseja apagar TUDO? Essa ação é irreversível.')) {
        saveTasks([]);
        saveTags([]);
        renderTasks();
        showNotification('Dados apagados com sucesso.', 'danger');
      }
    });

    exportBtn.addEventListener('click', () => {
      const data = {
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
    });

    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks && data.tags) {
            saveTasks(data.tasks);
            saveTags(data.tags);
            renderTasks();
            showNotification('Dados importados com sucesso!', 'success');
          } else {
            throw new Error('Formato de arquivo inválido.');
          }
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


  // Inicia a aplicação
  init();
});
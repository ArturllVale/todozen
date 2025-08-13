// Módulo de mapeamento dos elementos do DOM
export const elements = {
  // Elementos principais
  searchInput: document.getElementById('search-input'),
  taskDueDateInput: document.getElementById('task-due-date'),
  taskPrioritySelect: document.getElementById('task-priority'),
  taskRecurrenceSelect: document.getElementById('task-recurrence'),
  taskNotificationTimeSelect: document.getElementById('task-notification-time'),
  notificationTimeGroup: document.querySelector('.notification-time'),
  tasksListContainer: document.getElementById('tasks-list'),
  emptyState: document.getElementById('empty-state'),
  emptyStateTitle: document.getElementById('empty-state-title'),
  emptyStateMessage: document.getElementById('empty-state-message'),
  emptyStateAddBtn: document.getElementById('empty-state-add-btn'),
  sortTasksSelect: document.getElementById('sort-tasks-select'),

  // Sidebar
  toggleSidebarBtn: document.getElementById('toggle-sidebar-btn'),
  listsSidebar: document.getElementById('lists-sidebar'),
  listsContainer: document.getElementById('lists-container'),
  addListBtn: document.getElementById('add-list-btn'),
  listTitleDisplay: document.getElementById('list-title-display'),
  appBody: document.querySelector('.app-body'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),

  // Diálogo de criar lista
  createListDialog: document.getElementById('create-list-dialog'),
  closeCreateListDialogBtn: document.getElementById('close-create-list-dialog-btn'),
  cancelCreateListBtn: document.getElementById('cancel-create-list-btn'),
  createListForm: document.getElementById('create-list-form'),
  listNameInput: document.getElementById('list-name-input'),

  // Filtros de tags
  tagsFilterContainer: document.getElementById('tags-filter-container'),
  activeTagFiltersContainer: document.getElementById('active-tag-filters'),
  clearFiltersBtn: document.getElementById('clear-filters'),

  // Diálogo de adicionar/editar tarefa
  addTaskBtn: document.getElementById('add-task-btn'),
  addEditDialog: document.getElementById('add-edit-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  closeDialogBtn: document.getElementById('close-dialog-btn'),
  cancelDialogBtn: document.getElementById('cancel-dialog-btn'),
  addEditForm: document.getElementById('add-edit-form'),
  taskIdInput: document.getElementById('task-id'),
  taskTitleInput: document.getElementById('task-title'),
  taskDescriptionInput: document.getElementById('task-description'),
  taskTagsContainer: document.getElementById('task-tags-container'),

  // Menu
  menuBtn: document.getElementById('menu-btn'),
  menuDropdown: document.getElementById('menu-dropdown'),
  importBtn: document.getElementById('import-btn'),
  importInput: document.getElementById('import-input'),
  exportBtn: document.getElementById('export-btn'),
  clearDataBtn: document.getElementById('clear-data-btn'),
  toggleArchivedBtn: document.getElementById('toggle-archived-btn'),
  toggleDarkModeBtn: document.getElementById('toggle-dark-mode-btn'),
  manageTagsBtn: document.getElementById('manage-tags-btn'),

  // Diálogo de gerenciar tags
  manageTagsDialog: document.getElementById('manage-tags-dialog'),
  closeManageTagsDialogBtn: document.getElementById('close-manage-tags-dialog-btn'),
  addTagForm: document.getElementById('add-tag-form'),
  tagNameInput: document.getElementById('tag-name-input'),
  tagIdInput: document.getElementById('tag-id-input'),
  tagColorContainer: document.getElementById('tag-color-container'),
  tagsList: document.getElementById('tags-list'),
  cancelEditTagBtn: document.getElementById('cancel-edit-tag-btn'),

  // Diálogo de confirmação
  confirmDialog: document.getElementById('confirm-dialog'),
  closeConfirmDialogBtn: document.getElementById('close-confirm-dialog-btn'),
  cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),
  confirmDeleteBtn: document.getElementById('confirm-delete-btn'),

  // Diálogo de mover tarefa
  moveTaskDialog: document.getElementById('move-task-dialog'),
  closeMoveTaskDialogBtn: document.getElementById('close-move-task-dialog-btn'),
  moveTaskListsContainer: document.getElementById('move-task-lists-container'),

  // Notificações e PWA
  notificationContainer: document.getElementById('notification-container'),
  installPwaBtn: document.getElementById('install-pwa-btn'),

  // Calendário
  calendarView: document.getElementById('calendar-view'),
  calendarMonthYear: document.getElementById('calendar-month-year'),
  calendarDays: document.getElementById('calendar-days'),
  prevMonthBtn: document.getElementById('prev-month-btn'),
  nextMonthBtn: document.getElementById('next-month-btn'),
  toggleCalendarBtn: document.getElementById('toggle-calendar-btn'),
  calendarContainer: document.getElementById('calendar-container'),

  // Diálogo de exportação
  exportDialog: document.getElementById('export-dialog'),
  closeExportDialogBtn: document.getElementById('close-export-dialog-btn'),
  exportCurrentListBtn: document.getElementById('export-current-list-btn'),
  exportAllListsBtn: document.getElementById('export-all-lists-btn'),
  cancelExportBtn: document.getElementById('cancel-export-btn')
};
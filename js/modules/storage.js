// Módulo de gerenciamento de dados no LocalStorage
import { STORAGE_KEYS } from './constants.js';

export const storage = {
  getFromStorage: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  saveToStorage: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

  getTasks: () => storage.getFromStorage(STORAGE_KEYS.TASKS),
  saveTasks: (tasks) => storage.saveToStorage(STORAGE_KEYS.TASKS, tasks),
  getTags: () => storage.getFromStorage(STORAGE_KEYS.TAGS),
  saveTags: (tags) => storage.saveToStorage(STORAGE_KEYS.TAGS, tags),
  getLists: () => storage.getFromStorage(STORAGE_KEYS.LISTS),
  saveLists: (lists) => storage.saveToStorage(STORAGE_KEYS.LISTS, lists),

  /**
   * Migra os dados de uma estrutura antiga (sem listas) para a nova.
   * Cria uma lista padrão e associa todas as tarefas existentes a ela.
   */
  migrateData: (activeListId) => {
    let lists = storage.getLists();
    if (lists.length === 0) {
      const tasks = storage.getTasks();
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
        storage.saveTasks(updatedTasks);
      }

      storage.saveLists(lists);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LIST, defaultList.id);
      return defaultList.id;
    } else if (!activeListId || !lists.some(l => l.id === activeListId)) {
      // Garante que sempre haja uma lista ativa válida
      const defaultListId = lists[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LIST, defaultListId);
      return defaultListId;
    }
    return activeListId;
  }
};
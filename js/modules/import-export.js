// Módulo de importação e exportação de dados
import { storage } from './storage.js';
import { elements } from './dom-elements.js';
import { utils } from './utils.js';

export class ImportExportManager {
  constructor(listManager) {
    this.listManager = listManager;
  }

  /**
   * Exporta a lista atual
   */
  exportCurrentList() {
    const activeListId = this.listManager.getActiveListId();
    if (!activeListId) {
      utils.showNotification('Selecione uma lista para exportar', 'danger');
      return;
    }

    const lists = storage.getLists();
    const tasks = storage.getTasks();
    const tags = storage.getTags();
    
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
    
    this.downloadJSON(data, `todo-zen-${activeList.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`);
    utils.showNotification('Lista exportada com sucesso!', 'success');
  }

  /**
   * Exporta todas as listas
   */
  exportAllLists() {
    const data = {
      lists: storage.getLists(),
      tasks: storage.getTasks(),
      tags: storage.getTags()
    };
    
    this.downloadJSON(data, `todo-zen-backup-${new Date().toISOString().split('T')[0]}.json`);
    utils.showNotification('Backup completo exportado com sucesso!', 'success');
  }

  /**
   * Faz o download de um objeto como JSON
   */
  downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Importa dados de um arquivo
   */
  importData(file) {
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
            this.importAsSingleList(data);
            return;
          }
        }
        
        // Importação normal (mescla com dados existentes)
        storage.saveLists([...storage.getLists(), ...data.lists]);
        storage.saveTasks([...storage.getTasks(), ...data.tasks]);
        storage.saveTags([...storage.getTags(), ...data.tags]);
        utils.showNotification('Dados importados com sucesso!', 'success');
        
      } catch (error) {
        utils.showNotification('Erro ao importar arquivo.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Importa dados como uma nova lista única
   */
  importAsSingleList(data) {
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
    const existingTags = storage.getTags();
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
    const lists = storage.getLists();
    lists.push(newList);
    storage.saveLists(lists);
    
    const tasks = storage.getTasks();
    tasks.push(...newTasks);
    storage.saveTasks(tasks);
    
    const uniqueTags = [...existingTags];
    newTags.forEach(tag => {
      if (!uniqueTags.some(t => t.id === tag.id)) {
        uniqueTags.push(tag);
      }
    });
    storage.saveTags(uniqueTags);
    
    // Ativa a nova lista
    this.listManager.switchActiveList(newListId);
    utils.showNotification('Lista importada com sucesso!', 'success');
  }

  /**
   * Limpa todos os dados
   */
  clearAllData() {
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
          storage.saveTasks([]);
          storage.saveTags([]);
          storage.saveLists([]);
          utils.showNotification('Dados apagados com sucesso.', 'danger');
          dialog.close();
        } else {
          dialog.close();
        }
      });
    });
  }
}
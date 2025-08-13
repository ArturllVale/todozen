// Módulo de gerenciamento de diálogos
import { storage } from './storage.js';
import { elements } from './dom-elements.js';
import { utils } from './utils.js';

export class DialogManager {
  constructor(tagManager) {
    this.tagManager = tagManager;
  }

  /**
   * Abre o diálogo de adicionar/editar tarefa
   */
  openTaskDialog(mode, id = null) {
    const resetForm = () => {
      elements.taskDueDateInput.value = '';
      elements.taskPrioritySelect.value = 'medium';
      elements.taskRecurrenceSelect.value = 'none';
      elements.taskNotificationTimeSelect.value = '60';
      elements.notificationTimeGroup.classList.add('hidden');
    };

    elements.addEditForm.reset();
    if (mode === 'edit') {
      const task = storage.getTasks().find(t => t.id === id);
      if (task) {
        elements.dialogTitle.textContent = 'Editar Tarefa';
        elements.taskIdInput.value = task.id;
        elements.taskTitleInput.value = task.title;
        elements.taskDescriptionInput.value = task.description || '';
        elements.taskDueDateInput.value = task.dueDate || '';
        elements.taskPrioritySelect.value = task.priority || 'medium';
        elements.taskRecurrenceSelect.value = task.recurrence || 'none';
        elements.taskNotificationTimeSelect.value = task.notificationMinutes || '60';
        elements.notificationTimeGroup.classList.toggle('hidden', !task.dueDate);
        this.tagManager.renderSelectableTags(task.tags || []);
      }
    } else {
      elements.dialogTitle.textContent = 'Adicionar Nova Tarefa';
      resetForm();
      this.tagManager.renderSelectableTags([]);
    }
    elements.addEditDialog.classList.remove('hidden');
    elements.taskTitleInput.focus();

    // Mostrar/ocultar campo de notificação quando a data de vencimento é preenchida/limpa
    elements.taskDueDateInput.addEventListener('change', () => {
      elements.notificationTimeGroup.classList.toggle('hidden', !elements.taskDueDateInput.value);
    });
  }

  /**
   * Fecha o diálogo de tarefa
   */
  closeTaskDialog() {
    elements.addEditDialog.classList.add('hidden');
  }

  /**
   * Abre o diálogo de gerenciar tags
   */
  openManageTagsDialog() {
    this.tagManager.renderTagColorOptions();
    this.tagManager.renderTagsList();
    elements.manageTagsDialog.classList.remove('hidden');
  }

  /**
   * Fecha o diálogo de gerenciar tags
   */
  closeManageTagsDialog() {
    elements.manageTagsDialog.classList.add('hidden');
    this.tagManager.resetTagForm();
  }

  /**
   * Abre o diálogo de criar lista
   */
  openCreateListDialog() {
    elements.createListDialog.classList.remove('hidden');
    elements.listNameInput.focus();
  }

  /**
   * Fecha o diálogo de criar lista
   */
  closeCreateListDialog() {
    elements.createListDialog.classList.add('hidden');
    elements.createListForm.reset();
  }

  /**
   * Abre o diálogo de confirmação de exclusão
   */
  openConfirmDialog(taskId) {
    elements.confirmDialog.classList.remove('hidden');
    return taskId;
  }

  /**
   * Fecha o diálogo de confirmação
   */
  closeConfirmDialog() {
    elements.confirmDialog.classList.add('hidden');
  }

  /**
   * Fecha o diálogo de mover tarefa
   */
  closeMoveTaskDialog() {
    elements.moveTaskDialog.classList.add('hidden');
  }

  /**
   * Abre o diálogo de exportação
   */
  openExportDialog() {
    elements.exportDialog.classList.remove('hidden');
  }

  /**
   * Fecha o diálogo de exportação
   */
  closeExportDialog() {
    elements.exportDialog.classList.add('hidden');
  }

  /**
   * Abre o diálogo de visualização de tarefa
   */
  openViewTaskDialog(taskId) {
    const task = storage.getTasks().find(t => t.id === taskId);
    if (!task) return;

    elements.viewTaskTitle.textContent = task.title;
    elements.viewTaskDescription.textContent = task.description || 'Nenhuma descrição fornecida.';

    // Construir meta info
    elements.viewTaskMeta.innerHTML = '';
    if (task.priority) {
      elements.viewTaskMeta.innerHTML += `
        <div class="task-priority-indicator priority-${task.priority}">
          Prioridade: ${utils.getPriorityText(task.priority)}
        </div>`;
    }
    if (task.dueDate) {
      elements.viewTaskMeta.innerHTML += `
        <div class="task-due-date ${utils.isOverdue(task.dueDate) ? 'overdue' : ''}">
          Vence em: ${utils.formatDueDate(task.dueDate)}
        </div>`;
    }
    if (task.recurrence && task.recurrence !== 'none') {
      elements.viewTaskMeta.innerHTML += `
        <div class="task-recurrence">
          Recorrência: ${utils.getRecurrenceText(task.recurrence)}
        </div>`;
    }

    // Construir tags
    elements.viewTaskTagsContainer.innerHTML = '';
    if (task.tags && task.tags.length > 0) {
      const allTags = storage.getTags();
      task.tags.forEach(tagId => {
        const tag = allTags.find(t => t.id === tagId);
        if (tag) {
          const tagEl = document.createElement('span');
          tagEl.className = 'tag';
          tagEl.textContent = tag.name;
          tagEl.style.backgroundColor = tag.color;
          elements.viewTaskTagsContainer.appendChild(tagEl);
        }
      });
    } else {
      elements.viewTaskTagsContainer.innerHTML = '<p>Nenhuma tag associada.</p>';
    }

    // Armazenar o ID da tarefa para o botão de editar
    elements.viewTaskEditBtn.dataset.taskId = taskId;

    elements.viewTaskDialog.classList.remove('hidden');
  }

  /**
   * Fecha o diálogo de visualização de tarefa
   */
  closeViewTaskDialog() {
    elements.viewTaskDialog.classList.add('hidden');
  }
}
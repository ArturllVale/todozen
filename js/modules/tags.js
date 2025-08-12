// Módulo de gerenciamento de tags
import { storage } from './storage.js';
import { elements } from './dom-elements.js';
import { utils } from './utils.js';
import { PREDEFINED_TAG_COLORS } from './constants.js';

export class TagManager {
  /**
   * Renderiza tags selecionáveis no diálogo de tarefa
   */
  renderSelectableTags(selectedTagIds = []) {
    elements.taskTagsContainer.innerHTML = '';
    const allTags = storage.getTags();

    if (allTags.length === 0) {
      elements.taskTagsContainer.innerHTML = '<p style="font-size: 0.8rem; color: var(--archived-text);">Crie tags em "Gerenciar Tags" ou adicione uma nova abaixo.</p>';
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
        elements.taskTagsContainer.appendChild(tagEl);
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
        this.createNewTag(tagName, selectedTagIds);
        newTagInput.value = '';
      }
    });

    newTagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewTagBtn.click();
      }
    });

    elements.taskTagsContainer.appendChild(newTagContainer);
  }

  /**
   * Cria uma nova tag
   */
  createNewTag(name, selectedTagIds = []) {
    const existingTags = storage.getTags();

    // Verificar se a tag já existe
    if (existingTags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      utils.showNotification('Tag já existe!', 'danger');
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
    storage.saveTags(existingTags);

    // Adicionar a nova tag às selecionadas
    selectedTagIds.push(newTag.id);

    // Re-renderizar as tags
    this.renderSelectableTags(selectedTagIds);

    utils.showNotification('Nova tag criada!', 'success');
  }

  /**
   * Renderiza opções de cores para tags
   */
  renderTagColorOptions() {
    elements.tagColorContainer.innerHTML = '';
    PREDEFINED_TAG_COLORS.forEach(color => {
      const option = document.createElement('input');
      option.type = 'radio';
      option.name = 'tag-color';
      option.value = color;
      option.className = 'tag-color-option';
      option.style.backgroundColor = color;
      elements.tagColorContainer.appendChild(option);
    });
    if (elements.tagColorContainer.firstChild) {
      elements.tagColorContainer.firstChild.checked = true;
    }
  }

  /**
   * Renderiza a lista de tags no diálogo de gerenciamento
   */
  renderTagsList() {
    elements.tagsList.innerHTML = '';
    const tags = storage.getTags();
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
      elements.tagsList.appendChild(item);
    });
  }

  /**
   * Manipula o envio do formulário de tag
   */
  handleTagFormSubmit(e) {
    e.preventDefault();
    const name = elements.tagNameInput.value.trim();
    const color = elements.addTagForm.querySelector('input[name="tag-color"]:checked')?.value;
    const id = elements.tagIdInput.value;

    if (!name || !color) return;

    let tags = storage.getTags();
    if (id) {
      const tagIndex = tags.findIndex(t => t.id === id);
      if (tagIndex > -1) {
        tags[tagIndex] = { ...tags[tagIndex], name, color };
      }
    } else {
      tags.push({ id: crypto.randomUUID(), name, color });
    }
    storage.saveTags(tags);
    this.renderTagsList();
    this.resetTagForm();
  }

  /**
   * Manipula cliques na lista de tags
   */
  handleTagListClick(e) {
    const target = e.target;
    const id = target.closest('button')?.dataset.id;
    if (!id) return;

    if (target.closest('.edit-tag-btn')) {
      const tag = storage.getTags().find(t => t.id === id);
      if (tag) {
        elements.tagIdInput.value = tag.id;
        elements.tagNameInput.value = tag.name;
        elements.addTagForm.querySelector(`input[value="${tag.color}"]`).checked = true;
        elements.addTagForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
        elements.cancelEditTagBtn.classList.remove('hidden');
      }
    } else if (target.closest('.delete-tag-btn')) {
      if (confirm('Excluir esta tag também a removerá de todas as tarefas. Continuar?')) {
        let tags = storage.getTags().filter(t => t.id !== id);
        storage.saveTags(tags);
        let tasks = storage.getTasks();
        tasks.forEach(task => {
          if (task.tags) {
            task.tags = task.tags.filter(tagId => tagId !== id);
          }
        });
        storage.saveTasks(tasks);
        this.renderTagsList();
      }
    }
  }

  /**
   * Reseta o formulário de tag
   */
  resetTagForm() {
    elements.tagIdInput.value = '';
    elements.addTagForm.reset();
    elements.addTagForm.querySelector('button[type="submit"]').textContent = 'Salvar Tag';
    elements.cancelEditTagBtn.classList.add('hidden');
    if (elements.tagColorContainer.firstChild) {
      elements.tagColorContainer.firstChild.checked = true;
    }
  }

  /**
   * Atualiza a UI dos filtros de tag
   */
  updateTagFiltersUI(activeTagFilters) {
    elements.activeTagFiltersContainer.innerHTML = '';
    if (activeTagFilters.length === 0) {
      elements.tagsFilterContainer.classList.add('hidden');
      return;
    }
    elements.tagsFilterContainer.classList.remove('hidden');

    activeTagFilters.forEach(tagId => {
      const tag = storage.getTags().find(t => t.id === tagId);
      if (tag) {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.style.backgroundColor = tag.color;
        tagEl.innerHTML = `${tag.name} <span class="tag-close" data-id="${tag.id}">&times;</span>`;
        elements.activeTagFiltersContainer.appendChild(tagEl);
      }
    });
  }
}
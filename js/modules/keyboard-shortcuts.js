// Módulo de atalhos de teclado
import { elements } from './dom-elements.js';

export class KeyboardShortcuts {
  constructor(dialogManager) {
    this.dialogManager = dialogManager;
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    // Evita atalhos quando estiver em campos de input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      elements.addTaskBtn.click();
    } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      elements.searchInput.focus();
    } else if (e.key === 'Escape') {
      const openDialog = document.querySelector('.dialog:not(.hidden)');
      if (openDialog) {
        openDialog.querySelector('.close-button').click();
      }
    }
  }
}
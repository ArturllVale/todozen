// Módulo de funções utilitárias
import { RECURRENCE_TEXTS } from './constants.js';
import { elements } from './dom-elements.js';

export const utils = {
  /**
   * Formata uma data para exibição
   */
  formatDueDate: (dueDate) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Verifica se uma data está vencida
   */
  isOverdue: (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  },

  /**
   * Obtém o texto de recorrência
   */
  getRecurrenceText: (recurrence) => {
    return RECURRENCE_TEXTS[recurrence] || '';
  },

  /**
   * Obtém o texto de prioridade
   */
  getPriorityText: (priority) => {
    const priorityMap = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };
    return priorityMap[priority] || '';
  },

  /**
   * Exibe uma notificação
   */
  showNotification: (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    elements.notificationContainer.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('fade-out');
      notification.addEventListener('animationend', () => notification.remove());
    }, 3000);
  },

  /**
   * Alterna o modo escuro
   */
  toggleDarkMode: () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  },

  /**
   * Aplica o tema salvo
   */
  applyTheme: () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  },

  /**
   * Trunca um texto se for maior que o tamanho máximo
   */
  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }
};
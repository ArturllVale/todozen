// Módulo de gerenciamento de notificações
import { storage } from './storage.js';

export class NotificationManager {
  constructor() {
    this.notificationPermission = false;
    this.init();
  }

  async init() {
    // Solicitar permissão para notificações
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission === 'granted';
    }

    // Verificar tarefas vencidas a cada minuto
    setInterval(() => this.checkOverdueTasks(), 60000);
  }

  /**
   * Verifica tarefas vencidas e envia notificações
   */
  checkOverdueTasks() {
    if (!this.notificationPermission) return;

    const tasks = storage.getTasks();
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
          const tasks = storage.getTasks();
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex].notificationSent = true;
            storage.saveTasks(tasks);
          }
        }
      }
    });
  }
}
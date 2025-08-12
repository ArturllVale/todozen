// Módulo de gerenciamento do calendário
import { storage } from './storage.js';
import { elements } from './dom-elements.js';

export class CalendarManager {
  constructor(dialogManager) {
    this.currentDate = new Date();
    this.dialogManager = dialogManager;
  }

  /**
   * Atualiza o calendário
   */
  updateCalendar() {
    console.log('Atualizando calendário...');
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    elements.calendarMonthYear.textContent = firstDay.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    elements.calendarDays.innerHTML = '';

    // Cabeçalho dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header-day';
      dayHeader.textContent = day;
      elements.calendarDays.appendChild(dayHeader);
    });

    // Dias do mês anterior
    for (let i = 0; i < startingDay; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const dayEl = this.createCalendarDay(prevMonthLastDay - startingDay + i + 1, true);
      elements.calendarDays.appendChild(dayEl);
    }

    // Dias do mês atual
    const allTasks = storage.getTasks();
    console.log('Total de tarefas:', allTasks.length);
    
    // Filtrar tarefas da lista ativa (assumindo que activeListId está disponível globalmente)
    const activeListId = localStorage.getItem('todo_zen_active_list');
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

      const dayEl = this.createCalendarDay(day, false, dayTasks);
      elements.calendarDays.appendChild(dayEl);
    }

    // Dias do próximo mês
    const remainingDays = 35 - (startingDay + totalDays); // 5 semanas * 7 dias = 35
    for (let i = 1; i <= remainingDays; i++) {
      const dayEl = this.createCalendarDay(i, true);
      elements.calendarDays.appendChild(dayEl);
    }
  }

  /**
   * Cria um elemento de dia do calendário
   */
  createCalendarDay(day, otherMonth = false, tasks = []) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (otherMonth) dayEl.classList.add('other-month');

    const today = new Date();
    if (!otherMonth &&
        day === today.getDate() &&
        this.currentDate.getMonth() === today.getMonth() &&
        this.currentDate.getFullYear() === today.getFullYear()) {
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
        this.dialogManager.openTaskDialog('edit', task.id);
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
        const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
        const formattedDate = selectedDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
        
        // Abre o diálogo de criação de tarefa com a data preenchida
        elements.taskDueDateInput.value = formattedDate;
        this.dialogManager.openTaskDialog('add');
      });
    }

    return dayEl;
  }

  /**
   * Navega para o mês anterior
   */
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendar();
  }

  /**
   * Navega para o próximo mês
   */
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendar();
  }

  /**
   * Alterna a visualização do calendário
   */
  toggleCalendar() {
    const mainContainer = document.querySelector('main.container');
    const calendarContainer = elements.calendarContainer;
    
    if (mainContainer && calendarContainer) {
      mainContainer.classList.toggle('hidden');
      calendarContainer.classList.toggle('hidden');
      
      if (!calendarContainer.classList.contains('hidden')) {
        this.updateCalendar();
      }
    }
  }
}
// Módulo de gerenciamento da sidebar
import { elements } from './dom-elements.js';

export class SidebarManager {
  /**
   * Alterna a sidebar
   */
  toggleSidebar() {
    const isActive = elements.listsSidebar.classList.contains('active');
    
    if (isActive) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  /**
   * Abre a sidebar
   */
  openSidebar() {
    elements.listsSidebar.classList.add('active');
    elements.sidebarOverlay.classList.add('active');
    elements.toggleSidebarBtn.classList.add('active');
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  }

  /**
   * Fecha a sidebar
   */
  closeSidebar() {
    elements.listsSidebar.classList.remove('active');
    elements.sidebarOverlay.classList.remove('active');
    elements.toggleSidebarBtn.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll do body
  }
}
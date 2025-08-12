// Módulo de gerenciamento do PWA
import { elements } from './dom-elements.js';

export class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Service worker registrado:', reg))
          .catch(err => console.log('Erro no registro do Service worker:', err));
      });
    }

    // Gerenciar prompt de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      elements.installPwaBtn.style.display = 'flex';
    });

    // Event listener para botão de instalação
    elements.installPwaBtn.addEventListener('click', () => this.installPWA());
  }

  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        elements.installPwaBtn.style.display = 'none';
      }
    }
  }
}
// core.js - Módulo principal da aplicação (OTIMIZADO)
class BibleApp {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark';
    this.currentPage = window.location.pathname;
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupNavigation();
    this.setupAccessibility();
    this.setupServiceWorker();
    this.setupFavorites();
    this.trackPageView();
    
    console.log('BibleApp inicializado - v1.0.0');
  }

  setupTheme() {
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;

    htmlEl.setAttribute('data-theme', this.theme);
    themeToggle.setAttribute('aria-pressed', this.theme === 'dark' ? 'false' : 'true');

    themeToggle.addEventListener('click', () => {
      const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      themeToggle.setAttribute('aria-pressed', nextTheme === 'dark' ? 'false' : 'true');
      
      this.trackEvent('theme', 'toggle', nextTheme);
    });
  }

  setupNavigation() {
    document.querySelectorAll("a.nav-link[href^='#']").forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - 80,
            behavior: 'smooth'
          });
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  setupAccessibility() {
    document.addEventListener('focusin', (e) => {
      e.target.classList.add('focus-visible');
    });

    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-visible');
    });

    const skipLinks = document.querySelectorAll('.skip-link');
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    });
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('sw.js');
          console.log('SW registrado com sucesso:', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Nova versão do SW encontrada:', newWorker);
          });

        } catch (error) {
          console.warn('Falha no registro do SW:', error);
        }
      });

      window.addEventListener('online', () => {
        this.showToast('Conexão restaurada', 'success');
      });

      window.addEventListener('offline', () => {
        this.showToast('Você está offline', 'warning');
      });
    }
  }

  setupFavorites() {
    this.updateFavoriteButtons();
  }

  updateFavoriteButtons() {
    document.querySelectorAll('.info-card, .gallery-card').forEach(card => {
      if (card.querySelector('.fav-btn')) return;
      
      const id = card.dataset.title || card.querySelector('img')?.alt || '';
      if (!id) return;
      
      const btn = document.createElement('button');
      btn.className = 'fav-btn';
      btn.innerHTML = '❤';
      btn.title = 'Favoritar';
      
      if (window.favoriteManager && window.favoriteManager.has(id)) {
        btn.classList.add('active');
      }
      
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.favoriteManager) {
          const isNowFavorite = window.favoriteManager.toggle(id);
          btn.classList.toggle('active', isNowFavorite);
        }
      });
      
      card.style.position = 'relative';
      card.appendChild(btn);
    });
  }

  closeAllModals() {
    document.querySelectorAll('.lb-backdrop.show').forEach(modal => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toasts') || this.createToastContainer();
    const toast = document.createElement('div');
    
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('aria-live', 'polite');
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toasts';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.style.cssText = `
      position: fixed;
      right: 20px;
      top: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
  }

  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
    
    console.log(`Página visualizada: ${this.currentPage}`);
  }

  trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }
    
    console.log(`Evento: ${category}.${action}`, label);
  }
}

class FavoriteManager {
  constructor() {
    this.key = 'biblia.favorites';
    this.favorites = new Set(JSON.parse(localStorage.getItem(this.key) || '[]'));
  }

  add(itemId) {
    this.favorites.add(itemId);
    this.save();
    return true;
  }

  remove(itemId) {
    this.favorites.delete(itemId);
    this.save();
    return false;
  }

  toggle(itemId) {
    if (this.favorites.has(itemId)) {
      return this.remove(itemId);
    } else {
      return this.add(itemId);
    }
  }

  has(itemId) {
    return this.favorites.has(itemId);
  }

  getAll() {
    return Array.from(this.favorites);
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.getAll()));
  }

  export(format = 'json') {
    const data = this.getAll();
    
    switch (format) {
      case 'json':
        return this.exportJSON(data);
      case 'csv':
        return this.exportCSV(data);
      case 'text':
        return this.exportText(data);
      default:
        return this.exportJSON(data);
    }
  }

  exportJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  exportCSV(data) {
    const csv = ['Item'].concat(data).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    return URL.createObjectURL(blob);
  }

  exportText(data) {
    const text = `Meus Favoritos - Conheça a Bíblia\n\n${data.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }

  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          
          if (Array.isArray(imported)) {
            imported.forEach(item => this.favorites.add(String(item)));
            this.save();
            resolve(this.getAll());
          } else {
            reject(new Error('Formato de arquivo inválido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));
      reader.readAsText(file);
    });
  }
}

const BibleUtils = {
  normalizeText(text) {
    return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  },

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.bibleApp = new BibleApp();
  window.favoriteManager = new FavoriteManager();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BibleApp, FavoriteManager, BibleUtils };
}
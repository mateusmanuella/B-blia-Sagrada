// gallery.js - Gerenciador de Galeria e Lightbox (OTIMIZADO)
class GalleryManager {
  constructor() {
    this.items = [];
    this.currentIndex = -1;
    this.lastActiveElement = null;
    this.init();
  }

  init() {
    this.cacheGalleryItems();
    this.setupLightbox();
    this.setupVideoPlayer();
    this.setupSearch();
    this.setupFavorites();
    this.setupLazyLoading();
  }

  cacheGalleryItems() {
    this.items = Array.from(document.querySelectorAll('.gallery-card, .info-card')).map((card, index) => {
      const img = card.querySelector('img');
      return {
        src: img.currentSrc || img.src,
        alt: img.alt || '',
        title: card.dataset.title || '',
        caption: card.querySelector('.gallery-caption')?.textContent || card.querySelector('.card-body')?.textContent || '',
        element: card,
        index: index
      };
    });
  }

  setupLightbox() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImage = document.getElementById('lb-image');
    this.lightboxCaption = document.getElementById('lb-caption');
    
    if (!this.lightbox) return;

    document.getElementById('lb-prev')?.addEventListener('click', () => this.showPrev());
    document.getElementById('lb-next')?.addEventListener('click', () => this.showNext());
    document.getElementById('lb-close')?.addEventListener('click', () => this.closeLightbox());
    
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('show')) return;
      
      switch(e.key) {
        case 'Escape':
          e.preventDefault();
          this.closeLightbox();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.showNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.showPrev();
          break;
      }
    });

    this.items.forEach((item, index) => {
      item.element.addEventListener('click', () => this.openLightbox(index));
      item.element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(index);
        }
      });
    });
  }

  openLightbox(index) {
    if (index < 0 || index >= this.items.length) return;
    
    this.currentIndex = index;
    const item = this.items[index];
    
    this.lightboxImage.src = item.src;
    this.lightboxImage.alt = item.alt;
    this.lightboxCaption.textContent = item.caption;
    
    this.lastActiveElement = document.activeElement;
    this.lightbox.classList.add('show');
    this.lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('lb-close')?.focus();
  }

  closeLightbox() {
    this.lightbox.classList.remove('show');
    this.lightbox.setAttribute('aria-hidden', 'true');
    this.lightboxImage.src = '';
    document.body.style.overflow = '';
    
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
  }

  showNext() {
    if (this.items.length === 0) return;
    this.openLightbox((this.currentIndex + 1) % this.items.length);
  }

  showPrev() {
    if (this.items.length === 0) return;
    this.openLightbox((this.currentIndex - 1 + this.items.length) % this.items.length);
  }

  setupVideoPlayer() {
    this.videoLightbox = document.getElementById('video-lightbox');
    this.videoIframe = document.getElementById('video-iframe');
    
    if (!this.videoLightbox) return;

    document.querySelectorAll('.card-media[data-video-id]').forEach(card => {
      card.addEventListener('click', () => this.openVideo(card.dataset.videoId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openVideo(card.dataset.videoId);
        }
      });
    });

    const mainVideoCard = document.getElementById('video-card');
    if (mainVideoCard) {
      mainVideoCard.addEventListener('click', () => this.openVideo(mainVideoCard.dataset.videoId));
    }

    document.getElementById('close-video')?.addEventListener('click', () => this.closeVideo());
    this.videoLightbox.addEventListener('click', (e) => {
      if (e.target === this.videoLightbox) this.closeVideo();
    });
  }

  openVideo(videoId) {
    if (!this.videoIframe) return;
    
    this.lastActiveElement = document.activeElement;
    const src = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&enablejsapi=1`;
    this.videoIframe.src = src;
    
    this.videoLightbox.classList.add('show');
    this.videoLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('close-video')?.focus();
  }

  closeVideo() {
    if (this.videoIframe) {
      this.videoIframe.src = 'about:blank';
    }
    
    this.videoLightbox.classList.remove('show');
    this.videoLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('gallery-search');
    const clearBtn = document.getElementById('gallery-clear');
    
    if (!searchInput) return;

    const searchHandler = BibleUtils.debounce((query) => {
      this.filterGallery(query);
    }, 300);

    searchInput.addEventListener('input', (e) => searchHandler(e.target.value));
    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      this.filterGallery('');
    });
  }

  filterGallery(query) {
    const term = BibleUtils.normalizeText(query.trim());
    let matches = 0;

    this.items.forEach(item => {
      const searchableText = BibleUtils.normalizeText(
        item.title + ' ' + item.caption + ' ' + item.alt
      );
      
      const isVisible = !term || searchableText.includes(term);
      item.element.style.display = isVisible ? '' : 'none';
      
      if (item.element.parentElement?.classList.contains('col-md-4')) {
        item.element.parentElement.style.display = isVisible ? '' : 'none';
      }
      
      item.element.classList.toggle('result-highlight', isVisible && term.length > 0);
      
      if (isVisible) matches++;
    });

    const countEl = document.getElementById('search-count');
    if (countEl) {
      countEl.textContent = term ? `${matches} resultado(s)` : '';
      countEl.setAttribute('aria-live', 'polite');
    }
  }

  setupFavorites() {
    this.updateFavoriteButtons();
  }

  updateFavoriteButtons() {
    this.items.forEach(item => {
      if (item.element.querySelector('.fav-btn')) return;
      
      const itemId = item.title || item.alt;
      if (!itemId) return;

      const btn = document.createElement('button');
      btn.className = 'fav-btn';
      btn.innerHTML = '❤';
      btn.title = 'Favoritar';
      btn.setAttribute('aria-label', `Favoritar ${item.title}`);
      
      if (window.favoriteManager.has(itemId)) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isNowFavorite = window.favoriteManager.toggle(itemId);
        btn.classList.toggle('active', isNowFavorite);
        
        window.bibleApp.trackEvent('favorites', isNowFavorite ? 'add' : 'remove', itemId);
      });

      item.element.style.position = 'relative';
      item.element.appendChild(btn);
    });
  }

  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        const img = entry.target.querySelector('img[data-src]');
        if (img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });

    this.items.forEach(item => observer.observe(item.element));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.gallery-card, .info-card')) {
    window.galleryManager = new GalleryManager();
  }
});
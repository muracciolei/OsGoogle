/**
 * OsGoogle Launcher Module
 * Manages the home screen, pages, icons, and navigation
 */

const OsGoogleLauncher = {
  currentPage: 0,
  totalPages: 1,
  iconsPerPage: 16,
  iconsPerRow: 4,
  pages: [],
  folders: [],
  draggedIcon: null,
  
  async init() {
    // Initialize storage first
    await OsGoogleStorage.init();
    
    // Initialize other modules
    await OsGoogleApps.init();
    OsGoogleWidgets.init();
    OsGoogleGestures.init();
    
    // Load user data
    await this.loadLayout();
    
    // Render the UI
    this.renderPages();
    this.renderDock();
    this.setupEventListeners();
    this.setupGestures();
    
    // Update status bar time
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    
    // Hide loading screen
    setTimeout(() => {
      document.getElementById('loading-screen')?.classList.add('hidden');
    }, 500);
    
    console.log('OsGoogle Launcher initialized');
  },
  
  async loadLayout() {
    // Load saved layout or create default
    const savedLayout = localStorage.getItem('webos_layout');
    
    if (savedLayout) {
      const layout = JSON.parse(savedLayout);
      this.pages = layout.pages || [];
      this.folders = layout.folders || [];
    } else {
      // Create default layout
      this.createDefaultLayout();
    }
    
    this.totalPages = Math.max(1, this.pages.length);
  },
  
  createDefaultLayout() {
    const apps = OsGoogleApps.defaultApps;
    
    // Split apps into pages
    this.pages = [];
    for (let i = 0; i < apps.length; i += this.iconsPerPage) {
      const pageApps = apps.slice(i, i + this.iconsPerPage);
      this.pages.push(pageApps.map((app, index) => ({
        ...app,
        position: index
      })));
    }
    
    // Always have at least one page
    if (this.pages.length === 0) {
      this.pages = [[]];
    }
  },
  
  renderPages() {
    const container = document.getElementById('pages-container');
    const indicators = document.getElementById('page-indicators');
    
    if (!container || !indicators) return;
    
    // Render pages
    container.innerHTML = this.pages.map((page, pageIndex) => `
      <div class="page" data-page="${pageIndex}">
        ${page.map((icon, iconIndex) => this.createIconHTML(icon, pageIndex, iconIndex)).join('')}
      </div>
    `).join('');
    
    // Render page indicators
    indicators.innerHTML = this.pages.map((_, index) => `
      <div class="page-indicator ${index === this.currentPage ? 'active' : ''}" data-page="${index}"></div>
    `).join('');
    
    // Setup drag and drop
    this.setupDragAndDrop();
  },
  
  createIconHTML(icon, pageIndex, iconIndex) {
    if (!icon) return '';
    
    return `
      <div class="icon" 
           data-id="${icon.id}" 
           data-page="${pageIndex}" 
           data-position="${iconIndex}"
           draggable="true">
        <div class="icon-image" style="background: ${icon.color || '#007AFF'}">
          <span style="font-size: 28px">${icon.icon || '📱'}</span>
        </div>
        <span class="icon-label">${icon.name}</span>
        ${icon.badge ? `<span class="icon-badge">${icon.badge}</span>` : ''}
      </div>
    `;
  },
  
  renderDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // Dock apps (first 4 apps)
    const dockApps = OsGoogleApps.defaultApps.slice(0, 4);
    
    dock.innerHTML = dockApps.map(app => `
      <div class="icon" data-id="${app.id}">
        <div class="icon-image" style="background: ${app.color || '#007AFF'}">
          <span style="font-size: 24px">${app.icon || '📱'}</span>
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    dock.querySelectorAll('.icon').forEach(iconEl => {
      iconEl.addEventListener('click', () => {
        const appId = iconEl.dataset.id;
        OsGoogleApps.openApp(appId);
      });
    });
  },
  
  setupEventListeners() {
    // Page indicator clicks
    document.querySelectorAll('.page-indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        const page = parseInt(indicator.dataset.page);
        this.goToPage(page);
      });
    });
    
    // Icon clicks
    document.querySelectorAll('.page .icon').forEach(iconEl => {
      iconEl.addEventListener('click', (e) => {
        const appId = iconEl.dataset.id;
        OsGoogleApps.openApp(appId);
      });
    });
    
    // Settings button
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      this.toggleSettingsPanel();
    });
    
    // Search close button
    document.getElementById('search-close-btn')?.addEventListener('click', () => {
      OsGoogleWidgets.closeSearch();
    });
    
    // Search input
    document.getElementById('global-search-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch(e.target.value);
      }
    });
    
    // Settings panel
    this.setupSettingsHandlers();
    
    // Dock clicks
    document.getElementById('dock')?.addEventListener('click', (e) => {
      const iconEl = e.target.closest('.icon');
      if (iconEl) {
        const appId = iconEl.dataset.id;
        OsGoogleApps.openApp(appId);
      }
    });
  },
  
  setupSettingsHandlers() {
    // Wallpaper buttons
    document.querySelectorAll('.wallpaper-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wallpaper-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const wp = btn.dataset.wallpaper;
        const wallpapers = {
          'default': 'var(--wallpaper-default)',
          'gradient-blue': 'var(--wallpaper-gradient-blue)',
          'gradient-purple': 'var(--wallpaper-gradient-purple)',
          'gradient-sunset': 'var(--wallpaper-gradient-sunset)',
          'dark': 'var(--wallpaper-dark)'
        };
        
        document.body.style.background = wallpapers[wp] || wallpapers.default;
        OsGoogleStorage.saveSetting('wallpaper', wp);
      });
    });
    
    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') !== 'light';
      document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
      OsGoogleStorage.saveSetting('theme', isDark ? 'light' : 'dark');
    });
    
    // Reset layout
    document.getElementById('reset-layout-btn')?.addEventListener('click', async () => {
      if (confirm('Reset layout to default?')) {
        localStorage.removeItem('webos_layout');
        await OsGoogleStorage.resetAll();
        location.reload();
      }
    });
  },
  
  setupGestures() {
    const container = document.getElementById('pages-container');
    if (!container) return;
    
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let startTime = 0;
    
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      startTime = Date.now();
      prevTranslate = this.currentPage * -window.innerWidth;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      currentTranslate = prevTranslate + diff;
      
      container.style.transform = `translateX(${currentTranslate}px)`;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
      isDragging = false;
      const diff = Date.now() - startTime;
      const movedBy = currentTranslate - prevTranslate;
      
      // Determine if we should change page
      if (movedBy < -50 && diff < 300) {
        this.goToPage(Math.min(this.currentPage + 1, this.totalPages - 1));
      } else if (movedBy > 50 && diff < 300) {
        this.goToPage(Math.max(this.currentPage - 1, 0));
      } else if (movedBy < -100) {
        this.goToPage(Math.min(this.currentPage + 1, this.totalPages - 1));
      } else if (movedBy > 100) {
        this.goToPage(Math.max(this.currentPage - 1, 0));
      } else {
        this.goToPage(this.currentPage);
      }
    }, { passive: true });
    
    // Mouse events for desktop
    container.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      isDragging = true;
      prevTranslate = this.currentPage * -window.innerWidth;
    });
    
    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      const diff = currentX - startX;
      currentTranslate = prevTranslate + diff;
      
      container.style.transform = `translateX(${currentTranslate}px)`;
    });
    
    container.addEventListener('mouseup', (e) => {
      isDragging = false;
      const movedBy = currentTranslate - prevTranslate;
      
      if (movedBy < -50) {
        this.goToPage(Math.min(this.currentPage + 1, this.totalPages - 1));
      } else if (movedBy > 50) {
        this.goToPage(Math.max(this.currentPage - 1, 0));
      } else {
        this.goToPage(this.currentPage);
      }
    });
  },
  
  setupDragAndDrop() {
    const icons = document.querySelectorAll('.page .icon');
    
    icons.forEach(icon => {
      icon.addEventListener('dragstart', (e) => {
        this.draggedIcon = icon;
        icon.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      icon.addEventListener('dragend', () => {
        icon.classList.remove('dragging');
        this.draggedIcon = null;
      });
      
      icon.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      icon.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (this.draggedIcon && this.draggedIcon !== icon) {
          this.swapIcons(this.draggedIcon, icon);
        }
      });
    });
  },
  
  swapIcons(fromIcon, toIcon) {
    const fromPage = parseInt(fromIcon.dataset.page);
    const fromPos = parseInt(fromIcon.dataset.position);
    const toPage = parseInt(toIcon.dataset.page);
    const toPos = parseInt(toIcon.dataset.position);
    
    // Swap in data
    const temp = this.pages[fromPage][fromPos];
    this.pages[fromPage][fromPos] = this.pages[toPage][toPos];
    this.pages[toPage][toPos] = temp;
    
    // Save layout
    this.saveLayout();
    
    // Re-render
    this.renderPages();
  },
  
  goToPage(page) {
    this.currentPage = page;
    const container = document.getElementById('pages-container');
    
    if (container) {
      container.style.transform = `translateX(${-page * 100}%)`;
    }
    
    // Update indicators
    document.querySelectorAll('.page-indicator').forEach((ind, index) => {
      ind.classList.toggle('active', index === page);
    });
  },
  
  handleSearch(query) {
    if (!query) return;
    
    // Check if it's a URL
    if (query.includes('.') && !query.includes(' ')) {
      const url = query.startsWith('http') ? query : 'https://' + query;
      window.open(url, '_blank');
    } else {
      // Search Google
      window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
    }
    
    OsGoogleWidgets.closeSearch();
  },
  
  toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
      panel.classList.toggle('hidden');
    }
  },
  
  updateTime() {
    const now = new Date();
    const timeEl = document.getElementById('status-time');
    
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  },
  
  saveLayout() {
    const layout = {
      pages: this.pages,
      folders: this.folders
    };
    localStorage.setItem('webos_layout', JSON.stringify(layout));
  }
};

// Make it globally available
window.OsGoogleLauncher = OsGoogleLauncher;
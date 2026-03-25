/**
 * OsGoogle Apps Module
 * Manages and renders applications
 */

const OsGoogleApps = {
  apps: [],
  currentApp: null,
  
  // Default apps
  defaultApps: [
    {
      id: 'camera',
      name: 'Camera',
      icon: '📷',
      url: 'https://camera.google.com',
      category: 'utility',
      color: '#8E8E93'
    },
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      url: 'https://www.google.com',
      category: 'web',
      color: '#4285F4'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      url: 'https://mail.google.com',
      category: 'google',
      color: '#EA4335'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '▶️',
      url: 'https://www.youtube.com',
      category: 'entertainment',
      color: '#FF0000'
    },
    {
      id: 'drive',
      name: 'Drive',
      icon: '📁',
      url: 'https://drive.google.com',
      category: 'google',
      color: '#34A853'
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: '🗺️',
      url: 'https://maps.google.com',
      category: 'google',
      color: '#4285F4'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📅',
      url: 'https://calendar.google.com',
      category: 'google',
      color: '#4285F4'
    },
    {
      id: 'photos',
      name: 'Photos',
      icon: '🖼️',
      url: 'https://photos.google.com',
      category: 'google',
      color: '#FBBC05'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      app: 'settings',
      category: 'system',
      color: '#8E8E93'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: '📝',
      app: 'notes',
      category: 'productivity',
      color: '#FFCC00'
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: '🌐',
      app: 'browser',
      category: 'utility',
      color: '#5856D6'
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🔢',
      app: 'calculator',
      category: 'utility',
      color: '#636366'
    },
    {
      id: 'meet',
      name: 'Meet',
      icon: '📹',
      url: 'https://meet.google.com',
      category: 'google',
      color: '#00897B'
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: '💬',
      url: 'https://chat.google.com',
      category: 'google',
      color: '#4285F4'
    }
  ],
  
  async init() {
    // Load apps from storage or use defaults
    const savedApps = await OsGoogleStorage.getIcons();
    this.apps = savedApps.length > 0 ? savedApps : this.defaultApps;
    
    console.log('Apps initialized:', this.apps.length, 'apps');
  },
  
  getApps() {
    return this.apps;
  },
  
  getAppById(id) {
    return this.apps.find(app => app.id === id);
  },
  
  async addApp(appData) {
    const newApp = {
      id: appData.id || Date.now().toString(),
      name: appData.name,
      icon: appData.icon || '📱',
      url: appData.url || '',
      app: appData.app || '',
      category: appData.category || 'custom',
      color: appData.color || '#007AFF'
    };
    
    this.apps.push(newApp);
    await OsGoogleStorage.saveIcon(newApp);
    return newApp;
  },
  
  async removeApp(id) {
    this.apps = this.apps.filter(app => app.id !== id);
    await OsGoogleStorage.delete('icons', id);
  },
  
  async updateApp(id, updates) {
    const index = this.apps.findIndex(app => app.id === id);
    if (index !== -1) {
      this.apps[index] = { ...this.apps[index], ...updates };
      await OsGoogleStorage.saveIcon(this.apps[index]);
    }
  },
  
  // Open an app
  async openApp(appId) {
    const app = this.getAppById(appId);
    if (!app) return;
    
    this.currentApp = app;
    
    if (app.url) {
      // External URL - open in browser
      window.open(app.url, '_blank');
    } else if (app.app) {
      // Internal app
      this.renderApp(app);
    }
  },
  
  // Render internal app
  renderApp(app) {
    const overlay = document.getElementById('app-overlay');
    const titleEl = document.getElementById('app-title');
    const contentEl = document.getElementById('app-content');
    const closeBtn = document.getElementById('app-close-btn');
    const backBtn = document.getElementById('app-back-btn');
    
    if (!overlay || !titleEl || !contentEl) return;
    
    // Set app title
    titleEl.textContent = app.name;
    
    // Hide back button for now
    if (backBtn) backBtn.classList.add('hidden');
    
    // Close button
    closeBtn.onclick = () => this.closeApp();
    
    // Render app content
    switch (app.app) {
      case 'settings':
        contentEl.innerHTML = this.renderSettingsApp();
        this.initSettingsApp();
        break;
        
      case 'notes':
        contentEl.innerHTML = this.renderNotesApp();
        this.initNotesApp();
        break;
        
      case 'browser':
        contentEl.innerHTML = this.renderBrowserApp();
        this.initBrowserApp();
        break;
        
      case 'calculator':
        contentEl.innerHTML = this.renderCalculatorApp();
        this.initCalculatorApp();
        break;
        
      default:
        contentEl.innerHTML = '<p>App not found</p>';
    }
    
    overlay.classList.remove('hidden');
  },
  
  // Settings App
  renderSettingsApp() {
    return `
      <div class="settings-app">
        <div class="settings-section">
          <h3>Appearance</h3>
          <button class="settings-item" id="toggle-theme-btn">
            <span>🌙</span>
            <span>Dark Mode</span>
            <span class="toggle-state">ON</span>
          </button>
        </div>
        
        <div class="settings-section">
          <h3>Wallpaper</h3>
          <div class="wallpaper-grid">
            <button class="wallpaper-option active" data-wp="default"></button>
            <button class="wallpaper-option" data-wp="gradient-blue"></button>
            <button class="wallpaper-option" data-wp="gradient-purple"></button>
            <button class="wallpaper-option" data-wp="gradient-sunset"></button>
            <button class="wallpaper-option" data-wp="dark"></button>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Storage</h3>
          <button class="settings-item" id="export-btn">
            <span>📤</span>
            <span>Export Data</span>
          </button>
          <button class="settings-item" id="import-btn">
            <span>📥</span>
            <span>Import Data</span>
          </button>
          <button class="settings-item danger" id="reset-btn">
            <span>🗑️</span>
            <span>Reset All Data</span>
          </button>
        </div>
        
        <div class="settings-section">
          <h3>About</h3>
          <p class="about-text">OsGoogle v1.0.0</p>
          <p class="about-text">Personal Universal Operating System</p>
        </div>
      </div>
    `;
  },
  
  initSettingsApp() {
    // Theme toggle
    document.getElementById('toggle-theme-btn')?.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') !== 'light';
      document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
      OsGoogleStorage.saveSetting('theme', isDark ? 'light' : 'dark');
    });
    
    // Wallpaper buttons
    document.querySelectorAll('.wallpaper-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wallpaper-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const wp = btn.dataset.wp;
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
    
    // Export
    document.getElementById('export-btn')?.addEventListener('click', async () => {
      const data = await OsGoogleStorage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'webos-backup.json';
      a.click();
    });
    
    // Import
    document.getElementById('import-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        const text = await file.text();
        const success = await OsGoogleStorage.importData(text);
        if (success) {
          alert('Data imported successfully!');
          location.reload();
        } else {
          alert('Failed to import data');
        }
      };
      input.click();
    });
    
    // Reset
    document.getElementById('reset-btn')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        await OsGoogleStorage.resetAll();
        location.reload();
      }
    });
  },
  
  // Notes App
  renderNotesApp() {
    return `
      <div class="notes-app">
        <div class="notes-list" id="notes-list"></div>
        <button class="add-note-btn" id="add-note-btn">+ New Note</button>
        
        <div class="note-editor hidden" id="note-editor">
          <input type="text" id="note-title" placeholder="Title">
          <textarea id="note-content" placeholder="Start typing..."></textarea>
          <div class="note-actions">
            <button class="btn-cancel" id="cancel-note-btn">Cancel</button>
            <button class="btn-save" id="save-note-btn">Save</button>
          </div>
        </div>
      </div>
    `;
  },
  
  async initNotesApp() {
    await this.renderNotesList();
    
    document.getElementById('add-note-btn')?.addEventListener('click', () => {
      document.getElementById('note-editor').classList.remove('hidden');
      document.getElementById('note-title').value = '';
      document.getElementById('note-content').value = '';
      document.getElementById('note-title').focus();
    });
    
    document.getElementById('cancel-note-btn')?.addEventListener('click', () => {
      document.getElementById('note-editor').classList.add('hidden');
    });
    
    document.getElementById('save-note-btn')?.addEventListener('click', async () => {
      const title = document.getElementById('note-title').value || 'Untitled';
      const content = document.getElementById('note-content').value;
      
      if (content) {
        await OsGoogleStorage.saveNote({
          title,
          content,
          date: new Date().toISOString()
        });
        document.getElementById('note-editor').classList.add('hidden');
        await this.renderNotesList();
      }
    });
  },
  
  async renderNotesList() {
    const notes = await OsGoogleStorage.getNotes();
    const listEl = document.getElementById('notes-list');
    
    if (!listEl) return;
    
    if (notes.length === 0) {
      listEl.innerHTML = '<p class="no-notes">No notes yet. Tap + to create one.</p>';
      return;
    }
    
    listEl.innerHTML = notes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <h4>${note.title}</h4>
        <p>${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
        <span class="note-date">${new Date(note.date).toLocaleDateString()}</span>
      </div>
    `).join('');
    
    // Add click handlers
    listEl.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        const note = notes.find(n => n.id == item.dataset.id);
        if (note) {
          document.getElementById('note-title').value = note.title;
          document.getElementById('note-content').value = note.content;
          document.getElementById('note-editor').classList.remove('hidden');
        }
      });
    });
  },
  
  // Browser App
  renderBrowserApp() {
    return `
      <div class="browser-app">
        <div class="browser-bar">
          <input type="text" id="browser-url" placeholder="Enter URL or search...">
          <button id="browser-go-btn">Go</button>
        </div>
        <div class="browser-content">
          <iframe id="browser-frame" src="about:blank"></iframe>
        </div>
      </div>
    `;
  },
  
  initBrowserApp() {
    const urlInput = document.getElementById('browser-url');
    const goBtn = document.getElementById('browser-go-btn');
    const frame = document.getElementById('browser-frame');
    
    const navigate = (url) => {
      let finalUrl = url;
      
      if (!url.startsWith('http') && !url.includes('.')) {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      } else if (!url.startsWith('http')) {
        finalUrl = 'https://' + url;
      }
      
      if (frame) frame.src = finalUrl;
    };
    
    goBtn?.addEventListener('click', () => navigate(urlInput.value));
    urlInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') navigate(urlInput.value);
    });
  },
  
  // Calculator App
  renderCalculatorApp() {
    return `
      <div class="calculator-app">
        <div class="calc-display" id="calc-display">0</div>
        <div class="calc-buttons">
          <button class="calc-btn" data-action="clear">C</button>
          <button class="calc-btn" data-action="neg">±</button>
          <button class="calc-btn" data-action="%">%</button>
          <button class="calc-btn operator" data-action="/">÷</button>
          
          <button class="calc-btn" data-action="7">7</button>
          <button class="calc-btn" data-action="8">8</button>
          <button class="calc-btn" data-action="9">9</button>
          <button class="calc-btn operator" data-action="*">×</button>
          
          <button class="calc-btn" data-action="4">4</button>
          <button class="calc-btn" data-action="5">5</button>
          <button class="calc-btn" data-action="6">6</button>
          <button class="calc-btn operator" data-action="-">−</button>
          
          <button class="calc-btn" data-action="1">1</button>
          <button class="calc-btn" data-action="2">2</button>
          <button class="calc-btn" data-action="3">3</button>
          <button class="calc-btn operator" data-action="+">+</button>
          
          <button class="calc-btn zero" data-action="0">0</button>
          <button class="calc-btn" data-action=".">.</button>
          <button class="calc-btn operator" data-action="=">=</button>
        </div>
      </div>
    `;
  },
  
  initCalculatorApp() {
    let display = '0';
    let previous = null;
    let operator = null;
    let waitingForOperand = false;
    
    const updateDisplay = () => {
      const el = document.getElementById('calc-display');
      if (el) el.textContent = display;
    };
    
    const clear = () => {
      display = '0';
      previous = null;
      operator = null;
      waitingForOperand = false;
      updateDisplay();
    };
    
    const inputDigit = (digit) => {
      if (waitingForOperand) {
        display = digit;
        waitingForOperand = false;
      } else {
        display = display === '0' ? digit : display + digit;
      }
      updateDisplay();
    };
    
    const inputDecimal = () => {
      if (waitingForOperand) {
        display = '0.';
        waitingForOperand = false;
      } else if (!display.includes('.')) {
        display += '.';
      }
      updateDisplay();
    };
    
    const calculate = () => {
      const current = parseFloat(display);
      
      if (previous === null) {
        return current;
      }
      
      switch (operator) {
        case '+': return previous + current;
        case '-': return previous - current;
        case '*': return previous * current;
        case '/': return current !== 0 ? previous / current : 'Error';
        default: return current;
      }
    };
    
    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        
        if (!isNaN(action) || action === '.') {
          if (action === '.') inputDecimal();
          else inputDigit(action);
        } else if (action === 'clear') {
          clear();
        } else if (action === 'neg') {
          display = String(parseFloat(display) * -1);
          updateDisplay();
        } else if (action === '%') {
          display = String(parseFloat(display) / 100);
          updateDisplay();
        } else if (['+', '-', '*', '/'].includes(action)) {
          previous = parseFloat(display);
          operator = action;
          waitingForOperand = true;
        } else if (action === '=') {
          display = String(calculate());
          previous = null;
          operator = null;
          updateDisplay();
        }
      });
    });
  },
  
  closeApp() {
    const overlay = document.getElementById('app-overlay');
    const contentEl = document.getElementById('app-content');
    
    if (overlay) overlay.classList.add('hidden');
    if (contentEl) contentEl.innerHTML = '';
    
    this.currentApp = null;
  }
};

// Make it globally available
window.OsGoogleApps = OsGoogleApps;
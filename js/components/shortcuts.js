/**
 * Shortcuts Component
 * Manages user-defined quick launch shortcuts
 */

const ShortcutsComponent = {
  shortcuts: [],
  defaultShortcuts: [
    { id: '1', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '2', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
    { id: '3', name: 'Reddit', url: 'https://reddit.com', icon: '🔴' },
    { id: '4', name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
    { id: '5', name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
    { id: '6', name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📖' },
    { id: '7', name: 'Amazon', url: 'https://amazon.com', icon: '📦' },
    { id: '8', name: 'Netflix', url: 'https://netflix.com', icon: '🎬' }
  ],

  async init() {
    await this.loadShortcuts();
    this.render();
    this.setupEventListeners();
  },

  async loadShortcuts() {
    const saved = await StorageService.getShortcuts();
    this.shortcuts = saved.length > 0 ? saved : this.defaultShortcuts;
    
    if (saved.length === 0) {
      for (const shortcut of this.defaultShortcuts) {
        await StorageService.saveShortcut(shortcut);
      }
    }
  },

  render() {
    const grid = document.getElementById('shortcuts-grid');
    if (!grid) return;

    grid.innerHTML = this.shortcuts.map(shortcut => `
      <div class="shortcut-item" data-id="${shortcut.id}">
        <button class="shortcut-delete" data-id="${shortcut.id}">&times;</button>
        <div class="shortcut-icon">${shortcut.icon || '🔗'}</div>
        <span class="shortcut-name">${shortcut.name}</span>
      </div>
    `).join('');

    this.setupItemListeners();
  },

  setupItemListeners() {
    const grid = document.getElementById('shortcuts-grid');
    if (!grid) return;

    grid.querySelectorAll('.shortcut-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('shortcut-delete')) {
          return;
        }
        const id = item.dataset.id;
        const shortcut = this.shortcuts.find(s => s.id === id);
        if (shortcut && shortcut.url) {
          window.open(shortcut.url, '_blank');
        }
      });
    });

    grid.querySelectorAll('.shortcut-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        await this.deleteShortcut(id);
      });
    });
  },

  setupEventListeners() {
    const addBtn = document.getElementById('add-shortcut-btn');
    const modal = document.getElementById('shortcut-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const saveBtn = document.getElementById('save-shortcut-btn');

    addBtn?.addEventListener('click', () => {
      modal?.classList.remove('hidden');
      document.getElementById('shortcut-name')?.focus();
    });

    closeBtn?.addEventListener('click', () => {
      modal?.classList.add('hidden');
      this.clearModal();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        this.clearModal();
      }
    });

    saveBtn?.addEventListener('click', () => {
      this.saveNewShortcut();
    });
  },

  async saveNewShortcut() {
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const iconInput = document.getElementById('shortcut-icon');

    const name = nameInput?.value.trim();
    const url = urlInput?.value.trim();
    const icon = iconInput?.value.trim() || '🔗';

    if (!name || !url) {
      alert('Please enter a name and URL');
      return;
    }

    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }

    const shortcut = {
      id: Date.now().toString(),
      name,
      url: finalUrl,
      icon
    };

    this.shortcuts.push(shortcut);
    await StorageService.saveShortcut(shortcut);
    this.render();

    document.getElementById('shortcut-modal')?.classList.add('hidden');
    this.clearModal();
  },

  async deleteShortcut(id) {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
    await StorageService.deleteShortcut(id);
    this.render();
  },

  clearModal() {
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const iconInput = document.getElementById('shortcut-icon');
    
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
    if (iconInput) iconInput.value = '';
  }
};

window.ShortcutsComponent = ShortcutsComponent;
/**
 * OsGoogle Widgets Module
 * Manages and renders widgets
 */

const OsGoogleWidgets = {
  widgets: [],
  container: null,
  
  // Default widget templates
  defaultWidgets: [
    {
      id: 'clock-widget',
      type: 'clock',
      position: 0,
      size: 'small'
    },
    {
      id: 'weather-widget',
      type: 'weather',
      position: 1,
      size: 'small'
    },
    {
      id: 'search-widget',
      type: 'search',
      position: 2,
      size: 'small'
    }
  ],
  
  async init() {
    this.container = document.getElementById('widgets-layer');
    if (!this.container) return;
    
    // Load widgets from storage or use defaults
    const savedWidgets = await OsGoogleStorage.getWidgets();
    this.widgets = savedWidgets.length > 0 ? savedWidgets : this.defaultWidgets;
    
    this.render();
    this.startClock();
    this.fetchWeather();
    
    console.log('Widgets initialized');
  },
  
  render() {
    if (!this.container) return;
    
    // Sort widgets by position
    this.widgets.sort((a, b) => a.position - b.position);
    
    this.container.innerHTML = this.widgets
      .map(widget => this.createWidgetHTML(widget))
      .join('');
  },
  
  createWidgetHTML(widget) {
    switch (widget.type) {
      case 'clock':
        return `
          <div class="widget clock-widget" data-id="${widget.id}">
            <div class="widget-header">
              <span class="widget-title">Clock</span>
            </div>
            <div class="widget-content">
              <div class="clock-time" id="clock-time">--:--</div>
              <div class="clock-date" id="clock-date">Loading...</div>
            </div>
          </div>
        `;
      
      case 'weather':
        return `
          <div class="widget weather-widget" data-id="${widget.id}">
            <div class="weather-main">
              <span class="weather-icon" id="weather-icon">🌤️</span>
              <div>
                <div class="weather-temp" id="weather-temp">--°</div>
                <div class="weather-desc" id="weather-desc">Loading...</div>
              </div>
            </div>
            <div class="weather-location" id="weather-location">Detecting...</div>
          </div>
        `;
      
      case 'search':
        return `
          <div class="widget search-widget" data-id="${widget.id}" onclick="OsGoogleWidgets.openSearch()">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>Search or enter URL...</span>
          </div>
        `;
      
      case 'notes':
        return `
          <div class="widget notes-widget" data-id="${widget.id}" onclick="OsGoogleApps.openApp('notes')">
            <div class="widget-header">
              <span class="widget-title">Quick Notes</span>
            </div>
            <div class="widget-content" id="quick-notes">
              <p style="color: var(--text-secondary)">Tap to add note...</p>
            </div>
          </div>
        `;
      
      default:
        return '';
    }
  },
  
  startClock() {
    const updateClock = () => {
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
    };
    
    updateClock();
    setInterval(updateClock, 1000);
  },
  
  async fetchWeather() {
    const iconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const locEl = document.getElementById('weather-location');
    
    try {
      const response = await fetch('https://wttr.in/?format=j1');
      const data = await response.json();
      
      const current = data.current_condition[0];
      
      if (iconEl) {
        const temp = parseInt(current.temp_C);
        if (temp > 30) iconEl.textContent = '🔥';
        else if (temp > 25) iconEl.textContent = '☀️';
        else if (temp > 20) iconEl.textContent = '🌤️';
        else if (temp > 15) iconEl.textContent = '⛅';
        else if (temp > 10) iconEl.textContent = '🌥️';
        else iconEl.textContent = '❄️';
      }
      
      if (tempEl) tempEl.textContent = current.temp_C + '°';
      if (descEl) descEl.textContent = data.current_condition[0].weatherDesc[0].value;
      if (locEl) locEl.textContent = data.nearest_area[0].areaName[0].value;
    } catch (e) {
      if (tempEl) tempEl.textContent = '22°';
      if (descEl) descEl.textContent = 'Partly Cloudy';
      if (locEl) locEl.textContent = 'Your Location';
    }
  },
  
  openSearch() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      document.getElementById('global-search-input').focus();
    }
  },
  
  closeSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('global-search-input');
    const results = document.getElementById('search-results');
    
    if (overlay) overlay.classList.add('hidden');
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  },
  
  async addWidget(type) {
    const newWidget = {
      id: type + '-' + Date.now(),
      type: type,
      position: this.widgets.length,
      size: 'small'
    };
    
    this.widgets.push(newWidget);
    await OsGoogleStorage.saveWidget(newWidget);
    this.render();
  },
  
  async removeWidget(id) {
    this.widgets = this.widgets.filter(w => w.id !== id);
    await OsGoogleStorage.delete('widgets', id);
    this.render();
  },
  
  async reorderWidgets(newOrder) {
    this.widgets = newOrder.map((id, index) => {
      const widget = this.widgets.find(w => w.id === id);
      if (widget) widget.position = index;
      return widget;
    }).filter(Boolean);
    
    // Save to storage
    for (const widget of this.widgets) {
      await OsGoogleStorage.saveWidget(widget);
    }
    
    this.render();
  }
};

// Make it globally available
window.OsGoogleWidgets = OsGoogleWidgets;

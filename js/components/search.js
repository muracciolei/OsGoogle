/**
 * Search Component
 * Handles search functionality with multiple search engines
 */

const SearchComponent = {
  engines: {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      color: '#4285F4'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=',
      color: '#DE4693'
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search?q=',
      color: '#00809D'
    },
    youtube: {
      name: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=',
      color: '#FF0000'
    }
  },

  init() {
    this.input = document.getElementById('search-input');
    this.engineButtons = document.querySelectorAll('.engine-btn');
    
    this.setupEventListeners();
  },

  setupEventListeners() {
    if (!this.input) return;

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.search();
      }
    });

    this.engineButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const engine = btn.dataset.engine;
        this.search(engine);
      });
    });
  },

  getQuery() {
    return this.input ? this.input.value.trim() : '';
  },

  search(engineKey = 'google') {
    const query = this.getQuery();
    
    if (!query) return;

    const engine = this.engines[engineKey];
    if (!engine) return;

    let url = engine.url;

    if (query.includes('.') && !query.includes(' ') && !query.includes('?')) {
      if (!query.startsWith('http')) {
        url = 'https://' + query;
      } else {
        url = query;
      }
    } else {
      url += encodeURIComponent(query);
    }

    window.open(url, '_blank');

    if (this.input) {
      this.input.value = '';
    }
  }
};

window.SearchComponent = SearchComponent;
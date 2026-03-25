/**
 * Joey Google - Personal Web Toolkit
 * Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Starting Joey Google...');
  
  try {
    await StorageService.init();
    console.log('Storage initialized');
    
    SearchComponent.init();
    console.log('Search initialized');
    
    await ShortcutsComponent.init();
    console.log('Shortcuts initialized');
    
    await initRSSReader();
    console.log('RSS initialized');
    
    await initIntelligencePanel();
    console.log('Intelligence panel initialized');
    
    initInstallPrompt();
    console.log('Install prompt initialized');
    
    console.log('✅ Joey Google ready');
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
});

async function initRSSReader() {
  const sourceSelect = document.getElementById('rss-source-select');
  const refreshBtn = document.getElementById('refresh-rss-btn');
  const feedContainer = document.getElementById('rss-feed');
  
  if (!sourceSelect || !feedContainer) return;
  
  let currentSource = sourceSelect.value;
  
  const loadFeed = async () => {
    feedContainer.innerHTML = '<div class="rss-loading">Loading feeds...</div>';
    
    try {
      const result = await RSSService.fetchFeed(currentSource);
      
      if (result.error) {
        feedContainer.innerHTML = `<div class="rss-error">Failed to load: ${result.error}</div>`;
        return;
      }
      
      feedContainer.innerHTML = result.items.map(item => `
        <div class="rss-item" onclick="window.open('${item.link}', '_blank')">
          <div class="rss-icon">📰</div>
          <div class="rss-content">
            <div class="rss-title">${escapeHtml(item.title)}</div>
            <div class="rss-meta">${item.source} • ${formatDate(item.pubDate)}</div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      feedContainer.innerHTML = '<div class="rss-error">Failed to load feeds</div>';
    }
  };
  
  sourceSelect?.addEventListener('change', () => {
    currentSource = sourceSelect.value;
    loadFeed();
  });
  
  refreshBtn?.addEventListener('click', () => {
    loadFeed();
  });
  
  await loadFeed();
}

async function initIntelligencePanel() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  await updateWeather();
  setInterval(updateWeather, 600000);
  
  await updateQuote();
  setInterval(updateQuote, 3600000);
}

function updateDateTime() {
  const now = new Date();
  
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }
  
  const timeEl = document.getElementById('current-time');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}

async function updateWeather() {
  const iconEl = document.getElementById('weather-icon');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  
  const weather = await WeatherService.fetchWeather();
  
  if (weather && iconEl && tempEl && descEl) {
    iconEl.textContent = weather.icon;
    tempEl.textContent = weather.temp + '°';
    descEl.textContent = weather.location;
  } else if (tempEl && descEl) {
    tempEl.textContent = '--°';
    descEl.textContent = 'Unavailable';
  }
}

async function updateQuote() {
  const textEl = document.getElementById('quote-text');
  const authorEl = document.getElementById('quote-author');
  
  const quote = await QuotesService.fetchQuote();
  
  if (quote && textEl && authorEl) {
    textEl.textContent = '"' + quote.text + '"';
    authorEl.textContent = '- ' + quote.author;
  }
}

function initInstallPrompt() {
  const prompt = document.getElementById('install-prompt');
  const installBtn = document.getElementById('install-btn');
  
  if (!prompt || !installBtn) return;
  
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    prompt.classList.remove('hidden');
  });
  
  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      prompt.classList.add('hidden');
    }
  });
  
  window.addEventListener('appinstalled', () => {
    prompt.classList.add('hidden');
    console.log('PWA installed');
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes + 'm ago';
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours + 'h ago';
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return days + 'd ago';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

window.addEventListener('online', () => {
  console.log('📶 Back online');
});

window.addEventListener('offline', () => {
  console.log('📴 Gone offline');
});

window.JoeyGoogle = {
  version: '1.0.0',
  name: 'Joey Google - Personal Web Toolkit'
};

console.log('%c Joey Google ', 'background: #007AFF; color: white; font-size: 20px; padding: 5px 10px; border-radius: 5px;');
console.log('%c Personal Web Toolkit ', 'color: #007AFF; font-size: 14px;');
# OS Google - Personal Web Toolkit

A lightweight Personal Web Launcher that centralizes web search, RSS feeds, quick links, and personal dashboard into a single, fast, installable PWA.

## Features

### 🔍 Search Hub
- Real search functionality using Google, DuckDuckGo, Bing, and YouTube
- Smart URL detection - type a URL to open directly
- One-click search engine switching

### 📱 Quick Launcher
- User-defined shortcuts grid
- Add, edit, and delete custom shortcuts
- Persisted in IndexedDB/LocalStorage
- Pre-populated with popular sites (GitHub, Stack Overflow, Reddit, etc.)

### 📰 RSS Feed Reader
- Real RSS feed integration via rss2json API
- Multiple feed sources: Tech News (Ars Technica), World News (BBC), Science (Science Daily)
- Click to open articles in new tab
- Pull-to-refresh functionality

### 🌤️ Daily Intelligence Panel
- Real-time clock and date display
- Live weather data from wttr.in
- Daily quotes from ZenQuotes API
- All data fetched in real-time

### 📲 Installable PWA
- Full PWA support with Service Worker
- Offline capable
- Add to home screen on mobile devices
- Standalone display mode

## Technologies Used

- **Vanilla JavaScript** - No frameworks, pure JS
- **IndexedDB** - Persistent local storage
- **Service Worker** - Offline caching and PWA support
- **Fetch API** - Real API calls for RSS, weather, quotes
- **CSS Variables** - Modern theming with CSS custom properties

## Project Structure

```
/
├── index.html          # Main HTML file
├── styles.css         # All styles
├── manifest.json      # PWA manifest
├── service-worker.js  # Service worker
├── icons/
│   └── icon.svg       # App icon
└── js/
    ├── app.js         # Main application
    ├── components/
    │   ├── search.js  # Search component
    │   └── shortcuts.js # Shortcuts component
    └── services/
        ├── storage.js # Storage service
        ├── rss.js     # RSS service
        ├── weather.js # Weather service
        └── quotes.js  # Quotes service
```

## Installation

### Local Development
```bash
# Clone the repository
git clone <repo-url>

# Open in browser
# Simply open index.html in a browser
# Or use a local server
npx serve .
```

### GitHub Pages Deployment
The app is ready for GitHub Pages deployment. Simply push to a GitHub repository and enable GitHub Pages in settings.

## Usage

1. **Search**: Type in the search box and press Enter, or click a search engine button
2. **Shortcuts**: Click any shortcut to open it. Hover to reveal delete button. Click "+ Add Shortcut" to add new ones
3. **RSS**: Select a feed source from dropdown, click items to read
4. **Install**: Click "Install" button on mobile to add to home screen

## Browser Support

- Chrome/Edge (desktop & mobile)
- Safari (iOS & desktop)
- Firefox (desktop & mobile)
- Works best on mobile devices

## License

MIT License

## Version

1.0.0

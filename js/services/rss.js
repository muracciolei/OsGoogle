/**
 * RSS Feed Service
 * Fetches and parses RSS feeds using rss2json API
 */

const RSSService = {
  API_URL: 'https://api.rss2json.com/v1/api.json',
  
  feeds: {
    tech: {
      name: 'Tech News',
      url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
      icon: '💻'
    },
    world: {
      name: 'World News',
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      icon: '🌍'
    },
    science: {
      name: 'Science',
      url: 'https://www.sciencedaily.com/rss/all.xml',
      icon: '🔬'
    }
  },

  async fetchFeed(feedKey) {
    const feed = this.feeds[feedKey];
    if (!feed) {
      throw new Error('Unknown feed: ' + feedKey);
    }

    try {
      const response = await fetch(`${this.API_URL}?rss_url=${encodeURIComponent(feed.url)}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error('RSS parsing failed');
      }

      return {
        feed: feed,
        items: data.items.slice(0, 10).map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          source: data.feed.title || feed.name
        }))
      };
    } catch (error) {
      console.error('RSS fetch error:', error);
      throw error;
    }
  },

  async fetchAllFeeds() {
    const results = {};
    
    for (const key of Object.keys(this.feeds)) {
      try {
        results[key] = await this.fetchFeed(key);
      } catch (error) {
        results[key] = { error: error.message };
      }
    }
    
    return results;
  },

  getAvailableFeeds() {
    return Object.entries(this.feeds).map(([key, feed]) => ({
      key,
      name: feed.name,
      icon: feed.icon
    }));
  }
};

window.RSSService = RSSService;
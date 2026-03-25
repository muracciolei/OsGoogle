/**
 * Quotes Service
 * Fetches quotes from ZenQuotes API
 */

const QuotesService = {
  API_URL: 'https://zenquotes.io/api/today',

  async fetchQuote() {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error('Quote fetch failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          text: data[0].q,
          author: data[0].a
        };
      }
      
      return this.getFallbackQuote();
    } catch (error) {
      console.error('Quote fetch error:', error);
      return this.getFallbackQuote();
    }
  },

  getFallbackQuote() {
    const quotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
      { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

window.QuotesService = QuotesService;
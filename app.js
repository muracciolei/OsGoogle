/**
 * WebOS - Personal Universal
 * Main Application Entry Point
 * 
 * This is the main initialization file that starts the WebOS
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Starting WebOS...');
  
  try {
    // Initialize the launcher (which initializes all modules)
    await WebOSLauncher.init();
    
    console.log('✅ WebOS initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize WebOS:', error);
    
    // Show error message
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <h2>Failed to load WebOS</h2>
          <p>${error.message}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; font-size: 16px;">
            Retry
          </button>
        </div>
      `;
    }
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('📶 Back online');
  showNotification('Back online');
});

window.addEventListener('offline', () => {
  console.log('📴 Gone offline');
  showNotification('You are offline');
});

function showNotification(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// Export for debugging
window.WebOS = {
  version: '1.0.0',
  name: 'WebOS - Personal Universal',
  modules: {
    Storage: WebOSStorage,
    Gestures: WebOSGestures,
    Widgets: WebOSWidgets,
    Apps: WebOSApps,
    Launcher: WebOSLauncher
  }
};

console.log('%c WebOS ', 'background: #007AFF; color: white; font-size: 20px; padding: 5px 10px; border-radius: 5px;');
console.log('%c Personal Universal Operating System ', 'color: #007AFF; font-size: 14px;');
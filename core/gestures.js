/**
 * WebOS Gestures Module
 * Handles touch gestures and interactions
 */

const WebOSGestures = {
  touchStartX: 0,
  touchStartY: 0,
  touchStartTime: 0,
  isDragging: false,
  draggedElement: null,
  longPressTimer: null,
  longPressDuration: 500,
  
  init() {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    
    // Mouse events for desktop
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Context menu
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Global click to close menus
    document.addEventListener('click', this.closeMenus.bind(this));
    
    console.log('Gestures initialized');
  },
  
  handleTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    
    // Long press detection
    this.longPressTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.showContextMenu(this.touchStartX, this.touchStartY);
      }
    }, this.longPressDuration);
  },
  
  handleTouchMove(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Check for drag threshold
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      this.isDragging = true;
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
  },
  
  handleTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Tap detection
    if (!this.isDragging && touchDuration < 300) {
      // This is a tap
    }
    
    this.isDragging = false;
  },
  
  // Mouse handlers for desktop
  handleMouseDown(e) {
    if (e.button !== 0) return;
    
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
    this.touchStartTime = Date.now();
    
    // Long press with mouse
    this.longPressTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.showContextMenu(this.touchStartX, this.touchStartY);
      }
    }, this.longPressDuration);
  },
  
  handleMouseMove(e) {
    const deltaX = e.clientX - this.touchStartX;
    const deltaY = e.clientY - this.touchStartY;
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.isDragging = true;
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }
  },
  
  handleMouseUp(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    this.isDragging = false;
  },
  
  handleContextMenu(e) {
    e.preventDefault();
    this.showContextMenu(e.clientX, e.clientY);
  },
  
  showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    
    // Position the menu
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    // Adjust if off-screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
    }
    
    menu.classList.remove('hidden');
  },
  
  closeMenus(e) {
    const menu = document.getElementById('context-menu');
    const settingsPanel = document.getElementById('settings-panel');
    const searchOverlay = document.getElementById('search-overlay');
    
    if (menu && !menu.classList.contains('hidden')) {
      if (!menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    }
    
    // Don't close settings when clicking on settings
    if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
      if (e.target === settingsPanel || settingsPanel.contains(e.target)) {
        // Allow it
      } else if (!e.target.closest('.settings-panel') && !e.target.closest('#theme-toggle-btn')) {
        // Close settings panel only when clicking outside
      }
    }
  },
  
  // Swipe detection for pages
  setupSwipeNavigation(container, onSwipe) {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let startTime = 0;
    
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const duration = endTime - startTime;
      
      // Detect horizontal swipe
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) && duration < 500) {
        if (deltaX > 0) {
          onSwipe('left'); // Swipe right = go to previous page
        } else {
          onSwipe('right'); // Swipe left = go to next page
        }
      }
    }, { passive: true });
  },
  
  // Make element draggable
  makeDraggable(element, onDrag, onDragEnd) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    const startDrag = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      
      if (e.preventDefault) e.preventDefault();
    };
    
    const doDrag = (e) => {
      if (!isDragging) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      
      if (onDrag) onDrag(deltaX, deltaY);
    };
    
    const endDrag = () => {
      if (isDragging) {
        isDragging = false;
        if (onDragEnd) onDragEnd();
      }
    };
    
    element.addEventListener('touchstart', startDrag, { passive: false });
    element.addEventListener('touchmove', doDrag, { passive: false });
    element.addEventListener('touchend', endDrag);
    
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);
  }
};

// Make it globally available
window.WebOSGestures = WebOSGestures;

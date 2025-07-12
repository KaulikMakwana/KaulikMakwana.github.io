// Optimized terminal animation with performance improvements
const animateTerminalText = (element) => {
  const text = element.textContent.trim();
  element.textContent = '';
  
  // Detect device capabilities
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    element.textContent = text;
    return;
  }
  
  // Optimized animation timing
  const baseSpeed = isMobile ? 60 : 40;
  const randomFactor = isMobile ? 20 : 30;
  
  let i = 0;
  const animate = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        setTimeout(animate, baseSpeed + Math.random() * randomFactor);
      });
    }
  };
  
  // Start animation with hardware acceleration
  element.style.willChange = 'contents';
  animate();
};

// Optimized scroll handler with debounce
let lastScrollTime = 0;
const handleScroll = () => {
  const now = Date.now();
  if (now - lastScrollTime < 100) return;
  lastScrollTime = now;
  
  const terminalElements = document.querySelectorAll('[data-terminal-group] .terminal-title');
  terminalElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.75) {
      if (!el.dataset.animated) {
        el.dataset.animated = 'true';
        animateTerminalText(el);
      }
    }
  });
};

// Initialize with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Find all terminal groups
  const groups = document.querySelectorAll('[data-terminal-group]');
  
  // Immediately animate hero text on load
  const heroText = document.querySelector('[data-terminal-group="hero-text"] .terminal-title');
  if (heroText) animateTerminalText(heroText);
  
  // Optimized scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Initial check
  handleScroll();
  
  // Add smooth CSS transitions
  const style = document.createElement('style');
  style.textContent = `
    .terminal-text {
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);
});

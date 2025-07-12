// Dynamic Tab Label Animation, Pulse/Glow, and Carousel Dots for About Page Tabs
// Requires Alpine.js tab state: activeTab

document.addEventListener('DOMContentLoaded', function () {
  // Animate tab labels in sequence (terminal style)
  const tabButtons = document.querySelectorAll('[data-tab-btn]');
  tabButtons.forEach((btn, i) => {
    btn.classList.add('tab-animate-init');
    setTimeout(() => {
      btn.classList.add('tab-animate-in');
    }, 300 + i * 200);
  });

  // Pulse/glow inactive tabs for a few seconds
  setTimeout(() => {
    tabButtons.forEach(btn => btn.classList.remove('tab-animate-init'));
    tabButtons.forEach(btn => {
      if (!btn.classList.contains('tab-active')) {
        btn.classList.add('tab-pulse');
        setTimeout(() => btn.classList.remove('tab-pulse'), 1600);
      }
    });
  }, 1100);
});

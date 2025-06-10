// Initialize marked.js options for markdown rendering
marked.setOptions({
    highlight: function(code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        } else {
            return code;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Terminal text effect for hero section
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        heroText.classList.add('terminal-text');
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            mobileMenu.style.display = isMenuOpen ? 'block' : 'none';
            
            // Update aria-expanded attribute for accessibility
            mobileMenuBtn.setAttribute('aria-expanded', isMenuOpen);
        });

        // Close menu on window resize if open
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && isMenuOpen) {
                mobileMenu.style.display = 'none';
                isMenuOpen = false;
                mobileMenuBtn.setAttribute('aria-expanded', false);
            }
        });
    }

    // Add card hover effect to skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.classList.add('card-hover');
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize code highlighting for markdown content
    const markdownContent = document.querySelector('.markdown-content');
    if (markdownContent) {
        const codeBlocks = markdownContent.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            Prism.highlightElement(block);
        });
    }

    // Add copy button to code blocks
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        
        const pre = block.parentNode;
        pre.style.position = 'relative';
        pre.appendChild(button);

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                button.textContent = 'Error';
            }
        });
    });

    // Add active state to current navigation link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-green-400');
        }
    });
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

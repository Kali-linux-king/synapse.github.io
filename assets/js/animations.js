// animations.js
class SynapseAnimations {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    if (!this.prefersReducedMotion) {
      this.setupFloatingElements();
      this.setupScrollAnimations();
      this.setupHoverEffects();
    }
  }

  setupFloatingElements() {
    document.querySelectorAll('.floating').forEach((el, i) => {
      const duration = 6 + (i * 0.3);
      el.style.animation = `float ${duration}s ease-in-out infinite`;
    });
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  setupHoverEffects() {
    // Button ripple effects
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        if (this.querySelector('.ripple')) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (typeof site !== 'undefined' && site.synapse.effects.floating) {
    new SynapseAnimations();
  }
});
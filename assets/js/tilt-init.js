// assets/js/tilt-init.js
/**
 * Initializes VanillaTilt.js for elements with [data-tilt] attribute
 * Only activates when:
 * - Tilt effects are enabled in config
 * - User hasn't prefers-reduced-motion
 * - Not on mobile devices
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if tilt effects should be enabled
  if (shouldEnableTilt()) {
    initializeTilt();
  }
});

function shouldEnableTilt() {
  // Check if tilt is disabled in config
  if (typeof site !== 'undefined' && 
      site.synapse && 
      site.synapse.effects && 
      site.synapse.effects.tilt_cards === false) {
    return false;
  }

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Disable on mobile devices
  if (window.innerWidth < 768) {
    return false;
  }

  // Check if tilt elements exist
  return document.querySelectorAll('[data-tilt]').length > 0;
}

function initializeTilt() {
  // Lazy load the library
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.2/vanilla-tilt.min.js';
  script.integrity = 'sha512-K9tDZvc8nQXR1DMuT97sCt9V40yXZfwMyXk7G0X/0xI2b9+Q2yfw==';
  script.crossOrigin = 'anonymous';
  script.referrerPolicy = 'no-referrer';

  script.onload = function() {
    // Configuration
    const tiltSettings = {
      max: getTiltIntensity(),
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      gyroscope: false, // Better performance
      scale: 1.02,
      perspective: 1000
    };

    // Initialize
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), tiltSettings);

    // Add accessibility attributes
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.setAttribute('aria-label', '3D tilt effect enabled');
    });
  };

  script.onerror = function() {
    console.warn('Failed to load VanillaTilt library');
  };

  document.body.appendChild(script);
}

function getTiltIntensity() {
  if (typeof site === 'undefined' || !site.synapse || !site.synapse.effects) {
    return 15; // Default
  }

  switch(site.synapse.effects.tilt_intensity) {
    case 'low': return 10;
    case 'high': return 20;
    default: return 15;
  }
}

// Fallback for dynamic content
document.addEventListener('turbolinks:load', function() {
  if (shouldEnableTilt() && typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: getTiltIntensity(),
      speed: 400,
      glare: true
    });
  }
});
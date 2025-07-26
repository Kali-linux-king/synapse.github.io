// _includes/particles-config.js
/**
 * Particles.js configuration for Synapse theme
 * Dynamically configurable via _config.yml
 */

document.addEventListener('DOMContentLoaded', function() {
  // Only proceed if particles container exists
  const particlesContainer = document.getElementById('particles-js');
  if (!particlesContainer || typeof particlesJS !== 'function') return;

  // Default configuration
  const defaultConfig = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#7c3aed" // Default purple
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        }
      },
      opacity: {
        value: 0.5,
        random: false
      },
      size: {
        value: 3,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#7c3aed",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out"
      }
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        }
      }
    }
  };

  // Merge with site config if available
  const finalConfig = mergeConfigs(defaultConfig);

  // Initialize particles
  particlesJS('particles-js', finalConfig);

  // Handle theme changes
  if (typeof site !== 'undefined' && site.synapse.dark_mode) {
    handleThemeChanges();
  }
});

/**
 * Merges default config with user settings from _config.yml
 */
function mergeConfigs(defaultConfig) {
  if (typeof site === 'undefined' || !site.synapse || !site.synapse.particles) {
    return defaultConfig;
  }

  const userConfig = site.synapse.particles;
  const merged = JSON.parse(JSON.stringify(defaultConfig));

  // Deep merge particle settings
  if (userConfig.density) {
    merged.particles.number.value = userConfig.density;
  }

  if (userConfig.color) {
    merged.particles.color.value = userConfig.color;
    merged.particles.line_linked.color = userConfig.color;
  }

  if (userConfig.line_color) {
    merged.particles.line_linked.color = userConfig.line_color;
  }

  if (userConfig.speed) {
    merged.particles.move.speed = userConfig.speed;
  }

  return merged;
}

/**
 * Handles dynamic theme changes
 */
function handleThemeChanges() {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function updateParticlesColor(isDark) {
    const color = isDark ? '#10b981' : '#7c3aed'; // Green for dark, purple for light
    if (window.pJSDom && window.pJSDom.length > 0) {
      pJSDom[0].pJS.particles.color.value = color;
      pJSDom[0].pJS.particles.line_linked.color = color;
      pJSDom[0].pJS.fn.particlesRefresh();
    }
  }

  // Initial setup
  updateParticlesColor(darkModeMediaQuery.matches);

  // Listen for changes
  darkModeMediaQuery.addListener((e) => {
    updateParticlesColor(e.matches);
  });
}
// particles-config.js
document.addEventListener('DOMContentLoaded', function() {
  if (typeof particlesJS !== 'function') return;

  const config = {
    particles: {
      number: { 
        value: 80,
        density: { 
          enable: true, 
          value_area: 800 
        }
      },
      color: { 
        value: "#7c3aed" 
      },
      shape: { 
        type: "circle" 
      },
      opacity: { 
        value: 0.5,
        random: true
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
        random: true,
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
  if (typeof site !== 'undefined' && site.synapse.particles) {
    Object.assign(config.particles, site.synapse.particles);
  }

  particlesJS('particles-js', config);
});
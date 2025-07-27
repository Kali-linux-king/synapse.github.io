// particles-config.js
// Advanced configuration for particles.js with multiple presets

const presets = {
  default: {
    particles: {
      number: {
        value: 60,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#4f46e5"
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nb_sides: 5
        }
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.3,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#4f46e5",
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.5
          }
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  },

  neural: {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 700
        }
      },
      color: {
        value: "#9333ea"
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.7,
        random: true
      },
      size: {
        value: 2,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 120,
        color: "#a855f7",
        opacity: 0.3,
        width: 1.5
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        out_mode: "bounce"
      }
    },
    interactivity: {
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        }
      }
    }
  },

  quantum: {
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          value_area: 600
        }
      },
      color: {
        value: "#3b82f6"
      },
      shape: {
        type: "triangle"
      },
      opacity: {
        value: 0.6,
        random: true
      },
      size: {
        value: 4,
        random: true
      },
      line_linked: {
        enable: false
      },
      move: {
        enable: true,
        speed: 3,
        direction: "top",
        straight: false,
        out_mode: "out"
      }
    }
  }
};

// Initialize with selected preset
function initParticles(elementId, presetName = 'default', customConfig = {}) {
  const presetConfig = presets[presetName] || presets.default;
  const config = deepMerge(presetConfig, customConfig);
  
  if (typeof particlesJS === 'function') {
    particlesJS(elementId, config);
  } else {
    console.warn('particles.js not loaded - loading now');
    loadParticlesJS().then(() => particlesJS(elementId, config));
  }
}

// Helper function to deep merge configurations
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] instanceof Object && key in target) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

// Dynamic loader for particles.js
function loadParticlesJS() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { presets, initParticles };
}
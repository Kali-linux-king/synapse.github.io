// assets/js/particles-config.js
/**
 * Quantum Particle Network Configuration
 * Advanced configuration with neural connection effects
 * Version 3.1 - With Entanglement Simulation
 */

const particlesConfig = {
  // Core Configuration
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: ["#00FF88", "#FF00AA", "#00AAFF"]
    },
    shape: {
      type: ["circle", "triangle", "polygon"],
      stroke: {
        width: 0,
        color: "#000000"
      },
      polygon: {
        nb_sides: 5
      }
    },
    opacity: {
      value: 0.7,
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
        size_min: 1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#00FF88",
      opacity: 0.4,
      width: 1,
      shadow: {
        enable: true,
        color: "#00FF88",
        blur: 5
      }
    },
    move: {
      enable: true,
      speed: 1.5,
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

  // Quantum Physics Simulation
  physics: {
    quantum: {
      enable: true,
      entanglement: {
        probability: 0.3,
        maxDistance: 200,
        color: "#00AAFF",
        width: 1.5
      },
      superposition: {
        enable: true,
        decoherenceTime: 5000
      }
    }
  },

  // Neural Network Effects
  neural: {
    enable: true,
    synapse: {
      firingRate: 0.05,
      neurotransmitter: {
        excitatory: "#00FF88",
        inhibitory: "#FF00AA"
      },
      pulseSpeed: 3,
      reuptakeTime: 1500
    },
    pathfinding: {
      enable: true,
      searchRadius: 250,
      pathColor: "#FFFFFF",
      pathOpacity: 0.2
    }
  },

  // Interaction Settings
  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: ["quantumEntanglement", "neuralPulse"],
        parallax: {
          enable: true,
          force: 30,
          smooth: 10
        }
      },
      onclick: {
        enable: true,
        mode: "wavefunctionCollapse"
      },
      resize: true
    },
    modes: {
      quantumEntanglement: {
        distance: 100,
        duration: 0.5,
        speed: 5,
        color: "#00AAFF",
        opacity: 0.8
      },
      neuralPulse: {
        enable: true,
        speed: 6,
        color: "#00FF88",
        minDistance: 50,
        maxDistance: 200,
        synapseDecay: 0.95
      },
      wavefunctionCollapse: {
        enable: true,
        area: 200,
        collapseSpeed: 10,
        spinUpColor: "#00FF88",
        spinDownColor: "#FF00AA"
      }
    }
  },

  // Custom Rendering
  rendering: {
    retina_detect: true,
    blendMode: "screen",
    filters: {
      enable: true,
      chromaticAberration: {
        enable: true,
        offset: 1.5
      },
      glow: {
        enable: true,
        color: "#00FF88",
        strength: 2,
        minDistance: 50
      }
    }
  },

  // Animation Loop Customization
  animation: {
    fps_limit: 60,
    sync: false,
    backgroundSync: true,
    quantumStates: true
  }
};

// Quantum Entanglement Extension
class QuantumParticlesExtension {
  constructor(particlesJS) {
    this.particlesJS = particlesJS;
    this.entangledPairs = new Map();
  }

  init() {
    this.particlesJS.particles.onClick = this.handleCollapse.bind(this);
    this.particlesJS.particles.onHover = this.handleObservation.bind(this);
    this.particlesJS.particles.onUpdate = this.updateEntanglements.bind(this);
  }

  handleCollapse(particle) {
    // Wavefunction collapse effect
    particle.spin = Math.random() > 0.5 ? 'up' : 'down';
    particle.color = particle.spin === 'up' ? '#00FF88' : '#FF00AA';
    
    // Collapse entangled partner
    if (this.entangledPairs.has(particle.id)) {
      const partnerId = this.entangledPairs.get(particle.id);
      const partner = this.particlesJS.particles.array.find(p => p.id === partnerId);
      if (partner) {
        partner.spin = particle.spin === 'up' ? 'down' : 'up';
        partner.color = partner.spin === 'up' ? '#00FF88' : '#FF00AA';
      }
    }
  }

  handleObservation(particle) {
    // Partial observation effect
    if (!particle.observed) {
      particle.originalColor = particle.color;
      particle.color = '#FFFFFF';
      particle.observed = true;
      
      setTimeout(() => {
        particle.color = particle.originalColor;
        particle.observed = false;
      }, 500);
    }
  }

  updateEntanglements() {
    // Create new entanglements based on configuration
    if (Math.random() < particlesConfig.physics.quantum.entanglement.probability) {
      const particles = this.particlesJS.particles.array;
      const available = particles.filter(p => !this.entangledPairs.has(p.id));
      
      if (available.length >= 2) {
        const p1 = available[Math.floor(Math.random() * available.length)];
        const p2 = available[Math.floor(Math.random() * available.length)];
        
        if (p1 !== p2 && this.calculateDistance(p1, p2) < 
            particlesConfig.physics.quantum.entanglement.maxDistance) {
          this.entangledPairs.set(p1.id, p2.id);
          this.entangledPairs.set(p2.id, p1.id);
          
          // Visual connection
          this.createEntanglementConnection(p1, p2);
        }
      }
    }
  }

  createEntanglementConnection(p1, p2) {
    const canvas = this.particlesJS.canvas.el;
    const connection = document.createElement('div');
    connection.className = 'quantum-connection';
    canvas.parentElement.appendChild(connection);
    
    const updateConnection = () => {
      if (!document.body.contains(connection)) return;
      
      const x1 = p1.x + canvas.offsetLeft;
      const y1 = p1.y + canvas.offsetTop;
      const x2 = p2.x + canvas.offsetLeft;
      const y2 = p2.y + canvas.offsetTop;
      
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1);
      
      connection.style.cssText = `
        position: absolute;
        left: ${x1}px;
        top: ${y1}px;
        width: ${length}px;
        height: 1px;
        background: linear-gradient(to right, 
          ${p1.color || '#00FF88'}, 
          ${p2.color || '#00AAFF'});
        transform-origin: 0 50%;
        transform: rotate(${angle}rad);
        opacity: 0.6;
        pointer-events: none;
        z-index: 1;
      `;
      
      requestAnimationFrame(updateConnection);
    };
    
    updateConnection();
  }

  calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
}

// Initialize with extended functionality
document.addEventListener('DOMContentLoaded', () => {
  // Load particles.js with our config
  if (typeof particlesJS !== 'undefined') {
    const particles = particlesJS('particles-js', particlesConfig);
    
    // Add quantum extensions
    const quantumExtension = new QuantumParticlesExtension(particles);
    quantumExtension.init();
    
    // Connect to neuromorphic system if available
    if (window.QNI?.neuromorphic) {
      connectToNeuromorphicSystem(particles);
    }
  }
});

// Neuromorphic System Integration
function connectToNeuromorphicSystem(particles) {
  const engine = window.QNI.neuromorphic;
  
  particles.particles.array.forEach(particle => {
    // Convert particles to simple neurons
    engine.registerNeuron(`particle-${particle.id}`, {
      firingThreshold: 0.8,
      neurotransmitter: {
        type: Math.random() > 0.7 ? 'GABA' : 'glutamate',
        strength: Math.random() * 0.5 + 0.5
      }
    });
    
    // Create synapses between nearby particles
    particles.particles.array.forEach(other => {
      if (particle !== other && 
          Math.random() < 0.1 && 
          quantumExtension.calculateDistance(particle, other) < 150) {
        engine.formSynapse(
          `particle-${particle.id}`,
          `particle-${other.id}`,
          Math.random() * 0.3 + 0.2
        );
      }
    });
  });
  
  // Update particle colors based on neural activity
  engine.neuralNetwork.forEach((neuron, id) => {
    if (id.startsWith('particle-')) {
      const particleId = parseInt(id.split('-')[1]);
      const particle = particles.particles.array.find(p => p.id === particleId);
      if (particle) {
        particle.color = neuron.membranePotential > 0.5 ? 
          '#00FF88' : '#FF00AA';
      }
    }
  });
}

// CSS for Particle Effects
const particleCSS = `
.quantum-connection {
  position: absolute;
  transform-origin: 0 50%;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.particle-ghost {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 255, 136, 0.3);
  pointer-events: none;
  z-index: 0;
  filter: blur(3px);
}

@keyframes quantum-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

.particles-js-canvas-el {
  z-index: 0 !important;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = particleCSS;
  document.head.appendChild(style);
}
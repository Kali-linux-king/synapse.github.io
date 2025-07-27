// assets/js/tilt-init.js
/**
 * Quantum Tilt Effect System
 * Advanced 3D Parallax with Neural Synchronization
 * Version 2.3 - With Wavefunction Collapse Response
 */

class QuantumTilt {
  constructor(options = {}) {
    this.options = {
      maxTilt: 15,               // Maximum tilt angle (degrees)
      perspective: 1500,         // CSS perspective value
      scale: 1.05,               // Hover scale effect
      speed: 300,                // Transition speed (ms)
      axis: 'all',               // 'x', 'y', or 'all'
      quantumResponse: 0.7,      // How much quantum states affect tilt
      neuralSync: true,          // Whether to sync with neuromorphic pulses
      glare: true,               // Enable quantum glare effect
      maxGlare: 0.2,             // Maximum glare opacity
      ...options
    };

    this.tiltElements = new Map();
    this.quantumStates = new WeakMap();
    this.neuralOscillators = new WeakMap();
    this.init();
  }

  init() {
    // Auto-initialize elements with data-tilt attribute
    document.querySelectorAll('[data-tilt]').forEach(el => {
      this.add(el, {
        ...this.options,
        ...el.dataset // Allow per-element overrides
      });
    });

    // Connect to quantum system if available
    if (window.QNI) {
      this.connectToQuantumSystem();
    }

    // Setup neural sync if enabled
    if (this.options.neuralSync && window.QNI?.neuromorphic) {
      this.connectToNeuromorphicSystem();
    }
  }

  add(element, settings = {}) {
    const config = { ...this.options, ...settings };
    const state = {
      config,
      mousePosition: { x: 0, y: 0 },
      currentTilt: { x: 0, y: 0 },
      targetTilt: { x: 0, y: 0 },
      isActive: false,
      quantumInfluence: 0,
      neuralPhase: 0
    };

    this.tiltElements.set(element, state);

    // Prepare element
    element.style.transformStyle = 'preserve-3d';
    element.style.willChange = 'transform';
    element.style.transition = `transform ${config.speed}ms ease-out`;

    // Add glare effect if enabled
    if (config.glare) {
      this.addGlareEffect(element);
    }

    // Event listeners
    element.addEventListener('mousemove', this.onMouseMove.bind(this, element));
    element.addEventListener('mouseenter', this.onMouseEnter.bind(this, element));
    element.addEventListener('mouseleave', this.onMouseLeave.bind(this, element));

    // Initialize quantum state if element is a quantum node
    if (element.hasAttribute('data-q-node')) {
      this.quantumStates.set(element, {
        spin: 'superposition',
        influence: 0
      });
    }

    // Start animation loop for this element
    this.animate(element);
  }

  addGlareEffect(element) {
    const glare = document.createElement('div');
    glare.className = 'quantum-glare';
    glare.style.position = 'absolute';
    glare.style.top = '0';
    glare.style.left = '0';
    glare.style.width = '100%';
    glare.style.height = '100%';
    glare.style.pointerEvents = 'none';
    glare.style.opacity = '0';
    glare.style.background = `linear-gradient(
      135deg, 
      rgba(255,255,255,0.8) 0%, 
      rgba(0,255,136,0.5) 50%, 
      transparent 100%
    )`;
    glare.style.transition = 'opacity 0.3s ease';
    glare.style.zIndex = '1';
    element.appendChild(glare);
  }

  onMouseMove(element, event) {
    const state = this.tiltElements.get(element);
    if (!state) return;

    const rect = element.getBoundingClientRect();
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Get mouse position relative to element center
    state.mousePosition.x = (event.clientX - rect.left) / width - 0.5;
    state.mousePosition.y = (event.clientY - rect.top) / height - 0.5;

    // Calculate target tilt
    state.targetTilt = {
      x: -state.mousePosition.y * state.config.maxTilt * 2,
      y: state.mousePosition.x * state.config.maxTilt * 2
    };

    // Apply quantum influence
    const quantumState = this.quantumStates.get(element);
    if (quantumState && quantumState.spin !== 'superposition') {
      const spinEffect = quantumState.spin === 'up' ? 1 : -1;
      state.targetTilt.x += spinEffect * quantumState.influence * 10;
      state.targetTilt.y += (Math.random() - 0.5) * quantumState.influence * 8;
    }

    // Update glare position
    if (state.config.glare) {
      const glare = element.querySelector('.quantum-glare');
      if (glare) {
        glare.style.opacity = Math.min(
          state.config.maxGlare,
          (Math.abs(state.mousePosition.x) + Math.abs(state.mousePosition.y)) / 2
        ).toString();
        glare.style.transform = `translate(${
          state.mousePosition.x * 50}%, ${
          state.mousePosition.y * 50}%)`;
      }
    }
  }

  onMouseEnter(element) {
    const state = this.tiltElements.get(element);
    if (!state) return;

    state.isActive = true;
    element.style.transition = `transform ${state.config.speed}ms ease-out`;
    element.style.zIndex = '10';
    element.style.willChange = 'transform';

    // Trigger quantum observation if linked
    if (element.hasAttribute('data-q-node') && window.QNI) {
      const nodeId = element.getAttribute('data-q-node');
      window.QNI.handleObservation(nodeId);
    }
  }

  onMouseLeave(element) {
    const state = this.tiltElements.get(element);
    if (!state) return;

    state.isActive = false;
    state.targetTilt = { x: 0, y: 0 };
    element.style.transition = `transform ${state.config.speed * 1.5}ms ease-out`;
    element.style.zIndex = '';

    // Reset glare
    if (state.config.glare) {
      const glare = element.querySelector('.quantum-glare');
      if (glare) glare.style.opacity = '0';
    }
  }

  animate(element) {
    const state = this.tiltElements.get(element);
    if (!state) return;

    // Apply neural oscillation if enabled
    if (state.config.neuralSync) {
      const oscillator = this.neuralOscillators.get(element) || {
        phase: 0,
        frequency: 0.5 + Math.random()
      };
      oscillator.phase += 0.01 * oscillator.frequency;
      state.neuralPhase = Math.sin(oscillator.phase) * 0.3;
      this.neuralOscillators.set(element, oscillator);
    }

    // Smoothly interpolate current tilt toward target
    const inertia = state.isActive ? 0.2 : 0.05;
    state.currentTilt.x += (state.targetTilt.x - state.currentTilt.x) * inertia;
    state.currentTilt.y += (state.targetTilt.y - state.currentTilt.y) * inertia;

    // Apply the transform
    const scale = state.isActive ? state.config.scale + state.neuralPhase : 1.0;
    const transform = `
      perspective(${state.config.perspective}px)
      rotateX(${state.config.axis !== 'y' ? state.currentTilt.x : 0}deg)
      rotateY(${state.config.axis !== 'x' ? state.currentTilt.y : 0}deg)
      scale3d(${scale}, ${scale}, ${scale})
    `;

    element.style.transform = transform;

    // Continue animation loop
    requestAnimationFrame(() => this.animate(element));
  }

  connectToQuantumSystem() {
    // Listen to quantum collapse events
    document.addEventListener('quantumCollapse', (e) => {
      const element = e.target;
      if (this.tiltElements.has(element)) {
        const state = this.tiltElements.get(element);
        const quantumState = this.quantumStates.get(element) || {};
        
        quantumState.spin = e.detail.finalState.spin;
        quantumState.influence = 1.0;
        this.quantumStates.set(element, quantumState);

        // Trigger collapse animation
        this.triggerCollapseEffect(element, e.detail.finalState);
      }
    });

    // Decay quantum influence over time
    setInterval(() => {
      this.quantumStates.forEach((state, element) => {
        state.influence *= 0.95;
        this.quantumStates.set(element, state);
      });
    }, 100);
  }

  connectToNeuromorphicSystem() {
    const neuromorphic = window.QNI.neuromorphic;

    // Sync with neural firing events
    document.addEventListener('neuronFired', (e) => {
      const element = e.target;
      if (this.tiltElements.has(element)) {
        const oscillator = this.neuralOscillators.get(element) || {
          phase: 0,
          frequency: 0.5 + Math.random()
        };
        oscillator.phase = Math.PI; // Kick the oscillator
        this.neuralOscillators.set(element, oscillator);
      }
    });
  }

  triggerCollapseEffect(element, finalState) {
    const state = this.tiltElements.get(element);
    if (!state) return;

    // Impulse based on collapse state
    const spinDirection = finalState.spin === 'up' ? 1 : -1;
    state.targetTilt.x += spinDirection * 15;
    state.targetTilt.y += (Math.random() - 0.5) * 10;

    // Visual flash
    element.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
    element.style.boxShadow = `0 0 ${
      finalState.spin === 'up' ? '20px 5px rgba(0, 255, 136, 0.7)' 
                              : '20px 5px rgba(255, 0, 170, 0.7)'
    }`;

    setTimeout(() => {
      element.style.transition = `transform ${state.config.speed}ms ease-out`;
      element.style.boxShadow = '';
    }, 300);
  }
}

// CSS for Tilt Effects
const tiltCSS = `
[data-tilt] {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out, box-shadow 0.3s ease;
  will-change: transform;
}

.quantum-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    135deg, 
    rgba(255,255,255,0.8) 0%, 
    rgba(0,255,136,0.5) 50%, 
    transparent 100%
  );
  transition: opacity 0.3s ease;
  z-index: 1;
}

.tilt-collapse {
  animation: tiltCollapse 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tiltCollapse {
  0% { transform: perspective(1500px) rotateX(0) rotateY(0) scale3d(1, 1, 1); }
  50% { transform: perspective(1500px) rotateX(15deg) rotateY(15deg) scale3d(1.1, 1.1, 1.1); }
  100% { transform: perspective(1500px) rotateX(0) rotateY(0) scale3d(1, 1, 1); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tiltCSS;
  document.head.appendChild(style);
}

// Initialize automatically
document.addEventListener('DOMContentLoaded', () => {
  window.QuantumTilt = new QuantumTilt({
    maxTilt: 20,
    perspective: 2000,
    quantumResponse: 0.8,
    neuralSync: true
  });
});
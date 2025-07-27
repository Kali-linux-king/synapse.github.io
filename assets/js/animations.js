// assets/js/animations.js
/**
 * Advanced Animation Engine
 * Quantum-Inspired Motion System with Neural Synchronization
 * Version 3.2 - With Wavefunction Collapse Triggers
 */

class SynapseAnimations {
  constructor(qniInstance, options = {}) {
    this.qni = qniInstance || window.QNI;
    this.options = {
      quantumInfluence: 0.7,      // How much quantum states affect animations
      neuralSyncRate: 0.05,       // How quickly animations sync with neural pulses
      motionDecay: 0.96,          // Motion persistence over time
      ...options
    };

    this.animatedElements = new Map();
    this.neuralOscillators = new WeakMap();
    this.quantumStates = new WeakMap();
    this.initAnimationSystem();
  }

  initAnimationSystem() {
    // Connect to quantum nodes if QNI exists
    if (this.qni) {
      document.querySelectorAll('[data-q-node]').forEach(el => {
        this.registerQuantumElement(el);
      });

      // Watch for quantum collapse events
      document.addEventListener('quantumCollapse', (e) => {
        const target = e.target;
        if (this.animatedElements.has(target)) {
          this.triggerCollapseAnimation(target, e.detail.finalState);
        }
      });
    }

    // Setup intersection observer for performance
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        if (this.animatedElements.has(element)) {
          const data = this.animatedElements.get(element);
          data.isVisible = entry.isIntersecting;
          data.intersectionRatio = entry.intersectionRatio;
        }
      });
    }, { threshold: [0, 0.1, 0.5, 1] });

    // Start animation loop
    this.animationFrame = requestAnimationFrame(() => this.animationLoop());
  }

  registerAnimation(element, config = {}) {
    const animationId = `anim-${Date.now()}`;
    const defaultConfig = {
      type: 'float',
      frequency: 0.5,
      amplitude: 5,
      phase: Math.random() * Math.PI * 2,
      neuralSync: false,
      quantumLink: element.hasAttribute('data-q-node'),
      ...config
    };

    // Initialize element state
    const elementState = {
      config: defaultConfig,
      currentOffset: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      isVisible: false,
      intersectionRatio: 0
    };

    this.animatedElements.set(element, elementState);
    this.intersectionObserver.observe(element);

    // Initialize neural oscillator if needed
    if (defaultConfig.neuralSync) {
      this.initNeuralOscillator(element);
    }

    // Register with QNI if quantum-linked
    if (defaultConfig.quantumLink && this.qni) {
      this.registerQuantumElement(element);
    }

    return animationId;
  }

  initNeuralOscillator(element) {
    const oscillator = {
      phase: Math.random() * Math.PI * 2,
      frequency: 0.5 + Math.random() * 2,
      lastPulse: 0,
      amplitude: 1
    };

    this.neuralOscillators.set(element, oscillator);

    // Listen to neuron events
    element.addEventListener('neuronFired', (e) => {
      oscillator.lastPulse = performance.now();
      oscillator.amplitude = 1.5;
    });
  }

  registerQuantumElement(element) {
    const nodeId = element.getAttribute('data-q-node');
    if (!nodeId || !this.qni) return;

    const quantumState = {
      influence: 0,
      lastSpin: 'up',
      entanglementPhase: 0
    };

    this.quantumStates.set(element, quantumState);

    // Listen to quantum events
    element.addEventListener('quantumObservation', (e) => {
      quantumState.influence = 1.0;
    });

    element.addEventListener('quantumCollapse', (e) => {
      quantumState.lastSpin = e.detail.finalState.spin;
      this.triggerCollapseAnimation(element, e.detail.finalState);
    });
  }

  animationLoop() {
    const now = performance.now();
    const time = now * 0.001;

    this.animatedElements.forEach((state, element) => {
      if (!state.isVisible) return;

      // Calculate base motion
      const baseMotion = this.calculateBaseMotion(time, state);

      // Apply neural sync if enabled
      const neuralMotion = state.config.neuralSync ? 
        this.calculateNeuralMotion(now, element) : { x: 0, y: 0, z: 0 };

      // Apply quantum influence if linked
      const quantumMotion = state.config.quantumLink ?
        this.calculateQuantumMotion(element) : { x: 0, y: 0, z: 0 };

      // Combine motions with weights
      const combinedMotion = {
        x: baseMotion.x * (1 - this.options.quantumInfluence) + 
           quantumMotion.x * this.options.quantumInfluence +
           neuralMotion.x * this.options.neuralSyncRate,
        y: baseMotion.y * (1 - this.options.quantumInfluence) + 
           quantumMotion.y * this.options.quantumInfluence +
           neuralMotion.y * this.options.neuralSyncRate,
        z: baseMotion.z * (1 - this.options.quantumInfluence) + 
           quantumMotion.z * this.options.quantumInfluence +
           neuralMotion.z * this.options.neuralSyncRate
      };

      // Apply motion with inertia
      state.velocity.x = (state.velocity.x * this.options.motionDecay) + 
                         (combinedMotion.x * (1 - this.options.motionDecay));
      state.velocity.y = (state.velocity.y * this.options.motionDecay) + 
                         (combinedMotion.y * (1 - this.options.motionDecay));
      state.velocity.z = (state.velocity.z * this.options.motionDecay) + 
                         (combinedMotion.z * (1 - this.options.motionDecay));

      state.currentOffset.x += state.velocity.x;
      state.currentOffset.y += state.velocity.y;
      state.currentOffset.z += state.velocity.z;

      // Apply transform
      this.applyTransform(element, state);
    });

    this.animationFrame = requestAnimationFrame(() => this.animationLoop());
  }

  calculateBaseMotion(time, state) {
    const { frequency, amplitude, phase, type } = state.config;

    switch(type) {
      case 'float':
        return {
          x: Math.sin(time * frequency * 0.5 + phase) * amplitude,
          y: Math.cos(time * frequency * 0.3 + phase) * amplitude,
          z: Math.sin(time * frequency * 0.7 + phase) * amplitude * 0.5
        };

      case 'pulse':
        const pulse = Math.sin(time * frequency * 2 + phase) * 0.5 + 0.5;
        return {
          x: 0,
          y: 0,
          z: pulse * amplitude
        };

      case 'orbit':
        return {
          x: Math.sin(time * frequency + phase) * amplitude,
          y: Math.cos(time * frequency + phase) * amplitude,
          z: 0
        };

      default:
        return { x: 0, y: 0, z: 0 };
    }
  }

  calculateNeuralMotion(now, element) {
    const oscillator = this.neuralOscillators.get(element);
    if (!oscillator) return { x: 0, y: 0, z: 0 };

    // Oscillator dynamics
    const timeSincePulse = now - oscillator.lastPulse;
    oscillator.amplitude = Math.max(1, oscillator.amplitude * 0.95);
    oscillator.phase += oscillator.frequency * 0.01;

    // Calculate neural wave
    const neuralWave = Math.sin(oscillator.phase) * oscillator.amplitude;

    return {
      x: neuralWave * 2,
      y: Math.cos(oscillator.phase * 0.7) * neuralWave,
      z: 0
    };
  }

  calculateQuantumMotion(element) {
    const quantumState = this.quantumStates.get(element);
    if (!quantumState) return { x: 0, y: 0, z: 0 };

    // Decay quantum influence
    quantumState.influence *= 0.95;

    // Spin-dependent motion
    const spinEffect = quantumState.lastSpin === 'up' ? 1 : -1;

    return {
      x: Math.random() * spinEffect * quantumState.influence * 10,
      y: (Math.random() - 0.5) * quantumState.influence * 8,
      z: spinEffect * quantumState.influence * 5
    };
  }

  applyTransform(element, state) {
    const { currentOffset, intersectionRatio } = state;
    const visibilityScale = 0.5 + intersectionRatio * 0.5;

    element.style.transform = `
      translate3d(
        ${currentOffset.x * visibilityScale}px, 
        ${currentOffset.y * visibilityScale}px, 
        ${currentOffset.z * visibilityScale}px
      )
      rotateX(${currentOffset.y * 0.1}deg)
      rotateY(${currentOffset.x * 0.1}deg)
    `;

    // Apply quantum influence visual feedback
    if (state.config.quantumLink) {
      const quantumState = this.quantumStates.get(element);
      if (quantumState) {
        element.style.filter = `
          drop-shadow(0 0 ${quantumState.influence * 5}px 
          ${quantumState.lastSpin === 'up' ? '#00ff88' : '#ff0066'})
        `;
      }
    }
  }

  triggerCollapseAnimation(element, finalState) {
    if (!this.animatedElements.has(element)) return;

    const state = this.animatedElements.get(element);
    const spinDirection = finalState.spin === 'up' ? 1 : -1;

    // Impulse based on collapse state
    state.velocity.x += (Math.random() - 0.5) * 20 * spinDirection;
    state.velocity.y += Math.random() * 15 * spinDirection;
    state.velocity.z += (Math.random() + 0.5) * 10 * spinDirection;

    // Visual flash
    element.style.transition = 'box-shadow 0.3s ease-out';
    element.style.boxShadow = `0 0 ${
      finalState.spin === 'up' ? '20px 5px #00ff88' : '20px 5px #ff0066'
    }`;
    
    setTimeout(() => {
      element.style.transition = 'box-shadow 1.5s ease-out';
      element.style.boxShadow = 'none';
    }, 300);
  }

  connectToNeuromorphic(neuromorphicEngine) {
    // Sync animations with neural firing patterns
    neuromorphicEngine.neuralNetwork.forEach((neuron, nodeId) => {
      const element = neuromorphicEngine.qni.quantumNodes.get(nodeId)?.element;
      if (element && this.animatedElements.has(element)) {
        this.initNeuralOscillator(element);
      }
    });
  }
}

// CSS for Animation Effects
const animationCSS = `
[data-animated] {
  transition: transform 0.1s ease-out, filter 0.3s ease;
  transform-style: preserve-3d;
  will-change: transform, filter;
}

.quantum-fluctuation {
  animation: quantum-fluctuation 3s infinite alternate;
}

@keyframes quantum-fluctuation {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

.neural-pulse {
  animation: neural-pulse 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes neural-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationCSS;
  document.head.appendChild(style);
}

// Initialize automatically if in browser
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SynapseAnimations = new SynapseAnimations(window.QNI, {
      quantumInfluence: 0.8,
      neuralSyncRate: 0.1
    });

    // Auto-animate elements with data-animated attribute
    document.querySelectorAll('[data-animated]').forEach(el => {
      const type = el.getAttribute('data-animated') || 'float';
      window.SynapseAnimations.registerAnimation(el, {
        type,
        amplitude: parseInt(el.getAttribute('data-amplitude')) || 5,
        frequency: parseFloat(el.getAttribute('data-frequency')) || 0.5,
        neuralSync: el.hasAttribute('data-neural-sync'),
        quantumLink: el.hasAttribute('data-q-node')
      });
    });

    // Connect to neuromorphic engine if available
    if (window.QNI?.neuromorphic) {
      window.SynapseAnimations.connectToNeuromorphic(window.QNI.neuromorphic);
    }
  });
}
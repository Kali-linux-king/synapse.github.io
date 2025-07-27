// assets/js/quantum/decoherence.js
/**
 * Quantum Decoherence Engine
 * Simulates environmental interaction and quantum state degradation
 * Version 2.3 - With Non-Markovian Dynamics
 */

class QuantumDecoherence {
  constructor(qniInstance, options = {}) {
    this.qni = qniInstance;
    this.options = {
      baseDecoherenceRate: 0.001,  // Base probability per ms
      temperatureFactor: 0.01,     // Environmental noise scaling
      nonMarkovianity: 0.3,        // 0 = pure Markovian, 1 = strong memory effects
      ...options
    };

    this.environment = {
      temperature: 300,            // Kelvin (simulated)
      noiseProfile: this.generateNoiseSpectrum(),
      measurementBackaction: 0.05
    };

    this.decoherenceTimers = new WeakMap();
    this.interactionHistory = new WeakMap();
    this.initEnvironmentMonitoring();
  }

  initEnvironmentMonitoring() {
    // Simulate environmental fluctuations
    this.environmentInterval = setInterval(() => {
      this.environment.temperature = 300 + (Math.sin(Date.now()/60000) * 50);
      this.updateDecoherenceRates();
    }, 5000);

    // Device motion affects decoherence
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (e) => {
        const acceleration = Math.sqrt(
          e.acceleration.x**2 + 
          e.acceleration.y**2 + 
          e.acceleration.z**2
        );
        this.environment.measurementBackaction = Math.min(0.2, acceleration/20);
      });
    }

    // Start decoherence simulation
    this.updateDecoherenceRates();
  }

  generateNoiseSpectrum() {
    // Generate colored noise profile
    const spectrum = new Float32Array(256);
    for (let i = 0; i < spectrum.length; i++) {
      // 1/f noise characteristics
      spectrum[i] = (0.5 / (i + 1)) * Math.random();
    }
    return spectrum;
  }

  updateDecoherenceRates() {
    // Adjust rates based on environment
    const tempFactor = 1 + (this.environment.temperature - 300) * this.options.temperatureFactor;
    this.currentDecoherenceRate = this.options.baseDecoherenceRate * tempFactor;

    // Update all active nodes
    this.qni.quantumNodes.forEach((node, nodeId) => {
      this.scheduleDecoherence(nodeId);
    });
  }

  scheduleDecoherence(nodeId) {
    const node = this.qni.quantumNodes.get(nodeId);
    if (!node || !node.state.superposition) return;

    // Clear existing timer
    if (this.decoherenceTimers.has(node.element)) {
      clearTimeout(this.decoherenceTimers.get(node.element));
    }

    // Calculate decoherence time with noise
    const coherenceTime = this.calculateCoherenceTime(node);
    const timer = setTimeout(() => {
      this.applyDecoherence(nodeId);
    }, coherenceTime);

    this.decoherenceTimers.set(node.element, timer);
    this.visualizeDecoherence(node.element, coherenceTime);
  }

  calculateCoherenceTime(node) {
    // Base time modified by environment and history
    let baseTime = 1000 / this.currentDecoherenceRate;

    // Non-Markovian memory effects
    const history = this.interactionHistory.get(node.element) || { count: 0, lastTime: 0 };
    const memoryFactor = 1 - (this.options.nonMarkovianity * (history.count / (history.count + 5)));

    // Quantum Zeno effect (frequent observation slows decoherence)
    const zenoFactor = node.state.observationCount ? 1 + Math.log10(node.state.observationCount + 1) : 1;

    // Apply noise fluctuations
    const noiseIndex = Date.now() % this.environment.noiseProfile.length;
    const noiseFactor = 1 + (this.environment.noiseProfile[noiseIndex] * 2 - 1);

    return (baseTime * memoryFactor * zenoFactor * noiseFactor) / 1000;
  }

  applyDecoherence(nodeId) {
    const node = this.qni.quantumNodes.get(nodeId);
    if (!node) return;

    // Decoherence effects
    if (Math.random() < this.environment.measurementBackaction) {
      // Quantum jump (sudden collapse)
      this.qni.collapseWaveFunction(nodeId);
      node.element.dispatchEvent(new CustomEvent('quantumJump', {
        detail: { type: 'environmentalMeasurement' }
      }));
    } else {
      // Phase damping (gradual decoherence)
      node.state.phase += (Math.random() - 0.5) * Math.PI/4;
      node.state.amplitude *= 0.9;
      node.element.style.setProperty('--quantum-coherence', node.state.amplitude);

      if (node.state.amplitude < 0.3) {
        this.qni.collapseWaveFunction(nodeId);
      } else {
        this.scheduleDecoherence(nodeId);
      }

      node.element.dispatchEvent(new CustomEvent('phaseDamping', {
        detail: { newAmplitude: node.state.amplitude }
      }));
    }

    // Update interaction history
    const history = this.interactionHistory.get(node.element) || { count: 0, lastTime: 0 };
    history.count++;
    history.lastTime = Date.now();
    this.interactionHistory.set(node.element, history);
  }

  visualizeDecoherence(element, coherenceTime) {
    // Create/update decoherence visualization
    let indicator = element.querySelector('.decoherence-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'decoherence-indicator';
      element.appendChild(indicator);
    }

    // Animate based on coherence time
    indicator.style.animation = `decoherence ${coherenceTime}ms linear forwards`;
    
    // Add environmental noise visualization
    if (!element.querySelector('.noise-particles')) {
      const noise = document.createElement('div');
      noise.className = 'noise-particles';
      element.appendChild(noise);
    }
  }

  applyDephasing(nodeId, strength) {
    const node = this.qni.quantumNodes.get(nodeId);
    if (!node) return;

    // Rotate phase by random amount proportional to strength
    node.state.phase += (Math.random() - 0.5) * strength * Math.PI;
    node.element.style.setProperty('--quantum-phase', `${node.state.phase}rad`);

    // Trigger dephasing event
    node.element.dispatchEvent(new CustomEvent('phaseScramble', {
      detail: { strength }
    }));
  }

  resetEnvironment() {
    // Return to baseline conditions
    this.environment = {
      temperature: 300,
      noiseProfile: this.generateNoiseSpectrum(),
      measurementBackaction: 0.05
    };
    this.updateDecoherenceRates();
  }
}

// CSS for Decoherence Effects (add to _quantum.scss)
const decoherenceCSS = `
.decoherence-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #00ff88, #ff0066);
  transform-origin: 0 50%;
  transform: scaleX(0);
  z-index: 100;
}

@keyframes decoherence {
  to { transform: scaleX(1); }
}

.noise-particles {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, 
    rgba(255,255,255,0.02) 0%, 
    transparent 70%);
  pointer-events: none;
  z-index: 99;
}

.phase-scramble {
  animation: phaseDistortion 0.5s cubic-bezier(0.3, 0, 0.7, 1) infinite;
}

@keyframes phaseDistortion {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(45deg); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = decoherenceCSS;
  document.head.appendChild(style);
}

// Export pattern matching other quantum modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumDecoherence;
} else if (window.QNI) {
  // Auto-attach to QNI if available
  window.QNI.decoherence = new QuantumDecoherence(window.QNI);
}
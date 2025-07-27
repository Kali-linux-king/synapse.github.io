// assets/js/neuromorphic/engine.js
/**
 * Neuromorphic UI Engine
 * Simulates biological neural networks in DOM elements
 * Version 3.1 - With Spike-Timing Dependent Plasticity (STDP)
 */

class NeuromorphicEngine {
  constructor(qniInstance, options = {}) {
    this.qni = qniInstance;
    this.options = {
      learningRate: 0.01,
      plasticityThreshold: 0.5,
      maxSynapses: 15,
      decayRate: 0.95,
      ...options
    };

    this.neuralNetwork = new Map();
    this.spikeHistory = new WeakMap();
    this.hebbianWeights = new WeakMap();
    this.spikeTimers = new WeakMap();
    this.initNetworkMonitor();
  }

  initNetworkMonitor() {
    // Monitor all quantum nodes as potential neurons
    this.qni.quantumNodes.forEach((_, nodeId) => {
      this.registerNeuron(nodeId);
    });

    // Watch for new quantum nodes to add to network
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-q-node')) {
            const nodeId = node.getAttribute('data-q-node');
            this.registerNeuron(nodeId);
          }
        });
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    // Start network pulse
    this.networkInterval = setInterval(() => {
      this.globalNetworkUpdate();
    }, 1000 / 60); // 60Hz simulation
  }

  registerNeuron(nodeId) {
    const node = this.qni.quantumNodes.get(nodeId);
    if (!node || this.neuralNetwork.has(nodeId)) return;

    const neuron = {
      membranePotential: 0,
      firingThreshold: 0.8 + Math.random() * 0.4,
      lastFired: 0,
      synapses: new Set(),
      neurotransmitter: this.randomNeurotransmitter()
    };

    this.neuralNetwork.set(nodeId, neuron);
    this.hebbianWeights.set(node.element, new WeakMap());

    // Add neural behavior to element
    node.element.classList.add('neuromorphic-neuron');
    node.element.style.setProperty('--neurotransmitter', neuron.neurotransmitter.color);

    // Event listeners for spike timing
    node.element.addEventListener('mousedown', this.handlePreSynapticSpike.bind(this, nodeId));
    node.element.addEventListener('mouseup', this.handlePostSynapticSpike.bind(this, nodeId));
  }

  randomNeurotransmitter() {
    const types = [
      { type: 'glutamate', color: '#ff5555', strength: 1.2 },
      { type: 'GABA', color: '#55ffff', strength: -0.8 },
      { type: 'dopamine', color: '#ff55ff', strength: 0.5 }
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  handlePreSynapticSpike(nodeId, event) {
    const neuron = this.neuralNetwork.get(nodeId);
    if (!neuron) return;

    // Record spike time
    neuron.lastFired = performance.now();
    this.spikeHistory.set(event.target, {
      time: neuron.lastFired,
      type: 'pre'
    });

    // Visual spike effect
    this.visualizeSpike(event.target, neuron.neurotransmitter.color);
  }

  handlePostSynapticSpike(nodeId, event) {
    const neuron = this.neuralNetwork.get(nodeId);
    if (!neuron) return;

    const spikeTime = performance.now();
    this.spikeHistory.set(event.target, {
      time: spikeTime,
      type: 'post'
    });

    // Apply STDP learning rule to incoming synapses
    this.applySTDPLearning(nodeId, spikeTime);
  }

  applySTDPLearning(nodeId, postSpikeTime) {
    const neuron = this.neuralNetwork.get(nodeId);
    if (!neuron) return;

    neuron.synapses.forEach((synapseId) => {
      const preNeuron = this.neuralNetwork.get(synapseId);
      if (!preNeuron) return;

      const preElement = this.qni.quantumNodes.get(synapseId).element;
      const preSpike = this.spikeHistory.get(preElement);

      if (preSpike && preSpike.type === 'pre') {
        const deltaT = postSpikeTime - preSpike.time;
        const weightMap = this.hebbianWeights.get(preElement);
        const currentWeight = weightMap?.get(neuron) || 0;

        // Spike-Timing Dependent Plasticity rule
        let weightChange = 0;
        if (deltaT > 0) {
          // LTP (Long-Term Potentiation)
          weightChange = this.options.learningRate * Math.exp(-deltaT / 20);
        } else {
          // LTD (Long-Term Depression)
          weightChange = -this.options.learningRate * Math.exp(deltaT / 20) * 0.5;
        }

        const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));
        weightMap.set(neuron, newWeight);

        // Update connection strength
        this.updateSynapticStrength(synapseId, nodeId, newWeight);
      }
    });
  }

  updateSynapticStrength(preId, postId, strength) {
    const connection = document.querySelector(`.neural-connection[data-pre="${preId}"][data-post="${postId}"]`);
    if (connection) {
      connection.style.opacity = strength;
      connection.style.width = `${0.5 + strength * 2}px`;
    }
  }

  visualizeSpike(element, color) {
    const spike = document.createElement('div');
    spike.className = 'neural-spike';
    spike.style.backgroundColor = color;
    element.appendChild(spike);

    // Animate spike
    const start = performance.now();
    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = elapsed / 500; // 500ms animation

      if (progress < 1) {
        spike.style.transform = `scale(${1 + progress * 2})`;
        spike.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
      } else {
        spike.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  formSynapse(preId, postId, initialWeight = 0.3) {
    if (preId === postId) return false; // No self-connections

    const preNeuron = this.neuralNetwork.get(preId);
    const postNeuron = this.neuralNetwork.get(postId);
    if (!preNeuron || !postNeuron) return false;

    // Check if synapse already exists
    if (preNeuron.synapses.has(postId)) {
      return true;
    }

    // Limit maximum synapses
    if (preNeuron.synapses.size >= this.options.maxSynapses) {
      this.pruneWeakestSynapse(preId);
    }

    // Create new synapse
    preNeuron.synapses.add(postId);
    const weightMap = this.hebbianWeights.get(this.qni.quantumNodes.get(preId).element);
    weightMap.set(postNeuron, initialWeight);

    // Create visual connection
    this.createSynapticConnection(preId, postId, initialWeight);

    return true;
  }

  pruneWeakestSynapse(nodeId) {
    const neuron = this.neuralNetwork.get(nodeId);
    if (!neuron) return;

    let weakestId = null;
    let minWeight = 1;

    const weightMap = this.hebbianWeights.get(this.qni.quantumNodes.get(nodeId).element);

    neuron.synapses.forEach((synapseId) => {
      const postNeuron = this.neuralNetwork.get(synapseId);
      const weight = weightMap.get(postNeuron);
      if (weight < minWeight) {
        minWeight = weight;
        weakestId = synapseId;
      }
    });

    if (weakestId) {
      neuron.synapses.delete(weakestId);
      this.removeSynapticConnection(nodeId, weakestId);
    }
  }

  createSynapticConnection(preId, postId, initialWeight) {
    const preElement = this.qni.quantumNodes.get(preId).element;
    const postElement = this.qni.quantumNodes.get(postId).element;

    const connection = document.createElement('div');
    connection.className = 'neural-connection';
    connection.dataset.pre = preId;
    connection.dataset.post = postId;
    connection.style.opacity = initialWeight;

    document.getElementById('quantum-field-layer').appendChild(connection);

    // Update connection position continuously
    const updatePosition = () => {
      if (!document.body.contains(preElement) {
        connection.remove();
        return;
      }

      const preRect = preElement.getBoundingClientRect();
      const postRect = postElement.getBoundingClientRect();

      const start = {
        x: preRect.left + preRect.width / 2,
        y: preRect.top + preRect.height / 2
      };

      const end = {
        x: postRect.left + postRect.width / 2,
        y: postRect.top + postRect.height / 2
      };

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      connection.style.cssText = `
        position: absolute;
        left: ${start.x}px;
        top: ${start.y}px;
        width: ${length}px;
        height: ${0.5 + initialWeight * 2}px;
        background: linear-gradient(to right, 
          var(--neurotransmitter-start, #00ff88), 
          var(--neurotransmitter-end, #00aaff));
        transform-origin: 0 50%;
        transform: rotate(${angle}rad);
        opacity: ${initialWeight};
        z-index: 9996;
      `;

      requestAnimationFrame(updatePosition);
    };

    updatePosition();
  }

  globalNetworkUpdate() {
    // Update all neurons' membrane potentials
    this.neuralNetwork.forEach((neuron, nodeId) => {
      // Leaky integrate-and-fire model
      neuron.membranePotential *= this.options.decayRate;

      // Check for firing threshold
      if (neuron.membranePotential > neuron.firingThreshold) {
        this.fireNeuron(nodeId);
        neuron.membranePotential = 0; // Reset after firing
      }
    });
  }

  fireNeuron(nodeId) {
    const neuron = this.neuralNetwork.get(nodeId);
    if (!neuron) return;

    const element = this.qni.quantumNodes.get(nodeId).element;
    neuron.lastFired = performance.now();

    // Visual firing effect
    element.classList.add('neuron-firing');
    setTimeout(() => {
      element.classList.remove('neuron-firing');
    }, 50);

    // Propagate to postsynaptic neurons
    neuron.synapses.forEach((postId) => {
      this.propagateSpike(nodeId, postId);
    });

    // Emit firing event
    element.dispatchEvent(new CustomEvent('neuronFired', {
      detail: {
        timestamp: neuron.lastFired,
        neurotransmitter: neuron.neurotransmitter.type
      }
    }));
  }

  propagateSpike(preId, postId) {
    const preNeuron = this.neuralNetwork.get(preId);
    const postNeuron = this.neuralNetwork.get(postId);
    if (!preNeuron || !postNeuron) return;

    const weightMap = this.hebbianWeights.get(this.qni.quantumNodes.get(preId).element);
    const weight = weightMap.get(postNeuron) || 0;

    // Add weighted input to postsynaptic neuron
    postNeuron.membranePotential += weight * preNeuron.neurotransmitter.strength;
  }
}

// CSS Injection for Neuromorphic Effects
const neuromorphicCSS = `
.neuromorphic-neuron {
  position: relative;
  transition: all 0.3s ease;
  --neurotransmitter: #00ff88;
}

.neuromorphic-neuron:hover {
  transform: scale(1.02);
}

.neural-spike {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  pointer-events: none;
  z-index: 100;
  mix-blend-mode: screen;
}

.neuron-firing {
  animation: neuronFire 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 15px var(--neurotransmitter);
}

@keyframes neuronFire {
  0% { box-shadow: 0 0 5px var(--neurotransmitter); }
  50% { box-shadow: 0 0 20px var(--neurotransmitter); }
  100% { box-shadow: 0 0 5px var(--neurotransmitter); }
}

.neural-connection {
  position: absolute;
  transform-origin: 0 50%;
  pointer-events: none;
  z-index: 9996;
  background: linear-gradient(to right, 
    var(--neurotransmitter-start, #00ff88), 
    var(--neurotransmitter-end, #00aaff));
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = neuromorphicCSS;
  document.head.appendChild(style);
}

// Export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuromorphicEngine;
} else if (window.QNI) {
  // Auto-attach to QNI if available
  window.QNI.neuromorphic = new NeuromorphicEngine(window.QNI, {
    learningRate: 0.02,
    plasticityThreshold: 0.4
  });
}
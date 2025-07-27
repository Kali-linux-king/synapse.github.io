// assets/js/quantum/neural-interface.js
/**
 * Quantum Neural Interface System
 * Creates entangled states between UI elements and simulated quantum nodes
 * Version 2.1 - With Decoherence Monitoring
 */

const QNI_VERSION = "2.1.0";

class QuantumNeuralInterface {
  constructor(options = {}) {
    this.options = {
      coherenceTime: 5000, // ms before decoherence
      observationThreshold: 0.85,
      ...options
    };

    this.quantumNodes = new Map();
    this.entanglements = new WeakMap();
    this.decoherenceTimers = new WeakMap();
    this.observer = new MutationObserver(this.handleDomChanges.bind(this));

    this.initQuantumField();
  }

  initQuantumField() {
    // Create quantum field canvas if not exists
    if (!document.getElementById('quantum-field-layer')) {
      const field = document.createElement('div');
      field.id = 'quantum-field-layer';
      field.className = 'quantum-field';
      document.body.appendChild(field);
    }

    // Initialize with existing elements
    document.querySelectorAll('[data-q-node]').forEach(node => {
      this.registerQuantumNode(node);
    });

    // Start observing for new nodes
    this.observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-q-node']
    });

    console.log(`[QNI ${QNI_VERSION}] Quantum field initialized`);
  }

  registerQuantumNode(node) {
    const nodeId = node.dataset.qNode || crypto.randomUUID();
    const initialState = this.generateQuantumState();

    this.quantumNodes.set(nodeId, {
      element: node,
      state: initialState,
      amplitude: 1.0,
      phase: 0
    });

    // Add entanglement listeners
    node.addEventListener('mouseenter', this.handleObservation.bind(this, nodeId));
    node.addEventListener('click', this.handleMeasurement.bind(this, nodeId));

    // Visual feedback
    node.classList.add('quantum-node');
    node.style.setProperty('--quantum-phase', `${initialState.phase}rad`);

    return nodeId;
  }

  generateQuantumState() {
    return {
      spin: Math.random() > 0.5 ? 'up' : 'down',
      phase: Math.random() * Math.PI * 2,
      superposition: true
    };
  }

  entangleNodes(nodeId1, nodeId2) {
    const node1 = this.quantumNodes.get(nodeId1);
    const node2 = this.quantumNodes.get(nodeId2);

    if (!node1 || !node2) return false;

    // Create entangled state
    const entangledState = this.generateQuantumState();
    node1.state = entangledState;
    node2.state = {...entangledState, phase: entangledState.phase + Math.PI};

    this.entanglements.set(node1.element, node2.element);
    this.entanglements.set(node2.element, node1.element);

    // Visual connection
    this.createNeuralConnection(node1.element, node2.element);

    return true;
  }

  createNeuralConnection(el1, el2) {
    const connectionId = `connection-${Date.now()}`;
    const connection = document.createElement('div');
    connection.className = 'neural-connection';
    connection.id = connectionId;
    connection.dataset.qEntanglement = 'active';
    
    document.getElementById('quantum-field-layer').appendChild(connection);
    
    // Update position on animation frame
    const updateConnection = () => {
      if (!document.getElementById(connectionId)) return;
      
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      
      const x1 = rect1.left + rect1.width / 2;
      const y1 = rect1.top + rect1.height / 2;
      const x2 = rect2.left + rect2.width / 2;
      const y2 = rect2.top + rect2.height / 2;
      
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      connection.style.cssText = `
        left: ${x1}px;
        top: ${y1}px;
        width: ${length}px;
        transform: rotate(${angle}rad);
        opacity: ${0.3 + (Math.sin(Date.now()/500) * 0.2)};
      `;
      
      requestAnimationFrame(updateConnection);
    };
    
    updateConnection();
  }

  handleObservation(nodeId) {
    const node = this.quantumNodes.get(nodeId);
    if (!node || !node.state.superposition) return;

    // Partial collapse
    node.state.amplitude *= 0.9;
    if (node.state.amplitude < this.options.observationThreshold) {
      this.collapseWaveFunction(nodeId);
    }

    // Visual feedback
    node.element.style.setProperty('--quantum-coherence', node.state.amplitude);
    this.scheduleDecoherence(nodeId);
  }

  handleMeasurement(nodeId) {
    this.collapseWaveFunction(nodeId);
    const node = this.quantumNodes.get(nodeId);
    node.element.dispatchEvent(new CustomEvent('quantumCollapse', {
      detail: { finalState: node.state }
    }));
  }

  collapseWaveFunction(nodeId) {
    const node = this.quantumNodes.get(nodeId);
    if (!node) return;

    // Collapse to definite state
    node.state.superposition = false;
    node.state.spin = Math.random() > 0.5 ? 'up' : 'down';
    node.element.classList.add('collapsed');
    node.element.classList.remove('superposition');

    // Notify entangled nodes
    const entangledNode = this.entanglements.get(node.element);
    if (entangledNode) {
      const entangledId = [...this.quantumNodes.entries()]
        .find(([_, data]) => data.element === entangledNode)?.[0];
      if (entangledId) this.collapseWaveFunction(entangledId);
    }
  }

  scheduleDecoherence(nodeId) {
    // Clear existing timer
    if (this.decoherenceTimers.has(nodeId)) {
      clearTimeout(this.decoherenceTimers.get(nodeId));
    }

    // Set new decoherence timer
    this.decoherenceTimers.set(nodeId, setTimeout(() => {
      const node = this.quantumNodes.get(nodeId);
      if (node && node.state.superposition) {
        this.collapseWaveFunction(nodeId);
      }
    }, this.options.coherenceTime));
  }

  handleDomChanges(mutations) {
    mutations.forEach(mutation => {
      // Check for new quantum nodes
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.hasAttribute('data-q-node')) {
          this.registerQuantumNode(node);
        }
      });

      // Handle attribute changes
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-q-node') {
        const target = mutation.target;
        if (target.hasAttribute('data-q-node')) {
          this.registerQuantumNode(target);
        }
      }
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumNeuralInterface;
} else {
  // Auto-initialize with default options
  document.addEventListener('DOMContentLoaded', () => {
    window.QNI = new QuantumNeuralInterface({
      coherenceTime: 7000,
      observationThreshold: 0.8
    });

    // Example entanglement - can be triggered via data attributes
    document.querySelectorAll('[data-entangle-with]').forEach(node => {
      const targetId = node.dataset.entangleWith;
      const target = document.querySelector(`[data-q-node="${targetId}"]`);
      if (target) {
        window.QNI.entangleNodes(
          node.dataset.qNode,
          target.dataset.qNode
        );
      }
    });
  });
}
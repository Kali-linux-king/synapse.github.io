// assets/js/quantum/entanglement.js
/**
 * Quantum Entanglement Manager
 * Creates and manages entangled states between DOM elements
 * Version 1.2 - With Bell State Verification
 */

class QuantumEntanglement {
  constructor(qniInstance) {
    this.qni = qniInstance;
    this.entangledPairs = new Map();
    this.bellStates = new WeakMap();
    this.connectionPool = new Set();
    
    this.initEntanglementObserver();
  }

  initEntanglementObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const nodeId = entry.target.dataset.qNode;
        if (nodeId && this.entangledPairs.has(nodeId)) {
          this.adjustConnectionStrength(nodeId, entry.intersectionRatio);
        }
      });
    }, {threshold: [0, 0.25, 0.5, 0.75, 1]});

    document.querySelectorAll('[data-q-node]').forEach(node => {
      observer.observe(node);
    });
  }

  createEntanglement(nodeId1, nodeId2, bellState = 'Φ+') {
    // Verify nodes exist
    const node1 = this.qni.quantumNodes.get(nodeId1);
    const node2 = this.qni.quantumNodes.get(nodeId2);
    if (!node1 || !node2) return false;

    // Initialize Bell state
    this.bellStates.set(node1.element, bellState);
    this.bellStates.set(node2.element, bellState);

    // Create bidirectional mapping
    this.entangledPairs.set(nodeId1, nodeId2);
    this.entangledPairs.set(nodeId2, nodeId1);

    // Set initial quantum states
    this.applyBellState(nodeId1, nodeId2, bellState);

    // Create visual connection
    const connectionId = this.createVisualEntanglement(node1.element, node2.element, bellState);

    // Add to connection pool
    this.connectionPool.add(connectionId);

    return true;
  }

  applyBellState(nodeId1, nodeId2, bellState) {
    const node1 = this.qni.quantumNodes.get(nodeId1);
    const node2 = this.qni.quantumNodes.get(nodeId2);

    // Apply correlated states based on Bell state
    switch(bellState) {
      case 'Φ+': // 00 + 11
        node1.state.spin = 'up';
        node2.state.spin = 'up';
        node1.state.phase = 0;
        node2.state.phase = 0;
        break;
      case 'Φ-': // 00 - 11
        node1.state.spin = 'up';
        node2.state.spin = 'up';
        node1.state.phase = 0;
        node2.state.phase = Math.PI;
        break;
      case 'Ψ+': // 01 + 10
        node1.state.spin = 'up';
        node2.state.spin = 'down';
        node1.state.phase = 0;
        node2.state.phase = 0;
        break;
      case 'Ψ-': // 01 - 10
        node1.state.spin = 'up';
        node2.state.spin = 'down';
        node1.state.phase = 0;
        node2.state.phase = Math.PI;
        break;
    }

    // Maintain superposition
    node1.state.superposition = true;
    node2.state.superposition = true;
    node1.state.amplitude = 1.0;
    node2.state.amplitude = 1.0;
  }

  createVisualEntanglement(element1, element2, bellState) {
    const connectionId = `entangle-${Date.now()}`;
    const connection = document.createElement('div');
    connection.className = `quantum-connection ${bellState.toLowerCase()}`;
    connection.id = connectionId;
    
    // Add to quantum field layer
    const fieldLayer = document.getElementById('quantum-field-layer') || document.body;
    fieldLayer.appendChild(connection);

    // Animation loop
    const animateConnection = () => {
      if (!document.getElementById(connectionId)) return;

      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();

      const start = {
        x: rect1.left + rect1.width / 2,
        y: rect1.top + rect1.height / 2
      };
      
      const end = {
        x: rect2.left + rect2.width / 2,
        y: rect2.top + rect2.height / 2
      };

      // Calculate connection path
      this.renderEntanglementPath(connection, start, end, bellState);

      requestAnimationFrame(animateConnection);
    };

    animateConnection();
    return connectionId;
  }

  renderEntanglementPath(element, start, end, bellState) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Bell-state specific rendering
    const styleConfig = {
      'Φ+': { color: 'rgba(0, 255, 136, 0.7)', width: '2px' },
      'Φ-': { color: 'rgba(255, 0, 128, 0.7)', width: '1.5px', dash: '5,3' },
      'Ψ+': { color: 'rgba(0, 192, 255, 0.7)', width: '1.8px', wave: true },
      'Ψ-': { color: 'rgba(255, 128, 0, 0.7)', width: '2px', twist: true }
    };

    const style = styleConfig[bellState];

    let transform = '';
    if (style.wave) {
      transform = `translateY(${Math.sin(Date.now()/500) * 5}px)`;
    } else if (style.twist) {
      transform = `rotate(${Math.sin(Date.now()/700) * 0.2}rad)`;
    }

    element.style.cssText = `
      position: absolute;
      left: ${start.x}px;
      top: ${start.y}px;
      width: ${distance}px;
      height: ${style.width};
      background: linear-gradient(to right, transparent, ${style.color}, transparent);
      transform-origin: 0 50%;
      transform: rotate(${angle}rad) ${transform};
      opacity: ${0.6 + Math.sin(Date.now()/1000) * 0.3};
      ${style.dash ? `border-top: 1px dashed ${style.color};` : ''}
    `;
  }

  adjustConnectionStrength(nodeId, visibilityRatio) {
    const pairedId = this.entangledPairs.get(nodeId);
    if (!pairedId) return;

    const pairElement = document.querySelector(`[data-q-node="${pairedId}"]`);
    if (!pairElement) return;

    // Adjust all connections between these nodes
    document.querySelectorAll(`.quantum-connection`).forEach(conn => {
      if (conn.contains(pairElement) || conn.contains(document.querySelector(`[data-q-node="${nodeId}"]`))) {
        conn.style.opacity = visibilityRatio;
      }
    });
  }

  verifyBellState(nodeId) {
    const node = this.qni.quantumNodes.get(nodeId);
    if (!node) return null;

    const pairedId = this.entangledPairs.get(nodeId);
    const pairedNode = this.qni.quantumNodes.get(pairedId);
    if (!pairedNode) return null;

    // Simple Bell state verification
    if (node.state.spin === pairedNode.state.spin) {
      return node.state.phase === pairedNode.state.phase ? 'Φ+' : 'Φ-';
    } else {
      return node.state.phase === pairedNode.state.phase ? 'Ψ+' : 'Ψ-';
    }
  }

  breakEntanglement(nodeId) {
    const pairedId = this.entangledPairs.get(nodeId);
    if (!pairedId) return false;

    // Remove from mappings
    this.entangledPairs.delete(nodeId);
    this.entangledPairs.delete(pairedId);
    this.bellStates.delete(this.qni.quantumNodes.get(nodeId).element);
    this.bellStates.delete(this.qni.quantumNodes.get(pairedId).element);

    // Remove visual connections
    document.querySelectorAll(`.quantum-connection`).forEach(conn => {
      if (conn.id.startsWith('entangle')) {
        conn.remove();
        this.connectionPool.delete(conn.id);
      }
    });

    return true;
  }
}

// Export pattern matching neural-interface.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumEntanglement;
} else if (window.QNI) {
  // Auto-attach to QNI if available
  window.QNI.entanglement = new QuantumEntanglement(window.QNI);
}
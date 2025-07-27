// assets/js/neuromorphic/plasticity.js
/**
 * Advanced Synaptic Plasticity Module
 * Implements multiple plasticity rules with meta-learning capabilities
 * Version 4.2 - With BCM Theory and Homeostatic Plasticity
 */

class SynapticPlasticity {
  constructor(neuromorphicEngine, options = {}) {
    this.engine = neuromorphicEngine;
    this.options = {
      bcmThreshold: 0.5,          // BCM sliding threshold
      homeostasisRate: 0.001,     // Homeostatic adjustment rate
      dopamineModulation: 0.2,     // Reward learning factor
      ...options
    };

    this.plasticityRules = {
      hebbian: this.applyHebbianRule.bind(this),
      bcm: this.applyBCMRule.bind(this),
      oja: this.applyOjaRule.bind(this),
      stdp: this.applySTDPRule.bind(this)
    };

    this.neuronActivity = new WeakMap();
    this.synapticTagging = new WeakMap();
    this.initPlasticityMonitor();
  }

  initPlasticityMonitor() {
    // Track neuron activity for BCM theory
    setInterval(() => {
      this.engine.neuralNetwork.forEach((neuron, nodeId) => {
        const element = this.engine.qni.quantumNodes.get(nodeId)?.element;
        if (!element) return;

        const activity = this.neuronActivity.get(element) || { 
          recent: 0, 
          average: 0.1,
          trace: []
        };

        // Update moving average
        activity.average = activity.average * 0.9 + activity.recent * 0.1;
        activity.recent *= 0.5; // Decay recent activity
        activity.trace.push(activity.average);
        if (activity.trace.length > 100) activity.trace.shift();

        this.neuronActivity.set(element, activity);
      });
    }, 1000);

    // Homeostatic regulation
    setInterval(() => {
      this.applyHomeostaticPlasticity();
    }, 5000);
  }

  applyPlasticityRule(ruleName, preId, postId, spikeData) {
    const rule = this.plasticityRules[ruleName];
    if (rule) {
      return rule(preId, postId, spikeData);
    }
    return false;
  }

  applyHebbianRule(preId, postId) {
    const preNeuron = this.engine.neuralNetwork.get(preId);
    const postNeuron = this.engine.neuralNetwork.get(postId);
    if (!preNeuron || !postNeuron) return false;

    const weightMap = this.engine.hebbianWeights.get(
      this.engine.qni.quantumNodes.get(preId).element
    );
    const currentWeight = weightMap.get(postNeuron) || 0;

    // Classic Hebbian rule: Δw = η * pre * post
    const activityProduct = 
      Math.min(preNeuron.membranePotential, 1) * 
      Math.min(postNeuron.membranePotential, 1);
    
    const weightChange = this.engine.options.learningRate * activityProduct;
    const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));

    weightMap.set(postNeuron, newWeight);
    this.engine.updateSynapticStrength(preId, postId, newWeight);

    return true;
  }

  applyBCMRule(preId, postId) {
    const preNeuron = this.engine.neuralNetwork.get(preId);
    const postNeuron = this.engine.neuralNetwork.get(postId);
    const postElement = this.engine.qni.quantumNodes.get(postId).element;
    if (!preNeuron || !postNeuron || !postElement) return false;

    const activity = this.neuronActivity.get(postElement);
    if (!activity) return false;

    const weightMap = this.engine.hebbianWeights.get(
      this.engine.qni.quantumNodes.get(preId).element
    );
    const currentWeight = weightMap.get(postNeuron) || 0;

    // BCM rule: Δw = η * post * (post - θ) * pre
    // θ is sliding threshold based on average activity
    const theta = activity.average * this.options.bcmThreshold;
    const postActivity = Math.min(postNeuron.membranePotential, 1);
    const preActivity = Math.min(preNeuron.membranePotential, 1);
    
    const weightChange = this.engine.options.learningRate * 
      postActivity * (postActivity - theta) * preActivity;

    const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));
    weightMap.set(postNeuron, newWeight);
    this.engine.updateSynapticStrength(preId, postId, newWeight);

    // Tag synapse for late-phase LTP if significant change
    if (Math.abs(weightChange) > 0.1) {
      this.tagSynapse(preId, postId, 'late-ltp', weightChange);
    }

    return true;
  }

  applyOjaRule(preId, postId) {
    const preNeuron = this.engine.neuralNetwork.get(preId);
    const postNeuron = this.engine.neuralNetwork.get(postId);
    if (!preNeuron || !postNeuron) return false;

    const weightMap = this.engine.hebbianWeights.get(
      this.engine.qni.quantumNodes.get(preId).element
    );
    const currentWeight = weightMap.get(postNeuron) || 0;

    // Oja's rule: Δw = η * (pre*post - w*post²)
    const postActivity = Math.min(postNeuron.membranePotential, 1);
    const preActivity = Math.min(preNeuron.membranePotential, 1);
    
    const weightChange = this.engine.options.learningRate * 
      (preActivity * postActivity - currentWeight * postActivity * postActivity);

    const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));
    weightMap.set(postNeuron, newWeight);
    this.engine.updateSynapticStrength(preId, postId, newWeight);

    return true;
  }

  applySTDPRule(preId, postId, spikeData) {
    const deltaT = spikeData.postTime - spikeData.preTime;
    const weightMap = this.engine.hebbianWeights.get(
      this.engine.qni.quantumNodes.get(preId).element
    );
    const currentWeight = weightMap.get(
      this.engine.neuralNetwork.get(postId)
    ) || 0;

    // STDP curve parameters
    const tauPlus = 20;  // LTP time constant (ms)
    const tauMinus = 20; // LTD time constant (ms)
    const aPlus = 0.1;   // LTP learning rate
    const aMinus = 0.12; // LTD learning rate

    let weightChange = 0;
    if (deltaT > 0) {
      // LTP (Long-Term Potentiation)
      weightChange = aPlus * Math.exp(-deltaT / tauPlus);
    } else {
      // LTD (Long-Term Depression)
      weightChange = -aMinus * Math.exp(deltaT / tauMinus);
    }

    const newWeight = Math.max(0, Math.min(1, currentWeight + weightChange));
    weightMap.set(this.engine.neuralNetwork.get(postId), newWeight);
    this.engine.updateSynapticStrength(preId, postId, newWeight);

    return true;
  }

  tagSynapse(preId, postId, tagType, strength) {
    const synapseKey = `${preId}-${postId}`;
    const existingTag = this.synapticTagging.get(synapseKey) || {};

    existingTag[tagType] = {
      timestamp: Date.now(),
      strength: strength,
      decay: 1.0
    };

    this.synapticTagging.set(synapseKey, existingTag);

    // Visual tagging
    const connection = document.querySelector(
      `.neural-connection[data-pre="${preId}"][data-post="${postId}"]`
    );
    if (connection) {
      connection.classList.add(`tagged-${tagType}`);
      setTimeout(() => {
        connection.classList.remove(`tagged-${tagType}`);
      }, 2000);
    }
  }

  applyHomeostaticPlasticity() {
    this.engine.neuralNetwork.forEach((neuron, nodeId) => {
      const element = this.engine.qni.quantumNodes.get(nodeId)?.element;
      const activity = this.neuronActivity.get(element);
      if (!element || !activity) return;

      // Scale all synapses based on neuron's activity level
      const targetActivity = 0.3; // Ideal average activity
      const scalingFactor = 1 + (targetActivity - activity.average) * 
        this.options.homeostasisRate;

      neuron.synapses.forEach((postId) => {
        this.scaleSynapse(nodeId, postId, scalingFactor);
      });
    });
  }

  scaleSynapse(preId, postId, factor) {
    const weightMap = this.engine.hebbianWeights.get(
      this.engine.qni.quantumNodes.get(preId).element
    );
    const postNeuron = this.engine.neuralNetwork.get(postId);
    if (!weightMap || !postNeuron) return;

    const currentWeight = weightMap.get(postNeuron) || 0;
    const newWeight = Math.max(0, Math.min(1, currentWeight * factor));
    weightMap.set(postNeuron, newWeight);
    this.engine.updateSynapticStrength(preId, postId, newWeight);
  }

  applyDopaminergicModulation(rewardSignal) {
    const modulation = 1 + rewardSignal * this.options.dopamineModulation;

    // Enhance tagged synapses
    this.synapticTagging.forEach((tags, synapseKey) => {
      if (tags['late-ltp'] && rewardSignal > 0) {
        const [preId, postId] = synapseKey.split('-');
        this.scaleSynapse(preId, postId, modulation);
      } else if (tags['late-ltd'] && rewardSignal < 0) {
        const [preId, postId] = synapseKey.split('-');
        this.scaleSynapse(preId, postId, 1 / modulation);
      }
    });
  }
}

// CSS for Plasticity Visualization
const plasticityCSS = `
.neural-connection.tagged-late-ltp {
  animation: ltp-pulse 1.5s ease infinite;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
}

.neural-connection.tagged-late-ltd {
  animation: ltd-pulse 1.5s ease infinite;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
}

@keyframes ltp-pulse {
  0%, 100% { transform: rotate(var(--connection-angle)) scaleY(1); }
  50% { transform: rotate(var(--connection-angle)) scaleY(1.5); }
}

@keyframes ltd-pulse {
  0%, 100% { transform: rotate(var(--connection-angle)) scaleY(1); }
  50% { transform: rotate(var(--connection-angle)) scaleY(0.7); }
}

.synaptic-tag {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
}

.ltp-tag {
  background: radial-gradient(circle, #00ff00, #007700);
}

.ltd-tag {
  background: radial-gradient(circle, #ff0000, #770000);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = plasticityCSS;
  document.head.appendChild(style);
}

// Export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SynapticPlasticity;
} else if (window.QNI?.neuromorphic) {
  // Auto-attach to neuromorphic engine if available
  window.QNI.neuromorphic.plasticity = new SynapticPlasticity(
    window.QNI.neuromorphic,
    {
      bcmThreshold: 0.6,
      dopamineModulation: 0.3
    }
  );
}
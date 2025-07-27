// assets/js/holographic/wave-simulator.js
/**
 * Quantum Wave Simulator
 * Simulates wavefunction propagation and interference patterns
 * Version 4.1 - With Nonlinear Schrödinger Equation Support
 */

class QuantumWaveSimulator {
  constructor(projector, options = {}) {
    this.projector = projector;
    this.options = {
      resolution: 512,           // Simulation grid size
      dt: 0.05,                  // Time step
      dx: 0.1,                   // Spatial step
      hbar: 1.0,                 // Reduced Planck constant
      potentialScale: 0.2,        // Potential field strength
      nonlinearity: 0.1,         // Nonlinear term coefficient
      ...options
    };

    this.wavefunctions = new Map();
    this.potentialFields = new Map();
    this.fftPlans = new Map();
    this.initSimulationEngine();
  }

  initSimulationEngine() {
    // Initialize FFTW-like planner if available
    if (typeof FFT !== 'undefined') {
      this.fft = new FFT(this.options.resolution, this.options.resolution);
    } else {
      console.warn('FFT library not found, using DFT fallback');
      this.fft = {
        transform: (data) => this.directFourierTransform(data),
        inverse: (data) => this.inverseFourierTransform(data)
      };
    }

    // Create WebGL context for GPU acceleration
    this.initWebGLContext();

    // Start simulation loop
    this.simulationLoop();
  }

  initWebGLContext() {
    try {
      const canvas = document.createElement('canvas');
      this.gl = canvas.getContext('webgl2') || 
                canvas.getContext('experimental-webgl');
      
      if (this.gl) {
        this.compileWaveShader();
        this.setupWaveBuffers();
      }
    } catch (e) {
      console.warn('WebGL not available, using CPU simulation');
    }
  }

  compileWaveShader() {
    // Vertex shader for wavefunction rendering
    const vsSource = `
      attribute vec2 position;
      varying vec2 vPosition;
      
      void main() {
        vPosition = position;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader for wavefunction visualization
    const fsSource = `
      precision highp float;
      uniform sampler2D waveTexture;
      uniform float time;
      varying vec2 vPosition;
      
      void main() {
        vec4 wave = texture2D(waveTexture, vPosition * 0.5 + 0.5);
        float probability = length(wave.xy);
        float phase = atan(wave.y, wave.x);
        
        // Chromatic phase visualization
        vec3 color = 0.5 + 0.5 * cos(phase + vec3(0, 2, 4));
        gl_FragColor = vec4(color * probability, 1.0);
      }
    `;

    this.waveProgram = this.createShaderProgram(vsSource, fsSource);
  }

  createShaderProgram(vsSource, fsSource) {
    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program linking error:', 
        this.gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', 
        this.gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  setupWaveBuffers() {
    // Create texture for wavefunction storage
    this.waveTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.waveTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    
    // Initialize with empty data
    const emptyData = new Float32Array(
      this.options.resolution * this.options.resolution * 4
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 
      this.options.resolution, this.options.resolution, 
      0, this.gl.RGBA, this.gl.FLOAT, emptyData
    );

    // Create framebuffer for rendering
    this.framebuffer = this.gl.createFramebuffer();
  }

  createWavefunction(id, initialCondition = null) {
    const wavefunction = {
      psi: new Float32Array(this.options.resolution * this.options.resolution * 2),
      potential: new Float32Array(this.options.resolution * this.options.resolution),
      kSpace: new Float32Array(this.options.resolution * this.options.resolution * 2),
      texture: null,
      position: { x: 0, y: 0 },
      momentum: { x: 0, y: 0 }
    };

    // Initialize wavefunction
    if (initialCondition) {
      this.applyInitialCondition(wavefunction, initialCondition);
    } else {
      this.applyGaussianPacket(wavefunction);
    }

    // Initialize potential
    this.applyHarmonicPotential(wavefunction);

    // Create WebGL texture if available
    if (this.gl) {
      wavefunction.texture = this.gl.createTexture();
      this.updateWaveTexture(wavefunction);
    }

    this.wavefunctions.set(id, wavefunction);
    return id;
  }

  applyInitialCondition(wavefunction, conditionFn) {
    for (let y = 0; y < this.options.resolution; y++) {
      for (let x = 0; x < this.options.resolution; x++) {
        const idx = (y * this.options.resolution + x) * 2;
        const normX = (x / this.options.resolution) * 2 - 1;
        const normY = (y / this.options.resolution) * 2 - 1;
        
        const psi = conditionFn(normX, normY);
        wavefunction.psi[idx] = psi.real;
        wavefunction.psi[idx + 1] = psi.imag;
      }
    }
  }

  applyGaussianPacket(wavefunction) {
    const centerX = 0;
    const centerY = 0;
    const sigma = 0.2;

    this.applyInitialCondition(wavefunction, (x, y) => {
      const r2 = (x - centerX)**2 + (y - centerY)**2;
      return {
        real: Math.exp(-r2 / (2 * sigma**2)),
        imag: 0
      };
    });
  }

  applyHarmonicPotential(wavefunction) {
    for (let y = 0; y < this.options.resolution; y++) {
      for (let x = 0; x < this.options.resolution; x++) {
        const idx = y * this.options.resolution + x;
        const normX = (x / this.options.resolution) * 2 - 1;
        const normY = (y / this.options.resolution) * 2 - 1;
        
        // Harmonic oscillator potential
        wavefunction.potential[idx] = this.options.potentialScale * 
          (normX**2 + normY**2);
      }
    }
  }

  updateWaveTexture(wavefunction) {
    if (!this.gl || !wavefunction.texture) return;

    // Convert wavefunction to RGBA format (real, imag, probability, phase)
    const rgbaData = new Float32Array(
      this.options.resolution * this.options.resolution * 4
    );

    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      const re = wavefunction.psi[i * 2];
      const im = wavefunction.psi[i * 2 + 1];
      const prob = re**2 + im**2;
      const phase = Math.atan2(im, re);

      rgbaData[i * 4] = re;
      rgbaData[i * 4 + 1] = im;
      rgbaData[i * 4 + 2] = prob;
      rgbaData[i * 4 + 3] = phase;
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, wavefunction.texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 
      this.options.resolution, this.options.resolution, 
      0, this.gl.RGBA, this.gl.FLOAT, rgbaData
    );
  }

  simulationLoop() {
    // Update all wavefunctions
    this.wavefunctions.forEach((wavefunction, id) => {
      this.stepWavefunction(wavefunction);
      
      // Update visualization
      this.updateWaveTexture(wavefunction);
      this.renderWavefunction(wavefunction);
      
      // Trigger hologram updates
      this.projector.updateWavefront(id, {
        amplitude: this.calculateProbabilityDensity(wavefunction),
        phase: this.calculatePhaseField(wavefunction)
      });
    });

    requestAnimationFrame(() => this.simulationLoop());
  }

  stepWavefunction(wavefunction) {
    // Split-step Fourier method for Schrödinger equation
    const N = this.options.resolution;
    const dt = this.options.dt;
    const dx = this.options.dx;
    const hbar = this.options.hbar;
    const nonlinearity = this.options.nonlinearity;

    // Step 1: Half-step in position space (nonlinear + potential)
    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      const re = wavefunction.psi[i * 2];
      const im = wavefunction.psi[i * 2 + 1];
      const V = wavefunction.potential[i];
      const psi2 = re**2 + im**2;

      // Nonlinear Schrödinger term: i * nonlinearity * |ψ|² ψ
      const nonlinearRe = -nonlinearity * psi2 * im;
      const nonlinearIm = nonlinearity * psi2 * re;

      // Potential term: -i * V * ψ / hbar
      const potentialRe = V * im / hbar;
      const potentialIm = -V * re / hbar;

      // Combine terms and half-step
      wavefunction.psi[i * 2] += (nonlinearRe + potentialRe) * dt / 2;
      wavefunction.psi[i * 2 + 1] += (nonlinearIm + potentialIm) * dt / 2;
    }

    // Step 2: FFT to momentum space
    this.fft.transform(wavefunction.psi, wavefunction.kSpace);

    // Step 3: Full-step in momentum space (kinetic)
    for (let ky = 0; ky < N; ky++) {
      for (let kx = 0; kx < N; kx++) {
        const idx = (ky * N + kx) * 2;
        const kxAdjusted = kx > N/2 ? kx - N : kx;
        const kyAdjusted = ky > N/2 ? ky - N : ky;
        
        const k2 = (kxAdjusted**2 + kyAdjusted**2) / (N * dx)**2;
        const phase = -hbar * k2 * dt;

        // Rotate by phase: exp(-i * hbar * k² * dt / (2m))
        const re = wavefunction.kSpace[idx];
        const im = wavefunction.kSpace[idx + 1];
        
        wavefunction.kSpace[idx] = re * Math.cos(phase) - im * Math.sin(phase);
        wavefunction.kSpace[idx + 1] = re * Math.sin(phase) + im * Math.cos(phase);
      }
    }

    // Step 4: IFFT back to position space
    this.fft.inverse(wavefunction.kSpace, wavefunction.psi);

    // Step 5: Another half-step in position space
    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      const re = wavefunction.psi[i * 2];
      const im = wavefunction.psi[i * 2 + 1];
      const V = wavefunction.potential[i];
      const psi2 = re**2 + im**2;

      const nonlinearRe = -nonlinearity * psi2 * im;
      const nonlinearIm = nonlinearity * psi2 * re;

      const potentialRe = V * im / hbar;
      const potentialIm = -V * re / hbar;

      wavefunction.psi[i * 2] += (nonlinearRe + potentialRe) * dt / 2;
      wavefunction.psi[i * 2 + 1] += (nonlinearIm + potentialIm) * dt / 2;
    }

    // Normalize wavefunction
    this.normalizeWavefunction(wavefunction);
  }

  normalizeWavefunction(wavefunction) {
    let norm = 0;
    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      norm += wavefunction.psi[i * 2]**2 + wavefunction.psi[i * 2 + 1]**2;
    }
    norm = Math.sqrt(norm * this.options.dx * this.options.dx);

    if (norm > 0) {
      const scale = 1 / norm;
      for (let i = 0; i < wavefunction.psi.length; i++) {
        wavefunction.psi[i] *= scale;
      }
    }
  }

  renderWavefunction(wavefunction) {
    if (!this.gl || !this.waveProgram || !wavefunction.texture) return;

    // Set up rendering
    this.gl.useProgram(this.waveProgram);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Bind wavefunction texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, wavefunction.texture);
    const textureLoc = this.gl.getUniformLocation(this.waveProgram, 'waveTexture');
    this.gl.uniform1i(textureLoc, 0);

    // Set time uniform
    const timeLoc = this.gl.getUniformLocation(this.waveProgram, 'time');
    this.gl.uniform1f(timeLoc, Date.now() * 0.001);

    // Render fullscreen quad
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.gl.STATIC_DRAW
    );

    const positionLoc = this.gl.getAttribLocation(this.waveProgram, 'position');
    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  calculateProbabilityDensity(wavefunction) {
    const density = new Float32Array(
      this.options.resolution * this.options.resolution
    );

    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      density[i] = wavefunction.psi[i * 2]**2 + wavefunction.psi[i * 2 + 1]**2;
    }

    return density;
  }

  calculatePhaseField(wavefunction) {
    const phase = new Float32Array(
      this.options.resolution * this.options.resolution
    );

    for (let i = 0; i < wavefunction.psi.length / 2; i++) {
      phase[i] = Math.atan2(
        wavefunction.psi[i * 2 + 1],
        wavefunction.psi[i * 2]
      );
    }

    return phase;
  }

  directFourierTransform(data) {
    // Fallback DFT implementation (slow for large N)
    const N = this.options.resolution;
    const output = new Float32Array(data.length);

    for (let ky = 0; ky < N; ky++) {
      for (let kx = 0; kx < N; kx++) {
        let sumRe = 0;
        let sumIm = 0;

        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const idx = (y * N + x) * 2;
            const angle = -2 * Math.PI * ((kx * x + ky * y) / N);
            
            sumRe += data[idx] * Math.cos(angle) - data[idx + 1] * Math.sin(angle);
            sumIm += data[idx] * Math.sin(angle) + data[idx + 1] * Math.cos(angle);
          }
        }

        const outIdx = (ky * N + kx) * 2;
        output[outIdx] = sumRe / N;
        output[outIdx + 1] = sumIm / N;
      }
    }

    return output;
  }

  inverseFourierTransform(data) {
    // Fallback IDFT implementation
    const N = this.options.resolution;
    const output = new Float32Array(data.length);

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let sumRe = 0;
        let sumIm = 0;

        for (let ky = 0; ky < N; ky++) {
          for (let kx = 0; kx < N; kx++) {
            const idx = (ky * N + kx) * 2;
            const angle = 2 * Math.PI * ((kx * x + ky * y) / N);
            
            sumRe += data[idx] * Math.cos(angle) - data[idx + 1] * Math.sin(angle);
            sumIm += data[idx] * Math.sin(angle) + data[idx + 1] * Math.cos(angle);
          }
        }

        const outIdx = (y * N + x) * 2;
        output[outIdx] = sumRe;
        output[outIdx + 1] = sumIm;
      }
    }

    return output;
  }
}

// CSS for Wavefunction Visualization
const waveSimulatorCSS = `
.wavefunction-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10001;
  mix-blend-mode: screen;
}

.wave-probability {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center, 
    rgba(0, 255, 136, 0.3) 0%, 
    transparent 70%
  );
  pointer-events: none;
}

.phase-visualization {
  position: absolute;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 0deg,
    #ff0000, #ffff00, #00ff00, #00ffff, 
    #0000ff, #ff00ff, #ff0000
  );
  mask: url('#waveMask');
  pointer-events: none;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = waveSimulatorCSS;
  document.head.appendChild(style);
}

// Export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuantumWaveSimulator;
} else if (window.HolographicProjector) {
  // Auto-attach to holographic projector if available
  window.WaveSimulator = new QuantumWaveSimulator(
    window.HolographicProjector,
    {
      resolution: 256,
      nonlinearity: 0.05
    }
  );
}
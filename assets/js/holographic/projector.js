// assets/js/holographic/projector.js
/**
 * Holographic Projection Engine
 * Simulates light-field projection and volumetric interfaces
 * Version 3.4 - With Photon Wavefront Reconstruction
 */

class HolographicProjector {
  constructor(options = {}) {
    this.options = {
      resolution: 2048,          // Hologram resolution
      depthLayers: 8,            // Z-axis depth layers
      parallaxIntensity: 0.3,    // Parallax effect strength
      chromaticAberration: true, // Spectral dispersion effect
      ...options
    };

    this.holograms = new Map();
    this.wavefronts = new WeakMap();
    this.photonBuffers = new Map();
    this.initProjectionSystem();
  }

  initProjectionSystem() {
    // Create holographic canvas if not exists
    if (!document.getElementById('holographic-field')) {
      const canvas = document.createElement('div');
      canvas.id = 'holographic-field';
      canvas.className = 'holographic-container';
      document.body.appendChild(canvas);
    }

    // Initialize WebGL context if available
    this.initWebGLContext();

    // Setup light field emitter
    this.setupLightFieldEmitter();

    // Start rendering loop
    this.renderLoop();
  }

  initWebGLContext() {
    try {
      const canvas = document.createElement('canvas');
      this.gl = canvas.getContext('webgl2') || 
                canvas.getContext('experimental-webgl');
      
      if (this.gl) {
        this.compileWavefrontShader();
        this.setupPhotonBuffer();
      }
    } catch (e) {
      console.warn('WebGL not available, falling back to CSS transforms');
    }
  }

  compileWavefrontShader() {
    // Vertex shader for wavefront simulation
    const vsSource = `
      attribute vec3 position;
      attribute vec3 wavefront;
      uniform mat4 projection;
      varying vec3 vWavefront;
      
      void main() {
        gl_Position = projection * vec4(position, 1.0);
        vWavefront = wavefront;
      }
    `;

    // Fragment shader for interference patterns
    const fsSource = `
      precision highp float;
      varying vec3 vWavefront;
      uniform float time;
      
      void main() {
        float intensity = sin(length(vWavefront) * 100.0 + time * 2.0) * 0.5 + 0.5;
        gl_FragColor = vec4(intensity, intensity * 0.9, 1.0, intensity * 0.7);
      }
    `;

    this.wavefrontProgram = this.createShaderProgram(vsSource, fsSource);
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

  setupPhotonBuffer() {
    // Create buffer for photon wavefront data
    this.photonBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.photonBuffer);
    
    // Initialize with empty wavefront data
    const bufferSize = this.options.resolution * this.options.resolution * 4;
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(bufferSize),
      this.gl.DYNAMIC_DRAW
    );
  }

  setupLightFieldEmitter() {
    // Create virtual light field emitter points
    this.emitterGrid = [];
    const gridSize = Math.sqrt(this.options.resolution);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        this.emitterGrid.push({
          x: (x / gridSize) * 2 - 1,
          y: (y / gridSize) * 2 - 1,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  createHologram(elementId, content, depthMap = null) {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const hologramId = `holo-${Date.now()}`;
    const hologram = {
      element: element,
      content: content,
      depthMap: depthMap || this.generateDepthMap(content),
      layers: [],
      currentAngle: { x: 0, y: 0 },
      wavefront: null
    };

    // Create depth layers
    this.createDepthLayers(hologram);

    // Initialize wavefront reconstruction
    if (this.gl) {
      hologram.wavefront = this.initWavefrontReconstruction(hologram);
    }

    this.holograms.set(hologramId, hologram);
    element.classList.add('hologram-source');
    element.dataset.hologramId = hologramId;

    // Setup interaction handlers
    this.setupHologramInteractions(hologramId);

    return hologramId;
  }

  createDepthLayers(hologram) {
    const container = document.getElementById('holographic-field');
    
    for (let i = 0; i < this.options.depthLayers; i++) {
      const layer = document.createElement('div');
      layer.className = 'hologram-layer';
      layer.style.zIndex = i;
      layer.style.opacity = 0.5 + (i / this.options.depthLayers) * 0.5;
      
      // Apply depth transform
      const depth = (i / this.options.depthLayers) * 2 - 1;
      layer.style.transform = `translateZ(${depth}px)`;
      
      // Clone content with depth-specific modifications
      const contentClone = hologram.content.cloneNode(true);
      this.applyDepthEffects(contentClone, i);
      layer.appendChild(contentClone);
      
      container.appendChild(layer);
      hologram.layers.push(layer);
    }
  }

  applyDepthEffects(element, layerIndex) {
    // Apply chromatic aberration
    if (this.options.chromaticAberration) {
      const offset = layerIndex * 0.3;
      element.style.textShadow = `
        ${offset}px 0 1px rgba(255,0,0,0.7),
        ${-offset}px 0 1px rgba(0,0,255,0.7)
      `;
    }

    // Depth-based blur
    const blurAmount = Math.abs(
      layerIndex - this.options.depthLayers/2
    ) * 0.8;
    element.style.filter = `blur(${blurAmount}px)`;
  }

  initWavefrontReconstruction(hologram) {
    // Simulate wavefront propagation
    const wavefront = {
      amplitude: new Float32Array(this.options.resolution),
      phase: new Float32Array(this.options.resolution),
      buffer: this.gl.createBuffer()
    };

    // Initialize with random phase
    for (let i = 0; i < wavefront.phase.length; i++) {
      wavefront.phase[i] = Math.random() * Math.PI * 2;
    }

    return wavefront;
  }

  setupHologramInteractions(hologramId) {
    const hologram = this.holograms.get(hologramId);
    if (!hologram) return;

    // Mouse movement parallax
    document.addEventListener('mousemove', (e) => {
      this.updateHologramView(hologramId, {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    });

    // Device orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        this.updateHologramView(hologramId, {
          x: (e.gamma / 90) * this.options.parallaxIntensity,
          y: (e.beta / 180) * this.options.parallaxIntensity
        });
      });
    }
  }

  updateHologramView(hologramId, angle) {
    const hologram = this.holograms.get(hologramId);
    if (!hologram) return;

    hologram.currentAngle = {
      x: angle.x * this.options.parallaxIntensity,
      y: angle.y * this.options.parallaxIntensity
    };

    // Update depth layers
    hologram.layers.forEach((layer, i) => {
      const depth = (i / this.options.depthLayers) * 2 - 1;
      const xShift = hologram.currentAngle.x * depth * 20;
      const yShift = hologram.currentAngle.y * depth * 20;
      
      layer.style.transform = `
        translateZ(${depth}px)
        translateX(${xShift}px)
        translateY(${yShift}px)
      `;
    });

    // Update wavefront reconstruction if available
    if (hologram.wavefront) {
      this.updateWavefront(hologram);
    }
  }

  updateWavefront(hologram) {
    // Simulate wavefront propagation based on view angle
    for (let i = 0; i < this.options.resolution; i++) {
      const emitter = this.emitterGrid[i];
      const distance = Math.sqrt(
        Math.pow(emitter.x - hologram.currentAngle.x, 2) +
        Math.pow(emitter.y - hologram.currentAngle.y, 2)
      );
      
      hologram.wavefront.amplitude[i] = Math.max(0, 1 - distance * 5);
      hologram.wavefront.phase[i] = (emitter.phase + Date.now() * 0.001) % (Math.PI * 2);
    }

    // Update WebGL buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, hologram.wavefront.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(hologram.wavefront.amplitude),
      this.gl.DYNAMIC_DRAW
    );
  }

  renderWavefront(hologram) {
    if (!this.gl || !hologram.wavefront) return;

    this.gl.useProgram(this.wavefrontProgram);
    
    // Set up attributes and uniforms
    const positionAttribute = this.gl.getAttribLocation(
      this.wavefrontProgram, 'position'
    );
    this.gl.enableVertexAttribArray(positionAttribute);
    this.gl.vertexAttribPointer(
      positionAttribute, 3, this.gl.FLOAT, false, 0, 0
    );

    const wavefrontAttribute = this.gl.getAttribLocation(
      this.wavefrontProgram, 'wavefront'
    );
    this.gl.enableVertexAttribArray(wavefrontAttribute);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, hologram.wavefront.buffer);
    this.gl.vertexAttribPointer(
      wavefrontAttribute, 3, this.gl.FLOAT, false, 0, 0
    );

    const timeUniform = this.gl.getUniformLocation(
      this.wavefrontProgram, 'time'
    );
    this.gl.uniform1f(timeUniform, Date.now() * 0.001);

    // Render wavefront
    this.gl.drawArrays(this.gl.POINTS, 0, this.options.resolution);
  }

  renderLoop() {
    // Update all holograms
    this.holograms.forEach((hologram, id) => {
      // CSS-based rendering
      hologram.layers.forEach(layer => {
        // Update layer appearance based on time
        const hueShift = (Date.now() * 0.01) % 360;
        layer.style.filter = `hue-rotate(${hueShift}deg) ${layer.style.filter}`;
      });

      // WebGL wavefront rendering
      if (hologram.wavefront) {
        this.renderWavefront(hologram);
      }
    });

    requestAnimationFrame(() => this.renderLoop());
  }

  generateDepthMap(content) {
    // Simple depth map generation based on content analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = content.offsetWidth;
    canvas.height = content.offsetHeight;

    // Draw content to canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawElement(content, 0, 0);

    // Generate depth map based on brightness
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const depthMap = new Float32Array(canvas.width * canvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const brightness = (
        imageData.data[i] + 
        imageData.data[i+1] + 
        imageData.data[i+2]
      ) / (3 * 255);
      
      depthMap[i/4] = brightness;
    }

    return depthMap;
  }
}

// CSS for Holographic Effects
const holographicCSS = `
.holographic-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  perspective: 2000px;
  transform-style: preserve-3d;
  z-index: 10000;
}

.hologram-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

.hologram-source {
  position: relative;
  transform-style: preserve-3d;
}

.hologram-source::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center, 
    rgba(0, 255, 136, 0.2) 0%, 
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}

@keyframes hologram-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.9; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = holographicCSS;
  document.head.appendChild(style);
}

// Export pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HolographicProjector;
} else {
  // Auto-initialize with default options
  document.addEventListener('DOMContentLoaded', () => {
    window.HolographicProjector = new HolographicProjector({
      resolution: 1024,
      depthLayers: 5,
      parallaxIntensity: 0.5
    });
  });
}
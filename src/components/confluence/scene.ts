import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CubicBezierCurve3,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

export type ConfluenceScene = {
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

type Coordinate = readonly [number, number, number?];
const point = ([x, y, z = 0]: Coordinate) => new Vector3(x - 310, 300 - y, z);
const route = (a: Coordinate, b: Coordinate, c: Coordinate, d: Coordinate) =>
  new CubicBezierCurve3(point(a), point(b), point(c), point(d));

/** This module is fetched only after the SVG is visible and motion is allowed. */
export function createConfluenceScene(
  host: HTMLElement,
  onContextLost: () => void,
): ConfluenceScene | null {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!context) return null;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const world = new Group();
  scene.add(world);
  const camera = new OrthographicCamera(-310, 310, 300, -300, 1, 2000);
  camera.position.z = 900;
  const geometries: BufferGeometry[] = [];
  const materials: (ShaderMaterial | MeshBasicMaterial | LineBasicMaterial)[] = [];
  const time = { value: 0 };
  const pixelRatio = { value: 1 };
  const accent = new Color('#B5F36B');
  let disposed = false;
  let running = false;
  let lastFrame = 0;
  let activeTime = 0;
  let pointerX = 0;
  let pointerY = 0;
  let width = 1;
  let height = 1;
  const visual = host.parentElement!;
  let disposeBindings = () => {};
  const finePointer = matchMedia('(pointer: fine)');

  try {
    const rivers = [
      route([219, 30, 0], [380, 165, 35], [142, 207, 15], [325, 323, 12]),
      route([590, 170, -7], [449, 143, 22], [505, 323, 28], [325, 323, 12]),
      route([325, 323, 12], [420, 420, 5], [360, 505, 28], [331, 571, -5]),
    ];

    // The contour network is a single draw call, with shallow relief in z.
    const contourVertices: number[] = [];
    const sample = new Vector3();
    const previous = new Vector3();
    const contour = (curve: CubicBezierCurve3) => {
      curve.getPoint(0, previous);
      for (let segment = 1; segment <= 70; segment++) {
        curve.getPoint(segment / 70, sample);
        contourVertices.push(previous.x, previous.y, previous.z, sample.x, sample.y, sample.z);
        previous.copy(sample);
      }
    };
    for (let i = 0; i < 17; i++) {
      const shift = (i - 8) * 7;
      contour(
        route(
          [219 + shift, -20, -5],
          [400 + shift * 1.6, 150, 25],
          [125 + shift * 0.8, 205, -12],
          [325 + shift, 323, 5],
        ),
      );
      contour(
        route(
          [325 + shift, 323, 5],
          [422 + shift, 420, 10],
          [355 + shift * 0.8, 505, -15],
          [330 + shift, 640, -5],
        ),
      );
    }
    for (let i = 0; i < 13; i++) {
      const shift = (i - 6) * 9;
      contour(
        route(
          [640, 170 + shift, -12],
          [450, 140 + shift * 1.8, 18],
          [510, 320 + shift, -12],
          [325, 323 + shift * 0.5, 2],
        ),
      );
    }
    const contours = new BufferGeometry();
    contours.setAttribute('position', new BufferAttribute(new Float32Array(contourVertices), 3));
    const contourMaterial = new LineBasicMaterial({
      color: '#6d9655',
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    geometries.push(contours);
    materials.push(contourMaterial);
    world.add(new LineSegments(contours, contourMaterial));

    const streamMaterial = new ShaderMaterial({
      uniforms: { uTime: time, uColor: { value: accent } },
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float signal = pow(0.5 + 0.5 * cos((vUv.x * 3.0 - uTime * 0.24) * 6.283185), 18.0);
          float edge = 0.6 + 0.4 * sin(vUv.y * 3.14159);
          gl_FragColor = vec4(uColor * (0.75 + signal * 0.25), (0.40 + signal * 0.60) * edge);
          #include <colorspace_fragment>
        }`,
    });
    materials.push(streamMaterial);
    for (const river of rivers) {
      const tube = new TubeGeometry(river, 100, 1.15, 5, false);
      geometries.push(tube);
      world.add(new Mesh(tube, streamMaterial));
    }

    // Curve control points are attributes, so all signal motion stays on the GPU.
    const particleCount = 54;
    const particleGeometry = new BufferGeometry();
    particleGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(particleCount * 3), 3),
    );
    for (const [name, key] of [
      ['aStart', 'v0'],
      ['aControlA', 'v1'],
      ['aControlB', 'v2'],
      ['aEnd', 'v3'],
    ] as const) {
      const values = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++)
        rivers[Math.floor(i / 18)][key].toArray(values, i * 3);
      particleGeometry.setAttribute(name, new BufferAttribute(values, 3));
    }
    particleGeometry.setAttribute(
      'aPhase',
      new BufferAttribute(
        Float32Array.from({ length: particleCount }, (_, i) => (i % 18) / 18),
        1,
      ),
    );
    const particleMaterial = new ShaderMaterial({
      uniforms: { uTime: time, uPixelRatio: pixelRatio, uColor: { value: accent } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      vertexShader: `uniform float uTime; uniform float uPixelRatio;
        attribute vec3 aStart; attribute vec3 aControlA; attribute vec3 aControlB; attribute vec3 aEnd; attribute float aPhase;
        varying float vStrength;
        void main() {
          float t = fract(aPhase + uTime * 0.075); float inv = 1.0 - t;
          vec3 p = inv*inv*inv*aStart + 3.0*inv*inv*t*aControlA + 3.0*inv*t*t*aControlB + t*t*t*aEnd;
          vStrength = 0.30 + 0.70 * pow(0.5 + 0.5*sin(aPhase*74.0), 2.0);
          gl_PointSize = (2.8 + vStrength*2.0)*uPixelRatio;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p + vec3(0.0,0.0,2.0),1.0);
        }`,
      fragmentShader: `uniform vec3 uColor; varying float vStrength;
        void main() {
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          float alpha = smoothstep(0.5, 0.08, distanceFromCenter) * vStrength;
          gl_FragColor = vec4(uColor, alpha);
          #include <colorspace_fragment>
        }`,
    });
    geometries.push(particleGeometry);
    materials.push(particleMaterial);
    const signals = new Points(particleGeometry, particleMaterial);
    // Shader positions differ from the placeholder position attribute.
    signals.frustumCulled = false;
    world.add(signals);

    const junction = new Group();
    junction.position.copy(point([325, 323, 18]));
    const coreGeometry = new IcosahedronGeometry(4, 1);
    const coreMaterial = new MeshBasicMaterial({ color: accent });
    geometries.push(coreGeometry);
    materials.push(coreMaterial);
    junction.add(new Mesh(coreGeometry, coreMaterial));
    const ringGeometry = new TorusGeometry(26, 0.5, 4, 80);
    const ringMaterial = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    geometries.push(ringGeometry);
    materials.push(ringMaterial);
    const ring = new Mesh(ringGeometry, ringMaterial);
    junction.add(ring);
    const outerRing = new Mesh(ringGeometry, ringMaterial);
    outerRing.scale.setScalar(1.75);
    junction.add(outerRing);
    world.add(junction);

    const render = (timestamp: number) => {
      if (disposed || !running) return;
      if (lastFrame && timestamp - lastFrame < 1000 / 30 - 1) return;
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.07) : 0;
      lastFrame = timestamp;
      activeTime += delta;
      time.value = activeTime;
      const ease = 1 - Math.exp(-delta * 5);
      world.rotation.y += (pointerX * 0.09 - world.rotation.y) * ease;
      world.rotation.x += (pointerY * 0.06 - world.rotation.x) * ease;
      ring.scale.setScalar(1 + Math.sin(activeTime * 1.1) * 0.045);
      outerRing.scale.setScalar(1.75 + Math.sin(activeTime * 1.1 - 0.7) * 0.06);
      renderer.render(scene, camera);
    };

    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      const scale = Math.min(width / 620, height / 600);
      camera.left = -width / scale / 2;
      camera.right = width / scale / 2;
      camera.top = height / scale / 2;
      camera.bottom = -height / scale / 2;
      camera.updateProjectionMatrix();
      pixelRatio.value = Math.min(devicePixelRatio || 1, width < 500 ? 1.25 : 1.5);
      renderer.setPixelRatio(pixelRatio.value);
      renderer.setSize(width, height, false);
      if (!disposed) renderer.render(scene, camera);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || !running) return;
      const bounds = host.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / width) * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / height) * 2 - 1));
    };
    const pointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      running = false;
      renderer.setAnimationLoop(null);
      onContextLost();
    };
    const observer = new ResizeObserver(resize);
    disposeBindings = () => {
      observer.disconnect();
      visual.removeEventListener('pointermove', pointerMove);
      visual.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('webglcontextlost', contextLost);
    };
    observer.observe(host);
    visual.addEventListener('pointermove', pointerMove, { passive: true });
    visual.addEventListener('pointerleave', pointerLeave, { passive: true });
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    resize();

    return {
      setRunning(next) {
        if (disposed || running === next) return;
        running = next;
        host.dataset.animation = next ? 'running' : 'paused';
        lastFrame = 0;
        renderer.setAnimationLoop(next ? render : null);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        renderer.setAnimationLoop(null);
        disposeBindings();
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
        delete host.dataset.animation;
      },
    };
  } catch {
    // A driver/initialization failure must not take the page's static illustration down.
    disposeBindings();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    return null;
  }
}

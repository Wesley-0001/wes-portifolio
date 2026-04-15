import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/** Deslocamento fino após centralizar (espaço local, pré-normalização de escala) */
const HERO_MODEL_OFFSET = { x: 0.22, y: 0.16 } as const;

/** Raio-alvo após normalização — permite usar minDistance/maxDistance fixos (2 / 6) sem cortar */
const TARGET_BOUND_RADIUS = 1;

const IDLE_RESUME_MS = 3000;
/** Parallax do alvo de órbita (unidades de mundo, escala com o raio do modelo) */
const PARALLAX_RADIUS_FACTOR = 0.13;

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const mats = child.material;
      if (Array.isArray(mats)) {
        mats.forEach((m) => m.dispose());
      } else {
        mats?.dispose();
      }
    }
  });
}

/** Prioridade para identificar o mesh da tela no GLB (nomes típicos: LCD, Screen, …). */
function scoreMeshAsScreen(mesh: THREE.Mesh): number {
  const n = mesh.name.toLowerCase();
  if (n === "lcd" || /(^|_)lcd$/.test(n)) return 100;
  if (n.includes("lcd")) return 85;
  if (n.includes("screen")) return 70;
  if (n.includes("display") || n.includes("monitor")) return 55;
  if (n.includes("glass")) return 48;
  const mats = mesh.material;
  const list = Array.isArray(mats) ? mats : mats ? [mats] : [];
  for (const m of list) {
    const mn = (m?.name ?? "").toLowerCase();
    if (mn.includes("lcd") || mn.includes("screen")) return 50;
  }
  return 0;
}

function findScreenMesh(root: THREE.Object3D): THREE.Mesh | null {
  const candidates: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && scoreMeshAsScreen(o) > 0) {
      candidates.push(o);
    }
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => scoreMeshAsScreen(b) - scoreMeshAsScreen(a));
  const top = candidates.filter(
    (m) => scoreMeshAsScreen(m) === scoreMeshAsScreen(candidates[0])
  );
  if (top.length === 1) return top[0];
  let best = top[0];
  let bestMetric = Infinity;
  for (const m of top) {
    const box = new THREE.Box3().setFromObject(m);
    const s = box.getSize(new THREE.Vector3());
    const thin = Math.min(s.x, s.y, s.z);
    const metric = thin * (s.x * s.y + s.y * s.z + s.x * s.z);
    if (metric < bestMetric) {
      bestMetric = metric;
      best = m;
    }
  }
  return best;
}

/** Liberta mapas de textura antes de libertar o material (remove GIF/vídeo da tela). */
function disposeMaterialMaps(m: THREE.Material) {
  if (
    m instanceof THREE.MeshStandardMaterial ||
    m instanceof THREE.MeshPhysicalMaterial
  ) {
    m.map?.dispose();
    m.emissiveMap?.dispose();
    m.normalMap?.dispose();
    m.roughnessMap?.dispose();
    m.metalnessMap?.dispose();
    m.aoMap?.dispose();
    m.lightMap?.dispose();
    m.bumpMap?.dispose();
    m.displacementMap?.dispose();
  }
}

function countMaterialRefs(modelRoot: THREE.Object3D, mat: THREE.Material): number {
  let n = 0;
  modelRoot.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const x of ms) if (x === mat) n++;
    }
  });
  return n;
}

/**
 * Substitui o material do mesh da tela por um PBR estático (sem textura animada).
 * Só descarta texturas/materiais antigos se não forem partilhados com outros meshes.
 */
function applyStaticScreenMaterial(screenMesh: THREE.Mesh, modelRoot: THREE.Object3D) {
  const prev = screenMesh.material;
  const list = Array.isArray(prev) ? [...prev] : [prev];

  screenMesh.material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x111111),
    emissive: new THREE.Color(0x0a0a0a),
    emissiveIntensity: 1,
    roughness: 0.4,
    metalness: 0.1,
  });

  for (const m of list) {
    if (countMaterialRefs(modelRoot, m) === 0) {
      disposeMaterialMaps(m);
      m.dispose();
    }
  }
}

/**
 * Posiciona a câmera para enquadrar uma esfera em `center` com FOV moderado (evita distorção).
 * `margin` > 1 dá folga extra para não cortar nas bordas ao dar zoom.
 */
function placeCameraForSphere(
  camera: THREE.PerspectiveCamera,
  center: THREE.Vector3,
  radius: number,
  width: number,
  height: number,
  margin = 1.08,
  minOrbit: number,
  maxOrbit: number
): number {
  const aspect = width / Math.max(height, 1);
  camera.aspect = aspect;
  const vFovRad = (camera.fov * Math.PI) / 180;
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
  const distV = (radius * margin) / Math.sin(vFovRad / 2);
  const distH = (radius * margin) / Math.sin(hFovRad / 2);
  let dist = Math.max(distV, distH, radius * 2.35);
  dist = THREE.MathUtils.clamp(dist, minOrbit * 1.02, maxOrbit * 0.92);

  const offset = new THREE.Vector3(0.18, 0.4, 1)
    .normalize()
    .multiplyScalar(dist);
  camera.position.copy(center).add(offset);
  camera.near = 0.1;
  camera.far = 100;
  camera.updateProjectionMatrix();
  return dist;
}

function makeFallbackMesh(): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.85, 1.05),
    new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x065f46,
      emissiveIntensity: 0.2,
      metalness: 0.2,
      roughness: 0.45,
    })
  );
  mesh.name = "hero-3d-fallback";
  return mesh;
}

/**
 * Viewer interativo (OrbitControls) no elemento #portfolio-3d da hero.
 */
export function initPortfolio3d(container: HTMLElement): () => void {
  let cancelled = false;
  let root: THREE.Object3D | null = null;
  let baseY = 0;
  let raf = 0;
  let modelRadius = 0.6;
  let initialOrbitDist = 3;

  const modelUrl = `${import.meta.env.BASE_URL}models/computer.glb`;

  const baseTarget = new THREE.Vector3();
  const parallaxSmooth = new THREE.Vector3();
  const parallaxGoal = new THREE.Vector3();
  const mouseNdc = new THREE.Vector2(0, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "auto";
  renderer.domElement.style.cursor = "grab";
  container.appendChild(renderer.domElement);

  const canvas = renderer.domElement;

  const motionQuery =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  const reduceMotion = () => motionQuery?.matches ?? false;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.65;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.72;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.autoRotate = !reduceMotion();
  controls.autoRotateSpeed = 0.42;

  let suppressParallaxUntil = 0;
  let pointerDownOnCanvas = false;
  let idleResumeTimer: ReturnType<typeof setTimeout> | null = null;

  const clearIdleTimer = () => {
    if (idleResumeTimer != null) {
      clearTimeout(idleResumeTimer);
      idleResumeTimer = null;
    }
  };

  const scheduleIdleAutoRotate = () => {
    clearIdleTimer();
    if (reduceMotion()) return;
    idleResumeTimer = setTimeout(() => {
      controls.autoRotate = true;
      idleResumeTimer = null;
    }, IDLE_RESUME_MS);
  };

  const onControlsStart = () => {
    controls.autoRotate = false;
    clearIdleTimer();
    suppressParallaxUntil = performance.now() + 1e6;
  };

  const onControlsEnd = () => {
    scheduleIdleAutoRotate();
    suppressParallaxUntil = performance.now() + 480;
  };

  controls.addEventListener("start", onControlsStart);
  controls.addEventListener("end", onControlsEnd);

  const onPointerDownCanvas = () => {
    pointerDownOnCanvas = true;
    canvas.style.cursor = "grabbing";
  };
  const onPointerUpCanvas = () => {
    pointerDownOnCanvas = false;
    canvas.style.cursor = "grab";
  };

  const onPointerLeaveCanvas = () => {
    if (!pointerDownOnCanvas) canvas.style.cursor = "grab";
  };

  canvas.addEventListener("pointerdown", onPointerDownCanvas);
  canvas.addEventListener("pointerup", onPointerUpCanvas);
  canvas.addEventListener("pointercancel", onPointerUpCanvas);
  canvas.addEventListener("pointerleave", onPointerLeaveCanvas);

  const onContainerPointerMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    mouseNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseNdc.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  container.addEventListener("pointermove", onContainerPointerMove);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff8f4, 1.42);
  key.position.set(4.6, 2.35, 2.1);
  scene.add(key);

  const side = new THREE.DirectionalLight(0xc8e0ff, 0.62);
  side.position.set(-3.8, 0.35, -1.6);
  scene.add(side);

  const clock = new THREE.Clock();

  const ZOOM_MIN = 2;
  const ZOOM_MAX = 6;

  const tryFitOrbit = (width?: number, height?: number) => {
    if (!root || cancelled || !container.isConnected) return;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const center = sphere.center.clone();
    modelRadius = Math.max(sphere.radius, 0.08);

    const w = Math.max(width ?? container.clientWidth, 1);
    const h = Math.max(height ?? container.clientHeight, 1);

    controls.minDistance = ZOOM_MIN;
    controls.maxDistance = ZOOM_MAX;

    initialOrbitDist = placeCameraForSphere(
      camera,
      center,
      modelRadius,
      w,
      h,
      1.08,
      ZOOM_MIN,
      ZOOM_MAX
    );

    baseTarget.copy(center);
    controls.target.copy(center);
    controls.update();
    controls.saveState();
  };

  const attachRoot = (object: THREE.Object3D, _source: "glb" | "fallback") => {
    if (cancelled) {
      disposeObject(object);
      return;
    }
    root = object;
    root.updateMatrixWorld(true);

    const boxBefore = new THREE.Box3().setFromObject(root);
    if (boxBefore.isEmpty()) {
      if (root.parent) scene.remove(root);
      disposeObject(root);
      const fb = makeFallbackMesh();
      root = fb;
      root.updateMatrixWorld(true);
      const boxFb = new THREE.Box3().setFromObject(root);
      if (!boxFb.isEmpty()) {
        const cfb = boxFb.getCenter(new THREE.Vector3());
        root.position.sub(cfb);
        root.position.x += HERO_MODEL_OFFSET.x;
        root.position.y += HERO_MODEL_OFFSET.y;
        root.updateMatrixWorld(true);
        const boxFbN = new THREE.Box3().setFromObject(root);
        const spFb = new THREE.Sphere();
        boxFbN.getBoundingSphere(spFb);
        const rf = Math.max(spFb.radius, 0.001);
        root.scale.multiplyScalar(TARGET_BOUND_RADIUS / rf);
      }
      root.updateMatrixWorld(true);
      baseY = root.position.y;
      scene.add(root);
      tryFitOrbit();
      return;
    }

    const center = boxBefore.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.x += HERO_MODEL_OFFSET.x;
    root.position.y += HERO_MODEL_OFFSET.y;

    root.updateMatrixWorld(true);
    const boxNorm = new THREE.Box3().setFromObject(root);
    const sphereNorm = new THREE.Sphere();
    boxNorm.getBoundingSphere(sphereNorm);
    const r = Math.max(sphereNorm.radius, 0.001);
    root.scale.multiplyScalar(TARGET_BOUND_RADIUS / r);

    root.updateMatrixWorld(true);
    baseY = root.position.y;

    scene.add(root);
    tryFitOrbit();

    if (_source === "glb") {
      const sm = findScreenMesh(root);
      if (sm) {
        applyStaticScreenMaterial(sm, root);
      }
    }
  };

  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      if (cancelled) {
        disposeObject(gltf.scene);
        return;
      }
      attachRoot(gltf.scene, "glb");
    },
    undefined,
    () => {
      if (cancelled) return;
      const fb = makeFallbackMesh();
      attachRoot(fb, "fallback");
    }
  );

  const resize = () => {
    if (!container.isConnected) return;
    let w = container.clientWidth;
    let h = container.clientHeight;
    if (w < 8 || h < 8) {
      w = Math.max(w, 200);
      h = Math.max(h, 200);
    }
    renderer.setSize(w, h, false);
    tryFitOrbit(w, h);
  };

  const ro = new ResizeObserver(() => resize());
  ro.observe(container);
  resize();
  requestAnimationFrame(() => {
    requestAnimationFrame(resize);
  });

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    const reduced = reduceMotion();

    if (root) {
      if (reduced) {
        root.position.y = baseY;
      } else {
        root.position.y = baseY + Math.sin(elapsed) * 0.2;
      }
    }

    const prxScale = modelRadius * PARALLAX_RADIUS_FACTOR;
    parallaxGoal.set(
      mouseNdc.x * prxScale,
      -mouseNdc.y * prxScale * 0.68,
      0
    );

    const parallaxAllowed =
      !reduced &&
      !pointerDownOnCanvas &&
      performance.now() > suppressParallaxUntil;

    if (reduced) {
      parallaxSmooth.lerp(new THREE.Vector3(0, 0, 0), 0.14);
    } else if (parallaxAllowed) {
      parallaxSmooth.lerp(parallaxGoal, 0.07);
    } else {
      parallaxSmooth.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }

    controls.target.copy(baseTarget).add(parallaxSmooth);
    controls.update(delta);

    renderer.render(scene, camera);
  };
  tick();

  const onMotionPreferenceChange = () => {
    if (reduceMotion()) {
      controls.autoRotate = false;
      clearIdleTimer();
    } else {
      scheduleIdleAutoRotate();
    }
  };
  motionQuery?.addEventListener("change", onMotionPreferenceChange);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    clearIdleTimer();
    ro.disconnect();
    motionQuery?.removeEventListener("change", onMotionPreferenceChange);
    controls.removeEventListener("start", onControlsStart);
    controls.removeEventListener("end", onControlsEnd);
    container.removeEventListener("pointermove", onContainerPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDownCanvas);
    canvas.removeEventListener("pointerup", onPointerUpCanvas);
    canvas.removeEventListener("pointercancel", onPointerUpCanvas);
    canvas.removeEventListener("pointerleave", onPointerLeaveCanvas);
    controls.dispose();
    if (root) {
      scene.remove(root);
      disposeObject(root);
      root = null;
    }
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}

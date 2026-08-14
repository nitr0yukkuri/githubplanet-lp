import * as THREE from "three";
import { calculateGoWindSpeedFactor } from "./githubplanet-modules/go-planet-wind.js";
import { languageProfiles, type LanguageProfile } from "./language-registry";
import { languageWindowFromProgress } from "./language-timeline";
import {
  createPlanetVariant,
  setAfterglowOpacity,
  setVariantOpacity,
  updatePlanetVariant,
  type PlanetVariant,
} from "./planet-variant";
import { seeded, TAU } from "./planet-random";

type ProgressRef = { current: number };

const SHOWCASE_WEEKLY_COMMITS = 24;
const BASE_ROTATION_PER_SECOND = 0.06;

function createBackgroundStars() {
  const positions = new Float32Array(1050 * 3);
  for (let index = 0; index < 1050; index += 1) {
    const theta = seeded(index + 1000) * TAU;
    const phi = Math.acos(1 - seeded(index + 2000) * 2);
    const radius = 14 + seeded(index + 3000) * 23;
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xc7d7ff, size: 0.027, transparent: true, opacity: 0.7, depthWrite: false }),
  );
}

function createMeteor(color: THREE.Color, start: THREE.Vector3, end: THREE.Vector3) {
  const group = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.075, 1.35, 10, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.z = 0.68;
  group.add(head, tail);
  group.position.copy(start);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), start.clone().sub(end).normalize());
  group.renderOrder = 10;
  return group;
}

export function createPlanetScene({
  container,
  progressRef,
  reducedMotion,
}: {
  container: HTMLElement;
  progressRef: ProgressRef;
  reducedMotion: boolean;
}) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    container.classList.add("is-unavailable");
    return () => undefined;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.05, 8.4);
  camera.lookAt(0, 0, 0);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x02030a, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.domElement.className = "planet-renderer";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x888888, 1.35);
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(10, 5, 9);
  const fill = new THREE.PointLight(0x2969ff, 5, 15);
  fill.position.set(-4, -2, 5);
  scene.add(ambient, key, fill);

  const skybox = new THREE.CubeTextureLoader().setPath("/skybox/").load(
    ["right.webp", "left.webp", "top.webp", "bottom.webp", "front.webp", "back.webp"],
  );
  scene.background = skybox;

  const planetGroup = new THREE.Group();
  planetGroup.rotation.x = Math.PI * 0.4;
  planetGroup.rotation.y = Math.PI * 0.1;
  scene.add(planetGroup);

  const texture = new THREE.TextureLoader().load("/2k_mars.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const variants = new Map<string, PlanetVariant>();
  const getVariant = (profile: LanguageProfile) => {
    const existing = variants.get(profile.effect);
    if (existing) return existing;
    const created = createPlanetVariant(profile, texture, pixelRatio);
    variants.set(profile.effect, created);
    planetGroup.add(created.group);
    return created;
  };

  const first = getVariant(languageProfiles[0]);
  setVariantOpacity(first, 1);
  const backgroundStars = createBackgroundStars();
  scene.add(backgroundStars);

  const meteorGroup = new THREE.Group();
  scene.add(meteorGroup);
  let elapsedSinceStart = 0;
  let nextMeteorAt = reducedMotion ? Number.POSITIVE_INFINITY : 2.2;
  const meteors: Array<{ group: THREE.Group; start: THREE.Vector3; end: THREE.Vector3; elapsed: number; duration: number }> = [];

  const spawnMeteor = (profile: LanguageProfile) => {
    const start = new THREE.Vector3(5.4, 2.3, 1.5);
    const end = new THREE.Vector3(-4.6, -1.9, 0.6);
    const group = createMeteor(new THREE.Color(profile.color), start, end);
    meteorGroup.add(group);
    meteors.push({ group, start, end, elapsed: 0, duration: 1.45 });
  };

  const resize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  let animationFrame = 0;
  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.05);
    elapsedSinceStart += delta;
    const progress = progressRef.current;
    const windowState = languageWindowFromProgress(progress);
    const from = getVariant(windowState.from);
    const to = getVariant(windowState.to);
    const blend = THREE.MathUtils.smoothstep(windowState.blend, 0, 1);
    if (from === to) {
      setVariantOpacity(from, 1);
    } else {
      setVariantOpacity(from, 1 - blend);
      setVariantOpacity(to, blend);
    }
    const afterglowEffect = windowState.afterglowIndex >= 0
      ? languageProfiles[windowState.afterglowIndex].effect
      : null;
    variants.forEach((variant) => {
      const isActive = variant === from || variant === to || variant.profile.effect === afterglowEffect;
      if (!isActive && (variant.group.visible || variant.effectGroup.visible)) {
        setVariantOpacity(variant, 0);
      }
    });
    if (windowState.afterglowIndex >= 0) {
      const afterglow = getVariant(languageProfiles[windowState.afterglowIndex]);
      setAfterglowOpacity(afterglow, windowState.afterglow);
    }

    const bodySpeed = (BASE_ROTATION_PER_SECOND + SHOWCASE_WEEKLY_COMMITS * 0.006) * (windowState.from.effect === "vue" ? 0.7 : 1);
    const windSpeed = calculateGoWindSpeedFactor(bodySpeed / 60, 0.001);
    updatePlanetVariant(from, performance.now(), windSpeed, camera);
    if (to !== from) updatePlanetVariant(to, performance.now(), windSpeed, camera);

    if (elapsedSinceStart > nextMeteorAt) {
      spawnMeteor(windowState.from);
      nextMeteorAt += 4.8;
    }

    if (!reducedMotion) {
      planetGroup.rotation.z += delta * bodySpeed;
      backgroundStars.rotation.y += delta * 0.0015;
    }

    for (let index = meteors.length - 1; index >= 0; index -= 1) {
      const meteor = meteors[index];
      meteor.elapsed += delta;
      const amount = Math.min(1, Math.max(0, meteor.elapsed / meteor.duration));
      const eased = 1 - Math.pow(1 - amount, 3);
      meteor.group.position.lerpVectors(meteor.start, meteor.end, eased);
      meteor.group.scale.setScalar(amount < 0.75 ? 1 : 1 - (amount - 0.75) / 0.25);
      if (amount >= 1) {
        meteorGroup.remove(meteor.group);
        meteor.group.traverse((object) => {
          const disposable = object as THREE.Mesh;
          disposable.geometry?.dispose();
          if (disposable.material) {
            const materials = Array.isArray(disposable.material) ? disposable.material : [disposable.material];
            materials.forEach((material) => material.dispose());
          }
        });
        meteors.splice(index, 1);
      }
    }

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resize);
    renderer.dispose();
    scene.traverse((object) => {
      const disposable = object as THREE.Mesh | THREE.Points;
      disposable.geometry?.dispose();
      if (disposable.material) {
        const materials = Array.isArray(disposable.material) ? disposable.material : [disposable.material];
        materials.forEach((material) => material.dispose());
      }
    });
    texture.dispose();
    skybox.dispose();
    renderer.domElement.remove();
  };
}

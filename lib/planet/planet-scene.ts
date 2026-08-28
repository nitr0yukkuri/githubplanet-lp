import * as THREE from "three";
import { calculateGoWindSpeedFactor } from "./githubplanet-modules/go-planet-wind.js";
import type { LanguageProfile } from "./language-catalog";
import { seeded, TAU } from "./planet-random";
import { createPlanetVariantStore } from "./planet-variant-store";
import type { SceneSnapshotRef } from "./scene-snapshot";

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
  snapshotRef,
  reducedMotion,
}: {
  container: HTMLElement;
  snapshotRef: SceneSnapshotRef;
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

  let contextAvailable = true;
  let planetAssetAvailable = true;
  let pageVisible = document.visibilityState !== "hidden";
  const handleVisibilityChange = () => {
    pageVisible = document.visibilityState !== "hidden";
  };
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    contextAvailable = false;
    container.classList.add("is-unavailable");
  };
  const handleContextRestored = () => {
    contextAvailable = true;
    if (planetAssetAvailable) {
      container.classList.remove("is-unavailable");
    }
    resize();
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  const ambient = new THREE.AmbientLight(0x888888, 1.35);
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(10, 5, 9);
  const fill = new THREE.PointLight(0x2969ff, 5, 15);
  fill.position.set(-4, -2, 5);
  scene.add(ambient, key, fill);

  const skybox = new THREE.CubeTextureLoader().setPath("/skybox/").load(
    ["right.webp", "left.webp", "top.webp", "bottom.webp", "front.webp", "back.webp"],
    undefined,
    undefined,
    () => {
      scene.background = null;
    },
  );
  scene.background = skybox;

  const planetGroup = new THREE.Group();
  planetGroup.rotation.x = Math.PI * 0.4;
  planetGroup.rotation.y = Math.PI * 0.1;
  scene.add(planetGroup);

  const texture = new THREE.TextureLoader().load(
    "/2k_mars.jpg",
    undefined,
    undefined,
    () => {
      planetAssetAvailable = false;
      container.classList.add("is-unavailable");
    },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const variantStore = createPlanetVariantStore({ parent: planetGroup, texture, pixelRatio });
  variantStore.get(snapshotRef.current.language.from);
  const backgroundStars = createBackgroundStars();
  scene.add(backgroundStars);
  const baseCameraZ = camera.position.z;

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
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);
  renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored, false);

  const clock = new THREE.Clock();
  let animationFrame = 0;
  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.05);
    const snapshot = snapshotRef.current;
    const canRender = pageVisible && contextAvailable && snapshot.phase !== "content";

    if (canRender) {
      elapsedSinceStart += delta;
      const bodySpeed = (BASE_ROTATION_PER_SECOND + SHOWCASE_WEEKLY_COMMITS * 0.006) * (snapshot.language.from.effect === "vue" ? 0.7 : 1);
      const windSpeed = calculateGoWindSpeedFactor(bodySpeed / 60, 0.001);
      const now = performance.now();
      variantStore.update(snapshot, now, windSpeed, camera);

      const flight = snapshot.finalFlightProgress;
      const flightEase = 1 - Math.pow(1 - flight, 3);
      planetGroup.scale.setScalar(1 - flightEase * 0.72);
      planetGroup.position.z = -flightEase * 2.6;
      camera.position.z = baseCameraZ - flightEase * 2.8;
      camera.lookAt(0, 0, 0);
      backgroundStars.scale.setScalar(1 + flightEase * 4.5);

      if (elapsedSinceStart > nextMeteorAt) {
        spawnMeteor(snapshot.activeLanguage);
        nextMeteorAt += 4.8;
      }

      if (!reducedMotion) {
        planetGroup.rotation.z += delta * bodySpeed * (1 - flightEase * 0.62);
        backgroundStars.rotation.y += delta * (0.0015 + flightEase * 0.035);
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
    }

    animationFrame = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(animationFrame);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("resize", resize);
    renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);
    variantStore.dispose();
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

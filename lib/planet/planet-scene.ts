import * as THREE from "three";
import {
  createCPlanetSteelMaterial,
} from "./githubplanet-modules/c-planet-steel.js";
import {
  createCssPlanetFlowMaterial,
  updateCssPlanetFlow,
} from "./githubplanet-modules/css-planet-flow.js";
import {
  createCppPlanetLightningMaterial,
  updateCppPlanetLightning,
} from "./githubplanet-modules/cpp-planet-lightning.js";
import {
  calculateGoWindSpeedFactor,
  createGoPlanetAtmosphere,
  createGoPlanetWindMaterial,
  updateGoPlanetAtmosphere,
  updateGoPlanetWind,
} from "./githubplanet-modules/go-planet-wind.js";
import {
  createVueLeafWind,
  updateVueLeafWind,
} from "./githubplanet-modules/vue-planet-circulation.js";
import {
  createTypeScriptPlanetMaterial,
  createTypeScriptPlanetShell,
  updateTypeScriptPlanetShell,
} from "./githubplanet-modules/typescript-planet-shell.js";
import {
  createJavaScriptPlanetMaterial,
  updateJavaScriptPlanetReactivity,
} from "./githubplanet-modules/javascript-planet-reactivity.js";
import {
  createKotlinElectricity,
  createKotlinPlanetMaterial,
  updateKotlinElectricity,
  updateKotlinPlanetCrystal,
} from "./githubplanet-modules/kotlin-planet-crystal.js";
import {
  createRustPlanetDust,
  createRustPlanetMaterial,
  updateRustPlanetDesert,
} from "./githubplanet-modules/rust-planet-desert.js";
import {
  createRubyPlanetCorona,
  createRubyPlanetMaterial,
  updateRubyPlanetSolar,
} from "./githubplanet-modules/ruby-planet-solar.js";
import {
  languageProfiles,
  type LanguageProfile,
} from "./language-registry";
import { languageWindowFromProgress } from "./language-timeline";

type ProgressRef = { current: number };
type PlanetMaterial = THREE.Material & {
  userData: Record<string, unknown> & {
    lpBaseOpacity?: number;
    lpBaseDepthWrite?: boolean;
    rubySolarUniforms?: unknown;
  };
  map?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
};

type PlanetVariant = {
  profile: LanguageProfile;
  group: THREE.Group;
  effectGroup: THREE.Group;
  afterglowGroup: THREE.Group;
  material: PlanetMaterial;
  cssMaterial?: PlanetMaterial;
  cppMaterial?: PlanetMaterial;
  goMaterial?: PlanetMaterial;
  goAtmosphere?: THREE.Group;
  vueLeaves?: THREE.Points;
  typeScriptMaterial?: PlanetMaterial;
  typeScriptShell?: THREE.Group;
  javaScriptMaterial?: PlanetMaterial;
  kotlinMaterial?: PlanetMaterial;
  kotlinElectricity?: THREE.Group;
  rustMaterial?: PlanetMaterial;
  rustDust?: THREE.Group;
  rubyMaterial?: PlanetMaterial;
  rubyCorona?: THREE.Group;
};

const PLANET_RADIUS = 2.18;
const SHOWCASE_WEEKLY_COMMITS = 24;
const SHOWCASE_STAR_COUNT = 42;
const BASE_ROTATION_PER_SECOND = 0.06;
const TAU = Math.PI * 2;

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function forEachMaterial(group: THREE.Object3D, callback: (material: PlanetMaterial) => void) {
  group.traverse((object) => {
    const candidate = object as THREE.Mesh | THREE.Points | THREE.Line;
    if (!("material" in candidate)) return;
    const material = candidate.material;
    if (Array.isArray(material)) material.forEach((item) => callback(item as PlanetMaterial));
    else if (material) callback(material as PlanetMaterial);
  });
}

function setVariantOpacity(variant: PlanetVariant, opacity: number) {
  const visible = opacity > 0.001;
  variant.group.visible = visible;
  variant.effectGroup.visible = visible;
  variant.afterglowGroup.visible = visible;
  forEachMaterial(variant.group, (material) => {
    const baseOpacity = typeof material.userData.lpBaseOpacity === "number"
      ? material.userData.lpBaseOpacity
      : material.opacity;
    material.userData.lpBaseOpacity = baseOpacity;
    material.transparent = true;
    material.depthWrite = opacity > 0.995 ? material.depthWrite : false;
    material.opacity = baseOpacity * opacity;
    material.needsUpdate = true;
  });
}

function setAfterglowOpacity(variant: PlanetVariant, opacity: number) {
  const visible = opacity > 0.001;
  variant.group.visible = visible;
  variant.afterglowGroup.visible = visible;
  forEachMaterial(variant.afterglowGroup, (material) => {
    const baseOpacity = typeof material.userData.lpBaseOpacity === "number"
      ? material.userData.lpBaseOpacity
      : material.opacity;
    material.userData.lpBaseOpacity = baseOpacity;
    material.transparent = true;
    material.depthWrite = false;
    material.opacity = baseOpacity * opacity;
    material.needsUpdate = true;
  });
}

function createRayStarMaterial(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    uniforms: { pixelRatio: { value: pixelRatio } },
    vertexShader: `
      uniform float pixelRatio;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (350.0 * pixelRatio) / -mvPosition.z;
      }
    `,
    fragmentShader: `
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float core = 1.0 - smoothstep(0.0, 0.05, r);
        float angle = atan(p.y, p.x);
        float rayIntensity = pow(abs(cos(angle * 2.0)), 30.0);
        float rayFalloff = pow(1.0 - smoothstep(0.0, 1.0, r), 2.0);
        float rays = rayIntensity * rayFalloff * 2.5;
        float glow = pow(1.0 - smoothstep(0.0, 1.0, r), 4.0);
        float alpha = clamp(core * 2.0 + rays + glow, 0.0, 1.0);
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

function createStars(pixelRatio: number, radius: number) {
  const vertices: number[] = [];
  for (let index = 0; index < SHOWCASE_STAR_COUNT; index += 1) {
    const phi = seeded(index + 10) * TAU;
    const theta = Math.acos(1 - seeded(index + 20) * 2);
    const starRadius = radius * 1.75 + seeded(index + 30) * radius * 0.5;
    vertices.push(
      starRadius * Math.sin(theta) * Math.cos(phi),
      starRadius * Math.sin(theta) * Math.sin(phi),
      starRadius * Math.cos(theta),
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return new THREE.Points(geometry, createRayStarMaterial(pixelRatio));
}

function createAura(color: string, radius: number) {
  const geometry = new THREE.SphereGeometry(radius * 1.02, 64, 64);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: Math.min(3, (SHOWCASE_STAR_COUNT / 5) * 0.3) + 1 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float fresnel = pow(1.0 - dot(normalize(vViewPosition), vNormal), 5.0);
        gl_FragColor = vec4(glowColor, clamp(fresnel * intensity, 0.0, 1.0));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function createFallbackMaterial(color: string, texture: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    color,
    aoMap: texture,
    aoMapIntensity: 1.5,
    roughness: 0.8,
    metalness: 0.2,
  });
}

function createPlanetMaterial(profile: LanguageProfile, texture: THREE.Texture): PlanetMaterial {
  const data = { mainLanguage: profile.label, planetColor: profile.color };
  switch (profile.effect) {
    case "c": return createCPlanetSteelMaterial(THREE, texture) as PlanetMaterial;
    case "css": return createCssPlanetFlowMaterial(THREE, texture) as PlanetMaterial;
    case "cpp": return createCppPlanetLightningMaterial(THREE, texture, profile.color) as PlanetMaterial;
    case "go": return createGoPlanetWindMaterial(THREE, texture, 1, "go") as PlanetMaterial;
    case "vue": return createGoPlanetWindMaterial(THREE, texture, 1, "vue") as PlanetMaterial;
    case "typescript": return createTypeScriptPlanetMaterial(THREE, texture) as PlanetMaterial;
    case "javascript": return createJavaScriptPlanetMaterial(THREE, texture, profile.color) as PlanetMaterial;
    case "kotlin": return createKotlinPlanetMaterial(THREE, texture) as PlanetMaterial;
    case "rust": return createRustPlanetMaterial(THREE, texture) as PlanetMaterial;
    case "ruby": return createRubyPlanetMaterial(THREE, texture) as PlanetMaterial;
    case "java": return createFallbackMaterial(profile.color, texture);
    default: return createFallbackMaterial(data.planetColor, texture);
  }
}

function createVariant(profile: LanguageProfile, texture: THREE.Texture, pixelRatio: number) {
  const group = new THREE.Group();
  const effectGroup = new THREE.Group();
  const afterglowGroup = new THREE.Group();
  effectGroup.name = `${profile.effect}-effect`;
  afterglowGroup.name = `${profile.effect}-afterglow`;
  const material = createPlanetMaterial(profile, texture);
  const geometry = new THREE.SphereGeometry(PLANET_RADIUS, 64, 64);
  geometry.setAttribute("uv2", new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
  const planet = new THREE.Mesh(geometry, material);
  planet.renderOrder = 2;
  group.add(planet);
  group.add(effectGroup, afterglowGroup);

  const variant: PlanetVariant = { profile, group, effectGroup, afterglowGroup, material };
  const effect = profile.effect;
  if (effect === "go" || effect === "vue") {
    variant.goMaterial = material;
    variant.goAtmosphere = createGoPlanetAtmosphere(THREE, PLANET_RADIUS, 1, effect);
    effectGroup.add(variant.goAtmosphere);
  }
  if (effect === "vue") {
    variant.vueLeaves = createVueLeafWind(THREE, PLANET_RADIUS);
    effectGroup.add(variant.vueLeaves);
  }
  if (effect === "typescript") {
    variant.typeScriptMaterial = material;
    variant.typeScriptShell = createTypeScriptPlanetShell(THREE, PLANET_RADIUS);
    effectGroup.add(variant.typeScriptShell);
  }
  if (effect === "javascript") variant.javaScriptMaterial = material;
  if (effect === "cpp") variant.cppMaterial = material;
  if (effect === "css") variant.cssMaterial = material;
  if (effect === "kotlin") {
    variant.kotlinMaterial = material;
    variant.kotlinElectricity = createKotlinElectricity(THREE, PLANET_RADIUS);
    effectGroup.add(variant.kotlinElectricity);
  }
  if (effect === "rust") {
    variant.rustMaterial = material;
    variant.rustDust = createRustPlanetDust(THREE, PLANET_RADIUS);
    effectGroup.add(variant.rustDust);
  }
  if (effect === "ruby") {
    variant.rubyMaterial = material;
    variant.rubyCorona = createRubyPlanetCorona(THREE, PLANET_RADIUS, material.userData.rubySolarUniforms);
    effectGroup.add(variant.rubyCorona);
  }

  afterglowGroup.add(createStars(pixelRatio, PLANET_RADIUS));
  afterglowGroup.add(createAura(profile.color, PLANET_RADIUS));
  setVariantOpacity(variant, 0);
  return variant;
}

function updateVariant(variant: PlanetVariant, now: number, windSpeed: number, camera: THREE.Camera) {
  updateCssPlanetFlow(variant.cssMaterial, now);
  updateCppPlanetLightning(variant.cppMaterial, now);
  updateGoPlanetWind(variant.goMaterial, now, windSpeed);
  updateGoPlanetAtmosphere(variant.goAtmosphere, now, windSpeed);
  updateVueLeafWind(variant.vueLeaves, now, windSpeed);
  updateTypeScriptPlanetShell(variant.typeScriptMaterial, now);
  updateTypeScriptPlanetShell(variant.typeScriptShell, now);
  updateJavaScriptPlanetReactivity(variant.javaScriptMaterial, now);
  updateKotlinPlanetCrystal(variant.kotlinMaterial, now);
  updateKotlinElectricity(variant.kotlinElectricity, now);
  updateRustPlanetDesert(variant.rustMaterial, now);
  updateRustPlanetDesert(variant.rustDust, now);
  updateRubyPlanetSolar(variant.rubyMaterial, now);
  updateRubyPlanetSolar(variant.rubyCorona, now, camera);
}

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
    const created = createVariant(profile, texture, pixelRatio);
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
    updateVariant(from, performance.now(), windSpeed, camera);
    if (to !== from) updateVariant(to, performance.now(), windSpeed, camera);

    if (elapsedSinceStart > nextMeteorAt) {
      spawnMeteor(windowState.from);
      nextMeteorAt += 4.8;
    }

    const targetX = THREE.MathUtils.lerp(0, 0.7, progress);
    const targetY = THREE.MathUtils.lerp(0, -0.1, progress);
    const targetZ = THREE.MathUtils.lerp(8.4, 7.4, progress);
    planetGroup.position.x = THREE.MathUtils.damp(planetGroup.position.x, targetX, 4.2, delta);
    planetGroup.position.y = THREE.MathUtils.damp(planetGroup.position.y, targetY, 4.2, delta);
    planetGroup.scale.setScalar(THREE.MathUtils.damp(planetGroup.scale.x, THREE.MathUtils.lerp(1, 1.12, progress), 4.2, delta));
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);
    camera.lookAt(targetX * 0.18, targetY, 0);

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

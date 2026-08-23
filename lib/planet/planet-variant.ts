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
import type { LanguageProfile } from "./language-catalog";
import { seeded, TAU } from "./planet-random";

export type PlanetMaterial = THREE.Material & {
  userData: Record<string, unknown> & {
    lpBaseOpacity?: number;
    lpBaseDepthWrite?: boolean;
    rubySolarUniforms?: unknown;
  };
  map?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
};

export type PlanetVariant = {
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
  materials: PlanetMaterial[];
  afterglowMaterials: PlanetMaterial[];
};

const PLANET_RADIUS = 2.18;
const SHOWCASE_STAR_COUNT = 42;

export function forEachMaterial(group: THREE.Object3D, callback: (material: PlanetMaterial) => void) {
  group.traverse((object) => {
    const candidate = object as THREE.Mesh | THREE.Points | THREE.Line;
    if (!("material" in candidate)) return;
    const material = candidate.material;
    if (Array.isArray(material)) material.forEach((item) => callback(item as PlanetMaterial));
    else if (material) callback(material as PlanetMaterial);
  });
}

function collectMaterials(group: THREE.Object3D) {
  const materials: PlanetMaterial[] = [];
  forEachMaterial(group, (material) => materials.push(material));
  return materials;
}

function updateMaterialOpacity(materials: PlanetMaterial[], opacity: number, forceDepthWrite: boolean) {
  materials.forEach((material) => {
    const baseOpacity = typeof material.userData.lpBaseOpacity === "number"
      ? material.userData.lpBaseOpacity
      : material.opacity;
    const baseDepthWrite = typeof material.userData.lpBaseDepthWrite === "boolean"
      ? material.userData.lpBaseDepthWrite
      : material.depthWrite;
    const nextDepthWrite = forceDepthWrite ? baseDepthWrite : false;

    material.userData.lpBaseOpacity = baseOpacity;
    material.userData.lpBaseDepthWrite = baseDepthWrite;
    material.userData.lpBaseTransparent = material.userData.lpBaseTransparent ?? material.transparent;

    const materialProgramChanged = material.transparent !== true || material.depthWrite !== nextDepthWrite;
    material.transparent = true;
    material.depthWrite = nextDepthWrite;
    material.opacity = baseOpacity * opacity;
    if (materialProgramChanged) material.needsUpdate = true;
  });
}

export function setVariantOpacity(variant: PlanetVariant, opacity: number) {
  const visible = opacity > 0.001;
  variant.group.visible = visible;
  variant.effectGroup.visible = visible;
  variant.afterglowGroup.visible = visible;
  updateMaterialOpacity(variant.materials, opacity, opacity > 0.995);
}

export function setAfterglowOpacity(variant: PlanetVariant, opacity: number) {
  const visible = opacity > 0.001;
  variant.group.visible = visible;
  variant.afterglowGroup.visible = visible;
  updateMaterialOpacity(variant.afterglowMaterials, opacity, false);
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

export function createPlanetMaterial(profile: LanguageProfile, texture: THREE.Texture): PlanetMaterial {
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

export function createPlanetVariant(profile: LanguageProfile, texture: THREE.Texture, pixelRatio: number) {
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

  const variant: PlanetVariant = {
    profile,
    group,
    effectGroup,
    afterglowGroup,
    material,
    materials: [],
    afterglowMaterials: [],
  };
  const effect = profile.effect;
  if (effect === "go" || effect === "vue") {
    variant.goMaterial = material;
    const goAtmosphere = createGoPlanetAtmosphere(THREE, PLANET_RADIUS, 1, effect);
    variant.goAtmosphere = goAtmosphere;
    effectGroup.add(goAtmosphere);
  }
  if (effect === "vue") {
    const vueLeaves = createVueLeafWind(THREE, PLANET_RADIUS);
    variant.vueLeaves = vueLeaves;
    effectGroup.add(vueLeaves);
  }
  if (effect === "typescript") {
    variant.typeScriptMaterial = material;
    const typeScriptShell = createTypeScriptPlanetShell(THREE, PLANET_RADIUS);
    variant.typeScriptShell = typeScriptShell;
    effectGroup.add(typeScriptShell);
  }
  if (effect === "javascript") variant.javaScriptMaterial = material;
  if (effect === "cpp") variant.cppMaterial = material;
  if (effect === "css") variant.cssMaterial = material;
  if (effect === "kotlin") {
    variant.kotlinMaterial = material;
    const kotlinElectricity = createKotlinElectricity(THREE, PLANET_RADIUS);
    variant.kotlinElectricity = kotlinElectricity;
    effectGroup.add(kotlinElectricity);
  }
  if (effect === "rust") {
    variant.rustMaterial = material;
    const rustDust = createRustPlanetDust(THREE, PLANET_RADIUS);
    variant.rustDust = rustDust;
    effectGroup.add(rustDust);
  }
  if (effect === "ruby") {
    variant.rubyMaterial = material;
    const rubyCorona = createRubyPlanetCorona(THREE, PLANET_RADIUS, material.userData.rubySolarUniforms);
    variant.rubyCorona = rubyCorona;
    effectGroup.add(rubyCorona);
  }

  const aura = createAura(profile.color, PLANET_RADIUS);
  if (effect === "kotlin") aura.material.toneMapped = false;
  afterglowGroup.add(createStars(pixelRatio, PLANET_RADIUS));
  afterglowGroup.add(aura);
  variant.materials = collectMaterials(group);
  variant.afterglowMaterials = collectMaterials(afterglowGroup);
  setVariantOpacity(variant, 0);
  return variant;
}

export function updatePlanetVariant(variant: PlanetVariant, now: number, windSpeed: number, camera: THREE.Camera) {
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

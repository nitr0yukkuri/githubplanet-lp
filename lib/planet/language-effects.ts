import * as THREE from "three";
import { languageProfiles, type LanguageProfile } from "./language-registry";
import { languageWindowFromProgress } from "./language-timeline";

type EffectUpdate = (elapsed: number, delta: number) => void;
export type LanguageEffect = THREE.Group & {
  userData: {
    language: string;
    baseOpacity: number;
    update?: EffectUpdate;
  };
};

const TAU = Math.PI * 2;

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function spherePoint(index: number, count: number, radius: number, seed = 0) {
  const y = 1 - ((index + 0.5) / count) * 2;
  const theta = (index * 2.3999632297 + seeded(index + seed) * 0.7) % TAU;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  return new THREE.Vector3(
    Math.cos(theta) * ring * radius,
    y * radius,
    Math.sin(theta) * ring * radius,
  );
}

function additiveMaterial(color: THREE.ColorRepresentation, opacity: number, side = THREE.DoubleSide) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side,
  });
}

function pointsMaterial(color: THREE.ColorRepresentation, size: number, opacity = 0.85) {
  return new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

function createPointCloud(count: number, radius: number, color: THREE.ColorRepresentation, size: number, seedOffset = 0) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const point = spherePoint(index, count, radius + (seeded(index + seedOffset) - 0.5) * 0.3, seedOffset);
    positions[index * 3] = point.x;
    positions[index * 3 + 1] = point.y;
    positions[index * 3 + 2] = point.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const cloud = new THREE.Points(geometry, pointsMaterial(color, size));
  cloud.userData.baseOpacity = 0.85;
  return cloud;
}

function createGlow(radius: number, color: THREE.ColorRepresentation, opacity: number, scale = 1) {
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(radius * scale, 32, 24),
    additiveMaterial(color, opacity, THREE.BackSide),
  );
  glow.userData.baseOpacity = opacity;
  return glow;
}

function createTorus(radius: number, tube: number, color: THREE.ColorRepresentation, opacity: number, rotation: THREE.Euler) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 8, 96),
    additiveMaterial(color, opacity),
  );
  ring.rotation.copy(rotation);
  ring.userData.baseOpacity = opacity;
  return ring;
}

function createTube(points: THREE.Vector3[], color: THREE.ColorRepresentation, radius: number, opacity: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 24, radius, 4, false),
    additiveMaterial(color, opacity),
  );
  mesh.userData.baseOpacity = opacity;
  return mesh;
}

function createTypeScriptEffect() {
  const group = new THREE.Group();
  const layers = [
    { radius: 2.27, color: "#42a5e8", opacity: 0.17, side: THREE.FrontSide },
    { radius: 2.35, color: "#007acc", opacity: 0.24, side: THREE.BackSide },
    { radius: 2.45, color: "#258fd4", opacity: 0.17, side: THREE.BackSide },
    { radius: 2.53, color: "#62b8eb", opacity: 0.11, side: THREE.BackSide },
  ];
  layers.forEach((layer, index) => {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(layer.radius, 40, 28),
      additiveMaterial(layer.color, layer.opacity, layer.side),
    );
    shell.scale.set(1, 0.97 + index * 0.02, 1);
    shell.rotation.set(index * 0.12, index * 0.34, index * 0.19);
    shell.userData.baseOpacity = layer.opacity;
    group.add(shell);
  });
  const boundaries = [
    [2.39, 0.44, 0.18, 0.48], [2.46, 1.18, -0.42, 0.32], [2.52, -0.62, 0.71, 0.28],
  ];
  boundaries.forEach(([radius, x, y, opacity], index) => {
    group.add(createTorus(radius, 0.012, index === 1 ? "#8ed7ff" : "#007acc", opacity, new THREE.Euler(x, y, index * 0.5)));
  });
  group.add(createPointCloud(26, 2.49, "#bfeaff", 0.018, 13));
  group.userData.update = (elapsed) => {
    group.rotation.y = Math.sin(elapsed * 0.16) * 0.08;
    group.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && index < 4) child.scale.x = 1 + Math.sin(elapsed * 0.48 + index) * 0.012;
    });
  };
  return group;
}

function createJavaScriptEffect() {
  const group = new THREE.Group();
  const fieldData = [
    { position: new THREE.Vector3(1.34, 0.72, 1.62), radius: 0.3, phase: 0 },
    { position: new THREE.Vector3(-1.1, 0.88, 1.72), radius: 0.24, phase: 2.1 },
    { position: new THREE.Vector3(0.35, -1.28, 1.86), radius: 0.2, phase: 4.2 },
  ];
  const fields = fieldData.map((field) => {
    const mesh = createGlow(field.radius, "#f0db4f", 0.4, 1);
    mesh.position.copy(field.position);
    mesh.userData.phase = field.phase;
    group.add(mesh);
    return mesh;
  });
  const reactions = createPointCloud(42, 2.4, "#fff1a6", 0.032, 29);
  reactions.scale.set(1.04, 0.8, 1.04);
  group.add(reactions);
  group.userData.update = (elapsed) => {
    fields.forEach((field) => {
      const pulse = Math.pow(Math.max(0, Math.sin(elapsed * (TAU / 12) + field.userData.phase)), 3);
      const scale = 0.78 + pulse * 0.72;
      field.scale.setScalar(scale);
      (field.material as THREE.MeshBasicMaterial).opacity = 0.13 + pulse * 0.32;
    });
    reactions.rotation.y = elapsed * 0.035;
  };
  return group;
}

function createRustEffect() {
  const group = new THREE.Group();
  const dust = createPointCloud(2600, 2.52, "#e5a36a", 0.018, 41);
  dust.scale.set(1.08, 0.78, 1.08);
  group.add(dust);
  [
    [2.26, "#b4542e", 0.26], [2.42, "#d7894e", 0.12], [2.56, "#efb778", 0.05],
  ].forEach(([radius, color, opacity]) => group.add(createGlow(radius as number, color as string, opacity as number)));
  group.userData.update = (elapsed) => {
    dust.rotation.y = elapsed * 0.055;
    dust.rotation.z = Math.sin(elapsed * 0.17) * 0.03;
  };
  return group;
}

function createGoEffect() {
  const group = new THREE.Group();
  const cyan = "#00add8";
  const streaks = [
    [-1.75, 0.82, 1.45, 0.95], [-1.05, -0.4, 1.75, 0.7], [-0.2, 1.18, 1.6, 1.2],
    [0.66, -1.02, 1.7, 0.88], [1.28, 0.48, 1.55, 1.05], [1.75, -0.18, 1.3, 0.66],
    [0.15, 0.08, 2.05, 0.58],
  ];
  streaks.forEach(([x, y, z, length], index) => {
    const mesh = createTube([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x + 0.18, y + 0.42, z + 0.08),
      new THREE.Vector3(x + 0.38, y + length, z - 0.02),
    ], index % 2 ? "#78e7ff" : cyan, 0.018, 0.34);
    mesh.userData.phase = index * 0.7;
    group.add(mesh);
  });
  const atmosphere = createGlow(2.38, "#00add8", 0.14, 1.05);
  group.add(atmosphere);
  group.add(createTorus(2.53, 0.018, "#62e7ff", 0.16, new THREE.Euler(0.3, 0.9, -0.3)));
  group.add(createTorus(2.66, 0.013, "#168fc2", 0.09, new THREE.Euler(0.55, 1.2, 0.25)));
  group.add(createPointCloud(64, 2.56, "#9fefff", 0.017, 83));
  group.userData.update = (elapsed) => {
    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.phase !== undefined) {
        child.position.x = Math.sin(elapsed * 0.78 + child.userData.phase) * 0.025;
        (child.material as THREE.MeshBasicMaterial).opacity = 0.2 + (Math.sin(elapsed * 1.3 + child.userData.phase) * 0.5 + 0.5) * 0.2;
      }
    });
  };
  return group;
}

function createCssEffect() {
  const group = new THREE.Group();
  const bands = [
    [2.39, 0.026, 0.3, 0.55, -0.3, 0], [2.47, 0.018, 0.2, 0.9, 0.4, 0.3], [2.56, 0.013, 0.13, 1.2, -0.2, 0.6],
  ];
  bands.forEach(([radius, tube, opacity, x, y, z]) => group.add(createTorus(radius, tube, "#9d7ad0", opacity, new THREE.Euler(x, y, z))));
  group.add(createPointCloud(82, 2.48, "#c7a8ff", 0.015, 101));
  group.userData.update = (elapsed) => {
    group.rotation.y = elapsed * 0.02;
    group.rotation.z = Math.sin(elapsed * 0.26) * 0.08;
  };
  return group;
}

function createCppEffect() {
  const group = new THREE.Group();
  const filaments: THREE.Mesh[] = [];
  for (let index = 0; index < 7; index += 1) {
    const angle = index * 2.399963 + seeded(index + 7) * 0.36;
    const bend = (seeded(index + 71) - 0.5) * 0.5;
    const start = new THREE.Vector3(0, 0, 0.22);
    const mid = new THREE.Vector3(Math.cos(angle) * (0.74 + bend), Math.sin(angle) * (0.74 + bend), 0.3 + (seeded(index + 91) - 0.5) * 0.45);
    const end = new THREE.Vector3(Math.cos(angle + bend) * 2.18, Math.sin(angle + bend) * 2.18, 0.28 + (seeded(index + 31) - 0.5) * 0.68);
    const filament = createTube([start, mid, end], index % 2 ? "#b596ff" : "#eef4ff", 0.012, index % 2 ? 0.38 : 0.6);
    filament.userData.phase = seeded(index + 12) * TAU;
    filaments.push(filament);
    group.add(filament);
    const contact = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), additiveMaterial("#f34b7d", 0.75));
    contact.position.copy(end);
    contact.userData.baseOpacity = 0.75;
    group.add(contact);
  }
  const core = createGlow(0.24, "#d9e8ff", 0.9, 1);
  group.add(core, createGlow(0.54, "#713bd6", 0.28, 1), createGlow(2.3, "#6c3cf0", 0.06, 1));
  group.add(createPointCloud(20, 0.72, "#ffb7d0", 0.025, 147));
  group.userData.update = (elapsed) => {
    filaments.forEach((filament) => {
      const pulse = 0.72 + Math.sin(elapsed * 8.5 + filament.userData.phase) * 0.18;
      (filament.material as THREE.MeshBasicMaterial).opacity = pulse;
    });
    core.scale.setScalar(0.92 + Math.sin(elapsed * 5.2) * 0.12);
  };
  return group;
}

function createVueEffect() {
  const group = new THREE.Group();
  group.add(createGlow(2.37, "#41b883", 0.15, 1.06));
  group.add(createTorus(2.53, 0.018, "#6fe0ae", 0.2, new THREE.Euler(0.42, 0.95, -0.2)));
  const leaves: THREE.Mesh[] = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * TAU;
    const leaf = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), additiveMaterial(index % 2 ? "#a0e88c" : "#41b883", 0.8));
    leaf.position.set(Math.cos(angle) * 2.58, Math.sin(index * 17) * 0.5, Math.sin(angle) * 2.58);
    leaf.userData.phase = index * 0.7;
    leaves.push(leaf);
    group.add(leaf);
  }
  group.userData.update = (elapsed) => {
    leaves.forEach((leaf) => {
      const angle = leaf.userData.phase + elapsed * 0.34;
      leaf.position.set(Math.cos(angle) * 2.58, Math.sin(indexedLeafY(leaf.userData.phase)) * 0.52, Math.sin(angle) * 2.58);
      leaf.rotation.z = angle;
    });
  };
  return group;
}

function indexedLeafY(phase: number) {
  return phase * 17 + 0.8;
}

function createRubyEffect() {
  const group = new THREE.Group();
  group.add(createGlow(2.37, "#cc342d", 0.18, 1.05));
  group.add(createGlow(2.62, "#ff6b28", 0.08, 1));
  const flames: THREE.Mesh[] = [];
  for (let index = 0; index < 11; index += 1) {
    const angle = (index / 11) * TAU;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.055 + seeded(index + 210) * 0.05, 0.34 + seeded(index + 220) * 0.38, 5), additiveMaterial(index % 3 ? "#ff5526" : "#ffd36a", 0.5));
    flame.position.set(Math.cos(angle) * (2.45 + seeded(index + 230) * 0.16), Math.sin(index * 3.1) * 0.9, Math.sin(angle) * (2.45 + seeded(index + 240) * 0.16));
    flame.rotation.z = Math.PI / 2 - angle;
    flame.userData.phase = seeded(index + 250) * TAU;
    flames.push(flame);
    group.add(flame);
  }
  group.add(createPointCloud(120, 2.72, "#ff7d34", 0.022, 271));
  group.userData.update = (elapsed) => {
    flames.forEach((flame) => {
      const pulse = 0.8 + Math.sin(elapsed * 4.6 + flame.userData.phase) * 0.24;
      flame.scale.y = pulse;
      (flame.material as THREE.MeshBasicMaterial).opacity = 0.28 + pulse * 0.2;
    });
  };
  return group;
}

function createKotlinEffect() {
  const group = new THREE.Group();
  const lines: THREE.Mesh[] = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = index * 1.047;
    const line = createTube([
      new THREE.Vector3(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0.2),
      new THREE.Vector3(Math.cos(angle + 0.2) * 1.35, Math.sin(angle + 0.2) * 1.35, 0.45),
      new THREE.Vector3(Math.cos(angle - 0.16) * 2.27, Math.sin(angle - 0.16) * 2.27, 0.1),
    ], index % 2 ? "#d8beff" : "#7b35e8", 0.014, index % 2 ? 0.72 : 0.44);
    line.userData.phase = index * 0.8;
    lines.push(line);
    group.add(line);
  }
  group.add(createTorus(2.42, 0.018, "#a46cff", 0.18, new THREE.Euler(0.7, 0.4, 0.2)));
  group.add(createPointCloud(70, 2.38, "#efe5ff", 0.018, 311));
  group.userData.update = (elapsed) => {
    lines.forEach((line) => {
      (line.material as THREE.MeshBasicMaterial).opacity = 0.35 + (Math.sin(elapsed * 5.8 + line.userData.phase) * 0.5 + 0.5) * 0.5;
    });
    group.rotation.y = elapsed * 0.018;
  };
  return group;
}

function createCEffect() {
  const group = new THREE.Group();
  group.add(createGlow(2.31, "#74787c", 0.07, 1.05));
  group.add(createTorus(2.39, 0.015, "#c4d1da", 0.24, new THREE.Euler(0.5, 0.9, 0.1)));
  group.userData.update = (elapsed) => {
    group.rotation.y = elapsed * 0.012;
  };
  return group;
}

const builders: Record<string, () => THREE.Group> = {
  typescript: createTypeScriptEffect,
  javascript: createJavaScriptEffect,
  rust: createRustEffect,
  go: createGoEffect,
  css: createCssEffect,
  cpp: createCppEffect,
  vue: createVueEffect,
  ruby: createRubyEffect,
  kotlin: createKotlinEffect,
  c: createCEffect,
};

export function createLanguageEffect(profile: LanguageProfile) {
  const group = (builders[profile.effect]?.() ?? new THREE.Group()) as LanguageEffect;
  group.userData.language = profile.label;
  group.userData.baseOpacity = 1;
  return group;
}

function materialsFor(object: THREE.Object3D) {
  if (!(object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line)) return [];
  return Array.isArray(object.material) ? object.material : [object.material];
}

export function updateLanguageEffects(effects: readonly LanguageEffect[], progress: number, elapsed: number, delta: number) {
  const window = languageWindowFromProgress(progress);
  const fromColor = new THREE.Color(window.from.color);
  const blendedColor = fromColor.lerp(new THREE.Color(window.to.color), window.blend);

  effects.forEach((effect, index) => {
    const distance = Math.abs(index - window.phase);
    const envelope = THREE.MathUtils.smoothstep(Math.max(0, 1 - distance * 2.35), 0, 1);
    effect.traverse((object) => {
      materialsFor(object).forEach((material) => {
        const baseOpacity = material.userData.baseOpacity ?? material.opacity;
        material.userData.baseOpacity = baseOpacity;
        material.opacity = baseOpacity * envelope;
        material.needsUpdate = true;
      });
    });
    effect.userData.update?.(elapsed, delta);
    effect.rotation.y += delta * (0.018 + index * 0.004);
    effect.rotation.z = Math.sin(elapsed * (0.12 + index * 0.02)) * 0.04;
  });

  return { ...window, color: blendedColor };
}

export function createAllLanguageEffects() {
  return languageProfiles.map(createLanguageEffect);
}

import * as THREE from "three";
import type { LanguageProfile } from "./language-catalog";
import type { SceneSnapshot } from "./scene-snapshot";
import {
  createPlanetVariant,
  setAfterglowOpacity,
  setVariantOpacity,
  updatePlanetVariant,
  type PlanetVariant,
} from "./planet-variant";

type PlanetVariantStoreOptions = {
  parent: THREE.Group;
  texture: THREE.Texture;
  pixelRatio: number;
};

export type PlanetVariantStore = {
  get(profile: LanguageProfile): PlanetVariant;
  update(snapshot: SceneSnapshot, now: number, windSpeed: number, camera: THREE.Camera): void;
  dispose(): void;
};

export function createPlanetVariantStore({ parent, texture, pixelRatio }: PlanetVariantStoreOptions): PlanetVariantStore {
  const variants = new Map<string, PlanetVariant>();

  const get = (profile: LanguageProfile) => {
    const existing = variants.get(profile.effect);
    if (existing) return existing;

    const created = createPlanetVariant(profile, texture, pixelRatio);
    variants.set(profile.effect, created);
    parent.add(created.group);
    return created;
  };

  const update = (snapshot: SceneSnapshot, now: number, windSpeed: number, camera: THREE.Camera) => {
    const from = get(snapshot.language.from);
    const to = get(snapshot.language.to);
    const blend = THREE.MathUtils.smoothstep(snapshot.language.blend, 0, 1);

    if (from === to) {
      setVariantOpacity(from, 1);
    } else {
      setVariantOpacity(from, 1 - blend);
      setVariantOpacity(to, blend);
    }

    variants.forEach((variant) => {
      const isActive = variant === from || variant === to || variant.profile.effect === snapshot.afterglowLanguage?.effect;
      if (!isActive && (variant.group.visible || variant.effectGroup.visible)) {
        setVariantOpacity(variant, 0);
      }
    });

    if (snapshot.afterglowLanguage) {
      const afterglow = get(snapshot.afterglowLanguage);
      setAfterglowOpacity(afterglow, snapshot.language.afterglow);
    }

    updatePlanetVariant(from, now, windSpeed, camera);
    if (to !== from) updatePlanetVariant(to, now, windSpeed, camera);
  };

  return {
    get,
    update,
    dispose: () => variants.clear(),
  };
}


import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { sceneSnapshotFromProgress, type SceneSnapshot } from "../planet/scene-snapshot";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function useLenisSceneProgress(heroRef: RefObject<HTMLElement | null>) {
  const initialSnapshot = sceneSnapshotFromProgress(0);
  const [snapshot, setSnapshot] = useState<SceneSnapshot>(initialSnapshot);
  const snapshotRef = useRef<SceneSnapshot>(initialSnapshot);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: reducedMotion ? 0.01 : 1.4,
      easing: (time) => 1 - Math.pow(1 - time, 4),
      smoothWheel: !reducedMotion,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const updateScene = ({ scroll }: { scroll: number }) => {
      const hero = heroRef.current;
      if (!hero) return;
      const heroStart = hero.offsetTop;
      const heroDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const nextProgress = clamp((scroll - heroStart) / heroDistance);
      const nextSnapshot = sceneSnapshotFromProgress(nextProgress);
      snapshotRef.current = nextSnapshot;
      setSnapshot(nextSnapshot);
    };
    lenis.on("scroll", updateScene);
    updateScene({ scroll: window.scrollY });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [heroRef]);

  const scrollTo = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    lenisRef.current?.scrollTo(target, { offset: -24 });
  }, []);

  return { snapshot, snapshotRef, scrollTo };
}


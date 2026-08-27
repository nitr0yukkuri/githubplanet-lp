import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { sceneSnapshotFromProgress, type SceneSnapshot } from "../planet/scene-snapshot";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const SPACE_TRANSIT_VIEWPORTS = 7.2;
const AUTO_NAVIGATION_DURATION = 42;

export function useLenisSceneProgress(
  heroRef: RefObject<HTMLElement | null>,
  finalSectionRef: RefObject<HTMLElement | null>,
) {
  const initialSnapshot = sceneSnapshotFromProgress(0);
  const [snapshot, setSnapshot] = useState<SceneSnapshot>(initialSnapshot);
  const snapshotRef = useRef<SceneSnapshot>(initialSnapshot);
  const lenisRef = useRef<Lenis | null>(null);

  const startAutoPilot = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const lenis = lenisRef.current;
    const finalSection = finalSectionRef.current;
    if (!lenis || !finalSection) return;

    const target = Math.max(
      finalSection.offsetTop + finalSection.offsetHeight - Math.max(window.innerHeight * 0.15, 24),
      0,
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lenis.scrollTo(target, {
      duration: reducedMotion ? 0 : AUTO_NAVIGATION_DURATION,
      easing: (time) => 1 - Math.pow(1 - time, 3),
      immediate: reducedMotion,
      force: true,
      userData: { source: "auto-pilot" },
    });
  }, [finalSectionRef]);

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
    let snapshotPublishFrame = 0;
    let pendingSnapshot: SceneSnapshot | null = null;

    const publishSnapshot = () => {
      snapshotPublishFrame = 0;
      if (!pendingSnapshot) return;
      const nextSnapshot = pendingSnapshot;
      pendingSnapshot = null;
      setSnapshot(nextSnapshot);
    };

    const scheduleSnapshotPublish = (nextSnapshot: SceneSnapshot) => {
      snapshotRef.current = nextSnapshot;
      pendingSnapshot = nextSnapshot;
      if (snapshotPublishFrame === 0) {
        snapshotPublishFrame = requestAnimationFrame(publishSnapshot);
      }
    };

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
      const heroIsActive = scroll <= heroStart + heroDistance + 1;
      const languageWorldsEnd = heroStart + heroDistance;
      const finalSection = finalSectionRef.current;
      // The camera leaves the planet only after the complete language timeline has ended.
      const flightStart = finalSection ? languageWorldsEnd : Number.POSITIVE_INFINITY;
      const flightDistance = Math.max(
        finalSection?.offsetHeight ?? window.innerHeight * SPACE_TRANSIT_VIEWPORTS,
        1,
      );
      const finalFlightProgress = clamp((scroll - flightStart) / flightDistance);
      const finalSectionEnd = finalSection
        ? finalSection.offsetTop + finalSection.offsetHeight
        : Number.NEGATIVE_INFINITY;
      const finalFlightIsVisible = Boolean(finalSection)
        && scroll >= flightStart
        && scroll <= finalSectionEnd;
      const nextSnapshot = sceneSnapshotFromProgress(
        nextProgress,
        finalFlightIsVisible ? finalFlightProgress : 0,
        heroIsActive ? "language-worlds" : "content",
      );
      scheduleSnapshotPublish(nextSnapshot);
    };

    let resizeFrame = 0;
    const updateSceneOnResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => updateScene({ scroll: window.scrollY }));
    };

    lenis.on("scroll", updateScene);
    window.addEventListener("resize", updateSceneOnResize);
    window.visualViewport?.addEventListener("resize", updateSceneOnResize);
    updateScene({ scroll: window.scrollY });

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(snapshotPublishFrame);
      pendingSnapshot = null;
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", updateSceneOnResize);
      window.visualViewport?.removeEventListener("resize", updateSceneOnResize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [finalSectionRef, heroRef]);

  const scrollTo = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    lenisRef.current?.scrollTo(target, { offset: -24 });
  }, []);

  return { snapshot, snapshotRef, scrollTo, startAutoPilot };
}


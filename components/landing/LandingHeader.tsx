import type { ScrollTo } from "./types";

type LandingHeaderProps = {
  progress: number;
  scrollTo: ScrollTo;
};

export function LandingHeader({ progress, scrollTo }: LandingHeaderProps) {
  return (
    <>
      <header className="fixed-chrome">
        <a className="brand" href="#top" onClick={(event) => scrollTo(event, "#top")} aria-label="GitHubPlanet home"><img className="brand-mark" src="/githubplanet-logo.png" alt="GitHubPlanet" /></a>
        <div className="chrome-center">GITHUB ACTIVITY / 3D PLANET</div>
        <span className="chrome-link">LANGUAGE WORLDS <span>↓</span></span>
      </header>
      <div className="progress-rail" aria-hidden="true"><span style={{ width: `${Math.max(4, progress * 100)}%` }} /></div>
    </>
  );
}

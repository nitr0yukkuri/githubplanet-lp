import type { ScrollTo } from "./types";

type LandingHeaderProps = {
  scrollTo: ScrollTo;
};

export function LandingHeader({ scrollTo }: LandingHeaderProps) {
  return (
    <>
      <header className="fixed-chrome">
        <a className="brand" href="#top" onClick={(event) => scrollTo(event, "#top")} aria-label="GitHubPlanet home"><img className="brand-mark" src="/githubplanet-logo.png" alt="GitHubPlanet" /></a>
        <div className="chrome-center">GITHUB ACTIVITY / 3D PLANET</div>
      </header>
    </>
  );
}

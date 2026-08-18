import type { ScrollTo } from "./types";

export function SiteFooter({ scrollTo }: { scrollTo: ScrollTo }) {
  return <footer className="site-footer"><a className="brand" href="#top" onClick={(event) => scrollTo(event, "#top")}><img className="brand-mark" src="/githubplanet-logo.png" alt="GitHubPlanet" /></a><span>MAKE YOUR WORK VISIBLE.</span><span>© 2026 GITHUBPLANET</span></footer>;
}

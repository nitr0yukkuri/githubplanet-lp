export type LanguageProfile = {
  label: string;
  symbol: string;
  logo: string;
  color: string;
  family: string;
  tagline: string;
  effect: string;
  afterglow: number;
};

// The sequence follows the deterministic showcase list in GitHubPlanet.
// Each effect name is backed by the original language module in this LP.
export const languageProfiles = [
  { label: "CSS", symbol: "#", logo: "/language-logos/css.svg", color: "#563d7c", family: "COLOR FLOW", effect: "css", afterglow: 0.07, tagline: "A one-way color current travels through the Mars relief." },
  { label: "C++", symbol: "C++", logo: "/language-logos/cpp.svg", color: "#f34b7d", family: "IDLE PLASMA", effect: "cpp", afterglow: 0.08, tagline: "Seven filaments discharge around a hot core." },
  { label: "Go", symbol: "Go", logo: "/language-logos/go-wordmark.svg", color: "#00add8", family: "WIND / CURRENT", effect: "go", afterglow: 0.06, tagline: "Cyan wind cuts across the terrain and wakes the atmosphere." },
  { label: "TypeScript", symbol: "TS", logo: "/language-logos/typescript.svg", color: "#007acc", family: "CONTAINMENT", effect: "typescript", afterglow: 0.05, tagline: "Four translucent shells validate a living surface." },
  { label: "JavaScript", symbol: "JS", logo: "/language-logos/javascript.svg", color: "#f0db4f", family: "REACTION", effect: "javascript", afterglow: 0.06, tagline: "Three local fields wake, branch, and settle." },
  { label: "Java", symbol: "J", logo: "/language-logos/java.svg", color: "#b07219", family: "BASE MATERIAL", effect: "java", afterglow: 0.03, tagline: "The showcase fallback keeps the shared Mars material visible." },
  { label: "Kotlin", symbol: "K", logo: "/language-logos/kotlin.svg", color: "#a97bff", family: "CRYSTAL / ARC", effect: "kotlin", afterglow: 0.09, tagline: "Violet crystal lines hold a quiet electric charge." },
  { label: "Rust", symbol: "R", logo: "/language-logos/rust.svg", color: "#dea584", family: "DUST / OXIDE", effect: "rust", afterglow: 0.12, tagline: "A dry, granular world moves through twelve thousand dust points." },
  { label: "Vue", symbol: "V", logo: "/language-logos/vue.svg", color: "#41b883", family: "CIRCULATION", effect: "vue", afterglow: 0.07, tagline: "A gentle green current carries six orbiting leaves." },
  { label: "Ruby", symbol: "R", logo: "/language-logos/ruby.svg", color: "#cc342d", family: "SOLAR / PEARL", effect: "ruby", afterglow: 0.1, tagline: "An anodized red surface breathes heat and embers." },
] as const satisfies readonly LanguageProfile[];

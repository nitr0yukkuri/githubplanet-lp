import { facts } from "./landing-content";

export function SignalsSection() {
  return (
    <section className="snapshot-section reveal" id="signals">
      <div className="section-rail"><span>02</span><span>THE SIGNALS</span></div>
      <div className="snapshot-intro"><p className="section-kicker">ACTIVITY, MADE VISIBLE</p><h2>Read<br /><em>your orbit.</em></h2><p className="section-description">惑星の見た目は飾りではなく、GitHubから読んだ活動の役割ごとの結果です。</p></div>
      <div className="signal-grid">{facts.map((fact) => <article className="signal-card" key={fact.label}><span className="signal-card-label">{fact.label}</span><strong>{fact.value}</strong><p>{fact.body}</p></article>)}</div>
    </section>
  );
}

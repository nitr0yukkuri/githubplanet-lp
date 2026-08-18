import { steps } from "./landing-content";

export function ProcessSection() {
  return (
    <section className="process-section reveal" id="process">
      <div className="section-rail"><span>03</span><span>THE PROCESS</span></div>
      <div className="process-heading"><p className="section-kicker">ONE CONNECTION / THREE MOVEMENTS</p><h2>Connect.<br />Translate.<br /><em>Observe.</em></h2></div>
      <div className="steps">{steps.map((step) => <article className="step" key={step.number}><div className="step-top"><span>{step.number}</span><span>↗</span></div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
    </section>
  );
}

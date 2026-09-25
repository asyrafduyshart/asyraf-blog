export function Wordmark({ section }: { section?: string }) {
  return (
    <a className="ay-wordmark" href="https://asyraf.ai/" aria-label="asyraf.ai">
      <span className="ay-wordmark__name">asyraf</span>
      <span aria-hidden className="ay-wordmark__disc" />
      <span className="ay-wordmark__ai">ai</span>
      {section ? <span className="ay-wordmark__section">/ {section}</span> : null}
    </a>
  );
}

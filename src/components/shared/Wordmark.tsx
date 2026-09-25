type WordmarkProps = {
  className?: string;
  section?: string;
};

export default function Wordmark({
  className = "",
  section,
}: WordmarkProps) {
  return (
    <span className={`ay-wordmark ${className}`.trim()}>
      <span className="ay-wordmark-name">asyraf</span>
      <span className="ay-sr-only">.</span>
      <span className="ay-wordmark-dot" aria-hidden />
      <span className="ay-wordmark-ai">ai</span>
      {section ? <span className="ay-wordmark-section">{section}</span> : null}
    </span>
  );
}

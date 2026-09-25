export function Tape({ position = "top" }: { position?: "top" }) {
  return <span aria-hidden className={`ay-tape ay-tape--${position}`} />;
}

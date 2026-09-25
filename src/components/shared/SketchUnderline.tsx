type SketchUnderlineProps = {
  className?: string;
};

export default function SketchUnderline({
  className = "",
}: SketchUnderlineProps) {
  return (
    <svg
      className={`ay-sketch-underline ${className}`.trim()}
      viewBox="0 0 220 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="ay-sketch-stroke"
        d="M3 8.5C38 4.5 72 3.5 106 5.5C140 7.5 176 8 217 4.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={240}
      />
    </svg>
  );
}

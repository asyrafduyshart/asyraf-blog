type TapeProps = {
  className?: string;
};

export default function Tape({ className = "" }: TapeProps) {
  return <span className={`ay-tape ${className}`.trim()} aria-hidden />;
}

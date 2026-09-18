interface Props {
  total: number;
  current: number;
  label: string;
}

export function ProgressBar({ total, current, label }: Props) {
  return (
    <div className="progress" aria-label={`Aufgabe ${current + 1} von ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress__dot ${i < current ? 'progress__dot--done' : ''} ${i === current ? 'progress__dot--current' : ''}`} />
      ))}
      <span className="progress__label">{label}</span>
    </div>
  );
}

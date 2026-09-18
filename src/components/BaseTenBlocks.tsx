import type { TensOnes } from '../types';

/** Zehnerstangen und Einerwürfel (Zehnersystem-Material). */
export function BaseTenBlocks({ tens, ones, label }: TensOnes & { label?: string }) {
  const empty = tens === 0 && ones === 0;
  return (
    <div className={`blocks ${empty ? 'blocks--empty' : ''}`} role="img" aria-label={label ?? `${tens} Zehner und ${ones} Einer`}>
      {empty && <span>noch nichts gelegt</span>}
      {tens > 0 && (
        <div className="blocks__tens">
          {Array.from({ length: tens }, (_, i) => (
            <div key={i} className="rod" />
          ))}
        </div>
      )}
      {ones > 0 && (
        <div className="blocks__ones">
          {Array.from({ length: ones }, (_, i) => (
            <div key={i} className="cube" />
          ))}
        </div>
      )}
    </div>
  );
}

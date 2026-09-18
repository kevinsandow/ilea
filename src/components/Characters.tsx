interface Props {
  who: 'leo' | 'lea';
  size?: number;
}

/** Vereinfachte Leo-/Lea-Figuren (rote Haare, weißes Shirt mit Namen). */
export function Character({ who, size = 160 }: Props) {
  const isLea = who === 'lea';
  const shirt = '#ffffff';
  const pants = isLea ? '#3a6ea5' : '#3b4a52';
  const hair = '#d9532b';
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 100 160" role="img" aria-label={isLea ? 'Lea' : 'Leo'}>
      {/* Haare */}
      {isLea ? (
        <>
          <ellipse cx="50" cy="30" rx="22" ry="20" fill={hair} />
          <path d="M28 34 q-4 30 6 42 l8 -6 q-6 -14 -4 -30z" fill={hair} />
          <path d="M72 34 q6 26 -4 40 l-8 -6 q6 -14 4 -30z" fill={hair} />
        </>
      ) : (
        <path d="M28 32 q4 -22 24 -20 q18 0 20 18 q-10 -8 -22 -6 q-12 2 -22 8z" fill={hair} />
      )}
      {/* Gesicht */}
      <ellipse cx="50" cy="36" rx="17" ry="19" fill="#f6d7bf" />
      <circle cx="43" cy="34" r="2" fill="#2f2f2f" />
      <circle cx="57" cy="34" r="2" fill="#2f2f2f" />
      <path d="M43 44 q7 6 14 0" stroke="#b5533b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {!isLea && <path d="M30 30 q6 -10 20 -10" stroke={hair} strokeWidth="6" fill="none" />}
      {/* Hals */}
      <rect x="45" y="53" width="10" height="8" fill="#f6d7bf" />
      {/* Jacke (Leo) */}
      {!isLea && <path d="M22 66 q6 -8 14 -8 l0 52 l-16 0 q-4 -24 2 -44z" fill="#3f8fd1" />}
      {!isLea && <path d="M78 66 q-6 -8 -14 -8 l0 52 l16 0 q4 -24 -2 -44z" fill="#3f8fd1" />}
      {/* Shirt */}
      <path d="M34 60 h32 q8 2 8 10 v40 h-48 v-40 q0 -8 8 -10z" fill={shirt} stroke="#d8dde1" />
      <text x="50" y="88" textAnchor="middle" fontFamily="Nunito, Quicksand, sans-serif" fontWeight="800" fontSize="14" fill="#c4ccd1">
        {isLea ? 'LeA' : 'Leo'}
      </text>
      {/* Arme */}
      <path d="M26 66 q-10 20 -4 40" stroke="#f6d7bf" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={isLea ? 'M74 66 q14 -10 12 -22' : 'M74 66 q10 20 4 40'} stroke="#f6d7bf" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* Hose */}
      <rect x="34" y="108" width="14" height="40" fill={pants} />
      <rect x="52" y="108" width="14" height="40" fill={pants} />
      {/* Schuhe */}
      <ellipse cx="41" cy="151" rx="10" ry="5" fill="#f3f3f3" stroke="#c9cfd3" />
      <ellipse cx="59" cy="151" rx="10" ry="5" fill="#f3f3f3" stroke="#c9cfd3" />
      <path d="M32 152 h18" stroke={isLea ? '#e8b040' : '#d9532b'} strokeWidth="2" />
      <path d="M50 152 h18" stroke={isLea ? '#e8b040' : '#d9532b'} strokeWidth="2" />
    </svg>
  );
}

export function LeoAndLea({ size = 150 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      <Character who="leo" size={size} />
      <Character who="lea" size={size} />
    </div>
  );
}

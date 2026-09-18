import { useCallback, useEffect, useState } from 'react';
import { speak } from '../audio/speech';
import { SpeakerIcon } from './icons';
import { RoundButton } from './RoundButton';

interface Props {
  text: string;
  /** Beim Einblenden automatisch vorlesen. */
  autoPlay?: boolean;
  small?: boolean;
}

/** Lautsprecher-Button: liest den Text vor (Web Speech API). */
export function SpeakerButton({ text, autoPlay = false, small }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const play = useCallback(() => {
    setSpeaking(true);
    speak(text, { onEnd: () => setSpeaking(false) });
  }, [text]);

  useEffect(() => {
    if (!autoPlay) return;
    // Kleine Verzögerung, damit der Bildschirmwechsel zuerst sichtbar ist.
    const t = window.setTimeout(play, 350);
    return () => window.clearTimeout(t);
  }, [autoPlay, play]);

  return (
    <RoundButton label="Vorlesen" small={small} onClick={play} className={speaking ? 'round--speaking' : ''}>
      <SpeakerIcon />
    </RoundButton>
  );
}

import { useEffect, useState } from 'react';
import { hasGermanVoice, speechAvailable } from './speech';

/**
 * true, sobald eine deutsche Stimme verfügbar ist. Stimmen werden vom Browser
 * asynchron geladen (voiceschanged), daher als Hook mit Abonnement.
 * Aufgaben, die nur über Sprache gestellt werden (Zahlvergleich, Stellenwerttafel),
 * blenden ohne Stimme das Zahlwort als Text ein, damit sie lösbar bleiben.
 */
export function useGermanVoice(): boolean {
  const [available, setAvailable] = useState(hasGermanVoice);

  useEffect(() => {
    if (!speechAvailable()) return;
    const update = () => setAvailable(hasGermanVoice());
    window.speechSynthesis.addEventListener('voiceschanged', update);
    // Manche Browser feuern voiceschanged nicht, wenn die Liste schon geladen ist.
    const t = window.setTimeout(update, 500);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', update);
      window.clearTimeout(t);
    };
  }, []);

  return available;
}

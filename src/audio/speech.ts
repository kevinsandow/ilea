/**
 * Sprachausgabe über die Web Speech API (SpeechSynthesis).
 * ILeA plus liest alle Anweisungen vor; hier ersetzt die Browser-TTS die Audiodateien.
 */

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

let germanVoice: SpeechSynthesisVoice | null | undefined;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (germanVoice !== undefined) return germanVoice;
  const voices = window.speechSynthesis.getVoices();
  germanVoice =
    voices.find((v) => v.lang === 'de-DE' && /anna|petra|katja|google/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith('de')) ??
    null;
  return germanVoice;
}

if (speechAvailable()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    germanVoice = undefined;
  });
}

export interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
}

/** Spricht den Text auf Deutsch; unterbricht laufende Ausgaben. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!speechAvailable()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = opts.rate ?? 0.9;
  const voice = pickGermanVoice();
  if (voice) u.voice = voice;
  if (opts.onEnd) u.onend = opts.onEnd;
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (speechAvailable()) window.speechSynthesis.cancel();
}

/** Gibt es (schon) eine deutsche Stimme? In Headless-Browsern/jsdom typischerweise nein. */
export function hasGermanVoice(): boolean {
  if (!speechAvailable()) return false;
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith('de'));
}

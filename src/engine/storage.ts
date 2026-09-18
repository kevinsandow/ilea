import type { Session } from '../types';

const KEY = 'ilea-plus.sessions.v1';

function read(): Session[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

export function loadSessions(): Session[] {
  return read().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function saveSession(session: Session): void {
  const others = read().filter((s) => s.id !== session.id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...others, session]));
  } catch {
    // Speicher voll oder blockiert – Sitzung bleibt im Arbeitsspeicher.
  }
}

export function deleteSession(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(read().filter((s) => s.id !== id)));
  } catch {
    // ignorieren
  }
}

export function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

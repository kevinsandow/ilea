# ILeA plus – Nachbau für Jahrgangsstufe 2

Ein Nachbau der digitalen **Individuellen Lernstandsanalyse (ILeA plus)** des Landes Brandenburg
mit Beispielaufgaben für Kinder am Anfang der 2. Klasse. Leo und Lea führen durch die Aufgaben,
alle Anweisungen werden vorgelesen (Web Speech API), die Ergebnisse landen in einer
Lehrkraft-Ansicht mit Förderhinweisen.

Inspiration: [Handbuch ILeA plus (LISUM, 2021)](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/lernbegleitende_Diagnostik/ilea_plus/ILeAplus-komp.pdf).
Dieses Projekt ist eine private Nachbildung zu Lernzwecken und steht in keiner Verbindung zum LISUM.
Die Grenzwerte der Auswertung sind an das Handbuch angelehnt, aber **nicht normiert**.

## Starten

```bash
npm install
npm run dev        # http://localhost:5173
```

Lehrkraft-Bereich: Code `lisum` (wie das Lehrkraft-Passwort im Original-Handbuch).

## Aufgaben

**Mathematik** (Teilpaket AB + Niveaustufe B, Handbuch Teil III)

| Aufgabe | Kompetenzbereich | Format |
| --- | --- | --- |
| Schnelles Sehen | Zahlen auffassen | Fingerbild / Zehnerfeld / Rechenrahmen kurz zeigen, Zahl eintippen |
| Zahlauffassung | Zahlen auffassen | Zehnerstangen & Einerwürfel (auch nicht-kanonisch) → Zahl |
| Mengen klicken | Zahlen auffassen | Zahl → Zehner/Einer klicken |
| Anzahlvergleich | Zahlen ordnen | zwei Mengenbilder, `<` `=` `>` wählen |
| Zahlvergleich | Zahlen ordnen | zwei Zahlen hören, größere eintippen |
| Zahlzerlegungen | Zahlbeziehungen | Ergänzen zur 10 und zur 8 |
| Rechengeschichten | Operationsvorstellungen | Kontextaufgaben im ZR 10 (vorgelesen) |
| Plus und Minus | Rechenstrategien | kleines 1 ± 1, Ergebnis anklicken (Zeit wird gemessen) |
| Stellenwerttafel | Zahlen auffassen | gehörte Zahl in H / Z / E eintragen |

**Deutsch** (Lesen B1, Rechtschreiben B1, Silben aus Paket A, Handbuch Teil II)

| Aufgabe | Kompetenzbereich | Format |
| --- | --- | --- |
| Silben klatschen | Phonologische Bewusstheit | Bild + Wort, 1–4 Klatscher wählen |
| Tierwörter – schnell lesen | Leseflüssigkeit | Ja/Nein in 60 s (Messwert: bearbeitete Wörter) |
| Tierwörter – genau lesen | Leseflüssigkeit | Minimalpaare (Hund/Hand), ohne Zeitlimit |
| Lückensätze füllen | Leseverständnis | 1 aus 4 Wörtern |
| Sätze vervollständigen | Leseverständnis | 3 Satzanfänge ↔ 3 Satzenden (0/1/2 Punkte) |
| Welches Buch passt? | Leseverständnis | Textsortenwissen: 1 aus 4 Buchcovern |
| Wörter schreiben | Rechtschreiben | Bild + Sprachausgabe → Wort tippen (Groß-/Kleinschreibung zählt in B1 nicht) |

## Auswertung

Die Lehrkraft-Ansicht zeigt Punkte je Kompetenzbereich, eine dreistufige Einschätzung
(„weit entwickelt“ / „auf dem Weg“ / „Förderhinweis“) und Förderhinweise nach den Regeln
des Handbuchs, u. a.:

- **ZZ** – Zahlzerlegungen/1±1 automatisieren (viele Fehler oder sehr langsame Antworten)
- **GV** – Grundvorstellungen zu Rechenoperationen (Rechengeschichten)
- **ZF** – zählendes Rechnen überwinden (gehäufte Fehler um ±1)
- **SW** – Stellenwertverständnis
- **LF / LF-W / LG / LV / RS** – Leseflüssigkeit, Lesegenauigkeit, Leseverständnis, Rechtschreiben

Sitzungen werden im `localStorage` des Browsers gespeichert und lassen sich als JSON exportieren.

## Entwicklung

```bash
npm run dev         # Dev-Server
npm run build       # Typecheck + Produktions-Build nach dist/
npm run preview     # gebautes Bundle ansehen
npm run lint        # ESLint
npm run typecheck   # tsc -b
npm test            # Vitest (einmalig)
npm run test:watch  # Vitest im Watch-Modus
```

Neue Aufgaben: Item-Typ in `src/types.ts` ergänzen, View in `src/tasks/` anlegen und in
`src/tasks/index.tsx` registrieren, Daten in `src/data/deutsch.ts` bzw. `src/data/mathe.ts`,
ggf. Förderregel in `src/engine/scoring.ts`.

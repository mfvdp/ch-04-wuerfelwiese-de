# Technik: Würfelwiese

Hier steht kurz, wie der Quelltext aufgebaut ist und wie du ihn baust. Die Begrüßung und die ersten Ideen zum Umbauen
stehen in `README.md`.

## Aufbau

Das ist ein Projekt für MakeCode Arcade, geschrieben in TypeScript. `pxt.json` nennt den Projektnamen `wuerfelwiese`
und alle Dateien in der Reihenfolge, in der MakeCode sie liest. `mkc.json` sagt, für welches Gerät gebaut wird: den
Calliope mini 3 mit GameKit (Variante „n3“).

Die Dateien des Spiels:

- `einstellungen.ts`: Einstellungen für den Platz des Spielstands im Flash-Speicher des Calliope.
- `welt.ts`: Die Welt und ihre Regeln: Blöcke, Bewegung der Figur, Abbauen, Setzen, Herstellen und der Spielstand.
- `strahlen.ts`: Sehstrahlen und das Bild der Welt in echtem 3D.
- `film.ts`: Das Intro mit Studiokarte und Titel.
- `ton.ts`: Die Klänge des Spiels: kurz, selbst erzeugt, ohne Audiodateien und ohne blockierendes Abspielen (alles läuft
  im Hintergrund).
- `training.ts`: Das Training in sieben Schritten auf einem abgetrennten Platz.
- `hacker.ts`: Die Bilder des Calliope Hackers, in den Farben der Palette dieses Spiels.
- `main.ts`: Start, Steuerung, Werkbank und Anzeige.

## So läuft das Spiel

1. `main.ts` lädt mit `entpackeSpielstand` den gespeicherten Spielstand. Gibt es keinen oder ist er beschädigt, baut
   `erzeugeWelt` eine neue, zufällige Welt. Auf dem Gerät startet das Spiel immer mit der schnellen Grafik.
2. `bereiteFilmVor` richtet das Intro ein: Flug zwischen schwebenden Inseln, Flug durch ein Tor, die Karte „Calliope
   Hacker präsentiert“ und der Spieltitel. `zeichneFilm` malt es, `aktualisiereFilm` lässt die Zeit laufen. Mit A
   springst du zur nächsten Station, mit MENU überspringst du alles.
3. Danach beginnt beim ersten Mal das Training (`starteTraining`, sieben kleine Aufgaben auf einem abgetrennten Platz),
   sonst erscheint das Titelbild.
4. In jedem Takt rechnet `aktualisiereSpiel` weiter: Tasten lesen, Figur bewegen (`rechnePhysik`), zielen
   (`aktualisiereZiel`), abbauen und setzen, Spielstand ab und zu speichern.
5. Die Funktion in `scene.createRenderable` zeichnet jedes Bild: die Welt (`zeichneWeltBild`, nur neu berechnet, wenn
   sich etwas geändert hat), Werkzeug, Leiste, Titel, Werkbank und Training.

Die Welt ist 24 Blöcke breit und tief und 12 Blöcke hoch. Jeder Block ist eine Zahl in `welt`; welche Zahl welcher Block
ist, steht in der Aufzählung `Block`. Das Bild entsteht mit Sehstrahlen: `verfolgeStrahl` läuft für jede Bildspalte und
Bildzeile von Block zu Block, bis es etwas trifft, und `trefferFarbe` wählt die Farbe.

## Bauen

- **Im Browser:** Öffne arcade.makecode.com, wähle „Importieren“ und öffne die Spieldatei `wuerfelwiese.hex`. In der
  Spieldatei steckt der ganze Quelltext. Der Simulator zeigt das Spiel sofort.
- **Am Computer:** Mit dem Kommandozeilenwerkzeug von MakeCode (npm-Paket `makecode`) rufst du in diesem Ordner
  `makecode build` auf. Die Spieldatei für das Gerät liegt danach in `built/n3/binary.hex`.

## Auf das Gerät

Steck den Calliope mini 3 mit dem USB-Kabel an den Computer. Er erscheint als Laufwerk. Zieh die Spieldatei (`.hex`)
auf dieses Laufwerk; danach startet das Spiel von selbst. Der Bildschirm des GameKit hat 160 × 120 Pixel und 16 Farben.
Das Spiel speichert über die Werkbank („Spiel speichern“) und etwa einmal in der Minute von selbst, wenn sich etwas
geändert hat. Wenn du ein anderes Programm aufspielst, löscht MakeCode beim nächsten Start den gespeicherten Spielstand.

Dieses Spiel gibt es auch auf Englisch, Französisch und Spanisch. Alle vier Fassungen entstehen aus demselben
Ausgangsprojekt.

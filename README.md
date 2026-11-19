# Würfelwiese

Hallo! Das ist **Würfelwiese**, ein Spiel von **Calliope Hacker** für den **Calliope mini 3 mit GameKit**.

Du stehst mitten in einer Welt aus Blöcken und schaust durch die Augen deiner Figur: Gras, Erde, Stein, Bäume und tief
unten leuchtende Kristalle. Baue Blöcke ab, setze sie woanders wieder hin und stelle an der Werkbank eine Hacke her. Mit
der Hacke kommst du schneller an die Kristalle. Dein Ziel: Sammle 5 Kristalle. Im Intro und auf dem Titelbild sitzt der
Calliope Hacker an seinem Schreibtisch; sogar in der Werkbank hängt ein Bild von ihm an der Wand.

## So spielst du

- **Steuerkreuz hoch und runter:** vorwärts und rückwärts laufen
- **Steuerkreuz links und rechts:** nach links und rechts drehen
- **A halten:** den Block vor dem Fadenkreuz abbauen
- **A kurz tippen:** springen
- **Im Sprung B tippen:** einen Block unter dich setzen, so kommst du aus jedem Loch heraus
- **B kurz drücken:** einen Block setzen
- **B halten und hoch oder runter:** nach oben und unten schauen
- **B halten und links oder rechts:** anderen Baustoff wählen
- **Menü:** Werkbank öffnen: Hacke und Bretter herstellen, Spiel speichern, zurück zum Start, neue Welt

## Selbst weiterbauen

Der ganze Quelltext steckt in dieser Spieldatei. Öffne sie in MakeCode Arcade (arcade.makecode.com, „Importieren“).
Ändere eine Zahl, starte den Simulator und schau, was passiert:

- **Schneller laufen:** In `welt.ts`, Funktion `rechnePhysik`, steht `vorwaerts * schrittMs * 7`. Mit `14` statt `7`
  läufst du doppelt so schnell.
- **Mehr Stein am Anfang:** In `welt.ts`, Funktion `erzeugeWelt`, steht `vorrat = [0, 0, 24, 16, 8, 0, 12, 0, 0]`. Die
  16 ist der Stein, mit dem du startest; versuch 99. Das gilt für jede neue Welt (Menü, „Neue Welt“).
- **Weiter greifen:** In `strahlen.ts`, Funktion `aktualisiereZiel`, steht `4 * 1024`. Das sind 4 Blöcke Reichweite. Mit
  `8 * 1024` erreichst du doppelt so weit entfernte Blöcke.

Die Welt ist 24 Blöcke breit und tief und 12 Blöcke hoch.

Die Erklärung des Quelltexts für Kinder, Eltern und Lehrkräfte steht auf calliope-hacker.de.

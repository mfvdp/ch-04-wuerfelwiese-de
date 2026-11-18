// Start, Steuerung, Werkbank und Anzeige.
// Der Spielname steht nur hier im Code; Film und Titelbild nehmen ihn von hier.
// Der Projektname steht in pxt.json und ist zugleich der Speicherbereich für die Spielstände.
const TITEL = "WÜRFELWIESE"
// Unter diesem Schlüssel liegt der Spielstand in settings.
const SPIELSTAND_SCHLUESSEL = "wuerfelwiese-v1"
// Nach einem Bildwechsel zählt ein Tastendruck erst nach dieser Zeit (gegen wildes Hämmern auf die Tasten).
const BILD_RUHE_MS = 500
// Bild an der Wand der Werkbank: linke obere Ecke des Bildes, ein Pixel Rahmen darum.
const WANDBILD_X = 129
const WANDBILD_Y = 11
let titelOffen = true
let titelSeitMs = 0
let menueRuheBisMs = 0
let lautstaerkeUngespeichert = false
let menueOffen = false
let menueZeile = 0
const MENUE_ZEILEN = 12
let neueWeltGefragt = false
let bBenutzt = false
let tastenGesperrt = true
let filmWiederholung = false
let abbauMs = 0
let abbauX = -1
let abbauY = -1
let abbauZ = -1
let letzteAktualisierungMs = 0
let letztesSpeichernMs = -11000
let letzteSpeicherpruefungMs = 0
let meldung = ""
let meldungBisMs = 0
let geladen = false
let letzterSchwungMs = -1000
let letzterSchrittMs = -1000
let wippPhase = 0
let splitterStartMs = -1000
let splitterFarbe = 14
let symbolOben = [9, 7, 4, 13, 4, 7, 13, 1, 11]
let symbolVorn = [9, 6, 14, 11, 14, 6, 4, 9, 12]
let symbolSeite = [9, 14, 12, 12, 12, 6, 14, 8, 15]
let szeneStand = 0
let gezeichneterStand = -1
let weltBildX = -1
let weltBildY = -1
let weltBildZ = -1
let weltBildDrehung = -1
let weltBildNeigung = -2
let weltBildBreite = 0
let weltBild = image.create(160, 120)
let titelSchriftzug: Image = null

function fordereNeuesBildAn() {
    szeneStand++
}
function melde(text: string) {
    meldung = text
    meldungBisMs = game.runtime() + 2500
}
function speichereSpiel(): boolean {
    // Der Trainingsplatz darf den echten Spielstand nie überschreiben.
    if (trainingLaeuft) return false
    if (game.runtime() - letztesSpeichernMs < 11000) {
        melde("Speichern: bitte warten")
        return false
    }
    settings.writeBuffer(SPIELSTAND_SCHLUESSEL, packeSpielstand())
    letztesSpeichernMs = game.runtime()
    ungespeichert = false
    melde("Spiel gespeichert")
    return true
}
function starteSpiel() {
    titelOffen = false
    menueOffen = false
    tastenGesperrt = true
    bBenutzt = true
    abbauMs = 0
    aktualisiereZiel()
    fordereNeuesBildAn()
    melde(hatHacke ? "Hacke bereit. Los!" : "MENU: Baue deine Hacke")
}
function nachDemFilm() {
    music.stopAllSounds()
    if (filmWiederholung) {
        filmWiederholung = false
        starteSpiel()
    } else if (!trainingGeschafft) starteTraining()
    else {
        titelOffen = true
        titelSeitMs = game.runtime()
        tastenGesperrt = true
        fordereNeuesBildAn()
    }
}
function titelBereit(): boolean {
    return game.runtime() - titelSeitMs >= BILD_RUHE_MS
}
function wechsleBaustoff(richtung: number) {
    gewaehlt = (gewaehlt + richtung + baustoffe.length) % baustoffe.length
    ungespeichert = true
    melde(blockNamen[baustoffe[gewaehlt]])
    pruefeTrainingAktion(2)
}
function schalteMenueUm() {
    menueOffen = !menueOffen
    menueZeile = 0
    neueWeltGefragt = false
    bBenutzt = true
    tastenGesperrt = true
    abbauMs = 0
}
function fuehreMenueZeileAus() {
    if (trainingLaeuft) {
        if (trainingSchritt == 7 && stelleHackeHer()) {
            pruefeTrainingAktion(3)
        }
        return
    }
    if (menueZeile == 0) wechsleBaustoff(1)
    else if (menueZeile == 1) {
        let gebaut = stelleHackeHer()
        melde(gebaut ? "Hacke gebaut!"
            : hatHacke ? "Hacke schon vorhanden"
            : "2 Holz + 3 Stein nötig")
        if (gebaut) spieleKlang(2)
    } else if (menueZeile == 2) {
        let hergestellt = stelleBretterHer()
        melde(hergestellt ? "4 Bretter hergestellt" : "1 Holz fehlt / voll")
        if (hergestellt) spieleKlang(2)
    } else if (menueZeile == 3) speichereSpiel()
    else if (menueZeile == 4) {
        strahlBreite = istGeraet ? (strahlBreite == 8 ? 4 : 8) : (strahlBreite == 4 ? 8 : strahlBreite == 8 ? 2 : 4)
        ungespeichert = true
        melde(strahlBreite == 8 ? "Grafik: Schnell"
            : strahlBreite == 2 ? "Fein: mehr Rechenlast"
            : "Grafik: Normal")
        fordereNeuesBildAn()
    } else if (menueZeile == 5) {
        neigung = -0.16
        aktualisiereZiel()
        ungespeichert = true
        melde("Blick geradeaus")
    } else if (menueZeile == 6) {
        geheZumStart()
        starteSpiel()
        melde("Zurück am Start")
    } else if (menueZeile == 7) starteTraining()
    else if (menueZeile == 8) {
        menueOffen = false
        titelOffen = true
        filmWiederholung = true
        tastenGesperrt = true
        letztesFilmKapitel = -1
        music.stopAllSounds()
        bereiteFilmVor()
    } else if (menueZeile == 9) {
        tonAn = !tonAn
        if (!tonAn) music.stopAllSounds()
    } else if (menueZeile == 11) {
        // Die Lautstärke wird erst beim Schließen des Menüs gespeichert (aktualisiereSpiel), nicht bei jedem Druck.
        music.setVolume(music.volume() >= 255 ? 0 : Math.min(255, music.volume() + 64))
        lautstaerkeUngespeichert = true
    } else if (!neueWeltGefragt) {
        neueWeltGefragt = true
        melde("Neue Welt? B bestätigt")
    } else {
        erzeugeWelt()
        let gespeichert = speichereSpiel()
        starteSpiel()
        melde(gespeichert ? "Neue Welt gespeichert" : "Neue Welt: speichern!")
    }
}
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    // Die MENU-Taste überspringt Film, Titelbild und Training auf einmal; ein zweiter, gehämmerter Druck öffnet danach
    // nicht sofort die Werkbank. Im Werkbank-Schritt des Trainings (Schritt 7) öffnet MENU dagegen die Werkbank.
    let jetzt = game.runtime()
    if (jetzt < menueRuheBisMs) return
    if (!filmFertig) {
        ueberspringeFilm()
        music.stopAllSounds()
        filmWiederholung = false
        starteSpiel()
        menueRuheBisMs = jetzt + BILD_RUHE_MS
    } else if (trainingLaeuft) {
        if (trainingSchritt == 7 && !menueOffen) {
            menueOffen = true
            menueZeile = 1
            tastenGesperrt = true
            bBenutzt = true
        } else {
            beendeTraining(false)
            menueRuheBisMs = jetzt + BILD_RUHE_MS
        }
    } else if (titelOffen) {
        if (titelBereit()) {
            starteSpiel()
            menueRuheBisMs = jetzt + BILD_RUHE_MS
        }
    } else schalteMenueUm()
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!filmFertig) {
        // Ein Druck springt eine Station weiter: Flug -> Karte -> Titel -> Training oder Titelbild; nach „Intro
        // ansehen“ in der Werkbank geht es danach direkt ins Spiel.
        if (springeZurNaechstenStation()) {
            music.stopAllSounds()
            if (filmFertig) nachDemFilm()
        }
    } else if (trainingLaeuft && trainingAmEnde) beendeTraining(true)
    else if (titelOffen) {
        if (titelBereit()) starteSpiel()
    } else if (menueOffen) {
        menueOffen = false
        neueWeltGefragt = false
        tastenGesperrt = true
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    bBenutzt = !filmFertig || titelOffen || menueOffen || tastenGesperrt
    if (!filmFertig) return
    if (titelOffen) {
        if (titelBereit()) starteTraining()
    }
    else if (menueOffen) fuehreMenueZeileAus()
})
controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (filmFertig && !titelOffen && !menueOffen && !bBenutzt && !tastenGesperrt &&
        (!trainingLaeuft || trainingSchritt == 5)) {
        aktualisiereZiel()
        if (!hatZiel) melde("Ziel außer Reichweite")
        else if (setzeBlock(platzX, platzY, platzZ)) {
            spieleKlang(1)
            letzterSchwungMs = game.runtime()
            fordereNeuesBildAn()
            pruefeTrainingAktion(1)
        } else melde("Kein Platz / Material")
        aktualisiereZiel()
    }
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (menueOffen && !trainingLaeuft) {
        menueZeile = (menueZeile + MENUE_ZEILEN - 1) % MENUE_ZEILEN
        neueWeltGefragt = false
    }
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (menueOffen && !trainingLaeuft) {
        menueZeile = (menueZeile + 1) % MENUE_ZEILEN
        neueWeltGefragt = false
    }
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (filmFertig && !titelOffen && !menueOffen && !tastenGesperrt && controller.B.isPressed() &&
        (!trainingLaeuft || trainingSchritt == 6)) {
        bBenutzt = true
        wechsleBaustoff(-1)
    } else if (menueOffen && menueZeile == 0 && !trainingLaeuft) wechsleBaustoff(-1)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (filmFertig && !titelOffen && !menueOffen && !tastenGesperrt && controller.B.isPressed() &&
        (!trainingLaeuft || trainingSchritt == 6)) {
        bBenutzt = true
        wechsleBaustoff(1)
    } else if (menueOffen && menueZeile == 0 && !trainingLaeuft) wechsleBaustoff(1)
})
function aktualisiereSpiel() {
    let jetzt = game.runtime()
    let vergangenMs = Math.max(1, jetzt - letzteAktualisierungMs)
    let schrittMs = Math.min(80, vergangenMs)
    letzteAktualisierungMs = jetzt
    if (!controller.A.isPressed() && !controller.B.isPressed()) tastenGesperrt = false
    if (lautstaerkeUngespeichert && !menueOffen) {
        settings.writeNumber("#volume", music.volume())
        lautstaerkeUngespeichert = false
    }
    if (!filmFertig) {
        aktualisiereFilm(Math.min(250, vergangenMs))
        spieleFilmTon(filmKapitel)
        if (filmFertig) nachDemFilm()
        return
    }
    if (titelOffen || menueOffen) return
    if (trainingLaeuft && (trainingSchritt == 0 || trainingSchritt == 8)) {
        aktualisiereTraining(schrittMs, 0, 0)
        return
    }
    let vorwaerts = (controller.up.isPressed() ? 1 : 0) - (controller.down.isPressed() ? 1 : 0)
    let drehRichtung = (controller.right.isPressed() ? 1 : 0) - (controller.left.isPressed() ? 1 : 0)
    let neigeRichtung = 0
    if (trainingLaeuft && trainingSchritt != 1 && trainingSchritt != 3) vorwaerts = 0
    if (trainingLaeuft && trainingSchritt != 2 && trainingSchritt != 6) drehRichtung = 0
    if (controller.B.isPressed()) {
        if (controller.up.isPressed() || controller.down.isPressed() || controller.left.isPressed() ||
            controller.right.isPressed() || controller.A.isPressed()) bBenutzt = true
        if (vorwaerts != 0 && (!trainingLaeuft || trainingSchritt == 3)) {
            neigeRichtung = vorwaerts
            neigung = Math.max(-1.2, Math.min(1.2, neigung + vorwaerts * schrittMs * 0.0017))
            ungespeichert = true
        }
        vorwaerts = 0
        drehRichtung = 0
    } else {
        if (trainingLaeuft && trainingSchritt == 3) vorwaerts = 0
        drehung = (drehung + drehRichtung * schrittMs * 0.0019 + 2 * Math.PI) % (2 * Math.PI)
    }
    let vorherX = figurX
    let vorherY = figurY
    let vorherZ = figurZ
    rechnePhysik(vorwaerts, schrittMs)
    if (figurX != vorherX || figurZ != vorherZ) {
        letzterSchrittMs = jetzt
        wippPhase += schrittMs * 0.014
    }
    if (figurX != vorherX || figurY != vorherY || figurZ != vorherZ || drehRichtung != 0) ungespeichert = true
    aktualisiereZiel()
    if (!tastenGesperrt && controller.A.isPressed() && !controller.B.isPressed() && hatZiel &&
        (!trainingLaeuft || trainingSchritt == 4)) {
        if (abbauX != zielX || abbauY != zielY || abbauZ != zielZ) abbauMs = 0
        abbauX = zielX
        abbauY = zielY
        abbauZ = zielZ
        abbauMs += schrittMs
        let abbauDauerMs = zielBlock == Block.Stein || zielBlock == Block.Kristall
            ? (hatHacke ? 220 : 600) : 300
        if (abbauMs >= abbauDauerMs) {
            let art = zielBlock
            if (baueBlockAb(zielX, zielY, zielZ)) {
                letzterSchwungMs = jetzt
                splitterStartMs = jetzt
                splitterFarbe = symbolVorn[art]
                fordereNeuesBildAn()
                spieleKlang(art == Block.Kristall ? 3 : 0)
                if (kristalleGefunden == 5 && art == Block.Kristall) melde("5 Kristalle! Geschafft!")
                pruefeTrainingAktion(0)
            } else melde(art == Block.Grundfels ? "Grundfels bleibt stehen"
                : "Inventar voll")
            abbauMs = 0
            aktualisiereZiel()
        }
    } else abbauMs = 0
    aktualisiereTraining(schrittMs, drehRichtung, neigeRichtung)
    if (!trainingLaeuft && jetzt - letzteSpeicherpruefungMs >= 60000) {
        letzteSpeicherpruefungMs = jetzt
        if (ungespeichert) speichereSpiel()
    }
}
function zeichneWeltBild(leinwand: Image) {
    if (gezeichneterStand != szeneStand ||
        weltBildX != figurX || weltBildY != figurY || weltBildZ != figurZ ||
        weltBildDrehung != drehung || weltBildNeigung != neigung || weltBildBreite != strahlBreite) {
        zeichneWelt(weltBild)
        gezeichneterStand = szeneStand
        weltBildX = figurX
        weltBildY = figurY
        weltBildZ = figurZ
        weltBildDrehung = drehung
        weltBildNeigung = neigung
        weltBildBreite = strahlBreite
    }
    leinwand.drawImage(weltBild, 0, 0)
}
function zeichneWerkzeug(leinwand: Image) {
    let alterMs = game.runtime() - letzterSchwungMs
    let schwung = alterMs < 220 ? Math.sin(alterMs * Math.PI / 220) : 0
    if (abbauMs > 0) schwung = (1 + Math.sin(abbauMs * 0.027)) / 2
    let figurGeht = game.runtime() - letzterSchrittMs < 120
    let x = Math.round(141 - schwung * 13 + (figurGeht ? Math.sin(wippPhase) * 2 : 0))
    let y = Math.round(97 - schwung * 9 + (figurGeht ? Math.abs(Math.cos(wippPhase)) * 2 : 0))
    // Breite Flächen in mehreren Farben geben Unterarm und Werkzeug Körper, auch bei nur 160 x 120 Pixeln.
    for (let zeile = 0; zeile < 21; zeile++) {
        let links = x - 2 + Math.idiv(zeile, 3)
        leinwand.fillRect(links, y + zeile - 5, 15, 1, zeile < 11 ? 14 : 15)
        leinwand.fillRect(links + 1, y + zeile - 5, 10, 1, zeile < 10 ? 3 : 8)
        if (zeile < 9) leinwand.fillRect(links + 1, y + zeile - 5, 3, 1, 13)
        else if (zeile > 11) leinwand.fillRect(links + 2, y + zeile - 5, 3, 1, 12)
    }
    leinwand.drawLine(x, y - 5, x + 8, y - 5, 1)
    leinwand.drawLine(x + 8, y - 2, x + 8, y + 3, 14)
    if (hatHacke) {
        for (let i = 0; i < 5; i++) {
            leinwand.drawLine(x - 5 + i, y + 5, x + 5 + i, y - 22,
                i == 0 || i == 4 ? 15 : i == 1 ? 4 : 14)
        }
        for (let zeile = 0; zeile < 5; zeile++) {
            leinwand.drawLine(x - 7, y - 24 + zeile, x + 11, y - 20 + zeile,
                zeile == 0 ? 1 : zeile < 3 ? 13 : 11)
        }
        leinwand.drawLine(x - 7, y - 24, x - 12, y - 17, 11)
        leinwand.drawLine(x - 6, y - 23, x - 11, y - 17, 13)
        leinwand.drawLine(x + 11, y - 20, x + 15, y - 12, 11)
        leinwand.drawLine(x + 12, y - 20, x + 16, y - 11, 12)
    }
}
function zeichneSplitter(leinwand: Image) {
    let alterMs = game.runtime() - splitterStartMs
    if (alterMs < 0 || alterMs > 480) return
    // Zehn Splitter auf berechneten Bahnen: keine Objekte für einzelne Teilchen im Speicher (Heap).
    for (let i = 0; i < 10; i++) {
        let flugzeit = Math.max(0, alterMs - i * 7) / 65
        let x = Math.round(80 + ((i * 7 % 11) - 5) * flugzeit)
        let y = Math.round(60 - (3 + i % 4) * flugzeit + flugzeit * flugzeit * 0.65)
        let groesse = alterMs < 180 ? 3 : 2
        leinwand.fillRect(x, y, groesse, groesse, i % 3 == 0 ? 13 : splitterFarbe)
        if (groesse == 3) leinwand.setPixel(x, y, 1)
    }
}
function zeichneBlockSymbol(leinwand: Image, x: number, y: number, art: number) {
    leinwand.drawLine(x + 4, y, x + 8, y + 2, symbolOben[art])
    leinwand.drawLine(x + 2, y + 1, x + 7, y + 3, symbolOben[art])
    leinwand.drawLine(x, y + 2, x + 4, y + 4, symbolOben[art])
    for (let i = 0; i < 5; i++) {
        leinwand.drawLine(x, y + 3 + i, x + 4, y + 5 + i, symbolVorn[art])
        leinwand.drawLine(x + 5, y + 5 + i, x + 9, y + 3 + i, symbolSeite[art])
    }
    if (art == Block.Holz) leinwand.drawLine(x + 2, y + 5, x + 2, y + 8, 12)
    if (art == Block.Bretter) leinwand.drawLine(x, y + 6, x + 4, y + 8, 14)
    if (art == Block.Kristall) leinwand.setPixel(x + 2, y + 5, 1)
}
function zeichneLeiste(leinwand: Image) {
    leinwand.fillRect(0, 0, 160, 10, 15)
    leinwand.print(hatHacke ? "HACKE" : "HAND", 2, 1, hatHacke ? 5 : 1, image.font8)
    leinwand.print("*" + kristalleGefunden + "/5", 58, 1, 9, image.font8)
    leinwand.print("MENU", 134, 1, 1, image.font8)
    if (trainingLaeuft || titelOffen) {
        leinwand.fillRect(0, 112, 160, 10, 15)
        leinwand.print(blockNamen[baustoffe[gewaehlt]] + " " + vorrat[baustoffe[gewaehlt]],
            2, 111, 5, image.font8)
        if (hatZiel) {
            leinwand.print(blockNamen[zielBlock],
                160 - blockNamen[zielBlock].length * 6, 111, 1, image.font8)
        }
    } else {
        // Die sechs Baustoffe sind auf einen Blick zu sehen, mit ihrer Menge.
        for (let i = 0; i < 6; i++) {
            let x = 20 + i * 20
            leinwand.fillRect(x, 100, 20, 20, 15)
            leinwand.drawRect(x, 100, 20, 20, i == gewaehlt ? 5 : 12)
            if (i == gewaehlt) leinwand.drawLine(x + 2, 101, x + 17, 101, 13)
            zeichneBlockSymbol(leinwand, x + 5, 102, baustoffe[i])
            let menge = "" + vorrat[baustoffe[i]]
            leinwand.print(menge, x + 19 - menge.length * 6, 113, i == gewaehlt ? 5 : 13, image.font5)
        }
        let beschriftung = blockNamen[baustoffe[gewaehlt]]
        leinwand.fillRect(78 - beschriftung.length * 3, 91, beschriftung.length * 6 + 4, 8, 15)
        leinwand.print(beschriftung, 80 - beschriftung.length * 3, 92, 1, image.font8)
    }
    leinwand.drawLine(75, 60, 85, 60, 15)
    leinwand.drawLine(80, 55, 80, 65, 15)
    let kreuzFarbe = hatZiel ? 5 : 1
    leinwand.drawLine(76, 60, 78, 60, kreuzFarbe)
    leinwand.drawLine(82, 60, 84, 60, kreuzFarbe)
    leinwand.drawLine(80, 56, 80, 58, kreuzFarbe)
    leinwand.drawLine(80, 62, 80, 64, kreuzFarbe)
    if (abbauMs > 0) {
        let abbauDauerMs = zielBlock == Block.Stein || zielBlock == Block.Kristall
            ? (hatHacke ? 220 : 600) : 300
        leinwand.fillRect(73, 68, Math.min(15, Math.idiv(abbauMs * 15, abbauDauerMs)), 2, 5)
    }
    if (meldungBisMs > game.runtime() && !menueOffen && !trainingLaeuft) {
        leinwand.fillRect(0, 82, 160, 10, 15)
        leinwand.print(meldung, 2, 83, 5, image.font8)
    }
}
function zeichneMenue(leinwand: Image) {
    leinwand.fillRect(5, 9, 150, 101, 15)
    leinwand.drawRect(5, 9, 150, 101, 6)
    // Bild an der Wand: der Calliope Hacker an seinem Schreibtisch, im Holzrahmen.
    leinwand.drawRect(WANDBILD_X - 1, WANDBILD_Y - 1, hacker.WANDBILD.width + 2, hacker.WANDBILD.height + 2, 14)
    leinwand.drawImage(hacker.WANDBILD, WANDBILD_X, WANDBILD_Y)
    if (trainingLaeuft) {
        leinwand.print("DEINE ERSTE HACKE", 15, 17, 7)
        leinwand.print("2 Holz + 3 Stein", 20, 38, 1, image.font8)
        leinwand.print("Holz: " + vorrat[Block.Holz], 20, 51, 13, image.font8)
        leinwand.print("Stein: " + vorrat[Block.Stein], 20, 61, 13, image.font8)
        leinwand.fillRect(14, 77, 131, 13, 8)
        leinwand.print("B: HACKE HERSTELLEN", 23, 81, 5, image.font8)
        leinwand.print("A: Zurück", 50, 98, 1, image.font8)
        return
    }
    leinwand.print("WERKBANK & PAUSE", 11, 14, 7)
    leinwand.print("Holz " + vorrat[Block.Holz] +
        "  Stein " + vorrat[Block.Stein], 11, 26, 13, image.font8)
    let zeilen = [
        "Block: " + blockNamen[baustoffe[gewaehlt]],
        hatHacke ? "Hacke: vorhanden" : "Hacke: 2 Holz+3 Stein",
        "4 Bretter: 1 Holz",
        "Spiel speichern",
        strahlBreite == 4 ? "Grafik: Normal"
            : strahlBreite == 8 ? "Grafik: Schnell"
            : "Grafik: Fein (PC)",
        "Blick geradeaus",
        "Zurück zum Start",
        "Training wiederholen",
        "Intro ansehen",
        tonAn ? "Ton: an" : "Ton: aus",
        neueWeltGefragt ? "Neue Welt? B = Ja" : "Neue Welt",
        "Lautstärke " + music.volume()
    ]
    let ersteZeile = Math.max(0, Math.min(MENUE_ZEILEN - 6, menueZeile - 2))
    for (let i = 0; i < 6; i++) {
        let zeilenNummer = ersteZeile + i
        // Die gewählte Zeile zeigt der Balken; ohne „> “ passt jede Zeile vor die Bildlaufleiste.
        if (zeilenNummer == menueZeile) leinwand.fillRect(9, 36 + i * 9, 142, 9, 8)
        leinwand.print(zeilen[zeilenNummer], 11, 38 + i * 9, 1, image.font8)
    }
    leinwand.print(meldungBisMs > game.runtime() ? meldung : "B: OK A/MENU: Zurück",
        10, 98, 5, image.font8)
    leinwand.fillRect(152, 36, 2, 54, 12)
    leinwand.fillRect(152, 36 + Math.idiv(menueZeile * 46, MENUE_ZEILEN - 1), 2, 8, 9)
}
function druckeMittig(leinwand: Image, text: string, y: number, farbe: number) {
    leinwand.print(text, 80 - text.length * 3, y, farbe, image.font8)
}
function zeichneTitel(leinwand: Image) {
    leinwand.fillRect(7, 12, 146, 98, 15)
    leinwand.drawRect(7, 12, 146, 98, 6)
    // Der Spieltitel sieht aus wie im Film und wird einmal in ein Bild gezeichnet; die Größe richtet sich
    // nach dem Namen.
    if (!titelSchriftzug) {
        titelSchriftzug = image.create(160, 30)
        zeichneBuchstaben(titelSchriftzug, filmTitelBild, 2, titelMassstab(136), 100000, -10240, true, -1)
    }
    leinwand.drawTransparentImage(titelSchriftzug, 0, 13)
    // Der Calliope Hacker am Schreibtisch, vor einer Wand in der Farbe hacker.WANDFARBE.
    leinwand.fillRect(48, 39, hacker.TITELBILD.width, hacker.TITELBILD.height, hacker.WANDFARBE)
    leinwand.drawTransparentImage(hacker.TITELBILD, 48, 39)
    druckeMittig(leinwand,
        geladen ? "A: Abenteuer fortsetzen" : "A: Dein Abenteuer", 84, 5)
    druckeMittig(leinwand, "B: Training spielen", 96, 1)
}

geladen = entpackeSpielstand(settings.readBuffer(SPIELSTAND_SCHLUESSEL))
if (!geladen) {
    strahlBreite = istGeraet ? 8 : 2
    erzeugeWelt()
}
// Auf dem Gerät startet das Spiel immer sparsam (schnelle Grafik), auch mit älteren oder importierten Spielständen.
// „Normal“ bleibt für die laufende Sitzung im Menü wählbar.
if (istGeraet) strahlBreite = 8
aktualisiereZiel()
bereiteFilmVor()
music.setVolume(settings.exists("#volume") ? settings.readNumber("#volume") : 90)
letzteAktualisierungMs = game.runtime()
letzteSpeicherpruefungMs = letzteAktualisierungMs
game.onUpdate(aktualisiereSpiel)
scene.createRenderable(0, function (leinwand: Image) {
    if (!filmFertig) {
        zeichneFilm(leinwand)
        return
    }
    zeichneWeltBild(leinwand)
    if (!titelOffen && !menueOffen) zeichneSplitter(leinwand)
    if (!titelOffen) zeichneWerkzeug(leinwand)
    zeichneLeiste(leinwand)
    if (titelOffen) zeichneTitel(leinwand)
    if (menueOffen) zeichneMenue(leinwand)
    if (trainingLaeuft) zeichneTraining(leinwand)
})

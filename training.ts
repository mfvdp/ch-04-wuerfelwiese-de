// Das Training in acht Schritten auf einem abgetrennten Platz. Der echte Spielstand wird am Ende wiederhergestellt.
let trainingLaeuft = false
let trainingSchritt = 0
let trainingMs = 0
let trainingFortschritt = 0
let spielstandKopie: Buffer = null
let trainingStartZ = 0
let trainingAmEnde = false
let warUngespeichert = false
// Schritt 8 übt Springen und Hochbauen in einem Loch, Schritt 9 ist die Schlusskarte.
const TRAINING_SPRUNG = 8
const TRAINING_ENDE = 9
let trainingUeberschriften = [
    "DEIN ABENTEUER BEGINNT",
    "01  BEWEGEN",
    "02  UMSCHAUEN",
    "03  HOCH & RUNTER",
    "04  HOLZ SAMMELN",
    "05  DEIN ERSTER BLOCK",
    "06  MATERIAL WECHSELN",
    "07  DIE WERKBANK",
    "08  RAUS AUS DEM LOCH",
    "BEREIT FÜR DEINE WELT"
]
let trainingZeile1 = [
    "Lerne die Welt kennen.",
    "Halte HOCH zum Laufen.",
    "Halte LINKS oder RECHTS.",
    "Halte B und HOCH/RUNTER.",
    "Ziele auf das Holz.",
    "Tippe B kurz an.",
    "Halte B + RECHTS.",
    "Öffne MENU.",
    "Tippe A: Du springst.",
    "Erkunde. Sammle. Baue."
]
let trainingZeile2 = [
    "Acht kleine Aufgaben.",
    "Geh zum Trainingsblock.",
    "So drehst du dich.",
    "Bewege deinen Blick.",
    "Halte A zum Abbauen.",
    "Baue vor dem Stein.",
    "Wähle einen Baustoff.",
    "Stelle eine Hacke her.",
    "Dann B: Block unter dich.",
    "A: Auf ins Abenteuer!"
]

function starteTraining() {
    // Auch beim Wiederholen des Trainings bleiben Welt, Vorrat und Position des echten Spiels erhalten.
    warUngespeichert = ungespeichert
    spielstandKopie = packeSpielstand()
    erzeugeWelt()
    for (let x = 9; x <= 15; x++) {
        for (let z = 3; z <= 10; z++) {
            schreibeBlock(x, 3, z, Block.Gras)
            for (let y = 4; y < WELT_HOEHE; y++) schreibeBlock(x, y, z, Block.Luft)
        }
    }
    schreibeBlock(12, 4, 7, Block.Holz)
    schreibeBlock(12, 5, 7, Block.Holz)
    schreibeBlock(12, 4, 8, Block.Stein)
    schreibeBlock(12, 5, 8, Block.Stein)
    trainingLaeuft = true
    trainingSchritt = 0
    trainingMs = 0
    trainingFortschritt = 0
    trainingStartZ = figurZ
    trainingAmEnde = false
    titelOffen = false
    menueOffen = false
    tastenGesperrt = true
    bBenutzt = true
    abbauMs = 0
    meldungBisMs = 0
    aktualisiereZiel()
    fordereNeuesBildAn()
}
function beendeTraining(geschafft: boolean) {
    if (!trainingLaeuft) return
    if (spielstandKopie) entpackeSpielstand(spielstandKopie)
    ungespeichert = warUngespeichert
    spielstandKopie = null
    trainingLaeuft = false
    trainingAmEnde = false
    menueOffen = false
    titelOffen = false
    tastenGesperrt = true
    bBenutzt = true
    abbauMs = 0
    if (geschafft) {
        trainingGeschafft = true
        ungespeichert = true
        speichereSpiel()
        melde("Dein Abenteuer beginnt!")
    } else melde("Training beendet")
    aktualisiereZiel()
    fordereNeuesBildAn()
}
function geheZumNaechstenSchritt() {
    trainingSchritt++
    trainingMs = 0
    trainingFortschritt = 0
    abbauMs = 0
    tastenGesperrt = true
    bBenutzt = true
    spieleKlang(2)
    if (trainingSchritt == 3 || trainingSchritt == 4 || trainingSchritt == 5) {
        drehung = 0
        neigung = -0.16
    }
    if (trainingSchritt == 4) {
        figurX = 12 * EINHEIT + 128
        figurZ = 5 * EINHEIT + 128
        figurY = 4 * EINHEIT
        fallTempo = 0
    }
    if (trainingSchritt == TRAINING_SPRUNG) {
        // Ein Loch, zwei Blöcke tief: Herauslaufen geht nicht, Hochbauen schon.
        menueOffen = false
        schreibeBlock(10, 1, 5, Block.Stein)
        schreibeBlock(10, 2, 5, Block.Luft)
        schreibeBlock(10, 3, 5, Block.Luft)
        figurX = 10 * EINHEIT + 128
        figurZ = 5 * EINHEIT + 128
        figurY = 2 * EINHEIT
        fallTempo = 0
        springt = false
        drehung = 0
        neigung = -0.16
    }
    if (trainingSchritt == TRAINING_ENDE) {
        trainingAmEnde = true
        menueOffen = false
    }
    aktualisiereZiel()
    fordereNeuesBildAn()
}
function pruefeTrainingAktion(aktion: number) {
    if (!trainingLaeuft) return
    if ((trainingSchritt == 4 && aktion == 0) || (trainingSchritt == 5 && aktion == 1) ||
        (trainingSchritt == 6 && aktion == 2) || (trainingSchritt == 7 && aktion == 3)) geheZumNaechstenSchritt()
}
function aktualisiereTraining(schrittMs: number, drehRichtung: number, neigeRichtung: number) {
    if (!trainingLaeuft) return
    trainingMs += schrittMs
    if (trainingSchritt == 0 && trainingMs >= 2600) geheZumNaechstenSchritt()
    else if (trainingSchritt == 1) {
        trainingFortschritt = Math.min(1, Math.max(0, (figurZ - trainingStartZ) / 160))
        if (trainingFortschritt >= 1) geheZumNaechstenSchritt()
    } else if (trainingSchritt == 2) {
        trainingFortschritt += Math.abs(drehRichtung) * schrittMs / 260
        if (trainingFortschritt >= 1) geheZumNaechstenSchritt()
    } else if (trainingSchritt == 3) {
        trainingFortschritt += Math.abs(neigeRichtung) * schrittMs / 260
        if (trainingFortschritt >= 1) geheZumNaechstenSchritt()
    } else if (trainingSchritt == TRAINING_SPRUNG && figurY >= 4 * EINHEIT && figurStoesstAn(figurX, figurY - 1, figurZ)) {
        // Geschafft, sobald die Figur wieder oben auf der Wiese steht.
        geheZumNaechstenSchritt()
    }
}
function zeichneTraining(leinwand: Image) {
    if (trainingSchritt == 0 || trainingSchritt == TRAINING_ENDE) {
        leinwand.fillRect(4, 30, 152, 61, 15)
        leinwand.drawRect(4, 30, 152, 61, 6)
        let titel = trainingUeberschriften[trainingSchritt]
        leinwand.print(titel.substr(0, Math.min(titel.length, Math.idiv(trainingMs, 35))),
            9, 38, 7, image.font8)
        leinwand.print(trainingZeile1[trainingSchritt], 11, 53, 1, image.font8)
        leinwand.print(trainingZeile2[trainingSchritt], 11, 64, 13, image.font8)
        if (trainingSchritt == 0) {
            leinwand.fillRect(11, 81, Math.min(138, Math.idiv(trainingMs * 138, 2600)), 2, 9)
        } else {
            let leuchten = Math.idiv(trainingMs, 250) % 2 == 0 ? 5 : 13
            let losText = "A: LOS!"
            leinwand.print(losText, 80 - losText.length * 3, 79, leuchten, image.font8)
        }
    } else if (!menueOffen) {
        leinwand.fillRect(0, 80, 160, 32, 15)
        leinwand.drawLine(0, 80, 159, 80, 6)
        leinwand.print(trainingUeberschriften[trainingSchritt], 4, 84, 5, image.font8)
        leinwand.print(trainingZeile1[trainingSchritt], 4, 94, 1, image.font8)
        leinwand.print(trainingZeile2[trainingSchritt], 4, 103, 13, image.font8)
        for (let i = 0; i < 8; i++) {
            leinwand.fillRect(114 + i * 6, 73, 4, 3,
                i < trainingSchritt - 1 ? 7 : i == trainingSchritt - 1 ? 5 : 12)
        }
    }
    leinwand.fillRect(0, 0, 160, 8, 15)
    leinwand.print("TRAINING " + Math.min(8, trainingSchritt) + "/8", 2, 1, 9, image.font8)
    leinwand.print(trainingSchritt == 7 ? "MENU" : "MENU: ENDE",
        trainingSchritt == 7 ? 134 : 88, 1, 13, image.font8)
}

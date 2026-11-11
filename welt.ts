// Die Welt und ihre Regeln: Blöcke, Bewegung der Figur, Abbauen, Setzen, Herstellen und der Spielstand.
// Alle Positionen sind in 256stel Blöcken angegeben (ein Block ist EINHEIT = 256 breit), damit man ohne Kommazahlen
// rechnen kann. Y zeigt nach oben.
const WELT_BREITE = 24
const WELT_HOEHE = 12
const EINHEIT = 256
const FIGUR_HALBBREITE = 62
const FIGUR_HOEHE = 410
const AUGENHOEHE = 350
const BLOCKANZAHL = WELT_BREITE * WELT_BREITE * WELT_HOEHE
const SPIELSTAND_GROESSE = 64 + BLOCKANZAHL / 2 + 2
enum Block { Luft, Gras, Erde, Stein, Holz, Laub, Bretter, Kristall, Grundfels }
let welt = control.createBuffer(BLOCKANZAHL)
let vorrat = [0, 0, 24, 16, 8, 0, 12, 0, 0]
let baustoffe = [Block.Erde, Block.Stein, Block.Holz, Block.Laub, Block.Bretter, Block.Kristall]
let blockNamen = ["Luft", "Gras", "Erde", "Stein", "Holz", "Laub", "Bretter", "Kristall", "Grundfels"]
let gewaehlt = 0
let kristalleGefunden = 0
let figurX = 3200
let figurY = 1024
let figurZ = 1152
let drehung = 0
let neigung = -0.16
let fallTempo = 0
let amBoden = true
let ungespeichert = false
let strahlBreite = 4
let hatHacke = false
let trainingGeschafft = false

function istInWelt(x: number, y: number, z: number): boolean {
    return x >= 0 && x < WELT_BREITE && y >= 0 && y < WELT_HOEHE && z >= 0 && z < WELT_BREITE
}
function blockBei(x: number, y: number, z: number): number {
    if (!istInWelt(x, y, z)) return Block.Luft
    return welt[x + WELT_BREITE * (z + WELT_BREITE * y)]
}
function schreibeBlock(x: number, y: number, z: number, art: number) {
    if (istInWelt(x, y, z) && y > 0) {
        welt[x + WELT_BREITE * (z + WELT_BREITE * y)] = art
        ungespeichert = true
    }
}
function figurStoesstAn(x: number, y: number, z: number): boolean {
    if (x - FIGUR_HALBBREITE < 0 || z - FIGUR_HALBBREITE < 0 ||
        x + FIGUR_HALBBREITE >= WELT_BREITE * EINHEIT || z + FIGUR_HALBBREITE >= WELT_BREITE * EINHEIT ||
        y < EINHEIT) return true
    for (let blockY = y >> 8; blockY <= (y + FIGUR_HOEHE - 1) >> 8; blockY++) {
        for (let blockZ = (z - FIGUR_HALBBREITE) >> 8; blockZ <= (z + FIGUR_HALBBREITE - 1) >> 8; blockZ++) {
            for (let blockX = (x - FIGUR_HALBBREITE) >> 8;
                blockX <= (x + FIGUR_HALBBREITE - 1) >> 8; blockX++) {
                if (blockBei(blockX, blockY, blockZ) != Block.Luft) return true
            }
        }
    }
    return false
}
function verdecktFigur(x: number, y: number, z: number): boolean {
    return x * EINHEIT < figurX + FIGUR_HALBBREITE && (x + 1) * EINHEIT > figurX - FIGUR_HALBBREITE &&
        z * EINHEIT < figurZ + FIGUR_HALBBREITE && (z + 1) * EINHEIT > figurZ - FIGUR_HALBBREITE &&
        y * EINHEIT < figurY + FIGUR_HOEHE && (y + 1) * EINHEIT > figurY
}
function setzeBaum(x: number, z: number, boden: number) {
    for (let y = boden + 3; y <= boden + 4; y++) {
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) schreibeBlock(x + dx, y, z + dz, Block.Laub)
        }
    }
    for (let y = boden + 1; y <= boden + 3; y++) schreibeBlock(x, y, z, Block.Holz)
}
function erzeugeWelt() {
    welt.fill(0)
    let phaseX = randint(0, 628) / 100
    let phaseZ = randint(0, 628) / 100
    for (let z = 0; z < WELT_BREITE; z++) {
        for (let x = 0; x < WELT_BREITE; x++) {
            let oberkante = 3 +
                Math.floor((Math.sin(x * 0.43 + phaseX) + Math.cos(z * 0.38 + phaseZ) + 2) * 0.65)
            // Der Streifen zum ersten Baum bleibt auch in jeder neuen Welt eben (Höhe 3), damit der Anfang leicht ist.
            if (x >= 9 && x <= 15 && z <= 9) oberkante = 3
            for (let y = 0; y <= oberkante; y++) {
                let art = y == 0 ? Block.Grundfels
                    : y == oberkante ? Block.Gras
                    : y == oberkante - 1 ? Block.Erde
                    : Block.Stein
                if (y > 0 && y < oberkante - 1 && randint(0, 29) == 0) art = Block.Kristall
                welt[x + WELT_BREITE * (z + WELT_BREITE * y)] = art
            }
            if (x % 5 == 2 && z % 6 == 3 && z > 7) setzeBaum(x, z, oberkante)
        }
    }
    // Feste Kristalle direkt über dem Grundgestein (Höhe 1) und eine kleine Kammer im Boden, damit es immer etwas
    // zu finden gibt.
    for (let i = 0; i < 7; i++) schreibeBlock(3 + i * 2, 1, 18, Block.Kristall)
    for (let x = 4; x <= 7; x++) {
        for (let z = 15; z <= 18; z++) {
            schreibeBlock(x, 2, z, Block.Luft)
            schreibeBlock(x, 3, z, Block.Luft)
        }
    }
    setzeBaum(12, 9, 3)
    // Ein paar fertige Blöcke aus Stein und Brettern stehen schon da, damit man das Bauen gleich ausprobieren kann.
    schreibeBlock(15, 4, 7, Block.Stein)
    schreibeBlock(15, 5, 7, Block.Stein)
    schreibeBlock(16, 4, 7, Block.Bretter)
    vorrat = [0, 0, 24, 16, 8, 0, 12, 0, 0]
    gewaehlt = 0
    kristalleGefunden = 0
    hatHacke = false
    drehung = 0
    neigung = -0.16
    geheZumStart()
    ungespeichert = true
}
function geheZumStart() {
    figurX = 12 * EINHEIT + 128
    figurZ = 4 * EINHEIT + 128
    figurY = 4 * EINHEIT
    schreibeBlock(12, 3, 4, Block.Gras)
    schreibeBlock(12, 4, 4, Block.Luft)
    schreibeBlock(12, 5, 4, Block.Luft)
    fallTempo = 0
    amBoden = true
}
function bewegeAchse(dx: number, dz: number) {
    if (!figurStoesstAn(figurX + dx, figurY, figurZ + dz)) {
        figurX += dx
        figurZ += dz
    } else if (amBoden && !figurStoesstAn(figurX, figurY + EINHEIT, figurZ) &&
        !figurStoesstAn(figurX + dx, figurY + EINHEIT, figurZ + dz)) {
        figurY += EINHEIT
        figurX += dx
        figurZ += dz
        // Pro Rechenschritt nur eine Stufe hoch, auch bei schräger Bewegung; danach gilt die Figur als in der Luft.
        amBoden = false
        fallTempo = 0
    }
}
function rechnePhysik(vorwaerts: number, schrittMs: number) {
    schrittMs = Math.max(0, Math.min(80, schrittMs))
    if (schrittMs == 0) return
    amBoden = figurStoesstAn(figurX, figurY - 2, figurZ)
    let strecke = Math.idiv(vorwaerts * schrittMs * 7, 10)
    bewegeAchse(Math.round(Math.sin(drehung) * strecke), 0)
    bewegeAchse(0, Math.round(Math.cos(drehung) * strecke))
    fallTempo = Math.max(-1100, fallTempo - schrittMs * 2)
    let bewegung = Math.idiv(fallTempo * schrittMs, 1000)
    let teilschritte = Math.max(1, Math.ceil(Math.abs(bewegung) / 24))
    for (let i = 0; i < teilschritte; i++) {
        let dy = Math.idiv(bewegung * (i + 1), teilschritte) - Math.idiv(bewegung * i, teilschritte)
        if (!figurStoesstAn(figurX, figurY + dy, figurZ)) figurY += dy
        else {
            // Die Figur rutscht Schritt für Schritt dicht an den Boden oder die Decke heran, statt kurz davor in der
            // Luft stehen zu bleiben.
            let richtung = dy < 0 ? -1 : 1
            for (let feinschritt = 0; feinschritt < Math.abs(dy); feinschritt++) {
                if (figurStoesstAn(figurX, figurY + richtung, figurZ)) break
                figurY += richtung
            }
            fallTempo = 0
            break
        }
    }
    amBoden = figurStoesstAn(figurX, figurY - 1, figurZ)
}
function baueBlockAb(x: number, y: number, z: number): boolean {
    let art = blockBei(x, y, z)
    if (art == Block.Luft || art == Block.Grundfels || !istInWelt(x, y, z)) return false
    let vorratsArt = art == Block.Gras ? Block.Erde : art
    if (vorrat[vorratsArt] >= 999) return false
    vorrat[vorratsArt]++
    // Die Kristalle zählen nach dem größten Vorrat, den man je hatte: Wer einen Kristall setzt und wieder abbaut,
    // bekommt ihn nicht doppelt gezählt.
    if (art == Block.Kristall) kristalleGefunden = Math.max(kristalleGefunden, vorrat[art])
    schreibeBlock(x, y, z, Block.Luft)
    return true
}
function setzeBlock(x: number, y: number, z: number): boolean {
    let art = baustoffe[gewaehlt]
    if (!istInWelt(x, y, z) || y == 0 || blockBei(x, y, z) != Block.Luft || vorrat[art] == 0 ||
        verdecktFigur(x, y, z)) return false
    schreibeBlock(x, y, z, art)
    vorrat[art]--
    return true
}
function stelleBretterHer(): boolean {
    if (vorrat[Block.Holz] < 1 || vorrat[Block.Bretter] > 995) return false
    vorrat[Block.Holz]--
    vorrat[Block.Bretter] += 4
    ungespeichert = true
    return true
}
function stelleHackeHer(): boolean {
    if (hatHacke || vorrat[Block.Holz] < 2 || vorrat[Block.Stein] < 3) return false
    vorrat[Block.Holz] -= 2
    vorrat[Block.Stein] -= 3
    hatHacke = true
    ungespeichert = true
    return true
}
function pruefsumme(daten: Buffer): number {
    let summe = 0
    for (let i = 0; i < daten.length - 2; i++) summe = (summe * 31 + daten[i]) & 65535
    return summe
}
function packeSpielstand(): Buffer {
    let daten = control.createBuffer(SPIELSTAND_GROESSE)
    daten[0] = 67
    daten[1] = 51
    daten[2] = 1
    daten[3] = gewaehlt
    daten[4] = strahlBreite
    daten[5] = hatHacke ? 1 : 0
    daten.setNumber(NumberFormat.UInt16LE, 6, figurX)
    daten.setNumber(NumberFormat.UInt16LE, 8, figurY)
    daten.setNumber(NumberFormat.UInt16LE, 10, figurZ)
    daten.setNumber(NumberFormat.UInt16LE, 12, Math.floor(drehung * 10000))
    daten.setNumber(NumberFormat.UInt16LE, 14, Math.floor((neigung + 1.2) * 10000))
    daten.setNumber(NumberFormat.UInt16LE, 16, Math.min(65535, kristalleGefunden))
    for (let i = 0; i < vorrat.length; i++) daten.setNumber(NumberFormat.UInt16LE, 18 + i * 2, vorrat[i])
    daten[40] = trainingGeschafft ? 1 : 0
    for (let i = 0; i < BLOCKANZAHL; i += 2) daten[64 + i / 2] = welt[i] | (welt[i + 1] << 4)
    daten.setNumber(NumberFormat.UInt16LE, SPIELSTAND_GROESSE - 2, pruefsumme(daten))
    return daten
}
function entpackeSpielstand(daten: Buffer): boolean {
    if (!daten || daten.length != SPIELSTAND_GROESSE || daten[0] != 67 || daten[1] != 51 || daten[2] != 1 ||
        daten[3] >= baustoffe.length || (daten[4] != 2 && daten[4] != 4 && daten[4] != 8) ||
        daten[5] > 1 || daten[40] > 1 ||
        daten.getNumber(NumberFormat.UInt16LE, SPIELSTAND_GROESSE - 2) != pruefsumme(daten)) return false
    let x = daten.getNumber(NumberFormat.UInt16LE, 6)
    let y = daten.getNumber(NumberFormat.UInt16LE, 8)
    let z = daten.getNumber(NumberFormat.UInt16LE, 10)
    if (x < FIGUR_HALBBREITE || z < FIGUR_HALBBREITE ||
        x >= WELT_BREITE * EINHEIT - FIGUR_HALBBREITE || z >= WELT_BREITE * EINHEIT - FIGUR_HALBBREITE ||
        y < EINHEIT || y > WELT_HOEHE * EINHEIT ||
        daten.getNumber(NumberFormat.UInt16LE, 12) >= 62832 ||
        daten.getNumber(NumberFormat.UInt16LE, 14) > 24000) return false
    for (let i = 0; i < vorrat.length; i++) {
        if (daten.getNumber(NumberFormat.UInt16LE, 18 + i * 2) > 999) return false
    }
    for (let i = 64; i < SPIELSTAND_GROESSE - 2; i++) {
        if ((daten[i] & 15) > Block.Grundfels || (daten[i] >> 4) > Block.Grundfels) return false
        if (i < 64 + WELT_BREITE * WELT_BREITE / 2 && daten[i] != 136) return false
    }
    for (let i = 0; i < BLOCKANZAHL; i += 2) {
        welt[i] = daten[64 + i / 2] & 15
        welt[i + 1] = daten[64 + i / 2] >> 4
    }
    figurX = x
    figurY = y
    figurZ = z
    drehung = daten.getNumber(NumberFormat.UInt16LE, 12) / 10000
    neigung = daten.getNumber(NumberFormat.UInt16LE, 14) / 10000 - 1.2
    gewaehlt = daten[3]
    strahlBreite = daten[4]
    hatHacke = daten[5] == 1
    trainingGeschafft = daten[40] == 1
    kristalleGefunden = daten.getNumber(NumberFormat.UInt16LE, 16)
    for (let i = 0; i < vorrat.length; i++) {
        vorrat[i] = daten.getNumber(NumberFormat.UInt16LE, 18 + i * 2)
    }
    fallTempo = 0
    ungespeichert = false
    if (figurStoesstAn(figurX, figurY, figurZ)) geheZumStart()
    else amBoden = figurStoesstAn(figurX, figurY - 1, figurZ)
    return true
}

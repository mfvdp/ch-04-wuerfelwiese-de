// Sehstrahlen und das Bild der Welt in echtem 3D.
// Für jede Bildspalte und Bildzeile läuft ein Strahl von Blockgrenze zu Blockgrenze durch die Welt (das Verfahren heißt
// DDA), nur mit ganzen Zahlen. Es gibt keine Sprites, und für einen Strahl entsteht kein neues Objekt im Speicher.
let trefferX = 0
let trefferY = 0
let trefferZ = 0
let trefferFlaecheX = 0
let trefferFlaecheY = 0
let trefferFlaecheZ = 0
let trefferBlock = 0
let trefferAbstand = 0
let blickX = 0
let blickY = 0
let blickZ = 1024
let rechtsX = 1024
let rechtsZ = 0
let obenX = 0
let obenY = 1024
let obenZ = 0
let hatZiel = false
let zielX = 0
let zielY = 0
let zielZ = 0
let platzX = 0
let platzY = 0
let platzZ = 0
let zielBlock = 0
let grundFarben = [9, 14, 14, 11, 14, 7, 13, 9, 12]
let dunkelFarben = [9, 12, 12, 12, 12, 6, 14, 6, 15]
let dunstFarben = [9, 1, 4, 13, 13, 13, 11, 7, 11, 9, 11, 11, 11, 13, 11, 11]
// Sieben Muster-Masken (je 16 mal 16 Pixel) liegen nebeneinander in EINEM Bild mit 4 Bit pro Pixel: 896 Byte statt
// vieler großer Listen. In einer Maske bedeutet 0 Grundton, 1 Vertiefung und 2 Licht. Gezeichnet werden sie nur einmal,
// beim ersten Bild der Welt (zeichneWelt).
let blockMuster = image.create(112, 16)
let musterFertig = false
let vektorDrehung = -10000
let vektorNeigung = -10000
let vorbereiteteDrehung = -10000
let vorbereiteteNeigung = -10000
let vorbereiteteBreite = 0
let spalteX: number[] = []
let spalteZ: number[] = []
let zeileX: number[] = []
let zeileY: number[] = []
let zeileZ: number[] = []

function berechneBlickvektoren() {
    // aktualisiereZiel und das Zeichnen benutzen dieselben Blickvektoren. Aus Drehung (nach links oder rechts) und
    // Neigung (nach oben oder unten) entstehen drei Richtungen mit der Länge 1024: wohin man schaut, nach rechts und
    // nach oben. Solange sich der Blick nicht ändert, wird kein Sinus und kein Kosinus neu berechnet.
    if (drehung == vektorDrehung && neigung == vektorNeigung) return
    vektorDrehung = drehung
    vektorNeigung = neigung
    let sinDrehung = Math.sin(drehung)
    let cosDrehung = Math.cos(drehung)
    let sinNeigung = Math.sin(neigung)
    let cosNeigung = Math.cos(neigung)
    blickX = Math.round(sinDrehung * cosNeigung * 1024)
    blickY = Math.round(sinNeigung * 1024)
    blickZ = Math.round(cosDrehung * cosNeigung * 1024)
    rechtsX = Math.round(cosDrehung * 1024)
    rechtsZ = Math.round(-sinDrehung * 1024)
    obenX = Math.round(-sinDrehung * sinNeigung * 1024)
    obenY = Math.round(cosNeigung * 1024)
    obenZ = Math.round(-cosDrehung * sinNeigung * 1024)
}
// Maße: Die Richtung ist in 1024stel angegeben, der Weg in 1024 je Block, der Ursprung in 256 je Block.
function verfolgeStrahl(ursprungX: number, ursprungY: number, ursprungZ: number,
    richtungX: number, richtungY: number, richtungZ: number, grenze: number): boolean {
    trefferBlock = 0
    if (richtungX == 0 && richtungY == 0 && richtungZ == 0) return false
    let x = ursprungX >> 8
    let y = ursprungY >> 8
    let z = ursprungZ >> 8
    let vorzeichenX = richtungX < 0 ? -1 : 1
    let vorzeichenY = richtungY < 0 ? -1 : 1
    let vorzeichenZ = richtungZ < 0 ? -1 : 1
    let weltIndex = x + WELT_BREITE * (z + WELT_BREITE * y)
    let indexSchrittY = WELT_BREITE * WELT_BREITE * vorzeichenY
    let indexSchrittZ = WELT_BREITE * vorzeichenZ
    let wegProBlockX = richtungX == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(richtungX))
    let wegProBlockY = richtungY == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(richtungY))
    let wegProBlockZ = richtungZ == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(richtungZ))
    // Festkomma: Ist eine Richtung nicht 0, ist der Weg pro Block höchstens 1048576 (2 hoch 20). Mal 256 ergibt das
    // höchstens 2 hoch 28, passt also noch in eine ganze Zahl. Darum genügt ein Verschieben um 8 Bit (>> 8) statt
    // dreier weiterer Divisionen.
    let naechsterX = richtungX == 0 ? 1073741823
        : ((richtungX < 0 ? ursprungX & 255 : 256 - (ursprungX & 255)) * wegProBlockX) >> 8
    let naechsterY = richtungY == 0 ? 1073741823
        : ((richtungY < 0 ? ursprungY & 255 : 256 - (ursprungY & 255)) * wegProBlockY) >> 8
    let naechsterZ = richtungZ == 0 ? 1073741823
        : ((richtungZ < 0 ? ursprungZ & 255 : 256 - (ursprungZ & 255)) * wegProBlockZ) >> 8
    let weg = 0
    let achse = 0
    for (let schritt = 0; schritt < 48; schritt++) {
        if (naechsterX <= naechsterY && naechsterX <= naechsterZ) {
            weg = naechsterX
            naechsterX += wegProBlockX
            x += vorzeichenX
            weltIndex += vorzeichenX
            achse = 0
        } else if (naechsterY <= naechsterZ) {
            weg = naechsterY
            naechsterY += wegProBlockY
            y += vorzeichenY
            weltIndex += indexSchrittY
            achse = 1
        } else {
            weg = naechsterZ
            naechsterZ += wegProBlockZ
            z += vorzeichenZ
            weltIndex += indexSchrittZ
            achse = 2
        }
        if (weg > grenze || x < 0 || x >= WELT_BREITE || z < 0 || z >= WELT_BREITE || y < 0) return false
        // Ein Strahl über der Welt kann nach unten wieder in die Welt eintreten; zeigt er nach oben, ist
        // er endgültig draußen.
        if (y >= WELT_HOEHE) {
            if (richtungY >= 0) return false
            continue
        }
        let art = welt[weltIndex]
        if (art != 0) {
            trefferX = x
            trefferY = y
            trefferZ = z
            trefferBlock = art
            trefferAbstand = weg
            trefferFlaecheX = achse == 0 ? -vorzeichenX : 0
            trefferFlaecheY = achse == 1 ? -vorzeichenY : 0
            trefferFlaecheZ = achse == 2 ? -vorzeichenZ : 0
            return true
        }
    }
    return false
}
function aktualisiereZiel() {
    berechneBlickvektoren()
    hatZiel = verfolgeStrahl(figurX, figurY + AUGENHOEHE, figurZ, blickX, blickY, blickZ, 4 * 1024)
    if (hatZiel) {
        zielX = trefferX
        zielY = trefferY
        zielZ = trefferZ
        zielBlock = trefferBlock
        platzX = trefferX + trefferFlaecheX
        platzY = trefferY + trefferFlaecheY
        platzZ = trefferZ + trefferFlaecheZ
    } else zielBlock = 0
}
function zeichneBlockMuster() {
    if (musterFertig) return
    musterFertig = true
    // Gras: zwei winzige Halme. Keine zufälligen Farbflecken auf jeder Fläche.
    blockMuster.drawLine(3, 4, 4, 3, 1)
    blockMuster.setPixel(4, 5, 1)
    blockMuster.drawLine(11, 11, 12, 12, 1)
    // Erde: wenige eingebettete Kieselsteine, kein gleichmäßiges Kachelmuster.
    blockMuster.drawLine(19, 5, 20, 5, 1)
    blockMuster.setPixel(20, 4, 2)
    blockMuster.drawLine(26, 11, 28, 11, 1)
    blockMuster.setPixel(27, 10, 2)
    blockMuster.setPixel(22, 14, 1)
    // Stein: kurze Fugen und zwei weiche Lichtkanten.
    blockMuster.drawLine(35, 5, 39, 5, 1)
    blockMuster.drawLine(38, 6, 40, 6, 1)
    blockMuster.drawLine(42, 11, 45, 11, 1)
    blockMuster.drawLine(35, 4, 38, 4, 2)
    blockMuster.drawLine(43, 10, 45, 10, 2)
    // Rinde: unterbrochene, versetzte Maserung statt durchgehender Streifen.
    blockMuster.fillRect(52, 3, 2, 3, 1)
    blockMuster.drawLine(53, 6, 53, 8, 1)
    blockMuster.fillRect(59, 10, 2, 3, 1)
    blockMuster.drawLine(60, 2, 60, 4, 2)
    blockMuster.drawLine(56, 11, 56, 13, 2)
    // Hirnholz (die Schnittfläche oben und unten am Stamm): zwei geschlossene Jahresringe um einen kleinen Kern.
    blockMuster.drawRect(66, 2, 12, 12, 1)
    blockMuster.drawRect(69, 5, 6, 6, 1)
    blockMuster.fillRect(71, 7, 2, 2, 2)
    // Bretter: versetzte Stoßfugen und sparsame Holzmaserung.
    blockMuster.drawLine(80, 7, 95, 7, 1)
    blockMuster.drawLine(80, 15, 95, 15, 1)
    blockMuster.drawLine(84, 0, 84, 6, 1)
    blockMuster.drawLine(92, 8, 92, 14, 1)
    blockMuster.drawLine(88, 3, 92, 3, 2)
    blockMuster.drawLine(82, 11, 85, 11, 2)
    // Laub: zwei kleine Blattgruppen auf großen, ruhigen grünen Flächen.
    blockMuster.drawLine(99, 4, 102, 4, 2)
    blockMuster.drawLine(100, 5, 101, 5, 2)
    blockMuster.drawLine(106, 11, 109, 11, 1)
    blockMuster.setPixel(107, 10, 1)
}

function trefferFarbe(richtungX: number, richtungY: number, richtungZ: number): number {
    let punktX = figurX + ((richtungX * trefferAbstand) >> 12)
    let punktY = figurY + AUGENHOEHE + ((richtungY * trefferAbstand) >> 12)
    let punktZ = figurZ + ((richtungZ * trefferAbstand) >> 12)
    let flaecheX = (trefferFlaecheX != 0 ? punktZ : punktX) & 255
    // Senkrechte Muster laufen von oben nach unten; die Gegenseiten werden gespiegelt, damit nichts
    // verkehrt herum erscheint.
    let flaecheY = trefferFlaecheY != 0 ? punktZ & 255 : 255 - (punktY & 255)
    if (trefferFlaecheY == 0 && (trefferFlaecheX > 0 || trefferFlaecheZ > 0)) flaecheX = 255 - flaecheX
    let art = trefferBlock
    let dunkel = trefferFlaecheY < 0 || trefferFlaecheX != 0 || trefferFlaecheZ > 0
    let muster = art == Block.Gras ? (trefferFlaecheY > 0 ? 0 : 1)
        : art == Block.Erde ? 1
        : art == Block.Stein || art == Block.Grundfels ? 2
        : art == Block.Holz ? (trefferFlaecheY != 0 ? 4 : 3)
        : art == Block.Bretter ? 5
        : 6
    // Kleine Motive verschwinden in der Ferne, statt als bunte Pixel zu flimmern.
    let detailGrenze = muster < 2 ? 3 * 1024 : 6 * 1024
    let musterX = flaecheX >> 4
    let musterY = flaecheY >> 4
    if (muster < 3 || muster == 6) {
        // Dieselbe kleine Maske wird für jeden Block anders verschoben (nach seiner Lage in der Welt), damit kein
        // sichtbares Fleckenraster entsteht.
        musterX = (musterX + trefferX * 5 + trefferZ * 3) & 15
        musterY = (musterY + trefferX * 7 + trefferZ * 11 + trefferY * 3) & 15
    }
    let musterWert = trefferAbstand < detailGrenze ? blockMuster.getPixel(muster * 16 + musterX, musterY) : 0
    if (trefferAbstand > 4 * 1024 && musterWert == 2 && art == Block.Stein) musterWert = 0
    let farbe = grundFarben[art]
    if (art == Block.Gras && trefferFlaecheY > 0) {
        farbe = musterWert == 1 ? 6 : 7
    } else if (art == Block.Gras || art == Block.Erde) {
        farbe = dunkel ? 12 : 14
        if (musterWert == 1 && !dunkel) farbe = 12
        // Die Grasnarbe folgt der oberen Blockkante; die Erde darunter bleibt braun.
        if (art == Block.Gras && trefferFlaecheY == 0 &&
            flaecheY < 35 + ((flaecheX >> 6) & 1) * 8) farbe = dunkel ? 6 : 7
    } else if (art == Block.Stein) {
        farbe = trefferFlaecheY > 0 ? 13 : dunkel ? 12 : 11
        if (musterWert == 1 && !dunkel) farbe = trefferFlaecheY > 0 ? 11 : 12
        else if (musterWert == 2 && !dunkel && trefferFlaecheY <= 0) farbe = 13
    } else if (art == Block.Holz) {
        farbe = dunkel ? 12 : 14
        if (trefferFlaecheY > 0) farbe = musterWert == 1 ? 14 : musterWert == 2 ? 13 : 4
        else if (!dunkel && musterWert == 1) farbe = 12
        else if (!dunkel && musterWert == 2) farbe = 4
    } else if (art == Block.Bretter) {
        farbe = dunkel ? 14 : 13
        if (musterWert == 1) farbe = dunkel ? 12 : 14
        else if (musterWert == 2 && !dunkel) farbe = 4
    } else if (art == Block.Laub) {
        farbe = trefferFlaecheY > 0 || !dunkel ? 7 : 6
        if (musterWert == 1) farbe = 6
        else if (musterWert == 2 && !dunkel) farbe = 7
    } else if (art == Block.Kristall) {
        // Große, zusammenhängende Facetten (Flächen) statt eines zufälligen Funkelmusters.
        farbe = dunkel ? 8 : 9
        if (!dunkel && flaecheX < 112 && flaecheY < 144 && flaecheX + flaecheY < 176) farbe = 1
        else if (flaecheX > 160 && flaecheY > 96) farbe = 8
    } else if (art == Block.Grundfels) {
        farbe = musterWert == 1 || trefferFlaecheY < 0 ? 15 : 12
    }
    // Ein Kontaktschatten entsteht nur neben Blöcken, die wirklich höher sind. So bekommt eine ebene Grasfläche kein
    // dunkles Gitternetz. Zusätzliche Licht- oder Schattenstrahlen gibt es nicht.
    if (trefferFlaecheY > 0 && trefferAbstand < 5 * 1024) {
        let nachbarHoeher = false
        if (flaecheX < 20)
            nachbarHoeher = blockBei(trefferX - 1, trefferY + 1, trefferZ) != Block.Luft
        else if (flaecheX > 235)
            nachbarHoeher = blockBei(trefferX + 1, trefferY + 1, trefferZ) != Block.Luft
        if (!nachbarHoeher && flaecheY < 20)
            nachbarHoeher = blockBei(trefferX, trefferY + 1, trefferZ - 1) != Block.Luft
        else if (!nachbarHoeher && flaecheY > 235)
            nachbarHoeher = blockBei(trefferX, trefferY + 1, trefferZ + 1) != Block.Luft
        if (nachbarHoeher) farbe = art == Block.Gras || art == Block.Laub ? 6
            : art == Block.Stein ? 11
            : dunkelFarben[art]
    }
    // Stein verliert in der Ferne an Kontrast. Laub bleibt grün; beim Holz wird nur das Orange (Farbe 4) zu hellem
    // Beige (Farbe 13). Ganze Bäume sollen nicht wie graue Steinpfeiler aussehen.
    if (trefferAbstand > 6 * 1024) {
        if (art == Block.Stein || art == Block.Grundfels) farbe = dunstFarben[farbe]
        else if (art == Block.Holz && farbe == 4) farbe = 13
    }
    // Die Zielkontur liegt über Muster und Schatten; eine dauerhafte Umrandung aller Blöcke gibt es nicht.
    if (hatZiel && trefferX == zielX && trefferY == zielY && trefferZ == zielZ &&
        (flaecheX < 16 || flaecheX > 239 || flaecheY < 16 || flaecheY > 239)) farbe = 5
    return farbe
}

function bereiteStrahlenVor() {
    if (vorbereiteteDrehung == drehung && vorbereiteteNeigung == neigung && vorbereiteteBreite == strahlBreite) return
    vorbereiteteDrehung = drehung
    vorbereiteteNeigung = neigung
    vorbereiteteBreite = strahlBreite
    // Höchstens 316 Zahlen bei Strahlbreite 2 (80 Spalten mal 2 plus 52 Zeilen mal 3); es entstehen keine neuen Listen
    // pro Bild oder Strahl.
    for (let spalte = 0, x = 0; x < 160; spalte++, x += strahlBreite) {
        let versatzX = Math.idiv((x + strahlBreite / 2 - 80) * 1024, 110)
        spalteX[spalte] = (rechtsX * versatzX) >> 10
        spalteZ[spalte] = (rechtsZ * versatzX) >> 10
    }
    for (let zeile = 0, y = 8; y < 112; zeile++, y += strahlBreite) {
        let versatzY = Math.idiv((60 - y - strahlBreite / 2) * 1024, 110)
        zeileX[zeile] = blickX + ((obenX * versatzY) >> 10)
        zeileY[zeile] = blickY + ((obenY * versatzY) >> 10)
        zeileZ[zeile] = blickZ + ((obenZ * versatzY) >> 10)
    }
}

// Himmelsobjekte stehen fest in der Welt: Ihre Position folgt der Perspektive, bei den Wolken auch die Größe. Die Sonne
// bleibt immer gleich groß.
function zeichneHimmelsobjekt(leinwand: Image, x: number, y: number, z: number, istSonne: boolean) {
    let tiefe = (x * blickX + y * blickY + z * blickZ) >> 10
    if (tiefe < 160) return
    let bildX = 80 + Math.idiv(((x * rechtsX + z * rechtsZ) >> 10) * 110, tiefe)
    let bildY = 60 - Math.idiv(((x * obenX + y * obenY + z * obenZ) >> 10) * 110, tiefe)
    if (bildX < -40 || bildX > 200 || bildY < -20 || bildY > 135) return
    if (istSonne) {
        leinwand.fillRect(bildX - 7, bildY - 5, 14, 10, 1)
        leinwand.fillRect(bildX - 5, bildY - 7, 10, 14, 1)
        leinwand.fillRect(bildX - 5, bildY - 5, 10, 10, 5)
        leinwand.fillRect(bildX - 3, bildY - 4, 5, 2, 1)
    } else {
        let halbBreite = Math.max(6, Math.min(30, Math.idiv(20000, tiefe)))
        let stufenHoehe = Math.max(2, halbBreite >> 2)
        leinwand.fillRect(bildX - halbBreite, bildY, halbBreite * 2, stufenHoehe, 13)
        leinwand.fillRect(bildX - halbBreite + 2, bildY - stufenHoehe, halbBreite * 2 - 4, stufenHoehe + 1, 1)
        leinwand.fillRect(bildX - (halbBreite >> 1), bildY - stufenHoehe * 2, halbBreite, stufenHoehe + 1, 1)
    }
}

function zeichneWelt(leinwand: Image) {
    berechneBlickvektoren()
    bereiteStrahlenVor()
    zeichneBlockMuster()
    leinwand.fill(9)
    // Wenige breite Luftschichten statt eines harten Horizontstrichs. zeileY ist die Höhenrichtung in der Welt: Mit der
    // Neigung wandert der Horizont nach oben oder unten.
    for (let zeile = 0, y = 8; y < 112; zeile++, y += strahlBreite) {
        let steigung = zeileY[zeile]
        if (steigung < -95) leinwand.fillRect(0, y, 160, strahlBreite, 6)
        else if (steigung < -35) leinwand.fillRect(0, y, 160, strahlBreite, 11)
        else if (steigung < 0) leinwand.fillRect(0, y, 160, strahlBreite, 13)
        else if (steigung < 25) leinwand.fillRect(0, y, 160, strahlBreite, 1)
    }
    zeichneHimmelsobjekt(leinwand, 530, 570, 1024, true)
    zeichneHimmelsobjekt(leinwand, -650, 420, 1600, false)
    zeichneHimmelsobjekt(leinwand, 1100, 350, 1700, false)
    zeichneHimmelsobjekt(leinwand, 1600, 470, -1050, false)
    zeichneHimmelsobjekt(leinwand, -900, 560, -1800, false)
    let augenY = figurY + AUGENHOEHE
    // 40 x 26 Strahlen bei Strahlbreite 4 (20 x 13 bei 8, schnell; 80 x 52 bei 2, fein). Für den Himmel ist kein
    // weiterer Zeichenaufruf nötig, denn er ist schon vorgezeichnet.
    for (let zeile = 0, y = 8; y < 112; zeile++, y += strahlBreite) {
        let zeilenRichtungX = zeileX[zeile]
        let zeilenRichtungY = zeileY[zeile]
        let zeilenRichtungZ = zeileZ[zeile]
        for (let spalte = 0, x = 0; x < 160; spalte++, x += strahlBreite) {
            let richtungX = zeilenRichtungX + spalteX[spalte]
            let richtungZ = zeilenRichtungZ + spalteZ[spalte]
            if (verfolgeStrahl(figurX, augenY, figurZ, richtungX, zeilenRichtungY, richtungZ, 8 * 1024)) {
                leinwand.fillRect(x, y, strahlBreite, strahlBreite, trefferFarbe(richtungX, zeilenRichtungY, richtungZ))
            }
        }
    }
}

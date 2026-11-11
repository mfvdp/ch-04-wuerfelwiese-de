// Das Intro mit Studiokarte und Titel.
// Eine zusammenhängende Reise von 22 Sekunden durch eine kleine 3D-Kulisse, die nur für den Film gebaut wird. Sie
// verändert die Welt nicht, braucht weder Videos noch Sprites und legt in keinem Einzelbild neue Bilder an. Ablauf:
// Flug zwischen den Inseln, das Tor lädt sich auf, Flug durch das Tor (zusammen heißt diese erste Station Flug), dann
// die Karte „Calliope Hacker präsentiert“ über der Zielinsel und zuletzt der Spieltitel.
let filmFertig = false
let filmZeitMs = 0
let filmKapitel = 0
const FILM_DAUER_MS = 22000
const FILM_TORLADUNG_MS = 4800
const FILM_TORFLUG_MS = 7200
const FILM_ABEND_MS = 9700
const FILM_KARTE_MS = 11200
const FILM_TITEL_MS = 15200
const FILM_ABBLENDE_MS = 20500
// Ein Druck auf A springt zur nächsten Station (Flug, Karte, Titel, Ende), frühestens 500 ms nach dem Start des Films
// oder nach dem letzten Sprung. So überspringt wildes Hämmern auf A nie mehrere Stationen auf einmal, und ein
// gehaltenes A löst keinen neuen Druck aus.
const FILM_SPRUNG_PAUSE_MS = 500
let filmSprungAbMs = 0
let filmCalliopeBild: Image = null
let filmHackerBild: Image = null
let filmPraesentiertBild: Image = null
let filmTitelBild: Image = null
let filmRingX: number[] = []
let filmRingY: number[] = []
let filmKastenX: number[] = []
let filmKastenY: number[] = []
let filmKastenZ: number[] = []
let filmKastenBreite: number[] = []
let filmKastenHoehe: number[] = []
let filmKastenTiefe: number[] = []
let filmKastenArt: number[] = []
let filmKastenReihe: number[] = []
let filmKastenAbstand: number[] = []
let filmEckeX: number[] = []
let filmEckeY: number[] = []
let filmEckeZ: number[] = []
let filmFlaechen = [0, 2, 3, 1, 4, 5, 7, 6, 0, 1, 5, 4, 2, 6, 7, 3, 0, 4, 6, 2, 1, 3, 7, 5]
let filmFlaechenReihe = [0, 0, 0]
let filmFlaechenAbstand = [0, 0, 0]
let filmKameraX = 0
let filmKameraY = 3
let filmKameraZ = 0
let filmSinDrehung = 0
let filmCosDrehung = 1
let filmSinNeigung = 0
let filmCosNeigung = 1
let filmSinKipp = 0
let filmCosKipp = 1
let filmBrennweite = 92
let filmBildX = 0
let filmBildY = 0
let filmTiefe = 0
let filmAbend = false

function fuegeKastenHinzu(x: number, y: number, z: number,
    breite: number, hoehe: number, tiefe: number, art: number) {
    filmKastenX.push(x)
    filmKastenY.push(y)
    filmKastenZ.push(z)
    filmKastenBreite.push(breite)
    filmKastenHoehe.push(hoehe)
    filmKastenTiefe.push(tiefe)
    filmKastenArt.push(art)
    filmKastenReihe.push(0)
    filmKastenAbstand.push(0)
}

function baueFilmInsel(x: number, y: number, z: number, groesse: number, mitBaum: boolean) {
    let dicke = groesse > 10 ? 1.65 : 1
    fuegeKastenHinzu(x, y - 0.65 * dicke, z, groesse, 1.3 * dicke, groesse * 0.85, 0)
    fuegeKastenHinzu(x + 0.3, y - 2 * dicke, z, groesse * 0.8, 1.6 * dicke, groesse * 0.65, 1)
    fuegeKastenHinzu(x - 0.2, y - 3.1 * dicke, z, groesse * 0.38, 0.9 * dicke, groesse * 0.35, 1)
    if (mitBaum) {
        fuegeKastenHinzu(x - groesse * 0.14, y + 1, z + 0.2, 0.45, 2.2, 0.45, 2)
        fuegeKastenHinzu(x - groesse * 0.14, y + 2.25, z + 0.2, 2.2, 1.35, 1.8, 3)
        fuegeKastenHinzu(x - groesse * 0.14 + 0.3, y + 3.1, z + 0.2, 1.45, 0.65, 1.35, 3)
    } else fuegeKastenHinzu(x + 0.2, y + 0.45, z, 0.65, 0.9, 0.65, 5)
}

function bereiteFilmVor() {
    filmFertig = false
    filmZeitMs = 0
    filmKapitel = 0
    filmSprungAbMs = 0
    if (filmCalliopeBild) return
    filmCalliopeBild = image.create(47, 8)
    filmCalliopeBild.print("CALLIOPE", 0, 0, 1, image.font8)
    filmHackerBild = image.create(35, 8)
    filmHackerBild.print("HACKER", 0, 0, 1, image.font8)
    zeichnePraesentiert()
    filmTitelBild = image.create(TITEL.length * 6, 8)
    filmTitelBild.print(TITEL, 0, 0, 1, image.font8)
    for (let i = 0; i <= 24; i++) {
        filmRingX.push(Math.cos(i * Math.PI / 12))
        filmRingY.push(Math.sin(i * Math.PI / 12))
    }
    for (let i = 0; i < 8; i++) {
        filmEckeX.push(0)
        filmEckeY.push(0)
        filmEckeZ.push(0)
    }
    // Die freie Gasse führt wirklich durch die Kulisse bis zum Tor: Die Inseln stehen abwechselnd links
    // und rechts davon.
    for (let i = 0; i < 15; i++) {
        let seite = i % 2 == 0 ? -1 : 1
        let x = seite * (4.4 + (i * 7 % 4))
        let z = 10 + i * 8.5
        baueFilmInsel(x, -0.4 + (i % 3) * 0.5, z, 3.2 + (i % 3) * 0.45, i % 3 != 1)
        if (i % 3 == 0) fuegeKastenHinzu(-x * 1.8, 2.2, z + 3, 1.2, 1.2, 1.2, 5)
    }
    // Ein riesiges Tor, in derselben 3D-Welt verankert.
    fuegeKastenHinzu(0, -3, 53, 11, 1.1, 5, 1)
    fuegeKastenHinzu(-4.1, 1.1, 53, 1.1, 8.2, 1.3, 4)
    fuegeKastenHinzu(4.1, 1.1, 53, 1.1, 8.2, 1.3, 4)
    fuegeKastenHinzu(0, 5.45, 53, 9.4, 0.9, 1.5, 4)
    fuegeKastenHinzu(-4.1, -2.25, 53, 1.7, 1.1, 1.9, 6)
    fuegeKastenHinzu(4.1, -2.25, 53, 1.7, 1.1, 1.9, 6)
    fuegeKastenHinzu(-4.1, 5.4, 53, 1.6, 1.4, 1.8, 6)
    fuegeKastenHinzu(4.1, 5.4, 53, 1.6, 1.4, 1.8, 6)
    // Ziel der Reise: eine große Insel mit Terrassen, einem Baum und Kristallen.
    baueFilmInsel(0, 0, 134, 15, false)
    fuegeKastenHinzu(-2.2, 0.35, 134, 4.3, 0.7, 4, 0)
    fuegeKastenHinzu(-2.4, 1.8, 134.5, 0.8, 2.9, 0.8, 2)
    fuegeKastenHinzu(-2.7, 3.5, 134.5, 4.2, 1.9, 3.4, 3)
    fuegeKastenHinzu(-2.2, 4.7, 134.4, 2.8, 0.9, 2.6, 3)
    fuegeKastenHinzu(2.5, 0.7, 133.2, 1.2, 1.4, 1.2, 5)
    fuegeKastenHinzu(3.9, 0.3, 134, 0.7, 0.6, 0.7, 5)
}

// Kapitel für den Ton: 0 Inselflug, 1 Tor lädt sich auf, 2 Flug durch das Tor, 3 Karte, 4 Titel, 5 Abblende.
function kapitelBei(zeitMs: number): number {
    return zeitMs < FILM_TORLADUNG_MS ? 0
        : zeitMs < FILM_TORFLUG_MS ? 1
        : zeitMs < FILM_KARTE_MS ? 2
        : zeitMs < FILM_TITEL_MS ? 3
        : zeitMs < FILM_ABBLENDE_MS ? 4
        : 5
}

function aktualisiereFilm(schrittMs: number) {
    if (filmFertig) return
    filmZeitMs = Math.min(FILM_DAUER_MS, filmZeitMs + Math.max(0, schrittMs))
    filmKapitel = kapitelBei(filmZeitMs)
    filmFertig = filmZeitMs >= FILM_DAUER_MS
}

function ueberspringeFilm() {
    filmZeitMs = FILM_DAUER_MS
    filmKapitel = 5
    filmFertig = true
}

// Ein neuer Druck auf A: zur nächsten Station springen. Ergebnis false, wenn der Druck noch zu früh kam oder der Film
// schon zu Ende ist.
function springeZurNaechstenStation(): boolean {
    if (filmFertig || filmZeitMs - filmSprungAbMs < FILM_SPRUNG_PAUSE_MS) return false
    if (filmZeitMs >= FILM_TITEL_MS) ueberspringeFilm()
    else {
        filmZeitMs = filmZeitMs >= FILM_KARTE_MS ? FILM_TITEL_MS : FILM_KARTE_MS
        filmKapitel = kapitelBei(filmZeitMs)
    }
    filmSprungAbMs = filmZeitMs
    return true
}

function glaette(wert: number): number {
    wert = Math.max(0, Math.min(1, wert))
    return wert * wert * (3 - 2 * wert)
}

function setzeFilmKamera(x: number, y: number, z: number, drehung: number, neigung: number, kipp: number) {
    filmKameraX = x
    filmKameraY = y
    filmKameraZ = z
    filmSinDrehung = Math.sin(drehung)
    filmCosDrehung = Math.cos(drehung)
    filmSinNeigung = Math.sin(neigung)
    filmCosNeigung = Math.cos(neigung)
    filmSinKipp = Math.sin(kipp)
    filmCosKipp = Math.cos(kipp)
}

function projiziere(x: number, y: number, z: number) {
    let dx = x - filmKameraX
    let dy = y - filmKameraY
    let dz = z - filmKameraZ
    let gedrehtX = dx * filmCosDrehung - dz * filmSinDrehung
    let gedrehtZ = dz * filmCosDrehung + dx * filmSinDrehung
    let gedrehtY = dy * filmCosNeigung - gedrehtZ * filmSinNeigung
    filmTiefe = gedrehtZ * filmCosNeigung + dy * filmSinNeigung
    let massstab = filmBrennweite / Math.max(0.5, filmTiefe)
    let schirmX = gedrehtX * massstab
    let schirmY = -gedrehtY * massstab
    filmBildX = 80 + schirmX * filmCosKipp - schirmY * filmSinKipp
    filmBildY = 57 + schirmY * filmCosKipp + schirmX * filmSinKipp
}

// Dreiecke füllt MakeCode selbst (fillTriangle), schnell und mit ganzen Zahlen; was über den Bildrand ragt, schneidet
// es von allein ab. Gerundet werden die Ecken hier. Die schwarzen Kinobalken oben und unten malt zeichneFilm am
// Ende wieder darüber.
function fuelleDreieck(leinwand: Image, aX: number, aY: number, bX: number, bY: number,
    cX: number, cY: number, farbe: number) {
    leinwand.fillTriangle(Math.round(aX), Math.round(aY), Math.round(bX), Math.round(bY),
        Math.round(cX), Math.round(cY), farbe)
}

function zeichneFlaeche(leinwand: Image, flaeche: number, farbe: number, kantenFarbe: number) {
    let ersteEcke = flaeche * 4
    let eckeA = filmFlaechen[ersteEcke]
    let eckeB = filmFlaechen[ersteEcke + 1]
    let eckeC = filmFlaechen[ersteEcke + 2]
    let eckeD = filmFlaechen[ersteEcke + 3]
    fuelleDreieck(leinwand,
        filmEckeX[eckeA], filmEckeY[eckeA],
        filmEckeX[eckeB], filmEckeY[eckeB],
        filmEckeX[eckeC], filmEckeY[eckeC], farbe)
    fuelleDreieck(leinwand,
        filmEckeX[eckeA], filmEckeY[eckeA],
        filmEckeX[eckeC], filmEckeY[eckeC],
        filmEckeX[eckeD], filmEckeY[eckeD], farbe)
    // Kanten nahe der Kamera können weit außerhalb des Bildes liegen; gezeichnet werden nur Linien, deren beide Enden
    // nicht zu weit draußen liegen.
    if (filmEckeX[eckeA] > -100 && filmEckeX[eckeA] < 260 &&
        filmEckeY[eckeA] > -100 && filmEckeY[eckeA] < 220 &&
        filmEckeX[eckeB] > -100 && filmEckeX[eckeB] < 260 &&
        filmEckeY[eckeB] > -100 && filmEckeY[eckeB] < 220) {
        leinwand.drawLine(filmEckeX[eckeA], filmEckeY[eckeA],
            filmEckeX[eckeB], filmEckeY[eckeB], kantenFarbe)
    }
    if (filmEckeX[eckeB] > -100 && filmEckeX[eckeB] < 260 &&
        filmEckeY[eckeB] > -100 && filmEckeY[eckeB] < 220 &&
        filmEckeX[eckeC] > -100 && filmEckeX[eckeC] < 260 &&
        filmEckeY[eckeC] > -100 && filmEckeY[eckeC] < 220) {
        leinwand.drawLine(filmEckeX[eckeB], filmEckeY[eckeB],
            filmEckeX[eckeC], filmEckeY[eckeC], kantenFarbe)
    }
}

function zeichneKasten(leinwand: Image, kasten: number) {
    let x = filmKastenX[kasten]
    let y = filmKastenY[kasten]
    let z = filmKastenZ[kasten]
    let art = filmKastenArt[kasten]
    let halbBreite = filmKastenBreite[kasten] * 0.5
    let halbHoehe = filmKastenHoehe[kasten] * 0.5
    let halbTiefe = filmKastenTiefe[kasten] * 0.5
    let kleinsterX = 10000
    let groessterX = -10000
    let kleinsterY = 10000
    let groessterY = -10000
    for (let i = 0; i < 8; i++) {
        let verjuengung = art == 1 && (i & 2) == 0 ? 0.58 : 1
        projiziere(x + ((i & 1) == 0 ? -halbBreite : halbBreite) * verjuengung,
            y + ((i & 2) == 0 ? -halbHoehe : halbHoehe),
            z + ((i & 4) == 0 ? -halbTiefe : halbTiefe) * verjuengung)
        // Liegt ein Eckpunkt zu nah vor der Kamera (Tiefe unter 1,25) oder dahinter, wird der Kasten gar nicht
        // gezeichnet. Alle großen Teile der Kulisse stehen seitlich der Flugbahn, deshalb fällt das nicht auf, und es
        // entstehen keine verdrehten Flächen.
        if (filmTiefe < 1.25) return
        filmEckeX[i] = filmBildX
        filmEckeY[i] = filmBildY
        filmEckeZ[i] = filmTiefe
        kleinsterX = Math.min(kleinsterX, filmBildX)
        groessterX = Math.max(groessterX, filmBildX)
        kleinsterY = Math.min(kleinsterY, filmBildY)
        groessterY = Math.max(groessterY, filmBildY)
    }
    if (groessterX < 0 || kleinsterX > 159 || groessterY < 6 || kleinsterY > 111) return
    // Von jedem Kasten werden nur die drei Flächen gezeichnet, die zur Kamera zeigen.
    filmFlaechenReihe[0] = filmKameraZ < z ? 0 : 1
    filmFlaechenReihe[1] = filmKameraY < y ? 2 : 3
    filmFlaechenReihe[2] = filmKameraX < x ? 4 : 5
    for (let i = 0; i < 3; i++) {
        let j = filmFlaechenReihe[i] * 4
        filmFlaechenAbstand[i] = filmEckeZ[filmFlaechen[j]] +
            filmEckeZ[filmFlaechen[j + 1]] +
            filmEckeZ[filmFlaechen[j + 2]] +
            filmEckeZ[filmFlaechen[j + 3]]
    }
    for (let i = 0; i < 2; i++) {
        for (let j = i + 1; j < 3; j++) {
            if (filmFlaechenAbstand[j] > filmFlaechenAbstand[i]) {
                let tausch = filmFlaechenReihe[i]
                filmFlaechenReihe[i] = filmFlaechenReihe[j]
                filmFlaechenReihe[j] = tausch
                let abstand = filmFlaechenAbstand[i]
                filmFlaechenAbstand[i] = filmFlaechenAbstand[j]
                filmFlaechenAbstand[j] = abstand
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        let flaeche = filmFlaechenReihe[i]
        let istOben = flaeche == 3
        let istSeite = flaeche >= 4
        let farbe = 12
        let kantenFarbe = 12
        if (art == 0) {
            farbe = istOben ? 7 : istSeite ? 12 : 14
            kantenFarbe = istOben ? 6 : 12
        } else if (art == 1) {
            farbe = istOben ? 11 : istSeite ? 8 : 12
            kantenFarbe = istOben ? 13 : 12
        } else if (art == 2) {
            farbe = istOben ? 13 : istSeite ? 12 : 14
            kantenFarbe = 14
        } else if (art == 3) {
            farbe = istOben ? 7 : istSeite ? 6 : 7
            kantenFarbe = istOben ? 9 : 6
        } else if (art == 4) {
            farbe = istOben ? 11 : istSeite ? 15 : 8
            kantenFarbe = 11
        } else if (art == 5) {
            farbe = istOben ? 1 : istSeite ? 8 : 9
            kantenFarbe = 9
        } else {
            farbe = istOben ? 5 : istSeite ? 4 : 13
            kantenFarbe = 5
        }
        // Die Tiefe bleibt erkennbar: Ferne Inseln und Bäume (Kastenarten unter 4) bekommen ab 48 Einheiten Abstand
        // ganz die Farben des Dunstes.
        if (z - filmKameraZ > 48 && art < 4) {
            farbe = istOben ? (art == 0 || art == 3 ? 6 : 11) : 12
            kantenFarbe = farbe
        }
        zeichneFlaeche(leinwand, flaeche, farbe, kantenFarbe)
    }
}

function zeichneKulisse(leinwand: Image) {
    let anzahl = 0
    for (let i = 0; i < filmKastenX.length; i++) {
        let vorwaerts = (filmKastenZ[i] - filmKameraZ) * filmCosDrehung +
            (filmKastenX[i] - filmKameraX) * filmSinDrehung
        let abstand = vorwaerts * filmCosNeigung + (filmKastenY[i] - filmKameraY) * filmSinNeigung
        if (abstand < 1 || abstand > 84) continue
        // Die Kästen werden nach Abstand sortiert, die fernsten zuerst. Das geschieht in schon vorhandenen Listen; es
        // entstehen keine neuen Objekte.
        let j = anzahl - 1
        while (j >= 0 && filmKastenAbstand[j] < abstand) {
            filmKastenAbstand[j + 1] = filmKastenAbstand[j]
            filmKastenReihe[j + 1] = filmKastenReihe[j]
            j--
        }
        filmKastenAbstand[j + 1] = abstand
        filmKastenReihe[j + 1] = i
        anzahl++
    }
    for (let i = 0; i < anzahl; i++) zeichneKasten(leinwand, filmKastenReihe[i])
}

function fuelleEllipse(leinwand: Image, x: number, y: number, radiusX: number, radiusY: number, farbe: number) {
    if (radiusX <= 0 || radiusY <= 0) return
    let vorherigerX = x + radiusX
    let vorherigerY = y
    for (let i = 1; i <= 24; i++) {
        let randX = x + filmRingX[i] * radiusX
        let randY = y + filmRingY[i] * radiusY
        fuelleDreieck(leinwand, x, y, vorherigerX, vorherigerY, randX, randY, farbe)
        vorherigerX = randX
        vorherigerY = randY
    }
}

function zeichneHimmel(leinwand: Image, abend: boolean, sog: number) {
    leinwand.fill(15)
    let horizont = Math.max(33, Math.min(85, 57 + filmSinNeigung * 92))
    leinwand.fillRect(0, horizont - 15, 160, 127 - horizont, 8)
    leinwand.fillRect(0, horizont + 9, 160, 111 - horizont, 12)
    leinwand.fillRect(0, horizont + 35, 160, 112 - (horizont + 35), 15)
    if (abend) {
        leinwand.fillRect(0, horizont - 6, 160, 29, 12)
        leinwand.fillRect(0, horizont + 14, 160, 21, 11)
        // Eine große Sonne im Gegenlicht mit gestuften Lichtbändern.
        let sonneX = 127 - filmKameraX * 2
        fuelleEllipse(leinwand, sonneX, 52, 22, 22, 4)
        fuelleEllipse(leinwand, sonneX, 50, 17, 17, 5)
        leinwand.fillRect(99 - filmKameraX * 2, 59, 57, 2, 12)
        leinwand.fillRect(103 - filmKameraX * 2, 64, 49, 2, 12)
        fuelleDreieck(leinwand, sonneX - 6, 62, 5, 111, 27, 111, 8)
        fuelleDreieck(leinwand, sonneX - 2, 62, 47, 111, 57, 111, 12)
        fuelleDreieck(leinwand, sonneX + 6, 62, 137, 111, 159, 111, 8)
    } else {
        // Schmale Himmelsbänder wandern beim Drehen der Kamera mit.
        for (let i = 0; i < 5; i++) {
            let x = 14 + i * 29 - filmSinDrehung * 70
            leinwand.drawLine(x, 24 + i * 3, x + 29, 20 + i * 3, 8)
        }
    }
    for (let i = 0; i < 28; i++) {
        let abstand = 30 + ((i * 37 + 128 - ((filmZeitMs * (0.006 + sog * 0.12)) % 128)) % 128)
        let x = 80 + ((i * 97 + 19) % 159 - 79) * 91 / abstand - filmSinDrehung * 60
        let y = 45 + ((i * 61 + 7) % 89 - 49) * 75 / abstand
        if (x < 0 || x > 159 || y < 8 || y > (abend ? 30 : 100)) continue
        if (sog > 0) leinwand.drawLine(x, y,
            x - (x - 80) * sog * 0.3,
            y - (y - 55) * sog * 0.3, 8)
        leinwand.setPixel(x, y, i % 5 == 0 ? 5 : abstand < 62 ? 1 : 9)
    }
    // Waagerechte Wolken bewegen sich mit dem 3D-Flug, statt wie ein stehendes Hintergrundbild zu bleiben.
    for (let i = 0; i < 4; i++) {
        let z = 18 + ((i * 25 + 150 - filmKameraZ) % 100)
        let x = 80 + ((i % 2 == 0 ? -13 : 12) - filmKameraX) * 92 / z
        let y = 49 + (3 + i % 2) * 92 / z
        let breite = Math.min(55, 700 / z)
        leinwand.fillRect(x - breite / 2, y, breite, Math.max(1, 35 / z), abend ? 13 : 11)
    }
}

function zeichneTor(leinwand: Image, ladung: number) {
    if (filmKameraZ > 50) return
    projiziere(0, 1.15, 52.5)
    if (filmTiefe < 2) return
    let mitteX = filmBildX
    let mitteY = filmBildY
    let massstab = filmBrennweite / filmTiefe
    let halbBreite = 3.25 * massstab
    let halbHoehe = 3.8 * massstab
    fuelleEllipse(leinwand, mitteX, mitteY, halbBreite + 2, halbHoehe + 2, ladung > 0.55 ? 9 : 8)
    fuelleEllipse(leinwand, mitteX, mitteY, halbBreite, halbHoehe, 15)
    let phase = filmZeitMs * 0.0017
    let kosinus = Math.cos(phase)
    let sinus = Math.sin(phase)
    for (let ring = 0; ring < 3; ring++) {
        let radius = ((filmZeitMs * 0.00016 + ring / 3) % 1)
        let vorherigerX = mitteX + kosinus * halbBreite * radius
        let vorherigerY = mitteY + sinus * halbHoehe * radius
        for (let i = 1; i <= 24; i++) {
            let ringX = filmRingX[i] * kosinus - filmRingY[i] * sinus
            let ringY = filmRingY[i] * kosinus + filmRingX[i] * sinus
            let x = mitteX + ringX * halbBreite * radius
            let y = mitteY + ringY * halbHoehe * radius
            leinwand.drawLine(vorherigerX, vorherigerY, x, y, ring == 1 && ladung > 0.5 ? 9 : 8)
            vorherigerX = x
            vorherigerY = y
        }
    }
    if (ladung > 0.02) {
        let lichtBreite = Math.max(1, ladung * 4)
        leinwand.fillRect(mitteX - lichtBreite - 2, 6, lichtBreite * 2 + 5, mitteY + halbHoehe - 6, 8)
        leinwand.fillRect(mitteX - lichtBreite, 6, lichtBreite * 2 + 1, mitteY + halbHoehe - 6, 9)
        leinwand.fillRect(mitteX - lichtBreite * 0.3, 6,
            Math.max(1, lichtBreite * 0.6), mitteY + halbHoehe - 6, 1)
        // Zwei Blitze folgen einer festen Bahn und flackern nicht zufällig.
        for (let seite = -1; seite <= 1; seite += 2) {
            let knick = Math.sin(filmZeitMs * 0.006 + seite) * 3
            leinwand.drawLine(mitteX, mitteY - halbHoehe,
                mitteX + seite * (halbBreite * 0.45 + knick), mitteY - halbHoehe * 0.42, 9)
            leinwand.drawLine(mitteX + seite * (halbBreite * 0.45 + knick), mitteY - halbHoehe * 0.42,
                mitteX + seite * halbBreite * 0.18, mitteY - halbHoehe * 0.12, 1)
        }
    }
    // Ein schwebender Kristall mit Flächen. Breite und Lichtseite drehen sich gemeinsam.
    let drehwinkel = filmZeitMs * 0.0012
    let breite = (0.55 + Math.abs(Math.cos(drehwinkel)) * 0.22) * massstab
    let hoehe = 1.55 * massstab
    let mitte = mitteX + Math.sin(drehwinkel) * breite * 0.5
    fuelleDreieck(leinwand, mitteX, mitteY - hoehe, mitteX - breite, mitteY,
        mitte, mitteY + hoehe, 8)
    fuelleDreieck(leinwand, mitteX, mitteY - hoehe, mitte, mitteY + hoehe,
        mitteX + breite, mitteY, 9)
    leinwand.drawLine(mitteX, mitteY - hoehe, mitte, mitteY + hoehe, 1)
    leinwand.drawLine(mitteX, mitteY - hoehe, mitteX + breite, mitteY, 1)
    if (ladung > 0.3) {
        let glanzLaenge = halbBreite * ladung * 1.3
        leinwand.drawLine(mitteX - glanzLaenge, mitteY, mitteX + glanzLaenge, mitteY, 9)
        leinwand.drawLine(mitteX - glanzLaenge * 0.6, mitteY, mitteX + glanzLaenge * 0.6, mitteY, 1)
    }
}

// Jeder Buchstabe fliegt auf derselben geplanten Kurve von oben oder unten und von weiter außen an seinen Platz.
// Gezeichnet wird in drei Schichten (Rand, Schatten und Farbe); die Buchstaben zucken nicht zufällig.
function zeichneBuchstaben(leinwand: Image, schriftBild: Image, y: number, massstab: number, zeigeMs: number,
    glanzSpalte: number, istGold: boolean, einflugRichtung: number) {
    let startX = 80 - schriftBild.width * massstab / 2
    let hoehenMassstab = schriftBild == filmTitelBild ? massstab * 1.22 : massstab
    let anzahlBuchstaben = Math.idiv(schriftBild.width + 5, 6)
    // Der Schatten wächst mit der Größe; bei kleinen Titeln würde ein fester Versatz die Lücken in
    // den Buchstaben füllen.
    let schatten = Math.min(3, Math.round(massstab))
    let umrandung = Math.min(5, Math.round(massstab * 1.75))
    for (let schicht = 0; schicht < 3; schicht++) {
        for (let buchstabe = 0; buchstabe < anzahlBuchstaben; buchstabe++) {
            let fortschritt = glaette((zeigeMs - buchstabe * 85) / 650)
            if (fortschritt <= 0) continue
            let rest = 1 - fortschritt
            let verschiebungX = (buchstabe - (anzahlBuchstaben - 1) / 2) * rest * 16
            let verschiebungY = rest * rest * 29 * einflugRichtung
            for (let schriftX = buchstabe * 6; schriftX < Math.min(schriftBild.width, buchstabe * 6 + 6); schriftX++) {
                for (let schriftY = 0; schriftY < schriftBild.height; schriftY++) {
                    if (!schriftBild.getPixel(schriftX, schriftY)) continue
                    let x = Math.round(startX + schriftX * massstab + verschiebungX)
                    let bildY = Math.round(y + schriftY * hoehenMassstab + verschiebungY)
                    let breite = Math.max(1, Math.ceil(massstab))
                    let hoehe = Math.max(1, Math.ceil(hoehenMassstab))
                    if (schicht == 0) {
                        leinwand.fillRect(x - 1, bildY - 1, breite + 2, hoehe + 2, 15)
                        leinwand.fillRect(x + 2, bildY + umrandung, breite + 1, hoehe + 1, 15)
                    }
                    else if (schicht == 1) leinwand.fillRect(x + 1, bildY + schatten,
                        breite, hoehe + 1, istGold ? 4 : 8)
                    else {
                        let farbe = schriftY < Math.idiv(schriftBild.height, 2) ? 1 : istGold ? 5 : 9
                        if (Math.abs(schriftX - glanzSpalte) < 2) farbe = 1
                        leinwand.fillRect(x, bildY, breite, hoehe, farbe)
                    }
                }
            }
        }
    }
}

function zeichneFluglinien(leinwand: Image, staerke: number) {
    for (let i = 0; i < 12; i++) {
        let ringNummer = i * 2
        let fortschritt = ((filmZeitMs * 0.0015 + i * 0.31) % 1)
        let radius = 20 + fortschritt * 92
        let x = 80 + filmRingX[ringNummer] * radius
        let y = 55 + filmRingY[ringNummer] * radius * 0.7
        let schweif = radius - (5 + staerke * 22)
        leinwand.drawLine(x, y,
            80 + filmRingX[ringNummer] * schweif, 55 + filmRingY[ringNummer] * schweif * 0.7,
            i % 3 == 0 ? 9 : 8)
    }
}

// Text in einem dunklen Kasten, waagerecht in der Mitte.
function zeichneBeschriftung(leinwand: Image, text: string, y: number, farbe: number) {
    let x = 80 - text.length * 3
    leinwand.fillRect(x - 3, y - 2, text.length * 6 + 6, 10, 15)
    leinwand.print(text, x, y, farbe, image.font8)
}

function zeichneFilm(leinwand: Image) {
    let zeitMs = filmZeitMs
    filmBrennweite = 92
    filmAbend = zeitMs >= FILM_ABEND_MS
    if (zeitMs < FILM_TORLADUNG_MS) {
        let fortschritt = zeitMs / FILM_TORLADUNG_MS
        let kurve = glaette(fortschritt)
        setzeFilmKamera(
            Math.sin(fortschritt * Math.PI * 2) * 1.1,
            3.1 + Math.sin(fortschritt * Math.PI) * 0.8,
            -4 + kurve * 38,
            Math.sin(fortschritt * Math.PI * 2) * 0.075,
            -0.04,
            Math.sin(fortschritt * Math.PI * 2) * 0.055)
    } else if (zeitMs < FILM_TORFLUG_MS) {
        let fortschritt = glaette((zeitMs - FILM_TORLADUNG_MS) / 2400)
        setzeFilmKamera(0, 3.1 - fortschritt * 0.7, 34 + fortschritt * 3.2, 0, -0.04, 0)
    } else if (zeitMs < FILM_KARTE_MS) {
        let fortschritt = (zeitMs - FILM_TORFLUG_MS) / 4000
        // Beschleunigen durch das Tor, dann Abbremsen vor der Zielinsel.
        let flugweg = glaette(fortschritt)
        filmBrennweite = 92 - Math.sin(fortschritt * Math.PI) * 16
        setzeFilmKamera(
            Math.sin(fortschritt * Math.PI * 2) * 0.8,
            2.4 + flugweg * 4,
            37.2 + flugweg * 72.8,
            Math.sin(fortschritt * Math.PI * 2) * 0.04,
            -0.04 - flugweg * 0.12,
            Math.sin(fortschritt * Math.PI * 2) * 0.09)
    } else {
        // Ankunft: eine ruhige Fahrt über der Zielinsel, unter Karte und Titel.
        let fortschritt = Math.min(1,
            (zeitMs - FILM_KARTE_MS) / (FILM_ABBLENDE_MS - FILM_KARTE_MS))
        setzeFilmKamera(fortschritt * 1.1, 6.4 - fortschritt * 0.6, 110 + fortschritt * 6.2,
            fortschritt * 0.025, -0.16, 0)
    }
    let sog = zeitMs >= FILM_TORFLUG_MS && zeitMs < FILM_KARTE_MS
        ? Math.sin((zeitMs - FILM_TORFLUG_MS) / 4000 * Math.PI)
        : 0
    zeichneHimmel(leinwand, filmAbend, sog)
    zeichneKulisse(leinwand)
    if (!filmAbend) {
        let ladung = zeitMs < FILM_TORLADUNG_MS ? 0
            : zeitMs < FILM_TORFLUG_MS ? glaette((zeitMs - FILM_TORLADUNG_MS) / 1800)
            : 1
        zeichneTor(leinwand, ladung)
    }
    if (zeitMs < 1600) {
        // Aus Schwarz öffnet sich die breite Leinwand (die Kinobalken schieben sich auseinander) und gibt
        // den Kameraflug frei.
        let vorhang = Math.round((1 - glaette(zeitMs / 1600)) * 53)
        leinwand.fillRect(0, 6, 160, vorhang, 15)
        leinwand.fillRect(0, 112 - vorhang, 160, vorhang, 15)
    }
    if (zeitMs >= FILM_TORLADUNG_MS && zeitMs < FILM_TORFLUG_MS) {
        let energie = glaette((zeitMs - FILM_TORLADUNG_MS) / 2400)
        // Die Energie zieht sichtbare Splitter zum Tor, bevor es sich öffnet.
        for (let i = 0; i < 8; i++) {
            let ringNummer = i * 3
            let radius = 18 + ((i * 13 + 97 - ((zeitMs - FILM_TORLADUNG_MS) / 17) % 97) % 97)
            let x = 80 + filmRingX[ringNummer] * radius
            let y = 60 + filmRingY[ringNummer] * radius * 0.68
            leinwand.fillRect(x, y, 2 + energie * 2, 2 + energie * 2, i % 3 == 0 ? 5 : 9)
        }
    }
    if (sog > 0.1) zeichneFluglinien(leinwand, sog)
    if (zeitMs >= FILM_KARTE_MS && zeitMs < FILM_TITEL_MS) {
        let vergangenMs = zeitMs - FILM_KARTE_MS
        // Zwei riesige Wörter statt einer kleinen Beschriftung über dem Bild.
        zeichneBuchstaben(leinwand, filmCalliopeBild, 19, 2.85,
            vergangenMs + 180, (vergangenMs - 1400) / 50, true, -1)
        zeichneBuchstaben(leinwand, filmHackerBild, 55, 3.45,
            vergangenMs - 180, (vergangenMs - 1700) / 48, false, 1)
        if (vergangenMs > 1200) {
            let enthuellt = glaette((vergangenMs - 1200) / 550)
            let y = 98 + Math.round((1 - enthuellt) * 6)
            leinwand.fillRect(Math.idiv(160 - filmPraesentiertBild.width, 2) - 3, y - 2,
                filmPraesentiertBild.width + 6, filmPraesentiertBild.height + 3, 15)
            for (let x = 0; x < Math.floor(filmPraesentiertBild.width * enthuellt); x++) {
                for (let bildY = 0; bildY < filmPraesentiertBild.height; bildY++) {
                    if (filmPraesentiertBild.getPixel(x, bildY)) {
                        leinwand.setPixel(Math.idiv(160 - filmPraesentiertBild.width, 2) + x, y + bildY, 1)
                    }
                }
            }
        }
        let halbLaenge = Math.min(56, Math.max(0, (vergangenMs - 1700) / 12))
        leinwand.drawLine(80 - halbLaenge, 106, 80 + halbLaenge, 106, 4)
    }
    if (zeitMs >= FILM_TITEL_MS) {
        let vergangenMs = zeitMs - FILM_TITEL_MS
        let abklingen = 1 - glaette(vergangenMs / 1000)
        // Ein ruhiger, großer Auftritt des Titels: Der Kameraflug läuft darunter weiter.
        zeichneBuchstaben(leinwand, filmTitelBild, 15 - abklingen * 7,
            titelMassstab(148) + abklingen * 0.12, vergangenMs + 120, (vergangenMs - 1800) / 33, true, -1)
        if (vergangenMs > 1600) zeichneBeschriftung(leinwand, "BAUE DEINE EIGENE WELT", 51, 13)
        // Blätter und Funken im Vordergrund bewegen sich mit der Kamerafahrt.
        for (let i = 0; i < 8; i++) {
            let x = (i * 43 + vergangenMs / 95) % 176 - 8
            let y = 65 + (i * 19 % 42) + Math.sin(vergangenMs * 0.0018 + i) * 3
            leinwand.fillRect(x, y, i % 3 == 0 ? 2 : 1, 1, i % 3 == 0 ? 5 : 7)
        }
        if (zeitMs >= FILM_ABBLENDE_MS) {
            let abblende = glaette((zeitMs - FILM_ABBLENDE_MS) / 1500)
            let vorhang = Math.round(abblende * 32)
            leinwand.fillRect(0, 6, 160, vorhang, 15)
            leinwand.fillRect(0, 112 - vorhang, 160, vorhang, 15)
            zeichneBeschriftung(leinwand, "DEIN ABENTEUER BEGINNT", Math.round(87 - abblende * 16), 9)
        }
    }
    leinwand.fillRect(0, 0, 160, 6, 15)
    leinwand.fillRect(0, 110, 160, 10, 15)
    leinwand.drawLine(0, 110, Math.idiv(Math.min(zeitMs, FILM_DAUER_MS) * 159, FILM_DAUER_MS), 110, 4)
    if (zeitMs - filmSprungAbMs >= FILM_SPRUNG_PAUSE_MS) {
        let hinweis = "A: Überspringen"
        leinwand.print(hinweis, 80 - hinweis.length * 3, 112, 11, image.font8)
    }
}

// Größe des Spieltitels: höchstens 2,36-fach und nie breiter, als der Wert breite in Pixeln angibt.
function titelMassstab(breite: number): number {
    return Math.min(2.36, breite / filmTitelBild.width)
}

function zeichnePraesentiert() {
    let text = "präsentiert"
    filmPraesentiertBild = image.create(text.length * 6, 8)
    filmPraesentiertBild.print(text, 0, 0, 1, image.font8)
}

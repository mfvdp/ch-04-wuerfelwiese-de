// Die Klänge des Spiels: kurz, selbst erzeugt, ohne Audiodateien und ohne blockierendes Abspielen (alles
// läuft im Hintergrund).
let tonAn = true
let letztesFilmKapitel = -1
let klangAbbauen = music.createSoundEffect(WaveShape.Noise, 600, 130, 70, 0, 75,
    SoundExpressionEffect.None, InterpolationCurve.Curve)
let klangSetzen = music.createSoundEffect(WaveShape.Triangle, 330, 180, 80, 0, 100,
    SoundExpressionEffect.None, InterpolationCurve.Curve)
let klangErfolg = music.stringPlayable("C5 E5 G5 C6", 280)
let klangKristall = music.stringPlayable("E5 G5 B5 E6", 320)
function spieleKlang(klangArt: number) {
    if (!tonAn) return
    music.play(klangArt == 0 ? klangAbbauen
        : klangArt == 1 ? klangSetzen
        : klangArt == 2 ? klangErfolg
        : klangKristall, music.PlaybackMode.InBackground)
}
function spieleFilmTon(kapitel: number) {
    // Jedes Kapitel des Films (kapitelBei) bekommt beim Eintritt seinen eigenen Klang.
    if (kapitel == letztesFilmKapitel) return
    letztesFilmKapitel = kapitel
    if (!tonAn) return
    if (kapitel == 0) {
        music.play(music.createSoundEffect(WaveShape.Sine, 65, 98, 45, 15, 4400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C3 G3 D4 G4 E4 G4 D4 G3", 108), music.PlaybackMode.InBackground)
    }
    if (kapitel == 1) {
        music.play(music.createSoundEffect(WaveShape.Triangle, 130, 1046, 12, 85, 2200,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    }
    if (kapitel == 2) {
        music.play(music.createSoundEffect(WaveShape.Noise, 150, 2100, 12, 90, 2400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C4 D4 E4 G4 C5 D5 E5 G5", 180), music.PlaybackMode.InBackground)
    }
    // Die Karte „Calliope Hacker präsentiert“ bekommt eine Erkennungsmelodie; der Titel (Kapitel 4) spielt
    // dieselben Töne langsamer.
    if (kapitel == 3) {
        music.play(music.stringPlayable("C4 G4 C5 E5 G5 E5 D5 C5", 140), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(WaveShape.Triangle, 260, 65, 110, 0, 1200,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    }
    if (kapitel == 4) {
        music.play(music.createSoundEffect(WaveShape.Sawtooth, 120, 35, 115, 0, 1400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C4 G4 C5 E5 G5 E5 D5 C5", 100), music.PlaybackMode.InBackground)
    }
    if (kapitel == 5) music.play(music.stringPlayable("E5 G5 C6", 220), music.PlaybackMode.InBackground)
}

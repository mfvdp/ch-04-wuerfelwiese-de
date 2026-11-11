// Einstellungen für den Platz des Spielstands im Flash-Speicher des Calliope.
// Der Spielstand liegt dort in einem kleinen Dateisystem namens RAFFS. Es teilt den reservierten Platz in zwei Hälften:
// Beim Speichern müssen der alte UND der neue Spielstand (je 3522 Byte) samt Verwaltungsdaten in eine Hälfte passen.
// PXT, das Bauwerkzeug von MakeCode, zieht diese Reservierung auch vom Platz für das Programm ab. Der Name
// SETTINGS_SIZE ist von MakeCode vorgegeben und darf nicht geändert werden.
namespace userconfig {
    export const SETTINGS_SIZE = 16 * 1024
}

const istGeraet = control.deviceDalVersion() != "sim"

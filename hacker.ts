// Die Bilder des Calliope Hackers, in den Farben der Palette dieses Spiels.
namespace hacker {
    // Titelbild, 64 x 40: der Calliope Hacker am Schreibtisch. Auf eine Wandfläche in der Farbe WANDFARBE zeichnen.
    export const TITELBILD = img`
        . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . c . . . . . . . . . . . . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . f f f f f f f 9 . . . . . c . c . c c c c c c c c c c c c c c c c c c c c c c . . . . . . . . . . .
        . . . . . . . . . . . . . f c c f f f f f f 9 . c . c . c . c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
        . . . . . . . . . . . . f c f f f f f f f f f 9 . c . c c c c f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
        . . . . . . . . . . . . f c f f f f f f f f f 9 c c c c c c c f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . c . . . . . . . . .
        . . . . . . . . . . . f c f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c . c . . . . . . . .
        . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . c . c . . . . . . .
        . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c c . c . . . . . .
        . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f 9 9 9 9 9 f f f f f f f f f f f f c c c c . c . . . . .
        . . . . . . . . . . . f f f f f f f f f f f f f 9 c c c c c c f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c . c 5 5 . .
        . . . . . . . . . . . c f f f f f f f f f f f f 9 c c c c c c f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f c c 5 8 8 8 8 8 5 . .
        . . . . . . . . . . f f c f f f f f f f f f f f f 9 c c c c c f f f f f f f f f f f f f f f f f f f f f f c 8 8 8 8 8 8 8 8 8 .
        . . . . . . . . . f f f f c c f f f f f f f f f f f 9 c c c c f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
        . . . . . . f f f f f f f f f c c c c f f f f f f f f 9 c c c f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
        . . . . . f 9 9 9 9 9 9 f f f f f f f f f f f f f f f f 9 c c f f f 8 8 8 8 f f f f f f f f f f f f f f f c 8 8 8 8 2 8 8 8 8 .
        . . . . f 9 9 9 9 9 9 9 9 f f f f f f f f f f f f f f f f 9 c f f f f f f f f f f f f f f f f f f f f f f c c 5 8 8 8 8 8 5 . c
        . . . . f 9 9 9 9 9 9 9 6 f f f f f f f f f f f f c f f f f 9 f f f f f f f f f f f f f f f f f f f f f f c c 5 5 c f c 5 5 c .
        . . . . f 9 9 9 9 9 9 9 6 f f f f f f f f f f f f f c f f f f 9 c c c c c c c c c c c c c c c c c c c c c c c c c c c c . c . .
        . . . . f 6 9 9 9 9 9 9 6 f f f f f f f f f f f f f f c f f f f f 3 3 c c c c c c c c c c c c c c c c c c c c c c c c . c . c .
        . . . . f 6 9 9 9 9 9 9 6 f f f f f f f f f f f f f f f c f f f f 3 3 f f f e e e e e e e e e e e e e e e e e e e e e e e e e e
        . . . . f 6 9 9 9 9 9 9 6 f f f f f f f f f f f f f f f f 8 c 9 c 9 c 2 c f 4 4 4 4 4 4 4 4 4 4 f f f f f f f f f f f f 4 4 4 4
        . . . . f 6 9 9 9 9 9 9 6 f f f f f f f f f f f f f f f 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 f f 1 f f b c b f 2 f 2 f f 4 4 4
        . . . . f 6 6 9 9 9 9 6 6 f f f f f f f f f f f f f f f 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 f 1 1 1 f f f f f 2 f 2 f f 4 4 4
        . . . . f 6 6 9 9 9 9 6 6 f f f f f f f f f f f f f f f f 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 f 1 f f f f f f f f f f 4 4 4 4
        . . . . . f 6 6 9 9 6 6 f f f f f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
        . . . . . f 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f f f f f c e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
        . . . . . . f 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 f f f f f f f f f f f f c c c c c c c c c c c c c c c . c . c . c . . c b b b b b b
        . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f c c c c c c c c c c c c c c . c . c . . . . . c b b b b b b
        . . . . . . . . . . . . . . . . . f f . f f f f f . c f f f f f c . c . c . c . c . c . c c c . c . . . . . . . . c b b b b b b
        . . . . . . . . . . . . . . . . . f f . f f f f f . . c f f f f c c . c . c . c . c . c . c c . . 6 9 9 9 6 . . . c b c c c c b
        . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f c . . . c . . . . . . . . c c . 6 9 9 9 9 9 6 . . c b b b b b b
        . . . . . . . . . . . . . . . . . f f 9 9 9 9 9 9 9 . . f f f f c . . . . . . . . . . . . c c . 6 9 f f f 9 6 . . c b b b b b b
        . . f . . . f . . . . . . . . . . f f 9 1 9 9 9 9 9 . . f f f f c . . . . . . . . . . . . c c . 6 9 9 9 9 9 6 . . c b b b b b b
        . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f c . . . . . . . . . . . . c c . 6 9 9 9 9 9 6 . . c b c c c c b
        . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 9 9 9 9 9 9 9 9 . . . . . . . . . . c c . 6 9 c c c 9 6 . . c b b b b b b
        . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 9 9 1 9 9 9 9 9 9 9 . . . . . . . . . c c . 6 9 9 9 9 9 6 . . c b b b b b b
        f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . c c . 6 9 9 9 9 9 6 . . c b b b b b b
        6 9 9 9 9 9 9 9 9 9 6 . . . . c c . . . . . . c c . . . . . . . . . . . . . . . . . . . . c c . . 6 6 6 6 6 . . . c b c c c c b
        . 6 6 6 6 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
    `
    export const WANDFARBE = 8
    // Bild an der Wand der Werkbank, 23 x 16, ohne durchsichtige Pixel.
    export const WANDBILD = img`
        d d d f f f f d d d d d d d d d d d d d d d d
        d d d f c f f b d d d d d c c c c c c c c c d
        d d d f c f f f b d d d d c 9 9 9 9 f f f c d
        d d d f f c f f b d d d d c f 5 5 5 5 f f c d
        d 9 9 f f f c f f b d d d c f 9 9 9 f f f c d
        9 9 9 f f f f f f b b b d c f f 2 2 2 f f c d
        9 9 9 f f f f f f f f f d c 9 9 9 9 9 f f c d
        9 9 9 f f f f f f f f f 3 c c c c c c c c c d
        9 9 9 f f f f f f d d d f f f d c c c d d d d
        9 9 9 f f f f f f d 4 4 4 4 4 4 4 4 4 4 4 4 4
        d 9 9 9 f f f f f f f e e e e e e e e e e e e
        d d d c d d d d d f f c d d d d d d d d d c d
        d d d c d d d d d f f c d d d d d d d d d c d
        d d d c d d d d d f f c d d d d d d d d d c d
        d c c c c c d d d 9 9 9 9 d d d d d d d d c d
        d d d d d d d d d 1 1 1 1 d d d d d d d d c d
    `
}

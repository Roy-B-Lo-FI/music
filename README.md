# Marco Broi — Instrumentals

Sito statico in stile **lo-fi / ambient / bedroom producer** per pubblicare strumentali su GitHub Pages.

## Struttura

```text
marco-music/
├── index.html
├── style.css
├── player.js
├── releases.json
└── assets/
    ├── audio/
    └── covers/
```

## Come pubblicare

1. Crea una repository GitHub, ad esempio `marco-music`.
2. Carica tutti i file di questa cartella nella repository.
3. Inserisci i tuoi MP3 in `assets/audio/`.
4. Inserisci le cover in `assets/covers/`.
5. Modifica `releases.json` con titoli, file e cover reali.
6. Vai in **Settings → Pages**.
7. In *Build and deployment*, seleziona:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
8. Salva e attendi qualche minuto.

Il sito sarà disponibile su:

```text
https://tuousername.github.io/marco-music/
```

## Formato audio consigliato

- MP3 320 kbps per qualità e compatibilità.
- Oppure OGG Vorbis per file più leggeri.
- Evita WAV e FLAC nel sito: occupano troppo spazio.
- Mantieni il sito sotto 1 GB.

## Note

- Il player è statico: non richiede database o backend.
- I download e le vendite possono essere collegati a Ko-fi, PayPal, Stripe o Bandcamp.
- Non usare GitHub LFS per gli audio: GitHub Pages potrebbe servire solo il puntatore LFS invece del file audio.

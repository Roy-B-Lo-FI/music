# ROY-B — Instrumentals

Sito statico con **preview da 45 secondi** per pubblicare strumentali lo-fi, ambient e bedroom rap su GitHub Pages.

## Pubblicazione

1. Carica gli MP3 in `assets/audio/`.
2. Carica le cover in `assets/covers/`.
3. Modifica `releases.json`.
4. Vai in **Settings → Pages**.
5. Seleziona **Deploy from a branch**, branch `main`, cartella `/ (root)`.

Il sito sarà disponibile su:

```text
https://roy-b-lo-fi.github.io/music/
```

## Preview

- Ogni traccia si interrompe automaticamente a 45 secondi.
- Il player non mostra il pulsante di download.
- Il tasto destro è disabilitato solo nell’area del player.
- Per cambiare la durata, modifica in `player.js`:

```js
const PREVIEW_SECONDS = 45;
```

## Nota

Le preview non impediscono tecnicamente il download diretto dell’MP3 a chi conosce l’URL. Per una protezione più efficace, carica solo clip brevi esportate appositamente e conserva i master completi fuori dalla repository.

# ROY-B — Instrumentals

Sito statico con preview da 45 secondi per strumentali lo-fi, ambient e bedroom rap.

## Pubblicazione

1. Carica gli MP3 in `assets/audio/`.
2. Carica le cover in `assets/covers/`.
3. Modifica `releases.json`.
4. Vai in **Settings → Pages**.
5. Seleziona **Deploy from a branch**, branch `main`, cartella `/ (root)`.

Sito:

```text
https://roy-b-lo-fi.github.io/music/
```

## Preview

Ogni traccia si interrompe automaticamente dopo 45 secondi. Per modificare la durata, cambia questa riga in `player.js`:

```js
const PREVIEW_SECONDS = 45;
```

## Note

Le preview riducono molto il rischio di download, ma non lo eliminano del tutto: chi conosce l’URL diretto dell’MP3 può comunque scaricarlo. Per una protezione maggiore, carica solo clip brevi esportate appositamente e conserva i master completi fuori dalla repository.

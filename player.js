let releases = [];
let playlist = [];
let currentIndex = -1;

const PREVIEW_SECONDS = 45;

const audio = document.getElementById("audio");
const playerBar = document.getElementById("playerBar");
const releaseGrid = document.getElementById("release-grid");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seek = document.getElementById("seek");
const volume = document.getElementById("volume");
const playerTrack = document.getElementById("playerTrack");
const playerRelease = document.getElementById("playerRelease");
const playerCover = document.getElementById("playerCover");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const terminalHost = document.getElementById("terminal-column-1");

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".player-bar")) {
    event.preventDefault();
  }
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function loadReleases() {
  try {
    const response = await fetch("releases.json");

    if (!response.ok) {
      throw new Error("releases.json non trovato");
    }

    releases = await response.json();
    renderReleases();
  } catch {
    releaseGrid.innerHTML =
      "<p class='load-error'>Impossibile caricare il catalogo. Controlla il file releases.json.</p>";
  }
}

function renderReleases() {
  releaseGrid.replaceChildren();

  releases.forEach((release) => {
    const card = document.createElement("article");
    card.className = "release";

    const cover = document.createElement("div");
    cover.className = "cover";

    if (release.cover) {
      const image = document.createElement("img");
      image.src = release.cover;
      image.alt = `Copertina di ${release.title}`;
      image.loading = "lazy";
      cover.appendChild(image);
    } else {
      cover.textContent = release.title;
    }

    const info = document.createElement("div");
    info.className = "release-info";

    const title = document.createElement("h3");
    title.className = "release-title";
    title.textContent = release.title;

    const meta = document.createElement("p");
    meta.className = "release-meta";
    meta.textContent = `${release.year} · ${
      release.genre || "instrumental"
    } · preview 45s`;

    info.append(title, meta);

    release.tracks.forEach((track, trackIndex) => {
      const button = document.createElement("button");
      button.className = "track";
      button.type = "button";

      button.innerHTML = `
        <span class="track-name">
          ${track.title}
          <small class="preview-tag">preview 45s</small>
        </span>
        <span class="track-duration">▶</span>
      `;

      button.addEventListener("click", () => {
        playlist = release.tracks.map((item) => ({
          ...item,
          release,
          cover: release.cover
        }));

        playTrack(trackIndex);
      });

      info.appendChild(button);
    });

    card.append(cover, info);
    releaseGrid.appendChild(card);
  });
}

function updateTrackButtons() {
  document.querySelectorAll(".track").forEach((button) => {
    const trackTitle = button.querySelector(".track-name")?.childNodes[0]
      ?.textContent?.trim();

    button.classList.toggle(
      "active",
      Boolean(
        currentIndex >= 0 &&
          playlist[currentIndex] &&
          trackTitle === playlist[currentIndex].title
      )
    );
  });
}

function playTrack(index) {
  if (index < 0 || index >= playlist.length) {
    return;
  }

  currentIndex = index;

  const track = playlist[currentIndex];

  playerBar.classList.add("has-track");
  audio.src = track.file;
  audio.currentTime = 0;

  playerTrack.textContent = `${track.title} — preview 45s`;
  playerRelease.textContent = track.release.title;
  playerCover.src = track.cover || "";

  updateTrackButtons();

  audio.play().catch(() => {
    playerTrack.textContent = "Tocca play per avviare la preview";
  });
}

playBtn.addEventListener("click", () => {
  if (currentIndex === -1) {
    if (playlist.length) {
      playTrack(0);
    }

    return;
  }

  if (audio.paused) {
    if (audio.currentTime >= PREVIEW_SECONDS) {
      audio.currentTime = 0;
    }

    audio.play();
  } else {
    audio.pause();
  }
});

prevBtn.addEventListener("click", () => {
  playTrack(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
  playTrack(currentIndex + 1);
});

audio.addEventListener("play", () => {
  playBtn.textContent = "⏸";
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
});

audio.addEventListener("timeupdate", () => {
  if (audio.currentTime >= PREVIEW_SECONDS) {
    audio.pause();
    audio.currentTime = PREVIEW_SECONDS;

    if (playlist[currentIndex]) {
      playerTrack.textContent = `${playlist[currentIndex].title} — preview terminata`;
    }

    return;
  }

  seek.value = (audio.currentTime / PREVIEW_SECONDS) * 100 || 0;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = "0:45";
});

audio.addEventListener("ended", () => {
  if (currentIndex + 1 < playlist.length) {
    playTrack(currentIndex + 1);
  }
});

seek.addEventListener("input", () => {
  const maxPreviewTime = Math.min(
    PREVIEW_SECONDS,
    audio.duration || PREVIEW_SECONDS
  );

  audio.currentTime = (seek.value / 100) * maxPreviewTime;
});

volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

document.getElementById("year").textContent = new Date().getFullYear();

loadReleases();

const terminalLines = [
  "roy-b@Cachy-Desktop ~ $ fastfetch --structure Title:OS:Kernel:Uptime:Packages:Shell:Display:DE:WM:Terminal:CPU:GPU:Memory:Swap:Disk:Locale",
  "roy-b@Cachy-Desktop",
  "--------------------",
  "OS: CachyOS x86_64",
  "Kernel: Linux 7.2.9-2-cachyos",
  "Uptime: 2 hours, 37 mins",
  "Packages: 1260 (pacman)",
  "Shell: fish 4.9.3",
  "Display (Odyssey G5): 2560x1440 in 27\", 165 Hz [External, HDR]",
  "Desktop Environment: KDE Plasma 6.7.5",
  "Window Manager: KWin (Wayland)",
  "Terminal: konsole 26.8.2",
  "CPU: AMD Ryzen 7 5800X (16) @ 4.85 GHz",
  "GPU: NVIDIA GeForce RTX 3060 Lite Hash Rate [Discrete]",
  "Memory: 5.10 GiB / 31.25 GiB (16%)",
  "Swap: 3.19 MiB / 31.24 GiB (0%)",
  "Disk (/): 29.43 GiB / 931.01 GiB (3%) - btrfs",
  "Disk (/mnt/dati): 1.38 TiB / 1.82 TiB (76%) - fuseblk",
  "Disk (/mnt/windows): 563.46 GiB / 1.82 TiB (30%) - fuseblk",
  "Disk (/run/media/roy-b/E839-9AB4): 768.00 KiB / 117.18 GiB (0%) - exfat [External]",
  "Local IP (enp10s0): 192.168.50.42/24",
  "Locale: it_IT.UTF-8",
  "",
  "roy-b@Cachy-Desktop ~ $ inxi -Fxxxz --no-host --filter --width 180",
  "System: Kernel: 7.2.9-2-cachyos arch: x86_64 bits: 64 compiler: gcc v: 15.1.1 clocksource: tsc",
  "Desktop: KDE Plasma v: 6.7.5 tk: Qt v: 6.8.2 wm: kwin_wayland vt: 2 dm: SDDM v: 0.21.0",
  "Machine: Type: Desktop System: Custom build product: Cachy-Desktop v: 1.0",
  "CPU: Info: 8-core model: AMD Ryzen 7 5800X bits: 64 type: MT MCP smt: enabled cache: L2: 4 MiB L3: 32 MiB",
  "Speed (MHz): avg: 4850 min/max: 2200/4850 cores: 1:4850 2:4850 3:4850 4:4850 5:4850 6:4850 7:4850 8:4850",
  "Graphics: Device-1: NVIDIA GA106 [GeForce RTX 3060 Lite Hash Rate] driver: nvidia v: 575.64.03",
  "Display: wayland server: X.org v: 1.21.1.16 with: Xwayland v: 24.1.6 compositor: kwin_wayland driver: gpu: nvidia",
  "Monitor-1: DP-1 model: Samsung Odyssey G5 res: 2560x1440 hz: 165 dpi: 109 size: 597x336mm diag: 685mm (27.0\")",
  "Audio: Device-1: NVIDIA GA106 High Definition Audio driver: snd_hda_intel",
  "Network: Device-1: Realtek RTL8125 2.5GbE driver: r8169 if: enp10s0 state: up speed: 1000 Mbps duplex: full",
  "",
  "roy-b@Cachy-Desktop ~ $ sudo pacman -Syu",
  ":: Synchronizing package databases...",
  " cachyos-v3 downloading...                    100%  138.7 KiB  1.23 MiB/s 00:00",
  " core downloading...                          100%  119.4 KiB  1.09 MiB/s 00:00",
  " extra downloading...                         100%    8.0

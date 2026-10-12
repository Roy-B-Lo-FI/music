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
  } catch (error) {
    releaseGrid.innerHTML =
      "<p class='load-error'>Impossibile caricare il catalogo. Controlla il file releases.json.</p>";
  }
}

function renderReleases() {
  releaseGrid.innerHTML = "";

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

    release.tracks.forEach((track) => {
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

        const trackIndex = release.tracks.findIndex(
          (item) => item.file === track.file
        );

        playTrack(trackIndex);
      });

      info.appendChild(button);
    });

    card.append(cover, info);
    releaseGrid.appendChild(card);
  });
}

function playTrack(index) {
  if (index < 0 || index >= playlist.length) {
    return;
  }

  currentIndex = index;

  const track = playlist[index];

  playerBar.classList.add("has-track");

  audio.src = track.file;
  audio.currentTime = 0;

  playerTrack.textContent = `${track.title} — preview 45s`;
  playerRelease.textContent = track.release.title;
  playerCover.src = track.cover || "";

  audio.play().catch(() => {
    playerTrack.textContent = "Tocca play per avviare la preview";
  });

  document.querySelectorAll(".track").forEach((element, elementIndex) => {
    element.classList.toggle("active", elementIndex === currentIndex);
  });
}

playBtn.addEventListener("click", () => {
  if (currentIndex === -1 && playlist.length) {
    playTrack(0);
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

    playerTrack.textContent = `${playlist[currentIndex].title} — preview terminata`;

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

const terminalColumns = [
  document.getElementById("terminal-column-1"),
  document.getElementById("terminal-column-2"),
  document.getElementById("terminal-column-3"),
  document.getElementById("terminal-column-4"),
  document.getElementById("terminal-column-5")
].filter(Boolean);

const archTerminalLines = [
  [
    "roy-b@archlinux ~ $ sudo pacman -Syu",
    ":: Synchronizing package databases...",
    "core is up to date",
    "extra is up to date",
    ":: Starting full system upgrade...",
    "there is nothing to do",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ neofetch --stdout",
    "OS: Arch Linux x86_64",
    "Kernel: 6.12.4-arch1-1",
    "Shell: zsh 5.9",
    "WM: Hyprland",
    "Terminal: kitty",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ systemctl --user status pipewire",
    "● pipewire.service - Multimedia Service",
    "   Active: active (running)",
    "roy-b@archlinux ~ $ wpctl status",
    "Audio",
    " ├─ Devices:",
    " └─ Sinks:",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ ls -lah ~/Music",
    "drwxr-xr-x  ambient",
    "drwxr-xr-x  field-recordings",
    "drwxr-xr-x  lofi",
    "drwxr-xr-x  unfinished",
    "roy-b@archlinux ~ $ ffprobe nocturne.wav",
    "Duration: 00:03:42.04",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ uptime",
    " 03:12:00 up 4:21, 1 user, load average: 0.42, 0.38, 0.31",
    "roy-b@archlinux ~ $ df -h /",
    "Filesystem      Size  Used Avail Use% Mounted on",
    "/dev/nvme0n1p2  931G  218G  666G  25% /",
    "roy-b@archlinux ~ $ journalctl --user -b -g pipewire",
    "pipewire[1042]: server started",
    "roy-b@archlinux ~ $"
  ]
];

function renderTerminalLine(line) {
  const safeLine = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (safeLine.includes("roy-b@archlinux")) {
    return `<span class="prompt">${safeLine}</span>`;
  }

  if (safeLine.includes("Active: active")) {
    return `<span class="success">${safeLine}</span>`;
  }

  return safeLine;
}

terminalColumns.forEach((column, index) => {
  const lines = archTerminalLines[index % archTerminalLines.length];

  const output = [
    ...lines,
    ...lines,
    ...lines,
    ...lines,
    ...lines,
    ...lines,
    ...lines,
    ...lines
  ];

  column.innerHTML = output.map(renderTerminalLine).join("<br>");
});

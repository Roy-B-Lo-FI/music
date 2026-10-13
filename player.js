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
    "roy-b@archlinux ~ $ fastfetch --logo archlinux --structure Title:OS:Kernel:Uptime:Packages:Shell:WM:Terminal:CPU:GPU:Memory",
    "roy-b@archlinux",
    "--------------",
    "OS: Arch Linux x86_64",
    "Kernel: 6.12.4-arch1-1",
    "Uptime: 4 hours, 21 mins",
    "Packages: 1187 (pacman)",
    "Shell: zsh 5.9",
    "WM: Hyprland",
    "Terminal: kitty 0.37.0",
    "CPU: AMD Ryzen 7 5800X (16) @ 3.80 GHz",
    "GPU: AMD Radeon RX 6700 XT",
    "Memory: 3128MiB / 16384MiB",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ sudo pacman -Syu",
    ":: Synchronizing package databases...",
    " core downloading...",
    " extra downloading...",
    " multilib downloading...",
    ":: Starting full system upgrade...",
    "resolving dependencies...",
    "looking for conflicting packages...",
    "",
    "Packages (4) pipewire-1:1.2.7-1  wireplumber-0.5.3-1",
    "             linux-6.12.4.arch1-1  linux-firmware-20241210-1",
    "",
    "Total Installed Size:  428.55 MiB",
    "Net Upgrade Size:        0.00 MiB",
    "",
    ":: Proceed with installation? [Y/n] y",
    ":: Processing package changes...",
    "(1/4) upgrading pipewire",
    "(2/4) upgrading wireplumber",
    "(3/4) upgrading linux",
    "(4/4) upgrading linux-firmware",
    ":: Running post-transaction hooks...",
    "(1/5) Updating module dependencies...",
    "(2/5) Arming ConditionNeedsUpdate...",
    "(3/5) Updating linux initcpios...",
    ":: there is nothing to do",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ systemctl --user status pipewire wireplumber",
    "● pipewire.service - Multimedia Service",
    "     Loaded: loaded (/usr/lib/systemd/user/pipewire.service; enabled)",
    "     Active: active (running) since Sun 2026-10-12 03:12:00 CEST",
    "TriggeredBy: ● pipewire.socket",
    "   Main PID: 1042 (pipewire)",
    "      Tasks: 3 (limit: 18811)",
    "     Memory: 11.7M",
    "        CPU: 2.842s",
    "",
    "● wireplumber.service - Multimedia Service Session Manager",
    "     Loaded: loaded (/usr/lib/systemd/user/wireplumber.service; enabled)",
    "     Active: active (running) since Sun 2026-10-12 03:12:01 CEST",
    "",
    "roy-b@archlinux ~ $ wpctl status",
    "PipeWire 'pipewire-0' [1.2.7, roy-b@archlinux, cookie:4819237]",
    " ├─ Clients:",
    " │      32. WirePlumber [1.2.7, roy-b@archlinux, pid:1051]",
    " │      41. kitty [1.2.7, roy-b@archlinux, pid:2284]",
    " ├─ Audio",
    " │  ├─ Devices:",
    " │  │      43. Built-in Audio Analog Stereo",
    " │  └─ Sinks:",
    " │         51. Built-in Audio Analog Stereo",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ find ~/Music -maxdepth 2 -type f | sort",
    "/home/roy-b/Music/ambient/aftercache.flac",
    "/home/roy-b/Music/ambient/window-rain.wav",
    "/home/roy-b/Music/field-recordings/city-03-12.wav",
    "/home/roy-b/Music/field-recordings/kitchen-2am.wav",
    "/home/roy-b/Music/lofi/nocturne.wav",
    "/home/roy-b/Music/lofi/static-memory.wav",
    "/home/roy-b/Music/unfinished/blue-screen-demo.wav",
    "/home/roy-b/Music/unfinished/late-night-loop.wav",
    "",
    "roy-b@archlinux ~ $ ffprobe -hide_banner ~/Music/lofi/nocturne.wav",
    "Input #0, wav, from '/home/roy-b/Music/lofi/nocturne.wav':",
    "  Duration: 00:03:42.04, bitrate: 1411 kb/s",
    "  Stream #0:0: Audio: pcm_s16le, 44100 Hz, stereo, s16, 1411 kb/s",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ journalctl --user -b -u pipewire --no-pager | tail -n 14",
    "oct 12 03:12:00 archlinux systemd[1012]: Started Multimedia Service.",
    "oct 12 03:12:00 archlinux pipewire[1042]: mod.rt: RTKit found, using realtime scheduling.",
    "oct 12 03:12:01 archlinux pipewire[1042]: spa.alsa: opened device hw:0",
    "oct 12 03:12:01 archlinux wireplumber[1051]: <WpSiAudioAdapter> activated node 51",
    "oct 12 03:18:44 archlinux pipewire[1042]: client 41 connected: kitty",
    "oct 12 03:20:16 archlinux pipewire[1042]: client 58 connected: cmus",
    "oct 12 03:21:07 archlinux wireplumber[1051]: configured default audio sink",
    "",
    "roy-b@archlinux ~ $ df -h /home",
    "Filesystem      Size  Used Avail Use% Mounted on",
    "/dev/nvme0n1p2  931G  218G  666G  25% /",
    "",
    "roy-b@archlinux ~ $ uptime",
    " 03:12:00 up 4:21, 1 user, load average: 0.42, 0.38, 0.31",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ systemd-analyze",
    "Startup finished in 3.847s (firmware) + 1.204s (loader) + 2.916s (kernel) + 5.432s (initrd) + 8.731s (userspace) = 22.130s",
    "graphical.target reached after 8.514s in userspace.",
    "",
    "roy-b@archlinux ~ $ systemd-analyze blame | head -n 10",
    "6.214s NetworkManager-wait-online.service",
    "3.872s systemd-journald.service",
    "2.916s systemd-udev-settle.service",
    "2.104s ldconfig.service",
    "1.842s systemd-random-seed.service",
    "1.604s systemd-modules-load.service",
    "1.287s systemd-tmpfiles-setup.service",
    "1.104s systemd-sysctl.service",
    "0.982s systemd-udevd.service",
    "0.741s systemd-user-sessions.service",
    "",
    "roy-b@archlinux ~ $ systemd-analyze critical-chain graphical.target",
    "The time when unit became active or started is printed after the '@' character.",
    "The time the unit took to start is printed after the '+' character.",
    "",
    "graphical.target @8.514s",
    "└─multi-user.target @8.509s",
    "  └─getty@tty1.service @8.501s",
    "    └─systemd-user-sessions.service @8.464s +36ms",
    "      └─network.target @8.438s",
    "        └─NetworkManager.service @6.872s +1.562s",
    "",
    "roy-b@archlinux ~ $"
  ],
  [
    "roy-b@archlinux ~ $ ps -eo pid,user,comm,%cpu,%mem --sort=-%cpu | head -n 10",
    "    PID USER     COMMAND         %CPU %MEM",
    "   2284 roy-b    kitty            4.8  1.2",
    "   1042 roy-b    pipewire         2.1  0.1",
    "   1051 roy-b    wireplumber      1.4  0.2",
    "   1876 roy-b    Hyprland         1.2  2.8",
    "   2418 roy-b    firefox          0.9  6.4",
    "   2633 roy-b    cmus             0.6  0.3",
    "   1120 roy-b    dunst            0.2  0.1",
    "   1298 roy-b    waybar           0.2  0.4",
    "   1407 roy-b    swaybg           0.1  0.2",
    "",
    "roy-b@archlinux ~ $ pactl list sinks short",
    "51\talsa_output.pci-0000_0a_00.6.analog-stereo\tPipeWire\tfloat32le-2ch-48000Hz\tRUNNING",
    "",
    "roy-b@archlinux ~ $ pactl get-sink-volume @DEFAULT_SINK@",
    "Volume: front-left: 45875 /  70% / -8.91 dB,   front-right: 45875 /  70% / -8.91 dB",
    "        balance 0.00",
    "",
    "roy-b@archlinux ~ $ pw-top",
    "S   ID  PRI  CS  CL  WAV  W/S  F/S  DRP  ERR  ALSA  QUANT  ERR  FPS",
    "*   51    0   0   0    0    0    0    0    0     0   1024    0  46.9",
    "    41    0   0   0    0    0    0    0    0     0      0    0  0.0",
    "*   58    0   0   0    0    0    0    0    0     0   1024    0  46.9",
    "    32    0   0   0    0    0    0    0    0     0      0    0  0.0",
    "",
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

const terminalHost = document.getElementById("terminal-column-1");

if (terminalHost) {
  const allLines = archTerminalLines.flat();

  const track = document.createElement("div");
  track.className = "terminal-track";

  const firstBlock = document.createElement("div");
  firstBlock.className = "terminal-block";

  track.appendChild(firstBlock);
  terminalHost.replaceChildren(track);

  function appendSequence() {
    const fragment = document.createDocumentFragment();

    allLines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "terminal-row";
      row.innerHTML = renderTerminalLine(line);
      fragment.appendChild(row);
    });

    firstBlock.appendChild(fragment);
  }

  function buildInfiniteTerminal() {
    track.style.animation = "none";
    track.querySelectorAll(".terminal-block").forEach((block) => {
      if (block !== firstBlock) {
        block.remove();
      }
    });

    firstBlock.replaceChildren();
    appendSequence();

    const minimumHeight = window.innerHeight + 200;

    while (firstBlock.getBoundingClientRect().height < minimumHeight) {
      appendSequence();
    }

    const secondBlock = firstBlock.cloneNode(true);
    track.appendChild(secondBlock);

    const blockHeight = firstBlock.getBoundingClientRect().height;
    const pixelsPerSecond = 65;

    track.style.setProperty(
      "--terminal-duration",
      `${blockHeight / pixelsPerSecond}s`
    );

    void track.offsetHeight;
    track.style.animation = "";
  }

  const fontsReady = document.fonts
    ? document.fonts.ready
    : Promise.resolve();

  fontsReady.then(buildInfiniteTerminal);

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildInfiniteTerminal, 200);
  });
}

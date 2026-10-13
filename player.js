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
  " extra downloading...                         100%    8.0 MiB  14.2 MiB/s 00:01",
  " multilib downloading...                      100%  143.5 KiB  1.38 MiB/s 00:00",
  ":: Starting full system upgrade...",
  "resolving dependencies...",
  "looking for conflicting packages...",
  "",
  "Packages (6) cachyos-linux-7.2.9-2  linux-firmware-20260210-1  nvidia-dkms-575.64.03-2",
  "             plasma-desktop-6.7.5-1  pipewire-1:1.4.8-1  wireplumber-0.5.10-1",
  "",
  "Total Download Size:    482.61 MiB",
  "Total Installed Size:  1836.42 MiB",
  "Net Upgrade Size:        8.93 MiB",
  "",
  ":: Proceed with installation? [Y/n] y",
  ":: Retrieving packages...",
  " cachyos-linux-7.2.9-2-x86_64                 100%  142.1 MiB  39.8 MiB/s 00:04",
  " nvidia-dkms-575.64.03-2-x86_64               100%   84.7 MiB  25.3 MiB/s 00:03",
  ":: Processing package changes...",
  "(1/6) upgrading cachyos-linux",
  "(2/6) upgrading linux-firmware",
  "(3/6) upgrading nvidia-dkms",
  "(4/6) upgrading pipewire",
  "(5/6) upgrading wireplumber",
  "(6/6) upgrading plasma-desktop",
  ":: Running post-transaction hooks...",
  "(1/7) Updating module dependencies...",
  "(2/7) Install DKMS modules",
  "(3/7) Updating linux initcpios...",
  "(4/7) Arming ConditionNeedsUpdate...",
  "",
  "roy-b@Cachy-Desktop ~ $ systemctl --user status pipewire wireplumber --no-pager",
  "● pipewire.service - PipeWire Multimedia Service",
  "     Loaded: loaded (/usr/lib/systemd/user/pipewire.service; enabled; preset: enabled)",
  "     Active: active (running) since Tue 2026-10-13 00:06:51 CEST; 2h 37min ago",
  "TriggeredBy: ● pipewire.socket",
  "   Main PID: 1854 (pipewire)",
  "      Tasks: 3 (limit: 38016)",
  "     Memory: 14.8M (peak: 18.6M)",
  "        CPU: 4.931s",
  "     CGroup: /user.slice/user-1000.slice/user@1000.service/session.slice/pipewire.service",
  "             └─1854 /usr/bin/pipewire",
  "",
  "● wireplumber.service - Multimedia Service Session Manager",
  "     Loaded: loaded (/usr/lib/systemd/user/wireplumber.service; enabled; preset: enabled)",
  "     Active: active (running) since Tue 2026-10-13 00:06:52 CEST; 2h 37min ago",
  "   Main PID: 1871 (wireplumber)",
  "      Tasks: 6 (limit: 38016)",
  "     Memory: 22.1M (peak: 25.3M)",
  "        CPU: 7.482s",
  "",
  "roy-b@Cachy-Desktop ~ $ wpctl status",
  "PipeWire 'pipewire-0' [1.4.8, roy-b@Cachy-Desktop, cookie:93827416]",
  " ├─ Clients: 32. WirePlumber [1.4.8, roy-b@Cachy-Desktop, pid:1871] 48. konsole [1.4.8, pid:3298]",
  " ├─ Audio: Devices: 45. GA106 High Definition Audio Controller 46. Starship/Matisse HD Audio Controller",
  " │  ├─ Sinks: 57. NVIDIA HDMI / DisplayPort 3 Output [vol: 0.70] 62. Family 17h/19h HD Audio Controller Analog Stereo",
  " │  └─ Streams: 83. firefox 91. pipewire-pulse 97. music-preview",
  "",
  "roy-b@Cachy-Desktop ~ $ lsblk -o NAME,SIZE,FSTYPE,FSVER,LABEL,MOUNTPOINTS,MODEL --paths",
  "NAME                              SIZE FSTYPE FSVER LABEL       MOUNTPOINTS                        MODEL",
  "/dev/nvme0n1                    931.5G                                                            Samsung SSD 970 EVO Plus 1TB",
  "├─/dev/nvme0n1p1                 1024M vfat   FAT32 EFI         /boot",
  "└─/dev/nvme0n1p2                930.5G btrfs        CachyOS     /  /home  /var/cache  /var/log",
  "/dev/sda                          1.8T ntfs         dati        /mnt/dati                         WDC WD20EZAZ-00GGJB0",
  "/dev/sdb                          1.8T ntfs         windows     /mnt/windows                      WDC WD20EZAZ-00GGJB0",
  "/dev/sdc                        117.2G exfat        E839-9AB4  /run/media/roy-b/E839-9AB4       USB Flash Drive",
  "",
  "roy-b@Cachy-Desktop ~ $ df -hT / /mnt/dati /mnt/windows /run/media/roy-b/E839-9AB4",
  "Filesystem                          Type     Size  Used Avail Use% Mounted on",
  "/dev/nvme0n1p2                     btrfs    932G   30G  902G   3% /",
  "/dev/sda                            fuseblk  1.9T  1.4T  455G  76% /mnt/dati",
  "/dev/sdb                            fuseblk  1.9T  564G  1.3T  30% /mnt/windows",
  "/dev/sdc                            exfat    118G  768K  118G   1% /run/media/roy-b/E839-9AB4",
  "",
  "roy-b@Cachy-Desktop ~ $ ip -br address show enp10s0 && nmcli -f GENERAL,IP4,DHCP4 device show enp10s0",
  "enp10s0          UP             192.168.50.42/24 fe80::a00:27ff:fe4e:66a1/64",
  "GENERAL.DEVICE:                         enp10s0",
  "GENERAL.TYPE:                           ethernet",
  "GENERAL.HWADDR:                         00:1A:2B:3C:4D:5E",
  "GENERAL.MTU:                            1500",
  "GENERAL.STATE:                          100 (connected)",
  "GENERAL.CONNECTION:                     Wired connection 1",
  "IP4.ADDRESS[1]:                         192.168.50.42/24",
  "IP4.GATEWAY:                            192.168.50.1",
  "IP4.ROUTE[1]:                           dst = 0.0.0.0/0, nh = 192.168.50.1, mt = 100",
  "DHCP4.OPTION[1]:                        domain_name_servers = 192.168.50.1",
  "",
  "roy-b@Cachy-Desktop ~ $ sensors | grep -E 'Tctl|Tdie|Package id 0|edge|fan1' | head -n 8",
  "Tctl:         +52.5°C  (high = +95.0°C, hyst = +90.0°C)",
  "Tdie:         +47.8°C  (high = +95.0°C, hyst = +90.0°C)",
  "edge:         +46.0°C  (crit = +110.0°C, hyst = +100.0°C)",
  "fan1:         1028 RPM  (min = 0 RPM, max = 3200 RPM)",
  "",
  "roy-b@Cachy-Desktop ~ $ ps -eo pid,user,comm,%cpu,%mem,rss,vsz --sort=-%cpu | head -n 12",
  "    PID USER     COMMAND         %CPU %MEM    RSS     VSZ",
  "   3298 roy-b    konsole          5.2  0.4  131240 1048864",
  "   1871 roy-b    wireplumber      2.8  0.1   24580  431216",
  "   1854 roy-b    pipewire         2.1  0.1   17432  373104",
  "   2430 roy-b    kwin_wayland     1.7  1.3  425612 3489916",
  "   3851 roy-b    firefox          1.4  4.8 1564148 8295132",
  "   2764 roy-b    plasmashell      0.9  1.0  321764 2471096",
  "   2673 roy-b    Xwayland         0.4  0.2   67424 1132020",
  "   2514 roy-b    kded6            0.2  0.1   30316  493828",
  "   2728 roy-b    polkit-kde-auth  0.1  0.1   18504  426136",
  "",
  "roy-b@Cachy-Desktop ~ $ nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw --format=csv",
  "name, driver_version, temperature.gpu, utilization.gpu [%], memory.used [MiB], memory.total [MiB], power.draw [W]",
  "NVIDIA GeForce RTX 3060 Lite Hash Rate, 575.64.03, 46, 8 %, 812 MiB, 12288 MiB, 62.41 W",
  "",
  "roy-b@Cachy-Desktop ~ $ pactl list sinks short && pactl get-sink-volume @DEFAULT_SINK@",
  "57  alsa_output.pci-0000_0a_00.1.hdmi-stereo-extra3  PipeWire  float32le 2ch 48000Hz  RUNNING",
  "Volume: front-left: 45875 / 70% / -8.91 dB, front-right: 45875 / 70% / -8.91 dB",
  "        balance 0.00",
  "",
  "roy-b@Cachy-Desktop ~ $ pw-top --format table",
  "S   ID  QUANT  RATE   WAIT    BUSY   W/Q   B/Q  ERR  FORMAT                   NAME",
  "*   57   1024  48000   0.03    0.07  0.00  0.00    0  F32LE 2 48000           NVIDIA HDMI / DisplayPort 3 Output",
  "    83   1024  48000   0.02    0.03  0.00  0.00    0  F32LE 2 48000           Firefox audio stream",
  "    97   1024  48000   0.01    0.02  0.00  0.00    0  F32LE 2 48000           music-preview audio stream",
  "",
  "roy-b@Cachy-Desktop ~ $ journalctl --user -b -u pipewire --no-pager | tail -n 6",
  "oct 13 00:06:51 Cachy-Desktop systemd[1684]: Started PipeWire Multimedia Service.",
  "oct 13 00:06:51 Cachy-Desktop pipewire[1854]: mod.rt: RTKit found, using realtime scheduling.",
  "oct 13 00:06:52 Cachy-Desktop wireplumber[1871]: configured default audio sink 57 for HDMI / DisplayPort output.",
  "oct 13 02:41:18 Cachy-Desktop pipewire[1854]: client 97 connected: music-preview",
  "",
  "roy-b@Cachy-Desktop ~ $"
];

function renderTerminalLine(line) {
  const safeLine = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (safeLine.includes("roy-b@Cachy-Desktop")) {
    return `<span class="prompt">${safeLine}</span>`;
  }

  if (safeLine.includes("Active: active")) {
    return `<span class="success">${safeLine}</span>`;
  }

  return safeLine;
}

function createTerminalSequence() {
  const fragment = document.createDocumentFragment();

  terminalLines.forEach((line) => {
    const row = document.createElement("div");
    row.className = "terminal-row";
    row.innerHTML = renderTerminalLine(line);
    fragment.appendChild(row);
  });

  return fragment;
}

function buildInfiniteTerminal() {
  if (!terminalHost) {
    return;
  }

  const track = document.createElement("div");
  track.className = "terminal-track";
  track.style.animation = "none";

  const firstBlock = document.createElement("div");
  firstBlock.className = "terminal-block";
  firstBlock.appendChild(createTerminalSequence());

  terminalHost.replaceChildren(track);
  track.appendChild(firstBlock);

  const minimumHeight = window.innerHeight + 200;

  while (firstBlock.getBoundingClientRect().height < minimumHeight) {
    firstBlock.appendChild(createTerminalSequence());
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

if (terminalHost) {
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

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const glitchCharacters = ["#", "%", "@", "▓", "/", "?", "+", "×"];

function scrambleTerminalText(text) {
  const characters = [...text];

  if (characters.length < 5) {
    return text;
  }

  const changes = Math.max(1, Math.floor(characters.length * 0.08));

  for (let index = 0; index < changes; index += 1) {
    const position = Math.floor(Math.random() * characters.length);

    if (characters[position] !== " ") {
      characters[position] =
        glitchCharacters[
          Math.floor(Math.random() * glitchCharacters.length)
        ];
    }
  }

  return characters.join("");
}

function triggerTerminalGlitch() {
  if (prefersReducedMotion.matches || !terminalHost) {
    return;
  }

  const rows = [...terminalHost.querySelectorAll(".terminal-row")].filter(
    (row) => row.textContent.trim().length > 8
  );

  if (!rows.length) {
    scheduleTerminalGlitch();
    return;
  }

  const rowCount = Math.min(
    rows.length,
    Math.floor(Math.random() * 4) + 2
  );

  const selectedRows = [...rows]
    .sort(() => Math.random() - 0.5)
    .slice(0, rowCount);

  selectedRows.forEach((row) => {
    const originalMarkup = row.innerHTML;
    const originalText = row.textContent;

    row.dataset.glitchOriginal = originalMarkup;
    row.classList.add("is-glitching");

    if (Math.random() > 0.35) {
      row.textContent = scrambleTerminalText(originalText);
    }

    window.setTimeout(() => {
      row.innerHTML = row.dataset.glitchOriginal || originalMarkup;
      delete row.dataset.glitchOriginal;
      row.classList.remove("is-glitching");
    }, 180 + Math.random() * 360);
  });

  scheduleTerminalGlitch();
}

function scheduleTerminalGlitch() {
  if (prefersReducedMotion.matches) {
    return;
  }

  const delay = 7000 + Math.random() * 9000;
  window.setTimeout(triggerTerminalGlitch, delay);
}

if (!prefersReducedMotion.matches) {
  scheduleTerminalGlitch();
}

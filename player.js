let releases = [];
let playlist = [];
let currentIndex = -1;

const audio = document.getElementById("audio");
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

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function loadReleases() {
  fetch("releases.json")
    .then(res => res.json())
    .then(data => {
      releases = data;
      renderReleases();
    });
}

function renderReleases() {
  releaseGrid.innerHTML = "";

  releases.forEach(release => {
    const card = document.createElement("article");
    card.className = "release";

    const cover = document.createElement("div");
    cover.className = "cover";
    if (release.cover) {
      const img = document.createElement("img");
      img.src = release.cover;
      img.alt = release.title;
      cover.appendChild(img);
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
    meta.textContent = `${release.year} · ${release.genre || "instrumental"}`;

    info.append(title, meta);

    release.tracks.forEach(track => {
      const button = document.createElement("button");
      button.className = "track";
      button.innerHTML = `
        <span class="track-name">${track.title}</span>
        <span class="track-duration">▶</span>
      `;

      button.addEventListener("click", () => {
        playlist = release.tracks.map(t => ({ ...t, release, cover: release.cover }));
        const index = release.tracks.findIndex(t => t.file === track.file);
        playTrack(index);
      });

      info.appendChild(button);
    });

    card.append(cover, info);
    releaseGrid.appendChild(card);
  });
}

function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const track = playlist[index];

  audio.src = track.file;
  audio.play();

  playerTrack.textContent = track.title;
  playerRelease.textContent = track.release.title;
  playerCover.src = track.cover || "";

  document.querySelectorAll(".track").forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });
}

playBtn.addEventListener("click", () => {
  if (currentIndex === -1 && playlist.length) {
    playTrack(0);
    return;
  }
  audio.paused ? audio.play() : audio.pause();
});

prevBtn.addEventListener("click", () => playTrack(currentIndex - 1));
nextBtn.addEventListener("click", () => playTrack(currentIndex + 1));

audio.addEventListener("play", () => playBtn.textContent = "⏸");
audio.addEventListener("pause", () => playBtn.textContent = "▶");

audio.addEventListener("timeupdate", () => {
  seek.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => playTrack(currentIndex + 1));

seek.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (seek.value / 100) * audio.duration;
  }
});

volume.addEventListener("input", () => {
  audio.volume = volume.value;
});

document.getElementById("year").textContent = new Date().getFullYear();
loadReleases();

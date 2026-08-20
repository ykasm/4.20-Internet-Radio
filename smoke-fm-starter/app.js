const PLAYLIST_ID = "PLMwCOELsaIao";

const stations = {
  smoke: { label: "SMOKE", description: "laid back / hazy" },
  afterhours: { label: "AFTER HOURS", description: "slow / nocturnal" },
  cypher: { label: "CYPHER", description: "bars / heavy drums" },
  purple: { label: "PURPLE", description: "slow / chopped" },
  westcoast: { label: "WEST COAST", description: "sunset / lowrider" }
};

let station = "smoke";
let player = null;
let playerReady = false;
let wantToPlay = false;
let muted = false;
let progressTimer = null;

const $ = (id) => document.getElementById(id);
const format = (seconds) => {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function setPlayButton(isPlaying) {
  $("playBtn").textContent = isPlaying ? "Ⅱ" : "▶";
  $("visualizer").classList.toggle("playing", isPlaying);
}

function updateSignal(text) {
  $("signalText").textContent = text;
}

function updateTrackInfo() {
  if (!playerReady || !player) return;
  const data = player.getVideoData ? player.getVideoData() : {};
  const title = data.title || "SMOKE FM — 4.20 INTERNET RADIO";
  const videoId = data.video_id || "";

  $("stationLabel").textContent = stations[station].label;
  $("trackTitle").textContent = title;
  $("trackArtist").textContent = "4.20 INTERNET RADIO — YOUTUBE";
  document.title = `${title} — SMOKE FM`;

  if (videoId) {
    $("albumArt").style.backgroundImage =
      `linear-gradient(135deg, rgba(5,7,5,.18), rgba(5,7,5,.68)), url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`;
    $("albumArt").style.backgroundSize = "cover";
    $("albumArt").style.backgroundPosition = "center";
  }
}

function updateProgress() {
  if (!playerReady || !player) return;
  const duration = player.getDuration ? player.getDuration() : 0;
  const current = player.getCurrentTime ? player.getCurrentTime() : 0;
  const percent = duration ? Math.min(100, (current / duration) * 100) : 0;
  $("progressFill").style.width = `${percent}%`;
  $("currentTime").textContent = format(current);
  $("duration").textContent = format(duration);
}

function startProgress() {
  clearInterval(progressTimer);
  progressTimer = setInterval(updateProgress, 500);
}

function stopProgress() {
  clearInterval(progressTimer);
  progressTimer = null;
}

function togglePlayback() {
  if (!playerReady) {
    wantToPlay = true;
    updateSignal("LOADING");
    return;
  }

  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    wantToPlay = true;
    player.playVideo();
  }
}

function nextTrack() {
  if (!playerReady) return;
  player.nextVideo();
}

function previousTrack() {
  if (!playerReady) return;
  player.previousVideo();
}

function shuffleTracks() {
  if (!playerReady) return;
  const playlist = player.getPlaylist() || [];
  player.setShuffle(true);
  if (playlist.length > 1) {
    player.playVideoAt(Math.floor(Math.random() * playlist.length));
  }
}

function setStation(nextStation) {
  station = nextStation;
  document.querySelectorAll(".station").forEach((button) => {
    button.classList.toggle("active", button.dataset.station === station);
  });
  $("stationLabel").textContent = stations[station].label;
  updateSignal("GOOD");
}

function sendChat() {
  const input = $("chatInput");
  if (!input.value.trim()) return;
  const p = document.createElement("p");
  p.innerHTML = `<b>you:</b> ${input.value.replace(/[<>]/g, "")}`;
  $("chatMessages").appendChild(p);
  input.value = "";
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

function clock() {
  const d = new Date();
  $("clock").textContent = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function onPlayerReady() {
  playerReady = true;
  updateSignal("READY");
  player.setVolume(Number($("volume").value));

  player.loadPlaylist({
    listType: "playlist",
    list: PLAYLIST_ID,
    index: 0
  });

  setTimeout(() => {
    updateTrackInfo();
    updateProgress();
    if (wantToPlay) player.playVideo();
  }, 900);
}

function onPlayerStateChange(event) {
  const state = event.data;

  if (state === YT.PlayerState.PLAYING) {
    wantToPlay = true;
    setPlayButton(true);
    updateSignal("GOOD");
    updateTrackInfo();
    startProgress();
  } else if (state === YT.PlayerState.PAUSED) {
    setPlayButton(false);
    stopProgress();
    updateProgress();
  } else if (state === YT.PlayerState.ENDED) {
    setPlayButton(false);
    stopProgress();
    updateProgress();
    setTimeout(updateTrackInfo, 300);
  } else if (state === YT.PlayerState.BUFFERING) {
    updateSignal("BUFFERING");
  } else if (state === YT.PlayerState.CUED) {
    updateTrackInfo();
    updateProgress();
    updateSignal("READY");
  }
}

function onAutoplayBlocked() {
  updateSignal("CLICK PLAY");
  setPlayButton(false);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("youtube-player", {
    width: "320",
    height: "180",
    playerVars: {
      listType: "playlist",
      list: PLAYLIST_ID,
      controls: 1,
      playsinline: 1,
      rel: 0,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onAutoplayBlocked
    }
  });
};

// Keep the official YouTube player in a dedicated corner.
// It remains part of the page rather than downloading or extracting audio.
const youtubeHost = document.createElement("div");
youtubeHost.id = "youtube-player";
youtubeHost.setAttribute("aria-label", "YouTube playback");
youtubeHost.style.position = "fixed";
youtubeHost.style.width = "320px";
youtubeHost.style.height = "180px";
youtubeHost.style.right = "12px";
youtubeHost.style.bottom = "12px";
youtubeHost.style.zIndex = "1";
youtubeHost.style.opacity = "0.015";
youtubeHost.style.pointerEvents = "none";
youtubeHost.style.overflow = "hidden";
document.body.appendChild(youtubeHost);

const youtubeScript = document.createElement("script");
youtubeScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(youtubeScript);

$("playBtn").onclick = togglePlayback;
$("nextBtn").onclick = nextTrack;
$("prevBtn").onclick = previousTrack;
$("shuffleBtn").onclick = shuffleTracks;

$("muteBtn").onclick = () => {
  if (!playerReady) return;
  muted = !muted;
  if (muted) player.mute();
  else player.unMute();
  $("muteBtn").textContent = muted ? "×" : "♫";
};

$("volume").oninput = (event) => {
  const value = Number(event.target.value);
  if (!playerReady) return;

  if (value === 0) {
    muted = true;
    player.mute();
    $("muteBtn").textContent = "×";
  } else {
    muted = false;
    player.unMute();
    player.setVolume(value);
    $("muteBtn").textContent = "♫";
  }
};

document.querySelectorAll(".station").forEach((button) => {
  button.onclick = () => setStation(button.dataset.station);
});

$("chatSend").onclick = sendChat;
$("chatInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendChat();
});

$("progressFill").parentElement.onclick = (event) => {
  if (!playerReady) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  player.seekTo(player.getDuration() * ratio, true);
};

setInterval(clock, 1000);
clock();

setInterval(() => {
  $("listeners").textContent = 410 + Math.floor(Math.random() * 48);
}, 5000);

setTimeout(() => $("boot").classList.add("hide"), 1900);

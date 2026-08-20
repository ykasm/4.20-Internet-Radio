const PLAYLIST_ID = "PLMwCOELsaIao";
let player = null;
let playerReady = false;
let pendingPlay = false;
let muted = false;
let progressTimer = null;
let currentTitle = "";

const $ = (id) => document.getElementById(id);
const format = (n) => {
  n = Math.max(0, Math.floor(Number(n) || 0));
  return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;
};

function signal(t){ $("signalText").textContent = t; }
function button(playing){
  $("playBtn").textContent = playing ? "Ⅱ" : "▶";
  $("visualizer").classList.toggle("playing", playing);
}

function updateTrack(){
  if(!playerReady) return;
  const d = player.getVideoData ? player.getVideoData() : {};
  const title = d.title || "4.20 INTERNET RADIO";
  if(title === currentTitle) return;
  currentTitle = title;
  $("stationLabel").textContent = "4.20 INTERNET RADIO";
  $("trackTitle").textContent = title;
  $("trackArtist").textContent = "YOUTUBE RADIO";
  document.title = `${title} — SMOKE FM`;
  if(d.video_id){
    $("albumArt").style.backgroundImage =
      `linear-gradient(rgba(4,7,4,.18),rgba(4,7,4,.5)),url("https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg")`;
    $("albumArt").style.backgroundSize="cover";
    $("albumArt").style.backgroundPosition="center";
  }
}

function progress(){
  if(!playerReady) return;
  const dur=player.getDuration(), cur=player.getCurrentTime();
  $("progressFill").style.width = dur ? `${cur/dur*100}%` : "0%";
  $("currentTime").textContent=format(cur);
  $("duration").textContent=format(dur);
}

function startProgress(){
  clearInterval(progressTimer);
  progressTimer=setInterval(progress,500);
}

function stopProgress(){
  clearInterval(progressTimer);
  progressTimer=null;
}

function play(){
  if(!playerReady){
    pendingPlay=true;
    signal("LOADING");
    return;
  }
  pendingPlay=true;
  player.playVideo();
}

function pause(){
  if(playerReady) player.pauseVideo();
}

function next(){
  if(playerReady) player.nextVideo();
}

function previous(){
  if(playerReady) player.previousVideo();
}

function shuffle(){
  if(!playerReady) return;
  player.setShuffle(true);
  const list=player.getPlaylist() || [];
  if(list.length) player.playVideoAt(Math.floor(Math.random()*list.length));
}

function onReady(){
  playerReady=true;
  signal("READY");
  player.setVolume(Number($("volume").value));
  player.cuePlaylist({listType:"playlist",list:PLAYLIST_ID,index:0});
  setTimeout(()=>{
    updateTrack();
    progress();
    if(pendingPlay) player.playVideo();
  },700);
}

function onState(e){
  switch(e.data){
    case YT.PlayerState.PLAYING:
      button(true); signal("PLAYING"); updateTrack(); startProgress(); break;
    case YT.PlayerState.PAUSED:
      button(false); signal("PAUSED"); stopProgress(); progress(); break;
    case YT.PlayerState.BUFFERING:
      signal("BUFFERING"); break;
    case YT.PlayerState.CUED:
      button(false); signal("READY"); updateTrack(); progress(); break;
    case YT.PlayerState.ENDED:
      button(false); stopProgress(); setTimeout(updateTrack,300); break;
  }
}

function onError(e){
  console.warn("YouTube player error",e.data);
  signal(`YT ERROR ${e.data}`);
}

window.onYouTubeIframeAPIReady=()=>{
  player=new YT.Player("youtube-player",{
    width:"360",
    height:"203",
    playerVars:{
      autoplay:0,
      controls:1,
      playsinline:1,
      rel:0,
      listType:"playlist",
      list:PLAYLIST_ID,
      origin:location.origin
    },
    events:{
      onReady,
      onStateChange:onState,
      onError
    }
  });
};

const host=document.createElement("div");
host.id="youtube-player";
host.style.position="fixed";
host.style.right="14px";
host.style.bottom="14px";
host.style.width="360px";
host.style.height="203px";
host.style.zIndex="100";
host.style.background="#000";
host.style.border="1px solid #536643";
host.style.boxShadow="0 8px 30px #000";
document.body.appendChild(host);

const script=document.createElement("script");
script.src="https://www.youtube.com/iframe_api";
document.head.appendChild(script);

$("playBtn").onclick=()=>{
  if(playerReady){
    const state=player.getPlayerState();
    if(state===YT.PlayerState.PLAYING) pause();
    else play();
  } else {
    pendingPlay=true;
    signal("LOADING");
  }
};
$("nextBtn").onclick=next;
$("prevBtn").onclick=previous;
$("shuffleBtn").onclick=shuffle;

$("muteBtn").onclick=()=>{
  if(!playerReady)return;
  muted=!muted;
  muted?player.mute():player.unMute();
  $("muteBtn").textContent=muted?"×":"♫";
};

$("volume").oninput=e=>{
  if(!playerReady)return;
  const v=Number(e.target.value);
  if(v===0){player.mute();muted=true;$("muteBtn").textContent="×";}
  else {player.unMute();player.setVolume(v);muted=false;$("muteBtn").textContent="♫";}
};

$("progressFill").parentElement.onclick=e=>{
  if(!playerReady)return;
  const r=e.currentTarget.getBoundingClientRect();
  const ratio=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  player.seekTo(player.getDuration()*ratio,true);
};

document.querySelectorAll(".station").forEach(b=>{
  b.onclick=()=>document.querySelectorAll(".station").forEach(x=>x.classList.toggle("active",x===b));
});

$("chatSend").onclick=()=>{
  const i=$("chatInput");
  if(!i.value.trim())return;
  const p=document.createElement("p");
  p.innerHTML=`<b>you:</b> ${i.value.replace(/[<>]/g,"")}`;
  $("chatMessages").appendChild(p); i.value="";
};

$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("chatSend").click()});
function clock(){ $("clock").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}); }
setInterval(clock,1000); clock();
setInterval(()=>$("listeners").textContent=410+Math.floor(Math.random()*48),5000);
setTimeout(()=>$("boot").classList.add("hide"),1900);

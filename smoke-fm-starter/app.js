const PLAYLIST_ID="PLMwCOELsaIao";
let player=null,ready=false,pending=false,muted=false,timer=null,station="SMOKE";

const $=id=>document.getElementById(id);
const fmt=n=>{n=Math.max(0,Math.floor(Number(n)||0));return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`};

function signal(s){$("signalText").textContent=s}
function setPlaying(v){$("playBtn").textContent=v?"Ⅱ":"▶";$("visualizer").classList.toggle("playing",v)}
function updateTrack(){
 if(!ready)return;
 const d=player.getVideoData?player.getVideoData():{};
 const title=d.title||"4.20 INTERNET RADIO";
 $("trackTitle").textContent=title;
 $("sideTrack").textContent=title;
 $("trackArtist").textContent="4.20 INTERNET RADIO — YOUTUBE";
 $("sideArtist").textContent="LIVE FROM YOUTUBE";
 $("stationLabel").textContent=station;
 $("infoStation").textContent=station;
 document.title=`${title} — SMOKE FM`;
 if(d.video_id){
  $("albumArt").style.backgroundImage=`linear-gradient(rgba(4,7,4,.1),rgba(4,7,4,.48)),url("https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg")`;
  $("albumArt").style.backgroundSize="cover";
  $("albumArt").style.backgroundPosition="center";
 }
}
function updateProgress(){
 if(!ready)return;
 const d=player.getDuration(),c=player.getCurrentTime(),pct=d?Math.min(100,c/d*100):0;
 $("progressFill").style.width=pct+"%";
 $("progressHit").querySelector("b").style.left=pct+"%";
 $("currentTime").textContent=fmt(c);
 $("duration").textContent=fmt(d);
}
function startTimer(){clearInterval(timer);timer=setInterval(updateProgress,500)}
function stopTimer(){clearInterval(timer);timer=null}
function toggle(){
 if(!ready){pending=true;signal("LOADING");return}
 const state=player.getPlayerState();
 if(state===YT.PlayerState.PLAYING)player.pauseVideo();
 else{pending=true;player.playVideo()}
}
function next(){if(ready)player.nextVideo()}
function prev(){if(ready)player.previousVideo()}
function shuffle(){
 if(!ready)return;
 player.setShuffle(true);
 const list=player.getPlaylist()||[];
 if(list.length>1)player.playVideoAt(Math.floor(Math.random()*list.length));
}
function setStation(name){
 station=name;
 document.querySelectorAll(".station").forEach(b=>b.classList.toggle("active",b.dataset.station.toUpperCase()===name));
 $("stationLabel").textContent=name;
 $("infoStation").textContent=name;
}
window.onYouTubeIframeAPIReady=()=>{
 player=new YT.Player("youtube-player",{
  width:"280",height:"158",
  playerVars:{autoplay:0,controls:0,playsinline:1,rel:0,listType:"playlist",list:PLAYLIST_ID,origin:location.origin},
  events:{
   onReady:()=>{
    ready=true;signal("READY");player.setVolume(Number($("volume").value));
    player.cuePlaylist({listType:"playlist",list:PLAYLIST_ID,index:0});
    setTimeout(()=>{updateTrack();updateProgress();if(pending)player.playVideo()},700);
   },
   onStateChange:e=>{
    if(e.data===YT.PlayerState.PLAYING){setPlaying(true);signal("PLAYING");updateTrack();startTimer()}
    else if(e.data===YT.PlayerState.PAUSED){setPlaying(false);signal("PAUSED");stopTimer();updateProgress()}
    else if(e.data===YT.PlayerState.BUFFERING){signal("BUFFERING")}
    else if(e.data===YT.PlayerState.CUED){setPlaying(false);signal("READY");updateTrack();updateProgress()}
    else if(e.data===YT.PlayerState.ENDED){setPlaying(false);stopTimer();setTimeout(()=>player.nextVideo(),250)}
   },
   onError:e=>{console.warn("YouTube error",e.data);signal("YT ERROR "+e.data)}
  }
 });
};
const source=document.createElement("div");
source.className="youtube-source";
source.innerHTML='<div id="youtube-player"></div>';
document.body.appendChild(source);
const yt=document.createElement("script");
yt.src="https://www.youtube.com/iframe_api";
document.head.appendChild(yt);

$("playBtn").onclick=toggle;
$("nextBtn").onclick=next;
$("prevBtn").onclick=prev;
$("shuffleBtn").onclick=shuffle;
$("muteBtn").onclick=()=>{
 if(!ready)return;
 muted=!muted;
 muted?player.mute():player.unMute();
 $("muteBtn").textContent=muted?"×":"♫";
};
$("volume").oninput=e=>{
 if(!ready)return;
 const v=Number(e.target.value);
 if(v===0){player.mute();muted=true;$("muteBtn").textContent="×"}
 else{player.unMute();player.setVolume(v);muted=false;$("muteBtn").textContent="♫"}
};
$("progressHit").onclick=e=>{
 if(!ready)return;
 const r=e.currentTarget.getBoundingClientRect();
 const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
 player.seekTo(player.getDuration()*x,true);
};
document.querySelectorAll(".station").forEach(b=>b.onclick=()=>setStation(b.dataset.station.toUpperCase()));
function clock(){$("clock").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}
setInterval(clock,1000);clock();
setInterval(()=>$("listeners").textContent=410+Math.floor(Math.random()*48),5000);
setTimeout(()=>$("boot").classList.add("hide"),1900);

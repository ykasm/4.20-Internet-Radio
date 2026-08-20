const PLAYLIST_ID="PLMwCOELsaIao";
let player=null,ready=false,pending=false,muted=false,timer=null,station="SMOKE",title="";

const $=id=>document.getElementById(id);
const fmt=n=>{n=Math.max(0,Math.floor(Number(n)||0));return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`};

function signal(s){$("signalText").textContent=s}
function playing(v){$("playBtn").textContent=v?"Ⅱ":"▶";$("visualizer").classList.toggle("playing",v)}
function updateInfo(){
 if(!ready)return;
 const d=player.getVideoData?player.getVideoData():{};
 const t=d.title||"4.20 INTERNET RADIO";
 title=t;$("trackTitle").textContent=t;$("trackArtist").textContent="4.20 INTERNET RADIO — YOUTUBE";
 $("stationLabel").textContent=station;$("infoStation").textContent=station;document.title=`${t} — SMOKE FM`;
 if(d.video_id){
   $("albumArt").style.backgroundImage=`linear-gradient(rgba(4,7,4,.12),rgba(4,7,4,.5)),url("https://i.ytimg.com/vi/${d.video_id}/hqdefault.jpg")`;
   $("albumArt").style.backgroundSize="cover";$("albumArt").style.backgroundPosition="center";
 }
}
function updateProgress(){
 if(!ready)return;
 const d=player.getDuration(),c=player.getCurrentTime();
 const pct=d?Math.min(100,c/d*100):0;
 $("progressFill").style.width=pct+"%";$("progressHit").querySelector("b").style.left=pct+"%";
 $("currentTime").textContent=fmt(c);$("duration").textContent=fmt(d);
}
function start(){clearInterval(timer);timer=setInterval(updateProgress,500)}
function stop(){clearInterval(timer);timer=null}

function startPlayback(){
 if(!ready){pending=true;signal("LOADING");return}
 pending=true;player.playVideo();
}
function toggle(){
 if(!ready){pending=true;signal("LOADING");return}
 const s=player.getPlayerState();
 if(s===YT.PlayerState.PLAYING)player.pauseVideo();else startPlayback();
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
 document.querySelectorAll(".station").forEach(b=>b.classList.toggle("active",b.dataset.station===name.toLowerCase()));
 $("stationLabel").textContent=name;$("infoStation").textContent=name;
}

window.onYouTubeIframeAPIReady=()=>{
 player=new YT.Player("youtube-player",{
   width:"280",height:"158",
   playerVars:{autoplay:0,controls:1,playsinline:1,rel:0,listType:"playlist",list:PLAYLIST_ID,origin:location.origin},
   events:{
     onReady:()=>{
       ready=true;signal("READY");player.setVolume(Number($("volume").value));
       player.cuePlaylist({listType:"playlist",list:PLAYLIST_ID,index:0});
       setTimeout(()=>{updateInfo();updateProgress();if(pending)player.playVideo()},800);
     },
     onStateChange:e=>{
       if(e.data===YT.PlayerState.PLAYING){playing(true);signal("PLAYING");updateInfo();start()}
       else if(e.data===YT.PlayerState.PAUSED){playing(false);signal("PAUSED");stop();updateProgress()}
       else if(e.data===YT.PlayerState.BUFFERING){signal("BUFFERING")}
       else if(e.data===YT.PlayerState.CUED){playing(false);signal("READY");updateInfo();updateProgress()}
       else if(e.data===YT.PlayerState.ENDED){playing(false);stop();setTimeout(()=>{updateInfo();player.nextVideo()},350)}
     },
     onError:e=>{console.warn("YouTube error",e.data);signal("YT ERROR "+e.data)}
   }
 });
};

// YouTube remains an actual player on the page, but is reduced to a small source dock.
// This keeps the playback source legitimate and gives a visible fallback if a browser blocks custom controls.
const dock=document.createElement("div");
dock.className="youtube-dock";
dock.innerHTML='<div class="dock-label">YT SOURCE <button id="dockClose">×</button></div><div id="youtube-player"></div>';
document.body.appendChild(dock);
const yt=document.createElement("script");yt.src="https://www.youtube.com/iframe_api";document.head.appendChild(yt);

$("playBtn").onclick=toggle;
$("nextBtn").onclick=next;
$("prevBtn").onclick=prev;
$("shuffleBtn").onclick=shuffle;
$("muteBtn").onclick=()=>{
 if(!ready)return;muted=!muted;muted?player.mute():player.unMute();$("muteBtn").textContent=muted?"×":"♫";
};
$("volume").oninput=e=>{
 if(!ready)return;const v=Number(e.target.value);
 if(v===0){player.mute();muted=true;$("muteBtn").textContent="×"}
 else{player.unMute();player.setVolume(v);muted=false;$("muteBtn").textContent="♫"}
};
$("progressHit").onclick=e=>{
 if(!ready)return;
 const r=e.currentTarget.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
 player.seekTo(player.getDuration()*x,true);
};
document.querySelectorAll(".station").forEach(b=>b.onclick=()=>setStation(b.dataset.station.toUpperCase()));
$("chatSend").onclick=()=>{
 const i=$("chatInput");if(!i.value.trim())return;
 const p=document.createElement("p");p.innerHTML=`<b>you:</b> ${i.value.replace(/[<>]/g,"")}`;
 $("chatMessages").appendChild(p);i.value="";$("chatMessages").scrollTop=$("chatMessages").scrollHeight;
};
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("chatSend").click()});
$("dockClose").onclick=()=>{dock.classList.toggle("closed")};

function clock(){$("clock").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}
setInterval(clock,1000);clock();
setInterval(()=>$("listeners").textContent=410+Math.floor(Math.random()*48),5000);
setTimeout(()=>$("boot").classList.add("hide"),1900);

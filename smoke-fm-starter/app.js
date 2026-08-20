const stations={
 smoke:{label:"SMOKE",title:"Midnight Drive",artist:"SMOKE FM ORIGINAL — PLACEHOLDER STREAM",duration:168},
 afterhours:{label:"AFTER HOURS",title:"2:17 AM",artist:"SMOKE FM ORIGINAL — PLACEHOLDER STREAM",duration:192},
 cypher:{label:"CYPHER",title:"Back Alley Session",artist:"SMOKE FM ORIGINAL — PLACEHOLDER STREAM",duration:151},
 purple:{label:"PURPLE",title:"Slow Motion",artist:"SMOKE FM ORIGINAL — PLACEHOLDER STREAM",duration:224},
 westcoast:{label:"WEST COAST",title:"Sunset Boulevard",artist:"SMOKE FM ORIGINAL — PLACEHOLDER STREAM",duration:181}
};
let station="smoke", playing=false, elapsed=0, timer=null, muted=false;
const $=id=>document.getElementById(id);
const format=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`;
function render(){const x=stations[station];$("stationLabel").textContent=x.label;$("trackTitle").textContent=x.title;$("trackArtist").textContent=x.artist;$("duration").textContent=format(x.duration);$("currentTime").textContent=format(elapsed);$("progressFill").style.width=`${Math.min(100,elapsed/x.duration*100)}%`;document.title=`${x.title} — SMOKE FM`;}
function toggle(){playing=!playing;$("playBtn").textContent=playing?"Ⅱ":"▶";$("visualizer").classList.toggle("playing",playing);if(playing&&!timer)timer=setInterval(()=>{elapsed++;if(elapsed>=stations[station].duration){elapsed=0;next()}render()},1000);if(!playing){clearInterval(timer);timer=null}render();}
function next(){const keys=Object.keys(stations),i=keys.indexOf(station);station=keys[(i+1)%keys.length];elapsed=0;document.querySelectorAll(".station").forEach(b=>b.classList.toggle("active",b.dataset.station===station));render();}
$("playBtn").onclick=toggle;$("nextBtn").onclick=next;$("prevBtn").onclick=()=>{elapsed=0;render()};$("shuffleBtn").onclick=()=>{const keys=Object.keys(stations);station=keys[Math.floor(Math.random()*keys.length)];elapsed=0;document.querySelectorAll(".station").forEach(b=>b.classList.toggle("active",b.dataset.station===station));render()};$("muteBtn").onclick=()=>{muted=!muted;$("muteBtn").textContent=muted?"×":"♫";$("volume").value=muted?0:72};$("volume").oninput=e=>{muted=e.target.value==0;$("muteBtn").textContent=muted?"×":"♫"};document.querySelectorAll(".station").forEach(b=>b.onclick=()=>{station=b.dataset.station;elapsed=0;document.querySelectorAll(".station").forEach(x=>x.classList.toggle("active",x===b));render()});
$("chatSend").onclick=send;$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")send()});function send(){const input=$("chatInput");if(!input.value.trim())return;const p=document.createElement("p");p.innerHTML=`<b>you:</b> ${input.value.replace(/[<>]/g,"")}`;$("chatMessages").appendChild(p);input.value="";$("chatMessages").scrollTop=$("chatMessages").scrollHeight}
function clock(){const d=new Date();$("clock").textContent=d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}setInterval(clock,1000);clock();render();
setInterval(()=>{$("listeners").textContent=410+Math.floor(Math.random()*48)},5000);
setTimeout(()=>$("boot").classList.add("hide"),1900);

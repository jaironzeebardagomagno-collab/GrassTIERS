const KITS=[["DiaSMP","🟢"],["NethPOT","🧪"],["NethSMP","🟣"],["Sword","⚔️"],["Axe","🪓"],["UHC","💠"],["Crystal","💎"],["Mace","🔨"],["SpearMace","🔱"]];
const TIERS=["No Tier","LT5","HT5","LT4","HT4","LT3","HT3","LT2","HT2","LT1","HT1"];
const DEFAULT_CODE="grass-editor";
let data=JSON.parse(localStorage.getItem("grassV2")||'{"players":[],"events":[],"settings":{"title":"Minecraft PvP Rankings","description":"Official GRASS player rankings, kit tiers, Top 20 players, and Champions Events.","code":"grass-editor"}}');
let editId=null,eventEdit=null,logged=localStorage.getItem("grassLogged")==="1";
const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function save(){localStorage.setItem("grassV2",JSON.stringify(data))}
function tierClass(t){return t.toLowerCase().replace(/\s/g,"-")}
function render(){
 $("siteTitle").textContent=data.settings.title;$("siteDescription").textContent=data.settings.description;
 $("tierKey").innerHTML=TIERS.slice(1).reverse().map(t=>`<span class="tier ${tierClass(t)}">${t}</span>`).join("");
 renderPlayers();renderKits();renderTop();renderEvents();updateAdmin();
}
function updateAdmin(){document.querySelectorAll(".admin-only").forEach(x=>x.style.display=logged?"":"none");$("loginBtn").textContent=logged?"🔓 Editor Mode":"🔐 Editor Login";$("addBtn").style.display=logged?"":"none"}
function renderPlayers(){
 $("players").innerHTML=data.players.map((p,i)=>{let img=p.image||"";
 return `<article class="player-card"><div class="player-head"><div class="banner">${img?`<img src="${esc(img)}" onerror="this.style.display='none'">`:""}<div class="rank-number">${i+1}.</div></div><div class="info"><h2>${esc(p.name)}</h2><div class="rank ${p.rank?"":"no-rank"}">${p.rank?"◆ "+esc(p.rank):"No rank added"}</div></div><div class="region ${esc(p.region)}">${esc(p.region)}</div></div><div class="kits-title">TIERS</div><div class="kits">${KITS.map(([k,icon])=>{let t=p.tiers?.[k]||"No Tier";return `<div class="kit"><div class="kit-icon">${icon}</div><div class="kit-name">${k}</div><span class="tier ${t==="No Tier"?"no-tier":tierClass(t)}">${t==="No Tier"?"—":t}</span></div>`}).join("")}</div>${logged?`<div class="card-actions"><button class="small-btn" onclick="editPlayer('${p.id}')">Edit</button> <button class="small-btn danger" onclick="delPlayer('${p.id}')">Delete</button></div>`:""}</article>`}).join("");
 $("emptyState").classList.toggle("hidden",data.players.length>0)
}
function renderKits(){
 $("kitBoards").innerHTML=KITS.map(([k,icon])=>{let arr=data.players.filter(p=>(p.tiers?.[k]||"No Tier")!=="No Tier").sort((a,b)=>TIERS.indexOf(a.tiers[k])-TIERS.indexOf(b.tiers[k])).slice(0,10);
 return `<div class="kit-board"><h3>${icon} ${k}</h3>${arr.length?arr.map((p,i)=>`<div class="kit-row"><b>#${i+1}</b><span>${esc(p.name)}</span><span class="tier ${tierClass(p.tiers[k])}">${p.tiers[k]}</span></div>`).join(""):"<div class='muted'>No ranked players yet.</div>"}</div>`}).join("");
}
function renderTop(){
 $("top20").innerHTML=data.players.slice(0,20).map((p,i)=>`<div class="top-row"><span class="top-rank">${i+1}.</span><span class="top-name">${esc(p.name)}</span><span class="region ${esc(p.region)}">${esc(p.region)}</span></div>`).join("")||"<div class='empty'>No players yet.</div>"
}
function renderEvents(){
 $("events").innerHTML=data.events.map((e,i)=>`<article class="event-card"><div class="event-meta">${esc(e.date||"DATE TBA")}</div><h3>${esc(e.name)}</h3><p>${esc(e.desc)}</p><b>🏆 ${esc(e.winner||"Winner TBA")}</b>${logged?`<div class="card-actions"><button class="small-btn" onclick="editEvent(${i})">Edit</button> <button class="small-btn danger" onclick="delEvent(${i})">Delete</button></div>`:""}</article>`).join("")||"<div class='empty'>No Champions Events yet.</div>"
}
function openPlayer(id=null){if(!logged)return login();editId=id;let p=id?data.players.find(x=>x.id===id):{name:"",region:"NA",rank:"",image:"",tiers:{}};$("playerModalTitle").textContent=id?"Edit Player":"Add Player";$("pName").value=p.name||"";$("pRegion").value=p.region||"NA";$("pRank").value=p.rank||"";$("pImage").value=p.image||"";$("kitInputs").innerHTML=KITS.map(([k])=>`<label class="kit-row"><strong>${k}</strong><select data-kit="${k}">${TIERS.map(t=>`<option ${((p.tiers||{})[k]||"No Tier")===t?"selected":""}>${t}</option>`).join("")}</select></label>`).join("");$("playerModal").classList.remove("hidden")}
function closePlayer(){$("playerModal").classList.add("hidden");editId=null}
function savePlayer(){let name=$("pName").value.trim();if(!name)return alert("Enter a player name.");let tiers={};document.querySelectorAll("[data-kit]").forEach(s=>tiers[s.dataset.kit]=s.value);let p={id:editId||crypto.randomUUID(),name,region:$("pRegion").value,rank:$("pRank").value.trim(),image:$("pImage").value.trim(),tiers};if(editId)data.players=data.players.map(x=>x.id===editId?p:x);else data.players.push(p);save();render();closePlayer()}
function editPlayer(id){openPlayer(id)}function delPlayer(id){if(confirm("Delete this player?")){data.players=data.players.filter(p=>p.id!==id);save();render()}}
function login(){$("loginModal").classList.remove("hidden");$("loginCode").focus()}
function doLogin(){if($("loginCode").value===(data.settings.code||DEFAULT_CODE)){logged=true;localStorage.setItem("grassLogged","1");$("loginModal").classList.add("hidden");render()}else alert("Wrong editor code.")}
function openEvent(i=null){if(!logged)return login();eventEdit=i;$("eventTitle").textContent=i===null?"Add Event":"Edit Event";let e=i===null?{}:data.events[i];$("eName").value=e.name||"";$("eDate").value=e.date||"";$("eWinner").value=e.winner||"";$("eDesc").value=e.desc||"";$("eventModal").classList.remove("hidden")}
function saveEvent(){let e={name:$("eName").value.trim(),date:$("eDate").value.trim(),winner:$("eWinner").value.trim(),desc:$("eDesc").value.trim()};if(!e.name)return alert("Enter an event name.");if(eventEdit===null)data.events.push(e);else data.events[eventEdit]=e;save();render();$("eventModal").classList.add("hidden")}
function editEvent(i){openEvent(i)}function delEvent(i){if(confirm("Delete this event?")){data.events.splice(i,1);save();render()}}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.page).classList.add("active")});
$("addBtn").onclick=()=>openPlayer();$("emptyAdd").onclick=()=>openPlayer();$("closePlayer").onclick=closePlayer;$("cancelPlayer").onclick=closePlayer;$("savePlayer").onclick=savePlayer;
$("loginBtn").onclick=()=>logged?(logged=false,localStorage.removeItem("grassLogged"),render()):login();$("closeLogin").onclick=$("closeLogin2").onclick=()=>$("loginModal").classList.add("hidden");$("doLogin").onclick=doLogin;
$("addEvent").onclick=()=>openEvent();$("closeEvent").onclick=$("cancelEvent").onclick=()=>$("eventModal").classList.add("hidden");$("saveEvent").onclick=saveEvent;
$("saveSettings").onclick=()=>{if(!logged)return login();data.settings.title=$("titleInput").value.trim()||"Minecraft PvP Rankings";data.settings.description=$("descInput").value.trim();if($("codeInput").value.trim())data.settings.code=$("codeInput").value.trim();save();render();alert("Settings saved.")};
$("exportBtn").onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="grass-tier-list.json";a.click()};
$("importBtn").onclick=()=>logged?$("importFile").click():login();$("importFile").onchange=e=>{let r=new FileReader();r.onload=()=>{try{data=JSON.parse(r.result);save();render();alert("Imported!")}catch{alert("Invalid JSON")}};r.readAsText(e.target.files[0])};
$("titleInput").value=data.settings.title;$("descInput").value=data.settings.description;$("codeInput").value="";
render();

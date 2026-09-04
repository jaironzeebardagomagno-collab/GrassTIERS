const KITS = [
  ["DiaSMP","🟢"],["NethPOT","🧪"],["NethSMP","🟣"],["Sword","⚔️"],
  ["Axe","🪓"],["UHC","💠"],["Crystal","💎"],["Mace","🔨"],["SpearMace","🔱"]
];
const TIERS = ["No Tier","LT5","HT5","LT4","HT4","LT3","HT3","LT2","HT2","LT1","HT1"];
const defaultImage = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#465567"/><stop offset="1" stop-color="#17212f"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="56%" fill="#d8e1ed" font-size="32" text-anchor="middle" font-family="Arial" font-weight="700">PLAYER</text></svg>`
);

let players = JSON.parse(localStorage.getItem("grassTierPlayers") || "[]");
let editingId = null;

const $ = id => document.getElementById(id);
const saveData = () => localStorage.setItem("grassTierPlayers", JSON.stringify(players));

function tierClass(tier){ return tier.toLowerCase().replace(/\s/g,"-"); }

function render(){
  const box = $("players");
  box.innerHTML = "";
  $("emptyState").classList.toggle("hidden", players.length !== 0);
  players.forEach((p,i)=>{
    const card = document.createElement("article");
    card.className = "player-card";
    const img = p.image?.trim() || defaultImage;
    card.innerHTML = `
      <div class="player-head">
        <div class="banner">
          <img src="${escapeAttr(img)}" onerror="this.src='${defaultImage}'">
          <div class="rank-number">${i+1}.</div>
        </div>
        <div class="info">
          <h2>${escapeHtml(p.name || "Unnamed Player")}</h2>
          <div class="rank ${p.rank ? "" : "empty-rank"}">${p.rank ? "◆ " + escapeHtml(p.rank) : "No rank added"}</div>
        </div>
        <div class="region ${escapeAttr(p.region)}">${escapeHtml(p.region)}</div>
      </div>
      <div class="kits-title">TIERS</div>
      <div class="kits">
        ${KITS.map(([name,icon])=>{
          const tier=p.tiers[name] || "No Tier";
          return `<div class="kit">
            <div class="kit-icon">${icon}</div>
            <div class="kit-name">${name}</div>
            <span class="tier ${tier==="No Tier"?"no-tier":tierClass(tier)}">${tier==="No Tier"?"—":tier}</span>
          </div>`
        }).join("")}
      </div>
      <div class="card-actions">
        <button class="small-btn" onclick="editPlayer('${p.id}')">Edit</button>
        <button class="small-btn danger" onclick="deletePlayer('${p.id}')">Delete</button>
      </div>`;
    box.appendChild(card);
  });
}

function openModal(id=null){
  editingId=id;
  $("modalTitle").textContent=id?"Edit Player":"Add Player";
  const p=id ? players.find(x=>x.id===id) : {name:"",region:"NA",rank:"",image:"",tiers:{}};
  $("nameInput").value=p.name||"";
  $("regionInput").value=p.region||"NA";
  $("rankInput").value=p.rank||"";
  $("imageInput").value=p.image||"";
  $("kitInputs").innerHTML=KITS.map(([name])=>`
    <label class="kit-row">
      <strong>${name}</strong>
      <select data-kit="${name}">
        ${TIERS.map(t=>`<option ${((p.tiers||{})[name]||"No Tier")===t?"selected":""}>${t}</option>`).join("")}
      </select>
    </label>`).join("");
  $("modal").classList.remove("hidden");
  $("nameInput").focus();
}
function closeModal(){ $("modal").classList.add("hidden"); editingId=null; }

function savePlayer(){
  const name=$("nameInput").value.trim();
  if(!name){alert("Please enter a player name.");return;}
  const tiers={};
  document.querySelectorAll("[data-kit]").forEach(s=>tiers[s.dataset.kit]=s.value);
  const data={name,region:$("regionInput").value,rank:$("rankInput").value.trim(),image:$("imageInput").value.trim(),tiers};
  if(editingId) players=players.map(p=>p.id===editingId?{...p,...data}:p);
  else players.push({id:crypto.randomUUID(),...data});
  saveData(); render(); closeModal();
}
function editPlayer(id){openModal(id)}
function deletePlayer(id){
  const p=players.find(x=>x.id===id);
  if(confirm(`Delete ${p?.name || "this player"}?`)){players=players.filter(x=>x.id!==id);saveData();render();}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#096;")}

$("addBtn").onclick=()=>openModal();
$("emptyAddBtn").onclick=()=>openModal();
$("closeModal").onclick=closeModal;
$("cancelBtn").onclick=closeModal;
$("saveBtn").onclick=savePlayer;
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal();});

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(players,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="grass-tier-list.json";a.click();URL.revokeObjectURL(a.href);
};
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw 0;players=data;saveData();render();alert("Tier list imported!");}catch{alert("Invalid tier list JSON file.");}};
  r.readAsText(file);e.target.value="";
};
render();

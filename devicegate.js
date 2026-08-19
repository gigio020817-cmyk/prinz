/* Prinz Rudolf - approvazione dispositivi. Blocca la pagina finche' la direzione non approva il device. */
(function(){
"use strict";
var SB_URL="https://hxjxbpifboufolhwawkc.supabase.co";
var SB_KEY="sb_publishable_Fxh5-b2a7Qtt-Pumw0MrMg_Hpjd2m7Y";
var PFX="device|";
var WINE="#4A121B";
function sb(path,opts){opts=opts||{};var h=Object.assign({apikey:SB_KEY,Authorization:"Bearer "+SB_KEY},opts.headers||{});return fetch(SB_URL+"/rest/v1"+path,Object.assign({},opts,{headers:h})).then(function(r){return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null;}catch(e){}return {status:r.status,data:j};});});}
function devId(){var id=null;try{id=localStorage.getItem("prinz_dev");}catch(e){}if(!id){id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now().toString(36)+Math.random().toString(36).slice(2));try{localStorage.setItem("prinz_dev",id);}catch(e){}}return id;}
function esc(s){return String(s||"").split("<").join("&lt;").split(">").join("&gt;");}
var ov=document.createElement("div");
ov.id="__devgate";
ov.setAttribute("style","position:fixed;inset:0;top:0;left:0;width:100vw;height:100vh;z-index:2147483647;background:#f6f2ea;color:#1f1a14;font-family:-apple-system,Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;text-align:center");
function card(html){ov.innerHTML='<div style="max-width:420px;width:100%;background:#fffdf9;border:1px solid #e7ddca;border-radius:16px;padding:26px 22px;box-shadow:0 8px 30px rgba(74,18,27,.12)">'+html+"</div>";}
card('<div style="font-size:15px;color:#6b6257">Verifica dispositivo…</div>');
function mount(){var root=document.documentElement||document.body;if(root&&!document.getElementById("__devgate"))root.appendChild(ov);}
mount();
var poll=null;
function stopPoll(){if(poll){clearInterval(poll);poll=null;}}
function startPoll(){if(!poll)poll=setInterval(check,12000);}
function allow(v){stopPoll();if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);sb("/kitchen_meta?k=eq."+encodeURIComponent(PFX+devId()),{method:"PATCH",headers:{"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({v:Object.assign({},v,{lastSeen:new Date().toISOString()})})});}
function showRevoked(){stopPoll();mount();card('<div style="font-size:40px">🚫</div><div style="color:'+WINE+';font-weight:700;font-size:17px;margin:8px 0">Accesso revocato</div><div style="font-size:13px;color:#6b6257">Questo dispositivo non e piu autorizzato. Contatta la direzione.</div>');}
function showPending(name){mount();card('<div style="font-size:40px">⏳</div><div style="color:'+WINE+';font-weight:700;font-size:17px;margin:8px 0">In attesa di approvazione</div><div style="font-size:13px;color:#6b6257">Ciao '+esc(name)+', il tuo dispositivo e in attesa che la direzione lo approvi.<br>Lascia aperta questa pagina: si sblocca da sola.</div>');startPoll();}
function showRequest(){
  mount();
  card('<div style="font-size:40px">🔒</div><div style="color:'+WINE+';font-weight:700;font-size:17px;margin:8px 0">Nuovo dispositivo</div>'+
  '<div style="font-size:13px;color:#6b6257;margin-bottom:12px">Per accedere scrivi il tuo nome e chiedi la conferma alla direzione.</div>'+
  '<input id="__dgname" placeholder="Il tuo nome" autocomplete="off" style="width:100%;box-sizing:border-box;font-size:15px;padding:11px;border:1.5px solid #ddd2bd;border-radius:10px;margin-bottom:10px">'+
  '<button id="__dgbtn" style="width:100%;font-size:15px;font-weight:700;padding:12px;border:0;border-radius:11px;background:'+WINE+';color:#fff;cursor:pointer">Richiedi accesso</button>');
  var b=ov.querySelector("#__dgbtn"), inp=ov.querySelector("#__dgname");
  b.onclick=function(){
    var nm=(inp.value||"").trim();
    if(!nm){inp.focus();return;}
    b.textContent="Invio…";b.disabled=true;
    var v={name:nm,ua:navigator.userAgent.slice(0,140),status:"pending",created:new Date().toISOString(),page:(location.pathname.split("/").pop()||"")};
    sb("/kitchen_meta",{method:"POST",headers:{"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({k:PFX+devId(),v:v})}).then(function(){showPending(nm);});
  };
}
function check(){
  sb("/kitchen_meta?k=eq."+encodeURIComponent(PFX+devId())+"&select=k,v",{}).then(function(r){
    var row=r.data&&r.data[0], v=row&&row.v;
    if(v&&v.status==="approved"){allow(v);return;}
    if(v&&v.status==="revoked"){showRevoked();return;}
    if(v&&v.status==="pending"){showPending(v.name);return;}
    showRequest();
  }).catch(function(){startPoll();});
}
check();
})();

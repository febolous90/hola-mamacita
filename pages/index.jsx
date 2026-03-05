import { useState, useEffect } from "react";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const H = (token) => ({
  "Content-Type": "application/json",
  "apikey": SUPA_KEY,
  "Authorization": `Bearer ${token || SUPA_KEY}`
});

async function apiSignIn(email, password) {
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: H(), body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) return { error: d.error_description || d.msg || "Credenziali non valide" };
    return d;
  } catch(e) { return { error: "Errore di rete. Riprova." }; }
}

async function apiSignUp(email, password) {
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
      method: "POST", headers: H(), body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) return { error: d.error_description || d.msg || "Errore registrazione" };
    return d;
  } catch(e) { return { error: "Errore di rete. Riprova." }; }
}


// Crea una Stripe Checkout Session via Supabase Edge Function
// NOTA: in produzione questo va fatto lato server, non client.
// Per ora usiamo i link diretti Stripe con metadata nell'URL di success.
async function redirectToStripe(link, user, planName, duration, tutorName, isRandom) {
  // Aggiungiamo i parametri all'URL di success per la success page
  const successUrl = encodeURIComponent(
    `${window.location.origin}${window.location.pathname}?success=1&plan=${encodeURIComponent(planName)}&duration=${duration}&tutor=${encodeURIComponent(tutorName||"")}&random=${isRandom}&email=${encodeURIComponent(user.email)}`
  );
  // Stripe non permette di modificare success_url dai link diretti,
  // quindi apriamo il link e gestiamo il ritorno tramite query params
  window.location.href = link;
}

async function apiGetSessions(token) {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/sessions?select=*&order=booked_at.desc`, { headers: H(token) });
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { return []; }
}

const PLANS = [
  {n:"Flash",      p:"25", dur:10, d:"1 sessione · 10 min", t:"Per il tuo primo approccio 🌶",      pop:false, link:"https://buy.stripe.com/test_9B6bJ26H757rekvft504800"},
  {n:"Explorer",   p:"69", dur:30, d:"1 sessione · 30 min", t:"Abbastanza per impressionarla",       pop:true,  link:"https://buy.stripe.com/test_9B65kEghHeI190b3Kn04801"},
  {n:"Full Experience", p:"99", dur:60, d:"1 sessione · 1 ora",  t:"Per chi vuole davvero conquistare", pop:false, link:"https://buy.stripe.com/test_eVq6oI1mN7fz90b5Sv04802"},
];

const SI = ["¿Cómo te llamas? — e già ci sei","Spagnolo per vacanze, non per esami","Flirta in spagnolo come un locale","Niente libri. Solo conversazione vera","Impara da chi lo vive ogni giorno","¿Quedamos? — la frase che apre tutto","Parla. Sbaglia. Riprova. Funziona.","Dimentica Duolingo — qui si parla davvero","Vere insegnanti madrelingua, solo per te"];
const MS = ["Misteriose","Carismatiche","Latine madrelingua","La maschera le protegge","Il talento le distingue","Uniche e rare","¡Vámonos!"];

const TUTORS = [
  {name:"Valentina",flag:"🇨🇴",origin:"Colombia",avatar:"💁🏽‍♀️",bio:"Energica e paziente, specializzata in spagnolo conversazionale e slang latinoamericano.",live:true,sessions:142,age:27,languages:["Spagnolo","Inglese","Portoghese"],specialties:["Slang latinoamericano","Conversazione quotidiana","Pronuncia colombiana"],rating:4.9,reviews:["Valentina è fantastica, ho imparato più in 30 min con lei che in mesi su Duolingo! — Marco","Super paziente e divertente, la consiglio a tutti — Giulia"],personality:"Solare, energica e sempre pronta a ridere. Ama la salsa, il caffè colombiano e insegnare con storie vere di vita quotidiana.",color:"#FF2D8B"},
  {name:"Sofía",flag:"🇲🇽",origin:"Messico",avatar:"👩🏻‍🦱",bio:"Appassionata di cultura pop messicana, ti insegna a parlare come un locale in poche ore.",live:false,sessions:98,age:25,languages:["Spagnolo","Inglese"],specialties:["Cultura pop messicana","Spagnolo base","Frasi da viaggio"],rating:4.8,reviews:["Sofía mi ha fatto innamorare del Messico ancora di più — Luca","Sessione super fun, ho imparato un sacco di espressioni — Sara"],personality:"Creativa e curiosa, ama il cinema, i tacos e le conversazioni profonde. Trasforma ogni lezione in un viaggio culturale.",color:"#FF6B00"},
  {name:"Camila",flag:"🇦🇷",origin:"Argentina",avatar:"👩🏼‍🦰",bio:"Accento porteño autentico, esperta di grammatica e pronuncia. Sessioni divertenti e dirette.",live:true,sessions:210,age:29,languages:["Spagnolo","Italiano","Inglese"],specialties:["Accento argentino","Grammatica avanzata","Tango e cultura"],rating:5.0,reviews:["Camila è una professionista vera, la migliore — Andrea","Il suo metodo è unico, impari senza accorgertene — Francesca"],personality:"Diretta, appassionata e con un umorismo tagliente. Ama il tango, Borges e sfidare i suoi studenti a uscire dalla comfort zone.",color:"#2979FF"},
];


const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
:root{--pink:#FF2D8B;--orange:#FF6B00;--yellow:#FFD000;--green:#00C853;--blue:#2979FF;
  --rb:linear-gradient(135deg,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);
  --rb2:linear-gradient(90deg,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);
  --soft:#FFF5FB}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#FFFBFF;color:#222;overflow-x:hidden;cursor:none}
#peach-cursor{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;font-size:28px;transform:translate(-50%,-50%);user-select:none;line-height:1}
.nav{position:sticky;top:0;z-index:200;background:#fff;box-shadow:0 1px 0 #f0f0f0}
.nav-rb{height:4px;background:var(--rb2)}
.nav-inner{padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:58px;flex-wrap:wrap;gap:8px}
.nav-logo{font-family:'Playfair Display',serif;font-size:17px;border:none;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;padding:0;cursor:none;font-style:italic}
.nav-links{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.nav-link{color:#bbb;font-size:13px;background:none;border:none;cursor:none;font-family:'Inter',sans-serif;transition:color .2s;padding:0;font-weight:500}
.nav-link:hover{color:var(--pink)}
.nav-cta{background:var(--rb);color:#fff;font-weight:700;font-size:13px;padding:9px 22px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif;box-shadow:0 4px 16px rgba(255,45,139,.28)}
.hero{min-height:100vh;background:#fff;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;padding:100px 20px 80px}
.h-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(255,45,139,.11) 1.5px,transparent 1.5px);background-size:30px 30px}
.h-arch{position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:160vw;height:80vw;border-radius:50%;background:conic-gradient(from 198deg at 50% 100%,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);opacity:.06;pointer-events:none}
.cblob{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;animation:cbf 9s ease-in-out infinite}
.cb1{width:380px;height:380px;background:var(--yellow);opacity:.17;top:-60px;right:-40px}
.cb2{width:300px;height:300px;background:var(--pink);opacity:.13;bottom:-40px;left:-40px;animation-delay:-3s}
.cb3{width:240px;height:240px;background:var(--blue);opacity:.09;top:28%;left:3%;animation-delay:-5s}
.cb4{width:180px;height:180px;background:var(--green);opacity:.11;top:18%;right:6%;animation-delay:-2s}
@keyframes cbf{0%,100%{transform:translate(0,0)}33%{transform:translate(18px,-24px)}66%{transform:translate(-12px,16px)}}
.fls{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1}
.fl{position:absolute;opacity:0;animation:flup 7s ease-in infinite}
.fl:nth-child(1){left:5%;font-size:28px;animation-delay:0s}.fl:nth-child(2){left:13%;font-size:20px;animation-delay:-2s;animation-duration:9s}
.fl:nth-child(3){left:73%;font-size:24px;animation-delay:-1s;animation-duration:8s}.fl:nth-child(4){left:83%;font-size:18px;animation-delay:-4s}
.fl:nth-child(5){left:44%;font-size:16px;animation-delay:-3s;animation-duration:10s}.fl:nth-child(6){left:28%;font-size:22px;animation-delay:-5s;animation-duration:8s}
.fl:nth-child(7){left:58%;font-size:26px;animation-delay:-1.5s;animation-duration:9s}.fl:nth-child(8){left:90%;font-size:14px;animation-delay:-3.5s}
@keyframes flup{0%{opacity:0;transform:translateY(100vh)}10%{opacity:.75}90%{opacity:.15}100%{opacity:0;transform:translateY(-8vh) rotate(12deg)}}
.hi{position:relative;z-index:2}
.brand{font-family:'Playfair Display',serif;font-size:clamp(48px,10vw,120px);line-height:.9;letter-spacing:-2px;margin-bottom:28px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic}
.rb-line{width:280px;height:3px;margin:0 auto 32px;background:var(--rb);border-radius:3px}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{background:var(--rb);color:#fff;font-weight:700;font-size:14px;padding:15px 34px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif;box-shadow:0 4px 20px rgba(255,45,139,.28);transition:opacity .2s,transform .15s}
.btn:hover{opacity:.88;transform:translateY(-2px)}
.btn-out{background:#fff;color:#333;font-weight:600;font-size:14px;padding:14px 32px;border-radius:100px;border:2px solid #eee;cursor:none;font-family:'Inter',sans-serif;transition:all .2s}
.btn-out:hover{border-color:var(--pink);color:var(--pink)}
.arr{position:absolute;bottom:24px;left:50%;z-index:2;width:20px;height:20px;border-right:2px solid #ddd;border-bottom:2px solid #ddd;transform:translateX(-50%) rotate(45deg);animation:bnc 1.8s ease-in-out infinite}
@keyframes bnc{0%,100%{transform:translateX(-50%) rotate(45deg) translateY(0)}50%{transform:translateX(-50%) rotate(45deg) translateY(6px)}}
.strip{background:var(--rb);padding:14px 0;overflow:hidden}
.mtrack{display:flex;white-space:nowrap;animation:mq 22s linear infinite}
.mitem{font-family:'Playfair Display',serif;font-style:italic;font-size:15px;color:#fff;padding:0 24px}
.mitem::before{content:'♥';margin-right:14px;opacity:.7}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.sec{padding:72px 20px}.wrap{max-width:880px;margin:0 auto}.wsm{max-width:600px;margin:0 auto}.tc{text-align:center}
.lbl{font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:14px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
h2{font-family:'Playfair Display',serif;font-size:clamp(22px,3.5vw,38px);line-height:1.15;margin-bottom:16px;color:#222}
.bg-w{background:#fff}.bg-s{background:var(--soft)}
.bg-night{background:linear-gradient(135deg,#0a001a,#001433,#0a0022);position:relative;overflow:hidden}
.bg-night::before{content:'';position:absolute;inset:0;background:conic-gradient(from 0deg at 50% 110%,rgba(255,45,139,.18),rgba(255,107,0,.1),rgba(0,200,83,.08),rgba(41,121,255,.1),rgba(255,45,139,.18));pointer-events:none}
.steps{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:44px}
.step{flex:1;min-width:150px;max-width:200px;text-align:center;background:rgba(255,255,255,.06);border-radius:20px;padding:28px 18px;border:1px solid rgba(255,255,255,.1)}
.sn{font-family:'Playfair Display',serif;font-size:44px;line-height:1;margin-bottom:10px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.step h3{font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.step p{font-size:12px;color:rgba(255,255,255,.4);line-height:1.6}
.p-cards{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;align-items:flex-start;margin-top:32px}
.pc{background:#fff;border-radius:24px;padding:34px 24px;flex:1;min-width:200px;max-width:250px;position:relative;transition:all .25s;text-align:center;border:2px solid #f5e8f8}
.pc:hover{box-shadow:0 16px 48px rgba(255,45,139,.12);transform:translateY(-5px)}
.pc.pop{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--rb) border-box}
.pbadge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--rb);color:#fff;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:100px;font-weight:700;white-space:nowrap}
.pc-name{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#ccc;font-weight:700;margin-bottom:8px}
.pc-price{font-family:'Playfair Display',serif;font-size:48px;color:#222;line-height:1;margin-bottom:4px}
.pc-price sup{font-size:16px;vertical-align:super}
.pc-desc{font-size:12px;color:#ccc;margin-bottom:8px}
.pc-tag{font-size:11px;font-weight:700;margin-bottom:20px;font-style:italic;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pc-btn{display:block;width:100%;background:var(--rb);color:#fff;padding:13px;border-radius:100px;font-size:13px;font-weight:700;border:none;cursor:none;font-family:'Inter',sans-serif}
.scarcity{font-size:12px;font-weight:700;margin-top:22px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.choice-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:24px auto 0;max-width:520px}
.choice-card{flex:1;min-width:200px;max-width:235px;background:#fff;border:2px solid #f5e8f8;border-radius:20px;padding:24px 20px;cursor:none;transition:all .22s;text-align:center}
.choice-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(255,45,139,.1)}
.choice-card.sel{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--rb) border-box}
.choice-icon{font-size:34px;margin-bottom:10px}
.choice-title{font-family:'Playfair Display',serif;font-size:16px;font-style:italic;color:#222;margin-bottom:6px;font-weight:700}
.choice-desc{font-size:12px;color:#aaa;line-height:1.5}
.disc-pill{display:inline-block;background:linear-gradient(135deg,#00C853,#00E676);color:#fff;font-size:10px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:100px;margin-top:10px;text-transform:uppercase}
.disc-reveal{margin-top:20px;padding:18px 24px;background:linear-gradient(135deg,#f0fff4,#e8f5e9);border-radius:16px;border:1.5px solid #00C853;max-width:400px;margin-left:auto;margin-right:auto}
.disc-code{font-family:monospace;font-size:22px;font-weight:700;letter-spacing:3px;color:#00A040;display:block;margin:8px 0 4px}
.cal-box{border-radius:24px;overflow:hidden;border:3px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--rb) border-box;margin-top:28px}
.cal-header{padding:22px 26px 16px;display:flex;align-items:center;gap:14px;border-bottom:2px solid var(--soft)}
.cal-ttl{font-family:'Playfair Display',serif;font-size:19px;color:#222;font-style:italic}
.cal-sub{font-size:12px;color:#ccc;margin-top:2px}
.cal-ph{width:100%;height:180px;background:var(--soft);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.cal-ph p{font-size:13px;color:#bbb}
.cal-footer{padding:14px 26px;background:var(--soft);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.cal-note{font-size:12px;color:#ccc}
.cal-note strong{color:var(--orange)}
.cal-open{background:var(--rb);color:#fff;font-size:12px;font-weight:700;padding:9px 18px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif}
.lock-gate{background:var(--soft);border-radius:24px;padding:48px 32px;text-align:center;border:2px dashed #f5c6e0;margin-top:28px}
.lock-gate h3{font-family:'Playfair Display',serif;font-size:22px;margin:12px 0 10px;color:#222}
.lock-gate p{font-size:13px;color:#aaa;margin-bottom:24px;line-height:1.7}
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:28px;padding:40px 36px;width:100%;max-width:420px;position:relative;box-shadow:0 24px 80px rgba(255,45,139,.15)}
.modal-x{position:absolute;top:16px;right:18px;background:none;border:none;font-size:20px;cursor:none;color:#ccc}
.modal h2{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:6px;color:#222}
.modal-sub{font-size:13px;color:#aaa;margin-bottom:20px}
.modal-tabs{display:flex;margin-bottom:20px;border-radius:100px;background:#f5f5f5;padding:4px}
.mtab{flex:1;padding:9px;border:none;background:none;border-radius:100px;font-size:13px;font-weight:600;cursor:none;font-family:'Inter',sans-serif;color:#aaa;transition:all .2s}
.mtab.act{background:#fff;color:#222;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.google-btn{width:100%;background:#fff;color:#333;font-weight:700;font-size:14px;padding:13px;border-radius:100px;border:2px solid #eee;cursor:none;font-family:'Inter',sans-serif;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:10px;transition:border .2s}
.google-btn:hover{border-color:#ccc}
.divider{display:flex;align-items:center;gap:12px;margin:14px 0}
.divider span{font-size:11px;color:#ccc;font-weight:600;white-space:nowrap}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#f0f0f0}
.field{margin-bottom:14px}
.field label{display:block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#bbb;margin-bottom:6px}
.field input{width:100%;padding:12px 16px;border:2px solid #f0f0f0;border-radius:12px;font-size:14px;font-family:'Inter',sans-serif;color:#222;outline:none;background:#fafafa}
.field input:focus{border-color:var(--pink);background:#fff}
.auth-btn{width:100%;background:var(--rb);color:#fff;font-weight:700;font-size:15px;padding:14px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif;margin-top:6px}
.auth-btn:disabled{opacity:.5}
.msg-err{background:#fff0f5;border:1.5px solid #ffb3d1;border-radius:12px;padding:10px 14px;font-size:12px;color:var(--pink);margin-bottom:12px;font-weight:500}
.msg-ok{background:#f0fff4;border:1.5px solid #b3ffd1;border-radius:12px;padding:10px 14px;font-size:12px;color:#00A040;margin-bottom:12px;font-weight:500}
.dashboard{padding:48px 20px;max-width:720px;margin:0 auto}
.dash-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:12px}
.dash-welcome{font-family:'Playfair Display',serif;font-size:28px;color:#222}
.dash-out{background:#f5f5f5;color:#888;font-size:12px;font-weight:700;padding:9px 18px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif}
.dash-out:hover{background:#ffe0ef;color:var(--pink)}
.stats{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:32px}
.stat{flex:1;min-width:100px;background:#fff;border-radius:18px;padding:20px 18px;border:2px solid #f5e8f8;text-align:center}
.stat-n{font-family:'Playfair Display',serif;font-size:36px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.stat-l{font-size:11px;color:#bbb;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.sess-hdr{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ddd;margin-bottom:14px}
.sess-list{display:flex;flex-direction:column;gap:10px}
.sess-item{background:#fff;border-radius:16px;padding:16px 20px;border:2px solid #f5e8f8;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.sess-type{font-family:'Playfair Display',serif;font-size:15px;color:#222;font-style:italic}
.sess-meta{font-size:11px;color:#ccc;margin-top:2px}
.sess-badge{background:var(--rb);color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:100px}
.sess-empty{text-align:center;padding:40px 20px;color:#ccc;font-size:13px}
.m-hero{min-height:100vh;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 20px 80px}
.m-arch{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:140vw;height:100vw;max-width:1600px;border-radius:50%;background:conic-gradient(from 165deg at 50% 0%,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);opacity:.07;pointer-events:none}
.m-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(156,39,176,.1) 1.5px,transparent 1.5px);background-size:28px 28px}
.m-brand{font-family:'Playfair Display',serif;font-size:clamp(60px,12vw,130px);line-height:.9;letter-spacing:-3px;font-style:italic;position:relative;z-index:2;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.m-line{width:280px;height:3px;margin:20px auto 24px;background:var(--rb);border-radius:3px;position:relative;z-index:2}
.m-sub{font-size:clamp(14px,1.7vw,18px);color:#999;max-width:440px;line-height:1.72;position:relative;z-index:2}
.mask-row{display:flex;gap:16px;justify-content:center;align-items:flex-end;flex-wrap:wrap;margin-top:48px;position:relative;z-index:2}
.mf-b{border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;animation:bob 3s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.ec-row{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:44px}
.ec{flex:1;min-width:190px;max-width:220px;background:#fff;border-radius:20px;padding:28px 18px;border:2px solid #f5e8f8;transition:all .2s;text-align:center}
.ec:hover{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--rb) border-box;transform:translateY(-4px)}
.ec-icon{font-size:32px;margin-bottom:12px}
.ec h3{font-family:'Playfair Display',serif;font-size:15px;color:#222;margin-bottom:7px}
.ec p{font-size:12px;color:#aaa;line-height:1.6}
.waitlist{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.w-in{padding:13px 20px;border:2px solid #f5e8f8;border-radius:100px;font-size:14px;font-family:'Inter',sans-serif;color:#333;background:#fff;outline:none;width:250px}
.w-in:focus{border-color:var(--pink)}
.w-btn{background:var(--rb);color:#fff;font-weight:700;font-size:14px;padding:13px 26px;border-radius:100px;border:none;cursor:none;font-family:'Inter',sans-serif}
.footer{background:var(--soft);padding:36px 20px;text-align:center}
.f-logo{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:10px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic}
.disc-f{font-size:10px;color:#ccc;max-width:440px;margin:0 auto;line-height:1.85}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#222;color:#fff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:100px;z-index:9999;pointer-events:none;white-space:nowrap}
.grad{background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

.success-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FFFBFF;padding:40px 20px;position:relative;overflow:hidden}
.success-card{background:#fff;border-radius:32px;padding:52px 44px;max-width:480px;width:100%;text-align:center;box-shadow:0 24px 80px rgba(255,45,139,.12);position:relative;z-index:1}
.success-icon{font-size:64px;margin-bottom:20px;animation:pop .5s cubic-bezier(.22,1,.36,1)}
@keyframes pop{from{transform:scale(0) rotate(-20deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.success-title{font-family:"Playfair Display",serif;font-size:32px;font-style:italic;color:#222;margin-bottom:10px}
.success-sub{font-size:15px;color:#aaa;line-height:1.7;margin-bottom:28px}
.success-box{background:var(--soft);border-radius:16px;padding:20px 24px;margin-bottom:28px;border-left:4px solid var(--pink);text-align:left}
.success-box p{font-size:14px;color:#333;margin-bottom:6px}
.success-box p:last-child{margin-bottom:0}
.success-box strong{color:#222}
.success-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:28px;text-align:left}
.success-step{display:flex;align-items:flex-start;gap:14px;padding:14px 18px;background:#f9f9f9;border-radius:14px}
.success-step-num{width:28px;height:28px;border-radius:50%;background:var(--rb);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.success-step-text{font-size:13px;color:#555;line-height:1.5}
.confetti-dot{position:absolute;border-radius:50%;pointer-events:none;animation:conffall linear infinite}
@keyframes conffall{0%{opacity:1;transform:translateY(-20px) rotate(0deg)}100%{opacity:0;transform:translateY(100vh) rotate(720deg)}}


.tutor-card{flex:1;min-width:240px;max-width:300px;background:#fff;border-radius:24px;border:2px solid #f5e8f8;padding:32px 24px;text-align:center;transition:all .25s;box-shadow:0 2px 12px rgba(0,0,0,.04);cursor:none}
.tutor-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(255,45,139,.12)}
.tutor-card.selected{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--rb) border-box;box-shadow:0 16px 40px rgba(255,45,139,.18)}
.mm-ov{position:fixed;inset:0;background:rgba(10,0,26,.7);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;animation:fdin .25s ease}
@keyframes fdin{from{opacity:0}to{opacity:1}}
.mm{background:#fff;border-radius:32px;width:100%;max-width:560px;position:relative;overflow:hidden;box-shadow:0 32px 80px rgba(255,45,139,.2);animation:sldn .3s cubic-bezier(.22,1,.36,1)}
@keyframes sldn{from{opacity:0;transform:translateY(40px) scale(.96)}to{opacity:1;transform:none}}
.mm-top{padding:40px 36px 28px;position:relative}
.mm-accent{position:absolute;top:0;left:0;right:0;height:5px;background:var(--rb)}
.mm-x{position:absolute;top:18px;right:18px;background:#f5f5f5;border:none;width:32px;height:32px;border-radius:50%;font-size:14px;cursor:none;color:#888;display:flex;align-items:center;justify-content:center;transition:all .18s}
.mm-x:hover{background:#ffe0ef;color:var(--pink)}
.mm-avatar{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#FFD6EC,#FFB3D9);display:flex;align-items:center;justify-content:center;font-size:52px;margin:0 auto 16px;box-shadow:0 6px 24px rgba(255,45,139,.2)}
.mm-name{font-family:"Playfair Display",serif;font-size:30px;font-style:italic;font-weight:700;color:#222;margin-bottom:4px}
.mm-origin{font-size:13px;color:#bbb;font-weight:600;margin-bottom:14px}
.mm-stars{color:#FFD000;font-size:16px;margin-bottom:6px;letter-spacing:2px}
.mm-rating{font-size:12px;color:#aaa;font-weight:700}
.mm-body{padding:0 36px 36px;overflow-y:auto;max-height:55vh}
.mm-section{margin-bottom:22px}
.mm-section-title{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;font-weight:700;color:#ccc;margin-bottom:10px}
.mm-personality{font-size:14px;color:#555;line-height:1.72;font-style:italic;padding:16px;background:var(--soft);border-radius:14px;border-left:3px solid var(--pink)}
.mm-tags{display:flex;flex-wrap:wrap;gap:8px}
.mm-tag{background:var(--soft);border-radius:100px;padding:5px 14px;font-size:12px;font-weight:600;color:var(--pink)}
.mm-langs{display:flex;gap:8px;flex-wrap:wrap}
.mm-lang{background:#f5f5f5;border-radius:100px;padding:5px 14px;font-size:12px;font-weight:600;color:#555}
.mm-review{background:#f9f9f9;border-radius:14px;padding:14px 16px;font-size:13px;color:#666;line-height:1.6;font-style:italic;margin-bottom:8px}
.mm-footer{padding:20px 36px 28px;border-top:2px solid #f5f5f5;display:flex;gap:12px}
.mm-stat{flex:1;text-align:center;background:var(--soft);border-radius:14px;padding:14px 8px}
.mm-stat-n{font-family:"Playfair Display",serif;font-size:24px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.mm-stat-l{font-size:10px;color:#bbb;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:3px}
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

function Strip({items}) {
  const d=[...items,...items];
  return <div className="strip"><div className="mtrack">{d.map((t,i)=><span key={i} className="mitem">{t}</span>)}</div></div>;
}
function Footer() {
  return <div className="footer"><div className="f-logo">Hola Mamacita 🌶</div><p className="disc-f">Hola Mamacita provides online language conversation sessions only. All sessions are strictly educational and conducted via Zoom.</p></div>;
}
function Blobs(){return <>{[1,2,3,4].map(i=><div key={i} className={`cblob cb${i}`}/>)}</>;}
function Floats({emojis}){return <div className="fls">{emojis.map((e,i)=><span key={i} className="fl">{e}</span>)}</div>;}


function MamacitaModal({tutor, onClose, onBook}) {
  const stars = "★".repeat(Math.floor(tutor.rating)) + (tutor.rating % 1 ? "½" : "");
  return (
    <div className="mm-ov" onClick={e=>e.target.classList.contains("mm-ov")&&onClose()}>
      <div className="mm">
        <div className="mm-accent"/>
        <div className="mm-top" style={{textAlign:"center"}}>
          <button className="mm-x" onClick={onClose}>✕</button>
          <div className="mm-avatar">{tutor.avatar}</div>
          <div className="mm-name">{tutor.name}</div>
          <div className="mm-origin">{tutor.flag} {tutor.origin} · {tutor.age} anni</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:tutor.live?"#f0fff4":"#f5f5f5",border:`1.5px solid ${tutor.live?"#00C853":"#eee"}`,borderRadius:100,padding:"4px 14px",fontSize:11,fontWeight:700,color:tutor.live?"#00A040":"#bbb",marginBottom:14}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:tutor.live?"#00C853":"#ccc",display:"inline-block",boxShadow:tutor.live?"0 0 6px #00C853":""}}/>
            {tutor.live?"Live ora":"Offline"}
          </div>
          <div className="mm-stars">{stars}</div>
          <div className="mm-rating">{tutor.rating}/5 · {tutor.sessions} sessioni completate</div>
        </div>
        <div className="mm-body">
          <div className="mm-section">
            <div className="mm-section-title">Chi sono</div>
            <div className="mm-personality">{tutor.personality}</div>
          </div>
          <div className="mm-section">
            <div className="mm-section-title">Specialità</div>
            <div className="mm-tags">{tutor.specialties.map(s=><span key={s} className="mm-tag">{s}</span>)}</div>
          </div>
          <div className="mm-section">
            <div className="mm-section-title">Lingue parlate</div>
            <div className="mm-langs">{tutor.languages.map(l=><span key={l} className="mm-lang">🌐 {l}</span>)}</div>
          </div>
          <div className="mm-section">
            <div className="mm-section-title">Recensioni</div>
            {tutor.reviews.map((r,i)=><div key={i} className="mm-review">{r}</div>)}
          </div>
        </div>
        <div className="mm-footer">
          <div className="mm-stat"><div className="mm-stat-n">{tutor.sessions}</div><div className="mm-stat-l">Sessioni</div></div>
          <div className="mm-stat"><div className="mm-stat-n">{tutor.rating}</div><div className="mm-stat-l">Rating</div></div>
          <div className="mm-stat"><div className="mm-stat-n">{tutor.age}</div><div className="mm-stat-l">Anni</div></div>
          <button className="btn" style={{flex:2,fontSize:13,padding:"0 16px"}} onClick={()=>{onClose();onBook();}}>Prenota ora →</button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({onClose, onLogin}) {
  const [tab,setTab]=useState("login");
  const [email,setEmail]=useState("");
  const [pwd,setPwd]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [ok,setOk]=useState("");

  const submit = async () => {
    setErr(""); setOk("");
    if(!email||!pwd){setErr("Compila tutti i campi.");return;}
    if(pwd.length<6){setErr("Password minimo 6 caratteri.");return;}
    setLoading(true);
    if(tab==="login"){
      const data = await apiSignIn(email,pwd);
      if(data.error){setErr(data.error);setLoading(false);return;}
      onLogin({email:data.user?.email||email,token:data.access_token});
      onClose();
    } else {
      const data = await apiSignUp(email,pwd);
      if(data.error){setErr(data.error);setLoading(false);return;}
      setOk("✅ Account creato! Controlla la tua email per confermare.");
    }
    setLoading(false);
  };

  const googleLogin = () => {
    window.open(
      `${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.href)}`,
      "_blank","width=500,height=600,left=200,top=100"
    );
  };

  return (
    <div className="modal-ov" onClick={e=>e.target.classList.contains("modal-ov")&&onClose()}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}>✕</button>
        <h2>Benvenuta 🎭</h2>
        <p className="modal-sub">Accedi per prenotare la tua sessione</p>
        <button className="google-btn" onClick={googleLogin}><GoogleIcon/>Continua con Google</button>
        <div className="divider"><span>oppure</span></div>
        <div className="modal-tabs">
          <button className={`mtab${tab==="login"?" act":""}`} onClick={()=>{setTab("login");setErr("");setOk("");}}>Accedi</button>
          <button className={`mtab${tab==="signup"?" act":""}`} onClick={()=>{setTab("signup");setErr("");setOk("");}}>Registrati</button>
        </div>
        {err&&<div className="msg-err">{err}</div>}
        {ok&&<div className="msg-ok">{ok}</div>}
        <div className="field"><label>Email</label><input type="email" placeholder="la@tua.email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
        <button className="auth-btn" onClick={submit} disabled={loading}>{loading?"...":tab==="login"?"Accedi →":"Crea account →"}</button>
      </div>
    </div>
  );
}

function Dashboard({user,onLogout,onBook}) {
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    apiGetSessions(user.token).then(data=>{setSessions(Array.isArray(data)?data:[]);setLoading(false);});
  },[]);
  const spent=sessions.reduce((s,r)=>s+(r.price||0),0);
  return (
    <div className="dashboard">
      <div className="dash-hdr">
        <div><div className="lbl">Area personale</div><div className="dash-welcome">Ciao, <span className="grad">{user.email.split("@")[0]}</span> 👋</div></div>
        <button className="dash-out" onClick={onLogout}>Esci →</button>
      </div>
      <div className="stats">
        {[[sessions.length,"Sessioni"],[`$${spent}`,"Speso"],[sessions.filter(s=>s.status==="confirmed").length,"Confermate"]].map(([n,l])=>(
          <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
        ))}
      </div>
      <div className="sess-hdr">Storico sessioni</div>
      {loading?<p style={{color:"#ccc",fontSize:13,padding:"20px 0"}}>Caricamento...</p>
        :sessions.length===0
          ?<div className="sess-empty"><div style={{fontSize:36,marginBottom:10}}>🎭</div>Nessuna sessione ancora. Prenota la prima!</div>
          :<div className="sess-list">{sessions.map(s=>(
            <div key={s.id} className="sess-item">
              <div><div className="sess-type">{s.type||"Sessione"}</div><div className="sess-meta">{s.duration||""} · {new Date(s.booked_at).toLocaleDateString("it-IT")}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>{s.price&&<span style={{fontWeight:700,fontSize:14}}>${s.price}</span>}<span className="sess-badge">{s.status}</span></div>
            </div>
          ))}</div>
      }
      <button className="btn" style={{marginTop:24,width:"100%"}} onClick={onBook}>+ Prenota nuova sessione 🌶</button>
    </div>
  );
}


function SuccessPage({params, onContinue}) {
  const plan     = params.get("plan")     || "Sessione";
  const duration = params.get("duration") || "30";
  const tutor    = params.get("tutor")    || "";
  const isRandom = params.get("random")   === "true";
  const email    = params.get("email")    || "";

  const confetti = Array.from({length:18}, (_,i) => ({
    id:i,
    left: Math.random()*100,
    size: 8 + Math.random()*10,
    delay: Math.random()*3,
    dur: 2.5 + Math.random()*2,
    color: ["#FF2D8B","#FF6B00","#FFD000","#00C853","#2979FF","#9C27B0"][i%6]
  }));

  return (
    <div className="success-page">
      {confetti.map(c=>(
        <div key={c.id} className="confetti-dot" style={{
          left:`${c.left}%`, width:c.size, height:c.size,
          background:c.color, animationDuration:`${c.dur}s`,
          animationDelay:`${c.delay}s`, top:-20
        }}/>
      ))}
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <div className="success-title">Pagamento confermato!</div>
        <p className="success-sub">
          ¡Perfecto! La tua sessione è stata acquistata con successo.
          {email && <><br/>Controlla <strong style={{color:"#222"}}>{email}</strong> per la conferma.</>}
        </p>
        <div className="success-box">
          <p><strong>Piano:</strong> {plan} — {duration} min</p>
          <p><strong>Tutor:</strong> {tutor ? tutor : isRandom ? "Mamacita a sorpresa 🎲" : "Non selezionata"}</p>
        </div>
        <div className="success-steps">
          <div className="success-step">
            <div className="success-step-num">1</div>
            <div className="success-step-text"><strong>Email inviata</strong> — Controlla la tua casella, trovi tutti i dettagli della sessione.</div>
          </div>
          <div className="success-step">
            <div className="success-step-num">2</div>
            <div className="success-step-text"><strong>Prenota lo slot</strong> — Accedi al tuo account e scegli data e ora della sessione.</div>
          </div>
          <div className="success-step">
            <div className="success-step-num">3</div>
            <div className="success-step-text"><strong>¡A hablar!</strong> — Ricevi il link Zoom e inizia a parlare spagnolo. 🌶</div>
          </div>
        </div>
        <button className="btn" style={{width:"100%"}} onClick={onContinue}>
          Vai alla tua area personale →
        </button>
      </div>
    </div>
  );
}

function App() {
  const [urlParams, setUrlParams]=useState(null);
  const [page,setPage]=useState("home");
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    setUrlParams(params);
    if(params.get("success")==="1") setPage("success");
  },[]);
  const [mc,setMc]=useState("choose");
  const [toastMsg,setToastMsg]=useState("");
  const [showAuth,setShowAuth]=useState(false);
  const [user,setUser]=useState(()=>{try{const s=localStorage.getItem("hm_user");return s?JSON.parse(s):null;}catch{return null;}});
  const [selectedCard,setSelectedCard]=useState(null);
  const [openTutor,setOpenTutor]=useState(null);

  useEffect(()=>{
    const el=document.createElement("div");
    el.id="peach-cursor"; el.textContent="🍑";
    Object.assign(el.style,{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:99999,fontSize:"28px",transform:"translate(-50%,-50%)",userSelect:"none",lineHeight:1,transition:"left 0.05s ease-out, top 0.05s ease-out"});
    document.body.appendChild(el);
    const move=e=>{el.style.left=e.clientX+"px";el.style.top=e.clientY+"px";};
    window.addEventListener("mousemove",move);
    document.body.style.cursor="none";
    return()=>{window.removeEventListener("mousemove",move);el.remove();document.body.style.cursor="";};
  },[]);

  useEffect(()=>{if(user)localStorage.setItem("hm_user",JSON.stringify(user));else localStorage.removeItem("hm_user");},[user]);const toast=m=>{setToastMsg(m);setTimeout(()=>setToastMsg(""),2600);};
  const go=(p,anchor)=>{
    setPage(p);setShowAuth(false);
    if(anchor)setTimeout(()=>document.getElementById("sec-"+anchor)?.scrollIntoView({behavior:"smooth"}),80);
    else window.scrollTo({top:0,behavior:"instant"});
  };
  const bookClick=()=>{if(!user){setShowAuth(true);return;}go("home","booking");};

  const Nav=()=>(
    <nav className="nav">
      <div className="nav-rb"/>
      <div className="nav-inner">
        <button className="nav-logo" onClick={()=>go("home")}>Hola Mamacita</button>
        <div className="nav-links">
          <button className="nav-link" style={page==="home"?{color:"var(--pink)"}:{}} onClick={()=>go("home")}>Home</button>
          <button className="nav-link" style={page==="mamacitas"?{color:"var(--pink)"}:{}} onClick={()=>go("mamacitas")}>Mamacitas</button>
          <button className="nav-link" onClick={()=>go("home","pricing")}>Pricing</button>
          {user
            ?<><button className="nav-link" style={page==="dashboard"?{color:"var(--pink)"}:{}} onClick={()=>go("dashboard")}>👤 {user.email.split("@")[0]}</button><button className="nav-cta" onClick={bookClick}>Book Now 🔥</button></>
            :<><button className="nav-link" onClick={()=>setShowAuth(true)}>Accedi</button><button className="nav-cta" onClick={()=>setShowAuth(true)}>Book Now 🔥</button></>
          }
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <style>{css}</style>
      <Nav/>
      {toastMsg&&<div className="toast">{toastMsg}</div>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onLogin={u=>{setUser(u);toast("🎉 Bentornato!");}}/>}
      {openTutor&&<MamacitaModal tutor={openTutor} onClose={()=>setOpenTutor(null)} onBook={bookClick}/>}

      {page==="success"&&<SuccessPage params={urlParams} onContinue={()=>{
        window.history.replaceState({},"",window.location.pathname);
        if(user) go("dashboard"); else {setShowAuth(true);setPage("home");}
      }}/>}
      {page==="dashboard"&&user&&<Dashboard user={user} onLogout={()=>{setUser(null);toast("👋 Disconnesso!");go("home");}} onBook={()=>go("home","booking")}/>}

      {page==="home"&&<>
        <section className="hero" style={{minHeight:"60vh",padding:"70px 20px 50px"}}>
          <div className="h-arch"/><div className="h-dots"/>
          <Blobs/><Floats emojis={["🌶","🌺","✨","🌴","💃","🔥","🎉","🍹"]}/>
          <div className="hi">
            <div className="brand" style={{fontSize:"clamp(40px,8vw,90px)",marginBottom:20}}>Hola Mamacita</div>
            <div className="rb-line" style={{marginBottom:24}}/>
            <div className="hero-btns">
              <button className="btn" onClick={()=>go("home","pricing")}>Inizia ora 🌶</button>
              <button className="btn-out" onClick={()=>go("mamacitas")}>Le Mamacitas</button>
            </div>
          </div>
        </section>
        <Strip items={SI}/>
        <div className="sec bg-s tc" id="sec-pricing">
          <div className="wrap">
            <div className="lbl">Scegli il tuo piano</div>
            <h2>Scegli, paga, parla. <em style={{fontStyle:"italic",color:"var(--pink)"}}>Semplice.</em></h2>
            <p style={{fontSize:14,color:"#aaa",marginBottom:8}}>Via Zoom · Pagamento sicuro Stripe · Inizia subito</p>
            <div className="p-cards">
              {PLANS.map(({n,p,d,t,pop,link})=>(
                <div key={n} className={`pc${pop?" pop":""}`}>
                  {pop&&<div className="pbadge">🔥 Più scelto</div>}
                  <div className="pc-name">{n}</div>
                  <div className="pc-price"><sup>$</sup>{p}</div>
                  <div className="pc-desc">{d}</div>
                  <div className="pc-tag">{t}</div>
                  <button className="pc-btn" onClick={()=>{if(!user){setShowAuth(true);return;}window.location.href=link;}}>Paga con Stripe →</button>
                </div>
              ))}
            </div>
            <p className="scarcity">⚑ Slot limitati per tutor ogni settimana.</p>
          </div>
        </div>
        <div className="sec bg-w" id="sec-booking">
          <div className="wrap tc">
            <div className="lbl">Step 2 — dopo il pagamento</div>
            <h2>Scegli la tua Mamacita</h2>
            <p style={{fontSize:15,color:"#aaa"}}>Preferisci scegliere tu, o vuoi una sorpresa con lo sconto?</p>
            {!user
              ?<div className="lock-gate"><div style={{fontSize:48}}>🔒</div><h3>Accedi per prenotare</h3><p>Crea un account gratuito o accedi per sbloccare la prenotazione.</p><button className="btn" onClick={()=>setShowAuth(true)}>Accedi / Registrati →</button></div>
              :<>
                <div className="choice-row">
                  <div className={`choice-card${mc==="choose"?" sel":""}`} onClick={()=>setMc("choose")}><div className="choice-icon">🎭</div><div className="choice-title">Scelgo io</div><div className="choice-desc">Prenota dal calendario e scegli la tua Mamacita preferita</div></div>
                  <div className={`choice-card${mc==="random"?" sel":""}`} onClick={()=>setMc("random")}><div className="choice-icon">🎲</div><div className="choice-title">Mamacita a sorpresa</div><div className="choice-desc">Ti viene assegnata una Mamacita casuale</div><div className="disc-pill">-10% sconto</div></div>
                </div>
                {mc==="random"&&<div className="disc-reveal"><div style={{fontSize:14,color:"#333"}}>🎉 Usa questo codice al pagamento:</div><span className="disc-code">SORPRESA10</span><div style={{fontSize:11,color:"#aaa"}}>-10% su tutte le sessioni</div></div>}
                <div className="cal-box">
                  <div className="cal-header"><span style={{fontSize:26}}>📅</span><div style={{marginLeft:14}}><div className="cal-ttl">Prenota con Calendly</div><div className="cal-sub">Sessione Zoom · Conferma istantanea</div></div></div>
                  <div className="cal-ph"><span style={{fontSize:40}}>📅</span><p>Collega il tuo account Calendly</p><button className="btn" style={{fontSize:13,padding:"10px 22px"}} onClick={()=>toast("🔗 Sostituisci URL Calendly nel codice!")}>Configura Calendly</button></div>
                  <div className="cal-footer"><span className="cal-note">🔒 Ricevi il <strong>link Zoom</strong> via email.</span><button className="cal-open" onClick={()=>toast("🔗 Aggiungi il tuo link Calendly!")}>Apri in Calendly →</button></div>
                </div>
              </>
            }
          </div>
        </div>
        <Footer/>
      </>}

      {page==="mamacitas"&&<>
        <section className="m-hero">
          <div className="m-arch"/><div className="m-dots"/>
          <Blobs/><Floats emojis={["🎭","💃","🌺","🔥","✨","🌴","🎉","🍹"]}/>
          <div className="m-brand">Mamacitas</div>
          <div className="m-line"/>
          <p className="m-sub">Carismatiche. Latine. Madrelingua.<br/>Scegli la tua e inizia a parlare.</p>
        </section>
        <Strip items={MS}/>
        <div className="sec bg-w">
          <div className="wrap">
            <div className="tc" style={{marginBottom:48}}>
              <div className="lbl">Le nostre tutor</div>
              <h2>Scegli la tua <em style={{fontStyle:"italic",color:"var(--pink)"}}>Mamacita</em></h2>
              <p style={{fontSize:14,color:"#aaa",marginTop:-8}}>Tutte madrelingua · Selezionate a mano · Sessioni via Zoom</p>
            </div>
            <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
              {TUTORS.map((tutor)=>{
                const {name,flag,origin,avatar,bio,live,sessions}=tutor;
                const isSel=selectedCard===name;
                return (
                <div key={name} className={`tutor-card${isSel?" selected":""}`}
                  onClick={()=>setSelectedCard(isSel?null:name)}
                >
                  <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#FFD6EC,#FFB3D9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",boxShadow:"0 4px 16px rgba(255,45,139,.15)"}}>{avatar}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontStyle:"italic",fontWeight:700,color:"#222",marginBottom:4}}>{name}</div>
                  <div style={{fontSize:12,color:"#bbb",marginBottom:14,fontWeight:600}}>{flag} {origin}</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:6,background:live?"#f0fff4":"#f5f5f5",border:`1.5px solid ${live?"#00C853":"#eee"}`,borderRadius:100,padding:"4px 14px",fontSize:11,fontWeight:700,color:live?"#00A040":"#bbb",marginBottom:16}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:live?"#00C853":"#ccc",display:"inline-block",boxShadow:live?"0 0 6px #00C853":""}}/>
                    {live?"Live ora":"Offline"}
                  </div>
                  <p style={{fontSize:13,color:"#888",lineHeight:1.65,marginBottom:20}}>{bio}</p>
                  <div style={{fontSize:11,color:"#ccc",marginBottom:20,fontWeight:600}}>{sessions} sessioni completate</div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn" style={{flex:1,padding:"11px 8px",fontSize:12}} onClick={e=>{e.stopPropagation();setOpenTutor(tutor);}}>Scopri →</button>
                    <button className="btn" style={{flex:1,padding:"11px 8px",fontSize:12,background:"var(--rb)",opacity:isSel?1:.7}} onClick={e=>{e.stopPropagation();bookClick();}}>Prenota 🌶</button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="sec bg-night tc" style={{position:"relative"}}>
          <div className="wsm" style={{position:"relative",zIndex:1}}>
            <h2 style={{color:"#fff"}}>Non aspettare la tua <em style={{fontStyle:"italic",color:"var(--yellow)"}}>Mamacita</em>.</h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,.4)",margin:"14px auto 28px",maxWidth:360,lineHeight:1.7}}>Le sessioni partono subito. Prenota ora.</p>
            <button className="btn" onClick={bookClick}>Prenota ora 🎭</button>
          </div>
        </div>
        <Footer/>
      </>}
    </>
  );
}




import dynamic from 'next/dynamic';
const AppNoSSR = dynamic(() => Promise.resolve(App), { ssr: false });
export default AppNoSSR;

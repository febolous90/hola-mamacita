import { useState, useEffect } from "react";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const STRIPE_TRIAL_LINK = "STRIPE_TRIAL_LINK";

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

async function apiGetSessions(token) {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/sessions?select=*&order=booked_at.desc`, { headers: H(token) });
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { return []; }
}

const TUTORS = [
  {
    name:"Valentina", flag:"🇨🇴", origin:"Colombia", avatar:"💁🏽‍♀️",
    bio:"Energica e paziente, specializzata in spagnolo conversazionale e slang latinoamericano.",
    live:true, sessions:142, age:27,
    languages:["Spanish","English","Portuguese"],
    specialties:["Latin slang","Daily conversation","Colombian accent"],
    tags:["Playful","Beginner friendly","High energy"],
    rating:4.9,
    reviews:[{text:"I learned more in 30 min with Valentina than months on Duolingo!", author:"Marco R."}],
    personality:"Bubbly, energetic and always ready to laugh. Loves salsa, Colombian coffee and teaching with real life stories.",
    color:"#FF2D8B",
    services:[
      {name:"30 min conversation", price:"15€"},
      {name:"60 min conversation", price:"25€"},
      {name:"Instant call", price:"10€"},
    ]
  },
  {
    name:"Sofía", flag:"🇲🇽", origin:"Mexico", avatar:"👩🏻‍🦱",
    bio:"Appassionata di cultura pop messicana, ti insegna a parlare come un locale in poche ore.",
    live:false, sessions:98, age:25,
    languages:["Spanish","English"],
    specialties:["Mexican culture","Basic Spanish","Travel phrases"],
    tags:["Confident","Cultural","Fun"],
    rating:4.8,
    reviews:[{text:"Sofía made me fall even more in love with Mexico. Super fun session!", author:"Luca M."}],
    personality:"Creative and curious, loves cinema, tacos and deep conversations. Turns every lesson into a cultural trip.",
    color:"#FF6B00",
    services:[
      {name:"30 min conversation", price:"15€"},
      {name:"Flirty Spanish", price:"20€"},
      {name:"Instant call", price:"10€"},
    ]
  },
  {
    name:"Camila", flag:"🇦🇷", origin:"Argentina", avatar:"👩🏼‍🦰",
    bio:"Accento porteño autentico, esperta di grammatica e pronuncia. Sessioni divertenti e dirette.",
    live:true, sessions:210, age:29,
    languages:["Spanish","Italian","English"],
    specialties:["Argentine accent","Advanced grammar","Tango & culture"],
    tags:["Direct","Advanced","Passionate"],
    rating:5.0,
    reviews:[{text:"Camila is a true professional. Her method is unique — you learn without even realising it.", author:"Andrea F."}],
    personality:"Direct, passionate and with sharp humor. Loves tango, Borges and challenging her students to leave their comfort zone.",
    color:"#2979FF",
    services:[
      {name:"30 min conversation", price:"18€"},
      {name:"60 min conversation", price:"30€"},
      {name:"Instant call", price:"12€"},
    ]
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --pink:#FF2D8B; --orange:#FF6B00; --yellow:#FFD000; --green:#00C853; --blue:#2979FF;
  --rb:linear-gradient(135deg,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);
  --rb2:linear-gradient(90deg,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);
  --soft:#FFF5FB; --night:#08001A;
}

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; }
body { font-family:'Inter',sans-serif; background:#FFFBFF; color:#222; overflow-x:hidden; cursor:none; }

#peach-cursor { position:fixed; top:0; left:0; pointer-events:none; z-index:99999; font-size:28px; transform:translate(-50%,-50%); user-select:none; line-height:1; }

/* NAV */
.nav { position:sticky; top:0; z-index:200; background:rgba(255,251,255,0.92); backdrop-filter:blur(12px); box-shadow:0 1px 0 #f0f0f0; }
.nav-rb { height:3px; background:var(--rb2); }
.nav-inner { padding:0 32px; display:flex; align-items:center; justify-content:space-between; height:60px; }
.nav-logo { font-family:'Playfair Display',serif; font-size:18px; border:none; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:700; padding:0; cursor:none; font-style:italic; }
.nav-links { display:flex; gap:20px; align-items:center; }
.nav-link { color:#bbb; font-size:13px; background:none; border:none; cursor:none; font-family:'Inter',sans-serif; transition:color .2s; padding:0; font-weight:500; }
.nav-link:hover, .nav-link.active { color:#222; }
.nav-cta { background:var(--rb); color:#fff; font-weight:700; font-size:13px; padding:10px 24px; border-radius:100px; border:none; cursor:none; font-family:'Inter',sans-serif; box-shadow:0 4px 16px rgba(255,45,139,.28); transition:opacity .2s, transform .15s; }
.nav-cta:hover { opacity:.88; transform:translateY(-1px); }

/* STRIP */
.strip { background:var(--rb); padding:12px 0; overflow:hidden; }
.mtrack { display:flex; white-space:nowrap; animation:mq 28s linear infinite; }
.mitem { font-family:'Playfair Display',serif; font-style:italic; font-size:14px; color:#fff; padding:0 28px; opacity:.9; }
.mitem::before { content:'✦'; margin-right:16px; opacity:.6; }
@keyframes mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* HERO */
.hero { min-height:100vh; background:#FFFBFF; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; text-align:center; padding:120px 24px 80px; }
.hero-bg-dots { position:absolute; inset:0; pointer-events:none; background-image:radial-gradient(circle,rgba(255,45,139,.08) 1.5px,transparent 1.5px); background-size:32px 32px; }
.hero-arch { position:absolute; bottom:-120px; left:50%; transform:translateX(-50%); width:160vw; height:80vw; border-radius:50%; background:conic-gradient(from 198deg at 50% 100%,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B); opacity:.05; pointer-events:none; }
.cblob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:cbf 10s ease-in-out infinite; }
.cb1 { width:420px; height:420px; background:var(--yellow); opacity:.14; top:-80px; right:-60px; }
.cb2 { width:320px; height:320px; background:var(--pink); opacity:.11; bottom:-60px; left:-60px; animation-delay:-4s; }
.cb3 { width:260px; height:260px; background:var(--blue); opacity:.08; top:30%; left:2%; animation-delay:-6s; }
.cb4 { width:200px; height:200px; background:var(--green); opacity:.09; top:20%; right:5%; animation-delay:-2s; }
@keyframes cbf { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-28px)} 66%{transform:translate(-14px,18px)} }

.fls { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:1; }
.fl { position:absolute; opacity:0; animation:flup 8s ease-in infinite; }
.fl:nth-child(1){left:4%;font-size:26px;animation-delay:0s}
.fl:nth-child(2){left:12%;font-size:18px;animation-delay:-2s;animation-duration:10s}
.fl:nth-child(3){left:72%;font-size:22px;animation-delay:-1s;animation-duration:9s}
.fl:nth-child(4){left:84%;font-size:16px;animation-delay:-4s}
.fl:nth-child(5){left:43%;font-size:14px;animation-delay:-3s;animation-duration:11s}
.fl:nth-child(6){left:27%;font-size:20px;animation-delay:-5s;animation-duration:9s}
.fl:nth-child(7){left:57%;font-size:24px;animation-delay:-1.5s;animation-duration:10s}
.fl:nth-child(8){left:91%;font-size:13px;animation-delay:-3.5s}
@keyframes flup { 0%{opacity:0;transform:translateY(100vh)} 10%{opacity:.7} 90%{opacity:.1} 100%{opacity:0;transform:translateY(-10vh) rotate(15deg)} }

.hero-inner { position:relative; z-index:2; max-width:700px; }
.hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,45,139,.08); border:1px solid rgba(255,45,139,.2); border-radius:100px; padding:6px 16px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--pink); margin-bottom:28px; }
.hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--pink); animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }

.brand { font-family:'Playfair Display',serif; font-size:clamp(52px,10vw,110px); line-height:.88; letter-spacing:-3px; margin-bottom:12px; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:italic; }
.hero-sub-title { font-family:'Playfair Display',serif; font-size:clamp(16px,2.2vw,22px); color:#888; font-style:italic; margin-bottom:16px; line-height:1.5; font-weight:400; }
.hero-desc { font-size:15px; color:#aaa; line-height:1.75; max-width:480px; margin:0 auto 36px; }

.hero-cta-group { display:flex; flex-direction:column; align-items:center; gap:10px; }
.btn-primary { background:var(--rb); color:#fff; font-weight:700; font-size:16px; padding:18px 44px; border-radius:100px; border:none; cursor:none; font-family:'Inter',sans-serif; box-shadow:0 6px 28px rgba(255,45,139,.35); transition:opacity .2s,transform .15s; letter-spacing:.3px; }
.btn-primary:hover { opacity:.88; transform:translateY(-2px); }
.hero-meta { font-size:12px; color:#ccc; font-weight:500; letter-spacing:.5px; }
.hero-meta span { margin:0 6px; }

.scroll-arrow { position:absolute; bottom:28px; left:50%; z-index:2; width:18px; height:18px; border-right:2px solid #ddd; border-bottom:2px solid #ddd; transform:translateX(-50%) rotate(45deg); animation:bnc 2s ease-in-out infinite; }
@keyframes bnc { 0%,100%{transform:translateX(-50%) rotate(45deg) translateY(0)} 50%{transform:translateX(-50%) rotate(45deg) translateY(7px)} }

/* SECTIONS */
.sec { padding:80px 24px; }
.wrap { max-width:900px; margin:0 auto; }
.wsm { max-width:620px; margin:0 auto; }
.tc { text-align:center; }
.bg-white { background:#fff; }
.bg-soft { background:var(--soft); }
.bg-night { background:var(--night); position:relative; overflow:hidden; }
.bg-night::before { content:''; position:absolute; inset:0; background:conic-gradient(from 0deg at 50% 110%,rgba(255,45,139,.15),rgba(255,107,0,.08),rgba(0,200,83,.06),rgba(41,121,255,.08),rgba(255,45,139,.15)); pointer-events:none; }

.sec-label { font-size:10px; letter-spacing:3.5px; text-transform:uppercase; font-weight:700; margin-bottom:14px; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.sec-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3.8vw,42px); line-height:1.12; margin-bottom:16px; color:#222; }
.sec-title em { font-style:italic; color:var(--pink); -webkit-text-fill-color:var(--pink); }
.sec-desc { font-size:15px; color:#aaa; line-height:1.75; max-width:520px; margin:0 auto; }

/* HOW IT WORKS */
.how-steps { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; margin-top:48px; }
.how-step { flex:1; min-width:180px; max-width:240px; text-align:center; padding:36px 24px; background:#fff; border-radius:24px; border:2px solid #f5e8f8; transition:all .25s; }
.how-step:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(255,45,139,.1); border-color:transparent; background:linear-gradient(#fff,#fff) padding-box, var(--rb) border-box; }
.how-step-icon { font-size:40px; margin-bottom:16px; }
.how-step-num { font-family:'Playfair Display',serif; font-size:13px; font-weight:700; color:#ddd; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }
.how-step h3 { font-family:'Playfair Display',serif; font-size:18px; color:#222; margin-bottom:8px; font-style:italic; }
.how-step p { font-size:13px; color:#aaa; line-height:1.65; }

/* MAMACITAS */
.mamacita-grid { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin-top:48px; }
.mamacita-card { flex:1; min-width:240px; max-width:280px; background:#fff; border-radius:28px; border:2px solid #f5e8f8; overflow:hidden; transition:all .28s; cursor:none; }
.mamacita-card:hover { transform:translateY(-6px); box-shadow:0 20px 52px rgba(255,45,139,.14); }
.mc-top { padding:32px 24px 20px; text-align:center; position:relative; }
.mc-avatar { width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#FFD6EC,#FFB3D9); display:flex; align-items:center; justify-content:center; font-size:46px; margin:0 auto 14px; box-shadow:0 6px 20px rgba(255,45,139,.18); }
.mc-name { font-family:'Playfair Display',serif; font-size:22px; font-style:italic; font-weight:700; color:#222; margin-bottom:4px; }
.mc-origin { font-size:12px; color:#bbb; font-weight:600; margin-bottom:12px; }
.mc-live { display:inline-flex; align-items:center; gap:6px; border-radius:100px; padding:4px 14px; font-size:11px; font-weight:700; margin-bottom:14px; }
.mc-live.online { background:#f0fff4; border:1.5px solid #00C853; color:#00A040; }
.mc-live.offline { background:#f5f5f5; border:1.5px solid #eee; color:#bbb; }
.mc-live-dot { width:6px; height:6px; border-radius:50%; }
.mc-live.online .mc-live-dot { background:#00C853; box-shadow:0 0 6px #00C853; }
.mc-live.offline .mc-live-dot { background:#ccc; }
.mc-tags { display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-bottom:14px; }
.mc-tag { background:var(--soft); border-radius:100px; padding:4px 12px; font-size:11px; font-weight:600; color:var(--pink); }
.mc-review { margin:0 24px 20px; background:#fafafa; border-radius:14px; padding:14px 16px; border-left:3px solid var(--pink); }
.mc-review-text { font-size:12px; color:#666; line-height:1.6; font-style:italic; margin-bottom:6px; }
.mc-review-author { font-size:11px; color:#bbb; font-weight:600; }
.mc-review-stars { color:#FFD000; font-size:12px; margin-bottom:4px; }
.mc-footer { padding:0 24px 24px; }
.mc-btn { display:block; width:100%; background:var(--rb); color:#fff; padding:13px; border-radius:100px; font-size:13px; font-weight:700; border:none; cursor:none; font-family:'Inter',sans-serif; text-align:center; transition:opacity .2s; }
.mc-btn:hover { opacity:.88; }

/* MEMBERSHIP */
.membership-card { max-width:460px; margin:40px auto 0; background:#fff; border-radius:32px; padding:44px 40px; border:2px solid transparent; background:linear-gradient(#fff,#fff) padding-box, var(--rb) border-box; box-shadow:0 20px 60px rgba(255,45,139,.12); text-align:center; }
.mem-badge { display:inline-block; background:var(--rb); color:#fff; font-size:9px; letter-spacing:2.5px; text-transform:uppercase; padding:6px 16px; border-radius:100px; font-weight:700; margin-bottom:20px; }
.mem-price-row { margin-bottom:8px; }
.mem-trial { font-family:'Playfair Display',serif; font-size:48px; color:#222; line-height:1; font-weight:700; }
.mem-trial span { font-size:18px; font-weight:400; color:#aaa; font-family:'Inter',sans-serif; }
.mem-then { font-size:13px; color:#bbb; margin-bottom:24px; }
.mem-then strong { color:#555; }
.mem-features { list-style:none; margin-bottom:28px; display:flex; flex-direction:column; gap:10px; text-align:left; }
.mem-features li { display:flex; align-items:center; gap:12px; font-size:14px; color:#555; }
.mem-features li::before { content:'✦'; color:var(--pink); font-size:10px; flex-shrink:0; }
.mem-btn { display:block; width:100%; background:var(--rb); color:#fff; padding:16px; border-radius:100px; font-size:15px; font-weight:700; border:none; cursor:none; font-family:'Inter',sans-serif; box-shadow:0 6px 24px rgba(255,45,139,.3); transition:opacity .2s, transform .15s; margin-bottom:12px; }
.mem-btn:hover { opacity:.88; transform:translateY(-1px); }
.mem-meta { font-size:12px; color:#ccc; }

/* SCARCITY */
.scarcity-bar { background:linear-gradient(135deg,#fff8f0,#fff0f8); border:1.5px solid rgba(255,45,139,.15); border-radius:16px; padding:16px 24px; max-width:480px; margin:24px auto 0; display:flex; align-items:center; gap:12px; justify-content:center; }
.scarcity-bar span { font-size:13px; color:#888; font-weight:500; }
.scarcity-bar strong { color:#222; }

/* FOOTER */
.footer { background:var(--soft); padding:40px 24px; }
.footer-inner { max-width:900px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; }
.footer-logo { font-family:'Playfair Display',serif; font-size:18px; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:italic; font-weight:700; }
.footer-links { display:flex; gap:20px; flex-wrap:wrap; }
.footer-link { font-size:12px; color:#bbb; background:none; border:none; cursor:none; font-family:'Inter',sans-serif; font-weight:500; transition:color .2s; padding:0; }
.footer-link:hover { color:var(--pink); }
.footer-copy { font-size:11px; color:#ddd; width:100%; text-align:center; margin-top:8px; }

/* MODAL */
.modal-ov { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.modal { background:#fff; border-radius:28px; padding:40px 36px; width:100%; max-width:420px; position:relative; box-shadow:0 24px 80px rgba(255,45,139,.15); }
.modal-x { position:absolute; top:16px; right:18px; background:none; border:none; font-size:20px; cursor:none; color:#ccc; }
.modal h2 { font-family:'Playfair Display',serif; font-size:26px; margin-bottom:6px; color:#222; }
.modal-sub { font-size:13px; color:#aaa; margin-bottom:20px; }
.modal-tabs { display:flex; margin-bottom:20px; border-radius:100px; background:#f5f5f5; padding:4px; }
.mtab { flex:1; padding:9px; border:none; background:none; border-radius:100px; font-size:13px; font-weight:600; cursor:none; font-family:'Inter',sans-serif; color:#aaa; transition:all .2s; }
.mtab.act { background:#fff; color:#222; box-shadow:0 2px 8px rgba(0,0,0,.08); }
.google-btn { width:100%; background:#fff; color:#333; font-weight:700; font-size:14px; padding:13px; border-radius:100px; border:2px solid #eee; cursor:none; font-family:'Inter',sans-serif; margin-bottom:4px; display:flex; align-items:center; justify-content:center; gap:10px; transition:border .2s; }
.google-btn:hover { border-color:#ccc; }
.divider { display:flex; align-items:center; gap:12px; margin:14px 0; }
.divider span { font-size:11px; color:#ccc; font-weight:600; white-space:nowrap; }
.divider::before,.divider::after { content:''; flex:1; height:1px; background:#f0f0f0; }
.field { margin-bottom:14px; }
.field label { display:block; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
.field input { width:100%; padding:12px 16px; border:2px solid #f0f0f0; border-radius:12px; font-size:14px; font-family:'Inter',sans-serif; color:#222; outline:none; background:#fafafa; }
.field input:focus { border-color:var(--pink); background:#fff; }
.auth-btn { width:100%; background:var(--rb); color:#fff; font-weight:700; font-size:15px; padding:14px; border-radius:100px; border:none; cursor:none; font-family:'Inter',sans-serif; margin-top:6px; }
.auth-btn:disabled { opacity:.5; }
.msg-err { background:#fff0f5; border:1.5px solid #ffb3d1; border-radius:12px; padding:10px 14px; font-size:12px; color:var(--pink); margin-bottom:12px; font-weight:500; }
.msg-ok { background:#f0fff4; border:1.5px solid #b3ffd1; border-radius:12px; padding:10px 14px; font-size:12px; color:#00A040; margin-bottom:12px; font-weight:500; }

/* DASHBOARD */
.dashboard { padding:48px 24px; max-width:720px; margin:0 auto; }
.dash-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:36px; flex-wrap:wrap; gap:12px; }
.dash-welcome { font-family:'Playfair Display',serif; font-size:28px; color:#222; }
.dash-out { background:#f5f5f5; color:#888; font-size:12px; font-weight:700; padding:9px 18px; border-radius:100px; border:none; cursor:none; font-family:'Inter',sans-serif; }
.dash-out:hover { background:#ffe0ef; color:var(--pink); }
.stats { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:32px; }
.stat { flex:1; min-width:100px; background:#fff; border-radius:18px; padding:20px 18px; border:2px solid #f5e8f8; text-align:center; }
.stat-n { font-family:'Playfair Display',serif; font-size:36px; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
.stat-l { font-size:11px; color:#bbb; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
.sess-hdr { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#ddd; margin-bottom:14px; }
.sess-list { display:flex; flex-direction:column; gap:10px; }
.sess-item { background:#fff; border-radius:16px; padding:16px 20px; border:2px solid #f5e8f8; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.sess-type { font-family:'Playfair Display',serif; font-size:15px; color:#222; font-style:italic; }
.sess-meta { font-size:11px; color:#ccc; margin-top:2px; }
.sess-badge { background:var(--rb); color:#fff; font-size:10px; font-weight:700; padding:4px 12px; border-radius:100px; }
.sess-empty { text-align:center; padding:40px 20px; color:#ccc; font-size:13px; }

/* MAMACITAS PAGE */
.m-hero { min-height:55vh; background:#fff; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:100px 24px 60px; }
.m-arch { position:absolute; top:-100px; left:50%; transform:translateX(-50%); width:140vw; height:100vw; max-width:1600px; border-radius:50%; background:conic-gradient(from 165deg at 50% 0%,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B); opacity:.06; pointer-events:none; }
.m-dots { position:absolute; inset:0; pointer-events:none; background-image:radial-gradient(circle,rgba(156,39,176,.08) 1.5px,transparent 1.5px); background-size:28px 28px; }
.m-brand { font-family:'Playfair Display',serif; font-size:clamp(52px,10vw,110px); line-height:.9; letter-spacing:-3px; font-style:italic; position:relative; z-index:2; background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.m-line { width:240px; height:3px; margin:18px auto 20px; background:var(--rb); border-radius:3px; position:relative; z-index:2; }
.m-sub { font-size:clamp(14px,1.6vw,17px); color:#999; max-width:400px; line-height:1.75; position:relative; z-index:2; }

/* PROFILO MAMACITA */
.profile-page { padding:60px 24px; max-width:700px; margin:0 auto; }
.profile-header { display:flex; gap:28px; align-items:flex-start; flex-wrap:wrap; margin-bottom:36px; }
.profile-avatar { width:110px; height:110px; border-radius:50%; background:linear-gradient(135deg,#FFD6EC,#FFB3D9); display:flex; align-items:center; justify-content:center; font-size:58px; flex-shrink:0; box-shadow:0 8px 28px rgba(255,45,139,.2); }
.profile-info { flex:1; }
.profile-name { font-family:'Playfair Display',serif; font-size:36px; font-style:italic; font-weight:700; color:#222; margin-bottom:6px; }
.profile-origin { font-size:14px; color:#bbb; font-weight:600; margin-bottom:12px; }
.profile-bio { font-size:14px; color:#666; line-height:1.7; margin-bottom:16px; }
.profile-tags { display:flex; gap:8px; flex-wrap:wrap; }
.profile-tag { background:var(--soft); border-radius:100px; padding:5px 14px; font-size:12px; font-weight:600; color:var(--pink); }
.services-grid { display:flex; flex-direction:column; gap:12px; margin-top:28px; }
.service-card { background:#fff; border-radius:16px; padding:18px 22px; border:2px solid #f5e8f8; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.service-name { font-size:14px; font-weight:600; color:#222; }
.service-price { font-family:'Playfair Display',serif; font-size:20px; color:var(--pink); font-weight:700; }
.service-btn { background:var(--rb); color:#fff; font-size:12px; font-weight:700; padding:9px 20px; border-radius:100px; border:none; cursor:none; font-family:'Inter',sans-serif; white-space:nowrap; }

/* TOAST */
.toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#222; color:#fff; font-size:13px; font-weight:600; padding:12px 24px; border-radius:100px; z-index:9999; pointer-events:none; white-space:nowrap; }

/* GRAD */
.grad { background:var(--rb); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

function Strip({ items }) {
  const d = [...items, ...items];
  return (
    <div className="strip">
      <div className="mtrack">
        {d.map((t, i) => <span key={i} className="mitem">{t}</span>)}
      </div>
    </div>
  );
}

function Blobs() {
  return <>{[1,2,3,4].map(i => <div key={i} className={`cblob cb${i}`}/>)}</>;
}

function Floats({ emojis }) {
  return (
    <div className="fls">
      {emojis.map((e, i) => <span key={i} className="fl">{e}</span>)}
    </div>
  );
}

function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async () => {
    setErr(""); setOk("");
    if (!email || !pwd) { setErr("Fill in all fields."); return; }
    if (pwd.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    if (tab === "login") {
      const data = await apiSignIn(email, pwd);
      if (data.error) { setErr(data.error); setLoading(false); return; }
      onLogin({ email: data.user?.email || email, token: data.access_token });
      onClose();
    } else {
      const data = await apiSignUp(email, pwd);
      if (data.error) { setErr(data.error); setLoading(false); return; }
      setOk("✅ Account created! Check your email to confirm.");
    }
    setLoading(false);
  };

  const googleLogin = () => {
    window.open(
      `${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.href)}`,
      "_blank", "width=500,height=600,left=200,top=100"
    );
  };

  return (
    <div className="modal-ov" onClick={e => e.target.classList.contains("modal-ov") && onClose()}>
      <div className="modal">
        <button className="modal-x" onClick={onClose}>✕</button>
        <h2>Welcome 🎭</h2>
        <p className="modal-sub">Sign in to access the Mamacitas</p>
        <button className="google-btn" onClick={googleLogin}><GoogleIcon />Continue with Google</button>
        <div className="divider"><span>or</span></div>
        <div className="modal-tabs">
          <button className={`mtab${tab === "login" ? " act" : ""}`} onClick={() => { setTab("login"); setErr(""); setOk(""); }}>Sign in</button>
          <button className={`mtab${tab === "signup" ? " act" : ""}`} onClick={() => { setTab("signup"); setErr(""); setOk(""); }}>Register</button>
        </div>
        {err && <div className="msg-err">{err}</div>}
        {ok && <div className="msg-ok">{ok}</div>}
        <div className="field"><label>Email</label><input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} /></div>
        <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} /></div>
        <button className="auth-btn" onClick={submit} disabled={loading}>{loading ? "..." : tab === "login" ? "Sign in →" : "Create account →"}</button>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, onBook }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiGetSessions(user.token).then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);
  const spent = sessions.reduce((s, r) => s + (r.price || 0), 0);
  return (
    <div className="dashboard">
      <div className="dash-hdr">
        <div>
          <div className="sec-label">Personal area</div>
          <div className="dash-welcome">Hi, <span className="grad">{user.email.split("@")[0]}</span> 👋</div>
        </div>
        <button className="dash-out" onClick={onLogout}>Sign out →</button>
      </div>
      <div className="stats">
        {[[sessions.length, "Sessions"], [`€${spent}`, "Spent"], [sessions.filter(s => s.status === "confirmed").length, "Confirmed"]].map(([n, l]) => (
          <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
        ))}
      </div>
      <div className="sess-hdr">Session history</div>
      {loading ? <p style={{ color: "#ccc", fontSize: 13, padding: "20px 0" }}>Loading...</p>
        : sessions.length === 0
          ? <div className="sess-empty"><div style={{ fontSize: 36, marginBottom: 10 }}>🎭</div>No sessions yet. Book your first one!</div>
          : <div className="sess-list">{sessions.map(s => (
            <div key={s.id} className="sess-item">
              <div><div className="sess-type">{s.type || "Session"}</div><div className="sess-meta">{s.duration || ""} · {new Date(s.booked_at).toLocaleDateString("en-GB")}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{s.price && <span style={{ fontWeight: 700, fontSize: 14 }}>€{s.price}</span>}<span className="sess-badge">{s.status}</span></div>
            </div>
          ))}</div>
      }
      <button className="btn-primary" style={{ marginTop: 24, width: "100%" }} onClick={onBook}>+ Book a new session 🌶</button>
    </div>
  );
}

function ProfilePage({ tutor, onBack, onBook, user, onShowAuth }) {
  return (
    <div className="profile-page">
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "none", color: "#bbb", fontSize: 13, fontWeight: 600, marginBottom: 24, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif" }}>
        ← Back to Mamacitas
      </button>
      <div className="profile-header">
        <div className="profile-avatar">{tutor.avatar}</div>
        <div className="profile-info">
          <div className="profile-name">{tutor.name}</div>
          <div className="profile-origin">{tutor.flag} {tutor.origin} · {tutor.age} years old</div>
          <p className="profile-bio">{tutor.personality}</p>
          <div className="profile-tags">
            {tutor.tags.map(t => <span key={t} className="profile-tag">{t}</span>)}
          </div>
        </div>
      </div>

      {!user ? (
        <div style={{ background: "var(--soft)", borderRadius: 24, padding: "40px 32px", textAlign: "center", border: "2px dashed #f5c6e0" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 10, color: "#222" }}>Members only</div>
          <p style={{ fontSize: 14, color: "#aaa", marginBottom: 24, lineHeight: 1.7 }}>Start your free 7-day trial to book sessions with {tutor.name}.</p>
          <button className="btn-primary" onClick={() => window.location.href = STRIPE_TRIAL_LINK}>Start free trial →</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <div className="sec-label" style={{ marginBottom: 16 }}>Services & Pricing</div>
            <div className="services-grid">
              {tutor.services.map(s => (
                <div key={s.name} className="service-card">
                  <div className="service-name">{s.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="service-price">{s.price}</div>
                    <button className="service-btn" onClick={onBook}>Book →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tutor.live && (
            <div style={{ marginTop: 24, background: "linear-gradient(135deg,#f0fff4,#e8f5e9)", borderRadius: 20, padding: "20px 24px", border: "1.5px solid #00C853", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C853", display: "inline-block", boxShadow: "0 0 8px #00C853" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#00A040" }}>Available Now</span>
                </div>
                <p style={{ fontSize: 12, color: "#666" }}>{tutor.name} is online. Start an instant conversation.</p>
              </div>
              <button className="btn-primary" style={{ padding: "12px 24px", fontSize: 13 }} onClick={onBook}>
                Start now →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const STRIP_ITEMS = [
  "Private Spanish Conversations",
  "One-to-One with Mamacitas",
  "From Latin America & Spain",
  "Fun · Natural · Real",
  "Available Now",
  "Book a Private Session",
  "¡Hola Mamacita!",
  "Start your free trial today",
];

export default function App() {
  const [page, setPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("hm_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("hm_user", JSON.stringify(user));
    else localStorage.removeItem("hm_user");
  }, [user]);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "peach-cursor"; el.textContent = "🍑";
    Object.assign(el.style, { position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999, fontSize: "28px", transform: "translate(-50%,-50%)", userSelect: "none", lineHeight: 1, transition: "left 0.05s ease-out, top 0.05s ease-out" });
    document.body.appendChild(el);
    const move = e => { el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px"; };
    window.addEventListener("mousemove", move);
    document.body.style.cursor = "none";
    return () => { window.removeEventListener("mousemove", move); el.remove(); document.body.style.cursor = ""; };
  }, []);

  const toast = m => { setToastMsg(m); setTimeout(() => setToastMsg(""), 2800); };
  const go = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "instant" }); };
  const goAnchor = (anchor) => {
    setPage("home");
    setTimeout(() => document.getElementById("sec-" + anchor)?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const handleTrialClick = () => {
    if (STRIPE_TRIAL_LINK === "STRIPE_TRIAL_LINK") {
      toast("⚙️ Stripe trial link not configured yet.");
      return;
    }
    window.location.href = STRIPE_TRIAL_LINK;
  };

  const Nav = () => (
    <nav className="nav">
      <div className="nav-rb" />
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => go("home")}>Hola Mamacita</button>
        <div className="nav-links">
          <button className="nav-link" onClick={() => go("home")}>Home</button>
          <button className="nav-link" onClick={() => go("mamacitas")}>Mamacitas</button>
          <button className="nav-link" onClick={() => goAnchor("membership")}>Membership</button>
          {user
            ? <>
              <button className="nav-link" onClick={() => go("dashboard")}>👤 {user.email.split("@")[0]}</button>
              <button className="nav-cta" onClick={() => go("mamacitas")}>Browse Mamacitas 🌶</button>
            </>
            : <>
              <button className="nav-link" onClick={() => setShowAuth(true)}>Sign in</button>
              <button className="nav-cta" onClick={handleTrialClick}>Start Free Trial 🌶</button>
            </>
          }
        </div>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">Hola Mamacita 🌶</div>
        <div className="footer-links">
          <button className="footer-link" onClick={() => toast("Coming soon")}>About</button>
          <button className="footer-link" onClick={() => toast("Coming soon")}>Terms</button>
          <button className="footer-link" onClick={() => toast("Coming soon")}>Privacy</button>
          <button className="footer-link" onClick={() => toast("Coming soon")}>Become a Mamacita</button>
        </div>
        <div className="footer-copy">© 2025 Hola Mamacita · Private Conversational Spanish Experience</div>
      </div>
    </footer>
  );

  return (
    <>
      <style>{css}</style>
      <Nav />
      {toastMsg && <div className="toast">{toastMsg}</div>}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => { setUser(u); toast("🎉 Welcome back!"); }} />}

      {/* DASHBOARD */}
      {page === "dashboard" && user && (
        <Dashboard user={user} onLogout={() => { setUser(null); toast("👋 Signed out!"); go("home"); }} onBook={() => go("mamacitas")} />
      )}

      {/* PROFILO MAMACITA */}
      {page === "profile" && selectedTutor && (
        <ProfilePage
          tutor={selectedTutor}
          onBack={() => go("mamacitas")}
          onBook={() => toast("🔗 Calendly integration coming soon!")}
          user={user}
          onShowAuth={() => setShowAuth(true)}
        />
      )}

      {/* MAMACITAS PAGE */}
      {page === "mamacitas" && (
        <>
          <section className="m-hero">
            <div className="m-arch" /><div className="m-dots" />
            <Blobs />
            <Floats emojis={["🎭", "💃", "🌺", "🔥", "✨", "🌴", "🎉", "🍹"]} />
            <div className="m-brand" style={{ position: "relative", zIndex: 2 }}>Mamacitas</div>
            <div className="m-line" />
            <p className="m-sub">Charismatic. Latina. Native speakers.<br />Choose yours and start speaking.</p>
          </section>
          <Strip items={["Playful", "Confident", "Native speakers", "From Latin America & Spain", "Available Now", "¡Vámonos!", "Real conversations only"]} />
          <div className="sec bg-white">
            <div className="wrap">
              <div className="tc" style={{ marginBottom: 48 }}>
                <div className="sec-label">Our Mamacitas</div>
                <h2 className="sec-title">Meet the <em>Mamacitas</em></h2>
                <p className="sec-desc">All native speakers · Handpicked · Sessions via Zoom</p>
              </div>
              <div className="mamacita-grid">
                {TUTORS.map(tutor => (
                  <div key={tutor.name} className="mamacita-card">
                    <div className="mc-top">
                      <div className="mc-avatar">{tutor.avatar}</div>
                      <div className="mc-name">{tutor.name}</div>
                      <div className="mc-origin">{tutor.flag} {tutor.origin}</div>
                      <div className={`mc-live ${tutor.live ? "online" : "offline"}`}>
                        <span className="mc-live-dot" />
                        {tutor.live ? "Available Now" : "Offline"}
                      </div>
                      <div className="mc-tags">
                        {tutor.tags.map(t => <span key={t} className="mc-tag">{t}</span>)}
                      </div>
                    </div>
                    <div className="mc-review">
                      <div className="mc-review-stars">{"★".repeat(Math.floor(tutor.rating))}</div>
                      <div className="mc-review-text">"{tutor.reviews[0].text}"</div>
                      <div className="mc-review-author">— {tutor.reviews[0].author}</div>
                    </div>
                    <div className="mc-footer">
                      <button className="mc-btn" onClick={() => { setSelectedTutor(tutor); go("profile"); }}>
                        View profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="sec bg-night tc" style={{ position: "relative" }}>
            <div className="wsm" style={{ position: "relative", zIndex: 1 }}>
              <h2 className="sec-title" style={{ color: "#fff" }}>Don't wait for your <em style={{ color: "var(--yellow)", WebkitTextFillColor: "var(--yellow)" }}>Mamacita</em>.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: "14px auto 28px", maxWidth: 340, lineHeight: 1.7 }}>Sessions start now. Join the club.</p>
              <button className="btn-primary" onClick={handleTrialClick}>Start free trial 🎭</button>
            </div>
          </div>
          <Footer />
        </>
      )}

      {/* HOME */}
      {page === "home" && (
        <>
          {/* HERO */}
          <section className="hero">
            <div className="hero-bg-dots" />
            <div className="hero-arch" />
            <Blobs />
            <Floats emojis={["🌶", "🌺", "✨", "🌴", "💃", "🔥", "🎉", "🍹"]} />
            <div className="hero-inner">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Private Spanish Experience
              </div>
              <div className="brand">Hola Mamacita</div>
              <div className="hero-sub-title">Practice Spanish with a Mamacita</div>
              <p className="hero-desc">
                Private one-to-one Spanish conversations with Latina Mamacitas.<br />
                Fun, natural and real.
              </p>
              <div className="hero-cta-group">
                <button className="btn-primary" onClick={handleTrialClick}>
                  Start Free 7-Day Trial →
                </button>
                <div className="hero-meta">
                  No commitment <span>·</span> Cancel anytime <span>·</span> No credit card needed to explore
                </div>
              </div>
            </div>
            <div className="scroll-arrow" />
          </section>

          <Strip items={STRIP_ITEMS} />

          {/* HOW IT WORKS */}
          <div className="sec bg-soft tc" id="sec-how">
            <div className="wrap">
              <div className="sec-label">How it works</div>
              <h2 className="sec-title">How <em>Hola Mamacita</em> Works</h2>
              <p className="sec-desc">
                Join the club and start practicing Spanish with Mamacitas from Latin America and Spain.
                Choose a Mamacita, start an instant conversation or book a private session.
              </p>
              <div className="how-steps">
                <div className="how-step">
                  <div className="how-step-icon">🎭</div>
                  <div className="how-step-num">Step 01</div>
                  <h3>Join the club</h3>
                  <p>Start your free 7-day trial. No commitment, cancel anytime.</p>
                </div>
                <div className="how-step">
                  <div className="how-step-icon">💃</div>
                  <div className="how-step-num">Step 02</div>
                  <h3>Choose your Mamacita</h3>
                  <p>Browse profiles, pick your favourite or go for an instant call.</p>
                </div>
                <div className="how-step">
                  <div className="how-step-icon">🌶</div>
                  <div className="how-step-num">Step 03</div>
                  <h3>Start your conversation</h3>
                  <p>Talk Spanish. For real. No scripts, no textbooks, just conversation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* MEET THE MAMACITAS */}
          <div className="sec bg-white tc" id="sec-mamacitas">
            <div className="wrap">
              <div className="sec-label">The Mamacitas</div>
              <h2 className="sec-title">Meet the <em>Mamacitas</em></h2>
              <p className="sec-desc">Native speakers from Latin America and Spain. Handpicked for their energy, charisma and conversational skills.</p>
              <div className="mamacita-grid">
                {TUTORS.map(tutor => (
                  <div key={tutor.name} className="mamacita-card">
                    <div className="mc-top">
                      <div className="mc-avatar">{tutor.avatar}</div>
                      <div className="mc-name">{tutor.name}</div>
                      <div className="mc-origin">{tutor.flag} {tutor.origin}</div>
                      <div className={`mc-live ${tutor.live ? "online" : "offline"}`}>
                        <span className="mc-live-dot" />
                        {tutor.live ? "Available Now" : "Offline"}
                      </div>
                      <div className="mc-tags">
                        {tutor.tags.map(t => <span key={t} className="mc-tag">{t}</span>)}
                      </div>
                    </div>
                    <div className="mc-review">
                      <div className="mc-review-stars">{"★".repeat(Math.floor(tutor.rating))}</div>
                      <div className="mc-review-text">"{tutor.reviews[0].text}"</div>
                      <div className="mc-review-author">— {tutor.reviews[0].author}</div>
                    </div>
                    <div className="mc-footer">
                      <button className="mc-btn" onClick={() => { setSelectedTutor(tutor); go("profile"); }}>
                        View profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MEMBERSHIP */}
          <div className="sec bg-soft tc" id="sec-membership">
            <div className="wrap">
              <div className="sec-label">Membership</div>
              <h2 className="sec-title">Join <em>Hola Mamacita</em></h2>
              <p className="sec-desc">One membership. Unlimited access to all Mamacitas, instant conversations and private bookings.</p>
              <div className="membership-card">
                <div className="mem-badge">✦ Free Trial</div>
                <div className="mem-price-row">
                  <div className="mem-trial">Free <span>for 7 days</span></div>
                </div>
                <div className="mem-then">Then <strong>9.99€ / month</strong> · Cancel anytime</div>
                <ul className="mem-features">
                  <li>Access to all Mamacitas</li>
                  <li>Instant conversations (Available Now)</li>
                  <li>Private session bookings</li>
                  <li>Mamacita profiles & content</li>
                </ul>
                <button className="mem-btn" onClick={handleTrialClick}>
                  Start free trial →
                </button>
                <div className="mem-meta">No commitment · Cancel anytime · Secure payment</div>
              </div>
              <div className="scarcity-bar">
                <span>⚡</span>
                <span>Only a <strong>limited number of Mamacitas</strong> are available each day.</span>
              </div>
            </div>
          </div>

          <Footer />
        </>
      )}
    </>
  );
}

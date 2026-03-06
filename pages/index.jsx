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
    if (!r.ok) return { error: d.error_description || d.msg || "Invalid credentials" };
    return d;
  } catch(e) { return { error: "Network error. Please try again." }; }
}

async function apiSignUp(email, password) {
  try {
    const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
      method: "POST", headers: H(), body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) return { error: d.error_description || d.msg || "Registration error" };
    return d;
  } catch(e) { return { error: "Network error. Please try again." }; }
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
    live:true, sessions:142, age:27,
    tags:["Playful","Beginner friendly","High energy"],
    rating:4.9,
    reviews:[{text:"I learned more in 30 min with Valentina than months on Duolingo!", author:"Marco R."}],
    personality:"Bubbly, energetic and always ready to laugh. Loves salsa, Colombian coffee and teaching with real life stories.",
    color:"#FF2D8B",
    services:[{name:"30 min conversation",price:"15€"},{name:"60 min conversation",price:"25€"},{name:"Instant call",price:"10€"}]
  },
  {
    name:"Sofía", flag:"🇲🇽", origin:"Mexico", avatar:"👩🏻‍🦱",
    live:false, sessions:98, age:25,
    tags:["Confident","Cultural","Fun"],
    rating:4.8,
    reviews:[{text:"Sofía made me fall even more in love with Mexico. Super fun session!", author:"Luca M."}],
    personality:"Creative and curious, loves cinema, tacos and deep conversations. Turns every lesson into a cultural trip.",
    color:"#FF6B00",
    services:[{name:"30 min conversation",price:"15€"},{name:"Flirty Spanish",price:"20€"},{name:"Instant call",price:"10€"}]
  },
  {
    name:"Camila", flag:"🇦🇷", origin:"Argentina", avatar:"👩🏼‍🦰",
    live:true, sessions:210, age:29,
    tags:["Direct","Advanced","Passionate"],
    rating:5.0,
    reviews:[{text:"Camila is a true professional. Her method is unique — you learn without even realising it.", author:"Andrea F."}],
    personality:"Direct, passionate and with sharp humor. Loves tango, Borges and challenging her students to leave their comfort zone.",
    color:"#2979FF",
    services:[{name:"30 min conversation",price:"18€"},{name:"60 min conversation",price:"30€"},{name:"Instant call",price:"12€"}]
  },
];

const STRIP_ITEMS = ["Private Spanish Conversations","One-to-One with Mamacitas","From Latin America & Spain","Fun · Natural · Real","Available Now","Book a Private Session","¡Hola Mamacita!"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

:root{
  --pink:#FF2D8B;--orange:#FF6B00;--yellow:#FFD000;--green:#00C853;--blue:#2979FF;
  --rb:linear-gradient(135deg,#FF2D8B 0%,#FF6B00 25%,#FFD000 50%,#00C853 75%,#2979FF 100%);
  --rb2:linear-gradient(90deg,#FF2D8B,#FF6B00,#FFD000,#00C853,#2979FF,#9C27B0,#FF2D8B);
  --cream:#FFFBF5;--warm:#FFF6ED;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:#1a1a1a;overflow-x:hidden;cursor:none}

#hm-cursor{position:fixed;top:0;left:0;pointer-events:none;z-index:99999;font-size:26px;transform:translate(-50%,-50%);user-select:none;line-height:1;transition:left .04s ease-out,top .04s ease-out}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:500;transition:all .3s}
.nav.scrolled{background:rgba(255,251,245,.94);backdrop-filter:blur(16px);box-shadow:0 1px 0 rgba(0,0,0,.06)}
.nav-rb{height:3px;background:var(--rb2)}
.nav-inner{padding:0 40px;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-logo{font-family:'Playfair Display',serif;font-size:19px;border:none;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;padding:0;cursor:none;font-style:italic}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-link{color:rgba(26,26,26,.4);font-size:13px;background:none;border:none;cursor:none;font-family:'DM Sans',sans-serif;transition:color .2s;padding:0;font-weight:500}
.nav-link:hover{color:#1a1a1a}
.nav-cta{background:var(--rb);color:#fff;font-weight:600;font-size:13px;padding:11px 26px;border-radius:100px;border:none;cursor:none;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(255,45,139,.32);transition:all .2s}
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,45,139,.4)}

/* STRIP */
.strip{background:var(--rb);padding:11px 0;overflow:hidden}
.mtrack{display:flex;white-space:nowrap;animation:mq 30s linear infinite}
.mitem{font-family:'Playfair Display',serif;font-style:italic;font-size:13px;color:rgba(255,255,255,.9);padding:0 32px}
.mitem::before{content:'✦';margin-right:18px;opacity:.5;font-style:normal;font-size:10px}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* HERO */
.hero{min-height:100vh;background:var(--cream);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;padding:140px 24px 100px}
.hero::before{content:'';position:absolute;inset:0;background:
  radial-gradient(ellipse 80% 60% at 15% 20%,rgba(255,107,0,.11) 0%,transparent 60%),
  radial-gradient(ellipse 60% 50% at 85% 15%,rgba(255,45,139,.09) 0%,transparent 55%),
  radial-gradient(ellipse 70% 60% at 50% 90%,rgba(255,208,0,.09) 0%,transparent 60%),
  radial-gradient(ellipse 50% 40% at 90% 75%,rgba(0,200,83,.06) 0%,transparent 50%);
pointer-events:none;z-index:0}

/* Geometric circles */
.hs{position:absolute;pointer-events:none;z-index:0;border-radius:50%}
.hs1{width:340px;height:340px;border:1.5px solid rgba(255,45,139,.09);top:-100px;right:6%;animation:rot 44s linear infinite}
.hs2{width:230px;height:230px;border:1px solid rgba(255,107,0,.1);top:8%;right:4%;animation:rot 30s linear infinite reverse}
.hs3{width:180px;height:180px;border:1px solid rgba(255,208,0,.12);bottom:12%;left:4%;animation:rot 38s linear infinite}
.hs4{width:72px;height:72px;background:rgba(255,45,139,.06);top:26%;left:7%;animation:bob 6s ease-in-out infinite}
.hs5{width:48px;height:48px;background:rgba(255,107,0,.07);bottom:26%;right:9%;animation:bob 8s ease-in-out infinite;animation-delay:-3s}
.dot1{width:10px;height:10px;background:var(--pink);opacity:.55;top:40%;left:14%;animation:bob 4.5s ease-in-out infinite}
.dot2{width:7px;height:7px;background:var(--orange);opacity:.6;top:18%;right:20%;animation:bob 5.5s ease-in-out infinite;animation-delay:-2s}
.dot3{width:8px;height:8px;background:var(--yellow);opacity:.55;bottom:33%;left:17%;animation:bob 7s ease-in-out infinite;animation-delay:-1s}
@keyframes rot{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}

.fls{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1}
.fl{position:absolute;opacity:0;animation:flup 9s ease-in infinite;font-size:19px}
.fl:nth-child(1){left:3%;animation-delay:0s}
.fl:nth-child(2){left:11%;font-size:14px;animation-delay:-3s;animation-duration:11s}
.fl:nth-child(3){left:74%;font-size:17px;animation-delay:-1.5s;animation-duration:10s}
.fl:nth-child(4){left:86%;font-size:13px;animation-delay:-5s}
.fl:nth-child(5){left:45%;font-size:12px;animation-delay:-4s;animation-duration:12s}
.fl:nth-child(6){left:28%;font-size:16px;animation-delay:-6s;animation-duration:10s}
.fl:nth-child(7){left:60%;font-size:20px;animation-delay:-2s;animation-duration:11s}
.fl:nth-child(8){left:92%;font-size:11px;animation-delay:-4.5s}
@keyframes flup{0%{opacity:0;transform:translateY(100vh) rotate(-10deg)}8%{opacity:.55}88%{opacity:.08}100%{opacity:0;transform:translateY(-12vh) rotate(12deg)}}

.hero-inner{position:relative;z-index:2;max-width:720px}
.hero-inner>*{opacity:0;animation:fadeUp .9s cubic-bezier(.22,1,.36,1) forwards}
.hero-badge{animation-delay:.1s}
.brand{animation-delay:.26s}
.hero-tagline{animation-delay:.42s}
.hero-desc{animation-delay:.55s}
.hero-cta-group{animation-delay:.67s}
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}

.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,45,139,.06);border:1.5px solid rgba(255,45,139,.16);border-radius:100px;padding:7px 18px;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:var(--pink);margin-bottom:24px}
.hb-dot{width:6px;height:6px;border-radius:50%;background:var(--pink);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}

.brand{font-family:'Playfair Display',serif;font-size:clamp(52px,10.5vw,116px);line-height:.86;letter-spacing:-4px;margin-bottom:10px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic}
.brand-under{display:block;width:55%;height:3px;background:var(--rb);border-radius:3px;margin:14px auto 0;opacity:.35}

.hero-tagline{font-family:'Playfair Display',serif;font-size:clamp(16px,2.3vw,23px);color:#666;font-style:italic;margin:22px 0 12px;font-weight:400;line-height:1.4;letter-spacing:-.2px}
.hero-desc{font-size:15px;color:#aaa;line-height:1.8;max-width:460px;margin:0 auto 40px;font-weight:300}

.hero-cta-group{display:flex;flex-direction:column;align-items:center;gap:12px}
.btn-hero{background:var(--rb);color:#fff;font-weight:600;font-size:16px;padding:18px 52px;border-radius:100px;border:none;cursor:none;font-family:'DM Sans',sans-serif;box-shadow:0 8px 36px rgba(255,45,139,.36),0 2px 8px rgba(255,107,0,.18);transition:all .25s;letter-spacing:.2px;position:relative;overflow:hidden}
.btn-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent);border-radius:100px;pointer-events:none}
.btn-hero:hover{transform:translateY(-3px);box-shadow:0 14px 44px rgba(255,45,139,.44),0 4px 12px rgba(255,107,0,.22)}
.hero-meta{font-size:12px;color:#ccc;font-weight:300;letter-spacing:.3px}
.hero-meta span{margin:0 7px;opacity:.4}

.scroll-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;animation:fadeUp .8s .9s forwards}
.scroll-hint-text{font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#ccc;font-weight:500}
.scroll-arrow{width:16px;height:16px;border-right:2px solid #ddd;border-bottom:2px solid #ddd;transform:rotate(45deg);animation:bnc 2s ease-in-out infinite}
@keyframes bnc{0%,100%{transform:rotate(45deg) translateY(0)}50%{transform:rotate(45deg) translateY(5px)}}

/* SECTIONS */
.sec{padding:88px 24px}
.wrap{max-width:960px;margin:0 auto}
.wsm{max-width:640px;margin:0 auto}
.tc{text-align:center}
.bg-cream{background:var(--cream)}
.bg-warm{background:var(--warm)}
.bg-white{background:#fff}

.sec-label{font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:600;margin-bottom:14px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sec-title{font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,46px);line-height:1.08;margin-bottom:18px;color:#1a1a1a;letter-spacing:-1px}
.sec-title em{font-style:italic;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sec-desc{font-size:15px;color:#aaa;line-height:1.8;max-width:520px;margin:0 auto;font-weight:300}

/* HOW IT WORKS */
.how-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-top:52px}
.how-card{background:#fff;border-radius:28px;padding:40px 28px 32px;border:1.5px solid rgba(0,0,0,.05);transition:all .3s;position:relative;overflow:hidden}
.how-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(0,0,0,.07);border-color:rgba(255,45,139,.12)}
.how-num{font-family:'Playfair Display',serif;font-size:72px;line-height:1;font-style:italic;font-weight:700;margin-bottom:14px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:.15}
.how-icon{font-size:34px;margin-bottom:14px;display:block}
.how-card h3{font-family:'Playfair Display',serif;font-size:19px;color:#1a1a1a;margin-bottom:10px;font-style:italic}
.how-card p{font-size:13px;color:#aaa;line-height:1.7;font-weight:300}

/* MAMACITA CARDS */
.mamacita-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:24px;margin-top:52px}
.mc{background:#fff;border-radius:32px;overflow:hidden;transition:all .32s cubic-bezier(.22,1,.36,1);cursor:none;border:1.5px solid rgba(0,0,0,.05)}
.mc:hover{transform:translateY(-8px);box-shadow:0 28px 72px rgba(0,0,0,.1);border-color:rgba(255,45,139,.1)}
.mc-color-bar{height:4px;width:100%;background:var(--rb)}
.mc-body{padding:32px 28px 22px;text-align:center}
.mc-avatar-wrap{position:relative;display:inline-block;margin-bottom:18px}
.mc-avatar{width:94px;height:94px;border-radius:50%;background:linear-gradient(135deg,#FFE4F3,#FFD0E8);display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 8px 28px rgba(255,45,139,.15);transition:transform .3s}
.mc:hover .mc-avatar{transform:scale(1.07)}
.mc-live-badge{position:absolute;bottom:2px;right:2px;width:22px;height:22px;border-radius:50%;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center}
.mc-live-badge.on{background:#00C853;box-shadow:0 0 8px rgba(0,200,83,.55)}
.mc-live-badge.off{background:#ddd}
.mc-live-badge span{width:7px;height:7px;border-radius:50%;background:#fff}
.mc-name{font-family:'Playfair Display',serif;font-size:24px;font-style:italic;font-weight:700;color:#1a1a1a;margin-bottom:4px;letter-spacing:-.3px}
.mc-origin{font-size:12px;color:#bbb;font-weight:400;margin-bottom:14px;letter-spacing:.3px}
.mc-tags{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:18px}
.mc-tag{background:var(--warm);border-radius:100px;padding:5px 13px;font-size:11px;font-weight:500;color:#888}
.mc-tag:first-child{background:rgba(255,45,139,.07);color:var(--pink)}
.mc-review{background:var(--warm);border-radius:16px;padding:16px 18px;margin-bottom:20px;position:relative}
.mc-review::before{content:'"';position:absolute;top:-6px;left:14px;font-family:'Playfair Display',serif;font-size:52px;color:rgba(255,45,139,.1);line-height:1;pointer-events:none}
.mc-review-stars{color:#FFB800;font-size:11px;margin-bottom:6px;letter-spacing:1px}
.mc-review-text{font-size:12px;color:#777;line-height:1.65;font-style:italic;margin-bottom:6px;position:relative;z-index:1}
.mc-review-author{font-size:11px;color:#bbb;font-weight:500}
.mc-footer{padding:0 28px 28px}
.mc-btn{display:block;width:100%;background:var(--rb);color:#fff;padding:14px;border-radius:100px;font-size:13px;font-weight:600;border:none;cursor:none;font-family:'DM Sans',sans-serif;transition:all .22s;box-shadow:0 4px 16px rgba(255,45,139,.18)}
.mc-btn:hover{box-shadow:0 8px 28px rgba(255,45,139,.32);transform:translateY(-1px)}

/* MEMBERSHIP */
.mem-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:820px;margin:48px auto 0;border-radius:32px;overflow:hidden;box-shadow:0 24px 72px rgba(0,0,0,.1)}
.mem-left{background:var(--rb);padding:52px 44px;color:#fff;position:relative;overflow:hidden}
.mem-left::before{content:'';position:absolute;top:-80px;right:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none}
.mem-left::after{content:'';position:absolute;bottom:-50px;left:-50px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
.mem-badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:100px;padding:6px 16px;font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:24px;position:relative;z-index:1}
.mem-price{font-family:'Playfair Display',serif;font-size:68px;font-weight:700;line-height:1;margin-bottom:4px;position:relative;z-index:1}
.mem-price sub{font-size:18px;vertical-align:baseline;font-family:'DM Sans',sans-serif;font-weight:300;opacity:.75}
.mem-period{font-size:14px;opacity:.72;margin-bottom:6px;position:relative;z-index:1;font-weight:300}
.mem-then{font-size:13px;opacity:.58;margin-bottom:32px;position:relative;z-index:1;font-weight:300}
.mem-desc{font-size:16px;line-height:1.68;opacity:.88;position:relative;z-index:1;font-style:italic;font-family:'Playfair Display',serif}
.mem-right{background:#fff;padding:52px 44px;display:flex;flex-direction:column;justify-content:space-between}
.mem-features{list-style:none;display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
.mem-features li{display:flex;align-items:center;gap:14px;font-size:14px;color:#555;font-weight:400}
.mem-feat-icon{width:32px;height:32px;border-radius:50%;background:var(--warm);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.mem-btn{display:block;width:100%;background:var(--rb);color:#fff;padding:17px;border-radius:100px;font-size:15px;font-weight:600;border:none;cursor:none;font-family:'DM Sans',sans-serif;box-shadow:0 6px 28px rgba(255,45,139,.28);transition:all .25s;text-align:center;margin-bottom:12px}
.mem-btn:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(255,45,139,.4)}
.mem-meta{font-size:12px;color:#ccc;text-align:center;font-weight:300}
@media(max-width:620px){.mem-wrap{grid-template-columns:1fr}.mem-left,.mem-right{padding:38px 28px}.mem-price{font-size:54px}}

.scarcity{display:flex;align-items:center;justify-content:center;gap:12px;margin:20px auto 0;padding:14px 28px;background:rgba(255,45,139,.04);border:1.5px solid rgba(255,45,139,.1);border-radius:100px;max-width:430px}
.scarcity-dot{width:8px;height:8px;border-radius:50%;background:var(--pink);animation:pulse 2s ease-in-out infinite;flex-shrink:0}
.scarcity span{font-size:13px;color:#888;font-weight:300}
.scarcity strong{color:#1a1a1a;font-weight:600}

/* FOOTER */
.footer{background:#1a1a1a;padding:52px 40px 36px}
.footer-inner{max-width:960px;margin:0 auto}
.footer-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:28px;margin-bottom:40px}
.footer-logo{font-family:'Playfair Display',serif;font-size:20px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic;font-weight:700;margin-bottom:10px}
.footer-tagline{font-size:12px;color:rgba(255,255,255,.22);max-width:220px;line-height:1.7;font-weight:300}
.footer-links{display:flex;gap:20px;flex-wrap:wrap;align-items:center}
.footer-link{font-size:12px;color:rgba(255,255,255,.28);background:none;border:none;cursor:none;font-family:'DM Sans',sans-serif;font-weight:400;transition:color .2s;padding:0}
.footer-link:hover{color:rgba(255,255,255,.65)}
.footer-bottom{border-top:1px solid rgba(255,255,255,.07);padding-top:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.footer-copy{font-size:11px;color:rgba(255,255,255,.18);font-weight:300}
.footer-rb{height:2px;width:72px;background:var(--rb);border-radius:2px;opacity:.45}

/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:28px;padding:40px 36px;width:100%;max-width:420px;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.18)}
.modal-rb{position:absolute;top:0;left:0;right:0;height:4px;background:var(--rb);border-radius:28px 28px 0 0}
.modal-x{position:absolute;top:18px;right:20px;background:#f5f5f5;border:none;width:30px;height:30px;border-radius:50%;font-size:13px;cursor:none;color:#aaa;display:flex;align-items:center;justify-content:center;transition:all .18s}
.modal-x:hover{background:#ffe0ef;color:var(--pink)}
.modal h2{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:6px;color:#1a1a1a;font-style:italic}
.modal-sub{font-size:13px;color:#bbb;margin-bottom:22px;font-weight:300}
.modal-tabs{display:flex;margin-bottom:20px;border-radius:100px;background:#f7f7f7;padding:4px}
.mtab{flex:1;padding:9px;border:none;background:none;border-radius:100px;font-size:13px;font-weight:500;cursor:none;font-family:'DM Sans',sans-serif;color:#bbb;transition:all .2s}
.mtab.act{background:#fff;color:#1a1a1a;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.google-btn{width:100%;background:#fff;color:#333;font-weight:500;font-size:14px;padding:13px;border-radius:100px;border:1.5px solid #eee;cursor:none;font-family:'DM Sans',sans-serif;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s}
.google-btn:hover{border-color:#ddd;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.divider{display:flex;align-items:center;gap:12px;margin:14px 0}
.divider span{font-size:11px;color:#ddd;font-weight:500;white-space:nowrap}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#f0f0f0}
.field{margin-bottom:14px}
.field label{display:block;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#ccc;margin-bottom:7px}
.field input{width:100%;padding:13px 16px;border:1.5px solid #f0f0f0;border-radius:14px;font-size:14px;font-family:'DM Sans',sans-serif;color:#1a1a1a;outline:none;background:#fafafa;transition:border .2s}
.field input:focus{border-color:var(--pink);background:#fff}
.auth-btn{width:100%;background:var(--rb);color:#fff;font-weight:600;font-size:15px;padding:14px;border-radius:100px;border:none;cursor:none;font-family:'DM Sans',sans-serif;margin-top:6px}
.auth-btn:disabled{opacity:.5}
.msg-err{background:#fff0f5;border:1.5px solid #ffb3d1;border-radius:12px;padding:10px 14px;font-size:12px;color:var(--pink);margin-bottom:12px;font-weight:500}
.msg-ok{background:#f0fff4;border:1.5px solid #b3ffd1;border-radius:12px;padding:10px 14px;font-size:12px;color:#00A040;margin-bottom:12px;font-weight:500}

/* DASHBOARD */
.dashboard{padding:60px 24px;max-width:720px;margin:0 auto}
.dash-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;flex-wrap:wrap;gap:12px}
.dash-welcome{font-family:'Playfair Display',serif;font-size:30px;color:#1a1a1a;font-style:italic}
.dash-out{background:#f5f5f5;color:#888;font-size:12px;font-weight:600;padding:10px 20px;border-radius:100px;border:none;cursor:none;font-family:'DM Sans',sans-serif;transition:all .2s}
.dash-out:hover{background:#ffe0ef;color:var(--pink)}
.stats{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:36px}
.stat{flex:1;min-width:100px;background:#fff;border-radius:20px;padding:22px 18px;border:1.5px solid rgba(0,0,0,.05);text-align:center}
.stat-n{font-family:'Playfair Display',serif;font-size:38px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
.stat-l{font-size:11px;color:#bbb;margin-top:5px;font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.sess-hdr{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#ddd;margin-bottom:16px}
.sess-list{display:flex;flex-direction:column;gap:10px}
.sess-item{background:#fff;border-radius:18px;padding:18px 22px;border:1.5px solid rgba(0,0,0,.05);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.sess-type{font-family:'Playfair Display',serif;font-size:15px;color:#1a1a1a;font-style:italic}
.sess-meta{font-size:11px;color:#ccc;margin-top:2px;font-weight:300}
.sess-badge{background:var(--rb);color:#fff;font-size:10px;font-weight:600;padding:4px 13px;border-radius:100px}
.sess-empty{text-align:center;padding:48px 20px;color:#ccc;font-size:14px;font-weight:300}

/* MAMACITAS PAGE */
.m-hero{min-height:52vh;background:var(--cream);position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:110px 24px 60px}
.m-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 30%,rgba(255,107,0,.09) 0%,transparent 55%),radial-gradient(ellipse 60% 50% at 80% 20%,rgba(255,45,139,.08) 0%,transparent 50%),radial-gradient(ellipse 70% 60% at 50% 90%,rgba(255,208,0,.08) 0%,transparent 55%);pointer-events:none}
.m-brand{font-family:'Playfair Display',serif;font-size:clamp(56px,11vw,118px);line-height:.88;letter-spacing:-4px;font-style:italic;position:relative;z-index:2;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;opacity:0;animation:fadeUp .9s .1s cubic-bezier(.22,1,.36,1) forwards}
.m-line{width:200px;height:3px;margin:18px auto 22px;background:var(--rb);border-radius:3px;position:relative;z-index:2;opacity:0;animation:fadeUp .9s .25s cubic-bezier(.22,1,.36,1) forwards}
.m-sub{font-size:clamp(14px,1.7vw,17px);color:#aaa;max-width:360px;line-height:1.8;position:relative;z-index:2;font-weight:300;opacity:0;animation:fadeUp .9s .38s cubic-bezier(.22,1,.36,1) forwards}

/* PROFILE */
.profile-page{padding:70px 24px;max-width:720px;margin:0 auto}
.back-btn{background:none;border:none;cursor:none;color:#bbb;font-size:13px;font-weight:500;margin-bottom:28px;display:inline-flex;align-items:center;gap:7px;font-family:'DM Sans',sans-serif;transition:color .2s;padding:0}
.back-btn:hover{color:var(--pink)}
.profile-top{display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap;margin-bottom:32px;background:#fff;border-radius:28px;padding:36px;border:1.5px solid rgba(0,0,0,.05)}
.profile-avatar{width:108px;height:108px;border-radius:50%;background:linear-gradient(135deg,#FFE4F3,#FFD0E8);display:flex;align-items:center;justify-content:center;font-size:56px;flex-shrink:0;box-shadow:0 8px 28px rgba(255,45,139,.16)}
.profile-info{flex:1}
.profile-name{font-family:'Playfair Display',serif;font-size:36px;font-style:italic;font-weight:700;color:#1a1a1a;margin-bottom:6px;letter-spacing:-1px}
.profile-origin{font-size:13px;color:#bbb;font-weight:400;margin-bottom:12px;letter-spacing:.3px}
.profile-bio{font-size:14px;color:#666;line-height:1.75;margin-bottom:16px;font-weight:300}
.profile-tags{display:flex;gap:8px;flex-wrap:wrap}
.profile-tag{background:var(--warm);border-radius:100px;padding:5px 14px;font-size:11px;font-weight:500;color:#888}
.services-grid{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
.service-card{background:#fff;border-radius:18px;padding:20px 24px;border:1.5px solid rgba(0,0,0,.05);display:flex;align-items:center;justify-content:space-between;gap:12px;transition:all .2s}
.service-card:hover{border-color:rgba(255,45,139,.18);box-shadow:0 8px 24px rgba(255,45,139,.07)}
.service-name{font-size:14px;font-weight:500;color:#1a1a1a}
.service-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--pink);font-weight:700}
.service-btn{background:var(--rb);color:#fff;font-size:12px;font-weight:600;padding:10px 22px;border-radius:100px;border:none;cursor:none;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all .2s}
.service-btn:hover{box-shadow:0 6px 20px rgba(255,45,139,.28);transform:translateY(-1px)}
.available-now{background:linear-gradient(135deg,#f0fff4,#e8fff0);border-radius:20px;padding:22px 28px;border:1.5px solid rgba(0,200,83,.22);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.an-dot{width:9px;height:9px;border-radius:50%;background:#00C853;box-shadow:0 0 10px rgba(0,200,83,.65);flex-shrink:0;animation:pulse 2s ease-in-out infinite}
.lock-gate{background:var(--warm);border-radius:24px;padding:52px 36px;text-align:center;border:1.5px dashed rgba(255,45,139,.18)}
.lock-gate-icon{font-size:44px;margin-bottom:16px}
.lock-gate h3{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:10px;color:#1a1a1a;font-style:italic}
.lock-gate p{font-size:14px;color:#aaa;margin-bottom:28px;line-height:1.75;font-weight:300}

/* TOAST */
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;font-size:13px;font-weight:500;padding:13px 26px;border-radius:100px;z-index:9999;pointer-events:none;white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,.2)}

.grad{background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
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
  return <div className="strip"><div className="mtrack">{d.map((t, i) => <span key={i} className="mitem">{t}</span>)}</div></div>;
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
  const googleLogin = () => window.open(`${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.href)}`, "_blank", "width=500,height=600,left=200,top=100");
  return (
    <div className="modal-ov" onClick={e => e.target.classList.contains("modal-ov") && onClose()}>
      <div className="modal">
        <div className="modal-rb" />
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
  useEffect(() => { apiGetSessions(user.token).then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false); }); }, []);
  const spent = sessions.reduce((s, r) => s + (r.price || 0), 0);
  return (
    <div className="dashboard">
      <div className="dash-hdr">
        <div><div className="sec-label">Personal area</div><div className="dash-welcome">Hi, <span className="grad">{user.email.split("@")[0]}</span> 👋</div></div>
        <button className="dash-out" onClick={onLogout}>Sign out →</button>
      </div>
      <div className="stats">
        {[[sessions.length, "Sessions"], [`€${spent}`, "Spent"], [sessions.filter(s => s.status === "confirmed").length, "Confirmed"]].map(([n, l]) => (
          <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
        ))}
      </div>
      <div className="sess-hdr">Session history</div>
      {loading ? <p style={{ color: "#ccc", fontSize: 13, padding: "20px 0", fontWeight: 300 }}>Loading...</p>
        : sessions.length === 0
          ? <div className="sess-empty"><div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>No sessions yet. Book your first one!</div>
          : <div className="sess-list">{sessions.map(s => (
            <div key={s.id} className="sess-item">
              <div><div className="sess-type">{s.type || "Session"}</div><div className="sess-meta">{s.duration || ""} · {new Date(s.booked_at).toLocaleDateString("en-GB")}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{s.price && <span style={{ fontWeight: 600, fontSize: 14 }}>€{s.price}</span>}<span className="sess-badge">{s.status}</span></div>
            </div>
          ))}</div>
      }
      <button className="btn-hero" style={{ marginTop: 28, width: "100%", fontSize: 14 }} onClick={onBook}>+ Book a new session 🌶</button>
    </div>
  );
}

function MamacitaCard({ tutor, onView }) {
  return (
    <div className="mc">
      <div className="mc-color-bar" />
      <div className="mc-body">
        <div className="mc-avatar-wrap">
          <div className="mc-avatar">{tutor.avatar}</div>
          <div className={`mc-live-badge ${tutor.live ? "on" : "off"}`}><span /></div>
        </div>
        <div className="mc-name">{tutor.name}</div>
        <div className="mc-origin">{tutor.flag} {tutor.origin}</div>
        <div className="mc-tags">{tutor.tags.map(t => <span key={t} className="mc-tag">{t}</span>)}</div>
        <div className="mc-review">
          <div className="mc-review-stars">{"★".repeat(Math.floor(tutor.rating))}</div>
          <div className="mc-review-text">{tutor.reviews[0].text}</div>
          <div className="mc-review-author">— {tutor.reviews[0].author}</div>
        </div>
      </div>
      <div className="mc-footer">
        <button className="mc-btn" onClick={onView}>View profile →</button>
      </div>
    </div>
  );
}

function ProfilePage({ tutor, onBack, onBook, user, onTrial }) {
  return (
    <div className="profile-page">
      <button className="back-btn" onClick={onBack}>← Back to Mamacitas</button>
      <div className="profile-top">
        <div className="profile-avatar">{tutor.avatar}</div>
        <div className="profile-info">
          <div className="profile-name">{tutor.name}</div>
          <div className="profile-origin">{tutor.flag} {tutor.origin} · {tutor.age} years old</div>
          <p className="profile-bio">{tutor.personality}</p>
          <div className="profile-tags">{tutor.tags.map(t => <span key={t} className="profile-tag">{t}</span>)}</div>
        </div>
      </div>
      {!user ? (
        <div className="lock-gate">
          <div className="lock-gate-icon">🔒</div>
          <h3>Members only</h3>
          <p>Start your free 7-day trial to view services and book sessions with {tutor.name}.</p>
          <button className="btn-hero" onClick={onTrial}>Start free trial →</button>
        </div>
      ) : (
        <>
          <div className="sec-label" style={{ marginBottom: 16 }}>Services & Pricing</div>
          <div className="services-grid">
            {tutor.services.map(s => (
              <div key={s.name} className="service-card">
                <div className="service-name">{s.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="service-price">{s.price}</div>
                  <button className="service-btn" onClick={onBook}>Book →</button>
                </div>
              </div>
            ))}
          </div>
          {tutor.live && (
            <div className="available-now">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="an-dot" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#00A040", marginBottom: 3 }}>Available Now</div>
                  <p style={{ fontSize: 12, color: "#666", fontWeight: 300 }}>{tutor.name} is online. Start an instant conversation.</p>
                </div>
              </div>
              <button className="btn-hero" style={{ padding: "13px 28px", fontSize: 13 }} onClick={onBook}>Start now →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import dynamic from 'next/dynamic';

function App() {
  const [page, setPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => { try { const s = localStorage.getItem("hm_user"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("hm_user", JSON.stringify(user));
    else localStorage.removeItem("hm_user");
  }, [user]);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "hm-cursor"; el.textContent = "🍑";
    Object.assign(el.style, { position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999, fontSize: "26px", transform: "translate(-50%,-50%)", userSelect: "none", lineHeight: 1 });
    document.body.appendChild(el);
    const move = e => { el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px"; };
    window.addEventListener("mousemove", move);
    document.body.style.cursor = "none";
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("scroll", onScroll); el.remove(); document.body.style.cursor = ""; };
  }, []);

  const toast = m => { setToastMsg(m); setTimeout(() => setToastMsg(""), 2800); };
  const go = p => { setPage(p); window.scrollTo({ top: 0, behavior: "instant" }); };
  const goAnchor = anchor => { setPage("home"); setTimeout(() => document.getElementById("sec-" + anchor)?.scrollIntoView({ behavior: "smooth" }), 80); };
  const handleTrial = () => { if (STRIPE_TRIAL_LINK === "STRIPE_TRIAL_LINK") { toast("⚙️ Stripe trial link coming soon!"); return; } window.location.href = STRIPE_TRIAL_LINK; };

  const Nav = () => (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-rb" />
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => go("home")}>Hola Mamacita</button>
        <div className="nav-links">
          <button className="nav-link" onClick={() => go("home")}>Home</button>
          <button className="nav-link" onClick={() => go("mamacitas")}>Mamacitas</button>
          <button className="nav-link" onClick={() => goAnchor("membership")}>Membership</button>
          {user
            ? <><button className="nav-link" onClick={() => go("dashboard")}>👤 {user.email.split("@")[0]}</button><button className="nav-cta" onClick={() => go("mamacitas")}>Browse 🌶</button></>
            : <><button className="nav-link" onClick={() => setShowAuth(true)}>Sign in</button><button className="nav-cta" onClick={handleTrial}>Free Trial 🌶</button></>
          }
        </div>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="footer-logo">Hola Mamacita 🌶</div>
            <div className="footer-tagline">Private Conversational Spanish Experience with Latina Mamacitas.</div>
          </div>
          <div className="footer-links">
            {["About", "Terms", "Privacy", "Become a Mamacita"].map(l => (
              <button key={l} className="footer-link" onClick={() => toast("Coming soon")}>{l}</button>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Hola Mamacita · All rights reserved</div>
          <div className="footer-rb" />
        </div>
      </div>
    </footer>
  );

  const floatEmojis = ["🌶","🌺","✨","🌴","💃","🔥","🎉","🍹"];

  return (
    <>
      <style>{css}</style>
      <Nav />
      {toastMsg && <div className="toast">{toastMsg}</div>}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={u => { setUser(u); toast("🎉 Welcome back!"); }} />}

      {page === "dashboard" && user && (
        <Dashboard user={user} onLogout={() => { setUser(null); toast("👋 Signed out!"); go("home"); }} onBook={() => go("mamacitas")} />
      )}

      {page === "profile" && selectedTutor && (
        <ProfilePage tutor={selectedTutor} onBack={() => go("mamacitas")} onBook={() => toast("🔗 Calendly coming soon!")} user={user} onTrial={handleTrial} />
      )}

      {page === "mamacitas" && (
        <>
          <section className="m-hero">
            <div className="hs hs1" /><div className="hs hs2" /><div className="hs hs3" />
            <div className="fls">{["🎭","💃","🌺","🔥","✨","🌴","🎉","🍹"].map((e,i) => <span key={i} className="fl">{e}</span>)}</div>
            <div className="m-brand">Mamacitas</div>
            <div className="m-line" />
            <p className="m-sub">Charismatic. Latina. Native speakers.<br />Choose yours and start speaking.</p>
          </section>
          <Strip items={["Playful","Confident","Native speakers","From Latin America & Spain","Available Now","¡Vámonos!","Real conversations only"]} />
          <div className="sec bg-cream">
            <div className="wrap tc">
              <div className="sec-label">Our Mamacitas</div>
              <h2 className="sec-title">Meet the <em>Mamacitas</em></h2>
              <p className="sec-desc">All native speakers · Handpicked · Sessions via Zoom</p>
              <div className="mamacita-grid">
                {TUTORS.map(t => <MamacitaCard key={t.name} tutor={t} onView={() => { setSelectedTutor(t); go("profile"); }} />)}
              </div>
            </div>
          </div>
          <div className="sec bg-warm tc">
            <div className="wsm">
              <div className="sec-label">Ready?</div>
              <h2 className="sec-title">Don't wait for your <em>Mamacita</em>.</h2>
              <p className="sec-desc" style={{ marginBottom: 32 }}>Sessions start now. Join the club.</p>
              <button className="btn-hero" onClick={handleTrial}>Start free trial 🎭</button>
            </div>
          </div>
          <Footer />
        </>
      )}

      {page === "home" && (
        <>
          <section className="hero">
            <div className="hs hs1"/><div className="hs hs2"/><div className="hs hs3"/>
            <div className="hs hs4"/><div className="hs hs5"/>
            <div className="hs dot1"/><div className="hs dot2"/><div className="hs dot3"/>
            <div className="fls">{floatEmojis.map((e,i) => <span key={i} className="fl">{e}</span>)}</div>
            <div className="hero-inner">
              <div className="hero-badge"><span className="hb-dot"/>Private Spanish Experience</div>
              <div className="brand">Hola Mamacita<span className="brand-under"/></div>
              <div className="hero-tagline">Practice Spanish with a Mamacita</div>
              <p className="hero-desc">Private one-to-one Spanish conversations with Latina Mamacitas.<br/>Fun, natural and real.</p>
              <div className="hero-cta-group">
                <button className="btn-hero" onClick={handleTrial}>Start Free 7-Day Trial →</button>
                <div className="hero-meta">No commitment <span>·</span> Cancel anytime <span>·</span> 9.99€/month after trial</div>
              </div>
            </div>
            <div className="scroll-hint">
              <span className="scroll-hint-text">Scroll</span>
              <div className="scroll-arrow"/>
            </div>
          </section>

          <Strip items={STRIP_ITEMS}/>

          <div className="sec bg-warm tc" id="sec-how">
            <div className="wrap">
              <div className="sec-label">How it works</div>
              <h2 className="sec-title">Simple as <em>¡hola!</em></h2>
              <p className="sec-desc">Join the club, choose your Mamacita and start speaking Spanish. No textbooks, no homework.</p>
              <div className="how-grid">
                {[
                  {n:"01",icon:"🎭",title:"Join the club",desc:"Start your free 7-day trial. No commitment, cancel anytime."},
                  {n:"02",icon:"💃",title:"Choose your Mamacita",desc:"Browse profiles, pick your favourite or go for an instant call right now."},
                  {n:"03",icon:"🌶",title:"Start speaking",desc:"Real conversation. No scripts, no textbooks. Just you and a Mamacita."},
                ].map((s,i) => (
                  <div key={i} className="how-card">
                    <div className="how-num">{s.n}</div>
                    <span className="how-icon">{s.icon}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sec bg-cream tc" id="sec-mamacitas">
            <div className="wrap">
              <div className="sec-label">The Mamacitas</div>
              <h2 className="sec-title">Meet the <em>Mamacitas</em></h2>
              <p className="sec-desc">Handpicked for their energy, charisma and conversational skills. All native speakers from Latin America and Spain.</p>
              <div className="mamacita-grid">
                {TUTORS.map(t => <MamacitaCard key={t.name} tutor={t} onView={() => { setSelectedTutor(t); go("profile"); }} />)}
              </div>
            </div>
          </div>

          <div className="sec bg-warm tc" id="sec-membership">
            <div className="wrap">
              <div className="sec-label">Membership</div>
              <h2 className="sec-title">Join <em>Hola Mamacita</em></h2>
              <p className="sec-desc">One membership. Unlimited access to all Mamacitas, instant conversations and private bookings.</p>
              <div className="mem-wrap">
                <div className="mem-left">
                  <div className="mem-badge">✦ Free Trial</div>
                  <div className="mem-price">Free <sub>for 7 days</sub></div>
                  <div className="mem-period">Then 9.99€ / month</div>
                  <div className="mem-then">Cancel anytime · No hidden fees</div>
                  <div className="mem-desc">"The club where you actually learn to speak Spanish."</div>
                </div>
                <div className="mem-right">
                  <ul className="mem-features">
                    {[["🎭","Access to all Mamacitas"],["⚡","Instant conversations (Available Now)"],["📅","Private session bookings"],["🌶","Mamacita profiles & exclusive content"]].map(([icon,text]) => (
                      <li key={text}><span className="mem-feat-icon">{icon}</span>{text}</li>
                    ))}
                  </ul>
                  <div>
                    <button className="mem-btn" onClick={handleTrial}>Start free trial →</button>
                    <div className="mem-meta">Secure payment · Cancel anytime</div>
                  </div>
                </div>
              </div>
              <div className="scarcity">
                <span className="scarcity-dot"/>
                <span>Only a <strong>limited number of Mamacitas</strong> are available each day.</span>
              </div>
            </div>
          </div>

          <Footer/>
        </>
      )}
    </>
  );
}

const AppNoSSR = dynamic(() => Promise.resolve(App), { ssr: false });
export default AppNoSSR;

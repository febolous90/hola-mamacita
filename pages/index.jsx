import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const STRIP_ITEMS = ["Private Conversations","One-to-One with Mamacitas","From Latin America & Spain","Fun · Natural · Real","Available Now","Book a Private Session","¡Hola Mamacita!"];

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
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:#1a1a1a;overflow-x:hidden}

.nav{position:fixed;top:0;left:0;right:0;z-index:500;transition:all .3s}
.nav.scrolled{background:rgba(255,251,245,.94);backdrop-filter:blur(16px);box-shadow:0 1px 0 rgba(0,0,0,.06)}
.nav-rb{height:3px;background:var(--rb2)}
.nav-inner{padding:0 40px;display:flex;align-items:center;justify-content:space-between;height:64px}
.nav-logo{font-family:'Playfair Display',serif;font-size:19px;border:none;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700;padding:0;cursor:pointer;font-style:italic;text-decoration:none}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-link{color:rgba(26,26,26,.4);font-size:13px;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color .2s;padding:0;font-weight:500;text-decoration:none}
.nav-link:hover{color:#1a1a1a}
.nav-cta{background:var(--rb);color:#fff;font-weight:600;font-size:13px;padding:11px 26px;border-radius:100px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 4px 20px rgba(255,45,139,.32);transition:all .2s;text-decoration:none}
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,45,139,.4)}

.strip{background:var(--rb);padding:11px 0;overflow:hidden}
.mtrack{display:flex;white-space:nowrap;animation:mq 30s linear infinite}
.mitem{font-family:'Playfair Display',serif;font-style:italic;font-size:13px;color:rgba(255,255,255,.9);padding:0 32px}
.mitem::before{content:'✦';margin-right:18px;opacity:.5;font-style:normal;font-size:10px}
@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

.hero{min-height:100vh;background:var(--cream);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;padding:140px 24px 100px}
.hero::before{content:'';position:absolute;inset:0;background:
  radial-gradient(ellipse 80% 60% at 15% 20%,rgba(255,107,0,.11) 0%,transparent 60%),
  radial-gradient(ellipse 60% 50% at 85% 15%,rgba(255,45,139,.09) 0%,transparent 55%),
  radial-gradient(ellipse 70% 60% at 50% 90%,rgba(255,208,0,.09) 0%,transparent 60%),
  radial-gradient(ellipse 50% 40% at 90% 75%,rgba(0,200,83,.06) 0%,transparent 50%);
pointer-events:none;z-index:0}

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
@keyframes flup{0%{opacity:0;transform:translateY(100vh)}10%{opacity:.7}90%{opacity:.4}100%{opacity:0;transform:translateY(-120px)}}

.hero-inner{position:relative;z-index:2;max-width:700px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,45,139,.08);border:1px solid rgba(255,45,139,.15);border-radius:100px;padding:7px 18px;font-size:12px;font-weight:600;color:var(--pink);letter-spacing:.04em;text-transform:uppercase;margin-bottom:28px}
.hb-dot{width:7px;height:7px;background:var(--pink);border-radius:50%;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.brand{font-family:'Playfair Display',serif;font-size:clamp(52px,8vw,96px);font-weight:700;font-style:italic;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.05;margin-bottom:20px;position:relative;display:inline-block}
.hero-tagline{font-size:clamp(18px,2.5vw,24px);font-weight:300;color:#444;margin-bottom:16px;font-style:italic;font-family:'Playfair Display',serif}
.hero-desc{font-size:16px;color:rgba(26,26,26,.55);line-height:1.7;margin-bottom:36px}
.btn-hero{background:var(--rb);color:#fff;font-weight:700;font-size:16px;padding:16px 40px;border-radius:100px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 6px 28px rgba(255,45,139,.35);transition:all .25s;text-decoration:none;display:inline-block}
.btn-hero:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(255,45,139,.45)}
.hero-meta{margin-top:14px;font-size:12px;color:rgba(26,26,26,.35);letter-spacing:.02em}
.hero-meta span{margin:0 6px;opacity:.5}

.sec{padding:96px 24px}
.bg-cream{background:var(--cream)}
.bg-warm{background:var(--warm)}
.wrap{max-width:1100px;margin:0 auto}
.tc{text-align:center}
.sec-label{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--pink);margin-bottom:14px}
.sec-title{font-family:'Playfair Display',serif;font-size:clamp(32px,4vw,52px);font-weight:700;color:#1a1a1a;line-height:1.15;margin-bottom:16px}
.sec-title em{font-style:italic;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sec-desc{font-size:16px;color:rgba(26,26,26,.5);max-width:560px;margin:0 auto 56px;line-height:1.7}

.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:900px;margin:0 auto}
.how-card{background:#fff;border-radius:20px;padding:36px 28px;box-shadow:0 4px 24px rgba(0,0,0,.05);border:1px solid rgba(0,0,0,.04);transition:transform .25s}
.how-card:hover{transform:translateY(-6px)}
.how-num{font-size:11px;font-weight:700;letter-spacing:.1em;color:rgba(26,26,26,.2);margin-bottom:16px}
.how-icon{font-size:36px;display:block;margin-bottom:16px}
.how-card h3{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:10px;font-weight:700}
.how-card p{font-size:14px;color:rgba(26,26,26,.5);line-height:1.65}

.mamacita-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-top:16px}
.mc{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.04);transition:all .25s;cursor:pointer;text-decoration:none;display:block}
.mc:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.1)}
.mc-top{height:120px;position:relative;display:flex;align-items:flex-end;padding:16px}
.mc-avatar{width:72px;height:72px;border-radius:50%;border:3px solid #fff;object-fit:cover;background:#eee;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;position:relative;z-index:1}
.mc-body{padding:16px 20px 20px}
.mc-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px}
.mc-meta{font-size:12px;color:rgba(26,26,26,.4);margin-bottom:10px}
.mc-bio{font-size:13px;color:rgba(26,26,26,.55);line-height:1.55;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mc-tags{display:flex;flex-wrap:wrap;gap:6px}
.mc-tag{font-size:11px;padding:4px 10px;border-radius:100px;font-weight:500}

.mem-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:780px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.08);border:1px solid rgba(0,0,0,.06)}
.mem-left{padding:48px 40px;background:var(--rb);color:#fff}
.mem-badge{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:rgba(255,255,255,.2);display:inline-block;padding:6px 14px;border-radius:100px;margin-bottom:24px}
.mem-price{font-family:'Playfair Display',serif;font-size:52px;font-weight:700;line-height:1}
.mem-price sub{font-size:18px;font-weight:400;vertical-align:baseline}
.mem-period{font-size:15px;opacity:.85;margin:8px 0 4px}
.mem-then{font-size:12px;opacity:.65;margin-bottom:24px}
.mem-desc{font-family:'Playfair Display',serif;font-style:italic;font-size:16px;opacity:.9;line-height:1.5}
.mem-right{padding:48px 40px;display:flex;flex-direction:column;justify-content:space-between}
.mem-features{list-style:none;display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
.mem-features li{display:flex;align-items:center;gap:12px;font-size:14px;color:#1a1a1a}
.mem-feat-icon{font-size:18px}
.mem-btn{background:var(--rb);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;width:100%;box-shadow:0 4px 20px rgba(255,45,139,.3);transition:all .2s;text-decoration:none;display:block;text-align:center}
.mem-btn:hover{transform:translateY(-2px)}
.mem-meta{text-align:center;font-size:11px;color:rgba(26,26,26,.35);margin-top:10px}

.scarcity{margin-top:32px;display:inline-flex;align-items:center;gap:10px;background:rgba(255,45,139,.06);border:1px solid rgba(255,45,139,.12);padding:10px 20px;border-radius:100px;font-size:13px;color:rgba(26,26,26,.6)}
.scarcity-dot{width:8px;height:8px;background:var(--pink);border-radius:50%;animation:pulse 2s ease-in-out infinite;flex-shrink:0}

.footer{background:#1a1a1a;color:rgba(255,255,255,.4);text-align:center;padding:40px 24px;font-size:13px}
.footer-logo{font-family:'Playfair Display',serif;font-style:italic;font-size:22px;background:var(--rb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;margin-bottom:12px}
.footer a{color:rgba(255,255,255,.3);text-decoration:none;margin:0 12px}
.footer a:hover{color:rgba(255,255,255,.6)}

.empty-grid{padding:48px;text-align:center;color:rgba(26,26,26,.35);font-size:15px;background:#fff;border-radius:20px;border:1px dashed rgba(0,0,0,.1)}

@media(max-width:768px){
  .nav-links{display:none}
  .how-grid{grid-template-columns:1fr}
  .mem-wrap{grid-template-columns:1fr}
  .hero{padding:120px 20px 80px}
}
`;

function Strip({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="strip">
      <div className="mtrack">
        {doubled.map((t, i) => <span key={i} className="mitem">{t}</span>)}
      </div>
    </div>
  );
}

function MamacitaCard({ profile }) {
  const colors = ["#FF2D8B","#FF6B00","#FFD000","#00C853","#2979FF","#9C27B0"];
  const color = colors[profile.username.charCodeAt(0) % colors.length];
  const initial = (profile.display_name || profile.username || '?')[0].toUpperCase();

  return (
    <a href={`/mamacita/${profile.username}`} className="mc">
      <div className="mc-top" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
        <div className="mc-avatar" style={{ background: profile.avatar_url ? 'transparent' : color + '22', color }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initial
          }
        </div>
      </div>
      <div className="mc-body">
        <div className="mc-name">{profile.display_name || profile.username}</div>
        <div className="mc-meta">
          {profile.location && `📍 ${profile.location}`}
          {profile.age && profile.location && ' · '}
          {profile.age && `${profile.age} anni`}
        </div>
        {profile.bio && <div className="mc-bio">{profile.bio}</div>}
        <div className="mc-tags">
          <span className="mc-tag" style={{ background: color + '15', color }}>● Available</span>
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mamacitas, setMamacitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const floatEmojis = ["🌶","💃","🎭","✨","🌺","🔥","🍹","🎉"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setMamacitas(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-rb" />
        <div className="nav-inner">
          <a href="/" className="nav-logo">Hola Mamacita</a>
          <div className="nav-links">
            <a href="#sec-mamacitas" className="nav-link">Mamacitas</a>
            <a href="#sec-how" className="nav-link">How it works</a>
            <a href="#sec-membership" className="nav-link">Membership</a>
            <a href="/login" className="nav-link">Sign in</a>
            <a href="/register" className="nav-cta">Join the club →</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hs hs1"/><div className="hs hs2"/><div className="hs hs3"/>
        <div className="hs hs4"/><div className="hs hs5"/>
        <div className="hs dot1"/><div className="hs dot2"/><div className="hs dot3"/>
        <div className="fls">{floatEmojis.map((e,i) => <span key={i} className="fl">{e}</span>)}</div>
        <div className="hero-inner">
          <div className="hero-badge"><span className="hb-dot"/>Private Experience</div>
          <div className="brand">Hola Mamacita</div>
          <div className="hero-tagline">Meet the Mamacitas</div>
          <p className="hero-desc">Private one-to-one with Latina Mamacitas.<br/>Fun, natural and real.</p>
          <div>
            <a href="/register" className="btn-hero">Join the club →</a>
            <div className="hero-meta">No commitment <span>·</span> Exclusive profiles <span>·</span> Available now</div>
          </div>
        </div>
      </section>

      <Strip items={STRIP_ITEMS} />

      <div className="sec bg-warm tc" id="sec-how">
        <div className="wrap">
          <div className="sec-label">How it works</div>
          <h2 className="sec-title">Simple as <em>¡hola!</em></h2>
          <p className="sec-desc">Join the club, choose your Mamacita and connect. No complications.</p>
          <div className="how-grid">
            {[
              {n:"01",icon:"🎭",title:"Join the club",desc:"Create your account in seconds. Free to register."},
              {n:"02",icon:"💃",title:"Choose your Mamacita",desc:"Browse exclusive profiles, pick your favourite and get in touch."},
              {n:"03",icon:"🌶",title:"Connect",desc:"Real conversations. No scripts, no middlemen. Just you and a Mamacita."},
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
          <p className="sec-desc">Handpicked profiles. Each one unique. All approved.</p>
          {loading ? (
            <div className="empty-grid">Loading Mamacitas...</div>
          ) : mamacitas.length === 0 ? (
            <div className="empty-grid">No Mamacitas available yet. Check back soon! 🌶️</div>
          ) : (
            <div className="mamacita-grid">
              {mamacitas.map(p => <MamacitaCard key={p.id} profile={p} />)}
            </div>
          )}
        </div>
      </div>

      <div className="sec bg-warm tc" id="sec-membership">
        <div className="wrap">
          <div className="sec-label">Membership</div>
          <h2 className="sec-title">Join <em>Hola Mamacita</em></h2>
          <p className="sec-desc">One membership. Full access to all Mamacitas, exclusive profiles and private connections.</p>
          <div className="mem-wrap">
            <div className="mem-left">
              <div className="mem-badge">✦ Free Trial</div>
              <div className="mem-price">Free <sub>for 7 days</sub></div>
              <div className="mem-period">Then 9.99€ / month</div>
              <div className="mem-then">Cancel anytime · No hidden fees</div>
              <div className="mem-desc">"The club where you meet real Mamacitas."</div>
            </div>
            <div className="mem-right">
              <ul className="mem-features">
                {[
                  ["🎭","Access to all Mamacita profiles"],
                  ["⚡","Direct contact — WhatsApp, Telegram"],
                  ["📅","Exclusive content & updates"],
                  ["🌶","Featured Mamacitas — first access"],
                ].map(([icon,text]) => (
                  <li key={text}><span className="mem-feat-icon">{icon}</span>{text}</li>
                ))}
              </ul>
              <div>
                <a href="/register" className="mem-btn">Join the club →</a>
                <div className="mem-meta">Secure payment · Cancel anytime</div>
              </div>
            </div>
          </div>
          <div className="scarcity">
            <span className="scarcity-dot"/>
            <span>Only a <strong>limited number of Mamacitas</strong> are available.</span>
          </div>
        </div>
      </div>

      <footer className="footer">
        <span className="footer-logo">Hola Mamacita</span>
        <div>
          <a href="/register">Register</a>
          <a href="/login">Sign in</a>
          <a href="#sec-mamacitas">Mamacitas</a>
        </div>
        <div style={{marginTop:16}}>© 2025 Hola Mamacita · All rights reserved</div>
      </footer>
    </>
  );
}

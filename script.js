// ===== LMSZ – közös scriptek =====
// ---------------------------------------------------------------
// ŰRLAP ÉLESÍTÉSE: regisztrálj a https://formspree.io oldalon,
// hozz létre egy űrlapot az info@lmsz.hu címmel, majd az ott kapott
// azonosítót írd be ide az idézőjelek közé, pl.: "mzzgkqyw".
// Amíg üres, az űrlap a levelezőprogramot nyitja meg (mailto).
const FORMSPREE_ID = "xjygnpkn";
// ---------------------------------------------------------------
// GOOGLE ADS KONVERZIÓMÉRÉS: a Google-címke (AW-851426527) minden oldal
// fejlécében bent van. Ide a két konverziós művelet CÍMKÉJÉT kell beírni
// (a Google Ads-ben a 'send_to' értékének "/" utáni része):
const ADS_ID = "AW-851426527";
const ADS_LABEL_FORM = "3ZYgCPfvhY0BEN_5_pUD";   // pl. "AbCdEfGhIjK" – Árajánlatkérés (űrlap elküldve)
const ADS_LABEL_CALL = "01nmCLLhh6UdEN_5_pUD";   // pl. "ZyXwVuTsRqP" – Telefonhívás kattintás
function adsConversion(label, ga4Event) {
  if (typeof gtag !== 'function') return;
  if (label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  if (ga4Event) gtag('event', ga4Event);
}
// telefonszámra kattintás mérése
document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => adsConversion(ADS_LABEL_CALL, 'phone_call_click')));
// ---------------------------------------------------------------

// fejléc árnyék, görgetési jelző, vissza-a-tetejére gomb
const nav = document.getElementById('nav');
const prog = document.getElementById('progress');
const totop = document.getElementById('totop');
addEventListener('scroll', () => {
  const h = document.documentElement;
  if (nav) nav.classList.toggle('scrolled', h.scrollTop > 10);
  if (prog) prog.style.transform = 'scaleX(' + (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) + ')';
  if (totop) totop.classList.toggle('show', h.scrollTop > 600);
}, { passive: true });

// mobil menü
const burger = document.getElementById('burger'), menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// scrollspy – az egyoldalas verzióban jelzi, melyik szakasznál jár a látogató
const spyLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
if (spyLinks.length) {
  const map = new Map();
  spyLinks.forEach(a => { const s = document.querySelector(a.hash); if (s) map.set(s, a); });
  if (map.size) {
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          spyLinks.forEach(a => a.classList.remove('active'));
          const a = map.get(e.target);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    map.forEach((_, s) => spy.observe(s));
  }
}

// megjelenés görgetésre
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// mérési napló – sorok begépelődése
const term = document.querySelector('.term');
if (term) {
  term.classList.add('term-anim');
  const rows = term.querySelectorAll('.term-row');
  const tio = new IntersectionObserver(es => {
    if (es[0].isIntersecting) {
      rows.forEach((r, i) => setTimeout(() => r.classList.add('show'), 350 + i * 420));
      tio.disconnect();
    }
  }, { threshold: .3 });
  tio.observe(term);
}

// számláló animáció
const band = document.querySelector('.band');
let counted = false;
if (band) {
  const cio = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll('.num[data-count]').forEach(n => {
          const t = +n.dataset.count; let c = 0;
          const step = t / 45;
          const suf = n.textContent.includes('+') ? '+' : '';
          const tick = () => { c += step; if (c < t) { n.textContent = Math.floor(c) + suf; requestAnimationFrame(tick); } else n.textContent = t + suf; };
          tick();
        });
      }
    });
  }, { threshold: .4 });
  cio.observe(band);
}

// évszám a láblécben
document.querySelectorAll('.jsyear').forEach(el => el.textContent = new Date().getFullYear());

// kapcsolati űrlap – Formspree (ha be van állítva), különben mailto
const cf = document.getElementById('contactForm');
if (cf) {
  cf.addEventListener('submit', async function (e) {
    e.preventDefault();
    const f = e.target;
    if (f.website && f.website.value) { showSuccess(f); return; } // honeypot – robot
    const nev = f.nev.value, ceg = f.ceg.value, email = f.email.value,
          tel = f.tel.value, szolg = f.szolg.value, uzenet = f.uzenet.value;
    // Google Ads kibővített konverzió: a megadott e-mail/telefon titkosítva kerül átadásra
    if (typeof gtag === 'function') {
      const ud = {};
      if (email) ud.email = email.trim().toLowerCase();
      const digits = tel.replace(/[^\d+]/g, '');
      if (digits) ud.phone_number = digits.startsWith('+') ? digits : (digits.startsWith('06') ? '+36' + digits.slice(2) : digits.startsWith('36') ? '+' + digits : '+36' + digits);
      if (Object.keys(ud).length) gtag('set', 'user_data', ud);
    }
    if (FORMSPREE_ID) {
      const btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Küldés...';
      try {
        const r = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(f)
        });
        if (!r.ok) throw new Error('send failed');
        adsConversion(ADS_LABEL_FORM, 'generate_lead');
        showSuccess(f);
        return;
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Árajánlatkérés elküldése';
      }
    }
    const body = `Név: ${nev}%0ACég: ${ceg}%0AE-mail: ${email}%0ATelefon: ${tel}%0ASzolgáltatás: ${szolg}%0A%0AÜzenet:%0A${encodeURIComponent(uzenet)}`;
    window.location.href = `mailto:info@lmsz.hu?subject=${encodeURIComponent('Árajánlatkérés – ' + szolg + ' (' + nev + ')')}&body=${body}`;
    adsConversion(ADS_LABEL_FORM, 'generate_lead');
    showSuccess(f, true);
  });
}
function showSuccess(f, mailto) {
  f.style.display = 'none';
  const ok = document.getElementById('formSuccess');
  if (ok) {
    ok.classList.add('show');
    const p = ok.querySelector('p');
    if (p) p.textContent = mailto
      ? 'Megnyílik az e-mail kliense az előre kitöltött üzenettel. Hamarosan jelentkezünk Önnél.'
      : 'Üzenetét megkaptuk, jellemzően egy munkanapon belül jelentkezünk.';
  }
}

// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader')?.classList.add('hidden');
  }, 1800);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav?.classList.toggle('open');
});
document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileNav?.classList.remove('open');
  });
});

// ===== ACTIVE NAV =====
const sections = document.querySelectorAll('section[id], div[id="home"]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// Stagger program cards
document.querySelectorAll('.programs-grid .program-card, .toppers-grid .topper-card, .faculty-grid .faculty-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.08}s`;
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.done) return;
    e.target.dataset.done = '1';
    const target = +e.target.dataset.to;
    const duration = 1800;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      e.target.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.cnt[data-to]').forEach(el => counterObserver.observe(el));

// ===== TESTIMONIALS =====
const testimonials = [
  {
    text: "Thanks to the guidance of Samarthya's teachers, I was able to pass the Nayab Subba exam on my first attempt. The teaching methodology and weekly mock tests are truly world-class. I cannot imagine my success without this institute.",
    name: "Ram Bahadur Thapa",
    post: "Nayab Subba — Ministry of General Administration",
    avatar: "👨"
  },
  {
    text: "Two years of hard work and Samarthya's excellent training made me a government officer. The online class facility meant I could study from home without any compromise on quality. The faculty are incredibly supportive.",
    name: "Sunita Shrestha",
    post: "Kharidar — Accounts Service, Ministry of Finance",
    avatar: "👩"
  },
  {
    text: "Samarthya's interview preparation sessions gave me tremendous confidence. The teachers provided personal attention throughout. I had failed twice before joining Samarthya — third time was a charm!",
    name: "Bikash Poudel",
    post: "Section Officer — Federal Parliament Secretariat",
    avatar: "👨"
  },
  {
    text: "The study materials here are perfectly aligned with the PSC syllabus and updated every year. The weekly mock tests helped me identify my weak areas and improve systematically. Highly recommended!",
    name: "Anita Gurung",
    post: "Police Sub-Inspector, Nepal Police",
    avatar: "👩"
  },
  {
    text: "Samarthya changed my life. I came from a village and was alone in Kathmandu, but the team here supported me like family. The structured course plan made my preparation very efficient and focused.",
    name: "Prakash Lama",
    post: "Nayab Subba — Inland Revenue Department",
    avatar: "👨"
  }
];

let testiIdx = 0;
const testiText   = document.getElementById('testiText');
const testiAvatar = document.getElementById('testiAvatar');
const testiAuthor = document.getElementById('testiAuthor');

function setTesti(idx) {
  const t = testimonials[idx];
  if (testiText)   testiText.textContent = t.text;
  if (testiAvatar) testiAvatar.textContent = t.avatar;
  if (testiAuthor) testiAuthor.innerHTML = `
    <div class="testi-author-name">${t.name}</div>
    <div class="testi-author-post">${t.post}</div>
    <div class="testi-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>`;
}

document.getElementById('testiPrev')?.addEventListener('click', () => {
  testiIdx = (testiIdx - 1 + testimonials.length) % testimonials.length;
  setTesti(testiIdx);
});
document.getElementById('testiNext')?.addEventListener('click', () => {
  testiIdx = (testiIdx + 1) % testimonials.length;
  setTesti(testiIdx);
});
setInterval(() => {
  testiIdx = (testiIdx + 1) % testimonials.length;
  setTesti(testiIdx);
}, 5000);

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
  btn.style.background = 'var(--green)';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

// ===== NEWSLETTER FORMS =====
[document.getElementById('nlForm'), document.getElementById('footerNl')].forEach(form => {
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('button');
    const orig = btn.textContent;
    btn.textContent = '✓ Subscribed!';
    setTimeout(() => { btn.textContent = orig; e.target.reset(); }, 2500);
  });
});

// ===== BACK TO TOP =====
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  backTop?.classList.toggle('on', window.scrollY > 400);
});
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

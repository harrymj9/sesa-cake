const WHATSAPP_NUMBER = '13673300495';

// ---------- menu mobile ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.classList.toggle('no-scroll', open);
}
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !burger.contains(e.target)) setMenu(false);
});

// ---------- galerie : filtres ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const gItems = [...document.querySelectorAll('.g-item')];

function applyFilter(f) {
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  gItems.forEach(item => item.classList.toggle('hidden', f !== 'all' && item.dataset.cat !== f));
}
filterBtns.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));

// ---------- cartes occasions ----------
document.querySelectorAll('[data-goto-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    applyFilter(btn.dataset.gotoFilter);
    document.getElementById('galerie').scrollIntoView();
  });
});
document.querySelectorAll('[data-goto-order]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('evenement').value = btn.dataset.gotoOrder;
    document.getElementById('commander').scrollIntoView();
  });
});

// ---------- lightbox ----------
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
let lbIndex = 0;

function visibleItems() { return gItems.filter(i => !i.classList.contains('hidden')); }
function showLb(i) {
  const items = visibleItems();
  lbIndex = (i + items.length) % items.length;
  const img = items[lbIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = items[lbIndex].querySelector('figcaption').textContent;
}
function openLb(item) {
  showLb(visibleItems().indexOf(item));
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}
function closeLb() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}
gItems.forEach(item => item.addEventListener('click', () => openLb(item)));
document.getElementById('lbClose').addEventListener('click', closeLb);
document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex - 1); });
document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex + 1); });
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
  if (e.key === 'ArrowRight') showLb(lbIndex + 1);
});
// swipe sur mobile
let touchX = null;
lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ---------- FAQ ----------
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight = null; });
    if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

// ---------- formulaire -> WhatsApp ----------
const form = document.getElementById('orderForm');
const dateInput = document.getElementById('date');
const formError = document.getElementById('formError');

const minDate = new Date();
minDate.setDate(minDate.getDate() + 2);
dateInput.min = minDate.toISOString().split('T')[0];

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  formError.textContent = '';
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

  const missing = [...form.querySelectorAll('[required]')].filter(el => !el.value.trim());
  if (missing.length) {
    missing.forEach(el => el.classList.add('invalid'));
    formError.textContent = 'Merci de remplir les champs obligatoires (*).';
    missing[0].focus();
    return;
  }
  if (dateInput.value < dateInput.min) {
    dateInput.classList.add('invalid');
    formError.textContent = 'Merci de choisir une date au moins 48h à l\'avance.';
    dateInput.focus();
    return;
  }

  const f = new FormData(form);
  const lines = [
    'Bonjour Sesa Cake ! 🎂 Je souhaite un devis :',
    '',
    `👤 Nom : ${f.get('nom')}`,
    `📞 Téléphone : ${f.get('tel')}`,
    `🎉 Événement : ${f.get('evenement')}`,
    `📅 Date : ${formatDate(f.get('date'))}`,
  ];
  if (f.get('heure')) lines.push(`⏰ Récupération : ${f.get('heure')}`);
  if (f.get('personnes')) lines.push(`👥 Personnes : ${f.get('personnes')}`);
  lines.push(`🍰 Saveur : ${f.get('saveur')}`);
  if (f.get('commentaires').trim()) lines.push('', `📝 ${f.get('commentaires').trim()}`);

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank');
});

document.getElementById('year').textContent = new Date().getFullYear();

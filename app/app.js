// GTA VI Trophy Guide & Tracker — checklist, roadmap, missables, Next Up planner.
// Static and offline: the only file it fetches is its own data/trophies.json.
const STORE_KEY = 'gta6-trophy-guide-v5';
const DATA_URL = 'data/trophies.json';

const ROADMAP_STAGES = [
  { title: 'Stage 1 — The story: Chapters 1–4 and the finale', blurb: 'Play the story straight through. Every chapter trophy and every mission trophy lives here, so clear the missable mission trophies as their missions appear.', ids: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7] },
  { title: 'Stage 2 — Stranger strands', blurb: 'Side mission chains for strangers across Leonida. Five named strands plus three more chains make the 8 strands for Strangers & Freaks.', ids: [22, 23, 24, 26, 27, 25, 29] },
  { title: 'Stage 3 — Activities and counts', blurb: 'The repeatable activities: stunts, shooting range golds, drone races, races, fishing, arcade, meditation, challenges, vehicles, and the Scooter Bros app.', ids: [15, 16, 17, 18, 19, 20, 21, 28, 32, 35, 55] },
  { title: 'Stage 4 — Money and robberies', blurb: 'Shops, jewelry stores, bank vaults, armored trucks, gang operations, laundering, spending, and garage properties.', ids: [34, 39, 40, 41, 43, 52, 53, 54] },
  { title: 'Stage 5 — Exploration and oddities', blurb: 'The whole map plus the one-off moments: cards, WAiNK spots, the 52 Leonida areas, and the nine oddities.', ids: [30, 31, 42, 44, 45, 46, 47, 48, 49, 50, 51, 33, 36, 37, 38] },
  { title: 'Stage 6 — Cleanup: 100% and the platinum', blurb: 'Sweep the checklist in the pause menu until it reads 100%. The gold for 100% pops first, then the platinum follows at once.', ids: [14, 1] },
];

let trophies = [];
let seedEarned = [];
let earned = new Set();
let spoilerOn = false;
let currentModalId = null;

const $ = (id) => document.getElementById(id);
const grid = $('trophyGrid');
const missableGrid = $('missableGrid');

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
}

function seedStore() {
  earned = new Set(seedEarned);
  saveStore();
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function displayName(t) {
  if (spoilerOn && t.kind === 'Story' && !earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}

function displayDesc(t) {
  if (spoilerOn && t.kind === 'Story' && !earned.has(t.id)) return 'Hidden until earned — spoiler-safe mode is on.';
  return t.description;
}

function counterText(t) {
  if (!t.count) return '';
  return t.count.current + '/' + t.count.total + ' ' + t.count.label;
}

function gradeBadge(t) {
  return '<span class="grade-badge grade-' + t.grade + '">' + escapeHtml(t.grade) + '</span>';
}

function cardHtml(t) {
  const isEarned = earned.has(t.id);
  const pills = [];
  if (t.count) pills.push('<span class="counter-pill">' + escapeHtml(counterText(t)) + '</span>');
  if (t.missable) pills.push('<span class="missable-pill">⚠ Missable</span>');
  if (t.hidden) pills.push('<span class="hidden-pill">Hidden</span>');
  if (isEarned) pills.push('<span class="earned-check">✓ Earned</span>');
  return '<button type="button" class="trophy-card' + (isEarned ? ' earned' : '') + '" data-id="' + t.id + '">' +
    '<span class="trophy-top">' + gradeBadge(t) + '<span class="kind-tag">' + escapeHtml(t.kind) + '</span></span>' +
    '<span class="trophy-name">' + escapeHtml(displayName(t)) + '</span>' +
    '<span class="trophy-desc">' + escapeHtml(displayDesc(t)) + '</span>' +
    '<span class="trophy-meta">' + pills.join('') + '</span>' +
    '</button>';
}

function filteredTrophies() {
  const q = $('searchInput').value.trim().toLowerCase();
  const kind = $('kindFilter').value;
  const state = $('stateFilter').value;
  return trophies.filter((t) => {
    if (kind && t.kind !== kind) return false;
    if (state === 'earned' && !earned.has(t.id)) return false;
    if (state === 'unearned' && earned.has(t.id)) return false;
    if (state === 'missable' && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const done = earned.size;
  const pct = Math.round((done / trophies.length) * 100);
  $('progressText').textContent = done + ' / ' + trophies.length + ' earned';
  $('progressPct').textContent = pct + '%';
  $('progressFill').style.width = pct + '%';
  $('earnedCount').textContent = String(done);
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.id)) counts[t.grade] += 1;
  }
  $('gradeLine').textContent = 'Platinum ' + counts.platinum + '/' + totals.platinum +
    ' · Gold ' + counts.gold + '/' + totals.gold +
    ' · Silver ' + counts.silver + '/' + totals.silver +
    ' · Bronze ' + counts.bronze + '/' + totals.bronze;
}

function renderChecklist() {
  const list = filteredTrophies();
  grid.innerHTML = list.map(cardHtml).join('');
  $('emptyNote').hidden = list.length > 0;
  renderProgress();
}

function renderMissables() {
  const list = trophies.filter((t) => t.missable);
  $('missableCount').textContent = String(list.length);
  missableGrid.innerHTML = list.map(cardHtml).join('');
}

function renderRoadmap() {
  $('roadmapList').innerHTML = ROADMAP_STAGES.map((stage) => {
    const items = stage.ids.map((id) => {
      const t = trophyById(id);
      if (!t) return '';
      const mark = earned.has(id) ? ' ✓' : '';
      return '<li>' + escapeHtml(displayName(t)) + ' <span class="kind-tag">(' + escapeHtml(t.kind) + ')</span>' + mark + '</li>';
    }).join('');
    return '<li><h3>' + escapeHtml(stage.title) + '</h3><p>' + escapeHtml(stage.blurb) + '</p><ul>' + items + '</ul></li>';
  }).join('');
}

function nextUpReason(t) {
  if (t.missable && t.kind === 'Story') return 'Missable story mission — earn it before the chapter ends.';
  if (t.missable) return 'Missable — do it while the moment is still open.';
  if (t.count) {
    const ratio = t.count.current / t.count.total;
    if (ratio >= 0.5) return counterText(t) + ' — more than halfway there; finish the set now.';
    return counterText(t) + ' — keep chipping away between missions.';
  }
  return 'Next in the roadmap order — a quick win on the way to the platinum.';
}

function nextUpList() {
  const unearned = trophies.filter((t) => !earned.has(t.id));
  const score = (t) => {
    let s = 0;
    if (t.missable && t.kind === 'Story') s += 1000;
    else if (t.missable) s += 500;
    if (t.count) s += (t.count.current / t.count.total) * 100;
    s -= t.id;
    return s;
  };
  return unearned.slice().sort((a, b) => score(b) - score(a)).slice(0, 5);
}

function renderNextUp() {
  const list = nextUpList();
  $('nextUpList').innerHTML = list.map((t) =>
    '<li><h3>' + escapeHtml(displayName(t)) + ' ' + gradeBadge(t) + '</h3>' +
    '<p>' + escapeHtml(displayDesc(t)) + '</p>' +
    '<p class="why">Why now: ' + escapeHtml(nextUpReason(t)) + '</p></li>'
  ).join('') || '<li><p>Everything is earned — the platinum is yours.</p></li>';
}

function renderAll() {
  renderChecklist();
  renderMissables();
  renderRoadmap();
  renderNextUp();
}

function openGuide(id) {
  const t = trophyById(id);
  if (!t) return;
  currentModalId = id;
  $('modalGrade').className = 'grade-badge grade-' + t.grade;
  $('modalGrade').textContent = t.grade;
  $('modalKind').textContent = t.kind + (t.hidden ? ' · Hidden' : '');
  $('modalTitle').textContent = t.name;
  $('modalDesc').textContent = t.description;
  const counter = $('modalCounter');
  if (t.count) {
    counter.hidden = false;
    counter.textContent = 'PSN progress: ' + counterText(t);
  } else {
    counter.hidden = true;
  }
  const missBox = $('modalMissable');
  if (t.missable) {
    missBox.hidden = false;
    $('modalMissableText').textContent = 'Do this one in the story flow, before the chapter or the moment passes. ' +
      'The guide steps below say exactly when.';
  } else {
    missBox.hidden = true;
  }
  $('modalSteps').innerHTML = t.steps.map((s) => '<li>' + escapeHtml(s) + '</li>').join('');
  $('modalSources').innerHTML = t.sources.map((s) =>
    '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a>'
  ).join(' · ');
  updateModalEarned();
  $('modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function updateModalEarned() {
  if (currentModalId == null) return;
  const isEarned = earned.has(currentModalId);
  $('modalEarnedBtn').textContent = isEarned ? 'Mark as not earned' : 'Mark as earned';
  $('modalEarnedState').textContent = isEarned ? '✓ Earned — saved in this browser.' : '';
}

function closeGuide() {
  $('modalBackdrop').hidden = true;
  document.body.style.overflow = '';
  currentModalId = null;
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveStore();
  renderAll();
  if (currentModalId === id) updateModalEarned();
}

function switchView(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : data;
      const valid = ids.filter((id) => Number.isInteger(id) && trophyById(id));
      earned = new Set(valid);
      saveStore();
      renderAll();
    } catch (e) {
      alert('That file could not be imported as trophy progress.');
    }
  };
  reader.readAsText(file);
}

async function init() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  trophies = data.trophies;
  seedEarned = data.seedEarned || [];
  const stored = loadStore();
  if (stored && Array.isArray(stored.earned)) {
    earned = new Set(stored.earned.filter((id) => trophyById(id)));
  } else {
    seedStore();
  }
  $('searchInput').addEventListener('input', renderChecklist);
  $('kindFilter').addEventListener('change', renderChecklist);
  $('stateFilter').addEventListener('change', renderChecklist);
  $('spoilerToggle').addEventListener('change', (e) => { spoilerOn = e.target.checked; renderAll(); });
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.trophy-card');
    if (card) openGuide(Number(card.dataset.id));
  });
  $('modalClose').addEventListener('click', closeGuide);
  $('modalBackdrop').addEventListener('click', (e) => { if (e.target === $('modalBackdrop')) closeGuide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('modalBackdrop').hidden) closeGuide(); });
  $('modalEarnedBtn').addEventListener('click', () => { if (currentModalId != null) toggleEarned(currentModalId); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
  $('resetBtn').addEventListener('click', () => { seedStore(); renderAll(); });
  renderAll();
}

init();

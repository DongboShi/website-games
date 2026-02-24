/**
 * The Academic Auditor — Pair Up Memory Game
 *
 * Mechanics:
 *  • Responsive grid of paper "head-page" cards.
 *  • Click to flip; match one English "Original" with its Chinese "Shadow".
 *  • On match → show Case Study modal with side-by-side methodology highlight.
 *  • Toggle Translation reveals an English gloss of the Chinese abstract.
 *  • Scoring: +50 pts per match, −10 pts per mismatch.
 *  • Rounds of PAIRS_PER_ROUND pairs; cycles through the full dataset.
 */

'use strict';

// ─── Configuration ────────────────────────────────────────────────
const PAIRS_PER_ROUND   = 6;   // number of EN+CN pairs displayed per round
const MATCH_POINTS      = 50;
const MISMATCH_PENALTY  = 10;
const FLIP_BACK_DELAY   = 1200; // ms before wrong pair flips back

// ─── State ────────────────────────────────────────────────────────
const state = {
  allPairs:       [],  // shuffled copy of PAPERS_DATA
  roundPairs:     [],  // the PAIRS_PER_ROUND pairs for the current round
  cards:          [],  // { id, type:'en'|'cn', pairId, el, matched }
  flipped:        [],  // indices into state.cards of currently face-up cards
  locked:         false,
  score:          0,
  pairsFound:     0,
  totalPairs:     0,
  roundIndex:     0,   // which batch of pairs we are on
  timerSecs:      0,
  timerInterval:  null,
  translationOn:  false,
  currentMatch:   null, // pair object for open Case Study
  phase:          'reveal' // 'reveal' | 'match'
};

// ─── DOM refs ─────────────────────────────────────────────────────
const boardEl         = document.getElementById('game-board');
const scoreEl         = document.getElementById('score');
const pairsFoundEl    = document.getElementById('pairs-found');
const timerEl         = document.getElementById('timer');
const roundEl         = document.getElementById('round');
const newGameBtn      = document.getElementById('new-game-btn');
const confirmMatchBtn = document.getElementById('confirm-match-btn');
const roundBanner     = document.getElementById('round-banner');
const roundBannerMsg  = document.getElementById('round-banner-msg');
const nextRoundBtn    = document.getElementById('next-round-btn');
const gameCompleteEl  = document.getElementById('game-complete');
const gameCompleteMsg = document.getElementById('game-complete-msg');
const playAgainBtn    = document.getElementById('play-again-btn');
const modal           = document.getElementById('case-study-modal');
const closeModalBtn   = document.getElementById('close-modal-btn');
const toggleTransBtn  = document.getElementById('toggle-translation-btn');

// ─── Utilities ────────────────────────────────────────────────────

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Wrap occurrences of keywords in `text` with <mark> elements.
 * Matching is case-insensitive.
 */
function highlightKeywords(text, keywords) {
  if (!keywords || !keywords.length) return escapeHtml(text);
  let escaped = escapeHtml(text);
  // Sort longest first so overlapping phrases match correctly
  const sorted = keywords.slice().sort((a, b) => b.length - a.length);
  sorted.forEach(kw => {
    const re = new RegExp(escapeRegex(escapeHtml(kw)), 'gi');
    escaped = escaped.replace(re, match => `<mark>${match}</mark>`);
  });
  return escaped;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Timer ────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  state.timerInterval = setInterval(() => {
    state.timerSecs++;
    timerEl.textContent = formatTime(state.timerSecs);
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ─── Game initialisation ──────────────────────────────────────────

function newGame() {
  stopTimer();
  hideModal();
  hideBanners();

  state.score       = 0;
  state.pairsFound  = 0;
  state.timerSecs   = 0;
  state.roundIndex  = 0;
  state.allPairs    = shuffle(PAPERS_DATA);
  state.totalPairs  = state.allPairs.length;

  updateScoreDisplay();
  timerEl.textContent = '00:00';
  roundEl.textContent = '1';
  updateConfirmButton();

  loadRound();
  startTimer();
}

/**
 * Load the next batch of PAIRS_PER_ROUND pairs and render the board.
 */
function loadRound() {
  const start = state.roundIndex * PAIRS_PER_ROUND;
  state.roundPairs = state.allPairs.slice(start, start + PAIRS_PER_ROUND);

  // Build flat card list: one EN + one CN per pair, then shuffle
  const cards = [];
  state.roundPairs.forEach(pair => {
    cards.push({ pairId: pair.id, type: 'en', matched: false, el: null });
    cards.push({ pairId: pair.id, type: 'cn', matched: false, el: null });
  });
  state.cards   = shuffle(cards);
  state.flipped = [];
  state.locked  = false;
  state.phase   = 'reveal';

  updateConfirmButton();
  renderBoard();
  // Reveal phase: flip all cards face-up so the player can study them
  state.cards.forEach((_, idx) => flipCard(idx, true, false));
}

// ─── Rendering ────────────────────────────────────────────────────

function renderBoard() {
  boardEl.innerHTML = '';

  state.cards.forEach((card, idx) => {
    const pair = PAPERS_DATA.find(p => p.id === card.pairId);
    const el   = createCardElement(card, pair, idx);
    card.el    = el;
    boardEl.appendChild(el);
  });
}

function createCardElement(card, pair, idx) {
  const wrapper = document.createElement('div');
  wrapper.className = 'aa-card';
  wrapper.setAttribute('role', 'listitem');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('aria-label',
    card.type === 'en'
      ? `English paper: ${pair.title_en}`
      : `Chinese paper: ${pair.title_cn}`
  );

  // ── Back face
  const back = document.createElement('div');
  back.className = 'aa-card__face aa-card__back';
  back.innerHTML = `
    <div class="aa-card__back-tab"></div>
    <div class="aa-card__back-seal">CLASSIFIED<br>ACADEMIC<br>AUDIT</div>
    <div class="aa-card__back-logo">THE ACADEMIC AUDITOR</div>
  `;

  // ── Front face
  const typeClass = card.type === 'en' ? 'aa-card__front--en' : 'aa-card__front--cn';
  const badgeClass = card.type === 'en' ? 'aa-card__type-badge--en' : 'aa-card__type-badge--cn';
  const badgeText  = card.type === 'en' ? 'ORIGINAL PAPER' : '影子文献 / SHADOW';

  const title   = card.type === 'en' ? pair.title_en   : pair.title_cn;
  const authors = card.type === 'en' ? pair.authors_en : pair.authors_cn;
  const journal = card.type === 'en' ? pair.journal_en : pair.journal_cn;
  const year    = card.type === 'en' ? pair.year_en    : pair.year_cn;
  const abstract = card.type === 'en' ? pair.abstract_en : pair.abstract_cn;

  const front = document.createElement('div');
  front.className = `aa-card__face aa-card__front ${typeClass}`;
  front.innerHTML = `
    <div class="aa-card__type-badge ${badgeClass}">${badgeText}</div>
    <div class="aa-card__body">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:4px">
        <span class="aa-card__journal">${escapeHtml(journal)}</span>
        <span class="aa-card__year">${year}</span>
      </div>
      <p class="aa-card__title">${escapeHtml(title)}</p>
      <p class="aa-card__authors">${escapeHtml(authors)}</p>
      <hr class="aa-card__rule">
      <p class="aa-card__abstract">${escapeHtml(abstract.slice(0, 160))}…</p>
    </div>
  `;

  // ── Inner (3D container)
  const inner = document.createElement('div');
  inner.className = 'aa-card__inner';
  inner.appendChild(back);
  inner.appendChild(front);
  wrapper.appendChild(inner);

  // ── Events
  wrapper.addEventListener('click', () => handleCardClick(idx));
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(idx);
    }
  });

  return wrapper;
}

// ─── Card interaction ─────────────────────────────────────────────

function handleCardClick(idx) {
  if (state.locked) return;
  if (state.phase === 'reveal') return;  // cards are just being studied
  const card = state.cards[idx];
  if (card.matched) return;

  if (state.flipped.includes(idx)) {
    // Toggle off: unflip this card
    flipCard(idx, false);
    state.flipped = state.flipped.filter(i => i !== idx);
  } else {
    if (state.flipped.length >= 2) return; // enforce max 2 selected cards
    // Flip face-up
    flipCard(idx, true);
    state.flipped.push(idx);
  }

  updateConfirmButton();
}

function flipCard(idx, faceUp, selected = true) {
  const card = state.cards[idx];
  if (faceUp) {
    card.el.classList.add('is-flipped');
    if (selected) card.el.classList.add('is-selected');
  } else {
    card.el.classList.remove('is-flipped', 'is-selected');
  }
}

function checkMatch() {
  // Group flipped card indices by pairId
  const groups = {};
  state.flipped.forEach(i => {
    const card = state.cards[i];
    if (!groups[card.pairId]) groups[card.pairId] = [];
    groups[card.pairId].push(i);
  });

  // Valid selection: every pairId has exactly one EN and one CN card
  let allValid = true;
  const matchedPairIds = [];
  for (const pairId in groups) {
    const indices = groups[pairId];
    const types = indices.map(i => state.cards[i].type);
    if (indices.length !== 2 || !types.includes('en') || !types.includes('cn')) {
      allValid = false;
      break;
    }
    matchedPairIds.push(Number(pairId));
  }

  if (allValid && matchedPairIds.length > 0) {
    // ── All selected cards form valid pairs
    state.flipped.forEach(i => {
      state.cards[i].matched = true;
      state.cards[i].el.classList.add('is-matched');
      state.cards[i].el.classList.remove('is-selected');
    });

    state.score      += MATCH_POINTS * matchedPairIds.length;
    state.pairsFound += matchedPairIds.length;
    updateScoreDisplay();

    // Show Case Study for the first matched pair
    const pair = PAPERS_DATA.find(p => p.id === matchedPairIds[0]);
    setTimeout(() => openCaseStudy(pair), 600);

    state.flipped = [];
    // locked stays true until Case Study is closed
  } else {
    // ── Mismatch
    state.score = Math.max(0, state.score - MISMATCH_PENALTY);
    updateScoreDisplay();

    state.flipped.forEach(i => {
      state.cards[i].el.classList.add('is-wrong');
      state.cards[i].el.classList.remove('is-selected');
    });

    setTimeout(() => {
      state.flipped.forEach(i => {
        flipCard(i, false);
        state.cards[i].el.classList.remove('is-wrong');
      });
      state.flipped = [];
      state.locked  = false;
      updateConfirmButton();
    }, FLIP_BACK_DELAY);
  }
}

// ─── Confirm Match button ─────────────────────────────────────────

function updateConfirmButton() {
  if (state.phase === 'reveal') {
    confirmMatchBtn.disabled = false;
    confirmMatchBtn.textContent = 'Start Matching ▶';
  } else {
    confirmMatchBtn.disabled = state.flipped.length !== 2 || state.locked;
    confirmMatchBtn.textContent = 'Confirm Match';
  }
}

function handleConfirmMatch() {
  if (state.phase === 'reveal') {
    // Transition to match phase: flip all unmatched cards back face-down
    state.cards.forEach((card, idx) => {
      if (!card.matched) flipCard(idx, false);
    });
    state.phase = 'match';
    state.flipped = [];
    updateConfirmButton();
    return;
  }
  if (state.flipped.length !== 2 || state.locked) return;
  state.locked = true;
  updateConfirmButton();
  checkMatch();
}

// ─── Score display ────────────────────────────────────────────────

function updateScoreDisplay() {
  scoreEl.textContent = state.score;
  const roundMatched  = state.cards.filter(c => c.matched).length / 2;
  pairsFoundEl.textContent = `${roundMatched} / ${state.roundPairs.length}`;
}

// ─── Case Study Modal ─────────────────────────────────────────────

function openCaseStudy(pair) {
  state.currentMatch  = pair;
  state.translationOn = false;

  // Header
  document.getElementById('cs-methodology').textContent = pair.methodology_key;
  document.getElementById('cs-method-badge').textContent = pair.methodology_key;

  // English paper
  document.getElementById('cs-journal-en').textContent = pair.journal_en;
  document.getElementById('cs-year-en').textContent    = pair.year_en;
  document.getElementById('cs-title-en').textContent   = pair.title_en;
  document.getElementById('cs-authors-en').textContent = pair.authors_en;
  document.getElementById('cs-abstract-en').innerHTML  =
    highlightKeywords(pair.abstract_en, pair.highlights_en);

  // Chinese paper
  document.getElementById('cs-journal-cn').textContent = pair.journal_cn;
  document.getElementById('cs-year-cn').textContent    = pair.year_cn;
  document.getElementById('cs-title-cn').textContent   = pair.title_cn;
  document.getElementById('cs-authors-cn').textContent = pair.authors_cn;
  document.getElementById('cs-abstract-cn').innerHTML  =
    highlightKeywords(pair.abstract_cn, pair.highlights_cn);

  // Translation pane (reset)
  document.getElementById('cs-translation').classList.add('hidden');
  toggleTransBtn.textContent = 'Toggle Translation';
  toggleTransBtn.setAttribute('aria-pressed', 'false');

  // Score notice
  document.getElementById('cs-score-award').textContent = MATCH_POINTS;

  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
  state.currentMatch = null;
  state.flipped      = [];
  state.locked       = false;
  updateConfirmButton();

  // Check if this round is complete
  checkRoundComplete();
}

function checkRoundComplete() {
  const allMatched = state.cards.every(c => c.matched);
  if (!allMatched) return;

  const isLastRound =
    (state.roundIndex + 1) * PAIRS_PER_ROUND >= state.allPairs.length;

  if (isLastRound) {
    stopTimer();
    gameCompleteMsg.textContent =
      `You matched all ${state.totalPairs} paper pairs! ` +
      `Final score: ${state.score} pts — Time: ${formatTime(state.timerSecs)}`;
    gameCompleteEl.classList.remove('hidden');
  } else {
    roundBannerMsg.textContent =
      `Round ${state.roundIndex + 1} complete! ` +
      `Score so far: ${state.score} pts`;
    roundBanner.classList.remove('hidden');
  }
}

function hideBanners() {
  roundBanner.classList.add('hidden');
  gameCompleteEl.classList.add('hidden');
}

function advanceRound() {
  hideBanners();
  state.roundIndex++;
  roundEl.textContent = state.roundIndex + 1;
  loadRound();
}

// ─── Translation toggle ───────────────────────────────────────────

function toggleTranslation() {
  state.translationOn = !state.translationOn;
  const pane = document.getElementById('cs-translation');
  const pair = state.currentMatch;

  if (state.translationOn && pair) {
    // NOTE: A production implementation would use a real translation API.
    // Here we display the corresponding English abstract as a placeholder
    // to illustrate the feature; the prefix makes the limitation explicit.
    document.getElementById('cs-abstract-cn-translated').textContent =
      '[Placeholder — EN abstract shown] ' + pair.abstract_en;
    pane.classList.remove('hidden');
    toggleTransBtn.textContent = 'Hide Translation';
    toggleTransBtn.setAttribute('aria-pressed', 'true');
  } else {
    pane.classList.add('hidden');
    toggleTransBtn.textContent = 'Toggle Translation';
    toggleTransBtn.setAttribute('aria-pressed', 'false');
  }
}

// ─── Event listeners ─────────────────────────────────────────────

newGameBtn.addEventListener('click', newGame);
confirmMatchBtn.addEventListener('click', handleConfirmMatch);
nextRoundBtn.addEventListener('click', advanceRound);
playAgainBtn.addEventListener('click', newGame);
closeModalBtn.addEventListener('click', hideModal);
toggleTransBtn.addEventListener('click', toggleTranslation);

// Close modal on overlay click
modal.querySelector('.aa-modal__overlay').addEventListener('click', hideModal);

// Keyboard: Escape closes modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    hideModal();
  }
});

// ─── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', newGame);

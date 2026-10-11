/**
 * Main Web Application orchestrating Character Select UI, In-Game HUD,
 * and the 60FPS Game Loop for Brawlhalla Web.
 */

import { CHARACTERS, getCharacterById } from './game/characterData.js';
import { GameDirector } from './game/game.js';

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const characterSelectScreen = document.getElementById('characterSelectScreen');
const gameHud = document.getElementById('gameHud');
const victoryScreen = document.getElementById('victoryScreen');
const pauseScreen = document.getElementById('pauseScreen');

// Character Selection Panels
const p1Preview = document.getElementById('p1-preview');
const p1Name = document.getElementById('p1-name');
const p1Title = document.getElementById('p1-title');
const p1Weapons = document.getElementById('p1-weapons');
const p1Stats = document.getElementById('p1-stats');
const p1Desc = document.getElementById('p1-desc');

const p2Tag = document.getElementById('p2-tag');
const p2Preview = document.getElementById('p2-preview');
const p2Name = document.getElementById('p2-name');
const p2Title = document.getElementById('p2-title');
const p2Weapons = document.getElementById('p2-weapons');
const p2Stats = document.getElementById('p2-stats');
const p2Desc = document.getElementById('p2-desc');

const rosterGrid = document.getElementById('rosterGrid');
const startFightBtn = document.getElementById('startFightBtn');
const modeSelect = document.getElementById('modeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const stocksSelect = document.getElementById('stocksSelect');
const cpuDifficultyGroup = document.getElementById('cpuDifficultyGroup');

// HUD Elements
const hudP1Name = document.getElementById('hudP1Name');
const hudP1Stocks = document.getElementById('hudP1Stocks');
const hudP1Damage = document.getElementById('hudP1Damage');
const hudP1Avatar = document.getElementById('hudP1Avatar');

const hudP2Name = document.getElementById('hudP2Name');
const hudP2Stocks = document.getElementById('hudP2Stocks');
const hudP2Damage = document.getElementById('hudP2Damage');
const hudP2Avatar = document.getElementById('hudP2Avatar');
const matchTimer = document.getElementById('matchTimer');

// Victory & Pause Elements
const winnerText = document.getElementById('winnerText');
const matchStats = document.getElementById('matchStats');
const rematchBtn = document.getElementById('rematchBtn');
const characterSelectBtn = document.getElementById('characterSelectBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const quitBtn = document.getElementById('quitBtn');

// Active Selections
let selectedP1Id = 'bodvar';
let selectedP2Id = 'hattori';

// UI Hooks for GameDirector
const uiHooks = {
  onMatchStart: ({ p1, p2, maxStocks }) => {
    characterSelectScreen.classList.remove('active');
    victoryScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    gameHud.classList.add('active');

    hudP1Name.textContent = p1.config.name;
    hudP2Name.textContent = p2.config.name;

    renderHudAvatars(p1.config, p2.config);
    updateStockDisplay(hudP1Stocks, p1.stocks, maxStocks);
    updateStockDisplay(hudP2Stocks, p2.stocks, maxStocks);
  },

  onHudUpdate: ({ p1, p2, timer }) => {
    // P1 Damage HUD
    hudP1Damage.textContent = `${Math.round(p1.damage)}%`;
    hudP1Damage.style.color = getDamageColor(p1.damage);

    // P2 Damage HUD
    hudP2Damage.textContent = `${Math.round(p2.damage)}%`;
    hudP2Damage.style.color = getDamageColor(p2.damage);

    // Stocks
    updateStockDisplay(hudP1Stocks, p1.stocks, director.maxStocks);
    updateStockDisplay(hudP2Stocks, p2.stocks, director.maxStocks);

    // Timer (MM:SS)
    const minutes = Math.floor(timer / 60);
    const seconds = Math.floor(timer % 60);
    matchTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  onMatchEnd: ({ winner, loser, stats }) => {
    gameHud.classList.remove('active');
    victoryScreen.classList.add('active');

    winnerText.textContent = `${winner.config.name} WINS!`;
    winnerText.style.color = winner.config.secondaryColor;

    matchStats.innerHTML = `
      <div><strong>Damage Dealt:</strong> ${stats.winnerDamage}% vs ${stats.loserDamage}%</div>
      <div><strong>Knockouts (KOs):</strong> ${stats.winnerKOs}</div>
      <div><strong>Attack Accuracy:</strong> ${stats.winnerAccuracy}%</div>
    `;
  },

  onPauseChange: (isPaused) => {
    if (isPaused) pauseScreen.classList.add('active');
    else pauseScreen.classList.remove('active');
  }
};

// Initialize Game Director
const director = new GameDirector(canvas, uiHooks);

// Initialize Roster UI
function initRosterUI() {
  rosterGrid.innerHTML = '';

  CHARACTERS.forEach(char => {
    const card = document.createElement('div');
    card.className = 'roster-card';
    card.dataset.id = char.id;

    // Small SVG Icon for Character
    const icon = document.createElement('div');
    icon.className = 'roster-icon';
    icon.style.background = `radial-gradient(circle, ${char.primaryColor} 0%, #0f172a 100%)`;
    icon.style.border = `2px solid ${char.secondaryColor}`;
    icon.innerHTML = `<span style="font-size: 24px;">${getWeaponEmoji(char.weaponType)}</span>`;

    const name = document.createElement('div');
    name.className = 'roster-card-name';
    name.textContent = char.name;

    card.appendChild(icon);
    card.appendChild(name);

    // Left click selects P1, Right click selects P2
    card.addEventListener('click', () => {
      selectedP1Id = char.id;
      updateSelections();
    });

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      selectedP2Id = char.id;
      updateSelections();
    });

    rosterGrid.appendChild(card);
  });

  updateSelections();
}

function getWeaponEmoji(type) {
  switch (type) {
    case 'sword': return '⚔️';
    case 'blasters': return '🔫';
    case 'lance': return '🚀';
    case 'katars': return '🗡️';
    case 'spear': return '🔱';
    default: return '🥊';
  }
}

function updateSelections() {
  const p1 = getCharacterById(selectedP1Id);
  const p2 = getCharacterById(selectedP2Id);

  // Update Roster Card Highlights
  document.querySelectorAll('.roster-card').forEach(card => {
    const id = card.dataset.id;
    card.classList.remove('p1-selected', 'p2-selected', 'both-selected');

    // Remove existing markers
    card.querySelectorAll('.selection-marker').forEach(m => m.remove());

    if (id === selectedP1Id && id === selectedP2Id) {
      card.classList.add('both-selected');
      card.innerHTML += `<div class="selection-marker p1-marker">P1</div><div class="selection-marker p2-marker">P2</div>`;
    } else if (id === selectedP1Id) {
      card.classList.add('p1-selected');
      card.innerHTML += `<div class="selection-marker p1-marker">P1</div>`;
    } else if (id === selectedP2Id) {
      card.classList.add('p2-selected');
      card.innerHTML += `<div class="selection-marker p2-marker">P2</div>`;
    }
  });

  // Update P1 Panel
  renderLegendPanel(p1, p1Preview, p1Name, p1Title, p1Weapons, p1Stats, p1Desc);

  // Update P2 Panel
  const mode = modeSelect.value;
  p2Tag.textContent = mode === 'pvp' ? 'PLAYER 2' : (mode === 'training' ? 'DUMMY BOT' : 'PLAYER 2 (CPU)');
  renderLegendPanel(p2, p2Preview, p2Name, p2Title, p2Weapons, p2Stats, p2Desc);
}

function renderLegendPanel(legend, previewEl, nameEl, titleEl, weaponsEl, statsEl, descEl) {
  nameEl.textContent = legend.name;
  titleEl.textContent = legend.title;
  weaponsEl.textContent = `${getWeaponEmoji(legend.weaponType)} ${legend.weapons}`;
  descEl.textContent = legend.lore;

  // Portrait circle preview
  previewEl.style.background = `radial-gradient(circle, ${legend.primaryColor} 0%, #0d1527 100%)`;
  previewEl.style.borderColor = legend.secondaryColor;
  previewEl.innerHTML = `
    <div style="font-size: 52px; transform: scale(1.1); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
      ${getWeaponEmoji(legend.weaponType)}
    </div>
  `;

  // Stat Bars
  const stats = legend.stats;
  statsEl.innerHTML = `
    <div class="stat-row">
      <span class="stat-label">Strength</span>
      <div class="stat-track"><div class="stat-fill str" style="width: ${stats.str * 10}%;"></div></div>
    </div>
    <div class="stat-row">
      <span class="stat-label">Dexterity</span>
      <div class="stat-track"><div class="stat-fill dex" style="width: ${stats.dex * 10}%;"></div></div>
    </div>
    <div class="stat-row">
      <span class="stat-label">Defense</span>
      <div class="stat-track"><div class="stat-fill def" style="width: ${stats.def * 10}%;"></div></div>
    </div>
    <div class="stat-row">
      <span class="stat-label">Speed</span>
      <div class="stat-track"><div class="stat-fill spd" style="width: ${stats.spd * 10}%;"></div></div>
    </div>
  `;
}

function renderHudAvatars(p1Cfg, p2Cfg) {
  hudP1Avatar.style.background = p1Cfg.primaryColor;
  hudP1Avatar.innerHTML = `<span style="font-size: 26px;">${getWeaponEmoji(p1Cfg.weaponType)}</span>`;

  hudP2Avatar.style.background = p2Cfg.primaryColor;
  hudP2Avatar.innerHTML = `<span style="font-size: 26px;">${getWeaponEmoji(p2Cfg.weaponType)}</span>`;
}

function updateStockDisplay(container, currentStocks, maxStocks) {
  container.innerHTML = '';
  for (let i = 0; i < maxStocks; i++) {
    const pip = document.createElement('div');
    pip.className = 'stock-pip' + (i >= currentStocks ? ' lost' : '');
    container.appendChild(pip);
  }
}

function getDamageColor(damage) {
  if (damage < 40) return '#ffffff';
  if (damage < 80) return '#facc15'; // Yellow
  if (damage < 130) return '#fb923c'; // Orange
  if (damage < 200) return '#ef4444'; // Red
  return '#991b1b'; // Dark KO Danger Red
}

// Mode change handler
modeSelect.addEventListener('change', () => {
  const isPvP = modeSelect.value === 'pvp';
  cpuDifficultyGroup.style.display = isPvP ? 'none' : 'flex';
  updateSelections();
});

// Start Fight Button
startFightBtn.addEventListener('click', () => {
  const p1 = getCharacterById(selectedP1Id);
  const p2 = getCharacterById(selectedP2Id);
  director.startMatch(p1, p2, modeSelect.value, difficultySelect.value, stocksSelect.value);
});

// Rematch Button
rematchBtn.addEventListener('click', () => {
  const p1 = getCharacterById(selectedP1Id);
  const p2 = getCharacterById(selectedP2Id);
  director.startMatch(p1, p2, modeSelect.value, difficultySelect.value, stocksSelect.value);
});

// Character Select Button
characterSelectBtn.addEventListener('click', () => {
  victoryScreen.classList.remove('active');
  characterSelectScreen.classList.add('active');
});

// Pause Menu Buttons
resumeBtn.addEventListener('click', () => director.togglePause());
restartBtn.addEventListener('click', () => {
  const p1 = getCharacterById(selectedP1Id);
  const p2 = getCharacterById(selectedP2Id);
  director.startMatch(p1, p2, modeSelect.value, difficultySelect.value, stocksSelect.value);
});
quitBtn.addEventListener('click', () => {
  director.isRunning = false;
  pauseScreen.classList.remove('active');
  gameHud.classList.remove('active');
  characterSelectScreen.classList.add('active');
});

// 60FPS Game Loop
let lastTime = performance.now();

function gameLoop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta time at 50ms
  lastTime = currentTime;

  director.update(dt);
  director.render();

  requestAnimationFrame(gameLoop);
}

// Initialize on Load
initRosterUI();
requestAnimationFrame(gameLoop);

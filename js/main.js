/**
 * NEON DASH - Main Application Orchestrator
 * Connects UI modals, level selection slider, editor flows, and responsive canvas sizing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Master Game
  window.game = new Game();

  let selectedLevelId = 1;
  const totalOfficialLevels = window.OFFICIAL_LEVELS ? window.OFFICIAL_LEVELS.length : 4;

  // --- Modal Open / Close Helpers ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('active');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.classList.add('hidden');
    }
  }

  // Handle all close buttons with data-close
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-close');
      closeModal(targetId);
      if (window.soundEngine) window.soundEngine.playClick();
    });
  });

  // Audio Context unlock on first touch/click
  const unlockAudio = () => {
    if (window.soundEngine) window.soundEngine.resume();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // --- Main Menu Buttons ---
  const btnPlay = document.getElementById('btn-play-game');
  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      updateLevelSelectCard(selectedLevelId);
      openModal('modal-level-select');
    });
  }

  const btnGarage = document.getElementById('btn-open-garage');
  if (btnGarage) {
    btnGarage.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      openModal('modal-garage');
      if (window.customizer) window.customizer.renderPreviews();
    });
  }

  const btnEditor = document.getElementById('btn-open-editor');
  if (btnEditor) {
    btnEditor.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      closeModal('main-menu');
      openModal('screen-editor');
      if (window.levelEditor) window.levelEditor.open();
    });
  }

  const btnLeaderboard = document.getElementById('btn-open-leaderboard');
  if (btnLeaderboard) {
    btnLeaderboard.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      openModal('modal-leaderboard');
      renderLeaderboardView(1);
    });
  }

  const btnHelp = document.getElementById('btn-open-help');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      openModal('modal-help');
    });
  }

  // --- Level Select Carousel ---
  function updateLevelSelectCard(levelId) {
    selectedLevelId = levelId;
    const cardWrapper = document.getElementById('current-level-card');
    const level = window.OFFICIAL_LEVELS.find(l => l.id === levelId) || window.OFFICIAL_LEVELS[0];
    const userStats = window.leaderboardManager ? window.leaderboardManager.getUserStats() : {};
    const lvlStat = userStats[levelId] || { progress: 0, attempts: 0 };

    if (cardWrapper) {
      cardWrapper.innerHTML = `
        <div class="level-badge ${level.difficultyClass}">${level.difficultyLabel}</div>
        <div class="level-name">${level.name}</div>
        <div class="level-meta">Kecepatan: ${level.speed}x • Tempo: ${level.bpm} BPM</div>
        <div class="level-stats-row">
          <div class="level-stat">
            <span class="level-stat-lbl">REKOR KEMAJUAN</span>
            <span class="level-stat-val">${lvlStat.progress}%</span>
          </div>
          <div class="level-stat">
            <span class="level-stat-lbl">TOTAL PERCOBAAN</span>
            <span class="level-stat-val">${lvlStat.attempts}</span>
          </div>
        </div>
      `;
    }

    // Update dots
    const dotsContainer = document.getElementById('level-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 1; i <= totalOfficialLevels; i++) {
        const dot = document.createElement('div');
        dot.className = `level-dot ${i === levelId ? 'active' : ''}`;
        dot.addEventListener('click', () => updateLevelSelectCard(i));
        dotsContainer.appendChild(dot);
      }
    }
  }

  const btnPrevLvl = document.getElementById('btn-prev-level');
  if (btnPrevLvl) {
    btnPrevLvl.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      let nextId = selectedLevelId - 1;
      if (nextId < 1) nextId = totalOfficialLevels;
      updateLevelSelectCard(nextId);
    });
  }

  const btnNextLvl = document.getElementById('btn-next-level');
  if (btnNextLvl) {
    btnNextLvl.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      let nextId = selectedLevelId + 1;
      if (nextId > totalOfficialLevels) nextId = 1;
      updateLevelSelectCard(nextId);
    });
  }

  const btnStartLvl = document.getElementById('btn-start-selected-level');
  if (btnStartLvl) {
    btnStartLvl.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      closeModal('modal-level-select');
      closeModal('main-menu');
      window.game.startLevel(selectedLevelId, false);
    });
  }

  const btnStartPractice = document.getElementById('btn-start-practice');
  if (btnStartPractice) {
    btnStartPractice.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      closeModal('modal-level-select');
      closeModal('main-menu');
      window.game.startLevel(selectedLevelId, true);
    });
  }

  // --- Level Editor Actions ---
  const btnEditorPlaytest = document.getElementById('btn-editor-playtest');
  if (btnEditorPlaytest) {
    btnEditorPlaytest.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      closeModal('screen-editor');
      window.game.startLevel(1, false, true);
    });
  }

  const btnEditorExit = document.getElementById('btn-editor-exit');
  if (btnEditorExit) {
    btnEditorExit.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      closeModal('screen-editor');
      openModal('main-menu');
    });
  }

  // --- Leaderboard Tab Switching ---
  function renderLeaderboardView(levelId) {
    const tbody = document.getElementById('leaderboard-tbody');
    const status = document.getElementById('user-rank-status');
    if (window.leaderboardManager) {
      window.leaderboardManager.renderToTable(levelId, tbody, status);
    }
  }

  const lbTabs = document.querySelectorAll('#leaderboard-level-tabs .tab-btn');
  lbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      lbTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lvl = parseInt(tab.dataset.level, 10);
      renderLeaderboardView(lvl);
      if (window.soundEngine) window.soundEngine.playClick();
    });
  });

  // --- Responsive Canvas Resizing ---
  function handleResize() {
    const wrapper = document.getElementById('game-wrapper');
    const canvas = document.getElementById('gameCanvas');
    if (!wrapper || !canvas) return;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const targetRatio = 16 / 9;
    const currentRatio = winW / winH;

    let targetW, targetH;

    if (currentRatio > targetRatio) {
      // Screen is wider than 16:9
      targetH = winH;
      targetW = winH * targetRatio;
    } else {
      // Screen is taller than 16:9 (e.g. mobile portrait or square)
      targetW = winW;
      targetH = winW / targetRatio;
    }

    wrapper.style.width = `${targetW}px`;
    wrapper.style.height = `${targetH}px`;
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 150);
  });
  handleResize();
});

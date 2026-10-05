/**
 * NEON DASH - Main Game Engine
 * 60 FPS Render Loop, State Management, Parallax Graphics, Beat Sync & Mobile Controls.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'
    this.currentLevelIndex = 1;
    this.currentLevel = null;
    this.isPracticeMode = false;
    this.isPlaytest = false;

    this.player = null;
    this.cameraX = 0;
    this.attempts = 1;
    this.practiceCheckpoints = []; // [{x, y, vy, gravityDir, rotation}]
    
    // Beat pulse visual reaction
    this.beatScale = 1.0;
    this.screenShake = 0;

    // Viewport & Scale setup
    this.virtualWidth = 960;
    this.virtualHeight = 540;

    this.setupAudioBeatSync();
    this.setupInputListeners();
    this.startLoop();
  }

  setupAudioBeatSync() {
    if (window.soundEngine) {
      window.soundEngine.onBeat = (beatNumber) => {
        // Kick & snare create visual pulse
        this.beatScale = 1.08;
      };
    }
  }

  setupInputListeners() {
    // 1. Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (this.state === 'PLAYING') {
          this.triggerJump();
          e.preventDefault();
        } else if (this.state === 'GAMEOVER') {
          this.restartLevel();
          e.preventDefault();
        }
      } else if (e.code === 'KeyZ' && this.isPracticeMode && this.state === 'PLAYING') {
        this.placeCheckpoint();
      } else if (e.code === 'KeyX' && this.isPracticeMode && this.state === 'PLAYING') {
        this.removeCheckpoint();
      } else if (e.code === 'Escape' && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
        this.togglePause();
      }
    });

    // 2. Mouse & Touch on Canvas / Screen
    const onActionPress = (e) => {
      // Avoid triggering when tapping HUD buttons
      if (e.target.closest('button') || e.target.closest('.hud-top-bar') || e.target.closest('.practice-controls')) {
        return;
      }

      if (this.state === 'PLAYING') {
        this.triggerJump();
      } else if (this.state === 'GAMEOVER') {
        this.restartLevel();
      }
    };

    this.canvas.addEventListener('mousedown', onActionPress);
    this.canvas.addEventListener('touchstart', (e) => {
      onActionPress(e);
      // Prevent double-tap zooming on mobile
      if (this.state === 'PLAYING') e.preventDefault();
    }, { passive: false });

    // Practice controls in HUD
    const btnPlaceCp = document.getElementById('btn-place-checkpoint');
    if (btnPlaceCp) {
      btnPlaceCp.addEventListener('click', (e) => {
        e.stopPropagation();
        this.placeCheckpoint();
      });
    }

    const btnRemoveCp = document.getElementById('btn-remove-checkpoint');
    if (btnRemoveCp) {
      btnRemoveCp.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCheckpoint();
      });
    }

    // Pause button in HUD
    const btnPause = document.getElementById('btn-hud-pause');
    if (btnPause) {
      btnPause.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePause();
      });
    }

    // Practice toggle in HUD
    const btnPracticeToggle = document.getElementById('btn-hud-practice');
    if (btnPracticeToggle) {
      btnPracticeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isPracticeMode = !this.isPracticeMode;
        this.updatePracticeModeUI();
      });
    }

    // Sound toggle in HUD
    const btnSound = document.getElementById('btn-hud-sound');
    if (btnSound) {
      btnSound.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.soundEngine) {
          const muted = window.soundEngine.toggleMute();
          const soundIcon = document.getElementById('sound-icon');
          if (soundIcon) soundIcon.textContent = muted ? '🔇' : '🔊';
        }
      });
    }

    // Modal Results Restart buttons
    const btnRestart = document.getElementById('btn-restart-game');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restartLevel());
    }

    const btnReplay = document.getElementById('btn-victory-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => this.restartLevel());
    }

    const btnNext = document.getElementById('btn-victory-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.currentLevelIndex = (this.currentLevelIndex % window.OFFICIAL_LEVELS.length) + 1;
        this.startLevel(this.currentLevelIndex);
      });
    }

    // Pause modal buttons
    const btnResume = document.getElementById('btn-resume-game');
    if (btnResume) {
      btnResume.addEventListener('click', () => this.togglePause());
    }

    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        this.togglePause();
        this.restartLevel();
      });
    }

    const btnPauseMenu = document.getElementById('btn-pause-menu');
    if (btnPauseMenu) {
      btnPauseMenu.addEventListener('click', () => {
        this.togglePause();
        this.returnToMenu();
      });
    }

    const btnGameOverMenu = document.getElementById('btn-game-over-menu');
    if (btnGameOverMenu) {
      btnGameOverMenu.addEventListener('click', () => this.returnToMenu());
    }

    const btnVictoryMenu = document.getElementById('btn-victory-menu');
    if (btnVictoryMenu) {
      btnVictoryMenu.addEventListener('click', () => this.returnToMenu());
    }
  }

  triggerJump() {
    if (!this.player || !window.physicsEngine) return;
    window.physicsEngine.jump(this.player);
  }

  startLevel(levelId, practice = false, playtest = false) {
    this.isPracticeMode = practice;
    this.isPlaytest = playtest;
    this.practiceCheckpoints = [];

    if (playtest) {
      this.currentLevel = window.levelEditor.customLevel;
    } else {
      this.currentLevelIndex = levelId;
      this.currentLevel = window.OFFICIAL_LEVELS.find(lvl => lvl.id === levelId) || window.OFFICIAL_LEVELS[0];
    }

    this.attempts = 1;
    this.resetPlayer();

    // Start audio
    if (window.soundEngine) {
      window.soundEngine.playMusic(this.currentLevel.id, this.currentLevel.bpm);
    }

    // Show HUD
    this.showHUD();
    this.updateHUDInfo();
    this.updatePracticeModeUI();

    // Hide modals
    document.querySelectorAll('.screen-overlay').forEach(el => {
      el.classList.remove('active');
      el.classList.add('hidden');
    });

    this.state = 'PLAYING';
  }

  resetPlayer() {
    this.player = window.physicsEngine.createPlayer();
    this.cameraX = 0;
    this.screenShake = 0;
    if (window.particleSystem) window.particleSystem.reset();
  }

  respawn() {
    this.attempts++;
    this.updateHUDInfo();

    if (this.isPracticeMode && this.practiceCheckpoints.length > 0) {
      // Respawn at last checkpoint
      const cp = this.practiceCheckpoints[this.practiceCheckpoints.length - 1];
      this.player.x = cp.x;
      this.player.y = cp.y;
      this.player.vy = 0;
      this.player.gravityDir = cp.gravityDir;
      this.player.rotation = cp.rotation;
      this.player.isDead = false;
      this.player.isGrounded = true;
      this.cameraX = Math.max(0, cp.x - 160);
      this.state = 'PLAYING';
      if (window.soundEngine) {
        window.soundEngine.playMusic(this.currentLevel.id, this.currentLevel.bpm);
      }
    } else {
      this.resetPlayer();
      this.state = 'PLAYING';
      if (window.soundEngine) {
        window.soundEngine.playMusic(this.currentLevel.id, this.currentLevel.bpm);
      }
    }
  }

  restartLevel() {
    const gameOverModal = document.getElementById('modal-game-over');
    if (gameOverModal) {
      gameOverModal.classList.remove('active');
      gameOverModal.classList.add('hidden');
    }

    const victoryModal = document.getElementById('modal-level-complete');
    if (victoryModal) {
      victoryModal.classList.remove('active');
      victoryModal.classList.add('hidden');
    }

    this.respawn();
  }

  placeCheckpoint() {
    if (!this.player || this.player.isDead || !this.isPracticeMode) return;
    this.practiceCheckpoints.push({
      x: this.player.x,
      y: this.player.y,
      gravityDir: this.player.gravityDir,
      rotation: this.player.rotation
    });
    if (window.soundEngine) window.soundEngine.playCheckpoint();
    if (window.particleSystem) {
      window.particleSystem.createBounceEffect(this.player.x + 15, this.player.y + 15, '#00ff66');
    }
  }

  removeCheckpoint() {
    if (this.practiceCheckpoints.length > 0) {
      this.practiceCheckpoints.pop();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (window.soundEngine) window.soundEngine.stopMusic();
      const pauseModal = document.getElementById('modal-pause');
      if (pauseModal) {
        pauseModal.classList.remove('hidden');
        pauseModal.classList.add('active');
      }
    } else if (this.state === 'PAUSED') {
      const pauseModal = document.getElementById('modal-pause');
      if (pauseModal) {
        pauseModal.classList.remove('active');
        pauseModal.classList.add('hidden');
      }
      this.state = 'PLAYING';
      if (window.soundEngine) {
        window.soundEngine.playMusic(this.currentLevel.id, this.currentLevel.bpm);
      }
    }
  }

  returnToMenu() {
    this.state = 'MENU';
    if (window.soundEngine) window.soundEngine.stopMusic();

    this.hideHUD();
    document.querySelectorAll('.screen-overlay').forEach(el => {
      el.classList.remove('active');
      el.classList.add('hidden');
    });

    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
      mainMenu.classList.remove('hidden');
      mainMenu.classList.add('active');
    }

    if (this.isPlaytest) {
      this.isPlaytest = false;
      const editorScreen = document.getElementById('screen-editor');
      if (editorScreen) {
        mainMenu.classList.remove('active');
        mainMenu.classList.add('hidden');
        editorScreen.classList.remove('hidden');
        editorScreen.classList.add('active');
        window.levelEditor.open();
      }
    }
  }

  // --- Game Over Sequence ---
  handleCrash() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.screenShake = 18;

    // SFX & Particles
    if (window.soundEngine) {
      window.soundEngine.stopMusic();
      window.soundEngine.playCrash();
    }

    const skin = window.customizer ? window.customizer.config : { primaryColor: '#00f0ff', secondaryColor: '#ff007f' };
    if (window.particleSystem) {
      window.particleSystem.createDeathExplosion(this.player.x, this.player.y, skin.primaryColor, skin.secondaryColor);
    }

    const progress = this.calculateProgress();

    // Record stats
    if (!this.isPracticeMode && !this.isPlaytest && window.leaderboardManager) {
      window.leaderboardManager.recordRun(this.currentLevel.id, progress, this.attempts, skin.playerName);
    }

    // Delay showing game over modal for 400ms to see explosion
    setTimeout(() => {
      if (this.state !== 'PLAYING' && this.state !== 'GAMEOVER') return;
      this.state = 'GAMEOVER';

      const progressEl = document.getElementById('game-over-progress');
      if (progressEl) progressEl.textContent = `${progress}%`;

      const attemptsEl = document.getElementById('game-over-attempts');
      if (attemptsEl) attemptsEl.textContent = this.attempts;

      const gameOverModal = document.getElementById('modal-game-over');
      if (gameOverModal) {
        gameOverModal.classList.remove('hidden');
        gameOverModal.classList.add('active');
      }
    }, 450);
  }

  // --- Victory Sequence ---
  handleWin() {
    if (this.player.hasWon) return;
    this.player.hasWon = true;

    if (window.soundEngine) {
      window.soundEngine.stopMusic();
      window.soundEngine.playVictory();
    }

    if (window.particleSystem) {
      window.particleSystem.createVictoryBurst(this.player.x, this.player.y);
    }

    // Record 100% win
    const skin = window.customizer ? window.customizer.config : { playerName: 'Player' };
    if (!this.isPracticeMode && !this.isPlaytest && window.leaderboardManager) {
      window.leaderboardManager.recordRun(this.currentLevel.id, 100, this.attempts, skin.playerName);
    }

    setTimeout(() => {
      this.state = 'VICTORY';
      const victoryModal = document.getElementById('modal-level-complete');
      const attemptsEl = document.getElementById('victory-attempts');
      const jumpsEl = document.getElementById('victory-jumps');

      if (attemptsEl) attemptsEl.textContent = this.attempts;
      if (jumpsEl) jumpsEl.textContent = this.player.jumpsCount;

      if (victoryModal) {
        victoryModal.classList.remove('hidden');
        victoryModal.classList.add('active');
      }
    }, 800);
  }

  calculateProgress() {
    if (!this.currentLevel || !this.currentLevel.objects) return 0;
    const finish = this.currentLevel.objects.find(o => o.type === 'finish_line');
    const finishX = finish ? finish.x * 30 : 3000;
    const pct = Math.min(100, Math.max(0, Math.floor((this.player.x / finishX) * 100)));
    return pct;
  }

  showHUD() {
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.remove('hidden');
  }

  hideHUD() {
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');
  }

  updateHUDInfo() {
    const nameEl = document.getElementById('hud-level-name');
    if (nameEl) nameEl.textContent = `${this.currentLevel.name}`;

    const attemptEl = document.getElementById('hud-attempt-counter');
    if (attemptEl) attemptEl.textContent = `Percobaan ${this.attempts}`;
  }

  updatePracticeModeUI() {
    const indicator = document.getElementById('practice-indicator');
    const controls = document.getElementById('practice-controls');
    if (indicator) {
      indicator.textContent = this.isPracticeMode ? 'LATIHAN' : 'NORMAL';
      indicator.style.color = this.isPracticeMode ? '#00ff66' : '#ffe600';
    }
    if (controls) {
      if (this.isPracticeMode) controls.classList.remove('hidden');
      else controls.classList.add('hidden');
    }
  }

  // --- Master Loop ---
  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Beat pulse decay
    if (this.beatScale > 1.0) {
      this.beatScale -= 0.015;
      if (this.beatScale < 1.0) this.beatScale = 1.0;
    }

    if (window.particleSystem) {
      window.particleSystem.update();
    }

    if (this.state === 'PLAYING' && this.player && this.currentLevel) {
      // 1. Update Physics
      window.physicsEngine.updatePlayer(this.player, this.currentLevel.speed);

      // 2. Camera follow (player stays around 20% from left of screen)
      this.cameraX = this.player.x - 160;

      // 3. Emit trail particles
      const skin = window.customizer ? window.customizer.config : { primaryColor: '#00f0ff', trail: 'sparks' };
      if (window.particleSystem) {
        window.particleSystem.emitTrail(this.player.x, this.player.y, skin.primaryColor, skin.trail, this.player.size);
      }

      // 4. Collisions
      window.physicsEngine.checkCollisions(
        this.player,
        this.currentLevel.objects,
        () => this.handleWin(),
        () => this.handleCrash()
      );

      // 5. Update HUD Progress Bar
      const progress = this.calculateProgress();
      const fillEl = document.getElementById('hud-progress-fill');
      const textEl = document.getElementById('hud-progress-text');
      if (fillEl) fillEl.style.width = `${progress}%`;
      if (textEl) textEl.textContent = `${progress}%`;
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.virtualWidth;
    const h = this.virtualHeight;

    ctx.save();

    // Screen Shake Offset
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Dynamic Parallax Background
    this.drawBackground(ctx, w, h);

    // 2. Level Objects
    if (this.currentLevel && this.currentLevel.objects) {
      for (const obj of this.currentLevel.objects) {
        const screenX = obj.x * 30 - this.cameraX;
        const screenY = obj.y * 30;

        // View frustum culling
        if (screenX + 40 < 0 || screenX > w + 40) continue;

        if (window.levelEditor) {
          window.levelEditor.drawObject(ctx, obj.type, screenX, screenY, 30);
        }
      }
    }

    // 3. Practice Checkpoints Pins
    if (this.isPracticeMode) {
      for (const cp of this.practiceCheckpoints) {
        const px = cp.x - this.cameraX + 15;
        const py = cp.y + 15;
        if (px >= -20 && px <= w + 20) {
          ctx.fillStyle = '#00ff66';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // 4. Particles & FX
    if (window.particleSystem) {
      window.particleSystem.draw(ctx, this.cameraX);
    }

    // 5. Draw Player Character
    if (this.player && !this.player.isDead) {
      const skin = window.customizer ? window.customizer.config : {
        iconId: 'cube_classic',
        primaryColor: '#00f0ff',
        secondaryColor: '#051026',
        glowColor: '#00f0ff'
      };

      const screenPlayerX = this.player.x - this.cameraX;
      window.customizer.drawIcon(
        ctx,
        screenPlayerX,
        this.player.y,
        this.player.size,
        skin.iconId,
        skin.primaryColor,
        skin.secondaryColor,
        skin.glowColor,
        this.player.rotation
      );
    }

    ctx.restore();
  }

  // --- Dynamic Parallax Synthwave Background ---
  drawBackground(ctx, w, h) {
    const theme = (this.currentLevel && this.currentLevel.theme) ? this.currentLevel.theme : {
      bgTop: '#08081a',
      bgBottom: '#1c1236',
      gridColor: 'rgba(0, 240, 255, 0.12)',
      floorColor: '#0a0d24',
      floorLine: '#00f0ff',
      floorGlow: '#00f0ff'
    };

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, theme.bgTop);
    skyGrad.addColorStop(0.8, theme.bgBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Distant parallax geometric mountains/grid
    ctx.save();
    const para1 = (this.cameraX * 0.15) % 120;
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;

    // Distant background grid
    for (let x = -para1; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 420);
      ctx.stroke();
    }
    for (let y = 0; y < 420; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Floor
    const floorY = 420;
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Glowing Floor Line with Beat Pulse
    ctx.save();
    ctx.strokeStyle = theme.floorLine;
    ctx.lineWidth = 3 * this.beatScale;
    ctx.shadowColor = theme.floorGlow;
    ctx.shadowBlur = 12 * this.beatScale;

    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.stroke();
    ctx.restore();

    // Fast Floor Speed Lines
    ctx.save();
    const floorSpeedOffset = (this.cameraX * 1.0) % 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    for (let fx = -floorSpeedOffset; fx < w; fx += 40) {
      ctx.beginPath();
      ctx.moveTo(fx, floorY);
      ctx.lineTo(fx - 20, h);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Ceiling for Inverted Gravity
    const ceilingY = 60;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY);
    ctx.lineTo(w, ceilingY);
    ctx.stroke();
    ctx.restore();
  }
}

window.Game = Game;

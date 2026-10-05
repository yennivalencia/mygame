/**
 * NEON DASH - Character Customizer & Skin Garage
 * Icon shapes, color palettes, trails, and character rendering.
 */

const ICONS_DATA = [
  { id: 'cube_classic', name: 'Neon Dash', badge: 'DEFAULT' },
  { id: 'cube_ninja', name: 'Shadow Ninja', badge: 'AGILE' },
  { id: 'cube_robot', name: 'Cyber Bot', badge: 'TECH' },
  { id: 'cube_alien', name: 'Alien Cyclops', badge: 'RARE' },
  { id: 'cube_demon', name: 'Inferno Demon', badge: 'INSANE' },
  { id: 'cube_star', name: 'Star Glider', badge: 'EPIC' },
  { id: 'cube_quantum', name: 'Quantum Core', badge: 'MYTHIC' },
  { id: 'cube_pixel', name: 'Retro Pixel', badge: 'CLASSIC' }
];

const PRIMARY_COLORS = [
  '#00f0ff', // Cyan
  '#ff007f', // Hot Pink
  '#00ff66', // Lime Green
  '#ffe600', // Yellow
  '#ff6600', // Orange
  '#ff2244', // Red
  '#9d00ff', // Purple
  '#ffffff', // White
  '#00ffff', // Electric Aqua
  '#ff77a8'  // Pastel Pink
];

const SECONDARY_COLORS = [
  '#051026', // Deep Navy
  '#1b002c', // Deep Purple
  '#2a000d', // Deep Wine
  '#002812', // Deep Emerald
  '#1a1a24', // Carbon Grey
  '#ffffff', // Pure White
  '#ffe600', // Gold Accent
  '#ff007f', // Pink Accent
  '#00f0ff', // Cyan Accent
  '#00ff66'  // Green Accent
];

const GLOW_COLORS = [
  '#00f0ff',
  '#ff007f',
  '#00ff66',
  '#ffe600',
  '#9d00ff',
  '#ff3300',
  '#ffffff'
];

const TRAILS_DATA = [
  { id: 'sparks', name: 'Sparks', icon: '✨', desc: 'Percikan listrik neon' },
  { id: 'fire', name: 'Fire Trail', icon: '🔥', desc: 'Lidah api menyala' },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', desc: 'Spektrum warna dinamis' },
  { id: 'cyber', name: 'Cyber Glitch', icon: '⚡', desc: 'Distorsi matriks digital' },
  { id: 'ghost', name: 'Ghost Echo', icon: '👤', desc: 'Bayangan ilusi karakter' }
];

class Customizer {
  constructor() {
    this.config = this.loadConfig();
    this.initUI();
    this.renderPreviews();
  }

  loadConfig() {
    const saved = localStorage.getItem('neon_dash_skin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      playerName: 'CyberRunner',
      iconId: 'cube_classic',
      primaryColor: '#00f0ff',
      secondaryColor: '#051026',
      glowColor: '#00f0ff',
      trail: 'sparks'
    };
  }

  saveConfig() {
    localStorage.setItem('neon_dash_skin', JSON.stringify(this.config));
    const tagEl = document.getElementById('player-display-tag');
    if (tagEl) tagEl.textContent = this.config.playerName;
    this.renderPreviews();
  }

  initUI() {
    // Player name input
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = this.config.playerName;
      nameInput.addEventListener('input', (e) => {
        this.config.playerName = e.target.value.trim() || 'Player';
        this.saveConfig();
      });
    }

    // Populate Icons Grid
    const iconsContainer = document.getElementById('icons-picker');
    if (iconsContainer) {
      iconsContainer.innerHTML = '';
      ICONS_DATA.forEach(icon => {
        const item = document.createElement('div');
        item.className = `picker-item ${this.config.iconId === icon.id ? 'active' : ''}`;
        
        const canvas = document.createElement('canvas');
        canvas.width = 44;
        canvas.height = 44;
        this.drawIconOnCanvas(canvas, icon.id, this.config.primaryColor, this.config.secondaryColor);

        const label = document.createElement('span');
        label.style.fontSize = '0.75rem';
        label.textContent = icon.name;

        item.appendChild(canvas);
        item.appendChild(label);

        item.addEventListener('click', () => {
          this.config.iconId = icon.id;
          iconsContainer.querySelectorAll('.picker-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          this.saveConfig();
        });

        iconsContainer.appendChild(item);
      });
    }

    // Populate Colors
    this.populateColorPalette('primary-color-palette', PRIMARY_COLORS, 'primaryColor');
    this.populateColorPalette('secondary-color-palette', SECONDARY_COLORS, 'secondaryColor');
    this.populateColorPalette('glow-color-palette', GLOW_COLORS, 'glowColor');

    // Populate Trails
    const trailsContainer = document.getElementById('trails-picker');
    if (trailsContainer) {
      trailsContainer.innerHTML = '';
      TRAILS_DATA.forEach(trail => {
        const item = document.createElement('div');
        item.className = `picker-item ${this.config.trail === trail.id ? 'active' : ''}`;
        item.innerHTML = `
          <div style="font-size:1.5rem">${trail.icon}</div>
          <div style="font-weight:700; font-size:0.85rem">${trail.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted)">${trail.desc}</div>
        `;
        item.addEventListener('click', () => {
          this.config.trail = trail.id;
          trailsContainer.querySelectorAll('.picker-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          this.saveConfig();
        });
        trailsContainer.appendChild(item);
      });
    }

    // Tabs logic
    const tabBtns = document.querySelectorAll('.garage-tabs .tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.garage-options-section .tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    const saveBtn = document.getElementById('btn-save-customizer');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveConfig();
      });
    }
  }

  populateColorPalette(elementId, colors, configKey) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';

    colors.forEach(col => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${this.config[configKey] === col ? 'active' : ''}`;
      swatch.style.backgroundColor = col;

      swatch.addEventListener('click', () => {
        this.config[configKey] = col;
        container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.saveConfig();
        this.refreshIconPickerCanvases();
      });

      container.appendChild(swatch);
    });
  }

  refreshIconPickerCanvases() {
    const iconsContainer = document.getElementById('icons-picker');
    if (!iconsContainer) return;
    const items = iconsContainer.querySelectorAll('.picker-item');
    items.forEach((item, idx) => {
      const canvas = item.querySelector('canvas');
      if (canvas && ICONS_DATA[idx]) {
        this.drawIconOnCanvas(canvas, ICONS_DATA[idx].id, this.config.primaryColor, this.config.secondaryColor);
      }
    });
  }

  renderPreviews() {
    const menuCanvas = document.getElementById('menu-cube-canvas');
    if (menuCanvas) {
      this.drawIconOnCanvas(menuCanvas, this.config.iconId, this.config.primaryColor, this.config.secondaryColor, this.config.glowColor);
    }

    const modalCanvas = document.getElementById('customizer-cube-canvas');
    if (modalCanvas) {
      this.drawIconOnCanvas(modalCanvas, this.config.iconId, this.config.primaryColor, this.config.secondaryColor, this.config.glowColor);
    }
  }

  // --- Draw character on any canvas or during gameplay ---
  drawIconOnCanvas(canvas, iconId, primary, secondary, glow = null) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    this.drawIcon(ctx, 0, 0, w, iconId, primary, secondary, glow, 0);
  }

  drawIcon(ctx, x, y, size, iconId = 'cube_classic', primary = '#00f0ff', secondary = '#051026', glow = null, rotation = 0) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    const s = size;
    const half = s / 2;

    // Glow effect
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = s * 0.35;
    }

    // Base Box
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.roundRect(-half, -half, s, s, s * 0.12);
    ctx.fill();

    // Inner Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.stroke();

    // Face / Feature Designs based on iconId
    ctx.fillStyle = secondary;
    ctx.shadowBlur = 0; // disable shadow for interior details

    switch (iconId) {
      case 'cube_classic':
        // Modern visor with inner pupil
        ctx.fillRect(-half * 0.6, -half * 0.3, s * 0.6, s * 0.25);
        ctx.fillStyle = primary;
        ctx.fillRect(-half * 0.2, -half * 0.25, s * 0.2, s * 0.15);
        // Smiling mouth or bottom stripe
        ctx.fillStyle = secondary;
        ctx.fillRect(-half * 0.5, half * 0.25, s * 0.5, s * 0.1);
        break;

      case 'cube_ninja':
        // Ninja headband band
        ctx.fillStyle = secondary;
        ctx.fillRect(-half, -half * 0.5, s, s * 0.35);
        // Fierce slant eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-half * 0.6, -half * 0.35);
        ctx.lineTo(-half * 0.2, -half * 0.2);
        ctx.lineTo(-half * 0.6, -half * 0.15);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(half * 0.6, -half * 0.35);
        ctx.lineTo(half * 0.2, -half * 0.2);
        ctx.lineTo(half * 0.6, -half * 0.15);
        ctx.closePath();
        ctx.fill();
        break;

      case 'cube_robot':
        // Cyber robotic eye scanner band
        ctx.fillStyle = secondary;
        ctx.fillRect(-half * 0.8, -half * 0.3, s * 0.8, s * 0.35);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-half * 0.2, -half * 0.2, s * 0.4, s * 0.15);
        // Bolts
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-half * 0.6, half * 0.5, s * 0.06, 0, Math.PI * 2);
        ctx.arc(half * 0.6, half * 0.5, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cube_alien':
        // Large central glowing eye
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.arc(0, -half * 0.1, s * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -half * 0.1, s * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, -half * 0.1, s * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Antenna
        ctx.fillStyle = primary;
        ctx.fillRect(-s * 0.04, -half * 1.25, s * 0.08, half * 0.3);
        ctx.beginPath();
        ctx.arc(0, -half * 1.25, s * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cube_demon':
        // Angled angry eyes
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(-half * 0.6, -half * 0.4);
        ctx.lineTo(-half * 0.15, -half * 0.1);
        ctx.lineTo(-half * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(half * 0.6, -half * 0.4);
        ctx.lineTo(half * 0.15, -half * 0.1);
        ctx.lineTo(half * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        // Horns
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(-half * 0.7, -half);
        ctx.lineTo(-half * 0.9, -half * 1.3);
        ctx.lineTo(-half * 0.4, -half);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(half * 0.7, -half);
        ctx.lineTo(half * 0.9, -half * 1.3);
        ctx.lineTo(half * 0.4, -half);
        ctx.closePath();
        ctx.fill();
        break;

      case 'cube_star':
        // Star pattern
        ctx.fillStyle = secondary;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const r1 = s * 0.35;
          const r2 = s * 0.15;
          const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          else ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
        }
        ctx.closePath();
        ctx.fill();
        break;

      case 'cube_quantum':
        // Concentric tech rings
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'cube_pixel':
        // 8-bit retro arcade pixel face
        ctx.fillStyle = secondary;
        const px = s * 0.12;
        // Eyes
        ctx.fillRect(-half + px * 2, -half + px * 2, px * 2, px * 2);
        ctx.fillRect(half - px * 4, -half + px * 2, px * 2, px * 2);
        // Mouth
        ctx.fillRect(-half + px * 2, half - px * 3, px * 4, px);
        break;
    }

    ctx.restore();
  }
}

window.customizer = new Customizer();

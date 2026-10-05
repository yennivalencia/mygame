/**
 * NEON DASH - Level Creator / Editor
 * Intuitive grid placement, palette, playtesting, export & import functionality.
 */

class LevelEditor {
  constructor() {
    this.canvas = document.getElementById('editorCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.tileSize = 30;
    this.offsetX = 0; // Grid camera scroll
    this.selectedTool = 'place'; // 'place' or 'erase'
    this.selectedObject = 'block';
    this.isMouseDown = false;
    this.customLevel = this.loadCustomLevel();

    this.palette = [
      { id: 'block', name: 'Balok Solid', icon: '🟫', color: '#00f0ff' },
      { id: 'half_block', name: 'Balok Pendek', icon: '▬', color: '#00f0ff' },
      { id: 'spike_up', name: 'Duri Bawah', icon: '▲', color: '#ff007f' },
      { id: 'spike_down', name: 'Duri Atas', icon: '▼', color: '#ff007f' },
      { id: 'spike_left', name: 'Duri Kiri', icon: '◀', color: '#ff007f' },
      { id: 'spike_right', name: 'Duri Kanan', icon: '▶', color: '#ff007f' },
      { id: 'pad_yellow', name: 'Bantalan Tinggi', icon: '🟡', color: '#ffe600' },
      { id: 'pad_pink', name: 'Bantalan Rendah', icon: '🟣', color: '#ff007f' },
      { id: 'orb_yellow', name: 'Bola Lompat', icon: '⭕', color: '#ffe600' },
      { id: 'orb_blue', name: 'Bola Gravitasi', icon: '🌀', color: '#00f0ff' },
      { id: 'gravity_portal_flip', name: 'Portal Balik', icon: '🌌', color: '#ffe600' },
      { id: 'gravity_portal_normal', name: 'Portal Normal', icon: '🌀', color: '#00f0ff' },
      { id: 'finish_line', name: 'Garis Garis Akhir', icon: '🏁', color: '#00ff66' }
    ];

    this.initUI();
    this.initEvents();
  }

  loadCustomLevel() {
    const saved = localStorage.getItem('neon_dash_custom_level');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      id: 'custom_1',
      name: 'Level Kustom Saya',
      difficulty: 'normal',
      difficultyLabel: 'CUSTOM',
      bpm: 135,
      speed: 6.5,
      theme: {
        bgTop: '#0d0724',
        bgBottom: '#220b42',
        gridColor: 'rgba(0, 240, 255, 0.15)',
        floorColor: '#0f082e',
        floorLine: '#00f0ff',
        floorGlow: '#00f0ff',
        obstacleColor: '#00f0ff',
        spikeColor: '#ff007f'
      },
      objects: [
        { type: 'spike_up', x: 20, y: 12 },
        { type: 'block', x: 26, y: 12 },
        { type: 'spike_up', x: 30, y: 12 },
        { type: 'pad_yellow', x: 35, y: 12 },
        { type: 'orb_yellow', x: 39, y: 8 },
        { type: 'block', x: 43, y: 10 },
        { type: 'finish_line', x: 55, y: 10 }
      ]
    };
  }

  saveCustomLevel() {
    const nameInput = document.getElementById('editor-level-name');
    if (nameInput) {
      this.customLevel.name = nameInput.value.trim() || 'Level Kustom';
    }
    localStorage.setItem('neon_dash_custom_level', JSON.stringify(this.customLevel));
  }

  initUI() {
    // Populate toolbar palette
    const paletteContainer = document.getElementById('editor-palette');
    if (!paletteContainer) return;
    paletteContainer.innerHTML = '';

    this.palette.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `palette-item ${this.selectedObject === item.id ? 'active' : ''}`;
      btn.title = item.name;
      btn.innerHTML = `<span style="font-size:1.4rem;">${item.icon}</span>`;

      btn.addEventListener('click', () => {
        this.selectedObject = item.id;
        this.selectedTool = 'place';
        paletteContainer.querySelectorAll('.palette-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.toolbar-tools .tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.toolbar-tools .tool-btn[data-tool="place"]').classList.add('active');
      });

      paletteContainer.appendChild(btn);
    });

    const nameInput = document.getElementById('editor-level-name');
    if (nameInput && this.customLevel.name) {
      nameInput.value = this.customLevel.name;
    }
  }

  initEvents() {
    if (!this.canvas) return;

    // Pan buttons
    const leftBtn = document.getElementById('btn-editor-pan-left');
    const rightBtn = document.getElementById('btn-editor-pan-right');
    const indicator = document.getElementById('editor-page-indicator');

    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        this.offsetX = Math.max(0, this.offsetX - 10);
        if (indicator) indicator.textContent = `Offset: ${this.offsetX}`;
        this.render();
      });
    }

    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        this.offsetX += 10;
        if (indicator) indicator.textContent = `Offset: ${this.offsetX}`;
        this.render();
      });
    }

    // Tools: Place, Erase, Clear
    const toolBtns = document.querySelectorAll('.toolbar-tools .tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool === 'clear') {
          if (confirm('Hapus semua rintangan di level ini?')) {
            this.customLevel.objects = [{ type: 'finish_line', x: 50, y: 10 }];
            this.render();
          }
          return;
        }
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTool = tool;
      });
    });

    // Mouse / Touch placement on canvas
    const handleCanvasAction = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      const gridX = Math.floor(canvasX / this.tileSize) + this.offsetX;
      const gridY = Math.floor(canvasY / this.tileSize);

      // Update coords indicator
      const coordsEl = document.getElementById('editor-coords');
      if (coordsEl) coordsEl.textContent = `X: ${gridX} | Y: ${gridY}`;

      if (gridX < 0 || gridY < 0 || gridY > 13) return;

      if (this.selectedTool === 'place') {
        // Remove existing object at same spot
        this.customLevel.objects = this.customLevel.objects.filter(o => !(o.x === gridX && o.y === gridY));
        this.customLevel.objects.push({
          type: this.selectedObject,
          x: gridX,
          y: gridY
        });
        this.render();
      } else if (this.selectedTool === 'erase') {
        this.customLevel.objects = this.customLevel.objects.filter(o => !(o.x === gridX && o.y === gridY));
        this.render();
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      handleCanvasAction(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      const gridX = Math.floor(canvasX / this.tileSize) + this.offsetX;
      const gridY = Math.floor(canvasY / this.tileSize);
      const coordsEl = document.getElementById('editor-coords');
      if (coordsEl) coordsEl.textContent = `X: ${gridX} | Y: ${gridY}`;

      if (this.isMouseDown) {
        handleCanvasAction(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Touch support for editor canvas
    this.canvas.addEventListener('touchstart', (e) => {
      this.isMouseDown = true;
      handleCanvasAction(e);
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isMouseDown) handleCanvasAction(e);
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
    });

    // Save action
    const saveBtn = document.getElementById('btn-editor-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCustomLevel();
        alert('Level berhasil disimpan!');
      });
    }

    // Export code action
    const exportBtn = document.getElementById('btn-editor-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.saveCustomLevel();
        const code = JSON.stringify(this.customLevel);
        const modal = document.getElementById('modal-code-io');
        const title = document.getElementById('code-io-title');
        const desc = document.getElementById('code-io-desc');
        const textarea = document.getElementById('code-io-textarea');
        const actionBtn = document.getElementById('btn-code-io-action');

        if (modal && textarea) {
          title.textContent = 'EKSPOR LEVEL';
          desc.textContent = 'Salin kode di bawah ini dan bagikan dengan teman Anda:';
          textarea.value = code;
          actionBtn.textContent = 'SALIN KODE KE CLIPBOARD';
          actionBtn.onclick = () => {
            navigator.clipboard.writeText(code).then(() => {
              alert('Kode level berhasil disalin ke clipboard!');
            }).catch(() => {
              textarea.select();
              document.execCommand('copy');
              alert('Kode level disalin!');
            });
          };
          modal.classList.add('active');
          modal.classList.remove('hidden');
        }
      });
    }

    // Import code action
    const importBtn = document.getElementById('btn-editor-import');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const modal = document.getElementById('modal-code-io');
        const title = document.getElementById('code-io-title');
        const desc = document.getElementById('code-io-desc');
        const textarea = document.getElementById('code-io-textarea');
        const actionBtn = document.getElementById('btn-code-io-action');

        if (modal && textarea) {
          title.textContent = 'IMPOR LEVEL';
          desc.textContent = 'Tempelkan kode level JSON dari teman di sini:';
          textarea.value = '';
          actionBtn.textContent = 'MUAT LEVEL INI';
          actionBtn.onclick = () => {
            try {
              const parsed = JSON.parse(textarea.value.trim());
              if (parsed && Array.isArray(parsed.objects)) {
                this.customLevel = parsed;
                this.saveCustomLevel();
                this.render();
                modal.classList.remove('active');
                modal.classList.add('hidden');
                alert(`Level "${this.customLevel.name}" berhasil diimpor!`);
              } else {
                alert('Format kode level tidak valid.');
              }
            } catch (err) {
              alert('Gagal membaca kode level JSON.');
            }
          };
          modal.classList.add('active');
          modal.classList.remove('hidden');
        }
      });
    }
  }

  open() {
    this.render();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const floorY = 13 * this.tileSize;

    // Background
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += this.tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = 0; y < h; y += this.tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Floor line
    ctx.fillStyle = '#0b0f24';
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.stroke();

    // Render placed objects
    for (const obj of this.customLevel.objects) {
      const screenX = (obj.x - this.offsetX) * this.tileSize;
      const screenY = obj.y * this.tileSize;

      if (screenX + this.tileSize < 0 || screenX > w) continue;

      this.drawObject(ctx, obj.type, screenX, screenY, this.tileSize);
    }
  }

  drawObject(ctx, type, x, y, size) {
    ctx.save();

    if (type === 'block') {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    } else if (type === 'half_block') {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 1, y + size / 2, size - 2, size / 2 - 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, y + size / 2 + 1, size - 4, size / 2 - 4);
    } else if (type === 'spike_up') {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + 4);
      ctx.lineTo(x + size - 2, y + size);
      ctx.lineTo(x + 2, y + size);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (type === 'spike_down') {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size - 4);
      ctx.lineTo(x + size - 2, y);
      ctx.lineTo(x + 2, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (type === 'spike_left') {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + size / 2);
      ctx.lineTo(x + size, y + 2);
      ctx.lineTo(x + size, y + size - 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'spike_right') {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x + size - 4, y + size / 2);
      ctx.lineTo(x, y + 2);
      ctx.lineTo(x, y + size - 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'pad_yellow' || type === 'pad_pink') {
      const color = type === 'pad_yellow' ? '#ffe600' : '#ff007f';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x + size / 2, y + size - 5, size / 2 - 2, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (type === 'orb_yellow' || type === 'orb_blue') {
      const color = type === 'orb_yellow' ? '#ffe600' : '#00f0ff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'gravity_portal_flip' || type === 'gravity_portal_normal') {
      const color = type === 'gravity_portal_flip' ? '#ffe600' : '#00f0ff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + size / 2, y + size / 2, size * 0.28, size * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'finish_line') {
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(x + size / 2 - 3, 0, 6, size * 14);
      // Checker pattern banner
      ctx.fillStyle = '#ffffff';
      for (let cy = 0; cy < size * 14; cy += 12) {
        ctx.fillRect(x + size / 2 - 6, cy, 6, 6);
        ctx.fillRect(x + size / 2, cy + 6, 6, 6);
      }
    }

    ctx.restore();
  }
}

window.levelEditor = new LevelEditor();

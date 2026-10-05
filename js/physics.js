/**
 * NEON DASH - Physics & Collision Engine
 * Highly tuned 60FPS platformer mechanics inspired by Geometry Dash.
 */

class PhysicsEngine {
  constructor() {
    this.tileSize = 30;
    this.floorY = 420; // Default floor line
    this.ceilingY = 60; // Ceiling for inverted gravity
    this.gravity = 1.05;
    this.jumpForce = -13.5;
    this.padYellowForce = -17.0;
    this.padPinkForce = -11.0;
    this.orbForce = -13.0;
    this.terminalVelocity = 16.0;
  }

  createPlayer() {
    return {
      x: 60,
      y: 390,
      size: 30,
      vx: 6.2,
      vy: 0,
      isGrounded: true,
      gravityDir: 1, // 1 = floor gravity, -1 = ceiling gravity
      rotation: 0,
      isDead: false,
      hasWon: false,
      activeOrb: null,
      jumpsCount: 0
    };
  }

  updatePlayer(player, levelSpeed) {
    if (player.isDead || player.hasWon) return;

    player.vx = levelSpeed;
    player.x += player.vx;

    // Apply gravity
    player.vy += this.gravity * player.gravityDir;

    // Cap terminal velocity
    if (Math.abs(player.vy) > this.terminalVelocity) {
      player.vy = Math.sign(player.vy) * this.terminalVelocity;
    }

    player.y += player.vy;

    // Air rotation animation
    if (!player.isGrounded) {
      player.rotation += (0.16 * player.gravityDir);
    } else {
      // Snap to nearest 90 degrees when grounded
      const quarterTurn = Math.PI / 2;
      player.rotation = Math.round(player.rotation / quarterTurn) * quarterTurn;
    }

    // Default floor / ceiling clamping
    if (player.gravityDir === 1) {
      if (player.y >= this.floorY - player.size) {
        player.y = this.floorY - player.size;
        player.vy = 0;
        player.isGrounded = true;
      }
    } else {
      if (player.y <= this.ceilingY) {
        player.y = this.ceilingY;
        player.vy = 0;
        player.isGrounded = true;
      }
    }
  }

  jump(player) {
    if (player.isDead || player.hasWon) return false;

    // 1. Check if inside an active orb
    if (player.activeOrb) {
      const orb = player.activeOrb;
      if (orb.type === 'orb_yellow') {
        player.vy = this.orbForce * player.gravityDir;
        player.isGrounded = false;
        player.jumpsCount++;
        if (window.soundEngine) window.soundEngine.playOrbRing();
        if (window.particleSystem) window.particleSystem.createBounceEffect(orb.x * this.tileSize + 15, orb.y * this.tileSize + 15, '#ffe600');
        player.activeOrb = null;
        return true;
      } else if (orb.type === 'orb_blue') {
        player.gravityDir *= -1;
        player.vy = this.jumpForce * 0.7 * player.gravityDir;
        player.isGrounded = false;
        player.jumpsCount++;
        if (window.soundEngine) {
          window.soundEngine.playGravityFlip();
          window.soundEngine.playOrbRing();
        }
        if (window.particleSystem) window.particleSystem.createBounceEffect(orb.x * this.tileSize + 15, orb.y * this.tileSize + 15, '#00f0ff');
        player.activeOrb = null;
        return true;
      }
    }

    // 2. Standard ground jump
    if (player.isGrounded) {
      player.vy = this.jumpForce * player.gravityDir;
      player.isGrounded = false;
      player.jumpsCount++;
      if (window.soundEngine) window.soundEngine.playJump();
      return true;
    }

    return false;
  }

  // --- Collision Detection with Level Objects ---
  checkCollisions(player, objects, onWin, onCrash) {
    if (player.isDead || player.hasWon) return;

    // Forgiving hitbox (Geometry Dash feel)
    const margin = 4;
    const pBox = {
      left: player.x + margin,
      right: player.x + player.size - margin,
      top: player.y + margin,
      bottom: player.y + player.size - margin
    };

    let foundGround = false;
    player.activeOrb = null;

    // Check only nearby objects within player range for maximum performance
    for (const obj of objects) {
      const ox = obj.x * this.tileSize;
      const oy = obj.y * this.tileSize;
      const ow = this.tileSize;
      const oh = this.tileSize;

      // Skip objects far away
      if (ox + ow < player.x - 50 || ox > player.x + 100) continue;

      // 1. BLOCKS (Solid platforms)
      if (obj.type === 'block' || obj.type === 'half_block') {
        const height = obj.type === 'half_block' ? oh / 2 : oh;
        const oBox = {
          left: ox,
          right: ox + ow,
          top: oy,
          bottom: oy + height
        };

        // AABB overlap
        if (pBox.right > oBox.left && pBox.left < oBox.right &&
            pBox.bottom > oBox.top && pBox.top < oBox.bottom) {

          if (player.gravityDir === 1) {
            // Falling onto top of block
            const prevBottom = player.y + player.size - player.vy;
            if (prevBottom <= oBox.top + 10 && player.vy >= 0) {
              player.y = oBox.top - player.size;
              player.vy = 0;
              player.isGrounded = true;
              foundGround = true;
              continue;
            }
          } else {
            // Floating up into ceiling block bottom
            const prevTop = player.y - player.vy;
            if (prevTop >= oBox.bottom - 10 && player.vy <= 0) {
              player.y = oBox.bottom;
              player.vy = 0;
              player.isGrounded = true;
              foundGround = true;
              continue;
            }
          }

          // Otherwise, lateral or head-on collision = CRASH!
          onCrash();
          return;
        }
      }

      // 2. SPIKES (Hazard hitboxes with forgiveness)
      else if (obj.type.startsWith('spike_')) {
        let sBox = null;
        if (obj.type === 'spike_up') {
          sBox = { left: ox + 8, right: ox + ow - 8, top: oy + 8, bottom: oy + oh };
        } else if (obj.type === 'spike_down') {
          sBox = { left: ox + 8, right: ox + ow - 8, top: oy, bottom: oy + oh - 8 };
        } else if (obj.type === 'spike_left') {
          sBox = { left: ox, right: ox + ow - 8, top: oy + 8, bottom: oy + oh - 8 };
        } else if (obj.type === 'spike_right') {
          sBox = { left: ox + 8, right: ox + ow, top: oy + 8, bottom: oy + oh - 8 };
        }

        if (sBox && pBox.right > sBox.left && pBox.left < sBox.right &&
            pBox.bottom > sBox.top && pBox.top < sBox.bottom) {
          onCrash();
          return;
        }
      }

      // 3. JUMP PADS (Automatic spring bounce)
      else if (obj.type === 'pad_yellow' || obj.type === 'pad_pink') {
        const padBox = { left: ox + 2, right: ox + ow - 2, top: oy + oh - 12, bottom: oy + oh };
        if (player.gravityDir === -1) {
          padBox.top = oy;
          padBox.bottom = oy + 12;
        }

        if (pBox.right > padBox.left && pBox.left < padBox.right &&
            pBox.bottom > padBox.top && pBox.top < padBox.bottom) {
          const isYellow = obj.type === 'pad_yellow';
          const force = isYellow ? this.padYellowForce : this.padPinkForce;
          player.vy = force * player.gravityDir;
          player.isGrounded = false;
          if (window.soundEngine) window.soundEngine.playPadBounce(isYellow);
          if (window.particleSystem) window.particleSystem.createBounceEffect(ox + ow / 2, oy + oh / 2, isYellow ? '#ffe600' : '#ff007f');
        }
      }

      // 4. JUMP ORBS (Ring trigger zones)
      else if (obj.type === 'orb_yellow' || obj.type === 'orb_blue') {
        const orbCenterX = ox + ow / 2;
        const orbCenterY = oy + oh / 2;
        const dist = Math.hypot((player.x + player.size / 2) - orbCenterX, (player.y + player.size / 2) - orbCenterY);
        if (dist < 38) {
          player.activeOrb = obj;
        }
      }

      // 5. GRAVITY PORTALS
      else if (obj.type === 'gravity_portal_flip' || obj.type === 'gravity_portal_normal') {
        const portalBox = { left: ox, right: ox + ow, top: oy - 15, bottom: oy + oh + 15 };
        if (pBox.right > portalBox.left && pBox.left < portalBox.right &&
            pBox.bottom > portalBox.top && pBox.top < portalBox.bottom) {
          const newDir = obj.type === 'gravity_portal_flip' ? -1 : 1;
          if (player.gravityDir !== newDir) {
            player.gravityDir = newDir;
            if (window.soundEngine) window.soundEngine.playGravityFlip();
            if (window.particleSystem) window.particleSystem.createBounceEffect(ox + 15, oy + 15, newDir === -1 ? '#ffe600' : '#00f0ff');
          }
        }
      }

      // 6. FINISH LINE
      else if (obj.type === 'finish_line') {
        const finishBox = { left: ox, right: ox + ow + 20, top: 0, bottom: 540 };
        if (pBox.right > finishBox.left) {
          onWin();
          return;
        }
      }
    }

    // Floor contact state
    if (player.gravityDir === 1 && player.y >= this.floorY - player.size - 0.5) {
      player.isGrounded = true;
    } else if (player.gravityDir === -1 && player.y <= this.ceilingY + 0.5) {
      player.isGrounded = true;
    } else if (!foundGround) {
      player.isGrounded = false;
    }
  }
}

window.physicsEngine = new PhysicsEngine();

/**
 * NEON DASH - Pre-built Official Levels
 * High-precision obstacle placement synchronized with the Web Audio BPM.
 * 
 * Grid Coordinates:
 * Tile size is 30px.
 * Floor Y level is 420px (Grid Y = 14 on 540px canvas, where floor top is at 420).
 * In grid units:
 * Y = 0 is ceiling (Y_px = 60)
 * Y = 12 is floor surface (Y_px = 420 - 30 = 390)
 * 
 * Obstacle types:
 * - 'block': Solid ground/platform
 * - 'half_block': Low platform
 * - 'spike_up': Floor spike
 * - 'spike_down': Ceiling spike
 * - 'spike_left': Left wall spike
 * - 'spike_right': Right wall spike
 * - 'pad_yellow': Boost jump pad (high launch)
 * - 'pad_pink': Low jump pad
 * - 'orb_yellow': Jump ring in air (tap while inside)
 * - 'orb_blue': Gravity reverse ring (tap to flip gravity)
 * - 'gravity_portal_flip': Inverts gravity
 * - 'gravity_portal_normal': Restores normal gravity
 * - 'finish_line': Level completion gate
 */

const OFFICIAL_LEVELS = [
  {
    id: 1,
    name: 'Neon Pulse',
    difficulty: 'normal',
    difficultyLabel: 'NORMAL',
    difficultyClass: 'difficulty-normal',
    bpm: 128,
    speed: 6.2,
    theme: {
      bgTop: '#08081a',
      bgBottom: '#1c1236',
      gridColor: 'rgba(0, 240, 255, 0.12)',
      floorColor: '#0a0d24',
      floorLine: '#00f0ff',
      floorGlow: '#00f0ff',
      obstacleColor: '#00f0ff',
      spikeColor: '#ff007f'
    },
    objects: [
      // Intro warm-up jumps
      { type: 'spike_up', x: 22, y: 12 },
      { type: 'spike_up', x: 30, y: 12 },
      { type: 'block', x: 38, y: 12 },
      { type: 'block', x: 39, y: 12 },
      { type: 'spike_up', x: 40, y: 12 },
      
      // Step platforms
      { type: 'block', x: 47, y: 12 },
      { type: 'block', x: 48, y: 11 },
      { type: 'block', x: 49, y: 10 },
      { type: 'spike_up', x: 50, y: 12 },
      { type: 'spike_up', x: 51, y: 12 },
      { type: 'block', x: 54, y: 12 },
      
      // Yellow jump pad boost over double spikes
      { type: 'pad_yellow', x: 62, y: 12 },
      { type: 'spike_up', x: 65, y: 12 },
      { type: 'spike_up', x: 66, y: 12 },
      { type: 'spike_up', x: 67, y: 12 },
      { type: 'block', x: 70, y: 10 },
      { type: 'block', x: 71, y: 10 },
      { type: 'block', x: 72, y: 10 },
      
      // Platform hops with spikes below
      { type: 'spike_up', x: 75, y: 12 },
      { type: 'spike_up', x: 76, y: 12 },
      { type: 'block', x: 77, y: 11 },
      { type: 'spike_up', x: 80, y: 12 },
      { type: 'spike_up', x: 81, y: 12 },
      { type: 'block', x: 83, y: 10 },
      { type: 'spike_up', x: 86, y: 12 },
      
      // Yellow Orb in mid air
      { type: 'spike_up', x: 92, y: 12 },
      { type: 'orb_yellow', x: 94, y: 9 },
      { type: 'spike_up', x: 95, y: 12 },
      { type: 'spike_up', x: 96, y: 12 },
      { type: 'block', x: 98, y: 12 },
      
      // High tower leap
      { type: 'block', x: 106, y: 12 },
      { type: 'block', x: 106, y: 11 },
      { type: 'block', x: 106, y: 10 },
      { type: 'spike_up', x: 109, y: 12 },
      { type: 'pad_pink', x: 114, y: 12 },
      { type: 'block', x: 117, y: 10 },
      { type: 'spike_up', x: 118, y: 9 }, // spike on top of block
      { type: 'block', x: 122, y: 12 },

      // Rhythm section (Bass drop)
      { type: 'spike_up', x: 128, y: 12 },
      { type: 'spike_up', x: 134, y: 12 },
      { type: 'spike_up', x: 140, y: 12 },
      { type: 'pad_yellow', x: 145, y: 12 },
      { type: 'block', x: 149, y: 8 },
      { type: 'block', x: 150, y: 8 },
      { type: 'orb_yellow', x: 153, y: 7 },
      { type: 'block', x: 156, y: 9 },
      { type: 'spike_up', x: 158, y: 12 },
      { type: 'spike_up', x: 162, y: 12 },

      // Final Sprint
      { type: 'spike_up', x: 170, y: 12 },
      { type: 'spike_up', x: 171, y: 12 },
      { type: 'block', x: 177, y: 12 },
      { type: 'block', x: 178, y: 12 },
      { type: 'pad_yellow', x: 184, y: 12 },
      { type: 'spike_up', x: 187, y: 12 },
      { type: 'spike_up', x: 188, y: 12 },
      { type: 'finish_line', x: 196, y: 10 }
    ]
  },

  {
    id: 2,
    name: 'Electro Surge',
    difficulty: 'hard',
    difficultyLabel: 'HARD',
    difficultyClass: 'difficulty-hard',
    bpm: 140,
    speed: 6.8,
    theme: {
      bgTop: '#04140b',
      bgBottom: '#0e2b19',
      gridColor: 'rgba(0, 255, 102, 0.15)',
      floorColor: '#071d12',
      floorLine: '#00ff66',
      floorGlow: '#00ff66',
      obstacleColor: '#00ff66',
      spikeColor: '#ffe600'
    },
    objects: [
      // Fast opening
      { type: 'spike_up', x: 20, y: 12 },
      { type: 'spike_up', x: 26, y: 12 },
      { type: 'block', x: 32, y: 12 },
      { type: 'block', x: 32, y: 11 },
      { type: 'spike_up', x: 36, y: 12 },
      { type: 'spike_up', x: 37, y: 12 },

      // Orb chain
      { type: 'pad_yellow', x: 44, y: 12 },
      { type: 'orb_yellow', x: 48, y: 8 },
      { type: 'spike_up', x: 48, y: 12 },
      { type: 'spike_up', x: 49, y: 12 },
      { type: 'block', x: 53, y: 10 },
      { type: 'orb_yellow', x: 57, y: 8 },
      { type: 'block', x: 61, y: 11 },

      // GRAVITY FLIP INTRO!
      { type: 'gravity_portal_flip', x: 68, y: 9 },
      // Running on ceiling! Ceiling floor is at Y = 2
      { type: 'spike_down', x: 76, y: 2 },
      { type: 'block', x: 82, y: 2 },
      { type: 'block', x: 83, y: 3 },
      { type: 'spike_down', x: 87, y: 2 },
      { type: 'spike_down', x: 88, y: 2 },
      { type: 'gravity_portal_normal', x: 96, y: 5 },

      // Back on floor
      { type: 'spike_up', x: 104, y: 12 },
      { type: 'block', x: 109, y: 12 },
      { type: 'block', x: 110, y: 11 },
      { type: 'block', x: 111, y: 10 },
      { type: 'spike_up', x: 115, y: 12 },
      { type: 'spike_up', x: 116, y: 12 },
      { type: 'pad_pink', x: 122, y: 12 },
      { type: 'block', x: 125, y: 10 },
      { type: 'orb_blue', x: 130, y: 8 }, // Flip mid-air!
      { type: 'spike_down', x: 136, y: 2 },
      { type: 'orb_blue', x: 142, y: 6 }, // Flip back!
      
      // Climax
      { type: 'spike_up', x: 150, y: 12 },
      { type: 'spike_up', x: 155, y: 12 },
      { type: 'spike_up', x: 156, y: 12 },
      { type: 'pad_yellow', x: 162, y: 12 },
      { type: 'block', x: 166, y: 9 },
      { type: 'spike_up', x: 167, y: 8 },
      { type: 'block', x: 172, y: 11 },
      { type: 'finish_line', x: 182, y: 10 }
    ]
  },

  {
    id: 3,
    name: 'Inferno Beat',
    difficulty: 'insane',
    difficultyLabel: 'INSANE',
    difficultyClass: 'difficulty-insane',
    bpm: 155,
    speed: 7.5,
    theme: {
      bgTop: '#1f0404',
      bgBottom: '#380a0a',
      gridColor: 'rgba(255, 68, 0, 0.18)',
      floorColor: '#260707',
      floorLine: '#ff4400',
      floorGlow: '#ff3300',
      obstacleColor: '#ff4400',
      spikeColor: '#ffe600'
    },
    objects: [
      { type: 'spike_up', x: 18, y: 12 },
      { type: 'spike_up', x: 23, y: 12 },
      { type: 'spike_up', x: 24, y: 12 },
      { type: 'pad_yellow', x: 29, y: 12 },
      { type: 'orb_yellow', x: 33, y: 7 },
      { type: 'block', x: 37, y: 9 },
      { type: 'spike_up', x: 40, y: 12 },
      { type: 'spike_up', x: 41, y: 12 },
      { type: 'spike_up', x: 42, y: 12 }, // Triple spike!
      { type: 'block', x: 44, y: 12 },

      // Tunnel passage
      { type: 'block', x: 50, y: 10 },
      { type: 'block', x: 50, y: 9 },
      { type: 'spike_up', x: 53, y: 12 },
      { type: 'gravity_portal_flip', x: 58, y: 8 },
      { type: 'spike_down', x: 63, y: 2 },
      { type: 'spike_down', x: 67, y: 2 },
      { type: 'spike_down', x: 68, y: 2 },
      { type: 'orb_yellow', x: 73, y: 5 },
      { type: 'block', x: 77, y: 3 },
      { type: 'gravity_portal_normal', x: 83, y: 7 },

      // Rapid hops
      { type: 'spike_up', x: 90, y: 12 },
      { type: 'spike_up', x: 94, y: 12 },
      { type: 'pad_yellow', x: 99, y: 12 },
      { type: 'orb_yellow', x: 103, y: 6 },
      { type: 'orb_yellow', x: 107, y: 6 },
      { type: 'block', x: 111, y: 9 },
      { type: 'spike_up', x: 114, y: 12 },
      { type: 'spike_up', x: 115, y: 12 },
      { type: 'finish_line', x: 125, y: 10 }
    ]
  },

  {
    id: 4,
    name: 'Cosmic Abyss',
    difficulty: 'demon',
    difficultyLabel: 'DEMON',
    difficultyClass: 'difficulty-demon',
    bpm: 170,
    speed: 8.2,
    theme: {
      bgTop: '#0c021c',
      bgBottom: '#1e053d',
      gridColor: 'rgba(157, 0, 255, 0.2)',
      floorColor: '#120429',
      floorLine: '#9d00ff',
      floorGlow: '#ff007f',
      obstacleColor: '#9d00ff',
      spikeColor: '#00f0ff'
    },
    objects: [
      { type: 'spike_up', x: 16, y: 12 },
      { type: 'spike_up', x: 21, y: 12 },
      { type: 'spike_up', x: 22, y: 12 },
      { type: 'pad_yellow', x: 26, y: 12 },
      { type: 'orb_yellow', x: 30, y: 6 },
      { type: 'orb_blue', x: 35, y: 7 },
      { type: 'spike_down', x: 40, y: 2 },
      { type: 'orb_blue', x: 45, y: 5 },
      { type: 'spike_up', x: 50, y: 12 },
      { type: 'spike_up', x: 51, y: 12 },
      { type: 'spike_up', x: 52, y: 12 },
      { type: 'pad_pink', x: 56, y: 12 },
      { type: 'block', x: 59, y: 10 },
      { type: 'orb_yellow', x: 63, y: 7 },
      { type: 'finish_line', x: 75, y: 10 }
    ]
  }
];

window.OFFICIAL_LEVELS = OFFICIAL_LEVELS;

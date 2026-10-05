/**
 * NEON DASH - Leaderboard & Player Stats System
 * Local storage persistence, competitive simulated rankings, and score submission.
 */

class LeaderboardManager {
  constructor() {
    this.storageKey = 'neon_dash_leaderboards';
    this.userStatsKey = 'neon_dash_user_stats';
    this.initData();
  }

  initData() {
    if (!localStorage.getItem(this.storageKey)) {
      // Seed default competitive leaderboard entries
      const defaultBoards = {
        1: [
          { rank: 1, name: 'ViperX', progress: '100%', attempts: 4, time: '0:48' },
          { rank: 2, name: 'CyberNova', progress: '100%', attempts: 9, time: '0:50' },
          { rank: 3, name: 'NeonPulse99', progress: '100%', attempts: 18, time: '0:52' },
          { rank: 4, name: 'AstroBot', progress: '88%', attempts: 24, time: '0:42' },
          { rank: 5, name: 'PixelGod', progress: '76%', attempts: 31, time: '0:38' },
          { rank: 6, name: 'ShadowJump', progress: '64%', attempts: 15, time: '0:30' }
        ],
        2: [
          { rank: 1, name: 'NeonPulse99', progress: '100%', attempts: 12, time: '0:46' },
          { rank: 2, name: 'ViperX', progress: '100%', attempts: 21, time: '0:47' },
          { rank: 3, name: 'CyberNova', progress: '92%', attempts: 35, time: '0:42' },
          { rank: 4, name: 'GlitchRider', progress: '78%', attempts: 42, time: '0:35' },
          { rank: 5, name: 'HyperSonic', progress: '58%', attempts: 29, time: '0:28' }
        ],
        3: [
          { rank: 1, name: 'ViperX', progress: '100%', attempts: 45, time: '0:41' },
          { rank: 2, name: 'InfernoGod', progress: '86%', attempts: 60, time: '0:36' },
          { rank: 3, name: 'CyberNova', progress: '74%', attempts: 52, time: '0:31' },
          { rank: 4, name: 'VoltMaster', progress: '55%', attempts: 40, time: '0:22' }
        ],
        4: [
          { rank: 1, name: 'ViperX', progress: '100%', attempts: 114, time: '0:38' },
          { rank: 2, name: 'AbyssKing', progress: '82%', attempts: 98, time: '0:30' },
          { rank: 3, name: 'CosmicRay', progress: '66%', attempts: 85, time: '0:25' }
        ]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(defaultBoards));
    }
  }

  getLeaderboard(levelId) {
    try {
      const data = JSON.parse(localStorage.getItem(this.storageKey));
      return data[levelId] || [];
    } catch (e) {
      return [];
    }
  }

  getUserStats() {
    try {
      const saved = localStorage.getItem(this.userStatsKey);
      return saved ? JSON.parse(saved) : { 1: { progress: 0, attempts: 0 }, 2: { progress: 0, attempts: 0 }, 3: { progress: 0, attempts: 0 }, 4: { progress: 0, attempts: 0 } };
    } catch (e) {
      return {};
    }
  }

  recordRun(levelId, progressPercent, attempts, playerName = 'Player') {
    const stats = this.getUserStats();
    if (!stats[levelId]) {
      stats[levelId] = { progress: 0, attempts: 0 };
    }

    stats[levelId].attempts = attempts;
    if (progressPercent > stats[levelId].progress) {
      stats[levelId].progress = progressPercent;
    }
    localStorage.setItem(this.userStatsKey, JSON.stringify(stats));

    // Update global board for this level
    try {
      const boards = JSON.parse(localStorage.getItem(this.storageKey)) || {};
      const list = boards[levelId] || [];

      // Find if user already exists
      const existingIdx = list.findIndex(item => item.isUser || item.name === playerName);
      const userEntry = {
        name: playerName,
        progress: `${stats[levelId].progress}%`,
        attempts: stats[levelId].attempts,
        time: progressPercent >= 100 ? '0:45' : `0:${Math.min(59, Math.floor(progressPercent * 0.5))}`,
        isUser: true,
        numericProgress: stats[levelId].progress
      };

      if (existingIdx !== -1) {
        list[existingIdx] = userEntry;
      } else {
        list.push(userEntry);
      }

      // Sort by progress desc, then attempts asc
      list.sort((a, b) => {
        const progA = parseInt(a.progress, 10);
        const progB = parseInt(b.progress, 10);
        if (progB !== progA) return progB - progA;
        return a.attempts - b.attempts;
      });

      // Re-assign ranks
      list.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      boards[levelId] = list;
      localStorage.setItem(this.storageKey, JSON.stringify(boards));
    } catch (e) {
      console.error(e);
    }
  }

  renderToTable(levelId, tbodyElement, statusElement) {
    if (!tbodyElement) return;
    const entries = this.getLeaderboard(levelId);
    tbodyElement.innerHTML = '';

    let userRank = null;
    entries.forEach(entry => {
      const tr = document.createElement('tr');
      if (entry.isUser) {
        tr.classList.add('user-row');
        userRank = entry.rank;
      }

      tr.innerHTML = `
        <td>${entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}</td>
        <td>${entry.name} ${entry.isUser ? '<span style="color:var(--neon-cyan);font-size:0.75rem;">(ANDA)</span>' : ''}</td>
        <td><strong style="color:var(--neon-green)">${entry.progress}</strong></td>
        <td>${entry.attempts}</td>
        <td>${entry.time}</td>
      `;
      tbodyElement.appendChild(tr);
    });

    if (statusElement) {
      if (userRank) {
        statusElement.innerHTML = `Peringkat Anda di level ini: <strong style="color:var(--neon-cyan)">#${userRank}</strong>`;
      } else {
        statusElement.innerHTML = `Mainkan level ini untuk mencatatkan nama Anda di papan peringkat!`;
      }
    }
  }
}

window.leaderboardManager = new LeaderboardManager();

/**
 * Podium Animation - Podio Fine Torneo con Fuochi Artificio
 * v2025101906
 */

(function() {
  'use strict';
  
  /**
   * Mostra podio animato con fuochi d'artificio
   */
  function showPodium(standings, title = 'Classifica Finale') {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'podiumModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s;
    `;
    
    // Top 3
    const top3 = standings.slice(0, 3);
    
    modal.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes firework {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(var(--x), var(--y)) scale(1); opacity: 0; }
        }
        
        .podium-container {
          text-align: center;
          position: relative;
          z-index: 2;
        }
        
        .podium-title {
          font-size: 32px;
          color: white;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: slideUp 0.8s;
          padding: 0 10px;
        }
        
        @media (min-width: 768px) {
          .podium-title {
            font-size: 48px;
            margin-bottom: 40px;
          }
        }
        
        .podium-stages {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 8px;
          margin: 20px auto;
          max-width: 100%;
          padding: 0 10px;
        }
        
        @media (min-width: 768px) {
          .podium-stages {
            gap: 20px;
            margin: 40px 0;
          }
        }
        
        .podium-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: slideUp 1s;
        }
        
        .podium-stage.first {
          animation-delay: 0.8s;
          order: 2;
        }
        
        .podium-stage.second {
          animation-delay: 0.4s;
          order: 1;
        }
        
        .podium-stage.third {
          animation-delay: 0.6s;
          order: 3;
        }
        
        .podium-trophy {
          font-size: 40px;
          margin-bottom: 8px;
          animation: bounce 2s infinite;
        }
        
        @media (min-width: 768px) {
          .podium-trophy {
            font-size: 80px;
            margin-bottom: 20px;
          }
        }
        
        .podium-name {
          font-size: 14px;
          color: white;
          font-weight: bold;
          margin-bottom: 6px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        @media (min-width: 768px) {
          .podium-name {
            font-size: 24px;
            margin-bottom: 10px;
            max-width: none;
          }
        }
        
        .podium-points {
          font-size: 12px;
          color: #ffd700;
          margin-bottom: 10px;
        }
        
        @media (min-width: 768px) {
          .podium-points {
            font-size: 18px;
            margin-bottom: 20px;
          }
        }
        
        .podium-box {
          width: 90px;
          background: linear-gradient(to bottom, var(--color1), var(--color2));
          border-radius: 8px 8px 0 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: bold;
        }
        
        @media (min-width: 768px) {
          .podium-box {
            width: 150px;
            font-size: 48px;
          }
        }
        
        .podium-box.first {
          height: 140px;
          --color1: #ffd700;
          --color2: #f39c12;
        }
        
        .podium-box.second {
          height: 110px;
          --color1: #c0c0c0;
          --color2: #95a5a6;
        }
        
        .podium-box.third {
          height: 80px;
          --color1: #cd7f32;
          --color2: #d35400;
        }
        
        @media (min-width: 768px) {
          .podium-box.first { height: 250px; }
          .podium-box.second { height: 200px; }
          .podium-box.third { height: 150px; }
        }
        
        .firework {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: firework 1s ease-out infinite;
        }
        
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
          z-index: 3;
        }
        
        .close-btn:hover {
          background: #ecf0f1;
        }
        
        .download-btn {
          margin-top: 20px;
          background: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @media (min-width: 768px) {
          .download-btn {
            margin-top: 40px;
            padding: 16px 32px;
            font-size: 18px;
          }
        }
        
        .download-btn:hover {
          background: #ecf0f1;
        }
      </style>
      
      <button class="close-btn" onclick="document.getElementById('podiumModal').remove()">✕ Chiudi</button>
      
      <div class="podium-container" style="max-height: 100vh; overflow-y: auto; padding: 20px 0;">
        <h1 class="podium-title">🏆 ${title}</h1>
        
        <div class="podium-stages">
          ${renderPodiumStage(top3[1], 2, 'second')}
          ${renderPodiumStage(top3[0], 1, 'first')}
          ${renderPodiumStage(top3[2], 3, 'third')}
        </div>
        
        <button class="download-btn" onclick="window.PodiumAnimation.downloadStandings()">
          📥 Scarica Classifica Completa
        </button>
      </div>
      
      <canvas id="fireworksCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"></canvas>
    `;
    
    document.body.appendChild(modal);
    
    // Start fireworks
    setTimeout(() => startFireworks(), 1000);
  }
  
  function renderPodiumStage(team, position, className) {
    if (!team) return '';
    
    const trophies = ['🥇', '🥈', '🥉'];
    const medals = ['1°', '2°', '3°'];
    
    return `
      <div class="podium-stage ${className}">
        <div class="podium-trophy">${trophies[position - 1]}</div>
        <div class="podium-name">${team.name || `Squadra ${position}`}</div>
        <div class="podium-points">${team.points || 0} punti</div>
        <div class="podium-box ${className}">${medals[position - 1]}</div>
      </div>
    `;
  }
  
  function startFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const fireworks = [];
    const particles = [];
    
    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const targetY = Math.random() * canvas.height * 0.5;
      
      fireworks.push({
        x: x,
        y: y,
        targetY: targetY,
        speed: 8,
        exploded: false
      });
    }
    
    function createParticles(x, y) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 3;
        
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(30, 60, 114, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        
        if (!fw.exploded) {
          fw.y -= fw.speed;
          
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          if (fw.y <= fw.targetY) {
            fw.exploded = true;
            createParticles(fw.x, fw.y);
            fireworks.splice(i, 1);
          }
        }
      }
      
      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.alpha -= 0.01;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    // Launch fireworks periodically
    setInterval(() => {
      createFirework();
    }, 500);
    
    animate();
  }
  
  /**
   * Download classifica completa come PDF/CSV
   */
  function downloadStandings() {
    // Get standings from current league
    const leagueId = localStorage.getItem('last_league_id');
    if (!leagueId) {
      alert('Nessuna lega selezionata!');
      return;
    }
    
    // TODO: Fetch full standings and generate CSV
    const csv = generateStandingsCSV();
    downloadCSV(csv, `classifica_${new Date().toISOString().split('T')[0]}.csv`);
  }
  
  function generateStandingsCSV() {
    // Mock data - replace with real data
    return `Posizione,Squadra,Punti,Vittorie,Pareggi,Sconfitte
1,Squadra A,85,12,5,1
2,Squadra B,78,11,4,3
3,Squadra C,72,10,6,2`;
  }
  
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
  
  // Expose API
  window.PodiumAnimation = {
    showPodium,
    downloadStandings
  };
  
})();

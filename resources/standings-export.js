/**
 * Standings Export - Export Classifica PDF/Excel
 * v2025101906
 */

(function() {
  'use strict';
  
  /**
   * Export standings to CSV
   */
  async function exportToCSV(leagueId) {
    const db = firebase.firestore();
    
    try {
      // Get league info
      const leagueDoc = await db.collection('leagues').doc(leagueId).get();
      if (!leagueDoc.exists) {
        throw new Error('Lega non trovata');
      }
      
      const league = leagueDoc.data();
      
      // Get all teams with stats
      const teamsSnap = await db.collection(`leagues/${leagueId}/teams`)
        .orderBy('points', 'desc')
        .get();
      
      if (teamsSnap.empty) {
        throw new Error('Nessuna squadra trovata');
      }
      
      // Generate CSV
      let csv = 'Posizione,Squadra,Punti,Partite,Vittorie,Pareggi,Sconfitte,Gol Fatti,Gol Subiti,Diff. Reti\n';
      
      teamsSnap.forEach((doc, index) => {
        const team = doc.data();
        const stats = team.stats || {};
        
        csv += [
          index + 1,
          `"${team.name || 'Squadra'}"`,
          stats.points || 0,
          stats.played || 0,
          stats.wins || 0,
          stats.draws || 0,
          stats.losses || 0,
          stats.goalsFor || 0,
          stats.goalsAgainst || 0,
          (stats.goalsFor || 0) - (stats.goalsAgainst || 0)
        ].join(',') + '\n';
      });
      
      // Download
      const filename = `classifica_${league.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csv, filename, 'text/csv');
      
      return { success: true, filename };
      
    } catch (error) {
      console.error('Export CSV error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Export standings to Excel (HTML table converted)
   */
  async function exportToExcel(leagueId) {
    const db = firebase.firestore();
    
    try {
      // Get league and teams
      const leagueDoc = await db.collection('leagues').doc(leagueId).get();
      if (!leagueDoc.exists) throw new Error('Lega non trovata');
      
      const league = leagueDoc.data();
      const teamsSnap = await db.collection(`leagues/${leagueId}/teams`)
        .orderBy('points', 'desc')
        .get();
      
      // Generate HTML table (Excel can import this)
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .gold { background-color: #ffd700 !important; }
            .silver { background-color: #c0c0c0 !important; }
            .bronze { background-color: #cd7f32 !important; }
          </style>
        </head>
        <body>
          <h1>Classifica ${league.name}</h1>
          <p>Stagione ${league.season || '2024/2025'}</p>
          <p>Generato il: ${new Date().toLocaleDateString('it-IT')}</p>
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Squadra</th>
                <th>Punti</th>
                <th>P</th>
                <th>V</th>
                <th>N</th>
                <th>S</th>
                <th>GF</th>
                <th>GS</th>
                <th>DR</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      teamsSnap.forEach((doc, index) => {
        const team = doc.data();
        const stats = team.stats || {};
        const rowClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        
        html += `
          <tr class="${rowClass}">
            <td>${index + 1}</td>
            <td>${team.name || 'Squadra'}</td>
            <td><strong>${stats.points || 0}</strong></td>
            <td>${stats.played || 0}</td>
            <td>${stats.wins || 0}</td>
            <td>${stats.draws || 0}</td>
            <td>${stats.losses || 0}</td>
            <td>${stats.goalsFor || 0}</td>
            <td>${stats.goalsAgainst || 0}</td>
            <td>${(stats.goalsFor || 0) - (stats.goalsAgainst || 0)}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Download as .xls (Excel will open it)
      const filename = `classifica_${league.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
      downloadFile(html, filename, 'application/vnd.ms-excel');
      
      return { success: true, filename };
      
    } catch (error) {
      console.error('Export Excel error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Helper: Download file
   */
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
  
  // Expose API
  window.StandingsExport = {
    exportToCSV,
    exportToExcel
  };
  
})();

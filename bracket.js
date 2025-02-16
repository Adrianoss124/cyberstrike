document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.bracket-container');
    if (!container) return;
  
    try {
      const response = await fetch('bracket.json');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      console.log('Dane z pliku JSON:', data); // Debugowanie
      
      // Generowanie drabinki
      container.innerHTML = generateBracketHTML(data);
      
      // Dodanie stylów interaktywnych
      addBracketInteractions();
      
    } catch(error) {
      console.error('Błąd:', error);
      container.innerHTML = `<div class="error">Błąd ładowania drabinki: ${error.message}</div>`;
    }
  });
  
  function generateBracketHTML(data) {
    return `
      <div class="bracket-header">
        <h3>${data.tournament}</h3>
        <div class="structure">Format: ${data.structure}</div>
      </div>
      ${data.rounds.map(round => `
        <div class="bracket-round">
          <div class="round-header">${round.name}</div>
          ${round.matches.map(match => `
            <div class="match-card ${match.status}" data-match-id="${match.matchId}">
              <div class="teams">
                <div class="team ${match.scoreA > match.scoreB ? 'winner' : ''}">
                  <span class="team-name">${match.teamA || 'Awaiting...'}</span>
                  <span class="team-score">${match.scoreA ?? '-'}</span>
                </div>
                <div class="team ${match.scoreB > match.scoreA ? 'winner' : ''}">
                  <span class="team-name">${match.teamB || 'Awaiting...'}</span>
                  <span class="team-score">${match.scoreB ?? '-'}</span>
                </div>
              </div>
              <div class="match-status">${getStatusLabel(match.status)}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    `;
  }
  
  function getStatusLabel(status) {
    const labels = {
      'completed': 'Zakończony',
      'live': 'Na żywo',
      'upcoming': 'Nadchodzący'
    };
    return labels[status] || 'Status nieznany';
  }
  
  function addBracketInteractions() {
    document.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => {
        const matchId = card.dataset.matchId;
        console.log('Kliknięto mecz ID:', matchId);
        // Tutaj możesz dodać obsługę kliknięcia
      });
    });
  }

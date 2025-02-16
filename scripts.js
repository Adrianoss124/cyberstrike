document.addEventListener('DOMContentLoaded', () => {
  // Polyfill dla rozszerzeń
  if (typeof browser === "undefined") {
    window.browser = chrome;
  }

  // Timer
  const countdownDate = new Date('2025-03-14T18:00:00').getTime();
  const timerElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };

  const updateTimer = () => {
    const now = Date.now();
    const distance = countdownDate - now;
    
    if (distance <= 0) {
      clearInterval(timerInterval);
      document.querySelector('.countdown')?.remove();
      return;
    }

    timerElements.days.textContent = Math.floor(distance / 86400000).toString().padStart(2, '0');
    timerElements.hours.textContent = Math.floor((distance % 86400000) / 3600000).toString().padStart(2, '0');
    timerElements.minutes.textContent = Math.floor((distance % 3600000) / 60000).toString().padStart(2, '0');
    timerElements.seconds.textContent = Math.floor((distance % 60000) / 1000).toString().padStart(2, '0');
  };

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Initial call

  // Menu hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    const toggleMenu = () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        const headerHeight = document.querySelector('.navbar').offsetHeight;

        toggleMenu(); // Zamknij menu
        
        window.scrollTo({
          top: target.offsetTop - headerHeight,
          behavior: 'smooth'
        });
      });
    });
  }

  // Generowanie pól graczy
  const generatePlayerFields = () => {
    const template = document.getElementById('playerTemplate');
    if (!template) return;

    const generateField = (type, n, required) => {
      const clone = template.content.cloneNode(true);
      const html = clone.children[0].outerHTML
        .replace(/{label}/g, type === 'main' ? `Gracz ${n} *` : `Rezerwowy ${n}`)
        .replace(/{type}/g, type)
        .replace(/{n}/g, n)
        .replace(/{required}/g, required ? 'required' : '')
        .replace(/{steam-required}/g, required ? 'required' : '');
      return html;
    };

    const mainContainer = document.getElementById('mainPlayersContainer');
    const subContainer = document.getElementById('substitutesContainer');

    if (mainContainer) {
      for (let i = 2; i <= 5; i++) {
        mainContainer.insertAdjacentHTML('beforeend', generateField('main', i, true));
      }
    }

    if (subContainer) {
      for (let i = 1; i <= 2; i++) {
        subContainer.insertAdjacentHTML('beforeend', generateField('sub', i, false));
      }
    }
  };
  generatePlayerFields();

  // Obsługa formularza wieloetapowego
  const formSteps = {
    current: 1,
    total: document.querySelectorAll('.form-step').length,
    progress: document.querySelector('.progress'),
    steps: document.querySelectorAll('.form-step')
  };

  const showStep = (step) => {
    if (step < 1 || step > formSteps.total) return;
    
    formSteps.steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    formSteps.current = step;
    
    if (formSteps.progress) {
      formSteps.progress.style.width = `${(formSteps.current / formSteps.total) * 100}%`;
    }
  };

  const validateStep = (step) => {
    const stepElement = document.getElementById(`step${step}`);
    if (!stepElement) return false;

    let isValid = true;
    stepElement.querySelectorAll('[required]').forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });

    return isValid;
  };

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => validateStep(formSteps.current) && showStep(formSteps.current + 1));
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => showStep(formSteps.current - 1));
  });

  // Obsługa wysyłania formularza
  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = document.querySelector('.submit-btn');
      if (!submitButton) return;

      // Walidacja wszystkich pól
      let isValid = true;
      registrationForm.querySelectorAll('[required]').forEach(input => {
        if (!input.checkValidity()) {
          input.reportValidity();
          isValid = false;
        }
      });
      if (!isValid) return;

      try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';

        // Zbieranie danych z formularza
        const formData = new FormData(registrationForm);
        
        // Dodanie nagłówków wymaganych przez Formspree
        const response = await fetch(registrationForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest' // Wymagany nagłówek dla Formspree
          }
        });

        const result = await response.json();
        
        if (result.ok) {
          alert('Rejestracja udana! Sprawdź swoją skrzynkę mailową.');
          registrationForm.reset();
          showStep(1);
        } else {
          throw new Error(result.error || 'Błąd podczas wysyłania formularza');
        }
      } catch (error) {
        console.error('Błąd:', error);
        alert(`Błąd: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Zarejestruj';
      }
    });
  }

  // Obsługa błędów logo
  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    logoImg.addEventListener('error', () => {
      logoImg.style.display = 'none';
    });
  }

  // FAQ
  document.querySelectorAll('.faq-card').forEach(card => {
    card.querySelector('.faq-question').addEventListener('click', () => {
      card.classList.toggle('active');
    });
  });

  // Przycisk przewijania
  const scrollButton = document.querySelector('.cs2-scroll-top');
  if (scrollButton) {
    let isScrolling = false;

    window.addEventListener('scroll', () => {
      scrollButton.classList.toggle('visible', window.scrollY > 400 && !isScrolling);
    });

    scrollButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (isScrolling) return;
      
      isScrolling = true;
      scrollButton.style.pointerEvents = 'none';
      scrollButton.classList.add('active');
      
      const startY = window.scrollY;
      const duration = 800;
      const startTime = performance.now();
      
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        window.scrollTo(0, startY * (1 - ease));
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          isScrolling = false;
          scrollButton.style.pointerEvents = 'auto';
          scrollButton.classList.remove('active');
        }
      };
      
      requestAnimationFrame(animateScroll);
    });
  }
});
// Teams loader
document.addEventListener('DOMContentLoaded', async () => {
  const teamsGrid = document.querySelector('.teams-grid');
  
  try {
    const response = await fetch('teams.json');
    if (!response.ok) throw new Error('Błąd ładowania danych');
    const teams = await response.json();
    
    teamsGrid.classList.remove('loading');
    teamsGrid.innerHTML = '';
    
    teams.forEach(team => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
  <div class="team-header">
    <img src="${team.logo}" class="team-logo sniadowiakilogo" alt="Logo ${team.name}">
    <h3 class="team-name">${team.name}</h3>
  </div>
  <ul class="players-list">
    ${team.players.map(player => `
      <li class="player-item">
        <span>${player.nickname}</span>
      </li>
    `).join('')}
  </ul>
        </div>
      `;
      teamsGrid.appendChild(card);
    });
    
  } catch (error) {
    teamsGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${error.message}</p>
      </div>
    `;
    teamsGrid.classList.remove('loading');
  }
});
async function renderBracket() {
  const container = document.querySelector('.bracket-container');
  
  try {
    const response = await fetch('bracket.json');
    const data = await response.json();
    
    data.rounds.forEach((round, index) => {
      const roundDiv = document.createElement('div');
      roundDiv.className = 'bracket-round';
      
      const roundTitle = document.createElement('h3');
      roundTitle.className = 'round-title';
      roundTitle.textContent = round.name;
      roundDiv.appendChild(roundTitle);
      
      round.matches.forEach(match => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'bracket-match';
        
        // Status meczu
        const status = document.createElement('div');
        status.className = 'match-status';
        status.textContent = match.status === 'completed' ? 'Zakończony' : 
                           match.status === 'live' ? 'Na żywo' : 'Nadchodzący';
        matchDiv.appendChild(status);
        
        // Team A
        const teamA = createTeamElement(match.teamA, match.scoreA, true);
        matchDiv.appendChild(teamA);
        
        // Team B
        const teamB = createTeamElement(match.teamB, match.scoreB, false);
        matchDiv.appendChild(teamB);
        
        // Connector
        if(index < data.rounds.length - 1) {
          const connector = document.createElement('div');
          connector.className = 'match-connector';
          matchDiv.appendChild(connector);
        }
        
        roundDiv.appendChild(matchDiv);
      });
      
      container.appendChild(roundDiv);
    });
    
  } catch(error) {
    console.error('Błąd ładowania drabinki:', error);
    container.innerHTML = `<div class="error">Błąd ładowania danych turnieju</div>`;
  }
}

function createTeamElement(teamName, score, isWinner) {
  const teamDiv = document.createElement('div');
  teamDiv.className = `match-team ${isWinner && score !== null ? 'winner' : ''}`;
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'team-name';
  nameSpan.textContent = teamName || 'Awaiting...';
  
  const scoreSpan = document.createElement('span');
  scoreSpan.className = 'match-score';
  scoreSpan.textContent = score !== null ? score : 'vs';
  
  teamDiv.appendChild(nameSpan);
  teamDiv.appendChild(scoreSpan);
  
  return teamDiv;
}

// Wywołaj po załadowaniu DOM
document.addEventListener('DOMContentLoaded')
async function renderBracket() {
  const container = document.querySelector('.bracket-container');
  console.log('Container:', container); // Debug 1
  
  if (!container) {
    console.error('Błąd: Nie znaleziono .bracket-container');
    return;
  }

  try {
    console.log('Rozpoczynanie pobierania danych...'); // Debug 2
    const response = await fetch('bracket.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Debug 3
    }
    
    console.log('Odpowiedź otrzymana, parsowanie JSON...'); // Debug 4
    const data = await response.json();
    console.log('Dane z JSON:', data); // Debug 5
    
    // Tymczasowe wyświetlenie struktury
    container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`; 
    
  } catch(error) {
    console.error('Pełny błąd:', error); // Debug 6
    container.innerHTML = `<div class="error">Błąd: ${error.message}</div>`;
  }
}

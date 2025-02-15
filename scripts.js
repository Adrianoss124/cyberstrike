document.addEventListener('DOMContentLoaded', () => {
  // Polyfill dla rozszerzeń
  if (typeof browser === 'undefined') {
    window.browser = { runtime: {} };
  }

  // Timer
  const countdownDate = new Date('2025-03-14T18:00:00').getTime();
  const timerInterval = setInterval(updateTimer, 1000);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = countdownDate - now;
    
    document.getElementById('days').textContent = Math.floor(distance / (86400000)).toString().padStart(2, '0');
    document.getElementById('hours').textContent = Math.floor((distance % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('minutes').textContent = Math.floor((distance % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('seconds').textContent = Math.floor((distance % 60000) / 1000).toString().padStart(2, '0');

    if (distance < 0) {
      clearInterval(timerInterval);
      document.querySelector('.countdown')?.remove();
    }
  }

  // Menu hamburger
  const hamburger = document.querySelector('.hamburger');
  hamburger?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      const headerHeight = document.querySelector('.navbar').offsetHeight;
      
      // Zamknij menu
      document.querySelector('.nav-links').classList.remove('active');
      document.querySelector('.hamburger').classList.remove('active');
      
      // Płynne przewijanie
      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: 'smooth'
      });
    });
  });

  // Generowanie pól graczy
  // ZNAJDŹ FUNKCJĘ generatePlayerFields (około linia 30) I ZASTĄP JĄ:
  const generatePlayerFields = () => {
    const template = document.getElementById('playerTemplate');
    
    // Skład główny - 4 graczy (razem z kapitanem 5)
    const mainContainer = document.getElementById('mainPlayersContainer');
    for (let i = 2; i <= 5; i++) {
      const clone = template.content.cloneNode(true);
      const html = clone.children[0].outerHTML
        .replace(/{label}/g, `Gracz ${i} *`)
        .replace(/{type}/g, 'main')
        .replace(/{n}/g, i)
        .replace(/{required}/g, 'required')
        .replace(/{steam-required}/g, 'required');
      mainContainer.insertAdjacentHTML('beforeend', html);
    }

    // Rezerwowi - 2 graczy (nieobowiązkowi)
    const subContainer = document.getElementById('substitutesContainer');
    for (let i = 1; i <= 2; i++) {
      const clone = template.content.cloneNode(true);
      const html = clone.children[0].outerHTML
        .replace(/{label}/g, `Rezerwowy ${i}`)
        .replace(/{type}/g, 'sub')
        .replace(/{n}/g, i)
        .replace(/{required}/g, '')
        .replace(/{steam-required}/g, '');
      subContainer.insertAdjacentHTML('beforeend', html);
    }
  };
  generatePlayerFields();

  // Obsługa formularza wieloetapowego
  let currentStep = 1;
  const steps = document.querySelectorAll('.form-step');
  const progress = document.querySelector('.progress');

  const showStep = (step) => {
    if (step < 1 || step > steps.length) return;
    
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
    
    if (progress) {
      progress.style.width = `${(currentStep / steps.length) * 100}%`;
    }
  };

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => validateStep(currentStep) && showStep(currentStep + 1));
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => showStep(currentStep - 1));
  });

  // Walidacja
  const validateStep = (step) => {
    const stepElement = document.getElementById(`step${step}`);
    let isValid = true;

    stepElement.querySelectorAll('[required]').forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });

    if (step === 6) {
      const checkboxes = stepElement.querySelectorAll('input[type="checkbox"][required]');
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          checkbox.parentElement.classList.add('error');
          isValid = false;
        } else {
          checkbox.parentElement.classList.remove('error');
        }
      });
    }
  
    return isValid;
  };

  // Obsługa wysyłania formularza
  document.getElementById('registrationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.querySelector('.submit-btn');
    
    try {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';

      const formData = new FormData(e.target);
      const response = await fetch(e.target.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Błąd wysyłania');
      alert('Rejestracja udana!');
      e.target.reset();
      showStep(1);
    } catch (error) {
      alert(error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Zarejestruj';
    }
  });

  // Obsługa błędów logo
  document.querySelector('.logo-img')?.addEventListener('error', function() {
    this.style.display = 'none';
  });
});
// W pliku scripts.js
document.querySelectorAll('.faq-card').forEach(card => {
  card.querySelector('.faq-question').addEventListener('click', () => {
    card.classList.toggle('active');
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const scrollButton = document.querySelector('.cs2-scroll-top');
  let isScrolling = false;

  // Pokazywanie przycisku
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400 && !isScrolling) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  });

  // Animacja kliknięcia
  scrollButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (isScrolling) return;
    
    isScrolling = true;
    scrollButton.style.pointerEvents = 'none';
    
    // Animacja elementów
    scrollButton.classList.add('active');
    
    // Płynne przewijanie
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

  // Hover effects
  scrollButton.addEventListener('mouseenter', () => {
    scrollButton.classList.add('hover');
    anime({
      targets: '.cs2-flash',
      opacity: [0, 0.4],
      duration: 300,
      easing: 'easeOutQuad'
    });
  });

  scrollButton.addEventListener('mouseleave', () => {
    scrollButton.classList.remove('hover');
    anime({
      targets: '.cs2-flash',
      opacity: 0,
      duration: 200,
      easing: 'easeOutQuad'
    });
  });
});

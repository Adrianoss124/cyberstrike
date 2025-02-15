document.addEventListener('DOMContentLoaded', () => {
  // Polyfill dla rozszerzeń
  window.browser = window.browser || { runtime: {} };

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

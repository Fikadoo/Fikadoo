const packageData = {
  'Urodziny': {
    items: ['Animacje i gry', 'Malowanie twarzy / tatuaże', 'Modelowanie balonów', 'Mini Disco']
  },
  'Wesela': {
    items: ['Kącik animacji dla dzieci', 'Gry i konkursy', 'Mini Disco', 'Maskotki']
  },
  'Komunie / Chrzciny': {
    items: ['Spokojne zabawy i gry', 'Malowanie twarzy / tatuaże', 'Modelowanie balonów', 'Bańki mydlane']
  },
  'Festyny': {
    items: ['Gry i konkursy', 'Bańki mydlane', 'Piana Party', 'Maskotki']
  },
  'Halloween': {
    items: ['Tematyczne zabawy', 'Malowanie twarzy', 'Gry i konkursy', 'Mini Disco']
  },
  'Karnawały': {
    items: ['Mini Disco', 'Gry i konkursy', 'Modelowanie balonów', 'Maskotki']
  },
  'Dni Dziecka': {
    items: ['Mini Disco', 'Gry i konkursy', 'Malowanie twarzy', 'Bańki mydlane']
  },
  'Dożynki / Dni Miasta': {
    items: ['Gry i konkursy', 'Bańki mydlane', 'Piana Party', 'Maskotki']
  },
  'Imprezy firmowe / Eventy specjalne': {
    items: ['Gry i konkursy', 'Mini Disco', 'Bańki mydlane', 'Piana Party']
  }
};

const API_URL = '/api/send';

const modals = [...document.querySelectorAll('.modal')];
const bookingModal = document.getElementById('bookingModal');
const packageModal = document.getElementById('packageModal');
const customEventModal = document.getElementById('customEventModal');

function localToday() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

document.querySelectorAll('input[type="date"]').forEach(input => {
  input.min = localToday();
});

function openModal(modal) {
  if (!modal) return;

  modals.forEach(item => {
    item.classList.remove('is-open');
    item.setAttribute('aria-hidden', 'true');
  });

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  const oldStatus = modal.querySelector('.form-status');
  if (oldStatus) {
    oldStatus.className = 'form-status';
    oldStatus.textContent = '';
  }

  setTimeout(() => {
    modal.querySelector('input:not([type="hidden"]), select, textarea, button')?.focus();
  }, 50);
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');

  if (!document.querySelector('.modal.is-open')) {
    document.body.classList.remove('modal-open');
  }
}

// Wybór czasu na każdej karcie pakietu.
document.querySelectorAll('[data-package-card]').forEach(card => {
  const options = [...card.querySelectorAll('.duration-option')];

  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(item => item.classList.remove('is-active'));
      option.classList.add('is-active');
      card.dataset.selectedHours = option.dataset.hours || '2';
    });
  });

  const active = card.querySelector('.duration-option.is-active');
  card.dataset.selectedHours = active?.dataset.hours || '2';
});

// Zapytaj o termin / personalizacja.
document.querySelectorAll('.js-open-booking').forEach(button => {
  button.addEventListener('click', () => {
    if (!bookingModal) return;

    const source = bookingModal.querySelector('[name="source"]');
    const packageInput = bookingModal.querySelector('[name="package"]');

    if (source) source.value = button.dataset.source || 'Zapytaj o termin';
    if (packageInput) packageInput.value = '';

    openModal(bookingModal);
  });
});

// Wybranie konkretnego pakietu wydarzenia.
document.querySelectorAll('.js-event-package').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-package-card]');
    const name = button.dataset.package || card?.dataset.package;
    const hours = card?.dataset.selectedHours || '2';
    const selected = packageData[name];

    if (!selected || !packageModal) return;

    const selectedName = document.getElementById('selectedPackageName');
    const packageInput = document.getElementById('packageInput');
    const durationInput = document.getElementById('packageDurationInput');
    const details = document.getElementById('packageDetails');

    if (selectedName) selectedName.textContent = name;
    if (packageInput) packageInput.value = name;
    if (durationInput) durationInput.value = `${hours} ${hours === '1' ? 'godzina' : hours === '2' || hours === '3' || hours === '4' ? 'godziny' : 'godzin'}`;

    if (details) {
      details.innerHTML = `
        <div class="selected-duration">🕒 Wybrany czas: ${hours}h</div>
        <h3>Proponowany plan animacji</h3>
        <ul>${selected.items.map(item => `<li>${item}</li>`).join('')}</ul>
        <p>Plan możemy zmienić i dopasować do Twoich oczekiwań.</p>
      `;
    }

    openModal(packageModal);
  });
});

// Kafelki „Obsługujemy m.in.” — otwierają formularz z gotowym typem imprezy.
document.querySelectorAll('.js-open-event').forEach(button => {
  button.addEventListener('click', () => {
    if (!customEventModal) return;

    const eventName = button.dataset.event || '';
    const source = customEventModal.querySelector('[name="source"]');
    const packageInput = customEventModal.querySelector('[name="package"]');
    const durationInput = customEventModal.querySelector('[name="duration"]');
    const eventTypeInput = customEventModal.querySelector('[name="event_type"]');
    const eventTypeField = customEventModal.querySelector('.custom-event-type-field');
    const title = customEventModal.querySelector('#customEventTitle');
    const eyebrow = customEventModal.querySelector('.eyebrow');
    const intro = customEventModal.querySelector('.modal-intro');

    if (source) source.value = `Kafelek: ${eventName}`;
    if (packageInput) packageInput.value = '';
    if (durationInput) durationInput.value = 'Do ustalenia';
    if (eventTypeInput) eventTypeInput.value = eventName;
    if (eventTypeField) eventTypeField.hidden = true;
    if (title) title.textContent = `Zapytaj o: ${eventName}`;
    if (eyebrow) eyebrow.textContent = `🎉 ${eventName}`;
    if (intro) intro.textContent = 'Podaj kilka szczegółów, a przygotujemy propozycję dopasowaną do Twojej imprezy.';

    openModal(customEventModal);
  });
});

// „I wiele innych!” oraz indywidualny pakiet — pole rodzaju wydarzenia zostaje widoczne.
document.querySelectorAll('.js-custom-package, .js-open-custom-event').forEach(button => {
  button.addEventListener('click', () => {
    if (!customEventModal) return;

    const card = button.closest('[data-package-card]');
    const hours = card?.dataset.selectedHours || '';
    const source = customEventModal.querySelector('[name="source"]');
    const packageInput = customEventModal.querySelector('[name="package"]');
    const durationInput = customEventModal.querySelector('[name="duration"]');
    const eventTypeInput = customEventModal.querySelector('[name="event_type"]');
    const eventTypeField = customEventModal.querySelector('.custom-event-type-field');
    const title = customEventModal.querySelector('#customEventTitle');
    const eyebrow = customEventModal.querySelector('.eyebrow');
    const intro = customEventModal.querySelector('.modal-intro');

    if (source) source.value = 'Inne wydarzenie';
    if (packageInput) packageInput.value = '';
    if (durationInput) durationInput.value = hours ? `${hours} ${hours === '1' ? 'godzina' : 'godziny'}` : 'Do ustalenia';
    if (eventTypeInput) eventTypeInput.value = '';
    if (eventTypeField) eventTypeField.hidden = false;
    if (title) title.textContent = 'Opowiedz nam o swojej imprezie';
    if (eyebrow) eyebrow.textContent = '🎉 Indywidualne wydarzenie';
    if (intro) intro.textContent = 'Napisz kilka szczegółów, a przygotujemy propozycję dopasowaną do Twojego wydarzenia.';

    openModal(customEventModal);
  });
});

// Zamykanie modali.
document.querySelectorAll('.js-close-modal').forEach(element => {
  element.addEventListener('click', () => closeModal(element.closest('.modal')));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal.is-open').forEach(closeModal);
  }
});

// Menu mobilne.
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  mainNav.querySelectorAll('a, .nav-mobile-cta').forEach(item => {
    item.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Formularze.
document.querySelectorAll('.inquiry-form').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');
    if (!status || !submit) return;

    status.className = 'form-status';
    status.textContent = 'Wysyłanie...';
    submit.disabled = true;

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      const raw = await response.text();

      if (!contentType.includes('application/json')) {
        throw new Error(`Backend zwrócił odpowiedź HTTP ${response.status}, ale nie JSON.`);
      }

      const data = raw ? JSON.parse(raw) : {};

      if (!response.ok || data.ok !== true) {
        throw new Error(data.message || `Błąd HTTP ${response.status}`);
      }

      status.classList.add('success');
      status.textContent = data.message || 'Zapytanie zostało wysłane.';
      form.reset();

      setTimeout(() => closeModal(form.closest('.modal')), 1500);
    } catch (error) {
      console.error('Błąd formularza:', error);
      status.classList.add('error');
      status.textContent = 'Nie udało się wysłać formularza: ' + error.message;
    } finally {
      submit.disabled = false;
    }
  });
});

// Tryb jasny / ciemny.
const themeToggle = document.getElementById('themeToggle');
const heroThemeImage = document.getElementById('heroThemeImage');

function applyTheme(theme) {
  const dark = theme === 'dark';

  document.documentElement.dataset.theme = dark ? 'dark' : 'light';

  // Zmieniamy kolaż razem z motywem strony.
  if (heroThemeImage) {
    heroThemeImage.src = dark
      ? 'assets/hero-dark.png'
      : 'assets/hero-light.png';
  }

  if (!themeToggle) return;

  const icon = themeToggle.querySelector('.theme-toggle-icon');
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute(
    'aria-label',
    dark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'
  );
  themeToggle.title = dark ? 'Tryb jasny' : 'Tryb ciemny';

  if (icon) {
    icon.textContent = dark ? '☀️' : '🌙';
  }
}

let savedTheme = null;

try {
  savedTheme = localStorage.getItem('fikadoo-theme');
} catch (error) {
  savedTheme = null;
}

const preferredTheme =
  savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );

applyTheme(preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme =
      document.documentElement.dataset.theme === 'dark'
        ? 'light'
        : 'dark';

    applyTheme(nextTheme);

    try {
      localStorage.setItem('fikadoo-theme', nextTheme);
    } catch (error) {
      // Strona działa również, gdy zapis ustawienia jest zablokowany.
    }
  });
}

console.log('Fikadoo: app.js załadowany poprawnie.');

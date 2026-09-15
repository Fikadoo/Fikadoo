const packageData = {
  Mini: {
    price: '750 zł',
    audience: 'do 10 dzieci',
    items: [
      '2 godziny animacji',
      'Podstawowe zabawy i gry',
      'Muzyka i nagłośnienie'
    ]
  },

  Hopla: {
    price: '1200 zł',
    audience: 'do 20 dzieci',
    items: [
      '3 godziny animacji',
      'Autorskie zabawy i konkursy',
      'Malowanie twarzy',
      'Bańki mydlane',
      'Sprzęt, rekwizyty i muzyka'
    ]
  },

  'Mega Hopla': {
    price: '1800 zł',
    audience: 'do 30 dzieci',
    items: [
      '4 godziny animacji',
      'Malowanie twarzy i brokaty',
      'Wata cukrowa',
      'Maskotka na żywo',
      'Sprzęt, rekwizyty i muzyka'
    ]
  }
};

// Nowoczesna Netlify Function ma własną prostą ścieżkę:
const API_URL = '/api/send';

const modals = [...document.querySelectorAll('.modal')];
const bookingModal = document.getElementById('bookingModal');
const packageModal = document.getElementById('packageModal');

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

  modals.forEach(m => {
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
  });

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  setTimeout(() => {
    modal.querySelector('input, select, textarea, button')?.focus();
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

// Zapytaj o termin
document.querySelectorAll('.js-open-booking').forEach(button => {
  button.addEventListener('click', () => {
    if (!bookingModal) return;

    const source = bookingModal.querySelector('[name="source"]');
    const packageInput = bookingModal.querySelector('[name="package"]');

    if (source) {
      source.value = button.dataset.source || 'Zapytaj o termin';
    }

    if (packageInput) {
      packageInput.value = '';
    }

    openModal(bookingModal);
  });
});

// Wybór pakietu
document.querySelectorAll('.js-package').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.package;
    const p = packageData[name];

    if (!p || !packageModal) return;

    const selectedName = document.getElementById('selectedPackageName');
    const packageInput = document.getElementById('packageInput');
    const details = document.getElementById('packageDetails');

    if (selectedName) selectedName.textContent = name;
    if (packageInput) packageInput.value = name;

    if (details) {
      details.innerHTML = `
        <h3>${p.price} <small>• ${p.audience}</small></h3>
        <ul>${p.items.map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    }

    openModal(packageModal);
  });
});

// Zamykanie modali
document.querySelectorAll('.js-close-modal').forEach(element => {
  element.addEventListener('click', () => {
    closeModal(element.closest('.modal'));
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal.is-open').forEach(closeModal);
  }
});

// Menu mobilne
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Formularze
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
        throw new Error(
          `Backend zwrócił odpowiedź HTTP ${response.status}, ale nie JSON.`
        );
      }

      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error('Nie udało się odczytać odpowiedzi backendu.');
      }

      if (!response.ok || data.ok !== true) {
        throw new Error(data.message || `Błąd HTTP ${response.status}`);
      }

      status.classList.add('success');
      status.textContent = data.message || 'Zapytanie zostało wysłane.';
      form.reset();

      setTimeout(() => {
        closeModal(form.closest('.modal'));
      }, 1500);

    } catch (error) {
      console.error('Błąd formularza:', error);
      status.classList.add('error');
      status.textContent = 'Nie udało się wysłać formularza: ' + error.message;

    } finally {
      submit.disabled = false;
    }
  });
});

console.log('Fikadoo: app.js załadowany poprawnie.');

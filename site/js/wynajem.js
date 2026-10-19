const rentalModal = document.getElementById('rentalModal');
const rentalPackageInput = document.getElementById('rentalPackageInput');
const rentalSelectedSummary = document.getElementById('rentalSelectedSummary');
const rentalModalTitle = document.getElementById('rentalModalTitle');
const rentalModalIntro = document.getElementById('rentalModalIntro');

function setRentalModal(equipment, mode, price) {
  if (!rentalModal) return;

  const selectedEquipment = equipment || 'Wynajem sprzętu Fikadoo';
  const selectedMode = mode || 'Do ustalenia';
  const selectedPrice = price || 'wycena indywidualna';

  if (rentalPackageInput) {
    rentalPackageInput.value = `${selectedEquipment} — ${selectedMode}`;
  }

  if (rentalSelectedSummary) {
    rentalSelectedSummary.innerHTML = `
      <strong>${selectedEquipment}</strong>
      <span>${selectedMode}</span>
      <b>${selectedPrice}</b>
    `;
  }

  if (rentalModalTitle) rentalModalTitle.textContent = `Zapytaj o: ${selectedEquipment}`;
  if (rentalModalIntro) {
    rentalModalIntro.textContent = 'Podaj termin i kilka szczegółów, a przygotujemy dokładną wycenę oraz potwierdzimy dostępność.';
  }

  openModal(rentalModal);
}

document.querySelectorAll('[data-rental-card]').forEach(card => {
  const options = [...card.querySelectorAll('.rental-option')];

  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(item => item.classList.remove('is-active'));
      option.classList.add('is-active');
    });
  });

  card.querySelector('.rental-quote-btn')?.addEventListener('click', () => {
    const active = card.querySelector('.rental-option.is-active');
    setRentalModal(
      card.dataset.equipment || '',
      active?.dataset.mode || 'Do ustalenia',
      card.dataset.price || ''
    );
  });
});

document.querySelectorAll('.js-open-rental-general').forEach(button => {
  button.addEventListener('click', () => {
    setRentalModal('Wynajem sprzętu Fikadoo', 'Do ustalenia', 'wycena indywidualna');
  });
});

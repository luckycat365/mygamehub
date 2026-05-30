if (typeof document !== 'undefined') {
  const initializeDummyCards = () => {
    document.querySelectorAll('[data-dummy-card]').forEach((card) => {
      card.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeDummyCards();
    }, { once: true });
  } else {
    initializeDummyCards();
  }
}

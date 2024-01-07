document.addEventListener('DOMContentLoaded', function() {
  const closeNavButton = document.getElementById('navClose');
  const openModalButton = document.getElementById('openModalButton');
  const closeModalButton = document.getElementById('closeModalButton');
  const modal = document.getElementById('myModal');
  const app = document.getElementById('app');

  // Close Nav
  closeNavButton.addEventListener('click', function() {
    app.setAttribute("aria-hidden", "true")
    app.setAttribute("inert", "")
  });

  // Show the modal
  openModalButton.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Close the modal
  closeModalButton.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Close the modal if the user clicks outside of it
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

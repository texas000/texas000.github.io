document.addEventListener('DOMContentLoaded', function() {
  const openModalButton = document.getElementById('openModalButton');
  const closeModalButton = document.getElementById('closeModalButton');
  const modal = document.getElementById('myModal');

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

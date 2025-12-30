const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');

const sidebarLabels = sidebar.querySelectorAll('.sidebar-labels > .label');
const pages = document.querySelectorAll('.page');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

sidebar.addEventListener('click', (event) => {
    const mouseClick = event.target;
  if (mouseClick.classList.contains('label')) {
    pages.forEach((page) => {
      const key = mouseClick.dataset.page;
      if (page.dataset.page === key) {
        page.classList.remove('hide-display');
        return;
      }
      page.classList.add('hide-display');
    });
  }
});
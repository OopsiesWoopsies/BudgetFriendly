const hamburger = document.querySelector('.hamburger');
const navbarTitle = document.querySelector('.navbar-title');
const sidebar = document.querySelector('.sidebar');

const sidebarLabels = sidebar.querySelectorAll('.sidebar-labels > .label');
const pages = document.querySelectorAll('.page');

function initNavbarListeners() {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  sidebar.addEventListener('click', (event) => {
    const mouseClick = event.target;
    if (mouseClick.classList.contains('label')) {
      sidebar.classList.remove('open');
      pages.forEach((page) => {
        const key = mouseClick.dataset.page;
        if (page.dataset.page === key) {
          page.classList.remove('display-none');
          if (key === 'budgets') navbarTitle.textContent = 'BudgetFriendly';
          else navbarTitle.textContent = mouseClick.textContent;
          return;
        }
        page.classList.add('display-none');
      });
    }
  });
}

initNavbarListeners();

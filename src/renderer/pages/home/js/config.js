const openConfig = document.getElementById('configButton');
const config = document.getElementById('config');
const closeConfig = document.getElementById('closeConfig');

export function initConfigListeners() {
  openConfig.addEventListener('click', () => {
    config.showModal();
  });

  closeConfig.addEventListener('click', () => {
    config.close();
  });
}

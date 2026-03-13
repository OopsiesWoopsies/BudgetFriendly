export function initPieChart() {
  const data = [10, 20, 70];
  let start = 0;

  const colors = ['red', 'blue', 'green'];

  let gradient = data
    .map((val, i) => {
      let end = start + val;
      let g = `${colors[i]} ${start}% ${end}%`;
      start = end;
      return g;
    })
    .join(',');

  document.querySelector('.pie-chart').style.background = `conic-gradient(${gradient})`;
}

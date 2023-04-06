import * as Comlink from 'comlink';

async function getWorker() {
  return await Comlink.wrap(new Worker(new URL('./worker.js', import.meta.url)))
    .init;
}

function checkNumThreads(worker) {
  worker.getNumThreads().then((n_threads) => {
    console.log(`Rayon number of threads: ${n_threads}`);
  });
}

function setupForm(worker) {
  const textarea = document.getElementById('boundary_matrix');
  const button = document.getElementById('compute');
  button.onclick = async (e) => {
    e.preventDefault();
    try {
      const boundary_obj = buildBoundaryObj(textarea.value);
      displayComputing();
      const diagram = await worker.computePairings(boundary_obj);
      displayDiagram(diagram);
    } catch (error) {
      displayError(error);
    }
  };
}

function buildBoundaryObj(boundary_str) {
  const parsed_rows = boundary_str
    .split('\n')
    .map((row) =>
      row
        .trim()
        .split(',')
        .map((str) => str.trim())
        .map(parseFloat)
        .filter((elem) => !isNaN(elem))
    )
    .filter((row) => row.length > 0);
  return parsed_rows.reduce(
    (boundary_obj, next_row) => {
      boundary_obj.dimensions.push(next_row[0]);
      boundary_obj.boundaries.push(next_row.slice(1));
      return boundary_obj;
    },
    { dimensions: [], boundaries: [] }
  );
}

function displayComputing() {
  const result_area = document.getElementById('result');
  result_area.innerText = 'Computing...';
}

// TODO: Display output in nicer format
function displayDiagram(diagram) {
  console.log(diagram);
  const result_area = document.getElementById('result');
  const diagram_string = diagram
    .map((pairing) => `${pairing[0]}, ${pairing[1]}`)
    .join('\n');
  result_area.innerText = diagram_string;
}

function displayError(error) {
  document.getElementById('problem').classList.remove('noshow');
  console.error(error);
}

async function init() {
  const worker = await getWorker();
  checkNumThreads(worker);
  setupForm(worker);
}

init();
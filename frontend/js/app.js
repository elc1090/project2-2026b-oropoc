// URL base da API - ajuste para onde seu backend estiver rodando
const API_URL = 'http://localhost:3000/api/pontos';

// Inicializa o mapa (coordenadas iniciais: exemplo Santa Maria/RS)
const map = L.map('map').setView([-29.6842, -53.8069], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Guarda os marcadores atuais para poder limpar/atualizar o mapa
let marcadores = {};
let latLngSelecionado = null;

// Elementos do DOM
const modal = document.getElementById('modal-form');
const form = document.getElementById('form-ponto');
const formTitulo = document.getElementById('form-titulo');
const btnNovoPonto = document.getElementById('btn-novo-ponto');
const btnCancelar = document.getElementById('btn-cancelar');
const btnExcluir = document.getElementById('btn-excluir');
const latDisplay = document.getElementById('lat-display');
const lngDisplay = document.getElementById('lng-display');

// ---------- Funções de API ----------

async function buscarPontos() {
  const resp = await fetch(API_URL);
  return resp.json();
}

async function criarPonto(dados) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return resp.json();
}

async function atualizarPonto(id, dados) {
  const resp = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return resp.json();
}

async function excluirPonto(id) {
  const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return resp.json();
}

// ---------- Renderização do mapa ----------

function limparMarcadores() {
  Object.values(marcadores).forEach((m) => map.removeLayer(m));
  marcadores = {};
}

function adicionarMarcador(ponto) {
  const marker = L.marker([ponto.latitude, ponto.longitude]).addTo(map);

  marker.bindPopup(`
    <strong>${ponto.nome}</strong><br/>
    ${ponto.tipo_material ? `Tipo: ${ponto.tipo_material}<br/>` : ''}
    ${ponto.descricao ? `${ponto.descricao}<br/>` : ''}
    ${ponto.endereco ? `${ponto.endereco}<br/>` : ''}
    <button onclick="abrirEdicao(${ponto.id})">Editar</button>
  `);

  marcadores[ponto.id] = marker;
}

async function carregarPontosNoMapa() {
  limparMarcadores();
  const pontos = await buscarPontos();
  pontos.forEach(adicionarMarcador);
  // guarda os dados completos para reuso na edição
  window._pontosCache = pontos;
}

// ---------- Modal / Formulário ----------

function abrirModal(titulo) {
  formTitulo.textContent = titulo;
  modal.classList.remove('escondido');
}

function fecharModal() {
  modal.classList.add('escondido');
  form.reset();
  document.getElementById('ponto-id').value = '';
  latDisplay.textContent = '-';
  lngDisplay.textContent = '-';
  latLngSelecionado = null;
  btnExcluir.classList.add('escondido');
}

btnNovoPonto.addEventListener('click', () => {
  abrirModal('Novo Ponto de Coleta');
});

btnCancelar.addEventListener('click', fecharModal);

// Clique no mapa define a localização do novo ponto (ou reposiciona ao editar)
map.on('click', (e) => {
  latLngSelecionado = e.latlng;
  document.getElementById('latitude').value = e.latlng.lat;
  document.getElementById('longitude').value = e.latlng.lng;
  latDisplay.textContent = e.latlng.lat.toFixed(5);
  lngDisplay.textContent = e.latlng.lng.toFixed(5);

  if (modal.classList.contains('escondido')) {
    abrirModal('Novo Ponto de Coleta');
  }
});

// Abre o formulário preenchido para edição (chamado pelo botão no popup)
window.abrirEdicao = function (id) {
  const ponto = window._pontosCache.find((p) => p.id === id);
  if (!ponto) return;

  document.getElementById('ponto-id').value = ponto.id;
  document.getElementById('nome').value = ponto.nome;
  document.getElementById('tipo_material').value = ponto.tipo_material || '';
  document.getElementById('descricao').value = ponto.descricao || '';
  document.getElementById('endereco').value = ponto.endereco || '';
  document.getElementById('latitude').value = ponto.latitude;
  document.getElementById('longitude').value = ponto.longitude;
  latDisplay.textContent = ponto.latitude;
  lngDisplay.textContent = ponto.longitude;

  btnExcluir.classList.remove('escondido');
  abrirModal('Editar Ponto de Coleta');
};

btnExcluir.addEventListener('click', async () => {
  const id = document.getElementById('ponto-id').value;
  if (!id) return;
  if (confirm('Tem certeza que deseja excluir este ponto de coleta?')) {
    await excluirPonto(id);
    fecharModal();
    carregarPontosNoMapa();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('ponto-id').value;
  const dados = {
    nome: document.getElementById('nome').value,
    tipo_material: document.getElementById('tipo_material').value,
    descricao: document.getElementById('descricao').value,
    endereco: document.getElementById('endereco').value,
    latitude: parseFloat(document.getElementById('latitude').value),
    longitude: parseFloat(document.getElementById('longitude').value),
  };

  if (isNaN(dados.latitude) || isNaN(dados.longitude)) {
    alert('Clique no mapa para definir a localização do ponto de coleta.');
    return;
  }

  if (id) {
    await atualizarPonto(id, dados);
  } else {
    await criarPonto(dados);
  }

  fecharModal();
  carregarPontosNoMapa();
});

// ---------- Inicialização ----------
carregarPontosNoMapa();

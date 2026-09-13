import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { PontoColeta, PontoColetaInput } from './types';
import { buscarPontos, criarPonto, atualizarPonto, excluirPonto } from './api';

// Inicializa o mapa (coordenadas iniciais: exemplo Santa Maria/RS)
const map = L.map('map').setView([-29.6842, -53.8069], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let marcadores: Record<number, L.Marker> = {};
let pontosCache: PontoColeta[] = [];

// ---------- Elementos do DOM (tipados) ----------
const modal = document.getElementById('modal-form') as HTMLDivElement;
const form = document.getElementById('form-ponto') as HTMLFormElement;
const formTitulo = document.getElementById('form-titulo') as HTMLHeadingElement;
const btnNovoPonto = document.getElementById('btn-novo-ponto') as HTMLButtonElement;
const btnCancelar = document.getElementById('btn-cancelar') as HTMLButtonElement;
const btnExcluir = document.getElementById('btn-excluir') as HTMLButtonElement;
const latDisplay = document.getElementById('lat-display') as HTMLSpanElement;
const lngDisplay = document.getElementById('lng-display') as HTMLSpanElement;

const idInput = document.getElementById('ponto-id') as HTMLInputElement;
const nomeInput = document.getElementById('nome') as HTMLInputElement;
const tipoInput = document.getElementById('tipo_material') as HTMLInputElement;
const descricaoInput = document.getElementById('descricao') as HTMLTextAreaElement;
const enderecoInput = document.getElementById('endereco') as HTMLInputElement;
const latInput = document.getElementById('latitude') as HTMLInputElement;
const lngInput = document.getElementById('longitude') as HTMLInputElement;

// ---------- Renderização do mapa ----------

function limparMarcadores(): void {
  Object.values(marcadores).forEach((m) => map.removeLayer(m));
  marcadores = {};
}

function adicionarMarcador(ponto: PontoColeta): void {
  const marker = L.marker([ponto.latitude, ponto.longitude]).addTo(map);

  marker.bindPopup(`
    <strong>${ponto.nome}</strong><br/>
    ${ponto.tipo_material ? `Tipo: ${ponto.tipo_material}<br/>` : ''}
    ${ponto.descricao ? `${ponto.descricao}<br/>` : ''}
    ${ponto.endereco ? `${ponto.endereco}<br/>` : ''}
    <button onclick="window.abrirEdicao(${ponto.id})">Editar</button>
  `);

  marcadores[ponto.id] = marker;
}

async function carregarPontosNoMapa(): Promise<void> {
  limparMarcadores();
  pontosCache = await buscarPontos();
  pontosCache.forEach(adicionarMarcador);
}

// ---------- Modal / Formulário ----------

function abrirModal(titulo: string): void {
  formTitulo.textContent = titulo;
  modal.classList.remove('escondido');
}

function fecharModal(): void {
  modal.classList.add('escondido');
  form.reset();
  idInput.value = '';
  latDisplay.textContent = '-';
  lngDisplay.textContent = '-';
  btnExcluir.classList.add('escondido');
}

btnNovoPonto.addEventListener('click', () => {
  abrirModal('Novo Ponto de Coleta');
});

btnCancelar.addEventListener('click', fecharModal);

map.on('click', (e: L.LeafletMouseEvent) => {
  latInput.value = String(e.latlng.lat);
  lngInput.value = String(e.latlng.lng);
  latDisplay.textContent = e.latlng.lat.toFixed(5);
  lngDisplay.textContent = e.latlng.lng.toFixed(5);

  if (modal.classList.contains('escondido')) {
    abrirModal('Novo Ponto de Coleta');
  }
});

// Exposto no window para ser chamado pelo onclick do popup do Leaflet
declare global {
  interface Window {
    abrirEdicao: (id: number) => void;
  }
}

window.abrirEdicao = function (id: number): void {
  const ponto = pontosCache.find((p) => p.id === id);
  if (!ponto) return;

  idInput.value = String(ponto.id);
  nomeInput.value = ponto.nome;
  tipoInput.value = ponto.tipo_material || '';
  descricaoInput.value = ponto.descricao || '';
  enderecoInput.value = ponto.endereco || '';
  latInput.value = String(ponto.latitude);
  lngInput.value = String(ponto.longitude);
  latDisplay.textContent = String(ponto.latitude);
  lngDisplay.textContent = String(ponto.longitude);

  btnExcluir.classList.remove('escondido');
  abrirModal('Editar Ponto de Coleta');
};

btnExcluir.addEventListener('click', async () => {
  const id = idInput.value;
  if (!id) return;
  if (confirm('Tem certeza que deseja excluir este ponto de coleta?')) {
    await excluirPonto(Number(id));
    fecharModal();
    carregarPontosNoMapa();
  }
});

form.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();

  const id = idInput.value;
  const dados: PontoColetaInput = {
    nome: nomeInput.value,
    tipo_material: tipoInput.value,
    descricao: descricaoInput.value,
    endereco: enderecoInput.value,
    latitude: parseFloat(latInput.value),
    longitude: parseFloat(lngInput.value),
  };

  if (isNaN(dados.latitude) || isNaN(dados.longitude)) {
    alert('Clique no mapa para definir a localização do ponto de coleta.');
    return;
  }

  if (id) {
    await atualizarPonto(Number(id), dados);
  } else {
    await criarPonto(dados);
  }

  fecharModal();
  carregarPontosNoMapa();
});

// ---------- Inicialização ----------
carregarPontosNoMapa();

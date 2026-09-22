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
let localizacaoUsuario: L.LatLng | null = null;
let marcadorLocalizacao: L.CircleMarker | null = null;

// ---------- Elementos do DOM (tipados) ----------
const modal = document.getElementById('modal-form') as HTMLDivElement;
const form = document.getElementById('form-ponto') as HTMLFormElement;
const formTitulo = document.getElementById('form-titulo') as HTMLHeadingElement;
const btnNovoPonto = document.getElementById('btn-novo-ponto') as HTMLButtonElement;
const btnCancelar = document.getElementById('btn-cancelar') as HTMLButtonElement;
const btnExcluir = document.getElementById('btn-excluir') as HTMLButtonElement;
const btnLocalizacao = document.getElementById('btn-localizacao') as HTMLButtonElement;
const btnHistorico = document.getElementById('btn-historico') as HTMLButtonElement;
const btnFecharHistorico = document.getElementById('btn-fechar-historico') as HTMLButtonElement;
const painelHistorico = document.getElementById('painel-historico') as HTMLElement;
const listaHistorico = document.getElementById('lista-historico') as HTMLDivElement;
const historicoContagem = document.getElementById('historico-contagem') as HTMLParagraphElement;
const buscaPontos = document.getElementById('busca-pontos') as HTMLInputElement;
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

function centralizarNaLocalizacaoUsuario(): void {
  if (!localizacaoUsuario) return;
  map.setView(localizacaoUsuario, 16);
  marcadorLocalizacao?.openPopup();
}

function localizarUsuario(): void {
  if (localizacaoUsuario) {
    centralizarNaLocalizacaoUsuario();
    return;
  }

  if (!navigator.geolocation) {
    alert('Seu navegador não oferece suporte à localização.');
    return;
  }

  btnLocalizacao.disabled = true;
  btnLocalizacao.textContent = 'Localizando...';

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      localizacaoUsuario = L.latLng(posicao.coords.latitude, posicao.coords.longitude);
      marcadorLocalizacao = L.circleMarker(localizacaoUsuario, {
        radius: 8,
        color: '#1565c0',
        fillColor: '#42a5f5',
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(map);
      marcadorLocalizacao.bindPopup('Você está aqui.');
      centralizarNaLocalizacaoUsuario();
      btnLocalizacao.disabled = false;
      btnLocalizacao.textContent = 'Minha localização';
    },
    () => {
      btnLocalizacao.disabled = false;
      btnLocalizacao.textContent = 'Minha localização';
      alert('Não foi possível obter sua localização. Verifique a permissão do navegador.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
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

function renderizarHistorico(): void {
  const termo = normalizarTexto(buscaPontos.value);
  const pontosFiltrados = pontosCache.filter((ponto) => normalizarTexto(ponto.nome).includes(termo));
  const quantidade = pontosFiltrados.length;
  historicoContagem.textContent = termo
    ? `${quantidade} de ${pontosCache.length} ${pontosCache.length === 1 ? 'ponto' : 'pontos'}`
    : `${quantidade} ${quantidade === 1 ? 'ponto' : 'pontos'}`;

  if (quantidade === 0) {
    listaHistorico.innerHTML = termo
      ? '<p class="historico-vazio">Nenhum ponto encontrado.</p>'
      : '<p class="historico-vazio">Nenhum ponto criado ainda.</p>';
    return;
  }

  listaHistorico.replaceChildren(
    ...pontosFiltrados.map((ponto) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'item-historico';
      item.dataset.id = String(ponto.id);

      const nome = document.createElement('strong');
      nome.textContent = ponto.nome;
      item.appendChild(nome);

      const detalhes = document.createElement('span');
      detalhes.textContent = ponto.tipo_material || ponto.endereco || 'Sem detalhes adicionais';
      item.appendChild(detalhes);

      const data = document.createElement('small');
      data.textContent = `Criado em ${new Date(ponto.criado_em).toLocaleDateString('pt-BR')}`;
      item.appendChild(data);

      item.addEventListener('click', () => {
        map.setView([ponto.latitude, ponto.longitude], 16);
        marcadores[ponto.id]?.openPopup();
        window.abrirEdicao(ponto.id);
      });

      return item;
    })
  );
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

async function carregarPontosNoMapa(): Promise<void> {
  limparMarcadores();
  pontosCache = await buscarPontos();
  pontosCache.forEach(adicionarMarcador);
  renderizarHistorico();
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

btnLocalizacao.addEventListener('click', localizarUsuario);

function fecharHistorico(): void {
  painelHistorico.classList.remove('aberto');
  painelHistorico.setAttribute('aria-hidden', 'true');
  btnHistorico.setAttribute('aria-expanded', 'false');
}

btnHistorico.addEventListener('click', () => {
  const aberto = painelHistorico.classList.toggle('aberto');
  painelHistorico.setAttribute('aria-hidden', String(!aberto));
  btnHistorico.setAttribute('aria-expanded', String(aberto));
});

btnFecharHistorico.addEventListener('click', fecharHistorico);
buscaPontos.addEventListener('input', renderizarHistorico);

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
    nome: nomeInput.value.trim(),
    tipo_material: tipoInput.value.trim(),
    descricao: descricaoInput.value,
    endereco: enderecoInput.value.trim(),
    latitude: parseFloat(latInput.value),
    longitude: parseFloat(lngInput.value),
  };

  if (!dados.nome || !dados.tipo_material || !dados.endereco) {
    alert('Preencha o nome, o tipo de material e o endereço.');
    return;
  }

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

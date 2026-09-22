# Projeto: Aplicação com persistência de dados em backend

![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")

## Acesso

- frontend: https://project2-2026b-oropoc-1.onrender.com
- backend: https://project2-2026b-oropoc.onrender.com


## Desenvolvedor(a)
- Joao Daniel Wurdig Lucas
- Sistemas de Informacao UFSM



## Proposta
Aplicação web para mapear pontos de coleta de resíduos recicláveis, permitindo cadastrar, consultar, atualizar e excluir locais, com informações como endereço, coordenadas, tipos de materiais recebidos e horários de funcionamento. Os pontos devem ser visualizados em um mapa interativo (por exemplo, usando Leaflet + OpenStreetMap). Aqui há possibilidade de extensão em colaboração internacional com universidade Chilena.


## Parceria/cliente/usuário
- parceiro: Gabriel Maroneze Ramos

## Feedback/comentário da parceria/cliente/usuário
Substitua este texto por um feedback produzido pelo(a) colega parceiro(a). Na modalidade A (parceria dev), o foco principal do feedback/comentário estará nas diferenças percebidas no código. Na modalidade B (parceria cliente/usuário), o foco principal do feedback/comentário estará nas funcionalidades/interface.

## Desenvolvimento

### Processo

Comecei escolhendo TypeScript e o PostgreSQL, tanto porque eu jah tinha experiencia com o TS quanto porque, pesquisando, achei melhor optar pelo postgreSQL para lidar com geografia. Primeiro fiz um front e back e um db local para rodar e ver se as principais requisicoes estavam funcionando, depois fiz o deploy, primeiramente como um "palno B" se tudo desse errado eu teria pelo menos o minimo no render, mas depois eu vi que precisava mudar coisas no back e criar o supabase para conversar com o render e ter um db online, entao isso ate que ajudou porque depois as coisas que eu queria acrescentar jah estavam alinhadas com o que o render precisava, nao que mexesse muito nesse aspecto porem foi bom ter esse conhecimento sobre db, relembrar as relacoes entre back e front e como um puxa do outro requisicoes e repostas. Depois de muita luta para configurar o render para o front ter acesso ao supabase, escolhi ter duas coisas para ajudar o meu usuario, uma barra de pesquisa com um historico dos pontos de coleta criados e tambem a impossibilidade de criar um ponto sem preencher todos os campos importantes.

### Trechos de código

```function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}
```
Esse código transforma textos como São José em uma versão sem acentos. Assim, ao pesquisar sao jose, o usuário ainda encontra São José.


```
function adicionarMarcador(ponto: PontoColeta): void {
  const marker = L.marker([ponto.latitude, ponto.longitude]).addTo(map);

  marker.bindPopup(`
    <strong>${ponto.nome}</strong><br/>
    Tipo: ${ponto.tipo_material}<br/>
    ${ponto.endereco}<br/>
    <button onclick="window.abrirEdicao(${ponto.id})">
      Editar
    </button>
  `);

  marcadores[ponto.id] = marker;
}
```
Cada ponto vindo do banco vira um marcador no mapa. O popup mostra as informações do ponto e possui um botão para editá-lo usando seu id.

```
const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete('sslmode');

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: { rejectUnauthorized: false },
});
```
A aplicação lê a URI do Supabase pela variável DATABASE_URL. Depois, configura uma conexão SSL para que o backend consiga acessar o banco hospedado na nuvem pelo Render.

## Tecnologias

### Linguagens e afins

tecnologias utilizadas:
- TypeScript
- Node
- PostgreSQL
- Render

### Ambiente de desenvolvimento

Substitua este trecho por uma lista detalhada dos ambientes/ferramentas de desenvolvimento que você usou (por exemplo, VS Code + alguma extensão, agentes de IA, etc.)
- VS Code
- Gemini
- Supabase
- GitHub

## Referências e créditos

- Como fazer Deploy Grátis Full Stack (MERN) do ZERO — MongoDB, React, Node e Express!: https://youtu.be/OX_pPHI63gg?si=y47wPVKfoKHQGFRE
- Supabase Tutorial for Beginners 2026: How to Use Supabase: https://youtu.be/hVrSGKGU24g?si=PVKQpTJZlIi6krU9




---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b

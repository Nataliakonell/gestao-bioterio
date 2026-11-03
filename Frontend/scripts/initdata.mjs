import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) return {};
  const raw = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const BASE = (env.API_URL || 'http://localhost:5279').replace(/\/+$/, '');
const API = BASE + '/api';
const AUTH_URL = env.AUTH_URL || 'https://accounts.ucdb.br';
const AUTH_USERNAME = env.AUTH_USERNAME;
const AUTH_PASSWORD = env.AUTH_PASSWORD;

let token = env.AUTH_TOKEN;

async function login() {
  if (!AUTH_USERNAME || !AUTH_PASSWORD) {
    throw new Error(
      'Credenciais não encontradas.\n\n' +
      'Preencha AUTH_USERNAME e AUTH_PASSWORD no Frontend/.env'
    );
  }

  const body = new URLSearchParams({
    username: AUTH_USERNAME,
    password: AUTH_PASSWORD,
    returnUrl: '/keycloak/userinfo',
    ipAdress: '127.0.0.1',
  });
  const res = await fetch(`${AUTH_URL}/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${AUTH_URL}/keycloak/userinfo`,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na autenticação (${res.status}): ${text}`);
  }
  const json = await res.json();
  if (json.TipoRedirecionamentoId === 2) {
    throw new Error(
      'Autenticação requer segunda fase (token 2FA).\n' +
      'Use AUTH_TOKEN no .env com um token já gerado manualmente.'
    );
  }
  const url = json.Url;
  if (!url) throw new Error('URL de redirecionamento não encontrada na resposta.');
  const qs = url.split('?')[1];
  if (!qs) throw new Error('Token não encontrado na URL de redirecionamento.');
  const params = new URLSearchParams(qs);
  token = params.get('token');
  if (!token) throw new Error('Token não encontrado na URL de redirecionamento.');
}

async function acquireToken() {
  if (token) return token;
  console.log('Utilizando mock-token para bypass de autenticação local...');
  token = 'mock-token-admin';
  return token;
}

async function api(path, method = 'GET', body = null, formData = false, retried = false) {
  const url = `${API}${path}`;
  const t = await acquireToken();
  const opts = { method };
  opts.headers = { Authorization: `Bearer ${t}` };
  if (body) {
    if (formData) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }

  if (res.status === 401 && !retried) {
    token = null;
    await acquireToken();
    return api(path, method, body, formData, true);
  }

  if (!res.ok) {
    const msg = json ? (json.message || json.title || text) : text;
    throw new Error(`${method} ${path} ${res.status}: ${msg}`);
  }
  return json;
}
const post = (path, data) => api(path, 'POST', data);
const postForm = (path, data) => api(path, 'POST', data, true);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForApi(maxRetries = 15) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(BASE, { method: 'HEAD' });
      if (res.status !== 502 && res.status !== 0) {
        console.log('Backend OK.');
        return;
      }
    } catch {}
    await sleep(1500);
  }
  throw new Error('Backend não respondeu após várias tentativas.');
}

const now = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function main() {
  console.log('Aguardando backend...');
  await waitForApi();
  await acquireToken();
  console.log('Iniciando carga de dados...\n');

  const ids = {};

  // ── PERFIS ──
  console.log('>>> Criando perfis...');
  const perfis = [
    { nome: 'Administrador', descricao: 'Acesso total ao sistema' },
    { nome: 'Pesquisador', descricao: 'Acesso às rotinas e animais' },
    { nome: 'Veterinário', descricao: 'Acesso à parte clínica e ambulatorial' }
  ];
  ids.perfis = [];
  for (const p of perfis) {
    const r = await post('/Perfil', p);
    ids.perfis.push(r.id);
    console.log(`  Perfil "${p.nome}" id=${r.id}`);
  }

  // ── FUNCIONALIDADES E PERMISSÕES ──
  console.log('\n>>> Criando funcionalidades e permissões...');
  const funcionalidades = ['Animal', 'Alimentacao', 'BiometriaAnimal', 'RotinaAnimal', 'Consulta', 'Evolucao', 'Procedimento', 'Anexo', 'Medicacao', 'ProtocoloDesverminacao', 'AltaAmbulatorial', 'LiberacaoQuarentena', 'SolicitacaoExame'];
  ids.funcionalidades = [];
  for (const f of funcionalidades) {
    const r = await post('/Funcionalidade', { nome: f, descricao: `Módulo ${f}` });
    ids.funcionalidades.push(r.id);
    console.log(`  Funcionalidade "${f}" id=${r.id}`);
  }

  // Dá acesso total (Gerenciar = 4) ao Administrador (ids.perfis[0])
  for (const fId of ids.funcionalidades) {
    await post(`/Perfil/${ids.perfis[0]}/permissoes`, {
      funcionalidadeId: fId,
      nivelAcesso: 4 // Gerenciar
    });
  }
  console.log(`  Permissões totais concedidas ao perfil Administrador!`);

  // ── USUÁRIO ADMIN ──
  console.log('\n>>> Criando usuário admin baseado no login...');
  const adminRf = AUTH_USERNAME || 'admin';
  const userForm = new FormData();
  userForm.append('RF', adminRf);
  userForm.append('Nome', 'Administrador Local');
  userForm.append('Email', `${adminRf}@ucdb.br`);
  userForm.append('Status', 'true');
  userForm.append('PerfilId', String(ids.perfis[0]));
  try {
    const u = await postForm('/Usuario', userForm);
    console.log(`  Usuário admin criado (RF=${adminRf}) id=${u.id}`);
  } catch(e) {
    console.log(`  [Aviso] Falha ao criar usuário (já existe?): ${e.message}`);
  }


  // ── GRUPOS ──
  console.log('\n>>> Criando grupos...');
  const grupos = ['Roedores', 'Primatas', 'Répteis'];
  ids.grupos = [];
  for (const nome of grupos) {
    const r = await post('/Grupo', { nome });
    ids.grupos.push(r.id);
    console.log(`  Grupo "${nome}" id=${r.id}`);
  }

  // ── INSTALAÇÕES ──
  console.log('\n>>> Criando instalações...');
  const insts = ['Sala A - Matrizes', 'Sala B - Experimentação', 'Sala C - Quarentena', 'Biotério Satélite'];
  ids.instalacoes = [];
  for (const nome of insts) {
    const r = await post('/InstalacaoBioterio', { nome });
    ids.instalacoes.push(r.id);
    console.log(`  Instalação "${nome}" id=${r.id}`);
  }

  // ── LOCAIS DE ORIGEM ──
  console.log('\n>>> Criando locais de origem...');
  const locais = [
    { nome: 'Biotério Central UCDB', ativo: true },
    { nome: 'CEDEM - Unesp', ativo: true },
    { nome: 'Doador Externo', ativo: true },
    { nome: 'Outro Biotério', ativo: false },
  ];
  ids.locais = [];
  for (const l of locais) {
    const r = await post('/LocalOrigem', l);
    ids.locais.push(r.id);
    console.log(`  Local "${l.nome}" id=${r.id}`);
  }

  // ── TIPOS DE PROCEDIMENTO ──
  console.log('\n>>> Criando tipos de procedimento...');
  const tiposProcedimento = [
    { nome: 'Coleta de sangue', ativo: true },
    { curativo: 'Curativo', ativo: true },
    { nome: 'Cirurgia', ativo: true },
    { nome: 'Exame clínico', ativo: true },
  ];
  ids.tiposProcedimento = [];
  for (const t of tiposProcedimento) {
    const payload = t.curativo ? { nome: t.curativo, ativo: t.ativo } : t;
    const r = await post('/TipoProcedimento', payload);
    ids.tiposProcedimento.push(r.id);
    console.log(`  Tipo Procedimento "${payload.nome}" id=${r.id}`);
  }

  // ── MEDICAÇÕES ──
  console.log('\n>>> Criando medicações...');
  const medicacoes = [
    { principioAtivo: 'Dipirona', nomeComercial: 'Novalgina' },
    { principioAtivo: 'Meloxicam', nomeComercial: 'Metacam' },
    { principioAtivo: 'Ibuprofeno', nomeComercial: 'Advil' },
    { principioAtivo: 'Oxitetraciclina', nomeComercial: 'Terramicina' },
  ];
  ids.medicacoes = [];
  for (const m of medicacoes) {
    const r = await post('/Medicacao', m);
    ids.medicacoes.push(r.id);
    console.log(`  Medicação "${m.principioAtivo} - ${m.nomeComercial}" id=${r.id}`);
  }

  // ── ESPÉCIES ──
  console.log('\n>>> Criando espécies...');
  const especies = [
    { nome: 'Bothrops moojeni', nomePopular: 'Jararaca', grupoId: ids.grupos[2] },
    { nome: 'Crotalus durissus', nomePopular: 'Cascavel', grupoId: ids.grupos[2] },
    { nome: 'Bothrops alternatus', nomePopular: 'Urutu Cruzeiro', grupoId: ids.grupos[2] },
    { nome: 'Bothrops mattogrossensis', nomePopular: 'Boca de Sapo', grupoId: ids.grupos[2] },
    { nome: 'Epicrates cenchria', nomePopular: 'Jibóia-arco-íris', grupoId: ids.grupos[2] },
  ];
  ids.especies = [];
  for (const e of especies) {
    const r = await post('/Especie', e);
    ids.especies.push(r.id);
    console.log(`  Espécie "${e.nomePopular}" id=${r.id}`);
  }

  // ── ROTINAS ──
  console.log('\n>>> Criando rotinas...');
  const rotinas = [
    { especieId: ids.especies[0], tipoRotina: 1, protocoloDieta: 'Ração padrão + 10g fruta 2x/sem', fases: [{ faseDeVida: 3, tipoFrequencia: 1 }] },
    { especieId: ids.especies[0], tipoRotina: 2, fases: [{ faseDeVida: 3, tipoFrequencia: 2, frequencia: 7 }] },
    { especieId: ids.especies[1], tipoRotina: 1, protocoloDieta: 'Ração ad libitum', fases: [{ faseDeVida: 3, tipoFrequencia: 1 }] },
    { especieId: ids.especies[1], tipoRotina: 2, fases: [{ faseDeVida: 3, tipoFrequencia: 2, frequencia: 7 }] },
    { especieId: ids.especies[2], tipoRotina: 1, protocoloDieta: 'Frutas + insetos', fases: [{ faseDeVida: 3, tipoFrequencia: 1 }] },
    { especieId: ids.especies[2], tipoRotina: 2, fases: [{ faseDeVida: 3, tipoFrequencia: 3, diaSemanaProgramado: ["Segunda", "Quarta", "Sexta"] }] },
    { especieId: ids.especies[3], tipoRotina: 1, protocoloDieta: 'Frutas + ração primatas', fases: [{ faseDeVida: 3, tipoFrequencia: 1 }] },
    { especieId: ids.especies[3], tipoRotina: 2, fases: [{ faseDeVida: 3, tipoFrequencia: 2, frequencia: 15 }] },
    { especieId: ids.especies[4], tipoRotina: 1, protocoloDieta: 'Vegetais folhosos + frutas', fases: [{ faseDeVida: 3, tipoFrequencia: 1 }] },
  ];
  ids.rotinas = [];
  for (const r of rotinas) {
    const resp = await post('/RotinaAnimal', r);
    if (resp.rotinas && Array.isArray(resp.rotinas)) {
      for (const rotina of resp.rotinas) {
        ids.rotinas.push(rotina.id);
      }
      console.log(`  Rotina tipo=${r.tipoRotina} esp=${r.especieId} ids=${resp.rotinas.map(x => x.id).join(',')}`);
    } else if (resp.id) {
      ids.rotinas.push(resp.id);
      console.log(`  Rotina tipo=${r.tipoRotina} esp=${r.especieId} id=${resp.id}`);
    }
  }

  // ── ANIMAIS ──
  console.log('\n>>> Criando animais...');
  const animais = [
    { numeroRegistro: 'RAT-001', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 180*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[0], situacaoAnimal: 1, localOrigemId: ids.locais[0], municipio: 'Campo Grande', numeroChip: 'CHIP-001', peso: 285, comprimento: 22.5, comprimentoCauda: 18 },
    { numeroRegistro: 'RAT-002', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 2, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 120*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[0], situacaoAnimal: 1, localOrigemId: ids.locais[0], municipio: 'Campo Grande', peso: 220, comprimento: 20, comprimentoCauda: 16 },
    { numeroRegistro: 'CAM-001', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 1, faseDeVida: 2, dataDeEntrada: new Date(Date.now() - 60*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 1, localOrigemId: ids.locais[1], municipio: 'Botucatu', numeroChip: 'CHIP-002', peso: 35, comprimento: 8, comprimentoCauda: 7 },
    { numeroRegistro: 'CAM-002', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 2, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 90*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 1, localOrigemId: ids.locais[1], municipio: 'Botucatu', peso: 32, comprimento: 8.5 },
    { numeroRegistro: 'SAG-001', nomePopular: 'Sagui-de-tufo-preto', especieId: ids.especies[2], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 365*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Campo Grande', peso: 450, comprimento: 25, comprimentoCauda: 30 },
    { numeroRegistro: 'PRE-001', nomePopular: 'Macaco-prego', especieId: ids.especies[3], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 730*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[3], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Campo Grande', peso: 3200, comprimento: 45, comprimentoCauda: 48 },
    { numeroRegistro: 'RAT-003', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 2, faseDeVida: 1, dataDeEntrada: new Date(Date.now() - 30*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[0], situacaoAnimal: 1, localOrigemId: ids.locais[0], municipio: 'Campo Grande', peso: 120, comprimento: 15, comprimentoCauda: 12 },
    { numeroRegistro: 'RAT-004', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 240*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 2, localOrigemId: ids.locais[0], municipio: 'Dourados', peso: 310, comprimento: 24, comprimentoCauda: 19 },
    { numeroRegistro: 'CAM-003', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 150*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 1, localOrigemId: ids.locais[1], municipio: 'Botucatu', peso: 38, comprimento: 9, comprimentoCauda: 7.5 },
    { numeroRegistro: 'CAM-004', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 2, faseDeVida: 1, dataDeEntrada: new Date(Date.now() - 15*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 1, localOrigemId: ids.locais[1], municipio: 'Marília', peso: 18, comprimento: 6, comprimentoCauda: 5 },
    { numeroRegistro: 'IGU-001', nomePopular: 'Iguana-verde', especieId: ids.especies[4], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 400*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Campo Grande', peso: 1800, comprimento: 65, comprimentoCauda: 80 },
    { numeroRegistro: 'SAG-002', nomePopular: 'Sagui-de-tufo-preto', especieId: ids.especies[2], genero: 2, faseDeVida: 2, dataDeEntrada: new Date(Date.now() - 200*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 3, localOrigemId: ids.locais[3], municipio: 'Bodoquena', peso: 380, comprimento: 23, comprimentoCauda: 28 },
    { numeroRegistro: 'PRE-002', nomePopular: 'Macaco-prego', especieId: ids.especies[3], genero: 2, faseDeVida: 2, dataDeEntrada: new Date(Date.now() - 500*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[3], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Aquidauana', peso: 2800, comprimento: 42, comprimentoCauda: 45 },
    { numeroRegistro: 'RAT-005', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 1, faseDeVida: 2, dataDeEntrada: new Date(Date.now() - 45*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[0], situacaoAnimal: 1, localOrigemId: ids.locais[0], municipio: 'Tupã', peso: 190, comprimento: 19, comprimentoCauda: 15 },
    { numeroRegistro: 'RAT-006', nomePopular: 'Rato Wistar', especieId: ids.especies[0], genero: 2, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 300*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 1, localOrigemId: ids.locais[1], municipio: 'Presidente Prudente', peso: 260, comprimento: 23, comprimentoCauda: 17 },
    { numeroRegistro: 'CAM-005', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 100*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[0], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Bauru', peso: 34, comprimento: 8.5, comprimentoCauda: 7 },
    { numeroRegistro: 'CAM-006', nomePopular: 'Camundongo Swiss', especieId: ids.especies[1], genero: 2, faseDeVida: 2, dataDeEntrada: new Date(Date.now() - 75*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[1], situacaoAnimal: 2, localOrigemId: ids.locais[1], municipio: 'Lins', peso: 28, comprimento: 7.5, comprimentoCauda: 6 },
    { numeroRegistro: 'IGU-002', nomePopular: 'Iguana-verde', especieId: ids.especies[4], genero: 2, faseDeVida: 1, dataDeEntrada: new Date(Date.now() - 60*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 1, localOrigemId: ids.locais[3], municipio: 'Miranda', peso: 450, comprimento: 35, comprimentoCauda: 42 },
    { numeroRegistro: 'SAG-003', nomePopular: 'Sagui-de-tufo-preto', especieId: ids.especies[2], genero: 1, faseDeVida: 3, dataDeEntrada: new Date(Date.now() - 550*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[3], situacaoAnimal: 1, localOrigemId: ids.locais[0], municipio: 'Pontapora', peso: 500, comprimento: 26, comprimentoCauda: 32 },
    { numeroRegistro: 'PRE-003', nomePopular: 'Macaco-prego', especieId: ids.especies[3], genero: 1, faseDeVida: 1, dataDeEntrada: new Date(Date.now() - 90*86400000).toISOString(), instalacaoBioterioId: ids.instalacoes[2], situacaoAnimal: 1, localOrigemId: ids.locais[2], municipio: 'Rio Brilhante', peso: 1500, comprimento: 35, comprimentoCauda: 38 },
  ];
  ids.animais = [];
  for (const a of animais) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(a)) {
      if (v !== undefined) fd.append(k, String(v));
    }
    const r = await postForm('/Animal', fd);
    ids.animais.push(r.id);
    console.log(`  Animal "${a.numeroRegistro}" id=${r.id}`);
  }
  // ── CONSULTAS ──
  console.log('\n>>> Criando consultas...');
  const consultas = [
    {
      animalId: ids.animais[0],
      anamnese: 'Animal com leve perda de peso e apatia.',
      exameFisico: 'Mucosas normocoradas, ausculta limpa, hidratado.',
      suspeitaDiagnostica: 'Estresse leve pós-manejo',
      instalacaoBioterioId: ids.instalacoes[0],
      dataHoraConsulta: now()
    },
    {
      animalId: ids.animais[1],
      anamnese: 'Avaliação pós-período reprodutivo.',
      exameFisico: 'Escore corporal 3/5, ativo e responsivo.',
      suspeitaDiagnostica: 'Sem alterações dignas de nota',
      instalacaoBioterioId: ids.instalacoes[0],
      dataHoraConsulta: now()
    }
  ];
  for (const c of consultas) {
    const r = await post('/Consulta', c);
    console.log(`  Consulta id=${r.id} animal=${c.animalId}`);
  }

  // ── ALIMENTAÇÕES ──
  console.log('\n>>> Criando alimentações...');
  const alimentacoes = [
    { animalId: ids.animais[0], pesoRecomendado: 30, porcentagemPesoRecomendado: 10, observacoes: 'Alimentação matinal', refeicoes: [
      { tipoRefeicao: 1, pesoRefeicao: 20, situacaoRefeicao: 1 },
      { tipoRefeicao: 2, pesoRefeicao: 10, situacaoRefeicao: 1 },
    ]},
    { animalId: ids.animais[0], pesoRecomendado: 25, porcentagemPesoRecomendado: 8, refeicoes: [
      { tipoRefeicao: 1, pesoRefeicao: 25, situacaoRefeicao: 2 },
    ]},
    { animalId: ids.animais[1], pesoRecomendado: 25, porcentagemPesoRecomendado: 10, refeicoes: [
      { tipoRefeicao: 6, pesoRefeicao: 15, situacaoRefeicao: 1 },
      { tipoRefeicao: 3, pesoRefeicao: 8, situacaoRefeicao: 1 },
      { tipoRefeicao: 4, pesoRefeicao: 5, situacaoRefeicao: 3 },
    ]},
    { animalId: ids.animais[2], pesoRecomendado: 5, porcentagemPesoRecomendado: 15, refeicoes: [
      { tipoRefeicao: 6, pesoRefeicao: 3, situacaoRefeicao: 1 },
      { tipoRefeicao: 5, pesoRefeicao: 2, situacaoRefeicao: 0 },
    ]},
    { animalId: ids.animais[4], pesoRecomendado: 60, porcentagemPesoRecomendado: 12, refeicoes: [
      { tipoRefeicao: 11, pesoRefeicao: 50, situacaoRefeicao: 1 },
    ]},
  ];
  let alIdx = 0;
  for (const al of alimentacoes) {
    const payload = {
      animalId: al.animalId,
      dataAlimentacao: now(),
      pesoRecomendado: al.pesoRecomendado,
      porcentagemPesoRecomendado: al.porcentagemPesoRecomendado,
      observacoes: al.observacoes,
      refeicoes: al.refeicoes,
    };
    const r = await post('/Alimentacao', payload);
    console.log(`  Alimentação #${++alIdx} animal=${al.animalId} id=${r.id}`);
  }

  // ── TEMPLATES DE DOCUMENTOS ──
  console.log('\n>>> Criando templates de documentos...');
  
  // 1. Cabeçalho Padrão
  const headerLayout = JSON.stringify({
    esquerda: { tipo: 'texto', conteudo: 'UNIVERSIDADE CATÓLICA DOM BOSCO\nSIGBio - Gestão de Biotério' },
    meio: { tipo: 'texto', conteudo: 'HOSPITAL VETERINÁRIO / BIOTÉRIO CENTRAL\nDocumento Oficial' },
    direita: { tipo: 'texto', conteudo: 'UCDB\nCampo Grande - MS' }
  });
  const header = await post('/ModelosDocumento', {
    nome: 'Cabeçalho Institucional UCDB',
    tipoSecao: 2, // Header
    tipoDocumento: 0, // Geral
    configuracaoLayoutJson: headerLayout,
    ativo: true
  });
  console.log(`  Cabeçalho "${header.nome || 'Institucional'}" id=${header.id}`);

  // 2. Rodapé Padrão
  const footerLayout = JSON.stringify({
    esquerda: { tipo: 'texto', conteudo: 'Av. Tamandaré, 6000 - Jd. Seminário' },
    meio: { tipo: 'texto', conteudo: 'Sistema Integrado de Gestão de Biotério' },
    direita: { tipo: 'texto', conteudo: 'Página 1 de 1' }
  });
  const footer = await post('/ModelosDocumento', {
    nome: 'Rodapé Institucional UCDB',
    tipoSecao: 3, // Footer
    tipoDocumento: 0, // Geral
    configuracaoLayoutJson: footerLayout,
    ativo: true
  });
  console.log(`  Rodapé "${footer.nome || 'Institucional'}" id=${footer.id}`);

  // 3. Template Body - Alta Ambulatorial
  const altaTemplateConteudo = `#Documento de Alta Ambulatorial
Data: [FUN_DATA_AGORA]
Responsável: [FUN_NOME_RESPOSAVEL]

Comunica-se que o animal atendido no Ambulatório Veterinário recebeu alta clínica após acompanhamento médico-veterinário, apresentando evolução satisfatória durante o período de observação e tratamento.

• Data de entrada no ambulatório: [INPUT_DATA_ENTRADA_AMBULATORIO]
• Data da alta clínica: [INPUT_DATA_CLINICA]

Durante o acompanhamento clínico, o animal apresentou resposta satisfatória com o protocolo terapêutico administrado com melhora do quadro clínico e estabilização das alterações anteriormente observadas.

Procedimentos/medicações realizadas durante o atendimento:
[INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO]


Observações clínicas na alta:
[INPUT_OBS_CLINICAS_ALTA]

Diante da avaliação clínica final, o animal encontra-se apto para retorno à sala de origem.`;

  const altaTemplate = await post('/ModelosDocumento', {
    nome: 'Documento de Alta Ambulatorial',
    tipoSecao: 1, // Body
    tipoDocumento: 2, // AltaAmbulatorial
    conteudo: altaTemplateConteudo,
    headerTemplateId: header.id,
    footerTemplateId: footer.id,
    ativo: true
  });
  console.log(`  Template Body "${altaTemplate.nome || 'Alta Ambulatorial'}" id=${altaTemplate.id}`);

  // 4. Template Body - Solicitação de Exame
  const exameTemplateConteudo = `#Solicitação de Exame
Data: [FUN_DATA_AGORA]
Responsável: [FUN_NOME_RESPONSAVEL]

Solicita-se a realização de exames complementares do animal descrito abaixo:
• Espécie: [FUN_ESPECIE]
• Identificação do animal: [FUN_NUMERO_REGISTRO] - [FUN_NOME_POPULAR]
• Origem: [FUN_LOCAL_ORIGEM]

Sinais clínicos observados:
[INPUT_SINAIS_CLINICOS]

Suspeita clínica:
[INPUT_SUSPEITA_CLINICA]

Exames solicitados:
☐ Hemograma completo
☐ Ultrassonografia
☐ Radiografia (Raio-X)
☐ Outros: [INPUT_OUTROS_EXAME]

Região anatômica de interesse (Raio X e ultrassom):
[INPUT_REGIAO_ANATOMICA]

Observações adicionais:
[INPUT_OBSERVACOES_ADICIONAIS]`;

  const exameTemplate = await post('/ModelosDocumento', {
    nome: 'Solicitação de Exame Clínico',
    tipoSecao: 1, // Body
    tipoDocumento: 3, // SolicitacaoExame
    conteudo: exameTemplateConteudo,
    headerTemplateId: header.id,
    footerTemplateId: footer.id,
    ativo: true
  });
  // 5. Template Body - Liberação da Quarentena
  const quarentenaTemplateConteudo = `#Liberação da Quarentena Sanitária
Data: [FUN_DATA_AGORA]
Responsável: [FUN_NOME_COMPLETO_USUARIO]

Comunica-se que o animal mantido em quarentena sanitária concluiu o período de observação estabelecido pela instituição, apresentando evolução clínica satisfatória durante todo o acompanhamento.

• Espécie: [FUN_Especie]
• Identificação do animal: [FUN_NumeroRegistro] - [FUN_NomePopular]
• Origem: [FUN_LocalOrigem]
• Data de entrada na quarentena: [INPUT_DATA_ENTRADA_QUARENTENA]
• Data de liberação/saída: [INPUT_DATA_SAIDA_QUARENTENA]

Ao longo da quarentena, o animal permaneceu sob monitoramento contínuo, mantendo comportamento compatível com a espécie, bom estado geral e ausência de alterações clínicas que indicassem enfermidades infectocontagiosas ou parasitárias.

Informa-se ainda que o protocolo sanitário e de desverminação foi realizado conforme as recomendações sanitárias adotadas pelo setor, com administração adequada do antiparasitário e acompanhamento posterior da resposta clínica do animal.

Diante das condições observadas e após avaliação final, o animal encontra-se apto para liberação da quarentena e encaminhamento ao destino: [INPUT_INSTALACAO_DESTINO].

Observações:
[INPUT_OBSERVACOES_QUARENTENA]`;


  // 6. Template Body - Transporte de Fauna (IMASUL / Evento Externo)
  const imasulTemplateConteudo = `<div style="font-family: Arial, sans-serif; font-size: 11px; border: 2px solid #000; padding: 0; margin: 0 auto; max-width: 800px; color: #000;">
  <!-- 1. REQUERENTE -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px; background-color: #fff;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; text-transform: uppercase;">1. REQUERENTE (Pessoa física ou Instituição ou Empresa):</div>
    <div style="margin-bottom: 2px;"><strong>Nome / Razão Social:</strong> [REQUERENTE_NOME]</div>
    <div style="margin-bottom: 2px;"><strong>CNPJ/CPF:</strong> [REQUERENTE_CNPJ_CPF]</div>
    <div style="margin-bottom: 2px;"><strong>Endereço do requerente:</strong> [REQUERENTE_ENDERECO]</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span><strong>Bairro:</strong> [REQUERENTE_BAIRRO]</span>
      <span><strong>Município:</strong> [REQUERENTE_MUNICIPIO_UF]</span>
      <span><strong>CEP:</strong> [REQUERENTE_CEP]</span>
    </div>
    <div style="display: flex; gap: 30px;">
      <span><strong>Telefone:</strong> [REQUERENTE_TELEFONE]</span>
      <span><strong>CTF nº:</strong> [REQUERENTE_CTF]</span>
    </div>
  </div>

  <!-- 2. DESTINATÁRIO -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; text-transform: uppercase;">2. DESTINATÁRIO (Pessoa física ou Instituição ou Empresa):</div>
    <div style="margin-bottom: 4px; line-height: 1.4; font-size: 10.5px;">[DESTINATARIO_OPCOES_CHECKBOX]</div>
    <div style="margin-bottom: 2px;"><strong>Nome / Razão Social:</strong> [DESTINATARIO_NOME]</div>
    <div style="margin-bottom: 2px;"><strong>CNPJ/CPF:</strong> [DESTINATARIO_CNPJ_CPF]</div>
    <div style="margin-bottom: 2px;"><strong>Endereço do requerente:</strong> [DESTINATARIO_ENDERECO]</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
      <span><strong>Bairro:</strong> [DESTINATARIO_BAIRRO]</span>
      <span><strong>Município:</strong> [DESTINATARIO_MUNICIPIO]</span>
      <span><strong>CEP:</strong> [DESTINATARIO_CEP]</span>
    </div>
    <div style="display: flex; gap: 30px;">
      <span><strong>Telefone:</strong> [DESTINATARIO_TELEFONE]</span>
      <span><strong>CTF nº:</strong> [DESTINATARIO_CTF]</span>
    </div>
  </div>

  <!-- 3. OBJETO -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; text-transform: uppercase;">3. OBJETO</div>
    [OBJETO_OPCOES_CHECKBOX]
  </div>

  <!-- 4. DESCRIÇÃO DO MATERIAL -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px; min-height: 80px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; text-transform: uppercase;">4. DESCRIÇÃO DO MATERIAL (tipo, sexo, nome científico, quantidade, marcação, etc.)</div>
    [LISTA_ANIMAIS_IMASUL]
  </div>

  <!-- 5. MEIO DE TRANSPORTE E DADOS DO TRANSPORTADOR -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; text-transform: uppercase;">5. MEIO DE TRANSPORTE E DADOS DO TRANSPORTADOR:</div>
    [TRANSPORTE_OPCOES_CHECKBOX]
  </div>

  <!-- 6. RODOVIAS UTILIZADAS -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px; text-transform: uppercase;">6. RODOVIAS UTILIZADAS (Rota): <span style="font-weight: normal; font-size: 11px;">[TRANSPORTE_ROTA]</span></div>
  </div>

  <!-- 7. DATA DO TRANSPORTE -->
  <div style="border-bottom: 2px solid #000; padding: 6px 10px;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px; text-transform: uppercase;">7. DATA DO TRANSPORTE A SER EFETUADO: <span style="font-weight: normal; font-size: 11px;">[TRANSPORTE_DATA]</span></div>
  </div>

  <!-- DECLARAÇÃO E ASSINATURA -->
  <div style="padding: 8px 10px 4px 10px; text-align: center;">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">DECLARO, SOB AS PENAS DA LEI, A VERACIDADE DAS INFORMAÇÕES PRESTADAS</div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; margin-top: 25px;">
      <div style="text-align: left; font-size: 11px;">
        <strong>Data:</strong><br/>
        [DOCUMENTO_DATA_DECLARACAO]
      </div>
      <div style="text-align: center; width: 280px;">
        <div style="border-top: 1px solid #000; padding-top: 4px; font-weight: bold; font-size: 11px;">Requerente</div>
      </div>
    </div>
  </div>
</div>`;

  const imasulTemplate = await post('/ModelosDocumento', {
    nome: 'Formulário Oficial de Transporte de Fauna (IMASUL)',
    tipoSecao: 1, // Body
    tipoDocumento: 5, // DocumentoDeEventoExterno
    conteudo: imasulTemplateConteudo,
    headerTemplateId: null,
    footerTemplateId: null,
    ativo: true
  });
  console.log(`  Template Body "${imasulTemplate.nome}" id=${imasulTemplate.id}`);

  const quarentenaTemplate = await post('/ModelosDocumento', {
    nome: 'Liberação da Quarentena Sanitária',
    tipoSecao: 1, // Body
    tipoDocumento: 1, // LiberacaoQuarentena
    conteudo: quarentenaTemplateConteudo,
    headerTemplateId: header.id,
    footerTemplateId: footer.id,
    ativo: true
  });
  console.log(`  Template Body "${quarentenaTemplate.nome || 'Liberação da Quarentena'}" id=${quarentenaTemplate.id}`);

  // ----------------------------------------------------
  // Localizacoes e Movimentacoes
  // ----------------------------------------------------
  console.log('\n[Localizacoes] Criando localizacoes hierarquicas...');
  const ucdb = await post('/Localizacao', {
    nome: 'UCDB',
    ambiente: 1
  });

  const bioterio = await post('/Localizacao', {
    nome: 'Biotério',
    ambiente: 1,
    localizacaoPaiId: ucdb.id
  });

  const salaExoticas = await post('/Localizacao', {
    nome: 'Sala de Exóticas',
    ambiente: 1,
    localizacaoPaiId: bioterio.id
  });

  const salaProdutoresVenenos = await post('/Localizacao', {
    nome: 'Sala de Produtores de Venenos',
    ambiente: 1,
    localizacaoPaiId: bioterio.id
  });

  const shoppingBosque = await post('/Localizacao', {
    nome: 'Shopping Bosque dos Ipes',
    ambiente: 2
  });

  console.log(`  Localizacao: ${ucdb.localizacao.nome} id=${ucdb.id}`);
  console.log(`  Localizacao: ${bioterio.localizacao.nome} id=${bioterio.id}`);
  console.log(`  Localizacao: ${salaExoticas.localizacao.nome} id=${salaExoticas.id}`);
  console.log(`  Localizacao: ${salaProdutoresVenenos.localizacao.nome} id=${salaProdutoresVenenos.id}`);
  console.log(`  Localizacao: ${shoppingBosque.localizacao.nome} id=${shoppingBosque.id}`);

  if (ids.animais && ids.animais.length > 0) {
    console.log('\n[LocalizacaoAnimais & Movimentacao] Vinculando animais às localizações...');
    for (let i = 0; i < ids.animais.length; i++) {
      const animalId = ids.animais[i];
      const locId = (i % 2 === 0) ? salaProdutoresVenenos.id : salaExoticas.id;
      try {
        await post('/AnimalLocalizacao', {
          animalId: animalId,
          localizacaoId: locId
        });
        await post('/MovimentacaoAnimal', {
          animalId: animalId,
          localizacaoId: locId,
          tipoMovimentacao: 1
        });
      } catch (err) {
        // Se já vinculado na criação
      }
    }
  }

  console.log('\n[Eventos] Agendando eventos interno e externo...');
  const eventoInterno = await post('/Evento', {
    nome: 'Exposição Científica Interna no Solário',
    tipoEvento: 1, // Interno
        dataHoraInicio: new Date(Date.now() + 86400000 * 1).toISOString(),
    dataHoraPrevisaoRetorno: new Date(Date.now() + 86400000 * 2).toISOString(),
    responsavel: 'Prof. Pesquisador UCDB',
    animalIds: ids.animais ? ids.animais.slice(0, 1) : []
  });
  console.log(`  Evento Interno agendado: id=${eventoInterno.id}`);

  const eventoExterno = await post('/Evento', {
    nome: 'Feira de Exposição Externa Shopping Bosque',
    tipoEvento: 2, // Externo
        dataHoraInicio: new Date(Date.now() + 86400000 * 2).toISOString(),
    dataHoraPrevisaoRetorno: new Date(Date.now() + 86400000 * 4).toISOString(),
    responsavel: 'Equipe de Manejo UCDB',
    animalIds: ids.animais ? ids.animais.slice(0, 2) : []
  });
  console.log(`  Evento Externo agendado: id=${eventoExterno.id}`);

  console.log('  [DocumentoEvento] Registrando documento para evento externo...');
  const docEvento = await post('/DocumentoEvento', {
    eventoId: eventoExterno.id,
    modeloDocumentoId: imasulTemplate.id,
    conteudoDadosJson: JSON.stringify({
      requerente: {
        nomeRazaoSocial: 'Universidade Católica Dom Bosco',
        cnpjCpf: '03.226.149/0015-87',
        endereco: 'Avenida Tamandaré nº 6000',
        bairro: 'Jardim Seminário',
        municipio: 'Campo Grande/MS',
        cep: '79002-220',
        telefone: '(67) 3312-3688',
        ctf: ''
      },
      destinatario: {
        tipo: 'Outros',
        outrosEspecificar: 'Instrução de Ofidismo',
        nomeRazaoSocial: 'Base Aérea de Campo Grande - BACG',
        cpfCnpj: '00.394.429/0191-20',
        endereco: 'Avenida Duque de Caxias',
        bairro: 'Santo Antônio',
        municipio: 'Campo Grande /MS',
        cep: '79101900',
        telefone: '(67) 3368-3123',
        ctf: ''
      },
      objeto: {
        tipo: 'Outros (especificar)',
        especificar: 'Instrução de ofidismo'
      },
      transporte: {
        meio: 'Terrestre - Rodoviário',
        condutorDados: 'Nome do condutor/transportadora: Luiz Humberto Guimarães Riquelme Junior CPF 033.728.421-03 / Henrique Emanuel Hatzis Gomes CPF 431.428.668-76 / Brenda Silva Campos Martins CPF 138.758.397-22 / João Batista Camilo de Araújo CPF 401.996.358-46. / Thiago Guazina Morinigo CPF: 062.428.381-09\nVeículo (marca, tipo, ano e placa): KWID BRANCO PLACA SLX8G41 ANO 2023; SIENA BRANCO PLACA QAX7103 ANO 2020; L-200 AZUL PLACA NOO4161 ANO 2014; L200 TRITON Placa: BEF-4I50 BRANCA Ano: 2023; Van Master Placa: DWO-6I12 Ano: 2024 Branca',
        rota: 'Av. Tamandaré/ Av. Duque de Caxias.',
        data: '22/10/2026 – 22/10/2026'
      },
      animais: [
        { especieNome: 'Bothrops moojeni', sexo: 'Fêmea', chip: '939000001413274' },
        { especieNome: 'Bothrops alternatus', sexo: 'Macho', chip: '963008000486949' },
        { especieNome: 'Bothrops mattogrossensis', sexo: 'Fêmea', chip: '900164000829967' },
        { especieNome: 'Crotalus durissus', sexo: 'Fêmea', chip: '939000001412767' },
        { especieNome: 'Boa constrictor', sexo: 'Fêmea', chip: '939000001388109' }
      ],
      dataDeclaracao: '30/09/2026'
    })
  });
  console.log(`  DocumentoEvento gerado: id=${docEvento.id}`);
  console.log('\n✔ Carga de dados concluída com sucesso!');
  console.log(`  ${grupos.length} grupos`);
  console.log(`  ${insts.length} instalações`);
  console.log(`  ${locais.length} locais de origem`);
  console.log(`  ${especies.length} espécies`);
  console.log(`  ${rotinas.length} rotinas`);
  console.log(`  ${animais.length} animais`);
  console.log(`  ${alimentacoes.length} alimentações`);
  console.log(`  6 templates de documentos`);
}

main().catch(err => {
  console.error('\n✘', err.message);
  process.exit(1);
});

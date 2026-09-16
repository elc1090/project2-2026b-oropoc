import { PontoColeta, PontoColetaInput } from './types';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/pontos`;

export async function buscarPontos(): Promise<PontoColeta[]> {
  const resp = await fetch(API_URL);
  return resp.json();
}

export async function criarPonto(dados: PontoColetaInput): Promise<PontoColeta> {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return resp.json();
}

export async function atualizarPonto(
  id: number,
  dados: PontoColetaInput
): Promise<PontoColeta> {
  const resp = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return resp.json();
}

export async function excluirPonto(id: number): Promise<{ mensagem: string }> {
  const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return resp.json();
}

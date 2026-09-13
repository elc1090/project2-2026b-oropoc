// Tipos usados em toda a API de pontos de coleta

export interface PontoColeta {
  id: number;
  nome: string;
  descricao: string | null;
  tipo_material: string | null;
  latitude: number;
  longitude: number;
  endereco: string | null;
  criado_em: string;
  atualizado_em: string;
}

// Dados recebidos ao criar/editar um ponto (sem os campos gerados pelo banco)
export interface PontoColetaInput {
  nome: string;
  descricao?: string;
  tipo_material?: string;
  latitude: number;
  longitude: number;
  endereco?: string;
}

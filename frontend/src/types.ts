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

export interface PontoColetaInput {
  nome: string;
  descricao?: string;
  tipo_material?: string;
  latitude: number;
  longitude: number;
  endereco?: string;
}

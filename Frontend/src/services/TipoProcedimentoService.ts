import api, { cachedGet } from './api';

export interface TipoProcedimento {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface TipoProcedimentoLookupVm {
  id: number;
  nome: string;
}

export interface CreateTipoProcedimentoPayload {
  nome: string;
}

export interface UpdateTipoProcedimentoPayload {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface CreateTipoProcedimentoResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
  tipoProcedimento: TipoProcedimento;
  id: number;
}

export const tipoProcedimentoService = {
  async getLookup(): Promise<TipoProcedimentoLookupVm[]> {
    return cachedGet<TipoProcedimentoLookupVm[]>('/TipoProcedimento/lookup');
  },

  async getAll(): Promise<TipoProcedimento[]> {
    const response = await api.get<TipoProcedimento[]>('/TipoProcedimento');
    return response.data;
  },

  async getById(id: number): Promise<TipoProcedimento> {
    const response = await api.get<TipoProcedimento>(`/TipoProcedimento/${id}`);
    return response.data;
  },

  async create(data: CreateTipoProcedimentoPayload): Promise<TipoProcedimento> {
    const response = await api.post<CreateTipoProcedimentoResponse>('/TipoProcedimento', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao cadastrar tipo de procedimento');
    }
    return response.data.tipoProcedimento;
  },

  async update(data: UpdateTipoProcedimentoPayload): Promise<void> {
    await api.put('/TipoProcedimento', data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/TipoProcedimento/${id}`);
  },
};

export default tipoProcedimentoService;

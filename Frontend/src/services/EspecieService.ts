import api, { cachedGet } from './api';

export interface Especie {
  id: number;
  nome: string;
  nomePopular: string;
  grupoNome: string;
}

export interface EspecieLookupVm {
  id: number;
  nome: string;
  nomePopular: string;
}

export interface EspecieDetail {
  id: number;
  nome: string;
  nomePopular: string;
  grupoId: number;
}

export interface CreateEspeciePayload {
  nome: string;
  nomePopular: string;
  grupoId: number;
}

export interface CreateEspecieResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
  specie: Especie;
  id: number;
}

export interface PaginatedEspecieResponse {
    items: Especie[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const especieService = {
  async getLookup(): Promise<EspecieLookupVm[]> {
    return cachedGet<EspecieLookupVm[]>('/Especie/lookup');
  },

  async getAll(params?: { search?: string; page?: number; pageSize?: number }): Promise<PaginatedEspecieResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    const qs = queryParams.toString();
    
    const response = await api.get<PaginatedEspecieResponse>(`/Especie${qs ? '?' + qs : ''}`);
    return response.data;
  },

  async getById(id: number): Promise<EspecieDetail> {
    const response = await api.get<EspecieDetail>(`/Especie/${id}`);
    return response.data;
  },

  async create(data: CreateEspeciePayload): Promise<Especie> {
    const response = await api.post<CreateEspecieResponse>('/Especie', data);
    if (!response.data.success) {
      const errorMsg = response.data.validationErrors?.[0] || response.data.message || 'Erro ao cadastrar espécie';
      throw new Error(errorMsg);
    }
    return response.data.specie;
  },

  async update(id: number, data: CreateEspeciePayload): Promise<void> {
    await api.put(`/Especie`, { ...data, id });
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Especie/${id}`);
  },
};

export default especieService;
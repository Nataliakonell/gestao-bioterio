import api, { cachedGet } from './api';

export interface Grupo {
  id: number;
  nome: string;
}

export interface GrupoLookupVm {
  id: number;
  nome: string;
}

export interface CreateEspeciePayload {
  nome: string;
}

export interface PaginatedGrupoResponse {
    items: Grupo[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const grupoService = {
  async getLookup(): Promise<GrupoLookupVm[]> {
    return cachedGet<GrupoLookupVm[]>('/Grupo/lookup');
  },

  async getAll(params?: { search?: string; page?: number; pageSize?: number }): Promise<PaginatedGrupoResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    const qs = queryParams.toString();
    
    const response = await api.get<PaginatedGrupoResponse>(`/Grupo${qs ? '?' + qs : ''}`);
    return response.data;
  },

  async getById(id: number): Promise<Grupo> {
    const response = await api.get<Grupo>(`/Grupo/${id}`);
    return response.data;
  },

  async create(data: CreateEspeciePayload): Promise<Grupo> {
    const response = await api.post<Grupo>('/Grupo', data);
    return response.data;
  },

  async update(id: number, data: CreateEspeciePayload): Promise<void> {
    await api.put(`/Grupo/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Grupo/${id}`);
  },
};

export default grupoService;
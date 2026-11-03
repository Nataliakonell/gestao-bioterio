import api, { cachedGet } from './api';

export interface LocalOrigem {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface LocalOrigemLookupVm {
  id: number;
  nome: string;
}

export interface CreateLocalOrigemPayload {
  nome: string;
}

export interface UpdateLocalOrigemPayload {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface CreateLocalOrigemResponse {
  success: boolean;
  message: string;
  validationErrors?: string[];
  localOrigem: LocalOrigem;
  id: number;
}

export interface PaginatedLocalOrigemResponse {
  items: LocalOrigem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const localOrigemService = {
  async getLookup(): Promise<LocalOrigemLookupVm[]> {
    return cachedGet<LocalOrigemLookupVm[]>('/LocalOrigem/lookup');
  },

  async getAll(params?: { search?: string; page?: number; pageSize?: number }): Promise<PaginatedLocalOrigemResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    const qs = queryParams.toString();
    
    const response = await api.get<PaginatedLocalOrigemResponse>(`/LocalOrigem/all${qs ? '?' + qs : ''}`);
    return response.data;
  },

  async getById(id: number): Promise<LocalOrigem> {
    const response = await api.get<LocalOrigem>(`/LocalOrigem/${id}`);
    return response.data;
  },

  async create(data: CreateLocalOrigemPayload): Promise<LocalOrigem> {
    const response = await api.post<CreateLocalOrigemResponse>('/LocalOrigem', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erro ao cadastrar local de origem');
    }
    return response.data.localOrigem;
  },

  async update(data: UpdateLocalOrigemPayload): Promise<void> {
    await api.put('/LocalOrigem', data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/LocalOrigem/${id}`);
  },
};

export default localOrigemService;

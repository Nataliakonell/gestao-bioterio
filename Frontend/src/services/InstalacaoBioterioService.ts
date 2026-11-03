import api from './api';

export interface InstalacaoBioterio {
  id: number;
  nome: string;
}

export interface CreateInstalacaoBioterioPayload {
  nome: string;
}

export const instalacaoBioterioService = {
  async getAll(): Promise<InstalacaoBioterio[]> {
    const response = await api.get<InstalacaoBioterio[]>('/InstalacaoBioterio');
    return response.data;
  },

  async getById(id: number): Promise<InstalacaoBioterio> {
    const response = await api.get<InstalacaoBioterio>(`/InstalacaoBioterio/${id}`);
    return response.data;
  },
  async create(data: CreateInstalacaoBioterioPayload): Promise<InstalacaoBioterio> {
    const response = await api.post<InstalacaoBioterio>('/InstalacaoBioterio', data);
    return response.data;
  },

  async update(id: number, data: CreateInstalacaoBioterioPayload): Promise<void> {
    await api.put(`/InstalacaoBioterio/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/InstalacaoBioterio/${id}`);
  },
};

export default instalacaoBioterioService;
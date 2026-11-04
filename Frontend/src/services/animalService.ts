import type { BiometriaAnimalResponse } from './AlimentacaoService';
import api, { cachedGet } from './api';
import type { BiometriaAnimalPayload } from './BiometriaAnimalService';

export interface CreateAnimalPayload {
  numeroRegistro: string;
  nomePopular: string;
  especieId: number;
  instalacaoBioterioId?: number;
  localizacaoId?: number;
  genero: number;
  faseDeVida: number;
  dataDeEntrada: string;
  municipio: string;
  localOrigemId: number;
  numeroChip: string;
  sisfauna: boolean;
  termoDeDoacao: boolean;
  situacaoAnimal: number;
  fotoAnimal?: File;
  biometriaAnimal?: BiometriaAnimalPayload;
}

export interface AnimalResponse {
  id: number;
  numeroRegistro: string;
  nomePopular: string;
  especieNome: string;
  numeroChip: string;
  genero: number;
  localOrigem: string;
  municipio: string;
  dataDeEntrada: string;
  faseDeVida: number;
  sisfauna: boolean;
  termoDeDoacao: boolean;
  situacaoAnimal: number;
  especieId: number;
  instalacaoBioterioNome: string;
  instalacaoBioterioId: number;
  localizacaoId?: number;
  localizacaoNome?: string;
  localizacaoHierarquia?: string;
  grupo: string;
  localOrigemId: number;
  fotoAnimal?: string;
  biometriaAnimal?: BiometriaAnimalResponse;
}

export interface AnimalListItem {
  id: number;
  numeroRegistro: string;
  numeroChip: string;
  nomePopular: string;
  especieNome: string;
  instalacaoBioterioNome: string;
  localizacaoId?: number;
  localizacaoNome?: string;
  localizacaoHierarquia?: string;
  grupo: string;
  localOrigemNome: string;
  genero: number;
  faseDeVida: number;
  dataDeEntrada: string;
  situacao: number;
  biometriaAnimal?: BiometriaAnimalResponse;
}

export interface AnimalLookupVm {
  id: number;
  numeroRegistro: string;
  especieNome: string;
  peso?: number;
}

export interface PaginatedAnimalResponse {
  items: AnimalListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnimalListParams {
  page?: number;
  pageSize?: number;
  situacaoAnimal?: number;
  especieId?: number;
  genero?: number;
  search?: string;
  faseDeVida?: string;
}

export const animalService = {
  async getLookup(): Promise<AnimalLookupVm[]> {
    return cachedGet<AnimalLookupVm[]>('/Animal/lookup');
  },

  async getAllPaginated(params: AnimalListParams = {}): Promise<PaginatedAnimalResponse> {
    const response = await api.get<PaginatedAnimalResponse>('/Animal', { params });
    return response.data;
  },

  async getById(id: number): Promise<AnimalResponse> {
    const response = await api.get<AnimalResponse>(`/Animal/${id}`);
    return response.data;
  },

  async create(data: CreateAnimalPayload): Promise<AnimalResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'fotoAnimal' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'biometriaAnimal') {
          const biometria = value as BiometriaAnimalPayload;
          if (biometria.peso !== undefined) formData.append('peso', String(biometria.peso));
          if (biometria.comprimento !== undefined) formData.append('comprimento', String(biometria.comprimento));
          if (biometria.comprimentoCauda !== undefined) formData.append('comprimentoCauda', String(biometria.comprimentoCauda));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const response = await api.post<any>('/Animal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success === false) {
      const validationErrors = response.data.validationErrors?.join(', ');
      throw new Error(validationErrors || response.data.message || 'Erro ao criar animal');
    }

    return response.data?.animal ?? response.data;
  },

  async update(data: Partial<CreateAnimalPayload> & { id: number }): Promise<AnimalResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'fotoAnimal' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'biometriaAnimal') {
          const biometria = value as BiometriaAnimalPayload;
          if (biometria.peso !== undefined) formData.append('peso', String(biometria.peso));
          if (biometria.comprimento !== undefined) formData.append('comprimento', String(biometria.comprimento));
          if (biometria.comprimentoCauda !== undefined) formData.append('comprimentoCauda', String(biometria.comprimentoCauda));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    const response = await api.put<any>('/Animal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success === false) {
      const validationErrors = response.data.validationErrors?.join(', ');
      throw new Error(validationErrors || response.data.message || 'Erro ao atualizar animal');
    }

    return response.data?.animal ?? response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Animal/${id}`);
  },
};

export default animalService;
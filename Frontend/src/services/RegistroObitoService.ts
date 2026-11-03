import api from './api';

export interface RegistroObitoListVm {
    id: number;
    animalId: number;
    numeroRegistroAnimal: string;
    nomePopularAnimal: string;
    dataObito: string;
    houveNecropsia: boolean;
    observacoes?: string;
    dataCriacao?: string;
    rf?: string;
}

export interface RegistroObitoDetailVm {
    id: number;
    animalId: number;
    numeroRegistroAnimal: string;
    nomePopularAnimal: string;
    dataObito: string;
    houveNecropsia: boolean;
    observacoes?: string;
    dataCriacao?: string;
    rf?: string;
}

export interface CreateRegistroObitoPayload {
    animalId: number;
    dataObito: string;
    houveNecropsia: boolean;
    observacoes?: string;
}

export interface UpdateRegistroObitoPayload extends CreateRegistroObitoPayload {
    id: number;
}

export interface CreateRegistroObitoResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    registroObito?: RegistroObitoDetailVm;
}

export const registroObitoService = {
    async getAll(params?: { animalId?: number }): Promise<RegistroObitoListVm[]> {
        const response = await api.get<RegistroObitoListVm[]>('/RegistroObito', { params });
        return response.data;
    },

    async getById(id: number): Promise<RegistroObitoDetailVm> {
        const response = await api.get<RegistroObitoDetailVm>(`/RegistroObito/${id}`);
        return response.data;
    },

    async getByAnimalId(animalId: number): Promise<RegistroObitoDetailVm | null> {
        const response = await api.get<RegistroObitoDetailVm | null>(`/RegistroObito/animal/${animalId}`);
        return response.data;
    },

    async create(data: CreateRegistroObitoPayload): Promise<CreateRegistroObitoResponse> {
        const response = await api.post<CreateRegistroObitoResponse>('/RegistroObito', data);
        return response.data;
    },

    async update(data: UpdateRegistroObitoPayload): Promise<CreateRegistroObitoResponse> {
        const response = await api.put<CreateRegistroObitoResponse>('/RegistroObito', data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/RegistroObito/${id}`);
    }
};

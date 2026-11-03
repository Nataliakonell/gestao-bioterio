import axios from 'axios';
import api from './api';

export interface BiometriaAnimalPayload {
    animalId: number;
    peso: number;
    comprimento?: number;
    comprimentoCauda?: number;
    dataBiometria?: string;
}

export interface BiometriaAnimalResponse {
    id: number;
    animalId: number;
    peso: number;
    comprimento?: number;
    comprimentoCauda?: number;
    rf?: string;
    dataBiometria: string;
    dataCriacao: string;
    numeroRegistro: string;
    especieNome: string;
    faseDeVida: string;
}

export interface PaginatedBiometriaAnimalResponse {
    items: BiometriaAnimalResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const getBiometriaAnimais = async (params?: { animalId?: number; search?: string; especieId?: number; faseDeVida?: string; page?: number; pageSize?: number }): Promise<PaginatedBiometriaAnimalResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.animalId) queryParams.append('animalId', String(params.animalId));
        if (params?.search) queryParams.append('search', params.search);
        if (params?.especieId) queryParams.append('especieId', String(params.especieId));
        if (params?.faseDeVida) queryParams.append('faseDeVida', params.faseDeVida);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
        const qs = queryParams.toString();
        
        const response = await api.get<PaginatedBiometriaAnimalResponse>(`/BiometriaAnimal${qs ? '?' + qs : ''}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar biometrias: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar biometrias');
    }
};

export const getBiometriaAnimal = async (id: number): Promise<BiometriaAnimalResponse> => {
    try {
        const response = await api.get<BiometriaAnimalResponse>(`/BiometriaAnimal/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar biometria: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar biometria');
    }
};

export const createBiometriaAnimal = async (payload: BiometriaAnimalPayload): Promise<BiometriaAnimalResponse> => {
    try {
        const response = await api.post<BiometriaAnimalResponse>('/BiometriaAnimal', payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao adicionar biometria: ${message}`);
        }
        throw new Error('Erro de conexão ao adicionar biometria');
    }
};

export const updateBiometriaAnimal = async (id: number, payload: BiometriaAnimalPayload): Promise<BiometriaAnimalResponse> => {
    try {
        const response = await api.put<BiometriaAnimalResponse>(`/BiometriaAnimal`, { ...payload, id });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao editar biometria: ${message}`);
        }
        throw new Error('Erro de conexão ao editar biometria');
    }
};

export const deleteBiometriaAnimal = async (id: number): Promise<void> => {
    try {
        await api.delete(`/BiometriaAnimal/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao deletar biometria: ${message}`);
        }
        throw new Error('Erro de conexão ao deletar biometria');
    }
};

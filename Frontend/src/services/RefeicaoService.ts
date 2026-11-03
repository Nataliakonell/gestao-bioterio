import axios from "axios";
import api from "./api";

export interface RefeicaoPayload {
    alimentacaoId: number;
    tipoRefeicao: number;
    pesoRefeicao: number;
    situacaoRefeicao: number;
}

export interface RefeicaoResponse {
    id: number;
    alimentacaoId: number;
    tipoRefeicao: number;
    pesoRefeicao: number;
    situacaoRefeicao: number;
    unidadeDeMedida: string;
}

export interface RefeicaoResponseDto {
    id: number;
    alimentacaoId: number;
    tipoRefeicao: number;
    pesoRefeicao: number;
    situacaoRefeicao: number;
    unidadeDeMedida: string;

}

export const getRefeicoes = async (): Promise<RefeicaoResponse[]> => {
    try {
        const response = await api.get<RefeicaoResponse[]>('/Refeicao');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar refeições: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar refeições');
    }
};

export const getRefeicao = async (id: number): Promise<RefeicaoResponse> => {
    try {
        const response = await api.get<RefeicaoResponse>(`/Refeicao/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar refeição: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar refeição');
    }
};

export const createRefeicao = async (payload: RefeicaoPayload): Promise<RefeicaoResponse> => {
    try {
        const response = await api.post<RefeicaoResponse>('/Refeicao', payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao adicionar refeição: ${message}`);
        }
        throw new Error('Erro de conexão ao adicionar refeição');
    }
};

export const updateRefeicao = async (id: number, payload: RefeicaoPayload): Promise<RefeicaoResponse> => {
    try {
        const response = await api.put<RefeicaoResponse>('/Refeicao', { ...payload, id });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao editar refeição: ${message}`);
        }
        throw new Error('Erro de conexão ao editar refeição');
    }
};

export const deleteRefeicao = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Refeicao/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao deletar refeição: ${message}`);
        }
        throw new Error('Erro de conexão ao deletar refeição');
    }
};

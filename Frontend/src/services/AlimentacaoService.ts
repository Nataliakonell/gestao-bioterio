import axios from 'axios';
import api from './api';

export interface RefeicaoPayloadItem {
    id?: number;
    tipoRefeicao: number;
    pesoRefeicao: number;
    situacaoRefeicao: number;
}

export interface AlimentacaoPayload {
    animalId: number;
    dataAlimentacao: string;
    peso: number;
    comprimento?: number;
    porcentagemPesoRecomendado: number;
    pesoRecomendado: number;
    refeicoes: RefeicaoPayloadItem[];
    observacoes?: string;
}

export interface AlimentacaoResponse {
    id: number;
    animalId: number;
    dataAlimentacao: string;
    status: string;
    pesoRecomendado: number;
    totalConsumido: number;
    totalOfertado: number;
    saldo: number;
    porcentagemPesoRecomendado: number;
    refeicoes: RefeicaoResponse[];
    biometriaAnimal?: BiometriaAnimalResponse;
    observacoes?: string;
    numeroRegistro: string;
    especieNome: string;
    faseDeVida: string;
}

export interface RefeicaoResponse {
    id: number;
    alimentacaoId: number;
    tipoRefeicao: number;
    pesoRefeicao: number;
    situacaoRefeicao: number;
}

export interface BiometriaAnimalResponse {
    id: number;
    animalId: number;
    peso: number;
    comprimento?: number;
    comprimentoCauda?: number;
}

export interface HistAlimentacaoResponse {
    id: number;
    animalId: number;
    animalNome: string;
    dataAlimentacao: string;
    status: string;
}

export interface HistAlimentacaoItem extends HistAlimentacaoResponse {
    refeicoes?: RefeicaoResponse[];
}

export interface PaginatedAlimentacaoResponse {
    items: AlimentacaoResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}


export const getAlimentacoes = async (params?: { animalId?: number; search?: string; especieId?: number; faseDeVida?: string; status?: string; dataInicial?: string; dataFinal?: string; page?: number; pageSize?: number }): Promise<PaginatedAlimentacaoResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.animalId !== undefined && params?.animalId !== null) queryParams.append('animalId', String(params.animalId));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.especieId) queryParams.append('especieId', String(params.especieId));
    if (params?.faseDeVida) queryParams.append('faseDeVida', params.faseDeVida);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dataInicial) queryParams.append('dataInicial', params.dataInicial);
    if (params?.dataFinal) queryParams.append('dataFinal', params.dataFinal);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));
    const qs = queryParams.toString();

    try {
        const response = await api.get<PaginatedAlimentacaoResponse>(`/Alimentacao${qs ? '?' + qs : ''}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar alimentações: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar alimentações');
    }
};

export const getAlimentacao = async (id: number): Promise<AlimentacaoResponse> => {
    try {
        const response = await api.get<AlimentacaoResponse>(`/Alimentacao/${id}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar alimentação: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar alimentação');
    }
};

export const createAlimentacao = async (payload: AlimentacaoPayload): Promise<AlimentacaoResponse> => {
    try {
        const response = await api.post<any>('/Alimentacao', payload);
        if (response.data?.success === false) {
            const validationErrors = response.data?.validationErrors ?? [];
            const message = response.data?.message || 'Erro ao adicionar alimentação';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao adicionar alimentação: ${message}`);
        }
        throw new Error(error instanceof Error ? error.message : 'Erro de conexão ao adicionar alimentação');
    }
};

export const getAlimentacaoHistorico = async (animalId: number): Promise<HistAlimentacaoItem[]> => {
    try {
        const response = await api.get<HistAlimentacaoItem[]>('/Alimentacao', { params: { animalId } });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao buscar histórico de alimentação: ${message}`);
        }
        throw new Error('Erro de conexão ao buscar histórico de alimentação');
    }
};

export const updateAlimentacao = async (id: number, payload: AlimentacaoPayload): Promise<AlimentacaoResponse> => {
    try {
        const response = await api.put<any>('/Alimentacao', {
            Id: id,
            AnimalId: payload.animalId,
            DataAlimentacao: payload.dataAlimentacao,
            Peso: payload.peso,
            PesoRecomendado: payload.pesoRecomendado,
            PorcentagemPesoRecomendado: payload.porcentagemPesoRecomendado,
            Comprimento: payload.comprimento ?? null,
            Refeicoes: payload.refeicoes,
            Observacoes: payload.observacoes,
        })
        if (response.data?.success === false) {
            const validationErrors = response.data?.validationErrors ?? [];
            const message = response.data?.message || 'Erro ao editar alimentação';
            throw new Error(`${message}${validationErrors.length ? `: ${validationErrors.join(' | ')}` : ''}`);
        }
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao editar alimentação: ${message}`);
        }
        throw new Error(error instanceof Error ? error.message : 'Erro de conexão ao editar alimentação');
    }
};

export const deleteAlimentacao = async (id: number): Promise<void> => {
    try {
        await api.delete(`/Alimentacao/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Erro ao deletar alimentação: ${message}`);
        }
        throw new Error('Erro de conexão ao deletar alimentação');
    }
};



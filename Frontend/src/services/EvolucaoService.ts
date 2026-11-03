import api from './api';

export interface EvolucaoPayload {
    id?: number;
    atendimentoId?: number | null;
    animalId: number;
    descricao: string;
    dataHoraRegistro: string | Date;
    responsavel: string;
}

export interface EvolucaoVm {
    id: number;
    atendimentoId?: number | null;
    animalId: number;
    descricao: string;
    dataHoraRegistro: string;
    responsavel: string;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
}

export const evolucaoService = {
    getAll: async (): Promise<EvolucaoVm[]> => {
        const response = await api.get<EvolucaoVm[]>('/Evolucao');
        return response.data;
    },

    getById: async (id: number): Promise<EvolucaoVm> => {
        const response = await api.get<EvolucaoVm>(`/Evolucao/${id}`);
        return response.data;
    },

    create: async (payload: EvolucaoPayload) => {
        const response = await api.post('/Evolucao', payload);
        return response.data;
    },

    update: async (payload: EvolucaoPayload) => {
        const response = await api.put('/Evolucao', payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Evolucao/${id}`);
    }
};

export default evolucaoService;

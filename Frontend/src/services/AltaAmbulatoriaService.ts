import api from './api';

export interface AltaAmbulatoriaDetailVm {
    id: number;
    animalId: number;
    atendimentoId?: number;
    dataEntradaAmbulatorio?: string;
    dataAltaClinica?: string;
    procedimentosMedicacoes?: string;
    observacoesClinicas?: string;
    instalacaoBioterioRetornoId?: number;
    localizacaoDestinoId?: number;
    dataCriacao?: string;
    rf?: string;
    nomeProfissional?: string;
    responsavel?: string;
}

export interface CreateAltaAmbulatoriaPayload {
    animalId: number;
    atendimentoId?: number;
    dataEntradaAmbulatorio?: string;
    dataAltaClinica?: string;
    procedimentosMedicacoes?: string;
    observacoesClinicas?: string;
    instalacaoBioterioRetornoId?: number;
    localizacaoDestinoId?: number;
    responsavel?: string;
}

export interface UpdateAltaAmbulatoriaPayload extends CreateAltaAmbulatoriaPayload {
    id: number;
}

export interface AltaAmbulatoriaResponse {
    success: boolean;
    message: string;
    validationErrors?: string[];
    id: number;
    altaAmbulatorial?: AltaAmbulatoriaDetailVm;
}

export const altaAmbulatoriaService = {
    async getAll(params?: { animalId?: number }): Promise<AltaAmbulatoriaDetailVm[]> {
        const response = await api.get<AltaAmbulatoriaDetailVm[]>('/AltaAmbulatoria', { params });
        return response.data;
    },

    async getById(id: number): Promise<AltaAmbulatoriaDetailVm> {
        const response = await api.get<AltaAmbulatoriaDetailVm>(`/AltaAmbulatoria/${id}`);
        return response.data;
    },

    async getByAtendimentoId(_atendimentoId: number): Promise<AltaAmbulatoriaDetailVm | null> {
        return null;
    },

    async getByAnimalId(animalId: number): Promise<AltaAmbulatoriaDetailVm | null> {
        try {
            const response = await api.get<AltaAmbulatoriaDetailVm>(`/AltaAmbulatoria/animal/${animalId}`);
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    },

    async create(payload: CreateAltaAmbulatoriaPayload): Promise<AltaAmbulatoriaResponse> {
        const response = await api.post<AltaAmbulatoriaResponse>('/AltaAmbulatoria', payload);
        if (response.data?.success === false) {
            const errors = response.data?.validationErrors ?? [];
            const msg = response.data?.message || 'Erro ao registrar alta ambulatorial';
            throw new Error(`${msg}${errors.length ? `: ${errors.join(' | ')}` : ''}`);
        }
        return response.data;
    },

    async update(payload: UpdateAltaAmbulatoriaPayload): Promise<void> {
        const response = await api.put('/AltaAmbulatoria', payload);
        if (response.data?.success === false) {
            const errors = response.data?.validationErrors ?? [];
            const msg = response.data?.message || 'Erro ao atualizar alta ambulatorial';
            throw new Error(`${msg}${errors.length ? `: ${errors.join(' | ')}` : ''}`);
        }
    },
    async delete(id: number): Promise<void> {
        await api.delete(`/AltaAmbulatoria/${id}`);
    },
};

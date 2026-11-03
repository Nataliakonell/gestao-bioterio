import api from './api';

export interface PrescricaoMedicacaoListVm {
    id: number;
    animalId: number;
    medicacaoId: number;
    medicacaoNome: string;
    volumeDose: string;
    viaAdministracao: string;
    quantidadeDoses: number;
    intervaloEntreDosesHoras: number;
    dataHoraInicio: string;
    observacao: string;
    status: string;
    dataHoraSuspensao?: string | null;
    motivoSuspensao?: string | null;
    totalAdministracoes: number;
    administracoesConcluidas: number;
    rf?: string;
    nomeProfissional?: string;
    responsavel?: string;
}

export interface PrescricaoMedicacaoDetailVm {
    id: number;
    animalId: number;
    medicacaoId: number;
    medicacaoNome: string;
    volumeDose: string;
    viaAdministracao: string;
    quantidadeDoses: number;
    intervaloEntreDosesHoras: number;
    dataHoraInicio: string;
    observacao: string;
    status: string;
    dataHoraSuspensao?: string | null;
    motivoSuspensao?: string | null;
    responsavel?: string;
}

export interface CreatePrescricaoMedicacaoCommand {
    animalId: number;
    atendimentoId?: number | null;
    medicacaoId: number;
    volumeDose: string;
    viaAdministracao: number; // enum
    quantidadeDoses: number;
    intervaloEntreDosesHoras: number;
    dataHoraInicio: string;
    observacao?: string | null;
    responsavel?: string;
}

export interface UpdatePrescricaoMedicacaoCommand {
    id: number;
    animalId: number;
    medicacaoId: number;
    volumeDose: string;
    viaAdministracao: number; // enum
    quantidadeDoses: number;
    intervaloEntreDosesHoras: number;
    dataHoraInicio: string;
    observacao?: string | null;
    responsavel?: string;
}

export const prescricaoMedicacaoService = {
    getAll: async (params?: { animalId?: number; atendimentoId?: number }): Promise<PrescricaoMedicacaoListVm[]> => {
        const queryParams = new URLSearchParams();
        if (params?.animalId) queryParams.append('animalId', String(params.animalId));
        if (params?.atendimentoId) queryParams.append('atendimentoId', String(params.atendimentoId));
        const qs = queryParams.toString();
        const response = await api.get<PrescricaoMedicacaoListVm[]>(`/PrescricaoMedicacao${qs ? '?' + qs : ''}`);
        return response.data;
    },

    getById: async (id: number): Promise<PrescricaoMedicacaoDetailVm> => {
        const response = await api.get<PrescricaoMedicacaoDetailVm>(`/PrescricaoMedicacao/${id}`);
        return response.data;
    },

    create: async (data: CreatePrescricaoMedicacaoCommand): Promise<any> => {
        const response = await api.post('/PrescricaoMedicacao', data);
        return response.data;
    },

    update: async (data: UpdatePrescricaoMedicacaoCommand): Promise<any> => {
        const response = await api.put('/PrescricaoMedicacao', data);
        return response.data;
    },

    suspender: async (id: number, motivoSuspensao: string): Promise<any> => {
        const response = await api.post('/PrescricaoMedicacao/suspend', { id, motivoSuspensao });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/PrescricaoMedicacao/${id}`);
    }
};

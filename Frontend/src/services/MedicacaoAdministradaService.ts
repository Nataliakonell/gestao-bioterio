import api from './api';

export interface MedicacaoAdministradaListVm {
    id: number;
    prescricaoMedicacaoId: number;
    animalId: number;
    medicacaoNome: string;
    dataHoraPrevista: string;
    dataHoraAdministracao?: string | null;
    responsavel: string;
    statusDose: string; // enum string mapped
    observacao: string;
}

export interface MedicacaoAdministradaDetailVm {
    id: number;
    prescricaoMedicacaoId: number;
    animalId: number;
    medicacaoNome: string;
    dataHoraPrevista: string;
    dataHoraAdministracao?: string | null;
    responsavel: string;
    statusDose: string; // enum string mapped
    observacao: string;
}

export interface CreateMedicacaoAdministradaCommand {
    prescricaoMedicacaoId: number;
    dataHoraAdministracao?: string | null;
    dataHoraPrevista: string;
    observacao?: string | null;
    responsavel: string;
    statusDose: number; // enum
}

export interface UpdateMedicacaoAdministradaCommand {
    id: number;
    prescricaoMedicacaoId: number;
    dataHoraAdministracao?: string | null;
    dataHoraPrevista: string;
    observacao?: string | null;
    responsavel: string;
    statusDose: number; // enum
}

export const medicacaoAdministradaService = {
    getAll: async (params?: { animalId?: number; prescricaoMedicacaoId?: number }): Promise<MedicacaoAdministradaListVm[]> => {
        const queryParams = new URLSearchParams();
        if (params?.animalId) queryParams.append('animalId', params.animalId.toString());
        if (params?.prescricaoMedicacaoId) queryParams.append('prescricaoMedicacaoId', params.prescricaoMedicacaoId.toString());
        const qs = queryParams.toString();
        const url = `/MedicacaoAdministrada${qs ? `?${qs}` : ''}`;
        const response = await api.get<MedicacaoAdministradaListVm[]>(url);
        return response.data;
    },

    getById: async (id: number): Promise<MedicacaoAdministradaDetailVm> => {
        const response = await api.get<MedicacaoAdministradaDetailVm>(`/MedicacaoAdministrada/${id}`);
        return response.data;
    },

    create: async (data: CreateMedicacaoAdministradaCommand): Promise<any> => {
        const response = await api.post('/MedicacaoAdministrada', data);
        return response.data;
    },

    update: async (data: UpdateMedicacaoAdministradaCommand): Promise<any> => {
        const response = await api.put('/MedicacaoAdministrada', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/MedicacaoAdministrada/${id}`);
    }
};

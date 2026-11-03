import api from './api';

export enum StatusDoseDesverminacao {
    Agendada = 1,
    Hoje = 2,
    Atrasada = 3,
    Aplicada = 4
}

export enum TipoDose {
    PrimeiraDose = 1,
    SegundaDose = 2,
    Anual = 3
}

export interface DoseAplicacaoDesverminacaoListVm {
    id: number;
    protocoloDesverminacaoId: number;
    animalId: number | null;
    tipoDose: string;
    dataPrevista: string;
    dataAplicacao: string | null;
    statusDoseDesverminacao: string;
    observacao: string | null;
    responsavel?: string;
}

export interface CreateDoseAplicacaoDesverminacaoCommand {
    protocoloDesverminacaoId: number;
    tipoDose: TipoDose;
    dataPrevista: string;
    dataAplicacao: string | null;
    statusDoseDesverminacao: StatusDoseDesverminacao;
    observacao: string | null;
    responsavel?: string;
}

export const getDosesAplicacaoDesverminacao = async (protocoloId?: number): Promise<DoseAplicacaoDesverminacaoListVm[]> => {
    const params = protocoloId ? { protocoloId } : {};
    const response = await api.get<DoseAplicacaoDesverminacaoListVm[]>('/DoseAplicacaoDesverminacao', { params });
    return response.data;
};

export const getDoseAplicacaoDesverminacaoById = async (id: number) => {
    const response = await api.get(`/DoseAplicacaoDesverminacao/${id}`);
    return response.data;
};

export const createDoseAplicacaoDesverminacao = async (command: CreateDoseAplicacaoDesverminacaoCommand) => {
    const response = await api.post('/DoseAplicacaoDesverminacao', command);
    return response.data;
};

export const updateDoseAplicacaoDesverminacao = async (command: any) => {
    const response = await api.put('/DoseAplicacaoDesverminacao', command);
    return response.data;
};

export const deleteDoseAplicacaoDesverminacao = async (id: number) => {
    const response = await api.delete(`/DoseAplicacaoDesverminacao/${id}`);
    return response.data;
};

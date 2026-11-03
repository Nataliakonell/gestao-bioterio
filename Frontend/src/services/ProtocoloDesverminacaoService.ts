import api from './api';

export enum StatusProtocolo {
    AguardandoPrimeiraDose = 1,
    AguardandoSegundaDose = 2,
    ManutencaoAnual = 3,
    Atrasado = 4,
    Concluido = 5,
    Suspenso = 6
}

export interface DoseDesverminacaoVm {
    id: number;
    tipoDose: string;
    dataPrevista: string;
    dataAplicacao: string | null;
    statusDoseDesverminacao: string;
    observacao: string | null;
}

export interface ProtocoloDesverminacaoListVm {
    id: number;
    animalId: number;
    numeroRegistro: string;
    especieNome: string;
    dataEntrada: string;
    statusProtocolo: string; 
    cicloInicialConcluido: boolean;
    dataProximaDose: string | null;
    doses?: DoseDesverminacaoVm[];
}

export interface ProtocoloDesverminacaoDetailVm {
    id: number;
    animalId: number;
    dataEntrada: string;
    statusProtocolo: string;
    cicloInicialConcluido: boolean;
    dataConclusaoCicloInicial: string | null;
    dataProximaDose: string | null;
}

export const getProtocolosDesverminacao = async (): Promise<ProtocoloDesverminacaoListVm[]> => {
    const response = await api.get<ProtocoloDesverminacaoListVm[]>('/ProtocoloDesverminacao');
    return response.data;
};

export const getProtocoloDesverminacaoById = async (id: number): Promise<ProtocoloDesverminacaoDetailVm> => {
    const response = await api.get<ProtocoloDesverminacaoDetailVm>(`/ProtocoloDesverminacao/${id}`);
    return response.data;
};

export const createProtocoloDesverminacao = async (data: { animalId: number, dataEntrada: string, temHistoricoDoses?: boolean }) => {
    const response = await api.post('/ProtocoloDesverminacao', data);
    return response.data;
};

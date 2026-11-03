import api from './api';

export enum TipoMovimentacao {
    Transferencia = 1,
    SaidaEvento = 2,
    RetornoEvento = 3,
    AtendimentoClinico = 4,
    RetornoAmbulatorio = 5
}

export interface MovimentacaoAnimalListVm {
    id: number;
    animalId: number;
    animalNomePopular?: string;
    animalNumeroRegistro?: string;
    localizacaoId: number;
    localizacaoNome?: string;
    localizacaoCaminhoHierarquia?: string;
    eventoId?: number;
    tipoMovimentacao: TipoMovimentacao;
    tipoMovimentacaoDescricao?: string;
    dataCriacao: string;
    rf: string;
}

export interface CreateMovimentacaoAnimalCommand {
    animalId: number;
    localizacaoId: number;
    localizacaoDestinoId?: number;
    tipoMovimentacao: TipoMovimentacao;
    eventoId?: number;
    responsavel?: string;
    observacao?: string;
}

export const movimentacaoAnimalService = {
    getAll: async (animalId?: number): Promise<MovimentacaoAnimalListVm[]> => {
        const response = await api.get<MovimentacaoAnimalListVm[]>('/MovimentacaoAnimal', {
            params: animalId ? { animalId } : undefined
        });
        return response.data;
    },

    create: async (data: CreateMovimentacaoAnimalCommand) => {
        const payload = {
            ...data,
            localizacaoId: data.localizacaoId ?? data.localizacaoDestinoId,
            localizacaoDestinoId: data.localizacaoDestinoId ?? data.localizacaoId,
        };
        const response = await api.post('/MovimentacaoAnimal', payload);
        return response.data;
    }
};

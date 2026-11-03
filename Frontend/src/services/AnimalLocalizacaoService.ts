import api from './api';

export interface AnimalLocalizacaoListVm {
    id: number;
    animalId: number;
    animalNomePopular?: string;
    animalNumeroRegistro?: string;
    animalEspecieNome?: string;
    animalEspecieId?: number;
    animalGenero?: number; // 1 = Macho, 2 = Femea, 3 = NaoIdentificado
    animalFaseDeVida?: number; // 1 = Filhote, 2 = Jovem, 3 = Adulto
    localizacaoId: number;
    localizacaoNome?: string;
    localizacaoCaminhoHierarquia?: string;
}

export interface CreateAnimalLocalizacaoCommand {
    animalId: number;
    localizacaoId: number;
}

export const animalLocalizacaoService = {
    getAll: async (): Promise<AnimalLocalizacaoListVm[]> => {
        const response = await api.get<AnimalLocalizacaoListVm[]>('/AnimalLocalizacao');
        return response.data;
    },

    getByLocalizacaoId: async (localizacaoId: number): Promise<AnimalLocalizacaoListVm[]> => {
        const response = await api.get<AnimalLocalizacaoListVm[]>('/AnimalLocalizacao');
        return response.data.filter(x => x.localizacaoId === localizacaoId);
    },

    create: async (data: CreateAnimalLocalizacaoCommand) => {
        const response = await api.post('/AnimalLocalizacao', data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/AnimalLocalizacao/${id}`);
        return response.data;
    }
};

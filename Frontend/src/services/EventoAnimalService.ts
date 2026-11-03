import api from './api';

export interface EventoAnimalListVm {
    id: number;
    eventoId: number;
    animalId: number;
    animalNomePopular?: string;
    animalNumeroRegistro?: string;
    animalEspecieNome?: string;
    especieNome?: string;
    localizacaoNome?: string;
}

export interface CreateEventoAnimalCommand {
    eventoId: number;
    animalId: number;
}

export interface CreateEventoAnimalResponse {
    success: boolean;
    message: string;
    id?: number;
}

export const eventoAnimalService = {
    getAll: async (eventoId?: number): Promise<EventoAnimalListVm[]> => {
        const response = await api.get<EventoAnimalListVm[]>('/EventoAnimal', {
            params: eventoId ? { eventoId } : {}
        });
        return response.data;
    },

    getById: async (id: number): Promise<EventoAnimalListVm> => {
        const response = await api.get<EventoAnimalListVm>(`/EventoAnimal/${id}`);
        return response.data;
    },

    create: async (cmd: CreateEventoAnimalCommand): Promise<CreateEventoAnimalResponse> => {
        const response = await api.post<CreateEventoAnimalResponse>('/EventoAnimal', cmd);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/EventoAnimal/${id}`);
    }
};

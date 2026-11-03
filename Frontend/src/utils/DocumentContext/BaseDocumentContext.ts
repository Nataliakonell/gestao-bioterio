export interface DocumentPlaceholderItem {
    key: string;
    label: string;
    isFunction?: boolean;
}

export interface DocumentPlaceholderCategory {
    category: string;
    items: DocumentPlaceholderItem[];
}

export abstract class BaseDocumentContext {
    protected abstract areaName: string;

    public getGlobalPlaceholders(): DocumentPlaceholderCategory[] {
        return [
            {
                category: "Comandos do Sistema [FUN_*]",
                items: [
                    { key: "FUN_DATA_AGORA", label: "Data Atual", isFunction: true },
                    { key: "FUN_DATA_HORA_AGORA", label: "Data e Hora Atual", isFunction: true },
                    { key: "FUN_NOME_COMPLETO_USUARIO", label: "Nome Completo do Usuário / Responsável", isFunction: true },
                ]
            },
            {
                category: "Dados do Animal [FUN_*]",
                items: [
                    { key: "FUN_ESPECIE", label: "Espécie do Animal", isFunction: true },
                    { key: "FUN_NUMERO_REGISTRO", label: "Identificação / Número de Registro", isFunction: true },
                    { key: "FUN_LOCAL_ORIGEM", label: "Origem / Local de Origem", isFunction: true },
                    { key: "FUN_NOME_POPULAR", label: "Nome Popular do Animal", isFunction: true },
                    { key: "FUN_GENERO", label: "Gênero do Animal", isFunction: true },
                    { key: "FUN_FASE_VIDA", label: "Fase de Vida", isFunction: true },
                    { key: "FUN_INSTALACAO_ATUAL", label: "Instalação Atual do Biotério", isFunction: true },
                ]
            }
        ];
    }

    public getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        return this.getGlobalPlaceholders();
    }

    protected resolveGlobalFun(key: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        if (key === 'FUN_DATA_AGORA') {
            return tokenMap['FUN_DATA_AGORA'] || tokenMap['DATAATUAL'] || new Date().toLocaleDateString('pt-BR');
        }
        if (key === 'FUN_DATA_HORA_AGORA') {
            return tokenMap['FUN_DATA_HORA_AGORA'] || tokenMap['DATAHORAATUAL'] || new Date().toLocaleString('pt-BR');
        }
        if (key === 'FUN_NOME_COMPLETO_USUARIO' || key === 'FUN_NOME_RESPONSAVEL' || key === 'FUN_NOME_RESPOSAVEL') {
            return tokenMap['FUN_NOME_COMPLETO_USUARIO'] || tokenMap['FUN_NOME_RESPONSAVEL'] || tokenMap['FUN_NOME_RESPOSAVEL'] || tokenMap['RESPONSAVEL'] || null;
        }

        // Resolução de dados do Animal da entidade Animal
        const animal = data.Animal || data.animal || {};

        if (key === 'FUN_ESPECIE' || key === 'FUN_ESPECIENOME') {
            return tokenMap['FUN_ESPECIE'] || tokenMap['ESPECIENOME'] || tokenMap['ANIMAL.ESPECIENOME'] || tokenMap['ESPECIE.NOME'] || animal.especie?.nome || animal.especieNome || null;
        }
        if (key === 'FUN_NUMERO_REGISTRO' || key === 'FUN_NUMEROREGISTRO') {
            return tokenMap['FUN_NUMERO_REGISTRO'] || tokenMap['FUN_NUMEROREGISTRO'] || tokenMap['NUMEROREGISTRO'] || tokenMap['ANIMAL.NUMEROREGISTRO'] || animal.numeroRegistro || null;
        }
        if (key === 'FUN_LOCAL_ORIGEM' || key === 'FUN_LOCALORIGEM') {
            return tokenMap['FUN_LOCAL_ORIGEM'] || tokenMap['FUN_LOCALORIGEM'] || tokenMap['LOCALORIGEMNOME'] || tokenMap['LOCALORIGEM.NOME'] || tokenMap['ANIMAL.LOCALORIGEM'] || animal.localOrigem?.nome || animal.localOrigemNome || null;
        }
        if (key === 'FUN_NOME_POPULAR' || key === 'FUN_NOMEPOPULAR') {
            return tokenMap['FUN_NOME_POPULAR'] || tokenMap['FUN_NOMEPOPULAR'] || tokenMap['NOMEPOPULAR'] || tokenMap['ANIMAL.NOMEPOPULAR'] || animal.nomePopular || null;
        }
        if (key === 'FUN_GENERO') {
            const generoVal = tokenMap['FUN_GENERO'] || tokenMap['GENERO'] || tokenMap['ANIMAL.GENERO'] || animal.genero;
            if (generoVal === 1 || generoVal === '1' || String(generoVal).toLowerCase() === 'macho') return 'Macho';
            if (generoVal === 2 || generoVal === '2' || String(generoVal).toLowerCase() === 'femea' || String(generoVal).toLowerCase() === 'fêmea') return 'Fêmea';
            return generoVal ? String(generoVal) : null;
        }
        if (key === 'FUN_FASE_VIDA' || key === 'FUN_FASEDEVIDA' || key === 'FUN_FASEVIDA') {
            return tokenMap['FUN_FASE_VIDA'] || tokenMap['FASEDEVIDA'] || tokenMap['ANIMAL.FASEDEVIDA'] || animal.faseDeVida || null;
        }
        if (key === 'FUN_INSTALACAO_ATUAL' || key === 'FUN_INSTALACAOATUAL') {
            return tokenMap['FUN_INSTALACAO_ATUAL'] || tokenMap['FUN_INSTALACAOATUAL'] || tokenMap['INSTALACAOATUAL'] || tokenMap['INSTALACAO.NOME'] || animal.instalacaoBioterio?.nome || animal.instalacaoBioterioNome || null;
        }

        return null;
    }

    public resolveFun(tokenName: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        const key = tokenName.trim().toUpperCase();

        const globalVal = this.resolveGlobalFun(key, data, tokenMap);
        if (globalVal !== null) {
            return globalVal;
        }

        console.warn(`[DocumentContext:${this.areaName}] Função '${tokenName}' não está disponível no contexto de documento da página/área '${this.areaName}'.`);
        return null;
    }
}

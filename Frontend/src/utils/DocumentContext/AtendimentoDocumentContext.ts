import { BaseDocumentContext, type DocumentPlaceholderCategory } from './BaseDocumentContext';

export class AtendimentoDocumentContext extends BaseDocumentContext {
    protected areaName = "Atendimento";

    public override getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        const globals = this.getGlobalPlaceholders();
        const areaPlaceholders: DocumentPlaceholderCategory = {
            category: "Variáveis de Atendimento / Animal",
            items: [
                { key: "FUN_NUMERO_REGISTRO", label: "Número Registro Animal", isFunction: true },
                { key: "FUN_NOME_POPULAR", label: "Nome Popular Animal", isFunction: true },
                { key: "FUN_ESPECIE", label: "Espécie", isFunction: true },
                { key: "FUN_GENERO", label: "Gênero", isFunction: true },
                { key: "FUN_FASE_VIDA", label: "Fase de Vida", isFunction: true },
                { key: "FUN_LOCAL_ORIGEM", label: "Local de Origem", isFunction: true },
                { key: "FUN_INSTALACAO_ATUAL", label: "Instalação Atual", isFunction: true },
            ]
        };
        return [...globals, areaPlaceholders];
    }

    public override resolveFun(tokenName: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        const key = tokenName.trim().toUpperCase();

        if (key === 'FUN_NUMERO_REGISTRO') {
            return tokenMap['FUN_NUMERO_REGISTRO'] || tokenMap['NUMEROREGISTRO'] || tokenMap['ANIMAL.NUMEROREGISTRO'] || null;
        }
        if (key === 'FUN_NOME_POPULAR') {
            return tokenMap['FUN_NOME_POPULAR'] || tokenMap['NOMEPOPULAR'] || tokenMap['ANIMAL.NOMEPOPULAR'] || null;
        }
        if (key === 'FUN_ESPECIE') {
            return tokenMap['FUN_ESPECIE'] || tokenMap['ESPECIENOME'] || tokenMap['ANIMAL.ESPECIENOME'] || tokenMap['ESPECIE.NOME'] || null;
        }
        if (key === 'FUN_GENERO') {
            return tokenMap['FUN_GENERO'] || tokenMap['GENERO'] || tokenMap['ANIMAL.GENERO'] || null;
        }
        if (key === 'FUN_FASE_VIDA') {
            return tokenMap['FUN_FASE_VIDA'] || tokenMap['FASEDEVIDA'] || tokenMap['ANIMAL.FASEDEVIDA'] || null;
        }
        if (key === 'FUN_LOCAL_ORIGEM') {
            return tokenMap['FUN_LOCAL_ORIGEM'] || tokenMap['LOCALORIGEMNOME'] || tokenMap['LOCALORIGEM.NOME'] || null;
        }
        if (key === 'FUN_INSTALACAO_ATUAL') {
            return tokenMap['FUN_INSTALACAO_ATUAL'] || tokenMap['INSTALACAOATUAL'] || tokenMap['INSTALACAO.NOME'] || null;
        }

        return super.resolveFun(tokenName, data, tokenMap);
    }
}

import { BaseDocumentContext, type DocumentPlaceholderCategory } from './BaseDocumentContext';

export class LiberacaoQuarentenaDocumentContext extends BaseDocumentContext {
    protected areaName = "LiberacaoQuarentena";

    public override getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        const globals = this.getGlobalPlaceholders();
        const areaPlaceholders: DocumentPlaceholderCategory = {
            category: "Variáveis da Liberação de Quarentena",
            items: [
                { key: "FUN_DIAGNOSTICO", label: "Diagnóstico Clínico", isFunction: true },
                { key: "FUN_TRATAMENTO", label: "Tratamento Aplicado", isFunction: true },
                { key: "INPUT_DATA_ENTRADA_QUARENTENA", label: "Data de Entrada na Quarentena" },
                { key: "INPUT_DATA_SAIDA_QUARENTENA", label: "Data de Saída/Liberação" },
                { key: "INPUT_INSTALACAO_DESTINO", label: "Instalação/Sala de Destino" },
                { key: "INPUT_OBSERVACOES_QUARENTENA", label: "Observações da Quarentena" },
            ]
        };
        return [...globals, areaPlaceholders];
    }

    public override resolveFun(tokenName: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        const key = tokenName.trim().toUpperCase();

        if (key === 'FUN_DIAGNOSTICO') {
            return tokenMap['FUN_DIAGNOSTICO'] || tokenMap['DIAGNOSTICO'] || tokenMap['ATENDIMENTO.DIAGNOSTICO'] || null;
        }
        if (key === 'FUN_TRATAMENTO') {
            return tokenMap['FUN_TRATAMENTO'] || tokenMap['TRATAMENTO'] || tokenMap['ATENDIMENTO.TRATAMENTO'] || null;
        }

        return super.resolveFun(tokenName, data, tokenMap);
    }
}

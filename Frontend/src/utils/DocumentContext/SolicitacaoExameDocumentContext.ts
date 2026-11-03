import {
    BaseDocumentContext,
    type DocumentPlaceholderCategory
} from './BaseDocumentContext';

export class SolicitacaoExameDocumentContext extends BaseDocumentContext {
    protected areaName = "SolicitacaoExame";

    public override getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        const globals = this.getGlobalPlaceholders();

        const areaPlaceholders: DocumentPlaceholderCategory = {
            category: "Variáveis de Solicitação de Exame",
            items: [
                {
                    key: "FUN_CHECK_HEMOGRAMA",
                    label: "Marcação: Hemograma Completo [X]/[ ]",
                    isFunction: true
                },
                {
                    key: "FUN_CHECK_ULTRASSONOGRAFIA",
                    label: "Marcação: Ultrassonografia [X]/[ ]",
                    isFunction: true
                },
                {
                    key: "FUN_CHECK_RADIOGRAFIA",
                    label: "Marcação: Radiografia [X]/[ ]",
                    isFunction: true
                },
                {
                    key: "FUN_CHECK_OUTROS",
                    label: "Marcação: Outros [X]/[ ]",
                    isFunction: true
                },

                {
                    key: "FUN_EXAMES_SOLICITADOS",
                    label: "Exames Solicitados — somente os selecionados",
                    isFunction: true
                },

                {
                    key: "INPUT_Outros",
                    label: "Descrição de Outro Exame (INPUT_Outros)"
                },
                {
                    key: "INPUT_SinaisClinicos",
                    label: "Sinais Clínicos Observados (INPUT_SinaisClinicos)"
                },
                {
                    key: "INPUT_SuspeitaClinica",
                    label: "Suspeita Clínica (INPUT_SuspeitaClinica)"
                },
                {
                    key: "INPUT_RegiaoAnatomica",
                    label: "Região Anatômica de Interesse (INPUT_RegiaoAnatomica)"
                },
                {
                    key: "INPUT_Observacao",
                    label: "Observações Adicionais (INPUT_Observacao)"
                },
            ]
        };

        return [...globals, areaPlaceholders];
    }

    public override resolveFun(
        tokenName: string,
        data: Record<string, any>,
        tokenMap: Record<string, string>
    ): string | null {

        const key = tokenName.trim().toUpperCase();

        const rawTipos =
            data.tiposExame ??
            data.TiposExame ??
            data.Exame?.tiposExame ??
            data.Exame?.TiposExame;

        const rawTipo =
            data.tipoExame ??
            data.TipoExame ??
            data.Exame?.TipoExame ??
            data.Exame?.tipoExame;

        const isChecked = (targetNum: number): boolean => {

            if (Array.isArray(rawTipos)) {
                return rawTipos
                    .map(Number)
                    .includes(targetNum);
            }

            if (
                rawTipo !== undefined &&
                rawTipo !== null &&
                rawTipo !== ""
            ) {
                return Number(rawTipo) === targetNum;
            }

            return false;
        };

        if (key === 'FUN_EXAMES_SOLICITADOS') {

            const exames: string[] = [];

            // 1 = Hemograma
            if (isChecked(1)) {
                exames.push('Hemograma Completo');
            }

            // 2 = Ultrassonografia
            if (isChecked(2)) {
                exames.push('Ultrassonografia');
            }

            // 3 = Radiografia
            if (isChecked(3)) {
                exames.push('Radiografia (Raio-X)');
            }

            // 4 = Outros
            if (isChecked(4)) {

                const descricaoOutros =
                    data.outros ??
                    data.Outros ??
                    data.inputOutros ??
                    data.INPUT_Outros ??
                    data.Exame?.outros ??
                    data.Exame?.Outros ??
                    '';

                if (
                    typeof descricaoOutros === 'string' &&
                    descricaoOutros.trim()
                ) {
                    exames.push(
                        `Outros: ${descricaoOutros.trim()}`
                    );
                } else {
                    exames.push('Outros');
                }
            }

            if (exames.length === 0) {
                return '';
            }

            return exames.join('\n');
        }

        if (key === 'FUN_CHECK_HEMOGRAMA') {
            return isChecked(1) ? '☒' : '☐';
        }

        if (key === 'FUN_CHECK_ULTRASSONOGRAFIA') {
            return isChecked(2) ? '☒' : '☐';
        }

        if (key === 'FUN_CHECK_RADIOGRAFIA') {
            return isChecked(3) ? '☒' : '☐';
        }

        if (key === 'FUN_CHECK_OUTROS') {
            return isChecked(4) ? '☒' : '☐';
        }

        return super.resolveFun(
            tokenName,
            data,
            tokenMap
        );
    }
}
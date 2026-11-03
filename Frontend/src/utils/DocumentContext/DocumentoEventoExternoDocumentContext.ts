import { BaseDocumentContext, type DocumentPlaceholderCategory } from './BaseDocumentContext';

export class DocumentoEventoExternoDocumentContext extends BaseDocumentContext {
    protected areaName = "DocumentoDeEventoExterno";

    public override getAvailablePlaceholders(): DocumentPlaceholderCategory[] {
        const globals = this.getGlobalPlaceholders();
        const areaPlaceholders: DocumentPlaceholderCategory = {
            category: "Formulário de Transporte de Fauna (IMASUL)",
            items: [
                { key: "REQUERENTE_NOME", label: "Requerente - Razão Social" },
                { key: "REQUERENTE_CNPJ_CPF", label: "Requerente - CNPJ/CPF" },
                { key: "REQUERENTE_ENDERECO", label: "Requerente - Endereço" },
                { key: "REQUERENTE_BAIRRO", label: "Requerente - Bairro" },
                { key: "REQUERENTE_MUNICIPIO_UF", label: "Requerente - Município/UF" },
                { key: "REQUERENTE_CEP", label: "Requerente - CEP" },
                { key: "REQUERENTE_TELEFONE", label: "Requerente - Telefone" },
                { key: "REQUERENTE_CTF", label: "Requerente - CTF nº" },

                { key: "DESTINATARIO_OPCOES_CHECKBOX", label: "Destinatário - Lista de Checkboxes ( ) / ( X )", isFunction: true },
                { key: "DESTINATARIO_TIPO", label: "Destinatário - Tipo Selecionado" },
                { key: "DESTINATARIO_OUTROS_ESPECIFICAR", label: "Destinatário - Outros (Especificação)" },
                { key: "DESTINATARIO_NOME", label: "Destinatário - Nome / Razão Social" },
                { key: "DESTINATARIO_CNPJ_CPF", label: "Destinatário - CNPJ / CPF" },
                { key: "DESTINATARIO_ENDERECO", label: "Destinatário - Endereço" },
                { key: "DESTINATARIO_BAIRRO", label: "Destinatário - Bairro" },
                { key: "DESTINATARIO_MUNICIPIO", label: "Destinatário - Município" },
                { key: "DESTINATARIO_CEP", label: "Destinatário - CEP" },
                { key: "DESTINATARIO_TELEFONE", label: "Destinatário - Telefone" },
                { key: "DESTINATARIO_CTF", label: "Destinatário - CTF nº" },

                { key: "OBJETO_OPCOES_CHECKBOX", label: "Objeto - Lista de Checkboxes ( ) / ( X )", isFunction: true },
                { key: "OBJETO_TIPO", label: "Objeto - Tipo Selecionado" },
                { key: "OBJETO_ESPECIFICAR", label: "Objeto - Especificação" },

                { key: "LISTA_ANIMAIS_IMASUL", label: "Descrição do Material (Animais formatados para o IMASUL)", isFunction: true },

                { key: "TRANSPORTE_OPCOES_CHECKBOX", label: "Transporte - Lista de Checkboxes ( ) / ( X )", isFunction: true },
                { key: "TRANSPORTE_CONDUTORES_VEICULOS", label: "Transporte - Detalhamento Condutores e Veículos" },
                { key: "TRANSPORTE_ROTA", label: "Transporte - Rodovias Utilizadas (Rota)" },
                { key: "TRANSPORTE_DATA", label: "Transporte - Data a ser Efetuado" },

                { key: "DOCUMENTO_DATA_DECLARACAO", label: "Data da Declaração/Emissão", isFunction: true },
            ]
        };
        return [...globals, areaPlaceholders];
    }

    public override resolveFun(tokenName: string, data: Record<string, any>, tokenMap: Record<string, string>): string | null {
        const key = tokenName.trim().toUpperCase();

        if (key === 'DESTINATARIO_OPCOES_CHECKBOX') {
            const destTipo = data?.destinatario?.tipo || tokenMap['DESTINATARIO_TIPO'] || '';
            const outrosEsp = data?.destinatario?.outrosEspecificar || tokenMap['DESTINATARIO_OUTROS_ESPECIFICAR'] || '';

            const isZoologico = destTipo === 'Zoológico';
            const isInstCientifica = destTipo === 'Instituição/criadouro científico' || destTipo === 'Instituição científica';
            const isPesquisador = destTipo === 'Pesquisador';
            const isExpositor = destTipo === 'Expositor';
            const isComercial = destTipo === 'Criadouro comercial';
            const isConservacionista = destTipo === 'Criadouro conservacionista';
            const isOutros = destTipo === 'Outros' || (!isZoologico && !isInstCientifica && !isPesquisador && !isExpositor && !isComercial && !isConservacionista && Boolean(destTipo));

            return `( ${isZoologico ? 'X' : ' '} ) ZOOLÓGICO &nbsp; ( ${isInstCientifica ? 'X' : ' '} ) INSTITUIÇÃO/CRIADOURO CIENTÍFICO &nbsp; ( ${isPesquisador ? 'X' : ' '} ) PESQUISADOR &nbsp; ( ${isExpositor ? 'X' : ' '} ) EXPOSITOR &nbsp; ( ${isComercial ? 'X' : ' '} ) CRIADOURO COMERCIAL &nbsp; ( ${isConservacionista ? 'X' : ' '} ) CRIADOURO CONSERVACIONISTA &nbsp; ( ${isOutros ? 'X' : ' '} ) OUTROS (ESPECIFICAR): ${isOutros ? (outrosEsp || destTipo) : ''}`;
        }

        if (key === 'OBJETO_OPCOES_CHECKBOX') {
            const objTipo = data?.objeto?.tipo || tokenMap['OBJETO_TIPO'] || '';
            const objEsp = data?.objeto?.especificar || tokenMap['OBJETO_ESPECIFICAR'] || '';

            const isMaterialZoo = objTipo.includes('material zoológico') || objTipo === 'Transporte de material zoológico (especificar)';
            const isProdutoFauna = objTipo.includes('produto') || objTipo === 'Transporte de produto e subproduto da fauna (especificar)';
            const isExposicao = objTipo === 'Exposição de animais silvestres' || objTipo.includes('Exposição');
            const isOutros = objTipo === 'Outros' || objTipo.includes('Outros') || (!isMaterialZoo && !isProdutoFauna && !isExposicao && Boolean(objTipo));

            return `<div style="line-height: 1.6;">
                <div>( ${isMaterialZoo ? 'X' : ' '} ) TRANSPORTE DE MATERIAL ZOOLOGICO (ESPECIFICAR): ${isMaterialZoo ? objEsp : ''}</div>
                <div>( ${isProdutoFauna ? 'X' : ' '} ) TRANSPORTE DE PRODUTOS E SUBPRODUTOS DA FAUNA (ESPECIFICAR): ${isProdutoFauna ? objEsp : ''}</div>
                <div>( ${isExposicao ? 'X' : ' '} ) EXPOSIÇÃO DE ANIMAIS SILVESTRES</div>
                <div>( ${isOutros ? 'X' : ' '} ) OUTROS (ESPECIFICAR): ${isOutros ? (objEsp || objTipo) : ''}</div>
            </div>`;
        }

        if (key === 'TRANSPORTE_OPCOES_CHECKBOX') {
            const meio = data?.transporte?.meio || tokenMap['TRANSPORTE_MEIO'] || 'Terrestre - Rodoviário';
            const condutorDados = data?.transporte?.condutorDados || tokenMap['TRANSPORTE_CONDUTORES_VEICULOS'] || '';

            const isRodoviario = meio.toLowerCase().includes('rodoviário') || meio.toLowerCase().includes('rodoviario');
            const isFerroviario = meio.toLowerCase().includes('ferroviário') || meio.toLowerCase().includes('ferroviario');
            const isAereo = meio.toLowerCase().includes('aéreo') || meio.toLowerCase().includes('aereo');
            const isFluvial = meio.toLowerCase().includes('fluvial');

            return `<div style="line-height: 1.6;">
                <div><strong>( ${isRodoviario ? 'X' : ' '} ) TERRESTRE – Rodoviário</strong></div>
                ${isRodoviario && condutorDados ? `<div style="margin: 4px 0 8px 16px; font-size: 11px; white-space: pre-wrap;">${condutorDados}</div>` : ''}
                <div>( ${isFerroviario ? 'X' : ' '} ) TERRESTRE - Ferroviário (ESPECIFICAR) ${isFerroviario ? condutorDados : ''}</div>
                <div>( ${isAereo ? 'X' : ' '} ) AÉREO (ESPECIFICAR) ${isAereo ? condutorDados : ''}</div>
                <div>( ${isFluvial ? 'X' : ' '} ) FLUVIAL (ESPECIFICAR) ${isFluvial ? condutorDados : ''}</div>
            </div>`;
        }

        if (key === 'LISTA_ANIMAIS_IMASUL') {
            const animais = data?.animais || [];
            if (!Array.isArray(animais) || animais.length === 0) {
                return '<div style="font-style: italic; color: #666;">Nenhum animal listado para este transporte.</div>';
            }

            return animais.map((a: any, idx: number) => {
                const num = String(idx + 1).padStart(2, '0');
                const especie = a.especieNome || a.especie || a.nomeCientifico || 'Espécie não informada';
                const sexo = a.sexo || a.genero || 'Sexo não informado';
                const chip = a.chip || a.numeroRegistro || a.marcacao || 'Sem chip';
                return `<div style="font-size: 12px; margin-bottom: 2px;">${num} - <em>${especie}</em> ${sexo} Chip ${chip}</div>`;
            }).join('');
        }

        if (key === 'DOCUMENTO_DATA_DECLARACAO') {
            return data?.dataDeclaracao || new Date().toLocaleDateString('pt-BR');
        }

        return super.resolveFun(tokenName, data, tokenMap);
    }
}

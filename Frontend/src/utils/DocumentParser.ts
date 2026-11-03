import DOMPurify from 'dompurify';
import type { ConfiguracaoLayoutHeaderFooter } from '@/services/ModeloDocumentoService';
import { DocumentContextFactory, BaseDocumentContext } from './DocumentContext';

export const renderHeaderFooterHtml = (configJson?: string | ConfiguracaoLayoutHeaderFooter, isHeader: boolean = true): string => {
    if (!configJson) return '';

    let config: ConfiguracaoLayoutHeaderFooter;
    if (typeof configJson === 'string') {
        try {
            config = JSON.parse(configJson);
        } catch {
            return '';
        }
    } else {
        config = configJson;
    }

    if (!config || (!config.esquerda?.conteudo && !config.meio?.conteudo && !config.direita?.conteudo)) {
        return '';
    }

    const renderCol = (col?: { tipo: 'texto' | 'imagem'; conteudo: string; fontFamily?: string; fontSize?: string; color?: string; bold?: boolean; italic?: boolean; underline?: boolean; align?: string }, align: 'left' | 'center' | 'right' = 'left') => {
        if (!col || !col.conteudo) return '<div></div>';
        if (col.tipo === 'imagem') {
            return `<div style="text-align: ${align};"><img src="${col.conteudo}" alt="Imagem" style="max-height: 60px; max-width: 100%; object-fit: contain;" /></div>`;
        }
        const safeContent = (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function')
            ? DOMPurify.sanitize(col.conteudo)
            : col.conteudo;
        const effAlign = col.align || align;
        const effFontSize = col.fontSize ? `${col.fontSize}px` : '11px';
        const effColor = col.color || '#333';
        const effFamily = col.fontFamily || 'inherit';
        const fw = col.bold ? '700' : '400';
        const fs = col.italic ? 'italic' : 'normal';
        const td = col.underline ? 'underline' : 'none';
        return `<div style="text-align: ${effAlign}; font-size: ${effFontSize}; color: ${effColor}; font-family: ${effFamily}; font-weight: ${fw}; font-style: ${fs}; text-decoration: ${td}; line-height: 1.3; white-space: pre-line;">${safeContent}</div>`;
    };

    const borderStyle = isHeader 
        ? 'border-bottom: 2px solid #004d40; padding-bottom: 12px; margin-bottom: 20px;' 
        : 'border-top: 1px solid #ddd; padding-top: 12px; margin-top: 24px;';

    return `
        <div class="template-${isHeader ? 'header' : 'footer'}" style="display: flex; justify-content: space-between; align-items: center; width: 100%; ${borderStyle}">
            <div style="flex: 1; min-width: 0; padding-right: 10px;">${renderCol(config.esquerda, 'left')}</div>
            <div style="flex: 2; min-width: 0; padding: 0 10px; text-align: center;">${renderCol(config.meio, 'center')}</div>
            <div style="flex: 1; min-width: 0; padding-left: 10px; text-align: right;">${renderCol(config.direita, 'right')}</div>
        </div>
    `;
};

export const parseDocumentTemplate = (
    template: string, 
    data: Record<string, any>,
    tipoDocumento?: string | number | BaseDocumentContext
): string => {
    if (!template) return '';

    const context = DocumentContextFactory.getContext(tipoDocumento);
    let parsed = template;

    const tokenMap: Record<string, string> = {};

    const flattenObject = (obj: any, prefix = '') => {
        if (!obj || typeof obj !== 'object') return;
        for (const [key, val] of Object.entries(obj)) {
            const cleanKey = key.trim().toUpperCase();
            const fullKey = prefix ? `${prefix}.${cleanKey}` : cleanKey;
            
            if (val !== null && val !== undefined && typeof val !== 'object') {
                let strVal = String(val);

                const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
                const match = strVal.match(isoDateRegex);
                if (match) {
                    const [_, year, month, day, hour, minute, second] = match;
                    
                    const isDateOnlyField = cleanKey.includes('DATA') && !cleanKey.includes('HORA');

                    if (hour && !isDateOnlyField) {
                        if (hour === '00' && minute === '00' && (second === '00' || !second)) {
                            strVal = `${day}/${month}/${year}`;
                        } else {
                            strVal = `${day}/${month}/${year} ${hour}:${minute}`;
                        }
                    } else {
                        strVal = `${day}/${month}/${year}`;
                    }
                }

                tokenMap[fullKey] = strVal;
                tokenMap[cleanKey] = strVal;
            } else if (val && typeof val === 'object') {
                flattenObject(val, fullKey);
            }
        }
    };

    flattenObject(data);

    const getResolvedValue = (tokenName: string): string | null => {
        const key = tokenName.trim().toUpperCase();
        
        if (key.startsWith('FUN_')) {
            return context.resolveFun(key, data, tokenMap);
        }

        if (key in tokenMap && tokenMap[key] !== undefined) {
            return tokenMap[key];
        }

        if (key === 'INPUT_DATA_ENTRADA_AMBULATORIO') {
            return tokenMap['INPUT_DATA_ENTRADA_AMBULATORIO'] || tokenMap['DATAENTRADAAMBULATORIO'] || tokenMap['ALTA.DATAENTRADAAMBULATORIO'] || null;
        }
        if (key === 'INPUT_DATA_CLINICA') {
            return tokenMap['INPUT_DATA_CLINICA'] || tokenMap['DATAALTACLINICA'] || tokenMap['ALTA.DATAALTACLINICA'] || null;
        }
        if (key === 'INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO') {
            return tokenMap['INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO'] || tokenMap['PROCEDIMENTOSMEDICACOES'] || tokenMap['ALTA.PROCEDIMENTOSMEDICACOES'] || null;
        }
        if (key === 'INPUT_OBS_CLINICAS_ALTA') {
            return tokenMap['INPUT_OBS_CLINICAS_ALTA'] || tokenMap['OBSERVACOESCLINICAS'] || tokenMap['ALTA.OBSERVACOESCLINICAS'] || null;
        }
        if (key === 'INPUT_INSTALACAO_RETORNO') {
            return tokenMap['INPUT_INSTALACAO_RETORNO'] || tokenMap['INSTALACAORETORNO'] || tokenMap['ALTA.INSTALACAORETORNO'] || null;
        }

        if (key === 'INPUT_SINAIS_CLINICOS' || key === 'INPUT_SINAISCLINICOS') {
            return tokenMap['INPUT_SINAIS_CLINICOS'] || tokenMap['INPUT_SINAISCLINICOS'] || tokenMap['SINAISCLINICOS'] || tokenMap['EXAME.SINAISCLINICOS'] || null;
        }
        if (key === 'INPUT_SUSPEITA_CLINICA' || key === 'INPUT_SUSPEITACLINICA') {
            return tokenMap['INPUT_SUSPEITA_CLINICA'] || tokenMap['INPUT_SUSPEITACLINICA'] || tokenMap['SUSPEITACLINICA'] || tokenMap['EXAME.SUSPEITACLINICA'] || null;
        }
        if (key === 'INPUT_REGIAO_ANATOMICA' || key === 'INPUT_REGIAOANATOMICA') {
            return tokenMap['INPUT_REGIAO_ANATOMICA'] || tokenMap['INPUT_REGIAOANATOMICA'] || tokenMap['REGIAOANATOMICA'] || tokenMap['EXAME.REGIAOANATOMICA'] || null;
        }
        if (key === 'INPUT_OBSERVACOES_ADICIONAIS' || key === 'INPUT_OBSERVACOES' || key === 'INPUT_OBSERVACAO') {
            return tokenMap['INPUT_OBSERVACOES_ADICIONAIS'] || tokenMap['INPUT_OBSERVACOES'] || tokenMap['INPUT_OBSERVACAO'] || tokenMap['OBSERVACAO'] || tokenMap['OBSERVACOES'] || tokenMap['EXAME.OBSERVACAO'] || null;
        }
        if (key === 'INPUT_OUTROS_EXAME' || key === 'INPUT_EXAME_OUTROS' || key === 'INPUT_OUTROS') {
            return tokenMap['INPUT_OUTROS_EXAME'] || tokenMap['INPUT_EXAME_OUTROS'] || tokenMap['INPUT_OUTROS'] || tokenMap['OUTROSEXAME'] || tokenMap['EXAME.OUTROSEXAME'] || null;
        }

        if (key === 'INPUT_DATA_ENTRADA_QUARENTENA' || key === 'INPUT_DATAENTRADAQUARENTENA') {
            return tokenMap['INPUT_DATA_ENTRADA_QUARENTENA'] || tokenMap['INPUT_DATAENTRADAQUARENTENA'] || tokenMap['DATAENTRADAQUARENTENA'] || tokenMap['QUARENTENA.DATAENTRADAQUARENTENA'] || null;
        }
        if (key === 'INPUT_DATA_SAIDA_QUARENTENA' || key === 'INPUT_DATASAIDAQUARENTENA' || key === 'INPUT_DATA_LIBERACAO_QUARENTENA' || key === 'INPUT_DATALIBERACAOQUARENTENA') {
            return tokenMap['INPUT_DATA_SAIDA_QUARENTENA'] || tokenMap['INPUT_DATASAIDAQUARENTENA'] || tokenMap['INPUT_DATA_LIBERACAO_QUARENTENA'] || tokenMap['DATASAIDAQUARENTENA'] || tokenMap['QUARENTENA.DATASAIDAQUARENTENA'] || null;
        }
        if (key === 'INPUT_INSTALACAO_DESTINO' || key === 'INPUT_INSTALACAODESTINO') {
            return tokenMap['INPUT_INSTALACAO_DESTINO'] || tokenMap['INPUT_INSTALACAODESTINO'] || tokenMap['INSTALACAODESTINO'] || tokenMap['QUARENTENA.INSTALACAODESTINO'] || null;
        }
        if (key === 'INPUT_OBSERVACOES_QUARENTENA' || key === 'INPUT_OBSERVACOESQUARENTENA') {
            return tokenMap['INPUT_OBSERVACOES_QUARENTENA'] || tokenMap['INPUT_OBSERVACOESQUARENTENA'] || tokenMap['OBSERVACOESQUARENTENA'] || tokenMap['QUARENTENA.OBSERVACOES'] || null;
        }

        const strippedKey = key.replace(/^(INPUT_|FUN_)/, '');
        if (strippedKey !== key && strippedKey in tokenMap && tokenMap[strippedKey] !== undefined) {
            return tokenMap[strippedKey];
        }

        return null;
    };

    parsed = parsed
        .replace(/[☐☒]\s*(\[FUN_CHECK_[A-Za-z0-9_]+\])/gi, '$1')
        .replace(/\[FUN_CHECK_OUTROS\s+Outros/gi, '[FUN_CHECK_OUTROS] Outros')
        .replace(/\[FUN_CHECK_ULTRASSONOGRAFIA\]\s*(Radiografia(?:\s*\(Raio-X\))?)/gi, '[FUN_CHECK_RADIOGRAFIA] $1')
        .replace(/☐\s*(Hemograma\s*completo)\s*(\[FUN_CHECK_HEMOGRAMA\])/gi, '$2 $1')
        .replace(/☐\s*(Ultrassonografia)\s*(\[FUN_CHECK_ULTRASSONOGRAFIA\])/gi, '$2 $1')
        .replace(/☐\s*(Radiografia(?:\s*\(Raio-X\))?)\s*(\[FUN_CHECK_RADIOGRAFIA\]|\[FUN_CHECK_ULTRASSONOGRAFIA\])/gi, '[FUN_CHECK_RADIOGRAFIA] $1')
        .replace(/☐\s*(Outros:?)\s*(\[FUN_CHECK_OUTROS\])/gi, '$2 $1');

    // Nota: substituição de checkboxes é feita via tokens FUN_CHECK_* e FUN_EXAMES_SOLICITADOS
    // resolvidos pelo SolicitacaoExameDocumentContext.resolveFun, que recebe data.tiposExame (array).

    // Substitui tokens no formato [FUN_*] ou [INPUT_*]
    // Preserva qualquer estilização (font-size, color, font-family, negrito, etc.) aplicada dentro ou ao redor do token
    const tokenRegex = /(?:\[|&#91;)((?:(?!\]|&#93;).)*?)(?:\]|&#93;)/gis;

    parsed = parsed.replace(tokenRegex, (fullMatch, innerContent) => {
        const cleanTokenName = innerContent.replace(/<[^>]+>/g, '').trim().toUpperCase();
        
        // Verifica se é um token de comando/variável do sistema ou campo manual
        if (!cleanTokenName.startsWith('FUN_') && !cleanTokenName.startsWith('INPUT_')) {
            return fullMatch; // Mantém texto entre colchetes que não seja variável
        }

        const value = getResolvedValue(cleanTokenName);
        
        if (value === undefined || value === null || value === '') {
            return '';
        }

        const formattedValue = String(value).replace(/\r\n|\n/g, '<br/>');

        // Se o conteúdo interno não possui tags HTML adicionais, substitui diretamente
        if (!/<[^>]+>/.test(innerContent)) {
            return formattedValue;
        }

        // Se havia tags HTML dentro dos colchetes (ex: [<span style="font-size: 24px;">FUN_NOME</span>]),
        // substitui o texto do token preservando as tags HTML circundantes (font-size, color, etc.)
        const tokenTextRegex = new RegExp(cleanTokenName.replace(/_/g, '[_\\s]*'), 'i');
        if (tokenTextRegex.test(innerContent)) {
            return innerContent.replace(tokenTextRegex, formattedValue);
        }

        // Caso as tags estejam dividindo o token ou em estrutura fragmentada, extrai os estilos e wrappers
        const styles: string[] = [];
        const styleMatches = innerContent.matchAll(/style=["']([^"']*)["']/gi);
        for (const sm of styleMatches) {
            if (sm[1]?.trim()) styles.push(sm[1].trim().replace(/;+$/, ''));
        }

        const isBold = /<(b|strong)\b/i.test(innerContent);
        const isItalic = /<(i|em)\b/i.test(innerContent);
        const isUnderline = /<u\b/i.test(innerContent);
        const isStrike = /<(s|strike|del)\b/i.test(innerContent);

        let result = formattedValue;
        if (isBold) result = `<strong>${result}</strong>`;
        if (isItalic) result = `<em>${result}</em>`;
        if (isUnderline) result = `<u>${result}</u>`;
        if (isStrike) result = `<s>${result}</s>`;
        if (styles.length > 0) {
            result = `<span style="${styles.join('; ')}">${result}</span>`;
        }

        return result;
    });

    // Substitui tokens legados {{...}} preservando estilos internos
    parsed = parsed.replace(/{{((?:(?!}}).)*?)}}/gis, (fullMatch, innerContent) => {
        const cleanKey = innerContent.replace(/<[^>]+>/g, '').trim().toUpperCase();
        const val = getResolvedValue(cleanKey);
        if (val !== undefined && val !== null && val !== '') {
            const formattedValue = String(val).replace(/\r\n|\n/g, '<br/>');
            if (!/<[^>]+>/.test(innerContent)) {
                return formattedValue;
            }
            const tokenTextRegex = new RegExp(cleanKey.replace(/_/g, '[_\\s]*'), 'i');
            if (tokenTextRegex.test(innerContent)) {
                return innerContent.replace(tokenTextRegex, formattedValue);
            }
            return formattedValue;
        }
        return fullMatch;
    });

    // Converte Markdown simples se não for HTML rico
    if (!parsed.includes('<p>') && !parsed.includes('<div>') && !parsed.includes('<br>')) {
        parsed = parsed.replace(/^#\s*(.+)$/gm, '<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #111;">$1</h2>');
        parsed = parsed.replace(/^##\s*(.+)$/gm, '<h3 style="font-size: 15px; font-weight: bold; margin-top: 10px; margin-bottom: 8px; color: #222;">$1</h3>');
        parsed = parsed.split('\n\n').map(p => `<p style="margin-bottom: 12px; line-height: 1.6; font-size: 13px; color: #333;">${p.replace(/\n/g, '<br/>')}</p>`).join('');
    }

    if (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
        return DOMPurify.sanitize(parsed, {
            ADD_TAGS: ['style'],
            ADD_ATTR: ['style', 'target']
        });
    }

    return parsed;
};

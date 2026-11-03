import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, FileDown, Eye } from "lucide-react";
import { parseDocumentTemplate, renderHeaderFooterHtml } from "@/utils/DocumentParser";
import { modeloDocumentoService, TipoDocumento, type ModeloDocumentoVm } from "@/services/ModeloDocumentoService";

interface DocumentoViewerProps {
    tipoDocumento: TipoDocumento;
    dados: Record<string, any>;
    customTemplate?: string;
    onReady?: (fullHtml: string) => void; 
}

export function DocumentoViewer({ tipoDocumento, dados, customTemplate, onReady }: DocumentoViewerProps) {
    const [fullHtml, setFullHtml] = useState<string>('');
    const [modelo, setModelo] = useState<ModeloDocumentoVm | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        const fetchModelo = async () => {
            try {
                setLoading(true);
                setError(null);
                const mod = await modeloDocumentoService.getByTipo(tipoDocumento);
                setModelo(mod);
            } catch (err) {
                console.error("Erro ao carregar modelo:", err);
                setError("Erro ao carregar o modelo de documento.");
            } finally {
                setLoading(false);
            }
        };

        if (!customTemplate) {
            fetchModelo();
        } else {
            setLoading(false);
        }
    }, [tipoDocumento, customTemplate]);

    useEffect(() => {
        if (loading || error) return;
        
        const templateBody = customTemplate || modelo?.conteudo;
        
        if (templateBody) {
            const headerHtml = renderHeaderFooterHtml(modelo?.headerTemplate?.configuracaoLayoutJson, true);
            const bodyHtml = templateBody; // não processa aqui ainda
            const footerHtml = renderHeaderFooterHtml(modelo?.footerTemplate?.configuracaoLayoutJson, false);

            const combinedRaw = `
                <div class="document-page" style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a202c; padding: 24px 32px; background: #fff; line-height: 1.6; min-height: 100%;">
                    ${headerHtml}
                    <div class="document-body" style="margin: 24px 0; font-size: 13px;">
                        ${bodyHtml}
                    </div>
                    ${footerHtml}
                </div>
            `;

            // Processa todas as variáveis (incluindo as que estiverem no Header/Footer)
            // Passa tipoDocumento para o DocumentContextFactory selecionar o contexto certo (ex: SolicitacaoExameDocumentContext)
            const combined = parseDocumentTemplate(combinedRaw, dados, tipoDocumento);

            setFullHtml(combined);
            if (onReady) onReady(combined);
        } else if (!customTemplate && !modelo?.conteudo) {
            setError("Modelo de documento ativo não encontrado para este tipo de atendimento.");
        }
    }, [modelo, JSON.stringify(dados), customTemplate, loading, error]);

    const handlePrint = () => {
        if (!fullHtml) return;

        // Cria ou reutiliza um iframe invisível para impressão limpa sem afetar o DOM principal
        let iframe = iframeRef.current;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
            iframeRef.current = iframe;
        }

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${modelo?.nome || "Documento Clínico"}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm 15mm 15mm 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        color: #111;
                        background: #fff;
                    }
                    .document-page {
                        padding: 0 !important;
                    }
                    ul {
                        list-style-type: disc !important;
                        padding-left: 24px !important;
                        margin: 8px 0 !important;
                    }
                    ol {
                        list-style-type: decimal !important;
                        padding-left: 24px !important;
                        margin: 8px 0 !important;
                    }
                    li {
                        display: list-item !important;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${fullHtml}
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        doc.close();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border rounded-md text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
                <span>Montando documento e substituindo variáveis...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md text-red-700">
                <p className="font-semibold">{error}</p>
                <p className="text-xs text-red-500 mt-1">Configure o template correspondente no menu de Administração.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-lg border gap-3">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                        Template: <span className="font-bold text-gray-900">{modelo?.nome || "Padrão"}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePrint()
                        }}
                        variant="outline"
                        className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 shadow-sm"
                        size="sm"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Salvar (Download)
                    </Button>
                    <Button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePrint()
                        }}
                        className="bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
                        size="sm"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
            </div>
            
            {/* Folha A4 Simulação Visual */}
            <div className="flex justify-center bg-zinc-900/90 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto border border-zinc-800">
                <div 
                    className="document-paper-sheet bg-white text-slate-900 shadow-lg rounded-sm w-full max-w-[800px] min-h-[900px] transition-all border border-slate-200"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    dangerouslySetInnerHTML={{ __html: fullHtml }} 
                />
            </div>
        </div>
    );
}

export { DocumentoClinicoModal } from "./DocumentoClinicoModal";


import React, { useRef, useMemo, useState, useCallback } from 'react';
import JoditEditor from 'jodit-react';
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Copy, Check, Info, BookOpen, X, Plus, CornerDownLeft, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { DocumentContextFactory } from '@/utils/DocumentContext';

interface DocumentEditorProps {
    value: string;
    onChange: (value: string) => void;
    tipoDocumento?: string | number;
    placeholders?: {
        category: string;
        items: { key: string; label: string; isFunction?: boolean }[];
    }[];
}

export function DocumentEditor({ value, onChange, tipoDocumento, placeholders }: DocumentEditorProps) {
    const activePlaceholders = useMemo(() => {
        if (placeholders) return placeholders;
        const context = DocumentContextFactory.getContext(tipoDocumento);
        return context.getAvailablePlaceholders();
    }, [placeholders, tipoDocumento]);

    const editorRef = useRef<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "fun" | "input">("all");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [customInputName, setCustomInputName] = useState("");
    const [customFunName, setCustomFunName] = useState("");

    const generatedInputTag = useMemo(() => {
        if (!customInputName.trim()) return "";
        const sanitized = customInputName.trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Za-z0-9\s_]/g, "")
            .trim()
            .replace(/\s+/g, '_');
        return sanitized ? `[INPUT_${sanitized}]` : "";
    }, [customInputName]);

    const generatedFunTag = useMemo(() => {
        if (!customFunName.trim()) return "";
        const sanitized = customFunName.trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Za-z0-9\s_]/g, "")
            .trim()
            .replace(/\s+/g, '_');
        return sanitized ? `[FUN_${sanitized}]` : "";
    }, [customFunName]);

    const handleCopy = (tagText: string, keyName: string, e?: React.SyntheticEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!tagText) return;
        navigator.clipboard.writeText(tagText);
        setCopiedKey(keyName);
        toast.success(`Copiado "${tagText}" para a área de transferência!`);
        setTimeout(() => {
            setCopiedKey(null);
        }, 2000);
    };

    const handleInsert = (tagText: string, e?: React.SyntheticEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!tagText) return;
        
        try {
            const editor = editorRef.current;
            if (editor) {
                if (typeof editor.selection?.insertHTML === 'function') {
                    editor.selection.insertHTML(tagText);
                } else if (typeof editor.insertHTML === 'function') {
                    editor.insertHTML(tagText);
                } else if (editor.editor?.selection?.insertHTML) {
                    editor.editor.selection.insertHTML(tagText);
                } else if (typeof editor.selection?.insertNode === 'function') {
                    const textNode = document.createTextNode(tagText);
                    editor.selection.insertNode(textNode);
                }
                
                const newContent = editor.value ?? (editor.editor?.value ?? '');
                if (newContent) {
                    onChange(newContent);
                }
                toast.success(`Inserido "${tagText}" no editor!`);
                setIsModalOpen(false);
                return;
            }
        } catch (err) {
            console.error("Erro ao inserir tag no editor:", err);
        }
        
        handleCopy(tagText, tagText);
    };

    const config = useMemo(() => {
        return {
            readonly: false,
            disabled: false,
            placeholder: 'Comece a digitar o conteúdo do documento...',
            height: 500,
            minHeight: 400,
            toolbarAdaptive: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            enableDragAndDropFileToEditor: true,
            askBeforePasteHTML: false,
            askBeforePasteFromWord: false,
            defaultActionOnPaste: 'insert_as_html',
            processPasteHTML: true,
            allowPasteHTML: true,
            allowPasteImage: true,
            uploader: {
                insertImageAsBase64URI: true
            },
            controls: {
                insertCampo: {
                    name: 'insertCampo',
                    text: 'Guia de Variáveis',
                    tooltip: 'Ver lista de variáveis do sistema e campos manuais (com opção de inserir e copiar)',
                    exec: () => {
                        setIsModalOpen(true);
                    }
                },
                fontsize: {
                    list: [
                        '8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '48', '72'
                    ]
                },
                font: {
                    list: {
                        "'Segoe UI', Arial, sans-serif": 'Segoe UI',
                        "Arial, Helvetica, sans-serif": 'Arial',
                        "'Times New Roman', Times, serif": 'Times New Roman',
                        "'Courier New', Courier, monospace": 'Courier New',
                        "Georgia, serif": 'Georgia',
                        "Tahoma, Geneva, sans-serif": 'Tahoma',
                        "Verdana, Geneva, sans-serif": 'Verdana'
                    }
                }
            },
            buttons: [
                'insertCampo', '|',
                'source', '|',
                'bold', 'strikethrough', 'underline', 'italic', '|',
                'superscript', 'subscript', '|',
                'ul', 'ol', '|',
                'outdent', 'indent', '|',
                'font', 'fontsize', 'brush', 'paragraph', '|',
                'image', 'table', 'link', '|',
                'align', 'undo', 'redo', '|',
                'cut', 'copy', 'paste', 'selectall', '|',
                'hr', 'eraser', 'copyformat', '|',
                'fullsize'
            ]
        };
    }, []);

    const allItems = useMemo(() => {
        return activePlaceholders.flatMap(p => 
            p.items.map(i => ({
                ...i,
                category: p.category,
                isInput: i.key.startsWith('INPUT_') || (!i.isFunction && !i.key.startsWith('FUN_'))
            }))
        );
    }, [activePlaceholders]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesSearch = 
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (filterType === "fun") return !item.isInput;
            if (filterType === "input") return item.isInput;
            return true;
        });
    }, [allItems, searchTerm, filterType]);

    return (
        <div className="flex flex-col gap-4">
            <style>{`
                .jodit-toolbar-button_insertCampo button {
                    background-color: #059669 !important;
                    color: white !important;
                    border-radius: 4px !important;
                    padding: 2px 10px !important;
                    font-weight: 600 !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
                    margin-right: 8px !important;
                }
                .jodit-toolbar-button_insertCampo button:hover {
                    background-color: #047857 !important;
                }
                .jodit-toolbar-button_insertCampo svg {
                    fill: white !important;
                }
                .jodit-wysiwyg ul,
                .jodit-wysiwyg ol {
                    padding-left: 2rem !important;
                    margin: 0.5rem 0 !important;
                }
                .jodit-wysiwyg ul {
                    list-style-type: disc !important;
                }
                .jodit-wysiwyg ol {
                    list-style-type: decimal !important;
                }
                .jodit-wysiwyg li {
                    display: list-item !important;
                    list-style-position: outside !important;
                }
                /* Área de edição do documento estritamente branca com texto preto de alto contraste */
                .jodit-container,
                .jodit-workplace,
                .jodit-wysiwyg,
                .jodit-wysiwyg_iframe {
                    background-color: #ffffff !important;
                    background: #ffffff !important;
                    color: #1a1a1a !important;
                }
                .jodit-wysiwyg,
                .jodit-wysiwyg * {
                    color: #1a1a1a !important;
                    --tw-text-opacity: 1 !important;
                }
                .jodit-wysiwyg p,
                .jodit-wysiwyg span,
                .jodit-wysiwyg div,
                .jodit-wysiwyg td,
                .jodit-wysiwyg th,
                .jodit-wysiwyg li {
                    color: #1a1a1a !important;
                }
                .jodit-placeholder {
                    color: #71717a !important;
                }
            `}</style>    

            <div className="border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                <JoditEditor
                    ref={editorRef}
                    value={value}
                    config={config}
                    onBlur={(newContent) => onChange(newContent)}
                />
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsModalOpen(false)}
                    />
                    
                    <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-100">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-800">
                                <BookOpen className="w-5 h-5" />
                                Guia de Variáveis e Gerador de Campos
                            </h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
                            {/* Geradores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Gerador FUN */}
                                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2 flex flex-col justify-between">
                                    <div>
                                        <label className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                            Novo Comando FUN (Sistema):
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ex: NOME_COMPLETO_USUARIO..."
                                            value={customFunName}
                                            onChange={(e) => setCustomFunName(e.target.value)}
                                            className="h-8 text-xs bg-white border-emerald-300"
                                        />
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        <Button
                                            type="button"
                                            disabled={!generatedFunTag}
                                            onClick={(e) => handleInsert(generatedFunTag, e)}
                                            className="h-7 text-xs px-2.5 flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Inserir
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={!generatedFunTag}
                                            variant="outline"
                                            onClick={(e) => handleCopy(generatedFunTag, "CUSTOM_FUN_MODAL", e)}
                                            className="h-7 text-xs px-2.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                        >
                                            {copiedKey === "CUSTOM_FUN_MODAL" ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                            {copiedKey === "CUSTOM_FUN_MODAL" ? "Copiado" : "Copiar"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Gerador INPUT */}
                                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2 flex flex-col justify-between">
                                    <div>
                                        <label className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                                            <Plus className="w-3.5 h-3.5 text-blue-700" />
                                            Novo Campo Manual (INPUT):
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ex: Pressao_Arterial..."
                                            value={customInputName}
                                            onChange={(e) => setCustomInputName(e.target.value)}
                                            className="h-8 text-xs bg-white border-blue-300"
                                        />
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        <Button
                                            type="button"
                                            disabled={!generatedInputTag}
                                            onClick={(e) => handleInsert(generatedInputTag, e)}
                                            className="h-7 text-xs px-2.5 flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Inserir
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={!generatedInputTag}
                                            variant="outline"
                                            onClick={(e) => handleCopy(generatedInputTag, "CUSTOM_INPUT_MODAL", e)}
                                            className="h-7 text-xs px-2.5 border-blue-300 text-blue-800 hover:bg-blue-100"
                                        >
                                            {copiedKey === "CUSTOM_INPUT_MODAL" ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                            {copiedKey === "CUSTOM_INPUT_MODAL" ? "Copiado" : "Copiar"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Filtros e Busca */}
                            <div className="flex flex-col sm:flex-row gap-2 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Pesquisar por nome, tag ou categoria..."
                                        className="pl-9 bg-gray-50 border-gray-200 text-xs h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setFilterType("all")}
                                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                            filterType === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        Todos ({allItems.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterType("fun")}
                                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                            filterType === "fun" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        Comandos FUN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterType("input")}
                                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                                            filterType === "input" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        Campos INPUT
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Variáveis */}
                            <div className="flex flex-col gap-2 max-h-[38vh] overflow-y-auto pr-1">
                                {filteredItems.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">Nenhuma variável encontrada para esta busca.</p>
                                ) : (
                                    filteredItems.map(item => {
                                        const tagStr = `[${item.key}]`;
                                        const isCopied = copiedKey === item.key;
                                        const isFun = !item.isInput;

                                        return (
                                            <div
                                                key={item.key}
                                                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                                                    isFun 
                                                        ? 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40'
                                                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40'
                                                }`}
                                            >
                                                <div className="flex flex-col min-w-0 pr-3">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-semibold text-gray-900">{item.label}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                                            isFun ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {isFun ? 'FUN' : 'INPUT'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 hidden sm:inline">({item.category})</span>
                                                    </div>
                                                    <span className={`text-xs font-mono font-semibold ${
                                                        isFun ? 'text-emerald-700' : 'text-blue-700'
                                                    }`}>
                                                        {tagStr}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={(e) => handleInsert(tagStr, e)}
                                                        className={`h-7 px-2.5 text-xs text-white ${
                                                            isFun ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'
                                                        }`}
                                                        title="Inserir diretamente no editor na posição do cursor"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                                        Inserir
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => handleCopy(tagStr, item.key, e)}
                                                        className={`h-7 px-2.5 text-xs ${
                                                            isCopied
                                                                ? 'bg-gray-800 text-white border-gray-800'
                                                                : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                        title="Copiar código para a área de transferência"
                                                    >
                                                        {isCopied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                                        {isCopied ? "Copiado!" : "Copiar"}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

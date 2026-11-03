import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConfiguracaoLayoutHeaderFooter, LayoutSectionConfig } from '@/services/ModeloDocumentoService';

interface HeaderFooterEditorProps {
    value?: string;
    onChange: (jsonValue: string) => void;
    isHeader?: boolean;
}

const FONT_FAMILIES: { value: string; label: string }[] = [
    { value: "'Segoe UI', Arial, sans-serif", label: "Segoe UI" },
    { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
    { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
];

const FONT_SIZES = ['8','9','10','11','12','14','16','18','20','22','24','28','32','36','48','72'];

const defaultLayout: ConfiguracaoLayoutHeaderFooter = {
    esquerda: { tipo: 'texto', conteudo: '' },
    meio: { tipo: 'texto', conteudo: '' },
    direita: { tipo: 'texto', conteudo: '' },
};

export function HeaderFooterEditor({ value, onChange, isHeader = true }: HeaderFooterEditorProps) {
    const layout: ConfiguracaoLayoutHeaderFooter = React.useMemo(() => {
        if (!value) return defaultLayout;
        try {
            return { ...defaultLayout, ...JSON.parse(value) };
        } catch {
            return defaultLayout;
        }
    }, [value]);

    const updateCol = (colKey: keyof ConfiguracaoLayoutHeaderFooter, field: keyof LayoutSectionConfig, val: string | boolean) => {
        const updated = {
            ...layout,
            [colKey]: {
                ...layout[colKey],
                [field]: val
            }
        };
        onChange(JSON.stringify(updated));
    };

    const handleImageUpload = (colKey: keyof ConfiguracaoLayoutHeaderFooter, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                updateCol(colKey, 'conteudo', reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const renderColumnEditor = (colKey: keyof ConfiguracaoLayoutHeaderFooter, title: string) => {
        const col = layout[colKey] || { tipo: 'texto', conteudo: '' };

        return (
            <div className="border rounded-md p-4 bg-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <Label className="font-semibold text-sm">{title}</Label>
                    <Select
                        value={col.tipo}
                        onValueChange={(val: 'texto' | 'imagem') => updateCol(colKey, 'tipo', val)}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="imagem">Imagem</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {col.tipo === 'texto' ? (
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs text-gray-500 mb-1 block">Conteúdo do Texto</Label>
                            <Textarea
                                rows={4}
                                value={col.conteudo}
                                onChange={(e) => updateCol(colKey, 'conteudo', e.target.value)}
                                placeholder="Ex: UNIVERSIDADE CATÓLICA DOM BOSCO&#10;Biotério Central"
                                className="text-xs bg-white"
                                style={{
                                    fontFamily: (col as any).fontFamily || undefined,
                                    fontSize: (col as any).fontSize ? `${(col as any).fontSize}px` : undefined,
                                    color: (col as any).color || undefined,
                                    fontWeight: (col as any).bold ? '700' : undefined,
                                    fontStyle: (col as any).italic ? 'italic' : undefined,
                                    textDecoration: (col as any).underline ? 'underline' : undefined,
                                    textAlign: (col as any).align as any || undefined,
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-[11px] text-gray-500 mb-1 block">Fonte</Label>
                                <Select value={(col as any).fontFamily || "'Segoe UI', Arial, sans-serif"} onValueChange={(v) => updateCol(colKey, 'fontFamily', v)}>
                                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {FONT_FAMILIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-[11px] text-gray-500 mb-1 block">Tamanho (px)</Label>
                                <Select value={(col as any).fontSize || "11"} onValueChange={(v) => updateCol(colKey, 'fontSize', v)}>
                                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {FONT_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-[11px] text-gray-500 mb-1 block">Cor</Label>
                                <div className="flex gap-2 items-center">
                                    <Input type="color" value={(col as any).color || "#333333"} onChange={(e) => updateCol(colKey, 'color', e.target.value)} className="h-8 w-12 p-1 bg-white" />
                                    <Input type="text" value={(col as any).color || "#333333"} onChange={(e) => updateCol(colKey, 'color', e.target.value)} placeholder="#333333" className="h-8 text-xs bg-white flex-1" />
                                </div>
                            </div>
                            <div>
                                <Label className="text-[11px] text-gray-500 mb-1 block">Alinhamento</Label>
                                <Select value={(col as any).align || (colKey === 'esquerda' ? 'left' : colKey === 'direita' ? 'right' : 'center')} onValueChange={(v) => updateCol(colKey, 'align', v)}>
                                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="center">Centro</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                        <SelectItem value="justify">Justificado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-[11px] text-gray-500 mb-1 block">Estilo</Label>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => updateCol(colKey, 'bold', !((col as any).bold))} className={`flex-1 h-8 rounded border text-sm font-bold ${ (col as any).bold ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-300 text-gray-700'}`}>B</button>
                                <button type="button" onClick={() => updateCol(colKey, 'italic', !((col as any).italic))} className={`flex-1 h-8 rounded border text-sm italic ${ (col as any).italic ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-300 text-gray-700'}`}>I</button>
                                <button type="button" onClick={() => updateCol(colKey, 'underline', !((col as any).underline))} className={`flex-1 h-8 rounded border text-sm underline ${ (col as any).underline ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-300 text-gray-700'}`}>U</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500 mb-1 block">URL da Imagem ou Upload</Label>
                        <Input
                            type="text"
                            placeholder="https://... ou cole a imagem"
                            value={col.conteudo?.startsWith('data:') ? '(Imagem carregada)' : col.conteudo}
                            onChange={(e) => updateCol(colKey, 'conteudo', e.target.value)}
                            className="text-xs bg-white"
                        />
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-xs hover:bg-gray-50 transition-colors shadow-sm">
                                <span>Selecionar Arquivo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleImageUpload(colKey, f);
                                    }}
                                />
                            </label>
                            {col.conteudo && (
                                <button
                                    type="button"
                                    onClick={() => updateCol(colKey, 'conteudo', '')}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                        {col.conteudo && (
                            <div className="mt-2 border rounded p-2 bg-white flex justify-center max-h-24 overflow-hidden">
                                <img src={col.conteudo} alt="Preview" className="max-h-20 object-contain" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const getPreviewStyle = (col: LayoutSectionConfig, fallbackAlign: 'left' | 'center' | 'right'): React.CSSProperties => ({
        fontFamily: (col as any).fontFamily || undefined,
        fontSize: (col as any).fontSize ? `${(col as any).fontSize}px` : undefined,
        color: (col as any).color || undefined,
        fontWeight: (col as any).bold ? 700 : undefined,
        fontStyle: (col as any).italic ? 'italic' : undefined,
        textDecoration: (col as any).underline ? 'underline' : undefined,
        textAlign: ((col as any).align || fallbackAlign) as any,
        whiteSpace: 'pre-line' as const,
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderColumnEditor('esquerda', 'Layout Esquerda')}
                {renderColumnEditor('meio', 'Layout Meio')}
                {renderColumnEditor('direita', 'Layout Direita')}
            </div>

            {/* Live Preview */}
            <div className="mt-4 border border-slate-200 rounded-md p-4 bg-white shadow-sm document-header-preview" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Pré-visualização do {isHeader ? 'Cabeçalho' : 'Rodapé'}
                </Label>
                <div 
                    className={`flex justify-between items-center py-2 px-4 rounded-sm ${isHeader ? 'border-b-2 border-emerald-800' : 'border-t border-slate-300'}`}
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                >
                    <div className="flex-1 text-left" style={getPreviewStyle(layout.esquerda, 'left')}>
                        {layout.esquerda.tipo === 'imagem' && layout.esquerda.conteudo ? (
                            <img src={layout.esquerda.conteudo} alt="" className="max-h-12 object-contain" />
                        ) : (
                            <span className="text-xs whitespace-pre-line" style={getPreviewStyle(layout.esquerda, 'left')}>{layout.esquerda.conteudo || <span className="text-slate-400 italic">Esquerda</span>}</span>
                        )}
                    </div>
                    <div className="flex-1 text-center" style={getPreviewStyle(layout.meio, 'center')}>
                        {layout.meio.tipo === 'imagem' && layout.meio.conteudo ? (
                            <img src={layout.meio.conteudo} alt="" className="max-h-12 object-contain mx-auto" />
                        ) : (
                            <span className="text-xs whitespace-pre-line font-medium" style={getPreviewStyle(layout.meio, 'center')}>{layout.meio.conteudo || <span className="text-slate-400 italic">Meio</span>}</span>
                        )}
                    </div>
                    <div className="flex-1 text-right" style={getPreviewStyle(layout.direita, 'right')}>
                        {layout.direita.tipo === 'imagem' && layout.direita.conteudo ? (
                            <img src={layout.direita.conteudo} alt="" className="max-h-12 object-contain ml-auto" />
                        ) : (
                            <span className="text-xs whitespace-pre-line" style={getPreviewStyle(layout.direita, 'right')}>{layout.direita.conteudo || <span className="text-slate-400 italic">Direita</span>}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

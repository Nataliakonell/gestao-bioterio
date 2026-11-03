import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseDocumentTemplate, renderHeaderFooterHtml } from "@/utils/DocumentParser"
import { Eye, Edit3 } from "lucide-react"
import { FormLayoutBase } from "@/components/formulario-registro/CadastroRegistroForm"
import { 
    modeloDocumentoService, 
    TipoSecaoTemplate, 
    TipoDocumento, 
    type ModeloDocumentoVm,
    type CreateModeloDocumentoCommand, 
    type UpdateModeloDocumentoCommand 
} from "@/services/ModeloDocumentoService"
import { DocumentEditor } from "./DocumentEditor"
import { HeaderFooterEditor } from "./HeaderFooterEditor"
import { usePermissions } from "@/contexts/PermissionsContext"

export default function EdicaoModeloDocumento() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const isNew = !id || id === "novo"
    const initialSecao = Number(searchParams.get("tipoSecao")) || TipoSecaoTemplate.Body
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Modelo de documento", "Editar")

    const [loading, setLoading] = useState(!isNew)
    const [headersList, setHeadersList] = useState<ModeloDocumentoVm[]>([])
    const [footersList, setFootersList] = useState<ModeloDocumentoVm[]>([])

    const [editorTab, setEditorTab] = useState<string>("editor")

    const [formData, setFormData] = useState({
        nome: "",
        tipoSecao: initialSecao.toString(),
        tipoDocumento: TipoDocumento.AltaAmbulatorial.toString(),
        conteudo: "",
        headerTemplateId: "",
        footerTemplateId: "",
        configuracaoLayoutJson: "",
        ativo: true
    })

    const [initialFormData, setInitialFormData] = useState(formData)

    useEffect(() => {
        Promise.all([
            modeloDocumentoService.getAll(TipoSecaoTemplate.Header),
            modeloDocumentoService.getAll(TipoSecaoTemplate.Footer)
        ]).then(([headers, footers]) => {
            setHeadersList(headers.filter(h => h.ativo));
            setFootersList(footers.filter(f => f.ativo));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!isNew) {
            modeloDocumentoService.getById(Number(id)).then(modelo => {
                if (modelo) {
                    const loadedData = {
                        nome: modelo.nome,
                        tipoSecao: (modelo.tipoSecao || TipoSecaoTemplate.Body).toString(),
                        tipoDocumento: (modelo.tipoDocumento || TipoDocumento.AltaAmbulatorial).toString(),
                        conteudo: modelo.conteudo || "",
                        headerTemplateId: modelo.headerTemplateId ? modelo.headerTemplateId.toString() : "",
                        footerTemplateId: modelo.footerTemplateId ? modelo.footerTemplateId.toString() : "",
                        configuracaoLayoutJson: modelo.configuracaoLayoutJson || "",
                        ativo: modelo.ativo
                    };
                    setFormData(loadedData);
                    setInitialFormData(loadedData);
                } else {
                    toast.error("Modelo não encontrado");
                    navigate("/admin/modelos");
                }
            }).catch(() => {
                toast.error("Erro ao buscar modelo");
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [id, isNew, navigate]);

    const set = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const checkIsDirty = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialFormData);
    }

    const handleSubmit = async () => {
        if (!canEdit) {
            toast.error("Você não tem permissão para salvar alterações.")
            return false
        }

        if (!formData.nome.trim()) {
            toast.error("O nome do modelo é obrigatório.");
            return false;
        }

        const tipoSecaoNum = Number(formData.tipoSecao);

        if (tipoSecaoNum === TipoSecaoTemplate.Body && !formData.conteudo.trim()) {
            toast.error("O conteúdo do documento não pode estar vazio.");
            return false;
        }

        try {
            const payload: CreateModeloDocumentoCommand = {
                nome: formData.nome,
                tipoSecao: tipoSecaoNum,
                tipoDocumento: tipoSecaoNum === TipoSecaoTemplate.Body ? Number(formData.tipoDocumento) : TipoDocumento.Geral,
                conteudo: tipoSecaoNum === TipoSecaoTemplate.Body ? formData.conteudo : undefined,
                headerTemplateId: tipoSecaoNum === TipoSecaoTemplate.Body && formData.headerTemplateId ? Number(formData.headerTemplateId) : undefined,
                footerTemplateId: tipoSecaoNum === TipoSecaoTemplate.Body && formData.footerTemplateId ? Number(formData.footerTemplateId) : undefined,
                configuracaoLayoutJson: tipoSecaoNum !== TipoSecaoTemplate.Body ? formData.configuracaoLayoutJson : undefined,
                ativo: formData.ativo
            };

            if (isNew) {
                await modeloDocumentoService.create(payload);
                toast.success("Modelo criado com sucesso!");
            } else {
                const updatePayload: UpdateModeloDocumentoCommand = {
                    id: Number(id),
                    ...payload
                };
                await modeloDocumentoService.update(updatePayload);
                toast.success("Modelo atualizado com sucesso!");
            }
            navigate("/admin/modelos");
            return true;
        } catch (error) {
            toast.error("Erro ao salvar modelo.");
            return false;
        }
    }

    const tipoSecaoAtual = Number(formData.tipoSecao);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-white">
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Configurações"
                            breadcrumbUrl="/admin/modelos"
                            title={isNew ? "Novo Modelo de Documento" : "Editar Modelo"}
                        />
                    </HeaderContainer>

                    {loading ? (
                        <div className="flex justify-center p-8 text-gray-500">Carregando...</div>
                    ) : (
                        <FormLayoutBase
                            titleFirstSection="Configurações do Modelo"
                            submitLabel="Salvar Modelo"
                            onSubmit={canEdit ? handleSubmit : undefined}
                            onCancel={() => navigate("/admin/modelos")}
                            checkIsDirty={checkIsDirty}
                            columnsClassName="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6"
                            extraSections={
                                <div className="col-span-12 mt-6">
                                    {tipoSecaoAtual === TipoSecaoTemplate.Body ? (
                                        <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
                                            <div className="flex justify-between items-center mb-3">
                                                <Label className="text-base font-semibold">Corpo do Documento</Label>
                                                <TabsList className="bg-gray-100 p-1">
                                                    <TabsTrigger value="editor" className="flex items-center gap-1.5 text-xs">
                                                        <Edit3 className="h-3.5 w-3.5" /> Editor
                                                    </TabsTrigger>
                                                    <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs">
                                                        <Eye className="h-3.5 w-3.5" /> Preview em Tempo Real
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                             <TabsContent value="editor" forceMount className={editorTab === "editor" ? "mt-0 block" : "mt-0 hidden"}>
                                                <DocumentEditor
                                                    value={formData.conteudo}
                                                    onChange={(val) => set("conteudo", val)}
                                                    tipoDocumento={formData.tipoDocumento}
                                                />
                                            </TabsContent>

                                            <TabsContent value="preview" forceMount className={editorTab === "preview" ? "mt-0 block" : "mt-0 hidden"}>
                                                <div className="bg-zinc-900/90 dark:bg-zinc-950 p-4 md:p-6 rounded-lg border border-zinc-800 flex flex-col items-center">
                                                    <div className="text-xs text-zinc-300 mb-3 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700 shadow-sm flex items-center gap-1">
                                                        <span>Preview com dados demonstrativos para validação das variáveis</span>
                                                    </div>
                                                    <div className="document-paper-sheet bg-white text-slate-900 shadow-lg rounded-sm w-full max-w-[800px] min-h-[500px] p-8 border border-slate-200" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                                                        <div 
                                                            dangerouslySetInnerHTML={{ 
                                                                __html: parseDocumentTemplate(`
                                                                    <div class="document-page" style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a202c; line-height: 1.6; background-color: #ffffff;">
                                                                        ${renderHeaderFooterHtml(headersList.find(h => h.id.toString() === formData.headerTemplateId)?.configuracaoLayoutJson, true)}
                                                                        <div class="document-body" style="margin: 20px 0; font-size: 13px; color: #1a202c;">
                                                                            ${formData.conteudo}
                                                                        </div>
                                                                        ${renderHeaderFooterHtml(footersList.find(f => f.id.toString() === formData.footerTemplateId)?.configuracaoLayoutJson, false)}
                                                                    </div>
                                                                `, {
                                                                    FUN_DATA_AGORA: new Date().toLocaleDateString("pt-BR"),
                                                                    FUN_DATA_HORA_AGORA: new Date().toLocaleString("pt-BR"),
                                                                    FUN_NOME_COMPLETO_USUARIO: "Dra. Ana Paula Silveira (CRMV-MS 1234)",
                                                                    FUN_NOME_RESPOSAVEL: "Dra. Ana Paula Silveira (CRMV-MS 1234)",
                                                                    FUN_NOME_RESPONSAVEL: "Dra. Ana Paula Silveira (CRMV-MS 1234)",
                                                                    FUN_NUMERO_REGISTRO: "RAT-2026-0042",
                                                                    FUN_NumeroRegistro: "RAT-2026-0042",
                                                                    FUN_NOME_POPULAR: "Rato Wistar",
                                                                    FUN_NomePopular: "Rato Wistar",
                                                                    FUN_ESPECIE: "Rattus norvegicus",
                                                                    FUN_Especie: "Rattus norvegicus",
                                                                    FUN_GENERO: "Macho",
                                                                    FUN_FASE_VIDA: "Adulto",
                                                                    FUN_LOCAL_ORIGEM: "Biotério Central UCDB",
                                                                    FUN_LocalOrigem: "Biotério Central UCDB",
                                                                    FUN_INSTALACAO_ATUAL: "Sala 02 - Quarentena",
                                                                    FUN_DIAGNOSTICO: "Lesão dérmica superficial em região dorsal pós-procedimento",
                                                                    FUN_TRATAMENTO: "Curativo diário com pomada cicatrizante e analgesia preventiva",
                                                                    FUN_CHECK_HEMOGRAMA: "☒",
                                                                    FUN_CHECK_ULTRASSONOGRAFIA: "☐",
                                                                    FUN_CHECK_RADIOGRAFIA: "☐",
                                                                    FUN_CHECK_OUTROS: "☐",
                                                                    INPUT_DATA_ENTRADA_AMBULATORIO: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString("pt-BR"),
                                                                    INPUT_DATA_CLINICA: new Date().toLocaleDateString("pt-BR"),
                                                                    INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO: "Administração de Meloxicam 0,2mg/kg VO a cada 24h por 3 dias.<br/>Limpeza da ferida cirúrgica com soro fisiológico 0,9%.",
                                                                    INPUT_OBS_CLINICAS_ALTA: "Animal ativo, alimentando-se normalmente, ferida totalmente epitelizada sem sinais de infecção. Apto para retorno.",
                                                                    INPUT_INSTALACAO_RETORNO: "Sala 05 - Criação e Manutenção",
                                                                    INPUT_SinaisClinicos: "Apatia leve, claudicação de membro torácico direito e sensibilidade à palpação.",
                                                                    INPUT_SINAIS_CLINICOS: "Apatia leve, claudicação de membro torácico direito e sensibilidade à palpação.",
                                                                    INPUT_SuspeitaClinica: "Fratura óssea ou fissura em membro torácico.",
                                                                    INPUT_SUSPEITA_CLINICA: "Fratura óssea ou fissura em membro torácico.",
                                                                    INPUT_RegiaoAnatomica: "Membro torácico direito (projeções crânio-caudal e médio-lateral).",
                                                                    INPUT_REGIAO_ANATOMICA: "Membro torácico direito (projeções crânio-caudal e médio-lateral).",
                                                                    INPUT_Observacao: "Animal em jejum hídrico e alimentar de 6h para sedação caso necessário.",
                                                                    INPUT_OBSERVACOES_ADICIONAIS: "Animal em jejum hídrico e alimentar de 6h para sedação caso necessário.",
                                                                    INPUT_Outros: "",
                                                                    INPUT_OUTROS_EXAME: "",
                                                                    tipoExame: 1,
                                                                    Animal: {
                                                                        numeroRegistro: "RAT-2026-0042",
                                                                        nomePopular: "Rato Wistar",
                                                                        especie: { nome: "Rattus norvegicus" },
                                                                        localOrigem: { nome: "Biotério Central UCDB" },
                                                                        genero: "Macho",
                                                                        faseDeVida: "Adulto"
                                                                    }
                                                                }, formData.tipoDocumento)
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <>
                                            <Label className="mb-2 block text-base font-semibold">
                                                Configuração do Layout (3 Colunas)
                                            </Label>
                                            <HeaderFooterEditor
                                                value={formData.configuracaoLayoutJson}
                                                onChange={(val) => set("configuracaoLayoutJson", val)}
                                                isHeader={tipoSecaoAtual === TipoSecaoTemplate.Header}
                                            />
                                        </>
                                    )}
                                </div>
                            }
                        >
                            <div className="col-span-12 md:col-span-4">
                                <Label className="mb-1 block">Nome do Modelo <span className="text-red-500">*</span></Label>
                                <Input 
                                    value={formData.nome}
                                    onChange={(e) => set("nome", e.target.value)}
                                    placeholder="Ex: Template Padrão de Alta Ambulatorial"
                                />
                            </div>

                            <div className="col-span-12 md:col-span-3">
                                <Label className="mb-1 block">Tipo de Seção <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={formData.tipoSecao}
                                    onValueChange={(val) => set("tipoSecao", val)}
                                    disabled={!isNew}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TipoSecaoTemplate.Body.toString()}>Documento (Corpo)</SelectItem>
                                        <SelectItem value={TipoSecaoTemplate.Header.toString()}>Cabeçalho (Header)</SelectItem>
                                        <SelectItem value={TipoSecaoTemplate.Footer.toString()}>Rodapé (Footer)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {tipoSecaoAtual === TipoSecaoTemplate.Body && (
                                <div className="col-span-12 md:col-span-3">
                                    <Label className="mb-1 block">Tipo de Documento <span className="text-red-500">*</span></Label>
                                    <Select 
                                        value={formData.tipoDocumento}
                                        onValueChange={(val) => set("tipoDocumento", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={TipoDocumento.AltaAmbulatorial.toString()}>Alta Ambulatorial</SelectItem>
                                            <SelectItem value={TipoDocumento.LiberacaoQuarentena.toString()}>Liberação de Quarentena</SelectItem>
                                            <SelectItem value={TipoDocumento.SolicitacaoExame.toString()}>Solicitação de Exame</SelectItem>
                                            <SelectItem value={TipoDocumento.DocumentoDeEventoExterno.toString()}>Documento de Evento Externo (IMASUL)</SelectItem>
                                        <SelectItem value={TipoDocumento.Geral.toString()}>Geral / Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="col-span-12 md:col-span-2 flex items-center pt-6">
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        id="ativo" 
                                        checked={formData.ativo}
                                        onCheckedChange={(checked) => set("ativo", checked)}
                                    />
                                    <Label htmlFor="ativo">Ativo</Label>
                                </div>
                            </div>

                            {tipoSecaoAtual === TipoSecaoTemplate.Body && (
                                <>
                                    <div className="col-span-12 md:col-span-6">
                                        <Label className="mb-1 block text-xs text-gray-600">Template de Cabeçalho (Opcional)</Label>
                                        <Select 
                                            value={formData.headerTemplateId || "nenhum"}
                                            onValueChange={(val) => set("headerTemplateId", val === "nenhum" ? "" : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Nenhum cabeçalho selecionado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nenhum">Nenhum (Sem cabeçalho)</SelectItem>
                                                {headersList.map(h => (
                                                    <SelectItem key={h.id} value={h.id.toString()}>{h.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-12 md:col-span-6">
                                        <Label className="mb-1 block text-xs text-gray-600">Template de Rodapé (Opcional)</Label>
                                        <Select 
                                            value={formData.footerTemplateId || "nenhum"}
                                            onValueChange={(val) => set("footerTemplateId", val === "nenhum" ? "" : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Nenhum rodapé selecionado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nenhum">Nenhum (Sem rodapé)</SelectItem>
                                                {footersList.map(f => (
                                                    <SelectItem key={f.id} value={f.id.toString()}>{f.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </FormLayoutBase>
                    )}
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}

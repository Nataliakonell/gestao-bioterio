import { formatarLocalizacao } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Edit, Clock, Image as ImageIcon, Loader2, Plus, WeightTilde, Calendar, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { animalService, type AnimalResponse } from "@/services/animalService"
import HeaderGeral from "@/components/header-geral"
import { AbaAlimentacao } from "./AbaAlimentacao"
import { AbaBiometria } from "./AbaBiometria"
import { AbaClinico } from "./AbaClinico"
import { AbaDesverminacao } from "./AbaDesverminacao"
import { AbaMovimentacoes } from "./AbaMovimentacoes"
import CardInfoFicha from "@/components/card-info-ficha"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { usePermissions } from "@/contexts/PermissionsContext"

const situacaoMap: Record<string, string> = { "1": "Vivo", "2": "Óbito", "3": "Reintroduzido", "Vivo": "Vivo", "Óbito": "Óbito", "Obito": "Óbito", "Reintroduzido": "Reintroduzido" }
const generoMap: Record<string, string> = { "1": "Macho", "2": "Fêmea", "3": "Não Identificado", "Macho": "Macho", "Fêmea": "Fêmea", "Femea": "Fêmea", "Não Identificado": "Não Identificado" }
const faseDeVidaMap: Record<string, string> = { "1": "Filhote", "2": "Jovem", "3": "Adulto", "Filhote": "Filhote", "Jovem": "Jovem", "Adulto": "Adulto" }

export default function FichaAnimal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { hasPermission } = usePermissions()
  const [animal, setAnimal] = useState<AnimalResponse | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(location.search).get("tab")?.toLowerCase();

    switch (tab) {
      case "alimentacao":
        return "Alimentação";
      case "biometria":
        return "Biometria";
      case "clinico":
        return "Clínico";
      case "desverminacao":
        return "Desverminação";
      case "movimentacoes":
        return "Movimentações";
      default:
        return "Visão geral";
    }
  }); const tabs = ["Visão geral", "Alimentação", "Biometria", "Clínico", "Desverminação", "Movimentações",
  ];

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab")?.toLowerCase();
    if (tab) {
      if (tab === "alimentacao") setActiveTab("Alimentação");
      else if (tab === "biometria") setActiveTab("Biometria");
      else if (tab === "clinico") setActiveTab("Clínico");
      else if (tab === "desverminacao") setActiveTab("Desverminação");
      else if (tab === "movimentacoes") setActiveTab("Movimentações");
    }
  }, [location.search]);

  const fetchAnimal = useCallback(async () => {
    if (!id) return;
    try {
      const data = await animalService.getById(parseInt(id));
      setAnimal(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do animal:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnimal();
  }, [fetchAnimal]);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageContainer>
            <HeaderGeral
              breadcrumbTitle="Plantel"
              breadcrumbUrl="/plantel/visao-geral"
            />
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
          </PageContainer>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!animal) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageContainer>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
              <h2 className="text-xl font-bold">Animal não encontrado</h2>
              <Button onClick={() => navigate("/plantel/visao-geral")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Visão Geral
              </Button>
            </div>
          </PageContainer>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const [anoE, mesE, diaE] = animal.dataDeEntrada.split("T")[0].split("-").map(Number);
  const dataEntrada = new Date(anoE, mesE - 1, diaE);
  const hoje = new Date();

  const diffTime = Math.abs(hoje.getTime() - dataEntrada.getTime());
  const totalDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let tempoTexto = "";

  if (totalDias < 30) {
    tempoTexto = `${totalDias} dia${totalDias !== 1 ? "s" : ""}`;
  } else {
    let anos = hoje.getFullYear() - dataEntrada.getFullYear();
    let meses = hoje.getMonth() - dataEntrada.getMonth();
    let dias = hoje.getDate() - dataEntrada.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        0,
      ).getDate();
      dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    if (anos > 0) {
      tempoTexto = `${anos} ano${anos > 1 ? "s" : ""}${meses > 0 ? ` e ${meses} mes${meses > 1 ? "es" : ""}` : ""}`;
    } else {
      tempoTexto = `${meses} mes${meses > 1 ? "es" : ""}${dias > 0 ? ` e ${dias} dia${dias > 1 ? "s" : ""}` : ""}`;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={animal ? `Ficha: ${animal.numeroRegistro}` : "Ficha do Animal"}
              breadcrumbTitle="Plantel"
              breadcrumbUrl="/plantel/visao-geral"
            />
            <div className="flex items-center gap-2">
              {activeTab === "Alimentação" && hasPermission("Alimentação", "Editar") && (
                <Button
                  className="hidden md:flex bg-blue-800 hover:bg-blue-900 text-white gap-2 shrink-0"
                  onClick={() => navigate(`/alimentacao/registrar-alimentacao?animalId=${id}`)}
                >
                  <Plus className="w-4 h-4" /> Registrar Alimentação
                </Button>
              )}
              {activeTab === "Biometria" && hasPermission("Biometria", "Editar") && (
                <Button
                  className="hidden md:flex bg-blue-800 hover:bg-blue-900 text-white gap-2 shrink-0"
                  onClick={() => navigate(`/biometria/cadastro?animalId=${id}`)}
                >
                  <Plus className="w-4 h-4" /> Nova Biometria
                </Button>
              )}
              {activeTab === "Desverminação" && hasPermission("Desverminacao", "Gerenciar") && (
                <Button
                  className="hidden md:flex bg-blue-800 hover:bg-blue-900 text-white gap-2 shrink-0"
                  onClick={() => navigate(`/desverminacao/registrar-dose?animalId=${id}`)}
                >
                  <Plus className="w-4 h-4" /> Registrar dose
                </Button>
              )}
              {activeTab === "Visão geral" && hasPermission("Animal", "Editar") && (
                <Button
                  className="hidden md:flex bg-blue-800 hover:bg-blue-900 text-white gap-2"
                  onClick={() => navigate(`/plantel/cadastro/${animal.id}`)}
                >
                  <Edit className="w-4 h-4" /> Editar
                </Button>
              )}
            </div>
          </HeaderContainer>

          {/* Corpo da Ficha */}
          <div className="flex flex-col gap-6">
            {/* Seção de Perfil Superior */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-white rounded-xl">
              {/* Box da Foto */}
              <div className="relative flex-shrink-0 w-40 h-40 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                {animal.fotoAnimal ? (
                  <img
                    src={`data:image/jpeg;base64,${animal.fotoAnimal}`}
                    alt={animal.nomePopular}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400 font-medium">
                      Sem Foto
                    </span>
                  </>
                )}

                {/* Badge Situacao sobre a foto */}
                <div
                  className={`absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full text-white ${String(animal.situacaoAnimal) === "1" || String(animal.situacaoAnimal) === "Vivo"
                    ? "bg-green-500"
                    : String(animal.situacaoAnimal) === "2" || String(animal.situacaoAnimal) === "Óbito" || String(animal.situacaoAnimal) === "Obito"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                    }`}
                >
                  {situacaoMap[String(animal.situacaoAnimal)]}
                </div>
              </div>

              {/* Informações Principais */}
              <div className="flex-1 space-y-3 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                  #{animal.numeroRegistro}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {animal.nomePopular}
                  </h1>
                  <p className="text-sm text-slate-500 italic mt-0.5">
                    {animal.especieNome}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <CardInfoFicha
                    titulo="Tempo no biotério"
                    descricao={tempoTexto}
                    icone={Clock}
                  />
                  <CardInfoFicha
                    titulo="Última biometria"
                    descricao={animal.biometriaAnimal?.dataCriacao ? new Date(animal.biometriaAnimal.dataCriacao).toLocaleDateString("pt-BR") : "Sem informação"}
                    icone={WeightTilde}
                  />
                  <CardInfoFicha
                    titulo="Próx. alimentação"
                    descricao="Sem informação"
                    icone={Calendar}
                  />
                  <CardInfoFicha
                    titulo="Saúde geral"
                    descricao="Sem informação"
                    icone={Activity}
                  />
                </div>
              </div>
            </div>

            {/* Abas e Controles da Aba */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full xl:w-auto"
              >
                {/* Dropdown para Mobile */}
                <div className="block md:hidden">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {tabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TabsList para Desktop/Tablet */}
                <TabsList className="hidden md:inline-flex border border-slate-200">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Slot para ações / filtros da aba ativa (ex: BarraDeBuscaEFiltro da AbaClinico) */}
              <div id="tab-header-actions" className="flex justify-end empty:hidden w-full xl:w-auto" />
            </div>

            {/* Conteúdo da Aba */}
            {activeTab === "Visão geral" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-brand shadow-sm p-6 space-y-4">
                  <h2 className="font-semibold text-xl">
                    Identificação
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Nº Registro
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.numeroRegistro}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Nº Chip
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.numeroChip || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Data de Entrada
                      </span>
                      <span className="font-medium text-slate-900">
                        {(() => {
                          const [a, m, d] = animal.dataDeEntrada.split("T")[0].split("-").map(Number);
                          return new Date(a, m - 1, d).toLocaleDateString("pt-BR");
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Instalação no Biotério
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatarLocalizacao(animal.localizacaoNome || animal.localizacaoHierarquia || animal.instalacaoBioterioNome)}
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="block text-slate-500 text-xs mb-1">
                        Local de Origem
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.localOrigem} - {animal.municipio}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        SISFAUNA
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.sisfauna ? "Sim" : "Não"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Termo de Doação
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.termoDeDoacao ? "Sim" : "Não"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dados Complementares */}
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-brand shadow-sm p-6 space-y-4">
                  <h3 className="font-semibold text-xl">
                    Dados Biométricos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Gênero
                      </span>
                      <span className="font-medium text-slate-900">
                        {generoMap[String(animal.genero)]}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Fase de Vida
                      </span>
                      <span className="font-medium text-slate-900">
                        {faseDeVidaMap[String(animal.faseDeVida)]}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Comprimento Total (cm)
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.biometriaAnimal?.comprimento ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Peso (g)
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.biometriaAnimal?.peso ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Comprimento Cauda (cm)
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.biometriaAnimal?.comprimentoCauda ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs mb-1">
                        Grupo
                      </span>
                      <span className="font-medium text-slate-900">
                        {animal.grupo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Alimentação" && id && (
              <AbaAlimentacao animalId={parseInt(id)} />
            )}

            {activeTab === "Biometria" && id && (
              <AbaBiometria animalId={parseInt(id)} />
            )}

            {activeTab === "Clínico" && id && (
              <AbaClinico animalId={parseInt(id)} situacaoAnimal={animal.situacaoAnimal} onInstalacaoChanged={fetchAnimal} />
            )}

            {activeTab === "Desverminação" && id && (
              <AbaDesverminacao animalId={parseInt(id)} />
            )}

            {activeTab === "Movimentações" && id && (
              <AbaMovimentacoes animalId={parseInt(id)} dataEntrada={animal.dataDeEntrada} />
            )}

            {activeTab !== "Visão geral" && activeTab !== "Alimentação" && activeTab !== "Biometria" && activeTab !== "Clínico" && activeTab !== "Desverminação" && activeTab !== "Movimentações" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-slate-500">
                Esta seção "{activeTab}" será implementada em breve.
              </div>
            )}
          </div>

          {activeTab === "Visão geral" && hasPermission("Animal", "Editar") && (
            <Button
              className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-800 hover:bg-blue-900 text-white shadow-xl rounded-full w-14 h-14 p-0 flex items-center justify-center"
              onClick={() => navigate(`/plantel/cadastro/${animal.id}`)}
            >
              <Edit className="w-6 h-6" />
            </Button>
          )}
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}

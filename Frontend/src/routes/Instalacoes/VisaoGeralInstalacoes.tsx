import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Building2 } from "lucide-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { CardInstalacao } from "./CardInstalacao"
import { ModalInstalacao } from "./ModalInstalacao"
import { ModalVisualizarAnimaisNasInstalacoes } from "./ModalVisualizarAnimaisNasInstalacoes"
import { ModalTransferirAnimais } from "./ModalTransferirAnimais"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { animalLocalizacaoService, type AnimalLocalizacaoListVm } from "@/services/AnimalLocalizacaoService"

export default function VisaoGeralInstalacoes() {
  const navigate = useNavigate()

  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [modalFormOpen, setModalFormOpen] = useState(false)
  const [instalacaoParaEditar, setInstalacaoParaEditar] = useState<LocalizacaoListVm | null>(null)

  const [modalAnimaisOpen, setModalAnimaisOpen] = useState(false)
  const [selectedInstalacao, setSelectedInstalacao] = useState<LocalizacaoListVm | null>(null)
  const [loadingAnimais, setLoadingAnimais] = useState(false)
  const [animaisNaInstalacao, setAnimaisNaInstalacao] = useState<AnimalLocalizacaoListVm[]>([])

  const [modalTransferirOpen, setModalTransferirOpen] = useState(false)
  const [origemInstalacao, setOrigemInstalacao] = useState<LocalizacaoListVm | null>(null)

  const carregarLocalizacoes = async () => {
    try {
      setLoading(true)
      const [locsData, vinculosData] = await Promise.all([
        localizacaoService.getAll(),
        animalLocalizacaoService.getAll().catch(() => [] as AnimalLocalizacaoListVm[]),
      ])

      // Conta vínculos por localizacaoId no frontend como garantia caso o backend ainda não tenha sido reiniciado
      const contagemVinculos = new Map<number, number>()
      for (const v of vinculosData) {
        if (v.localizacaoId) {
          contagemVinculos.set(v.localizacaoId, (contagemVinculos.get(v.localizacaoId) || 0) + 1)
        }
      }

      const mergedLocs = locsData.map((loc) => {
        const qtdVinculos = contagemVinculos.get(loc.id) || 0
        const qtdBackend = loc.quantidadeAnimais ?? 0
        return {
          ...loc,
          quantidadeAnimais: Math.max(qtdBackend, qtdVinculos),
        }
      })

      setLocalizacoes(mergedLocs)
    } catch (error) {
      toast.error("Erro ao carregar as instalações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLocalizacoes()
  }, [])

  const localizacoesFiltradas = useMemo(() => {
    // 1. Identifica todos os IDs que atuam como pai de outra localização na lista
    const idsPais = new Set(
      localizacoes
        .map((loc) => loc.localizacaoPaiId)
        .filter((id): id is number => id !== null && id !== undefined)
    )

    const salasFilhas = localizacoes.filter(
      (loc) =>
        loc.localizacaoPaiId !== null &&
        loc.localizacaoPaiId !== undefined &&
        !idsPais.has(loc.id)
    )

    const termo = search.trim().toLowerCase()
    if (!termo) return salasFilhas

    return salasFilhas.filter(
      (loc) =>
        loc.nome.toLowerCase().includes(termo) ||
        (loc.caminhoHierarquia && loc.caminhoHierarquia.toLowerCase().includes(termo))
    )
  }, [localizacoes, search])

  const handleNovaInstalacao = () => {
    setInstalacaoParaEditar(null)
    setModalFormOpen(true)
  }

  const handleEditar = (loc: LocalizacaoListVm) => {
    setInstalacaoParaEditar(loc)
    setModalFormOpen(true)
  }

  const handleVerAnimais = async (loc: LocalizacaoListVm) => {
    setSelectedInstalacao(loc)
    setModalAnimaisOpen(true)
    try {
      setLoadingAnimais(true)
      const data = await animalLocalizacaoService.getByLocalizacaoId(loc.id)
      setAnimaisNaInstalacao(data)
    } catch (error) {
      toast.error("Erro ao buscar animais desta instalação.")
    } finally {
      setLoadingAnimais(false)
    }
  }

  const handleTransferir = (loc: LocalizacaoListVm) => {
    setOrigemInstalacao(loc)
    setModalTransferirOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title="Instalações"
              breadcrumbTitle="Instalações"
              breadcrumbUrl="/instalacoes"
            />
            <div className="flex items-center gap-4">
              <AddButton
                text="Nova Instalação"
                onClick={handleNovaInstalacao}
              />
            </div>
          </HeaderContainer>

          <div className="mt-4 flex justify-end">
            <BarraDeBuscaEFiltro
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar por instalação ou hierarquia..."
            />
          </div>

          {/* Grid de Cards de Instalação (1 coluna mobile, 2 tablet, 3 desktop) */}
          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
                  />
                ))}
              </div>
            ) : localizacoesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-base font-semibold text-gray-800">
                  Nenhuma instalação encontrada
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search
                    ? "Nenhum resultado corresponde à busca informada."
                    : "Cadastre a primeira instalação/sala utilizando o botão acima."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {localizacoesFiltradas.map((loc) => (
                  <CardInstalacao
                    key={loc.id}
                    localizacao={loc}
                    onEdit={handleEditar}
                    onVerAnimais={handleVerAnimais}
                    onTransferir={handleTransferir}
                  />
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </SidebarInset>

      {/* Modal de Criação / Edição de Instalação (Componente Separado) */}
      <ModalInstalacao
        isOpen={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        onSuccess={carregarLocalizacoes}
        instalacaoParaEditar={instalacaoParaEditar}
        localizacoes={localizacoes}
      />

      {/* Modal de Visualização de Animais da Instalação */}
      <ModalVisualizarAnimaisNasInstalacoes
        isOpen={modalAnimaisOpen}
        onClose={() => setModalAnimaisOpen(false)}
        instalacao={selectedInstalacao}
        animais={animaisNaInstalacao}
        loading={loadingAnimais}
      />

      {/* Modal de Transferência de Animais em Lote */}
      <ModalTransferirAnimais
        isOpen={modalTransferirOpen}
        onClose={() => setModalTransferirOpen(false)}
        onSuccess={carregarLocalizacoes}
        origem={origemInstalacao}
        localizacoes={localizacoes}
      />
    </SidebarProvider>
  )
}

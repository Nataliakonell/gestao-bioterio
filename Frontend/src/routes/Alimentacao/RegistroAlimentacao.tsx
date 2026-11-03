import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { animalService, type AnimalLookupVm } from "@/services/animalService"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { createAlimentacao, getAlimentacao, updateAlimentacao } from "@/services/AlimentacaoService"
import { getBiometriaAnimais } from "@/services/BiometriaAnimalService"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { AlertTriangle, Info, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input"
import rotinaAnimalService from "@/services/RotinaAnimalService"

const RequiredMark = () => <span className="text-red-500"> *</span>

export enum TipoRefeicao {
  Roedor = 1,
  Frutas = 2,
  Legumes = 3,
  Vegetais = 4,
  Insetos = 5,
  Racao = 6,
  Carne_Vermelha = 7,
  Ave = 8,
  Peixe = 9,
  Ovo = 10,
  ViaSonda = 11
}

export enum SituacaoRefeicao {
  Pendente = 0,
  Aceitou = 1,
  Negou = 2,
  Regurgitou = 3,
}

const TIPO_REFEICAO_LABELS: Record<number, string> = {
  [TipoRefeicao.Roedor]: "Roedor",
  [TipoRefeicao.Frutas]: "Frutas",
  [TipoRefeicao.Legumes]: "Legumes",
  [TipoRefeicao.Vegetais]: "Vegetais",
  [TipoRefeicao.Insetos]: "Insetos",
  [TipoRefeicao.Racao]: "Ração",
  [TipoRefeicao.Carne_Vermelha]: "Carne Vermelha",
  [TipoRefeicao.Ave]: "Ave",
  [TipoRefeicao.Peixe]: "Peixe",
  [TipoRefeicao.Ovo]: "Ovo",
  [TipoRefeicao.ViaSonda]: "Via Sonda"
}

const TIPO_REFEICAO_SORTED = Object.entries(TIPO_REFEICAO_LABELS).sort(([, a], [, b]) =>
  a.localeCompare(b, "pt-BR")
)

const SITUACAO_REFEICAO_LABELS: Record<number, string> = {
  [SituacaoRefeicao.Pendente]: "Pendente",
  [SituacaoRefeicao.Aceitou]: "Aceitou",
  [SituacaoRefeicao.Negou]: "Negou",
  [SituacaoRefeicao.Regurgitou]: "Regurgitou",
}

const getUnidadeMedida = (tipoRefeicao: string) => {
  if (!tipoRefeicao) return "g/ml"
  const tiposEmMl = [
    TipoRefeicao.ViaSonda,
  ]

  return tiposEmMl.includes(Number(tipoRefeicao))
    ? "ml"
    : "g"
}

export interface RefeicaoLocal {
  id: string
  tipoRefeicao: string
  pesoRefeicao: string
  situacaoRefeicao: string
  observacoes: string
}

const initialFormData = {
  animalId: "",
  dataAlimentacao: new Date().toISOString().split("T")[0],
  peso: "",
  porcentagemPesoRecomendado: "",
  pesoRecomendado: "",
  comprimento: "",
  comprimentoCauda: "",
  tipoRefeicao: "",
  observacoes: ""
}


interface CalcCardProps {
  label: string
  value: number | null
  color: "blue" | "lightBlue" | "green" | "orange" | "red" | "lightRed" | "gray"
  unit?: string
}


function CalcCard({ label, value, color, unit = "g" }: CalcCardProps) {
  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", val: "text-blue-900" },
    lightBlue: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", val: "text-sky-900" },
    green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", val: "text-green-900" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", val: "text-orange-900" },
    red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", val: "text-red-900" },
    lightRed: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", val: "text-rose-900" },
    gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", val: "text-gray-800" },
  }
  const c = colorMap[color]
  const displayValue = value === null ? "—" : `${value.toFixed(1)} ${unit}`
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} px-4 py-3 flex flex-col gap-1`}>
      <span className={`text-xs font-medium uppercase tracking-wide ${c.text}`}>{label}</span>
      <span className={`text-lg font-bold ${c.val}`}>{displayValue}</span>
    </div>
  )
}

export default function RegistroAlimentacao() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnUrl = (() => {
    if (location.state?.returnUrl) {
      sessionStorage.setItem('alimentacao_returnUrl', location.state.returnUrl)
      if (location.state.tab) sessionStorage.setItem('alimentacao_returnTab', location.state.tab)
      else sessionStorage.removeItem('alimentacao_returnTab')
      return location.state.returnUrl as string
    }
    return sessionStorage.getItem('alimentacao_returnUrl') || '/alimentacao/visao-geral'
  })()
  const tab = location.state?.tab ?? sessionStorage.getItem('alimentacao_returnTab') ?? undefined
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const editingId = routeId ?? searchParams.get("id") ?? searchParams.get("alimentacaoId")
  const preselectedAnimalId = searchParams.get("animalId") ?? ""

  const [formData, setFormData] = useState(initialFormData)
  const [refeicoes, setRefeicoes] = useState<RefeicaoLocal[]>([
    { id: "1", tipoRefeicao: "", pesoRefeicao: "", situacaoRefeicao: "" },
  ])
  const [animais, setAnimais] = useState<AnimalLookupVm[]>([])
  const [loadingAnimais, setLoadingAnimais] = useState(true)
  const [protocoloDieta, setProtocoloDieta] = useState<string | null>(null)
  const [loadingProtocolo, setLoadingProtocolo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [animalInativo, setAnimalInativo] = useState<string | null>(null)

  const handleCopySugerido = () => {
    if (calculos?.pesoCalculadoPorPercentual > 0) {
      const valor = calculos.pesoCalculadoPorPercentual.toFixed(2)
      navigator.clipboard.writeText(valor)
      setCopied(true)
      toast.success(`Valor (${valor}) copiado!`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (editingId) {
      getAlimentacao(Number(editingId))
        .then(async (data) => {
          setFormData({
            animalId: data.animalId.toString(),
            dataAlimentacao: data.dataAlimentacao ? data.dataAlimentacao.split("T")[0] : "",
            peso: data.biometriaAnimal?.peso?.toString() || "",
            comprimento: data.biometriaAnimal?.comprimento?.toString() || "",
            porcentagemPesoRecomendado: data.porcentagemPesoRecomendado?.toString() || "20",
            pesoRecomendado: data.pesoRecomendado?.toString() || "",
            tipoRefeicao: data.refeicoes && data.refeicoes.length > 0 ? data.refeicoes[0].tipoRefeicao.toString() : "",
            observacoes: data.observacoes ?? "",
            comprimentoCauda: data.biometriaAnimal?.comprimentoCauda?.toString() || "",
          })

          if (data.refeicoes && data.refeicoes.length > 0) {
            setRefeicoes(
              data.refeicoes.map((r) => ({
                id: r.id.toString(),
                tipoRefeicao: r.tipoRefeicao.toString(),
                pesoRefeicao: r.pesoRefeicao.toString(),
                situacaoRefeicao: r.situacaoRefeicao.toString()
              }))
            )
          }

          try {
            const animalData = await animalService.getById(data.animalId)
            setAnimais([{
              id: animalData.id,
              numeroRegistro: animalData.numeroRegistro,
              especieNome: animalData.especieNome || (animalData as any).especie?.nome || "",
            } as AnimalLookupVm])
          } catch (e) { }
          setLoadingAnimais(false)
        })
        .catch(() => {
          toast.error("Erro ao carregar dados da alimentação")
          setLoadingAnimais(false)
        })
    } else if (preselectedAnimalId) {
      animalService.getById(Number(preselectedAnimalId)).then((animalData) => {
        setAnimais([{
          id: animalData.id,
          numeroRegistro: animalData.numeroRegistro,
          especieNome: animalData.especieNome || (animalData as any).especie?.nome || "",
        } as AnimalLookupVm])
        setLoadingAnimais(false)
      })
    } else {
      animalService
        .getLookup()
        .then((data) => setAnimais(data))
        .catch(() => toast.error("Erro ao carregar lista de animais"))
        .finally(() => setLoadingAnimais(false))
    }
  }, [editingId, preselectedAnimalId])

  useEffect(() => {
    if (!editingId && preselectedAnimalId && animais.length > 0) {
      setFormData((prev) => ({ ...prev, animalId: preselectedAnimalId }))
    }
  }, [animais, preselectedAnimalId, editingId])

  useEffect(() => {
    if (formData.animalId) {
      setLoadingProtocolo(true)
      rotinaAnimalService
        .getAnimalRotinaStatus(Number(formData.animalId))
        .then((status) => {
          setProtocoloDieta(status.alimentacao?.protocoloDieta || null)
        })
        .catch((err) => {
          console.error("Erro ao buscar protocolo de dieta:", err)
          setProtocoloDieta(null)
        })
        .finally(() => {
          setLoadingProtocolo(false)
        })

      // Auto-preenche biometria com o último registro do animal
      getBiometriaAnimais({ animalId: Number(formData.animalId), pageSize: 1 })
        .then((response) => {
          const last = response.items?.[0]
          if (last) {
            setFormData((prev) => ({
              ...prev,
              peso: last.peso?.toString() || "",
              comprimento: last.comprimento?.toString() || "",
              comprimentoCauda: last.comprimentoCauda?.toString() || "",
            }))
          }
        })
        .catch(() => { })
    } else {
      setProtocoloDieta(null)
    }
  }, [formData.animalId])

  const unidadeGlobal = useMemo(() => {
    const firstType = refeicoes.find(r => r.tipoRefeicao)?.tipoRefeicao;
    return getUnidadeMedida(firstType || "");
  }, [refeicoes]);


  const possuiMisturaUnidades = useMemo(() => {
    const unidades = refeicoes
      .filter(r => r.tipoRefeicao)
      .map(r => getUnidadeMedida(r.tipoRefeicao));

    return new Set(unidades).size > 1;
  }, [refeicoes]);

  const tituloPeso = useMemo(() => {
    switch (unidadeGlobal) {
      case "ml":
        return "Peso total da refeição (ml)";
      case "g":
        return "Peso total da refeição (g)";
      default:
        return "Peso total da refeição (g/ml)";
    }
  }, [unidadeGlobal]);

  const calculos = useMemo(() => {
    const peso = parseFloat(formData.peso) || 0
    const porcentagem = Number(formData.porcentagemPesoRecomendado) || 0

    const pesoCalculadoPorPercentual =
      porcentagem > 0
        ? peso * (porcentagem / 100)
        : 0
    const pesoRecomendado = parseFloat(formData.pesoRecomendado) || 0

    const totalOfertado = refeicoes.reduce((sum, r) => {
      const p = parseFloat(r.pesoRefeicao)
      return sum + (isNaN(p) ? 0 : p)
    }, 0)

    const totalConsumido = refeicoes.reduce((sum, r) => {
      const situacao = parseInt(r.situacaoRefeicao)
      const p = parseFloat(r.pesoRefeicao)
      if (situacao === SituacaoRefeicao.Aceitou && !isNaN(p)) return sum + p
      return sum
    }, 0)

    const saldoCru = totalConsumido - pesoRecomendado
    const saldo = Math.abs(saldoCru) < 0.01 ? 0 : saldoCru

    return { pesoCalculadoPorPercentual, pesoRecomendado, totalOfertado, totalConsumido, saldo }
  }, [formData.peso, formData.porcentagemPesoRecomendado, refeicoes])

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const checkIsDirty = () => {
    const mainFormDirty = Object.entries(formData).some(
      ([k, v]) => v !== (initialFormData as Record<string, string>)[k]
    )
    const refeicoesDirty =
      refeicoes.length > 1 ||
      refeicoes[0]?.pesoRefeicao !== "" ||
      refeicoes[0]?.situacaoRefeicao !== ""
    return mainFormDirty || refeicoesDirty
  }

  const addRefeicao = () => {
    setRefeicoes((prev) => [
      ...prev,
      { id: `new_${Date.now()}`, tipoRefeicao: "", pesoRefeicao: "", situacaoRefeicao: "" },
    ])
  }

  const removeRefeicao = (id: string) => {
    setRefeicoes((prev) => prev.filter((r) => r.id !== id))
  }

  const updateRefeicao = (id: string, field: keyof RefeicaoLocal, value: string) => {
    setRefeicoes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const alterarTipoRefeicao = (id: string, novoTipo: string) => {
    const novaUnidade = getUnidadeMedida(novoTipo)

    const outraRefeicao = refeicoes.find(
      r => r.id !== id && r.tipoRefeicao
    );
    if (outraRefeicao) {
      const unidadeExistente = getUnidadeMedida(outraRefeicao.tipoRefeicao);

      if (unidadeExistente !== novaUnidade) {
        toast.error(
          `Não é permitido misturar refeições em ${unidadeExistente} com ${novaUnidade}. Todas as refeições devem utilizar a mesma unidade.`
        );
        return;
      }
    }

    updateRefeicao(id, "tipoRefeicao", novoTipo);
  }


  const handleSubmit = async () => {

    if (possuiMisturaUnidades) {
      toast.error(
        "Não é permitido misturar refeições em gramas (g) e mililitros (ml)."
      );
      return false;
    }

    const finalPesoRecomendado =
      !formData.pesoRecomendado || isNaN(parseFloat(formData.pesoRecomendado))
        ? calculos.pesoCalculadoPorPercentual
        : parseFloat(formData.pesoRecomendado);

    if (finalPesoRecomendado <= 0) {
      toast.error("O peso sugerido/recomendado da refeição é obrigatório. Insira-o manualmente ou digite a porcentagem para calcular.")
      return false
    }

    if (refeicoes.length === 0) {
      toast.error("Adicione pelo menos uma refeição.")
      return false
    }

    for (const ref of refeicoes) {
      if (!ref.situacaoRefeicao) {
        toast.error("Selecione o consumo de todas as refeições.")
        return false
      }
      const p = parseFloat(ref.pesoRefeicao)
      if (!ref.pesoRefeicao || isNaN(p) || p <= 0) {
        toast.error("O peso de todas as refeições deve ser maior que zero.")
        return false
      }
      if (!ref.tipoRefeicao) {
        toast.error("Selecione o tipo de refeição.")
        return false
      }
    }

    try {
      const animalIdNum = parseInt(formData.animalId)
      if (Number.isNaN(animalIdNum)) {
        toast.error("ID do animal inválido")
        return false
      }


      const refeicoesPayload = refeicoes.map((r) => {
        const idNum = parseInt(r.id)
        const isNew = isNaN(idNum) || idNum > 1000000000
        return {
          ...(isNew ? {} : { id: idNum }),
          tipoRefeicao: parseInt(r.tipoRefeicao),
          pesoRefeicao: parseFloat(r.pesoRefeicao),
          situacaoRefeicao: parseInt(r.situacaoRefeicao),
        }
      })

      const comprimentoNum = parseFloat(formData.comprimento)
      const comprimentoCaudaNum = parseFloat(formData.comprimentoCauda)

      const pesoNum = parseFloat(formData.peso)

      const payload: any = {
        animalId: animalIdNum,
        dataAlimentacao: formData.dataAlimentacao,
        peso: pesoNum,

        pesoRecomendado: finalPesoRecomendado,

        porcentagemPesoRecomendado:
          formData.porcentagemPesoRecomendado === ""
            ? null
            : parseFloat(formData.porcentagemPesoRecomendado),

        comprimento:
          !formData.comprimento ||
            isNaN(comprimentoNum)
            ? null
            : comprimentoNum,

        comprimentoCauda:
          !formData.comprimentoCauda ||
            isNaN(comprimentoCaudaNum)
            ? null
            : comprimentoCaudaNum,

        refeicoes: refeicoesPayload,
        observacoes: formData.observacoes,
      }

      if (editingId) {
        await updateAlimentacao(Number(editingId), payload)
        toast.success("Alimentação atualizada com sucesso!")
      } else {
        await createAlimentacao(payload)
        toast.success("Alimentação registrada com sucesso!")
      }
      navigate(returnUrl, { state: tab ? { tab } : undefined })
      return true
    } catch (error) {
      console.error("Erro ao registrar alimentação:", error)
      const message = error instanceof Error ? error.message : "Erro ao salvar alimentação"
      toast.error(message)
      return false
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              breadcrumbTitle="Alimentações"
              breadcrumbUrl="/alimentacao/visao-geral"
              title="Registrar alimentação"
            />
          </HeaderContainer>

          <FormLayoutBase
            titleFirstSection="Informações do Animal"
            submitLabel="Registrar alimentacao"
            onSubmit={handleSubmit}
            onCancel={() => navigate(returnUrl, { state: tab ? { tab } : undefined })}
            checkIsDirty={checkIsDirty}
            columnsClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
            extraSections={
              <>
                {/* Calculadora — seção auxiliar, não obrigatória */}
                <FormSection
                  title="Calculadora">
                  <p className="text-sm text-gray-500 mb-4 -mt-4">
                    Sugerir peso da presa por porcentagem baseado no peso do animal.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentagem do peso (%)
                      </label>
                      <CurrencyInput
                        placeholder="Ex: 20"
                        value={formData.porcentagemPesoRecomendado}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            porcentagemPesoRecomendado: value,
                          })
                        }
                      />
                    </div>
                    <div className="pb-2 flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-600">
                        {calculos?.pesoCalculadoPorPercentual > 0
                          ? `Peso sugerido da refeição: ${calculos.pesoCalculadoPorPercentual.toFixed(2)} ${unidadeGlobal}`
                          : "Digite a porcentagem para verificar o peso sugerido da refeição em (g) ou (ml)."}
                      </span>
                      {calculos?.pesoCalculadoPorPercentual > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 border-gray-300 hover:bg-gray-100 text-gray-700"
                          title="Copiar valor numérico"
                          onClick={handleCopySugerido}
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-green-600">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-gray-600" />
                              <span>Copiar</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Dieta">
                  <div className="space-y-6">
                    {loadingProtocolo ? (
                      <p className="text-sm text-gray-500 italic">Carregando protocolo de dieta da rotina...</p>
                    ) : protocoloDieta ? (
                      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-blue-700" />
                          Protocolo de Dieta / Observações (Rotina)
                        </h4>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{protocoloDieta}</p>
                      </div>
                    ) : formData.animalId ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm text-gray-500 italic">Nenhum protocolo de dieta cadastrado na rotina desta espécie.</p>
                      </div>
                    ) : null}

                    {refeicoes.some(r => r.tipoRefeicao) && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <CalcCard
                          label="Total Ofertado"
                          value={calculos?.totalOfertado ?? null}
                          color="gray"
                          unit={unidadeGlobal}
                        />
                        <CalcCard
                          label="Total Consumido"
                          value={calculos?.totalConsumido ?? null}
                          color="green"
                          unit={unidadeGlobal}
                        />
                        <CalcCard
                          label="Saldo"
                          value={calculos?.saldo ?? null}
                          color={
                            !calculos
                              ? "gray"
                              : calculos.saldo >= 0
                                ? "green"
                                : "lightRed"
                          }
                          unit={unidadeGlobal}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {tituloPeso}<RequiredMark />
                        </label>
                        <CurrencyInput
                          placeholder="Ex: 56,00"
                          value={formData.pesoRecomendado}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              pesoRecomendado: value,
                            })
                          }
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Inserir o peso ou usar sugestão da calculadora.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-800">
                          Refeições
                        </h3>

                        {possuiMisturaUnidades && (
                          <Alert className="border-yellow-300 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle>Atenção</AlertTitle>
                            <AlertDescription>
                              Não é permitido misturar refeições em <strong>g</strong> e <strong>ml</strong>.
                              Todas as refeições deste registro devem utilizar a mesma unidade de medida.
                            </AlertDescription>
                          </Alert>
                        )}

                        {refeicoes.map((ref, index) => (
                          <div
                            key={ref.id}
                            className="p-4 rounded-lg border border-gray-200 border-l-4 border-l-blue-800 bg-gray-50 shadow-sm space-y-4"
                          >
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Refeição {index + 1}
                              </h4>
                              {refeicoes.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                  onClick={() => removeRefeicao(ref.id)}
                                >
                                  Remover
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Tipo da refeição<RequiredMark />
                                </label>
                                <Select
                                  value={ref.tipoRefeicao}
                                  onValueChange={(v) => alterarTipoRefeicao(ref.id, v)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o tipo de refeição" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIPO_REFEICAO_SORTED.map(([val, label]) => (
                                      <SelectItem key={val} value={val}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Peso ({getUnidadeMedida(ref.tipoRefeicao)})<RequiredMark />
                                </label>
                                <CurrencyInput
                                  placeholder={
                                    getUnidadeMedida(ref.tipoRefeicao) === "ml"
                                      ? "Mililitros ofertados"
                                      : "Gramas ofertadas"
                                  }
                                  value={ref.pesoRefeicao}
                                  onValueChange={(value) =>
                                    updateRefeicao(ref.id, "pesoRefeicao", value)
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Consumo<RequiredMark />
                                </label>
                                <Select
                                  value={ref.situacaoRefeicao}
                                  onValueChange={(v) => updateRefeicao(ref.id, "situacaoRefeicao", v)}

                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(SITUACAO_REFEICAO_LABELS).map(([val, label]) => (
                                      <SelectItem key={val} value={val}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={addRefeicao}
                          className="w-full py-2 border-dashed border-2 bg-gray-50 hover:bg-white flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 border-gray-300"
                        >
                          + Adicionar refeição
                        </Button>
                      </div>

                    </div>
                  </div>
                </FormSection>
              </>
            }
          >
            {/* Informações do Animal e Biometria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animal<RequiredMark />
              </label>
              <SearchableSelect
                options={[
                  ...animais
                    .filter((a) => /^\d/.test(a.numeroRegistro ?? ""))
                    .sort((a, b) =>
                      Number(a.numeroRegistro ?? 0) - Number(b.numeroRegistro ?? 0)
                    ),
                  ...animais
                    .filter((a) => !/^\d/.test(a.numeroRegistro ?? ""))
                    .sort((a, b) =>
                      (a.numeroRegistro ?? "").localeCompare(b.numeroRegistro ?? "", "pt-BR")
                    ),
                ].map((a) => ({
                  value: a.id.toString(),
                  label: a.especieNome ? `${a.numeroRegistro} — ${a.especieNome}` : `${a.numeroRegistro}`,
                }))}
                value={formData.animalId}
                isDisabled={loadingAnimais || !!editingId || !!preselectedAnimalId}
                onChange={(v) => set("animalId", v)}
                placeholder={loadingAnimais ? "Carregando animais..." : "Selecione o animal"}
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Alimentação<RequiredMark />
              </label>
              <Input
                type="date"
                name="dataAlimentacao"
                value={formData.dataAlimentacao}
                onChange={handleChange}
                required
                className="bg-white"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <h3 className="text-md font-semibold text-gray-800">Biometria</h3>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (g)<RequiredMark />
                </label>
                <CurrencyInput
                  value={formData.peso}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      peso: value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprimento (cm)
                  <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
                </label>
                <CurrencyInput
                  value={formData.comprimento}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      comprimento: value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprimento da Cauda (cm)
                  <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
                </label>
                <CurrencyInput
                  value={formData.comprimentoCauda}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      comprimentoCauda: value,
                    })
                  }
                />
              </div>
            </div>
          </FormLayoutBase>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}

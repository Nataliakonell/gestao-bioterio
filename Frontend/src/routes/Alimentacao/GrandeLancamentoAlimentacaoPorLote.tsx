import React, { useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { TipoRefeicao, SituacaoRefeicao } from "./RegistroAlimentacao"

export const TIPO_REFEICAO_OPCOES = [
  { value: TipoRefeicao.Roedor, label: "Roedor" },
  { value: TipoRefeicao.Ave, label: "Ave" },
  { value: TipoRefeicao.Peixe, label: "Peixe" },
  { value: TipoRefeicao.Insetos, label: "Insetos" },
  { value: TipoRefeicao.Carne_Vermelha, label: "Carne Vermelha" },
  { value: TipoRefeicao.Frutas, label: "Frutas" },
  { value: TipoRefeicao.Legumes, label: "Legumes" },
  { value: TipoRefeicao.Vegetais, label: "Vegetais" },
  { value: TipoRefeicao.Racao, label: "Ração" },
  { value: TipoRefeicao.Ovo, label: "Ovo" },
  { value: TipoRefeicao.ViaSonda, label: "Via Sonda" },
]

export interface RefeicaoGridItem {
  idTemp: string
  tipoRefeicao: TipoRefeicao
  pesoRefeicao: string
  situacaoRefeicao: SituacaoRefeicao
  observacao: string
}

export interface AnimalGridItem {
  animalId: number
  numeroRegistro: string
  especieNome: string
  salaNome: string
  ultimoPeso: number
  ultimaPesagemData?: string
  pesoAtual: string
  percentual: string
  pesoSugerido: string
  observacoes: string
  refeicoes: RefeicaoGridItem[]
}

export interface GradeLancamentoAlimentacaoPorLoteProps {
  gradeItens: AnimalGridItem[]
  salvando: boolean
  dataAlimentacao: string
  responsavel: string
  onAtualizarPeso: (index: number, novoPesoStr: string) => void
  onAtualizarPercentual: (index: number, novoPctStr: string) => void
  onAtualizarPesoSugerido: (index: number, valor: string) => void
  onRecalcular: (index: number) => void
  onAdicionarRefeicao: (animalIndex: number) => void
  onRemoverRefeicao: (animalIndex: number, refIndex: number) => void
  onAtualizarRefeicao: (
    animalIndex: number,
    refIndex: number,
    campo: keyof RefeicaoGridItem,
    valor: any
  ) => void
  onRemoverAnimal: (animalIndex: number) => void
  onSalvar: (salvarComoPendente: boolean) => Promise<void>
  onVoltar: () => void
}

export function GradeLancamentoAlimentacaoPorLote({
  gradeItens,
  salvando,
  dataAlimentacao,
  responsavel,
  onAtualizarPeso,
  onAtualizarPercentual,
  onAtualizarPesoSugerido,
  onRecalcular,
  onAdicionarRefeicao,
  onRemoverRefeicao,
  onAtualizarRefeicao,
  onRemoverAnimal,
  onSalvar,
  onVoltar,
}: GradeLancamentoAlimentacaoPorLoteProps) {
  const estatisticas = useMemo(() => {
    let pendente = 0
    let aceitou = 0
    let negou = 0
    let regurgitou = 0
    let animaisComAceitacao = 0

    gradeItens.forEach((item) => {
      let animalTeveAceite = false
      item.refeicoes.forEach((r) => {
        if (r.situacaoRefeicao === SituacaoRefeicao.Pendente) pendente++
        if (r.situacaoRefeicao === SituacaoRefeicao.Aceitou) {
          aceitou++
          animalTeveAceite = true
        }
        if (r.situacaoRefeicao === SituacaoRefeicao.Negou) negou++
        if (r.situacaoRefeicao === SituacaoRefeicao.Regurgitou) regurgitou++
      })
      if (animalTeveAceite) animaisComAceitacao++
    })

    return { pendente, aceitou, negou, regurgitou, animaisComAceitacao }
  }, [gradeItens])

  const columns: ColumnDef<AnimalGridItem>[] = [
{
      header: "Animal / Peso (g)",
      width: "200px",
      cellClassName: "align-top py-3",
      cell: (item) => {
        const animalIdx = gradeItens.findIndex((g) => g.animalId === item.animalId)
        return (
          <div className="flex flex-col gap-2">
            <div className="h-[36px] flex flex-col justify-center">
              <div className="font-bold text-foreground text-sm leading-tight">#{item.numeroRegistro}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[180px] leading-tight italic">{item.especieNome || item.salaNome}</div>
            </div>
            <div className="flex items-center gap-1.5 h-8">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Peso (g)"
                className="h-8 w-28 text-xs bg-white dark:bg-card"
                value={item.pesoAtual}
                onChange={(e) => onAtualizarPeso(animalIdx, e.target.value)}
                disabled={salvando}
              />
              <span className="text-xs text-muted-foreground">g</span>
            </div>
          </div>
        )
      },
    },
    {
      header: "Referência (%)",
      width: "110px",
      headerClassName: "text-center",
      cellClassName: "text-center align-top py-3",
      cell: (item) => {
        const animalIdx = gradeItens.findIndex((g) => g.animalId === item.animalId)
        return (
          <div className="flex flex-col gap-2">
            {/* Espaçador com a exata altura (36px) dos textos da 1ª coluna */}
            <div className="h-[36px]" />
            <div className="flex justify-center h-8">
              <Input
                type="number"
                step="1"
                min="1"
                max="100"
                className="h-8 w-20 text-center text-xs bg-white dark:bg-card"
                value={item.percentual}
                onChange={(e) => onAtualizarPercentual(animalIdx, e.target.value)}
                disabled={salvando}
              />
            </div>
          </div>
        )
      },
    },
    {
      header: "Peso sugerido (g)",
      width: "150px",
      cellClassName: "align-top py-3",
      cell: (item) => {
        const animalIdx = gradeItens.findIndex((g) => g.animalId === item.animalId)
        return (
          <div className="flex flex-col gap-2">
            {/* Espaçador com a exata altura (36px) dos textos da 1ª coluna */}
            <div className="h-[36px]" />
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                step="0.1"
                min="0"
                className="h-8 w-28 font-bold text-brand text-xs bg-white dark:bg-card"
                value={item.pesoSugerido}
                onChange={(e) => onAtualizarPesoSugerido(animalIdx, e.target.value)}
                disabled={salvando}
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-5 text-[11px] text-muted-foreground p-0 justify-start hover:text-foreground"
                onClick={() => onRecalcular(animalIdx)}
                disabled={salvando}
              >
                Recalcular ({item.percentual}%)
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      header: "Refeições Ofertadas",
      cellClassName: "align-top py-3",
      cell: (item) => {
        const animalIdx = gradeItens.findIndex((g) => g.animalId === item.animalId)
        return (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-start gap-2.5">
              {item.refeicoes.map((ref, refIdx) => (
                <div
                  key={ref.idTemp}
                  className="p-2.5 rounded-lg border bg-background/70 flex flex-col gap-2 w-56 shrink-0 shadow-2xs relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Refeição {refIdx + 1}
                    </span>
                    {item.refeicoes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoverRefeicao(animalIdx, refIdx)}
                        disabled={salvando}
                        className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Remover esta refeição"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <Select
                    value={String(ref.tipoRefeicao)}
                    onValueChange={(val) =>
                      onAtualizarRefeicao(animalIdx, refIdx, "tipoRefeicao", Number(val))
                    }
                    disabled={salvando}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_REFEICAO_OPCOES.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Peso (g)"
                      className="h-7 text-xs bg-white dark:bg-card"
                      value={ref.pesoRefeicao}
                      onChange={(e) =>
                        onAtualizarRefeicao(animalIdx, refIdx, "pesoRefeicao", e.target.value)
                      }
                      disabled={salvando}
                    />
                    <span className="text-xs text-muted-foreground">g</span>
                  </div>

                  <Select
                    value={String(ref.situacaoRefeicao)}
                    onValueChange={(val) =>
                      onAtualizarRefeicao(animalIdx, refIdx, "situacaoRefeicao", Number(val))
                    }
                    disabled={salvando}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(SituacaoRefeicao.Pendente)}>Pendente</SelectItem>
                      <SelectItem value={String(SituacaoRefeicao.Aceitou)}>Aceitou</SelectItem>
                      <SelectItem value={String(SituacaoRefeicao.Negou)}>Negou</SelectItem>
                      <SelectItem value={String(SituacaoRefeicao.Regurgitou)}>Regurgitou</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Obs. (opcional)"
                    className="h-7 text-xs bg-white dark:bg-card"
                    value={ref.observacao}
                    onChange={(e) =>
                      onAtualizarRefeicao(animalIdx, refIdx, "observacao", e.target.value)
                    }
                    disabled={salvando}
                  />
                </div>
              ))}
            </div>

            <div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 px-2 text-xs text-brand hover:text-brand/80 hover:bg-brand/10 border border-brand/20 inline-flex items-center gap-1.5"
                onClick={() => onAdicionarRefeicao(animalIdx)}
                disabled={salvando}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar refeição
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      header: "Balanço individual",
      width: "190px",
      cellClassName: "align-top py-3",
      cell: (item) => {
        const pesoNum = parseFloat(item.pesoAtual) || 0
        let totalOfertado = 0
        let totalConsumido = 0

        item.refeicoes.forEach((r) => {
          const p = parseFloat(r.pesoRefeicao) || 0
          totalOfertado += p
          if (r.situacaoRefeicao === SituacaoRefeicao.Aceitou) {
            totalConsumido += p
          }
        })
        const naoConsumido = totalOfertado - totalConsumido
        const ofertaSobrePeso = pesoNum > 0 ? ((totalOfertado / pesoNum) * 100).toFixed(1) : "0.0"

        return (
          <div className="text-xs space-y-1 bg-muted/40 p-2.5 rounded-lg border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ofertado:</span>
              <strong>{totalOfertado.toFixed(1)} g</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consumido:</span>
              <strong className={totalConsumido > 0 ? "text-green-600 dark:text-green-400" : ""}>
                {totalConsumido.toFixed(1)} g
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Não consumido:</span>
              <span className={naoConsumido > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                {naoConsumido.toFixed(1)} g
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t text-[11px] text-muted-foreground">
              <span>Oferta / peso:</span>
              <span>{ofertaSobrePeso}%</span>
            </div>
          </div>
        )
      },
    },
    {
      header: "",
      width: "48px",
      headerClassName: "text-center w-12",
      cellClassName: "text-center w-12 align-top py-3",
      cell: (item) => {
        const animalIdx = gradeItens.findIndex((g) => g.animalId === item.animalId)
        return (
          <button
            type="button"
            onClick={() => onRemoverAnimal(animalIdx)}
            disabled={salvando}
            className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-50"
            title="Remover animal do lote"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )
      },
    },
  ]

  const extraSections = (
    <>
      <FormSection title="Lançamento das Refeições por Animal">
        <div className="flex flex-col gap-3 w-full">
          <DataTable
            data={gradeItens}
            columns={columns}
            loading={salvando}
            emptyMessage="Nenhum animal adicionado à grade."
          />

          <div className="p-4 bg-card rounded-xl border shadow-xs flex flex-wrap items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-background">
                Pendente: {estatisticas.pendente}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
                Aceitou: {estatisticas.aceitou}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800">
                Negou: {estatisticas.negou}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                Regurgitou: {estatisticas.regurgitou}
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-600 text-white">
                Animais com aceitação: {estatisticas.animaisComAceitacao}
              </span>
            </div>
          </div>
        </div>
      </FormSection>
    </>
  )

  return (
    <FormLayoutBase
      titleFirstSection="Dados Gerais do Lote"
      columnsClassName="grid-cols-1 md:grid-cols-3"
      submitLabel="Salvar lote"
      onSubmit={async () => {
        await onSalvar(false)
      }}
      onCancel={onVoltar}
      checkIsDirty={() => gradeItens.length > 0}
      extraSections={extraSections}
    >
      <FormField label="Data da Alimentação">
        <Input
          type="text"
          value={new Date(dataAlimentacao).toLocaleDateString()}
          disabled
          className="bg-muted font-medium"
        />
      </FormField>

      <FormField label="Responsável pelo Lote">
        <Input
          type="text"
          value={responsavel || "—"}
          disabled
          className="bg-muted font-medium"
        />
      </FormField>

      <FormField label="Total de Animais">
        <div className="flex items-center h-10 px-3 border rounded-md bg-muted text-sm font-semibold text-foreground">
          {gradeItens.length} animal(is) no lote
        </div>
      </FormField>
    </FormLayoutBase>
  )
}
import { useState, useEffect } from "react"
import { Pill, Plus } from "lucide-react"
import { toast } from "sonner"
import { getUserInfo } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { getLocalIso } from "@/lib/date"
import { prescricaoMedicacaoService } from "@/services/PrescricaoMedicacaoService"
import { medicacaoService, type MedicacaoLookupVm } from "@/services/MedicacaoService"
import SeletorMedicacao from "@/components/clinico/SeletorMedicacao"
import CardResumoProjecaoMedicacao from "@/components/clinico/CardResumoProjecaoMedicacao"
import type { FormPrescricao } from "@/routes/Medicacao/NovaPrescricao"
import { animalService, type AnimalResponse } from "@/services/animalService"
import { getAlimentacoes } from "@/services/AlimentacaoService"
import { consultaService } from "@/services/ConsultaService"
import { CurrencyInput } from "@/components/ui/currency-input"
import { createBiometriaAnimal } from "@/services/BiometriaAnimalService"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"

import { VIA_ADMINISTRACAO_OPTIONS } from "@/routes/Medicacao/NovaPrescricao"
import { usePermissions } from "@/contexts/PermissionsContext"
const VIA_OPTIONS = VIA_ADMINISTRACAO_OPTIONS

interface PrescricaoMedicacaoModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
}

const emptyPrescricao = (): FormPrescricao => {
  const localIso = getLocalIso()
  return {
    id: `new_${Date.now()}_${Math.random()}`,
    medicacaoId: "",
    principioAtivo: "",
    nomeComercial: "",
    volumeDose: "",
    viaAdministracao: "",
    quantidadeDoses: "1",
    intervaloHoras: "8",
    dataHoraInicio: localIso,
    observacao: "",
  }
}

export function PrescricaoMedicacaoModal({ isOpen, onClose, animalId, onSaved }: PrescricaoMedicacaoModalProps) {
  const [medicacoes, setMedicacoes] = useState<MedicacaoLookupVm[]>([])
  const [loadingMedicacoes, setLoadingMedicacoes] = useState(true)
  const [prescricoes, setPrescricoes] = useState<FormPrescricao[]>([emptyPrescricao()])
  const [animalDetails, setAnimalDetails] = useState<AnimalResponse | null>(null)
  const [ultimaAlimentacao, setUltimaAlimentacao] = useState<string | null>(null)
  const [ultimaConsulta, setUltimaConsulta] = useState<string | null>(null)
  const [biometria, setBiometria] = useState({ peso: "", comprimento: "", comprimentoCauda: "" })
  const [originalBiometria, setOriginalBiometria] = useState({ peso: "", comprimento: "", comprimentoCauda: "" })
  const [responsavel, setResponsavel] = useState("")
  const { hasPermission } = usePermissions()

  const generoMap: Record<number, string> = { 1: "Macho", 2: "Fêmea", 3: "Não Identificado" }
  const faseDeVidaMap: Record<number, string> = { 1: "Filhote", 2: "Jovem", 3: "Adulto" }
  const formatData = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "-")
  const formatPeso = (peso?: number) => (peso !== undefined && peso !== null ? `${peso}g` : "-")

  useEffect(() => {
    if (!isOpen) return
    setLoadingMedicacoes(true)
    const user = getUserInfo()
    setResponsavel(user?.name || "")
    medicacaoService.getLookup().then(setMedicacoes).catch(() => toast.error("Erro ao carregar medicações")).finally(() => setLoadingMedicacoes(false))
    setPrescricoes([emptyPrescricao()])

    if (animalId) {
      Promise.all([
        animalService.getById(animalId).catch(() => null),
        getAlimentacoes({ animalId, pageSize: 1 }).catch(() => null),
        consultaService.getAll({ animalId }).catch(() => []),
      ]).then(([animalRes, alimentacaoRes, consultasRes]) => {
        setAnimalDetails(animalRes as any)
        if ((alimentacaoRes as any)?.items?.length > 0) setUltimaAlimentacao((alimentacaoRes as any).items[0].dataAlimentacao)
        else setUltimaAlimentacao(null)
        if (Array.isArray(consultasRes) && consultasRes.length > 0) {
          const sorted = [...consultasRes].sort((a: any, b: any) => new Date(b.dataHoraConsulta).getTime() - new Date(a.dataHoraConsulta).getTime())
          setUltimaConsulta(sorted[0].dataHoraConsulta)
        } else setUltimaConsulta(null)

        const bio = (animalRes as any)?.biometriaAnimal
        if (bio) {
          const b = {
            peso: bio.peso ? String(bio.peso).replace(".", ",") : "",
            comprimento: bio.comprimento ? String(bio.comprimento).replace(".", ",") : "",
            comprimentoCauda: bio.comprimentoCauda ? String(bio.comprimentoCauda).replace(".", ",") : "",
          }
          setBiometria(b)
          setOriginalBiometria(b)
        } else {
          const b = { peso: "", comprimento: "", comprimentoCauda: "" }
          setBiometria(b)
          setOriginalBiometria(b)
        }
      })
    }
  }, [isOpen, animalId])

  const setPrescricao = (id: string, field: keyof FormPrescricao, value: string) => {
    setPrescricoes((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }
  const addPrescricao = () => setPrescricoes((prev) => [...prev, emptyPrescricao()])
  const removePrescricao = (id: string) => setPrescricoes((prev) => prev.filter((p) => p.id !== id))

  const isDirty = Boolean(
    prescricoes.some((p) => p.medicacaoId || p.volumeDose || p.observacao) ||
    biometria.peso !== originalBiometria.peso ||
    biometria.comprimento !== originalBiometria.comprimento ||
    biometria.comprimentoCauda !== originalBiometria.comprimentoCauda
  )

  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setPrescricoes([emptyPrescricao()])
    handleConfirmCancel()
  }

  const parseNum = (v: string) => {
    if (!v) return undefined
    const num = parseFloat(v.replace(",", "."))
    return isNaN(num) ? undefined : num
  }

  const handleSave = async () => {
    for (const [index, form] of prescricoes.entries()) {
      const num = index + 1
      if (!form.medicacaoId) {
        toast.error(`Selecione a medicação na prescrição ${num}.`)
        return
      }
      if (!form.volumeDose.trim()) {
        toast.error(`Informe o volume/dose na prescrição ${num}.`)
        return
      }
      if (!form.viaAdministracao) {
        toast.error(`Selecione a via de administração na prescrição ${num}.`)
        return
      }
      if (!form.dataHoraInicio) {
        toast.error(`Informe a data e hora de início na prescrição ${num}.`)
        return
      }
      const qtdNum = Number(form.quantidadeDoses) || 1
      if (qtdNum > 1 && (!form.intervaloHoras || Number(form.intervaloHoras) <= 0)) {
        toast.error(`Informe o intervalo entre doses na prescrição ${num}.`)
        return
      }
    }

    try {
      setSaving(true)
      const pPeso = parseNum(biometria.peso)
      const pComp = parseNum(biometria.comprimento)
      const pCauda = parseNum(biometria.comprimentoCauda)
      const oPeso = parseNum(originalBiometria.peso)
      const oComp = parseNum(originalBiometria.comprimento)
      const oCauda = parseNum(originalBiometria.comprimentoCauda)

      if (pPeso !== oPeso || pComp !== oComp || pCauda !== oCauda) {
        await createBiometriaAnimal({
          animalId,
          peso: pPeso ?? 0,
          comprimento: pComp ?? 0,
          comprimentoCauda: pCauda ?? 0,
          dataMedicao: new Date().toISOString(),
        }).catch(() => {
          toast.error("Aviso: Não foi possível salvar a biometria atualizada.")
        })
      }

      const promises = prescricoes.map((form) => {
        const qtd = Number(form.quantidadeDoses) || 1
        return prescricaoMedicacaoService.create({
          animalId,
          medicacaoId: Number(form.medicacaoId),
          volumeDose: form.volumeDose.trim(),
          viaAdministracao: Number(form.viaAdministracao) || 7,
          quantidadeDoses: qtd,
          intervaloEntreDosesHoras: qtd === 1 ? 0 : Number(form.intervaloHoras) || 0,
          dataHoraInicio: form.dataHoraInicio,
          observacao: form.observacao.trim() || undefined,
          responsavel: responsavel.trim() || undefined,
        })
      })
      const results = await Promise.all(promises)
      
      for (const res of results) {
        if (res && res.success === false) {
          const errorMsg = res.validationErrors?.join(", ") || res.message || "Erro na validação do servidor."
          toast.error(`Erro: ${errorMsg}`)
          setSaving(false)
          return
        }
      }

      toast.success(prescricoes.length > 1 ? `${prescricoes.length} prescrições registradas com sucesso!` : "Prescrição registrada com sucesso!")
      setPrescricoes([emptyPrescricao()])
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Erro ao salvar prescrição")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title="Prescrever Medicação"
      icon={<Pill className="h-4 w-4" />}
      iconBg="teal"
      size="lg"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancelWithReset}
      footerProps={{ onCancel: handleAttemptClose, onSave: handleSave, saveLabel: prescricoes.length > 1 ? `Salvar ${prescricoes.length} prescrições` : "Salvar prescrição", saving }}
    >
      <div className="space-y-6">
        {animalDetails && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dados do Animal</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Nº Registro:</span>
                <span className="font-semibold text-slate-800">#{animalDetails.numeroRegistro}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Espécie:</span>
                <span className="font-semibold text-slate-800">{animalDetails.especie?.nome ?? (animalDetails as any).especieNome ?? "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gênero:</span>
                <span className="font-semibold text-slate-800">{generoMap[animalDetails.genero] ?? "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fase de Vida:</span>
                <span className="font-semibold text-slate-800">{faseDeVidaMap[animalDetails.faseDeVida] ?? "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Peso Atual:</span>
                <span className="font-semibold text-slate-800">{formatPeso(animalDetails.biometriaAnimal?.peso)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Últ. Alimentação:</span>
                <span className="font-semibold text-slate-800">{formatData(ultimaAlimentacao)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Últ. Consulta:</span>
                <span className="font-semibold text-slate-800">{formatData(ultimaConsulta)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80">
              <h4 className="text-[11px] font-semibold text-slate-600 mb-2">Biometria (Atualizar se necessário)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Peso (g)</label>
                  <CurrencyInput value={biometria.peso} onValueChange={(v) => setBiometria((b) => ({ ...b, peso: v }))} placeholder="Ex: 250,5" className="bg-white text-xs h-8" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Comprimento (cm)</label>
                  <CurrencyInput value={biometria.comprimento} onValueChange={(v) => setBiometria((b) => ({ ...b, comprimento: v }))} placeholder="Ex: 15,2" className="bg-white text-xs h-8" />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Comprimento Cauda (cm)</label>
                  <CurrencyInput value={biometria.comprimentoCauda} onValueChange={(v) => setBiometria((b) => ({ ...b, comprimentoCauda: v }))} placeholder="Ex: 8,0" className="bg-white text-xs h-8" />
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            {prescricoes.map((form, index) => (
              <div key={form.id} className="rounded-xl border border-slate-200 bg-white p-4 relative">
                {prescricoes.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs" onClick={() => removePrescricao(form.id)}>
                    Remover
                  </Button>
                )}
                <div className="flex items-center gap-2 mb-3 pr-16">
                  <Pill className="h-4 w-4 text-teal-600" />
                  <h4 className="font-semibold text-sm text-teal-700">Medicação {index + 1}</h4>
                </div>
                <div className="space-y-4">
                  <FormField label="Medicação" required>
                    <SeletorMedicacao medicacoes={medicacoes} setMedicacoes={setMedicacoes} value={form.medicacaoId} onChange={(v) => setPrescricao(form.id, "medicacaoId", v)} loading={loadingMedicacoes} />
                  </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Volume/Dose" required>
                      <Input value={form.volumeDose} onChange={(e) => setPrescricao(form.id, "volumeDose", e.target.value)} placeholder="Ex: 0.5 ml, 2 mg" className="bg-white" />
                    </FormField>
                    <FormField label="Via de administração" required>
                      <Select value={form.viaAdministracao} onValueChange={(v) => setPrescricao(form.id, "viaAdministracao", v)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {VIA_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Qtd. doses" required>
                      <Input type="number" min={1} value={form.quantidadeDoses} onChange={(e) => setPrescricao(form.id, "quantidadeDoses", e.target.value)} className="bg-white" />
                    </FormField>
                    <FormField label={`Intervalo (h) ${form.quantidadeDoses !== "1" ? "*" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">A cada</span>
                        <Input
                          type="number"
                          min={form.quantidadeDoses === "1" ? 0 : 1}
                          value={form.quantidadeDoses === "1" ? "0" : form.intervaloHoras}
                          disabled={form.quantidadeDoses === "1"}
                          onChange={(e) => setPrescricao(form.id, "intervaloHoras", e.target.value)}
                          className="w-20 bg-white text-center"
                        />
                        <span className="text-xs text-gray-500">h</span>
                      </div>
                    </FormField>
                    <FormField label="Data/hora início" required>
                      <DateTimePicker
                        date={form.dataHoraInicio ? new Date(form.dataHoraInicio) : undefined}
                        setDate={(date) => {
                          if (date) {
                            const pad = (n: number) => n.toString().padStart(2, "0")
                            const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
                            setPrescricao(form.id, "dataHoraInicio", localIso)
                          } else {
                            setPrescricao(form.id, "dataHoraInicio", "")
                          }
                        }}
                      />
                    </FormField>
                  </div>
                  <FormField label="Observação">
                    <Textarea value={form.observacao} onChange={(e) => setPrescricao(form.id, "observacao", e.target.value)} rows={2} placeholder="Orientações adicionais..." className="bg-white" />
                  </FormField>

                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addPrescricao} className="w-full border-dashed border-2 bg-white hover:bg-gray-50 text-teal-700 border-teal-200 flex items-center justify-center gap-2 mb-6">
              <Plus className="w-4 h-4" /> Adicionar outra medicação
            </Button>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-6 self-start">
            <CardResumoProjecaoMedicacao prescricoes={prescricoes} medicacoes={medicacoes} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 mt-6">
          <ResponsavelSelect
            value={responsavel}
            onChange={setResponsavel}
            required
          />
        </div>
      </div>
    </ModalShell>
  )
}

import React, { useState } from "react"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { Trash2, AlertCircle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface DadosTransporteFauna {
  // Seção 1: Destinatário
  destTipo: string
  destOutrosEspecificar: string
  destNome: string
  destCpfCnpj: string
  destEndereco: string
  destBairro: string
  destMunicipio: string
  destCep: string
  destTelefone: string
  destCtf: string

  // Seção 2: Objeto
  objetoTipo: string
  objetoOutrosEspecificar: string

  // Seção 4: Transporte
  transporteMeio: string
  transporteCondutoresVeiculos: string
  transporteRota: string
  transporteData: string
}

export const TEXTO_PADRAO_CONDUTOR_VEICULOS = 
`Nome do condutor/transportadora: Luiz Humberto Guimarães Riquelme Junior CPF 033.728.421-03 / Henrique Emanuel Hatzis Gomes CPF 431.428.668-76 / Brenda Silva Campos Martins CPF 138.758.397-22 / João Batista Camilo de Araújo CPF 401.996.358-46. / Thiago Guazina Morinigo CPF: 062.428.381-09
Veículo (marca, tipo, ano e placa): KWID BRANCO PLACA SLX8G41 ANO 2023; SIENA BRANCO PLACA QAX7103 ANO 2020; L-200 AZUL PLACA NOO4161 ANO 2014; L200 TRITON Placa: BEF-4I50 BRANCA Ano: 2023; Van Master Placa: DWO-6I12 Ano: 2024 Branca`

interface FormularioTransporteFaunaProps {
  dados: DadosTransporteFauna
  onChange: (novosDados: Partial<DadosTransporteFauna>) => void
  animaisSelecionados: Array<{
    id: number
    numeroRegistro?: string
    numeroChip?: string
    especieNome?: string
    genero?: string
  }>
  onRemoverAnimal?: (animalId: number) => void
}

export function FormularioTransporteFauna({
  dados,
  onChange,
  animaisSelecionados,
  onRemoverAnimal
}: FormularioTransporteFaunaProps) {
  const [buscandoCep, setBuscandoCep] = useState(false)

  const formatarCep = (valor: string) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 8)
    if (limpo.length > 5) {
      return `${limpo.slice(0, 5)}-${limpo.slice(5)}`
    }
    return limpo
  }

  const consultarCep = async (cepBruto: string) => {
    const cepLimpo = cepBruto.replace(/\D/g, "")
    if (cepLimpo.length !== 8) return

    try {
      setBuscandoCep(true)
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()

      if (data.erro) {
        toast.error("CEP não encontrado.")
        return
      }

      // Preenche os campos de endereço automaticamente
      const updates: Partial<DadosTransporteFauna> = {}
      if (data.logradouro) {
        updates.destEndereco = data.logradouro
      }
      if (data.bairro) {
        updates.destBairro = data.bairro
      }
      if (data.localidade && data.uf) {
        updates.destMunicipio = `${data.localidade} / ${data.uf}`
      }

      onChange(updates)
      toast.success("Endereço preenchido automaticamente pelo CEP!")
    } catch (error) {
      console.error("Erro ao consultar CEP:", error)
      toast.error("Não foi possível consultar o CEP no momento.")
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCep(e.target.value)
    onChange({ destCep: formatado })

    const limpo = formatado.replace(/\D/g, "")
    if (limpo.length === 8) {
      consultarCep(limpo)
    }
  }
  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: DESTINATÁRIO */}
      <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
          1. DESTINATÁRIO (Pessoa física ou Instituição ou Empresa)
        </h4>

        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-2 block">
            Tipo de Destinatário
          </Label>
          <RadioGroup
            value={dados.destTipo}
            onValueChange={(val) => onChange({ destTipo: val })}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
          >
            {[
              { id: "zoo", val: "Zoológico", label: "Zoológico" },
              { id: "cientifico", val: "Instituição/criadouro científico", label: "Instituição/criadouro científico" },
              { id: "pesquisador", val: "Pesquisador", label: "Pesquisador" },
              { id: "expositor", val: "Expositor", label: "Expositor" },
              { id: "comercial", val: "Criadouro comercial", label: "Criadouro comercial" },
              { id: "conservacionista", val: "Criadouro conservacionista", label: "Criadouro conservacionista" },
              { id: "outros", val: "Outros", label: "Outros" }
            ].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <RadioGroupItem value={opt.val} id={opt.id} />
                <Label htmlFor={opt.id} className="text-xs font-medium cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {dados.destTipo === "Outros" && (
          <FormField label="Especifique outro destinatário">
            <Input
              value={dados.destOutrosEspecificar}
              onChange={(e) => onChange({ destOutrosEspecificar: e.target.value })}
              placeholder="Ex: Instrução de Ofidismo / Base Aérea"
              className="bg-white"
            />
          </FormField>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <FormField label="Nome / Razão Social" className="col-span-full md:col-span-2">
            <Input
              value={dados.destNome}
              onChange={(e) => onChange({ destNome: e.target.value })}
              placeholder="Ex: Base Aérea de Campo Grande - BACG"
              className="bg-white"
            />
          </FormField>

          <FormField label="CNPJ / CPF">
            <Input
              value={dados.destCpfCnpj}
              onChange={(e) => onChange({ destCpfCnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
              className="bg-white"
            />
          </FormField>

          <FormField label="Endereço do requerente" className="col-span-full md:col-span-2">
            <Input
              value={dados.destEndereco}
              onChange={(e) => onChange({ destEndereco: e.target.value })}
              placeholder="Avenida / Rua / Número"
              className="bg-white"
            />
          </FormField>

          <FormField label="Bairro">
            <Input
              value={dados.destBairro}
              onChange={(e) => onChange({ destBairro: e.target.value })}
              placeholder="Ex: Santo Antônio"
              className="bg-white"
            />
          </FormField>

          <FormField label="Município / UF">
            <Input
              value={dados.destMunicipio}
              onChange={(e) => onChange({ destMunicipio: e.target.value })}
              placeholder="Campo Grande / MS"
              className="bg-white"
            />
          </FormField>

          <FormField label="CEP">
            <div className="relative flex items-center">
              <Input
                value={dados.destCep}
                onChange={handleCepChange}
                placeholder="79000-000"
                maxLength={9}
                className="bg-white pr-9"
              />
              <div className="absolute right-2.5 text-slate-400">
                {buscandoCep ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <button
                    type="button"
                    onClick={() => consultarCep(dados.destCep)}
                    title="Buscar endereço por CEP"
                    className="hover:text-blue-600 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </FormField>

          <FormField label="Telefone">
            <Input
              value={dados.destTelefone}
              onChange={(e) => onChange({ destTelefone: e.target.value })}
              placeholder="(67) 0000-0000"
              className="bg-white"
            />
          </FormField>

          <FormField label="CTF nº">
            <Input
              value={dados.destCtf}
              onChange={(e) => onChange({ destCtf: e.target.value })}
              placeholder="Cadastro Técnico Federal"
              className="bg-white"
            />
          </FormField>
        </div>
      </div>

      {/* SEÇÃO 2: OBJETO */}
      <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
          2. OBJETO DO TRANSPORTE
        </h4>

        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-2 block">
            Tipo de Objeto <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={dados.objetoTipo}
            onValueChange={(val) => onChange({ objetoTipo: val })}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {[
              { id: "obj-zoo", val: "Transporte de material zoológico (especificar)", label: "Transporte de material zoológico (especificar)" },
              { id: "obj-prod", val: "Transporte de produto e subproduto da fauna (especificar)", label: "Transporte de produto e subproduto da fauna (especificar)" },
              { id: "obj-exp", val: "Exposição de animais silvestres", label: "Exposição de animais silvestres" },
              { id: "obj-outros", val: "Outros (especificar)", label: "Outros (especificar)" }
            ].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <RadioGroupItem value={opt.val} id={opt.id} />
                <Label htmlFor={opt.id} className="text-xs font-medium cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {(dados.objetoTipo === "Outros (especificar)" ||
          dados.objetoTipo.includes("especificar")) && (
          <FormField label="Especifique o objeto">
            <Input
              value={dados.objetoOutrosEspecificar}
              onChange={(e) => onChange({ objetoOutrosEspecificar: e.target.value })}
              placeholder="Ex: Instrução de ofidismo"
              className="bg-white"
            />
          </FormField>
        )}
      </div>

      {/* SEÇÃO 3: DESCRIÇÃO DO MATERIAL / ANIMAIS SELECIONADOS */}
      <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="font-bold text-slate-800 text-sm">
            3. DESCRIÇÃO DO MATERIAL (tipo, sexo, nome científico, quantidade, marcação, etc.)
          </h4>
        </div>

        {animaisSelecionados.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Nenhum animal selecionado. Selecione os animais na lista abaixo para incluir no documento oficial.</span>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
            {animaisSelecionados.map((animal, idx) => (
              <div key={animal.id} className="flex items-center justify-between p-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-500">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 italic mr-2">
                      {animal.especieNome || "Espécie não informada"}
                    </span>
                    <span className="text-slate-600 mr-2 font-medium">
                      {animal.genero || "Gênero n/i"}
                    </span>
                    <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      Chip: {animal.numeroChip || animal.numeroRegistro || "Sem chip"}
                    </span>
                  </div>
                </div>

                {onRemoverAnimal && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoverAnimal(animal.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    title="Remover animal do evento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO 4: MEIO DE TRANSPORTE E DADOS DO TRANSPORTADOR */}
      <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
          4. MEIO DE TRANSPORTE E DADOS DO TRANSPORTADOR
        </h4>

        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-2 block">
            Meio de Transporte
          </Label>
          <RadioGroup
            value={dados.transporteMeio}
            onValueChange={(val) => onChange({ transporteMeio: val })}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {[
              { id: "transp-rod", val: "Terrestre - Rodoviário", label: "Terrestre – Rodoviário" },
              { id: "transp-fer", val: "Terrestre - Ferroviário", label: "Terrestre – Ferroviário" },
              { id: "transp-aer", val: "Aéreo", label: "Aéreo" },
              { id: "transp-flu", val: "Fluvial", label: "Fluvial" }
            ].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <RadioGroupItem value={opt.val} id={opt.id} />
                <Label htmlFor={opt.id} className="text-xs font-medium cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <FormField
          label="Especifique Meio de transporte e dados do transportador"
          description="Campos editáveis com os motoristas credenciados e veículos cadastrados na UCDB"
        >
          <Textarea
            rows={6}
            value={dados.transporteCondutoresVeiculos}
            onChange={(e) => onChange({ transporteCondutoresVeiculos: e.target.value })}
            className="bg-white font-mono text-xs leading-relaxed"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Rodovias utilizadas (Rota)">
            <Input
              value={dados.transporteRota}
              onChange={(e) => onChange({ transporteRota: e.target.value })}
              placeholder="Ex: Av. Tamandaré / Av. Duque de Caxias"
              className="bg-white"
            />
          </FormField>

          <FormField label="Data do transporte a ser efetuado">
            <Input
              value={dados.transporteData}
              onChange={(e) => onChange({ transporteData: e.target.value })}
              placeholder="DD/MM/AAAA - DD/MM/AAAA"
              className="bg-white"
            />
          </FormField>
        </div>
      </div>
    </div>
  )
}

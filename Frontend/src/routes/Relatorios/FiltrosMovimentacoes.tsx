import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { AnimalLookupVm } from '@/services/animalService';
import type { LocalizacaoListVm } from '@/services/LocalizacaoService';

export interface MovimentacoesFiltrosState {
  dataInicio: string;
  dataFim: string;
  animalId: string;
  tipoMovimentacao: string;
  localizacaoId: string;
}

interface FiltrosMovimentacoesProps {
  filtros: MovimentacoesFiltrosState;
  onChange: (novos: MovimentacoesFiltrosState) => void;
  animaisLookup: AnimalLookupVm[];
  localizacoes: LocalizacaoListVm[];
}

export function FiltrosMovimentacoes({ filtros, onChange, animaisLookup, localizacoes }: FiltrosMovimentacoesProps) {
  const animalOptions = [
    { value: '', label: 'Todos os animais' },
    ...animaisLookup.map((a) => ({
      value: String(a.id),
      label: `${a.numeroRegistro} (${a.especieNome})`
    }))
  ];

  const localizacaoOptions = [
    { value: '', label: 'Todas as localizações' },
    ...localizacoes.map((loc) => ({
      value: String(loc.id),
      label: loc.caminhoHierarquia ? `${loc.caminhoHierarquia} > ${loc.nome}` : loc.nome
    }))
  ];

  return (
    <>
      <FormField label="Data Início">
        <DatePickerInput
          value={filtros.dataInicio}
          onChange={(val) => onChange({ ...filtros, dataInicio: val })}
        />
      </FormField>

      <FormField label="Data Fim">
        <DatePickerInput
          value={filtros.dataFim}
          onChange={(val) => onChange({ ...filtros, dataFim: val })}
        />
      </FormField>

      <FormField label="Tipo de Movimentação">
        <Select
          value={filtros.tipoMovimentacao || 'all'}
          onValueChange={(v) => onChange({ ...filtros, tipoMovimentacao: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="1">Transferência</SelectItem>
            <SelectItem value="2">Saída para Evento</SelectItem>
            <SelectItem value="3">Retorno de Evento</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Animal">
        <SearchableSelect
          placeholder="Digite ou selecione o animal..."
          options={animalOptions}
          value={filtros.animalId || ''}
          onChange={(val) => onChange({ ...filtros, animalId: val })}
        />
      </FormField>

      <FormField label="Localização Destino">
        <SearchableSelect
          placeholder="Digite ou selecione a localização..."
          options={localizacaoOptions}
          value={filtros.localizacaoId || ''}
          onChange={(val) => onChange({ ...filtros, localizacaoId: val })}
        />
      </FormField>
    </>
  );
}

import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ResponsavelSelect } from '@/components/clinico/ResponsavelSelect';
import type { AnimalLookupVm } from '@/services/animalService';

export interface ClinicoFiltrosState {
  dataInicio: string;
  dataFim: string;
  tipoClinico: string;
  animalId: string;
  veterinario: string;
}

interface FiltrosClinicoProps {
  filtros: ClinicoFiltrosState;
  onChange: (novos: ClinicoFiltrosState) => void;
  animaisLookup: AnimalLookupVm[];
}

export function FiltrosClinico({ filtros, onChange, animaisLookup }: FiltrosClinicoProps) {
  const animalOptions = [
    { value: '', label: 'Todos os animais' },
    ...animaisLookup.map((a) => ({
      value: String(a.id),
      label: `${a.numeroRegistro} (${a.especieNome})`
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

      <FormField label="Tipo Clínico">
        <Select
          value={filtros.tipoClinico || 'all'}
          onValueChange={(v) => onChange({ ...filtros, tipoClinico: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os tipos clínicos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos clínicos</SelectItem>
            <SelectItem value="1">Consultas</SelectItem>
            <SelectItem value="2">Alta Ambulatorial</SelectItem>
            <SelectItem value="3">Liberação de Quarentena</SelectItem>
            <SelectItem value="4">Medicações Prescritas</SelectItem>
            <SelectItem value="5">Solicitações de Exames</SelectItem>
            <SelectItem value="6">Evolução Clínica</SelectItem>
            <SelectItem value="7">Procedimentos</SelectItem>
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

      <ResponsavelSelect
        label="Veterinário / Responsável"
        placeholder="Selecione o responsável..."
        required={false}
        value={filtros.veterinario}
        onChange={(nome) => onChange({ ...filtros, veterinario: nome })}
      />
    </>
  );
}

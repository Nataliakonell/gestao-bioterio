import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsavelSelect } from '@/components/clinico/ResponsavelSelect';
import type { EspecieLookupVm } from '@/services/EspecieService';

export interface AlimentacaoFiltrosState {
  dataInicio: string;
  dataFim: string;
  especieId: string;
  consumo: string;
  responsavel: string;
}

interface FiltrosAlimentacaoProps {
  filtros: AlimentacaoFiltrosState;
  onChange: (novos: AlimentacaoFiltrosState) => void;
  especies: EspecieLookupVm[];
}

export function FiltrosAlimentacao({ filtros, onChange, especies }: FiltrosAlimentacaoProps) {
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

      <FormField label="Espécie">
        <Select
          value={filtros.especieId || 'all'}
          onValueChange={(v) => onChange({ ...filtros, especieId: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todas as espécies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as espécies</SelectItem>
            {especies.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Consumo">
        <Select
          value={filtros.consumo || 'all'}
          onValueChange={(v) => onChange({ ...filtros, consumo: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os consumos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="1">Comeu</SelectItem>
            <SelectItem value="2">Negou</SelectItem>
            <SelectItem value="3">Regurgitou</SelectItem>
            <SelectItem value="0">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <ResponsavelSelect
        label="Responsável pelo Trato"
        placeholder="Selecione o responsável..."
        required={false}
        value={filtros.responsavel}
        onChange={(nome) => onChange({ ...filtros, responsavel: nome })}
      />
    </>
  );
}

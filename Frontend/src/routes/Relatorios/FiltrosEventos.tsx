import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface EventosFiltrosState {
  dataInicio: string;
  dataFim: string;
  tipoEvento: string;
  status: string;
}

interface FiltrosEventosProps {
  filtros: EventosFiltrosState;
  onChange: (novos: EventosFiltrosState) => void;
}

export function FiltrosEventos({ filtros, onChange }: FiltrosEventosProps) {
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

      <FormField label="Tipo de Evento">
        <Select
          value={filtros.tipoEvento || 'all'}
          onValueChange={(v) => onChange({ ...filtros, tipoEvento: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="1">Interno</SelectItem>
            <SelectItem value="2">Externo</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Status">
        <Select
          value={filtros.status || 'all'}
          onValueChange={(v) => onChange({ ...filtros, status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="1">Agendado</SelectItem>
            <SelectItem value="2">Em Andamento</SelectItem>
            <SelectItem value="3">Cancelado</SelectItem>
            <SelectItem value="4">Concluído</SelectItem>
            <SelectItem value="5">Retorno Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </>
  );
}

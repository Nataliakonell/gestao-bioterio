import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { EspecieLookupVm } from '@/services/EspecieService';

export interface SisfaunaFiltrosState {
  anoReferencia: string;
  dataEntradaInicio: string;
  dataEntradaFim: string;
  especieId: string;
  somenteAtivos: boolean;
}

interface FiltrosSisfaunaProps {
  filtros: SisfaunaFiltrosState;
  onChange: (novos: SisfaunaFiltrosState) => void;
  especies: EspecieLookupVm[];
}

export function FiltrosSisfauna({ filtros, onChange, especies }: FiltrosSisfaunaProps) {
  return (
    <>
      <FormField label="Ano de Referência">
        <Input
          type="number"
          placeholder="Ex: 2026"
          value={filtros.anoReferencia}
          onChange={(e) => onChange({ ...filtros, anoReferencia: e.target.value })}
        />
      </FormField>

      <FormField label="Data Entrada Início">
        <DatePickerInput
          value={filtros.dataEntradaInicio}
          onChange={(val) => onChange({ ...filtros, dataEntradaInicio: val })}
        />
      </FormField>

      <FormField label="Data Entrada Fim">
        <DatePickerInput
          value={filtros.dataEntradaFim}
          onChange={(val) => onChange({ ...filtros, dataEntradaFim: val })}
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

      <div className="flex items-center pt-7">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
          <Checkbox
            checked={filtros.somenteAtivos}
            onCheckedChange={(checked) => onChange({ ...filtros, somenteAtivos: !!checked })}
          />
          Somente animais vivos no plantel
        </label>
      </div>
    </>
  );
}

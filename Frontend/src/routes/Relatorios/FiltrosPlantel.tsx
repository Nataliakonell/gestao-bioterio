import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { EspecieLookupVm } from '@/services/EspecieService';
import type { GrupoLookupVm } from '@/services/GrupoService';

export interface PlantelFiltrosState {
  grupoId: string;
  especieId: string;
  situacao: string;
  genero: string;
  faseDeVida: string;
  dataEntradaInicio: string;
  dataEntradaFim: string;
}

interface FiltrosPlantelProps {
  filtros: PlantelFiltrosState;
  onChange: (novos: PlantelFiltrosState) => void;
  grupos: GrupoLookupVm[];
  especies: EspecieLookupVm[];
}

export function FiltrosPlantel({ filtros, onChange, grupos, especies }: FiltrosPlantelProps) {
  const especieOptions = [
    { value: '', label: 'Todas as espécies' },
    ...especies.map((e) => ({
      value: String(e.id),
      label: e.nomePopular ? `${e.nome} (${e.nomePopular})` : e.nome
    }))
  ];

  return (
    <>
      <FormField label="Grupo">
        <Select
          value={filtros.grupoId || 'all'}
          onValueChange={(v) => onChange({ ...filtros, grupoId: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {grupos.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Espécie">
        <SearchableSelect
          placeholder="Selecione ou digite a espécie..."
          options={especieOptions}
          value={filtros.especieId || ''}
          onChange={(val) => onChange({ ...filtros, especieId: val })}
        />
      </FormField>

      <FormField label="Situação">
        <Select
          value={filtros.situacao || 'all'}
          onValueChange={(v) => onChange({ ...filtros, situacao: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todas as situações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            <SelectItem value="1">Vivo</SelectItem>
            <SelectItem value="2">Óbito</SelectItem>
            <SelectItem value="3">Reintroduzido</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Gênero">
        <Select
          value={filtros.genero || 'all'}
          onValueChange={(v) => onChange({ ...filtros, genero: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todos os gêneros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os gêneros</SelectItem>
            <SelectItem value="1">Macho</SelectItem>
            <SelectItem value="2">Fêmea</SelectItem>
            <SelectItem value="3">Não identificado</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Fase de Vida">
        <Select
          value={filtros.faseDeVida || 'all'}
          onValueChange={(v) => onChange({ ...filtros, faseDeVida: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-card">
            <SelectValue placeholder="Todas as fases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fases</SelectItem>
            <SelectItem value="1">Filhote</SelectItem>
            <SelectItem value="2">Jovem</SelectItem>
            <SelectItem value="3">Adulto</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Entrada a partir de">
        <DatePickerInput
          value={filtros.dataEntradaInicio}
          onChange={(val) => onChange({ ...filtros, dataEntradaInicio: val })}
        />
      </FormField>

      <FormField label="Entrada até">
        <DatePickerInput
          value={filtros.dataEntradaFim}
          onChange={(val) => onChange({ ...filtros, dataEntradaFim: val })}
        />
      </FormField>
    </>
  );
}

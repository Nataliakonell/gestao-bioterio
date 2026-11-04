import React from 'react';
import { FormField } from '@/components/ui/form-field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import type { EspecieLookupVm } from '@/services/EspecieService';
import type { LocalizacaoListVm } from '@/services/LocalizacaoService';

export interface InstalacoesFiltrosState {
  localizacaoId: string;
  incluirSublocais: boolean;
  especieId: string;
}

interface FiltrosInstalacoesProps {
  filtros: InstalacoesFiltrosState;
  onChange: (novos: InstalacoesFiltrosState) => void;
  localizacoes: LocalizacaoListVm[];
  especies: EspecieLookupVm[];
}

export function FiltrosInstalacoes({ filtros, onChange, localizacoes, especies }: FiltrosInstalacoesProps) {
  // Conjunto com os IDs que são pais de outras localizações (salas pai)
  const idsPais = new Set(
    localizacoes
      .map((loc) => loc.localizacaoPaiId)
      .filter((id): id is number => id !== null && id !== undefined)
  );

  // Salas filhas: possuem pai e não são pai de nenhuma outra localização
  const salasFilhas = localizacoes.filter((loc) => {
    const isPai = idsPais.has(loc.id);
    const isRoot = !loc.localizacaoPaiId;
    return !isPai && !isRoot;
  });

  const localizacaoOptions = (salasFilhas.length > 0 ? salasFilhas : localizacoes).map((loc) => ({
    value: String(loc.id),
    label: loc.nome
  }));

  const especieOptions = [
    { value: '', label: 'Todas as espécies' },
    ...especies.map((e) => ({
      value: String(e.id),
      label: e.nomePopular ? `${e.nome} (${e.nomePopular})` : e.nome
    }))
  ];

  return (
    <>
      <FormField label="Localização / Sala" required className="col-span-1 md:col-span-2">
        <SearchableSelect
          placeholder="Digite ou selecione a sala/recinto..."
          options={localizacaoOptions}
          value={filtros.localizacaoId || ''}
          onChange={(val) => onChange({ ...filtros, localizacaoId: val })}
        />
      </FormField>

      <FormField label="Espécie">
        <SearchableSelect
          placeholder="Selecione ou digite a espécie..."
          options={especieOptions}
          value={filtros.especieId || ''}
          onChange={(val) => onChange({ ...filtros, especieId: val })}
        />
      </FormField>

      <div className="flex items-center pt-7">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
          <Checkbox
            checked={filtros.incluirSublocais}
            onCheckedChange={(checked) => onChange({ ...filtros, incluirSublocais: !!checked })}
          />
          Incluir salas filhas / sub-recintos
        </label>
      </div>
    </>
  );
}

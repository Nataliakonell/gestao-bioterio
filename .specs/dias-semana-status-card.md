# Spec: Status Individual por Dia da Semana no Card

## Contrato da API
- `GET /api/RotinaAnimal/status/all` → `PaginatedAnimalRotinaStatusVm` (modificado)
- Cada `RotinaStatusDetalheVm` passa a incluir `DiasSemanaStatus` quando a rotina é `DiasDaSemana`

## Comportamento esperado
- Para rotinas com `TipoFrequencia == DiasDaSemana`, calcular o status de CADA dia programado individualmente
- Status possíveis por dia:
  - `concluido` (✓) — existe registro de alimentação naquela data
  - `naoAlimentado` (✕) — dia programado passado sem registro
  - `futuro` (!) — dia programado futuro (inclui hoje se ainda não alimentado)
- Novo campo `List<DiaSemanaStatusVm>? DiasSemanaStatus` no `RotinaStatusDetalheVm`
- Frontend: `CardRotina` exibe indicadores visuais quando `tipoFrequencia == DiasDaSemana`
- O cálculo considera registros de alimentação dos últimos 7 dias e próximos 7 dias

## Mudanças no Backend

### 1. Novo VM: `DiaSemanaStatusVm`
```
Dia (string) — "Segunda", "Terça", etc.
Status (string) — "concluido" | "naoAlimentado" | "futuro"
```

### 2. `RotinaStatusDetalheVm` — novo campo
```
List<DiaSemanaStatusVm>? DiasSemanaStatus
```

### 3. `IAlimentacaoRepository` — novo método
```
Task<Dictionary<int, List<Alimentacao>>> GetAlimentacoesSinceAsync(IEnumerable<int> animalIds, DateTime sinceDate)
```

### 4. `AlimentacaoRepository` — implementação do método

### 5. `GetAllAnimaisRotinaStatusQueryHandler` — lógica de cálculo:
- Para cada animal com rotina DiasDaSemana:
  - Mapear `DiaSemanaProgramado` (nomes) → `DayOfWeek`
  - Para cada dia programado nos últimos 7 dias + próximos 7 dias:
    - Calcular a data real (ex.: qual foi a data da última "Segunda")
    - Verificar se existe Alimentacao nessa data
    - Determinar status: concluido / naoAlimentado / futuro
  - Populate `DiasSemanaStatus`

### 6. `GetAnimalRotinaStatusQueryHandler` — mesma lógica duplicada

### 7. `MappingProfile.cs` — novos mappings se necessário

## Mudanças no Frontend

### 1. `RotinaAnimalService.ts` — nova interface + campo
```
DiaSemanaStatusVm { dia: string; status: string }
RotinaStatusDetalheVm.diasSemanaStatus?: DiaSemanaStatusVm[]
```

### 2. `CardRotina.tsx` — novo bloco condicional:
- Se `item.alimentacao?.tipoFrequencia == TipoFrequencia.DiasDaSemana`
  - Renderizar grid de indicadores por dia
  - ✓ (verde) para `concluido`
  - ✕ (vermelho) para `naoAlimentado`
  - ! (ícone de alerta laranja) para `futuro`

### 3. Atualizar `RotinaStatusDetalheVm` no frontend para incluir campos faltantes:
- `tipoFrequencia?: TipoFrequencia`
- `diaSemanaProgramado?: string[]`
- `diasSemanaStatus?: DiaSemanaStatusVm[]`

## Casos de teste (A2A)
1. CT-01: Rotina DiasDaSemana (Seg/Qua/Sex) com alimentação apenas na Seg → Seg=✓, Qua=✕, Sex=!
2. CT-02: Rotina DiasDaSemana com todos os dias alimentados → todos ✓
3. CT-03: Rotina DiasDaSemana sem nenhum registro → todos ✕ (passados) ou ! (futuros)
4. CT-04: Rotina não-DiasDaSemana → DiasSemanaStatus é null
5. CT-05: Verificar que o campo `diasSemanaStatus` aparece no response JSON

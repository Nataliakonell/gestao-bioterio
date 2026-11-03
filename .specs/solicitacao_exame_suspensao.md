# Spec: Suspensão e Cancelamento de Solicitação de Exame

## 1. Contexto e Objetivo
Permitir que o usuário suspenda ou cancele um pedido de exame já registrado, sem excluir o histórico. A suspensão/cancelamento deve ser rastreável (motivo + data + RF do responsável) e refletir na timeline do animal e no documento. Como ainda não há Gerenciamento de perfis, qualquer usuário autenticado pode suspender/cancelar; futuramente será restrito por perfil (ex.: apenas veterinário responsável / coordenador).

Relacionado a:
- `.specs/solicitacao_exame.md` (solicitação múltipla e geração de documento agrupado na timeline)
- Correção anterior: timeline agrupa `SolicitacaoExame` criados juntos (<2min + mesmos dados clínicos) em 1 card/documento; documento agrupado via `SolicitacaoExameDocumentContext`.

## 2. Modelo de Domínio

### Entidade `SolicitacaoExame` (Domain)
Novos campos:

```csharp
public enum StatusSolicitacaoExame { Ativa = 1, Suspensa = 2, Cancelada = 3 }

public class SolicitacaoExame : AuditableEntity {
  // existentes: Id, AnimalId, TipoExame, SinaisClinicos, SuspeitaClinica, RegiaoAnatomica, Observacao, DataCriacao, RF
  public StatusSolicitacaoExame Status { get; set; } = StatusSolicitacaoExame.Ativa;
  public DateTime? DataSuspensao { get; set; }
  public string? MotivoSuspensao { get; set; }
  public DateTime? DataCancelamento { get; set; }
  public string? MotivoCancelamento { get; set; }
}
```

EF Core: `HasConversion<string>()` para `Status`, colunas `MotivoSuspensao`/`MotivoCancelamento` `HasMaxLength(1000)`.

Criação (`POST /SolicitacaoExame`) sempre inicia com `Ativa`. Transições permitidas: `Ativa -> Suspensa`, `Ativa -> Cancelada`, `Suspensa -> Cancelada` (opcional). `Suspensa/Cancelada -> Ativa` não é permitida (reativação futura se necessário).

## 3. Contrato da API

Base: `/api/SolicitacaoExame` (existente: GET, GET/{id}, POST, PUT, DELETE)

Novos endpoints:

- `POST /api/SolicitacaoExame/suspender` → `SuspendSolicitacaoExameResponse`
  ```json
  { "id": 123, "motivoSuspensao": "Animal em jejum não realizado, reprogramar" }
  ```
  Respostas: 200 `{ success, id, message }`, 400 validação (motivo obrigatório), 404 id inexistente, 400 já suspensa/cancelada.

- `POST /api/SolicitacaoExame/cancelar` → `CancelSolicitacaoExameResponse`
  ```json
  { "id": 123, "motivoCancelamento": "Solicitação duplicada" }
  ```

- `POST /api/SolicitacaoExame/suspender-grupo` (opcional, alternativo: frontend chama suspender N vezes) → recebe `ids: number[]`, `motivoSuspensao`, suspende todos do grupo em transação.

Para simplicidade MVP: frontend chama `suspender`/`cancelar` em paralelo para cada `id` do grupo (mesmo motivo). Backend mantém operação individual.

Validação (FluentValidation):
- `Id > 0`
- `MotivoSuspensao` / `MotivoCancelamento` `NotEmpty`, `MaximumLength 1000`, `Must(!IsNullOrWhiteSpace)`

Handler:
- `GetByIdAsync(id)` → NotFound se null
- Se `Status == Suspensa` e tenta suspender → `Success=false, Message="Solicitação já suspensa."`
- Se `Status == Cancelada` → bloqueia suspender/cancelar → `Success=false, Message="Solicitação já cancelada."`
- Atualiza `Status`, `DataSuspensao=DateTime.Now` (ou `DataCancelamento`), `Motivo...=trim`, `UpdateAsync`.

VMs (`SolicitacaoExameListVm`, `DetailVm`, `CreateDto`) passam a expor:
`string Status; DateTime? DataSuspensao; string? MotivoSuspensao; DateTime? DataCancelamento; string? MotivoCancelamento; DateTime DataCriacao; string RF`

Mapping: `ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))`

## 4. Timeline (Ficha do Animal — AbaClinico.tsx)

Agrupamento existente mantido (janela <2min + mesmos dados clínicos → 1 card). Adições:

- **Badge de status**: se qualquer item do grupo estiver `Suspensa` ou `Cancelada`, exibir badge adicional:
  - `Suspensa` → `bg-orange-100 text-orange-700 border-orange-200` com ícone `Pause`
  - `Cancelada` → `bg-red-100 text-red-700 border-red-200` com ícone `Ban`
  - Se misto `Ativa+Suspensa`, mostrar `Suspensa` quando todos suspensos, ou `Parcial` se desejar; MVP: se grupo tem ≥1 Suspensa e nenhuma Ativa → `Suspensa`; se tem Cancelada → `Cancelada`.
- **Estilo do card**: `opacity-60`, `border-l-orange-400` para suspenso, `border-l-red-400` + `line-through` leve para cancelado; ou keep amber mas com badge.
- **Ações no card** (menu `...` ou botões no `HorizontalCard`):
  - Se grupo totalmente `Ativa` → mostrar `Suspender` e `Cancelar` (ícones `Pause`/`XCircle`). Clique abre modal de motivo.
  - Se `Suspensa`/`Cancelada` → esconder suspender/cancelar, mostrar `Visualizar motivo` e `Visualizar documento` (documento ainda visualizável, mas com tarja de status).
  - Sem controle de perfil agora: todos veem botões; `TODO: @Authorize(Roles="Veterinario,Coordenador")` futuro.

- **Ordenação/filtro**: incluir filtro por Status na `BarraDeBuscaEFiltro` (checkbox `Ativa/Suspensa/Cancelada`).

Modal de suspensão/cancelamento (reuso do padrão `NovaPrescricao.tsx`):
- Título `Suspender solicitação de exame (N exames)` ou `Cancelar...`
- Alerta amber/red
- Textarea `Motivo *` (obrigatório)
- Botões `Voltar` / `Confirmar suspensão` (ou `Confirmar cancelamento`)
- Ao confirmar → `Promise.all(group.map(s => solicitacaoExameService.suspender(s.id, motivo)))` → toast → `fetchDadosClinicos()` para atualizar timeline.

DocumentoViewer: quando status ≠ Ativa, injetar tarja no topo do documento: `SOLICITAÇÃO SUSPENSA em dd/MM/yyyy — Motivo: ...` ou `CANCELADA`. O `SolicitacaoExameDocumentContext` não precisa mudar; a tarja é HTML injetado no `DocumentoClinicoModal` antes do `DocumentoViewer`.

## 5. Frontend Service

`services/SolicitacaoExameService.ts`:
```ts
export interface SolicitacaoExameVm { status: string; dataSuspensao?: string; motivoSuspensao?: string; dataCancelamento?: string; motivoCancelamento?: string; ... }

suspender: (id:number, motivoSuspensao:string) => POST /SolicitacaoExame/suspender {id, motivoSuspensao}
cancelar: (id:number, motivoCancelamento:string) => POST /SolicitacaoExame/cancelar {id, motivoCancelamento}
suspenderGrupo: (ids:number[], motivo:string) => Promise.all(suspender)
cancelarGrupo: …
```

## 6. Regras de Negócio
- Criação sempre `Ativa`.
- Suspender exige motivo não vazio; não pode suspender já suspensa/cancelada.
- Cancelar exige motivo; não pode cancelar já cancelada; pode cancelar `Ativa` ou `Suspensa`.
- Suspensão/cancelamento não apaga do banco; apenas altera status (histórico preservado).
- Timeline continua exibindo, mas com destaque visual e sem permitir nova suspensão.
- Documento permanece visualizável mesmo suspenso/cancelado.
- Sem checagem de perfil agora; log de `RF` já gravado via `AuditableEntity` + `DataSuspensao/Cancelamento` para auditoria futura.

## 7. Casos de Teste (A2A)
1. CT-01: Criar solicitação com 2 tipos → GET lista retorna 2 registros com `Status="Ativa"`.
2. CT-02: Suspender 1 registro com motivo válido → 200, `Status="Suspensa"`, `DataSuspensao` preenchida, `MotivoSuspensao` igual.
3. CT-03: Tentar suspender já suspensa → 200 com `Success=false, Message="Solicitação já suspensa."`.
4. CT-04: Suspender sem motivo → 400 validação.
5. CT-05: Cancelar ativa com motivo → 200 `Cancelada`.
6. CT-06: Cancelar já cancelada → erro.
7. CT-07: Timeline: criar grupo com 2 tipos, suspender grupo → ambos ficam `Suspensa`, card único mostra badge `Suspensa` e tarja no documento.
8. CT-08: Documento de exame suspenso ainda abre (GET) e exibe tarja de suspensão.
9. CT-09: Filtro por status na timeline funciona.
```

# Spec: Tipo de Procedimento e Refatoração de Procedimento

## 1. Nova Entidade: TipoProcedimento
Para permitir a gestão de Tipos de Procedimentos com criação dinâmica via select (comportamento idêntico a LocaisOrigem), a seguinte entidade será criada:
- `Id` (int)
- `Nome` (string)
- `Ativo` (bool)

## Contrato da API (TipoProcedimento)
- `GET /api/TipoProcedimento` → Listagem paginada (params: page, pageSize, search) para tela de gerenciamento
- `GET /api/TipoProcedimento/lookup` → Lista para seletores `{ id, nome }`
- `GET /api/TipoProcedimento/{id}` → Detalhe
- `POST /api/TipoProcedimento` → `CreateTipoProcedimentoCommand` ({ nome })
- `PUT /api/TipoProcedimento` → `UpdateTipoProcedimentoCommand` ({ id, nome, ativo })
- `DELETE /api/TipoProcedimento/{id}` → Remoção (apenas se não houver vínculos)

## 2. Refatoração da Entidade Procedimento
- Remover coluna `Detalhamento`
- Adicionar Foreign Key (FK) `TipoProcedimentoId` (a substituir a antiga `string TipoProcedimento`).

## Comportamento esperado
- No formulário "Registrar atendimento", a aba "Procedimentos" deve estar habilitada (`disabled: false`).
- Apenas dois campos existirão para procedimentos em atendimento: "Tipo de Procedimento" e "Descrição". O "Detalhamento" será removido da tela e do DTO.
- Em "Tipo de Procedimento", usar o componente `CreatableSelect`. Caso o usuário digite um nome que ainda não exista na base, a API (`POST /api/TipoProcedimento`) deverá ser chamada para cadastrar e já retornar o ID para uso na persistência.
- (Opcional, a definir com usuário) Tela de gerência de Tipos de Procedimento listando-os em data table com toggle de status.

## Casos de teste (A2A)
1. CT-01: Criar TipoProcedimento com dados válidos → 200 (retorna ID)
2. CT-02: Criar TipoProcedimento com nome duplicado → erro de validação ("Este tipo de procedimento já está cadastrado")
3. CT-03: Listar TiposProcedimento ativos para lookup → 200
4. CT-04: Registrar atendimento contendo Procedimentos usando o novo `TipoProcedimentoId` → 200

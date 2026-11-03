# Spec: LocalOrigem

## Contrato da API
- `GET /api/LocalOrigem` → `PaginatedList<LocalOrigemListVm>`
- `GET /api/LocalOrigem/{id}` → `LocalOrigemDetailVm`
- `POST /api/LocalOrigem` → `CreateLocalOrigemResponse` (body com Nome, Cnpj, etc)
- `PUT /api/LocalOrigem` → `BaseResponse`
- `DELETE /api/LocalOrigem/{id}` → `NoContent`

## Comportamento esperado
- **Responsabilidade**: Representar a origem do animal, colônia ou linhagem (ex: Biotério da USP, Fornecedor X, Criatório Interno).
- **Campos principais**: `Id`, `Nome` (obrigatório), `Cnpj` (opcional), `Contato` (opcional), `Status` (ativo/inativo).
- **Regras de Negócio**:
  - O `Nome` do Local de Origem deve ser único.

## Casos de teste (A2A)
1. CT-01: Criar com dados válidos → 200 OK.
2. CT-02: Criar sem o campo obrigatório "Nome" → Erro de Validação.
3. CT-03: Criar com nome duplicado → Erro de unicidade.
4. CT-04: Buscar por id inexistente → 404 Not Found.
5. CT-05: Listar todos os locais → 200 OK.
6. CT-06: Deletar local existente → 204 No Content.

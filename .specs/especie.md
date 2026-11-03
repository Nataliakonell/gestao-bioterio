# Spec: Especie

## Contrato da API
- `GET /api/Especie` → `PaginatedList<EspecieListVm>` (lista paginada)
- `GET /api/Especie/{id}` → `EspecieDetailVm`
- `POST /api/Especie` → `CreateEspecieResponse` (body com Nome, NomeCientifico)
- `PUT /api/Especie` → `BaseResponse`
- `DELETE /api/Especie/{id}` → `NoContent`

## Comportamento esperado
- **Responsabilidade**: Representar as diferentes espécies criadas ou mantidas no biotério (ex: Camundongo, Rato Wistar, Cobaia).
- **Campos principais**: `Id`, `Nome` (obrigatório), `NomeCientifico` (obrigatório), `Status` (ativo/inativo).
- **Regras de Negócio**:
  - O `Nome` deve ser único. Não pode existir duas Espécies cadastradas com o mesmo nome.
  - Não deve ser possível fazer soft/hard delete de uma espécie se ela já estiver vinculada a animais existentes (opcional, dependendo da sua regra de retenção).

## Casos de teste (A2A)
1. CT-01: Criar espécie com dados válidos → 200 OK.
2. CT-02: Criar sem o campo obrigatório "Nome" → Erro de Validação (ValidationErrors).
3. CT-03: Criar sem o campo obrigatório "NomeCientifico" → Erro de Validação.
4. CT-04: Criar espécie com nome duplicado → Erro de Validação de unicidade.
5. CT-05: Buscar por id inexistente → 404 Not Found.
6. CT-06: Listar todas as espécies → 200 OK + lista paginada.
7. CT-07: Atualizar dados válidos → 200 OK.
8. CT-08: Deletar espécie existente → 204 No Content.

# Spec: Consulta

## Contrato da API
- `GET /api/Consulta` → `PaginatedConsultaListVm` / `List<ConsultaListVm>` (query params: `animalId`, `searchTerm`, `page`, `pageSize`)
- `GET /api/Consulta/{id}` → `ConsultaDetailVm`
- `POST /api/Consulta` → `CreateConsultaResponse` (body: `CreateConsultaCommand`)
- `PUT /api/Consulta` → `BaseResponse` (body: `UpdateConsultaCommand`)
- `DELETE /api/Consulta/{id}` → `204 NoContent`

## Comportamento esperado
1. A entidade `Consulta` registra o atendimento clínico veterinário e pertence diretamente a um `Animal` via `AnimalId`.
2. Herda de `AuditableEntity` (preenche automaticamente `DataCriacao` e `RF` do usuário logado via JWT no `SaveChangesAsync`).
3. Valida se o `AnimalId` informado existe no repositório antes de persistir.
4. Ao registrar uma consulta na ficha do animal, ela fica imediatamente disponível na linha do tempo do prontuário do animal.
5. Permite vincular opcionalmente uma `InstalacaoBioterioId`.

## Estrutura dos Campos (Entidade / DTOs)
- `Id` (int)
- `AnimalId` (int, obrigatório)
- `Anamnese` (string, obrigatório)
- `ExameFisico` (string, opcional)
- `SuspeitaDiagnostica` (string, opcional)
- `InstalacaoBioterioId` (int, opcional)
- `DataHoraConsulta` (DateTime)

## Casos de teste (A2A)
1. **CT-01: Criar consulta com dados válidos** → Retorna `200 OK` com `Success = true`, `Id` gerado e `Consulta` DTO populado.
2. **CT-02: Criar consulta com AnimalId inexistente** → Retorna `ValidationErrors` informando que o animal não foi encontrado.
3. **CT-03: Criar consulta sem Anamnese** → Retorna `ValidationErrors` informando que a Anamnese é obrigatória.
4. **CT-04: GetById existente** → Retorna `200 OK` com os detalhes da consulta.
5. **CT-05: GetById inexistente** → Retorna erro ou 404.
6. **CT-06: GetAll filtrado por AnimalId** → Retorna lista paginada de consultas pertencentes exclusivamente ao animal especificado.
7. **CT-07: Update de consulta existente** → Atualiza os campos e retorna `BaseResponse` com sucesso.
8. **CT-08: Delete de consulta existente** → Remove a consulta do banco e retorna `204 NoContent`.

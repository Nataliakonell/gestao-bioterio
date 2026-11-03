# Spec: Usuário (Gerenciamento de Perfil)

## Visão Geral
Gerenciamento de Usuários do sistema de gestão de biotério. Cada usuário é identificado por seu Registro Funcional (RF), Nome, E-mail e Status (Ativo/Inativo).

## Modelagem Relacional & Entidade
- `Id`: int (PK, Identity)
- `RF`: string (Herdado de `AuditableEntity`, obrigatório, único)
- `Nome`: string (obrigatório, max 150)
- `Email`: string (obrigatório, max 150, único)
- `Status`: bool (default true = Ativo)
- `DataCriacao`: DateTime (auditoria automática pelo `BioterioDbContext`)

## Contrato da API

### GET /api/Usuario
- Response: `List<UsuarioListVm>`

### GET /api/Usuario/{id}
- Response: `UsuarioDetailVm`

### POST /api/Usuario
- Request Body (`CreateUsuarioCommand`):
  ```json
  {
    "rf": "RF191609",
    "nome": "Nome do Usuário",
    "email": "usuario@ucdb.br",
    "status": true
  }
  ```
- Response Body (`CreateUsuarioResponse`):
  ```json
  {
    "success": true,
    "message": "Usuário cadastrado com sucesso!",
    "id": 1,
    "usuario": {
      "id": 1,
      "rf": "RF191609",
      "nome": "Nome do Usuário",
      "email": "usuario@ucdb.br",
      "status": true
    }
  }
  ```

### PUT /api/Usuario
- Request Body (`UpdateUsuarioCommand`):
  ```json
  {
    "id": 1,
    "nome": "Nome Atualizado",
    "email": "usuario@ucdb.br",
    "status": true
  }
  ```
- Response Body (`BaseResponse`)

### DELETE /api/Usuario/{id}
- Status: 204 NoContent

## Regras de Negócio
1. **Campo Status**: Corrigir typo na entidade `Usuario.cs` (`Stauts` -> `Status`).
2. **Herança de RF**: `Usuario` herda de `AuditableEntity`. Garantir que `RF` seja do tipo `string` alinhado com `AuditableEntity`.
3. **Validação de Unicidade**: RF e E-mail devem ser únicos na base de dados.
4. **Validação de Formato**: E-mail deve ter formato válido e campos obrigatórios preenchidos (`Nome`, `Email`, `RF`).

## Casos de Teste (A2A)
1. `CT-01`: Criar usuário com dados válidos → 200 OK + `CreateUsuarioResponse`
2. `CT-02`: Criar usuário sem campo obrigatório → erro de validação (FluentValidation)
3. `CT-03`: Criar usuário com RF/Email duplicado → erro de validação
4. `CT-04`: Buscar por id inexistente → 404 Not Found
5. `CT-05`: Listar todos os usuários → 200 OK + `List<UsuarioListVm>`
6. `CT-06`: Atualizar usuário existente → 200 OK + `BaseResponse`
7. `CT-07`: Excluir usuário existente → 204 NoContent

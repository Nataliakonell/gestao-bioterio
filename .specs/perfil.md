# Spec: Perfil

## Contrato da API

### `GET /api/Perfil`
- **Descrição**: Retorna a lista de todos os perfis.
- **Retorno**: `List<PerfilListVm>`
  ```json
  [
    {
      "id": 1,
      "nome": "Admin",
      "descricao": "Administrador do sistema"
    }
  ]
  ```

### `GET /api/Perfil/{id}`
- **Descrição**: Retorna os detalhes de um perfil específico.
- **Retorno**: `PerfilDetailVm`
  ```json
  {
    "id": 1,
    "nome": "Admin",
    "descricao": "Administrador do sistema"
  }
  ```

### `POST /api/Perfil`
- **Descrição**: Cria um novo perfil.
- **Body Esperado**: `CreatePerfilCommand`
  ```json
  {
    "nome": "Pesquisador",
    "descricao": "Perfil com acesso às pesquisas"
  }
  ```
- **Retorno**: `CreatePerfilResponse` (contém `Id`, `Success`, `Message` e `Perfil` como `CreatePerfilDto`)

### `PUT /api/Perfil`
- **Descrição**: Atualiza um perfil existente.
- **Body Esperado**: `UpdatePerfilCommand`
  ```json
  {
    "id": 2,
    "nome": "Pesquisador (Atualizado)",
    "descricao": "Novo descritivo"
  }
  ```
- **Retorno**: `BaseResponse`

### `DELETE /api/Perfil/{id}`
- **Descrição**: Exclui um perfil pelo seu Id.
- **Retorno**: `204 No Content`

## Comportamento esperado
- **Validação na Criação**: Os campos `Nome` e `Descricao` são obrigatórios (não podem ser nulos ou vazios).
- **Validação na Atualização**: O `Id` é obrigatório, bem como os campos `Nome` e `Descricao`.

## Casos de teste (A2A)
1. **CT-01: Criar com dados válidos** → 200 OK + Body indicando Success.
2. **CT-02: Criar sem campos obrigatórios** → Validação rejeita e retorna Success = false com erros no body.
3. **CT-03: Buscar por id inexistente** → Retorna erro correspondente (Ex.: NotFoundException que pode virar 404 pelo middleware).
4. **CT-04: Listar todos** → 200 OK + array de perfis.
5. **CT-05: Atualizar com dados válidos** → Atualiza corretamente a base de dados.
6. **CT-06: Excluir perfil existente** → Retorna 204 No Content.

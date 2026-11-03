# Spec: Bloqueio de Permissões para Usuário Inativo (Status = false)

## Visão Geral
Quando o status de um usuário for definido como `false` (inativo), o usuário deve ter todas as suas permissões imediatamente revogadas, não possuindo acesso a nenhuma funcionalidade do sistema, tanto no backend (via filtros de autorização) quanto no frontend (via contexto de permissões e guardas de rota).

---

## 1. Comportamento Esperado & Regras de Negócio

1. **Validação no Pipeline de Autorização (`RequirePermissionAttribute`)**:
   - Para qualquer requisição em endpoints protegidos por `[RequirePermission]`:
     - O sistema obtém o usuário pelo `RF` extraído dos claims do token JWT.
     - Se o usuário não existir no banco ou se seu campo `Status == false` (inativo), a requisição DEVE ser imediatamente rejeitada com **HTTP 403 Forbidden**.
     - Um usuário inativo não deve conseguir invocar qualquer funcionalidade de leitura, edição, criação ou exclusão.

2. **Consulta de Permissões do Usuário Logado (`GET /api/Usuario/me/permissoes`)**:
   - Ao processar `GetMyPermissoesQuery`:
     - O handler busca o usuário pelo RF.
     - Se `usuario.Status == false`:
       - `IsAdmin` é retornado como `false`.
       - `Status` é retornado como `false`.
       - A lista `Permissoes` é retornada vazia (`[]`).
     - Nenhuma permissão do perfil associado é concedida se o usuário estiver inativo.

3. **Frontend (`PermissionsContext` e `ProtectedPage`)**:
   - `MyPermissoesVm` inclui a propriedade `status: boolean`.
   - `hasPermission(funcionalidade, nivelMinimo)` retorna estritamente `false` caso `status === false`.
   - Se o usuário estiver inativo no sistema, o frontend exibe aviso de que a conta está inativa, impedindo navegação para áreas funcionais.

---

## 2. Contratos da API Afetados

### `GET /api/Usuario/me/permissoes`
- **Autenticação**: Bearer JWT
- **Response Model (`MyPermissoesVm`)**:
  ```json
  {
    "isAdmin": false,
    "status": false,
    "permissoes": []
  }
  ```

### Demais Endpoints com `[RequirePermission(...)]`
- Para qualquer chamada feita por usuário com `Status == false`:
  - **Status HTTP**: `403 Forbidden`

---

## 3. Casos de Teste (A2A)

1. `CT-STATUS-01`: Usuário ativo (`Status = true`) com permissão consegue acessar rota protegida → **200 OK**.
2. `CT-STATUS-02`: Usuário inativo (`Status = false`) tentando acessar qualquer rota protegida por `[RequirePermission]` → **403 Forbidden**.
3. `CT-STATUS-03`: `GET /api/Usuario/me/permissoes` para usuário inativo → Retorna `status: false`, `isAdmin: false` e lista de `permissoes` vazia.
4. `CT-STATUS-04`: Atualizar usuário de `Status = true` para `Status = false` revoga instantaneamente os acessos subsequentes → **403 Forbidden**.

---

## 4. Impacto nos Arquivos

- **Backend**:
  - `Gestao-Bioterio.Api/Filters/RequirePermissionAttribute.cs`: validar `if (usuario == null || !usuario.Status) return 403 Forbidden`.
  - `Gestao-Bioterio.Application/Features/Usuarios/Queries/GetMyPermissoes/MyPermissoesVm.cs`: adicionar propriedade `public bool Status { get; set; } = true;`.
  - `Gestao-Bioterio.Application/Features/Usuarios/Queries/GetMyPermissoes/GetMyPermissoesHandler.cs`: checar `if (!usuario.Status)` e retornar permissões vazias e status inativo.
  - `Gestao-Bioterio.Api/Middleware/UcdbAuthenticationMiddleware.cs`: mapear claim de desenvolvimento/testes (`test-token`) para assegurar que os testes A2A mantenham o fluxo padrão de execução.
  - `Gestao-Bioterio.A2ATests/UsuarioModuleTests.cs`: adicionar testes A2A cobrindo o comportamento de usuário inativo e ativo.

- **Frontend**:
  - `src/contexts/PermissionsContext.tsx`: tipar `status` em `MyPermissoesVm`, armazenar estado de `status` e checar `if (!status) return false;` em `hasPermission`.
  - `src/components/ProtectedPage/ProtectedPage.tsx`: tratar caso de usuário autenticado no token, porém inativo no sistema, bloqueando navegação com mensagem explicativa.

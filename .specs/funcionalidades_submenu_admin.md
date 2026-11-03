# Spec: Submenu Funcionalidades e Gestão de Funcionalidades (Exclusivo gestao-bioterio-admin)

## 1. Contexto e Objetivo
Permitir a gestão (Create, Read, Update, Delete) das funcionalidades do sistema diretamente pela interface do SIGBio. Por se tratar de configurações críticas que definem os módulos do sistema e o controle de acesso de perfis, o item de menu e a respectiva rota devem ser **estritamente restritos** a usuários autenticados que possuam a role `gestao-bioterio-admin` em seu token JWT.

---

## 2. Contrato da API (Backend)
Os endpoints de CRUD de Funcionalidade já existem no backend (`api/Funcionalidade`) implementados via CQRS:

| Método | Endpoint | Permissão / Requisito | Retorno |
|---|---|---|---|
| `GET` | `/api/Funcionalidade` | `Gerenciamento de perfis` (Visualizar) ou Admin | `List<FuncionalidadeListVm>` (id, nome, descricao) |
| `GET` | `/api/Funcionalidade/{id}` | `Gerenciamento de perfis` (Visualizar) ou Admin | `FuncionalidadeDetailVm` (id, nome, descricao) |
| `POST` | `/api/Funcionalidade` | `Funcionalidade` (Gerenciar) ou Admin | `CreateFuncionalidadeResponse` (success, id, funcionalidade, message) |
| `PUT` | `/api/Funcionalidade` | `Funcionalidade` (Editar) ou Admin | `BaseResponse` (success, message, validationErrors) |
| `DELETE` | `/api/Funcionalidade/{id}` | `Funcionalidade` (Gerenciar) ou Admin | `204 NoContent` |

---

## 3. Comportamento e Regras de Negócio

### 3.1 Identificação de Role no Frontend (`api.ts`)
- Implementar função helper `isBioterioAdmin(): boolean`:
  - Lê o token ativo (`bioterio_token`, `ucdb_token` ou `keycloak_session`).
  - Decodifica as roles do payload JWT em:
    - `payload?.realm_access?.roles`
    - `payload?.resource_access?.['gestao-bioterio']?.roles`
    - `payload?.roles`
  - Retorna `true` apenas se contiver a role `"gestao-bioterio-admin"`.

### 3.2 Submenu em `app-sidebar.tsx`
- No item `"Perfis e usuários"`, renderizar a lista de submenus:
  - Usuários (`/perfis-e-usuarios/usuario`)
  - Gerenciamento de perfis (`/perfis-e-usuarios/perfil`)
  - **Funcionalidades** (`/perfis-e-usuarios/funcionalidades`) — **apenas** quando `isBioterioAdmin()` for verdadeiro.

### 3.3 Proteção de Rota (`RequireRole.tsx` / `App.tsx`)
- Criar componente de guarda `RequireRole` que valida se o usuário possui a role exigida (`gestao-bioterio-admin`).
  - Caso o usuário tente acessar via URL direta e não tenha a role:
    - Exibe toast de alerta informando acesso negado / restrito a administradores.
    - Redireciona para rota segura (ex: `/`).
- Registrar as rotas no `App.tsx`:
  - `/perfis-e-usuarios/funcionalidades` → `VisaoGeralFuncionalidades` protegida por `RequireRole role="gestao-bioterio-admin"`.

### 3.4 Interface do Usuário (CRUD no Próprio Sistema)
- Tela `VisaoGeralFuncionalidades.tsx`:
  - Cabeçalho padronizado com breadcrumb: `Perfis e Usuários > Funcionalidades`.
  - Botão "+ Nova Funcionalidade" abrindo modal de cadastro.
  - Barra de busca por nome ou descrição.
  - Tabela / Cards modernos exibindo:
    - Nome da Funcionalidade
    - Descrição da Funcionalidade
    - Ações: Editar (abre modal preenchido) e Excluir (com diálogo de confirmação).
  - Feedback visual com `sonner` (toast de sucesso / erro).

---

## 4. Casos de Teste (A2A)
Criar `Backend/Gestao-Bioterio.A2ATests/FuncionalidadeModuleTests.cs`:
1. **CT-01**: `GetAll_ReturnsOk` → Status 200 + lista de funcionalidades
2. **CT-02**: `GetById_ReturnsOk` → Status 200 para id existente
3. **CT-03**: `Create_ValidData_ReturnsOk` → Status 200 e cadastra com sucesso
4. **CT-04**: `Create_InvalidData_ReturnsError` → Status com falha de validação (campos vazios)
5. **CT-05**: `Update_ValidData_UpdatesCorrectly` → Status 200 e altera nome/descrição
6. **CT-06**: `Delete_Existing_ReturnsNoContent` → Status 204 e remove a funcionalidade

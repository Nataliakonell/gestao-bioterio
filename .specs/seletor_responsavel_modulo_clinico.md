# Spec: Seletor de Responsável no Módulo Clínico

## 1. Visão Geral e Contexto
Atualmente, no módulo clínico veterinário, o campo "Responsável" vem preenchido por padrão com o nome do usuário logado (`getUserInfo()?.name`). Contudo, em procedimentos de campo/estéril, plantões ou delegação técnica, pode ser necessário indicar outro profissional cadastrado no sistema como responsável técnico pelo ato.

A rastreabilidade é mantida em duas frentes:
1. **Auditoria (`AuditableEntity`)**: Grava automaticamente o RF e DataCriacao de quem realizou a digitação no sistema.
2. **Responsável Técnico (`Responsavel`)**: Grava o nome do profissional indicado e selecionado como autor do ato clínico.

---

## 2. Contrato da API

### `GET /api/Usuario/lookup`
- **Autenticação**: `[Authorize]` (qualquer usuário autenticado; não exige permissão administrativa da tela de Usuários).
- **Parâmetros**: Nenhum.
- **Retorno (`200 OK`)**: `List<UsuarioLookupVm>`
```json
[
  {
    "id": 1,
    "nome": "Dr. Carlos Silva",
    "rf": "12345"
  },
  {
    "id": 2,
    "nome": "Dra. Maria Santos",
    "rf": "67890"
  }
]
```

### Regras do Backend (CQRS):
- Retorna apenas usuários ativos (`Status == true`).
- Ordenado alfabeticamente por `Nome`.
- Execução com `.AsNoTracking()`.
- Utiliza o método existente `IUsuarioRepository.GetUsuarioLookupAsync()`.
- Criação de `GetUsuarioLookupQuery`, `GetUsuarioLookupHandler` e `UsuarioLookupVm`.

---

## 3. Comportamento no Frontend

### 3.1 Componente Reutilizável: `ResponsavelSelect`
Local: `Frontend/src/components/clinico/ResponsavelSelect.tsx`
- Utiliza `SearchableSelect` para permitir busca por digitação rápida.
- Rótulo formatado na lista: `"${nome} (RF: ${rf})"` ou `${nome}` caso não haja RF.
- **Valor padrão**: Se o campo estiver em branco e não for edição de registro antigo, pré-seleciona o nome do usuário logado (`getUserInfo()?.name`).
- **Retrocompatibilidade e histórico**: Se um registro antigo possuir um responsável que não esteja mais na lista de usuários ativos, o componente mantém o valor histórico selecionado na opção para não corromper ou limpar dados antigos ao visualizar/editar.
- **Cache local em memória** no `UsuarioService.getUsuariosLookup()` para evitar requisições repetidas ao alternar ou abrir modais na mesma sessão.

### 3.2 Modais e Telas Atualizados (9 fluxos clínicos):
1. **Consulta**: `ConsultaFormModal.tsx`
2. **Alta Ambulatorial**: `AltaAmbulatorialModal.tsx` e `AltaAmbulatorial.tsx`
3. **Liberação de Quarentena**: `LiberacaoQuarentenaModal.tsx` e `LiberacaoQuarentena.tsx`
4. **Prescrever Medicação**: `PrescricaoMedicacaoModal.tsx` e `NovaPrescricao.tsx`
5. **Administrar Medicação**: `RegistrarAdministracaoModal.tsx`
6. **Solicitar Exame**: `SolicitacaoExameModal.tsx` e `SolicitacaoExameEmAtendimento.tsx`
7. **Anexo**: `AnexoModal.tsx`
8. **Registrar Evolução**: `EvolucaoModal.tsx`
9. **Adicionar Procedimento**: `ProcedimentoModal.tsx`

---

## 4. Casos de Teste (A2A)

Arquivo: `Backend/Gestao-Bioterio.A2ATests/UsuarioLookupTests.cs` (ou integrado em `UsuarioModuleTests.cs`):
1. **CT-01: Listar usuários ativos via `/api/Usuario/lookup`**
   - Usuário autenticado sem permissões administrativas chama `GET /api/Usuario/lookup`.
   - Retorno esperado: `200 OK` contendo lista de objetos com `id`, `nome` e `rf`.
2. **CT-02: Exclusão de usuários inativos**
   - Insere um usuário com `Status = false`.
   - Executa `GET /api/Usuario/lookup`.
   - Retorno esperado: o usuário inativo não deve constar na lista retornada.
3. **CT-03: Ordenação alfabética**
   - Garante que a lista retornada vem ordenada crescentemente por `Nome`.
4. **CT-04: Acesso não autenticado**
   - Requisição sem cabeçalho Authorization `Bearer` retorna `401 Unauthorized`.

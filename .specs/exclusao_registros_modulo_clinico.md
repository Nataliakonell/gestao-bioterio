# Spec: Exclusão de Registros do Módulo Clínico (Nível Gerenciar)

## 1. Visão Geral
Disponibilizar no frontend a funcionalidade de exclusão de registros do Módulo Clínico para usuários que possuam permissão de nível **Gerenciar**.
Os registros contemplados são:
1. **Consulta**
2. **Alta ambulatorial**
3. **Liberação de quarentena**
4. **Administrar medicação** (dose administrada)
5. **Anexo**
6. **Registrar evolução** (evolução clínica)
7. **Adicionar procedimento** (procedimento clínico)

---

## 2. Contratos da API (Backend)
Todos os endpoints de exclusão já estão implementados e protegidos por RBAC no backend:

| Funcionalidade | Endpoint | Permissão Exigida (Nível) |
|---|---|---|
| Consulta | `DELETE /api/Consulta/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Alta Ambulatorial | `DELETE /api/AltaAmbulatoria/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Liberação Quarentena | `DELETE /api/LiberacaoQuarentena/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Anexo | `DELETE /api/Anexo/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Evolução | `DELETE /api/Evolucao/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Procedimento | `DELETE /api/Procedimento/{id}` | `Atendimento veterinário` (**Gerenciar**) |
| Medicação Administrada | `DELETE /api/MedicacaoAdministrada/{id}` / reset de dose | `Registrar dose de medicação` (**Gerenciar**) |

---

## 3. Comportamento e UX no Frontend

### 3.1 Serviços Frontend (`src/services/`)
- Adicionar o método `delete(id: number): Promise<void>` em:
  - `AltaAmbulatoriaService.ts`
  - `LiberacaoQuarentenaService.ts`
- Demais serviços (`ConsultaService`, `AnexoService`, `EvolucaoService`, `ProcedimentoService`, `MedicacaoAdministradaService`) já contam com o método `delete()`.

### 3.2 Modais de Edição e Diálogo de Confirmação
1. **Condição de Exibição do Botão de Excluir**:
   - O botão "Excluir" só deve ser exibido quando o modal estiver em **modo de edição** de um registro já existente no banco de dados.
   - O usuário deve possuir permissão de nível **Gerenciar**:
     - `hasPermission("Atendimento veterinário", "Gerenciar")` para Consulta, Alta, Quarentena, Anexo, Evolução e Procedimento.
     - `hasPermission("Registrar dose de medicação", "Gerenciar")` para Administrar Medicação.
   - Caso o usuário tenha apenas nível "Visualizar" ou "Editar", o botão "Excluir" **não** será renderizado.

2. **Posicionamento e Estilo**:
   - Nos modais com `ModalShell`, o botão "Excluir" ficará posicionado em `footerProps.leftActions` com estilo `variant="ghost"` em tom destrutivo (`text-red-600 hover:text-red-700 hover:bg-red-50`), separado dos botões de ação à direita ("Cancelar" e "Salvar").
   - No `RegistrarAdministracaoModal`, o botão "Excluir" manterá sua posição à esquerda no rodapé, ativado somente para quem tem permissão `Gerenciar`.

3. **Confirmação Prévia (`DeleteConfirmModal`)**:
   - Ao clicar em "Excluir", abre o modal `@/components/ui/delete-confirm-modal` com aviso explícito de que a exclusão é definitiva.
   - Ao confirmar:
     - Estado de carregamento (`deleting = true`);
     - Chamada ao método `delete(id)` do respectivo serviço;
     - Feedback de sucesso via `toast.success("Registro excluído com sucesso!")`;
     - Disparo do callback `onSaved?.()` / `onSuccess?.()` para atualizar a timeline clínica do animal;
     - Fechamento do modal de confirmação e do modal de edição.

---

## 4. Casos de Teste (A2A e Frontend)
1. **CT-01**: Usuário com permissão `Gerenciar` clica em "Excluir" em registro existente → confirma modal → registro é excluído com sucesso e timeline atualiza.
2. **CT-02**: Usuário com permissão apenas de `Editar` ou `Visualizar` abre o modal de edição → botão "Excluir" não é visível.
3. **CT-03**: Backend rejeita com `403 Forbidden` qualquer requisição `DELETE` de usuário que não possua nível `Gerenciar`.

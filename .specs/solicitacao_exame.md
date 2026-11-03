# Spec: Solicitação de Exame no Atendimento Clínico (Múltipla Seleção)

## 1. Contexto e Objetivo
Permitir que o usuário, durante o cadastro ou edição de um Atendimento Clínico:
1. Acesse a funcionalidade de **Solicitação de Exame** tanto pela aba **"Exames"** quanto pelo card de **"Ações Rápidas"** ("Solicitar exame").
2. Selecione **um ou mais tipos de exames** simultaneamente através dos checkboxes:
   - `1 = Hemograma Completo`
   - `2 = Ultrassonografia`
   - `3 = Radiografia (Raio-X)`
   - `4 = Outros` (com campo de texto para especificar o outro exame)
3. Preencha os dados complementares da solicitação clínica:
   - **Sinais Clínicos** (`SinaisClinicos`)
   - **Suspeita Clínica** (`SuspeitaClinica`)
   - **Região Anatômica de Interesse** (`RegiaoAnatomica`) — relevante para Raio-X e Ultrassom
   - **Observações Adicionais** (`Observacao`)
4. Visualize no **Preview do Documento** (`DocumentoViewer`) todas as opções selecionadas marcadas com `☒` e as não selecionadas com `☐`.
5. Ao salvar o atendimento:
   - Cada tipo de exame selecionado gera/atualiza uma entidade `SolicitacaoExame` associada ao `AtendimentoId` e `AnimalId`.
   - Caso exames existentes sejam desmarcados na edição, eles são excluídos da base.
   - O contador de exames no resumo de atendimento reflete a quantidade total de exames selecionados.

---

## 2. Contrato da API e Persistência

### Endpoints (`/api/SolicitacaoExame`):
- `GET /api/SolicitacaoExame` → `List<SolicitacaoExameListVm>`
- `GET /api/SolicitacaoExame/{id}` → `SolicitacaoExameDetailVm`
- `POST /api/SolicitacaoExame` → `CreateSolicitacaoExameResponse`
- `PUT /api/SolicitacaoExame` → `BaseResponse`
- `DELETE /api/SolicitacaoExame/{id}` → `NoContent`

### Associação com Atendimento:
- No `GET /api/Atendimento/{id}`, a lista `solicitacoesExame` retorna todos os exames vinculados.
- Ao salvar/atualizar o `Atendimento`, o frontend sincroniza as solicitações de exame com o backend (cria novos tipos selecionados, atualiza existentes e deleta os desmarcados).

---

## 3. Mapeamento de Variáveis e Checkboxes no Template de Documento

Para o `TipoDocumento.SolicitacaoExame` (`3`), as variáveis de marcação comportam-se da seguinte forma:

| Variável | Descrição / Comportamento |
|---|---|
| `[FUN_CHECK_HEMOGRAMA]` | `☒` se `HemogramaCompleto` selecionado, senão `☐` |
| `[FUN_CHECK_ULTRASSONOGRAFIA]` | `☒` se `Ultrassonografia` selecionada, senão `☐` |
| `[FUN_CHECK_RADIOGRAFIA]` | `☒` se `Radiografia` selecionada, senão `☐` |
| `[FUN_CHECK_OUTROS]` | `☒` se `Outros` selecionado, senão `☐` |
| `[INPUT_OUTROS_EXAME]` | Texto do exame personalizado quando `Outros` está selecionado |
| `[INPUT_SINAIS_CLINICOS]` | Texto preenchido em Sinais Clínicos |
| `[INPUT_SUSPEITA_CLINICA]` | Texto preenchido em Suspeita Clínica |
| `[INPUT_REGIAO_ANATOMICA]` | Região Anatômica de interesse |
| `[INPUT_OBSERVACOES_ADICIONAIS]` | Observações adicionais |

---

## 4. Fluxo no Frontend

1. **`SolicitacaoExameEmAtendimento.tsx`:**
   - Permite alternar cada checkbox de forma independente (múltipla seleção via array `tiposExame: TipoExame[]`).
   - Se `TipoExame.Outros` estiver no array `tiposExame`, renderiza o campo para especificação.
2. **`RegistroAtendimento.tsx`:**
   - Estado `exameData` gerencia `tiposExame: TipoExame[]` e mapeamento de IDs existentes.
   - `summaryCounts.exames` exibe a contagem de tipos selecionados.
   - Sincronização no `handleSubmit` para criar/atualizar/excluir as solicitações de exame do atendimento.
   - Preview no `DocumentoViewer` reflete múltiplos checkboxes marcados.
3. **`SolicitacaoExameDocumentContext.ts`:**
   - `resolveFun` verifica `tiposExame` (array) para marcar cada variável `FUN_CHECK_*`.

---

## 5. Casos de Teste (A2A / Verificação)
1. **CT-01:** Selecionar Hemograma Completo e Radiografia simultaneamente → Ambos checkboxes permanecem marcados.
2. **CT-02:** Desmarcar um exame previamente selecionado → Apenas o exame desmarcado é removido da seleção.
3. **CT-03:** Marcar "Outros" → Campo de texto para especificação do exame é exibido; ao desmarcar, é ocultado e limpo.
4. **CT-04:** Salvar atendimento com 2 exames selecionados → 2 registros de `SolicitacaoExame` vinculados ao `AtendimentoId` são persistidos.
5. **CT-05:** Editar atendimento com 2 exames existentes e desmarcar 1 → O exame desmarcado é excluído no backend e o restante é mantido.
6. **CT-06:** Preview do documento exibe `☒` para todos os exames selecionados e `☐` para os não selecionados.

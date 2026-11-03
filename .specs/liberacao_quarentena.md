# Spec: Múltiplas Liberações de Quarentena por Animal

## Descrição

O sistema deve permitir registrar e exibir múltiplos eventos de **Liberação de Quarentena** para o mesmo animal na timeline clínica da ficha do animal.

Conforme validação com o **Especialista de Domínio & Gestão de Biotério** e diretrizes normativas (CONCEA/CEUA), um animal pode passar por múltiplos episódios de isolamento e quarentena ao longo de sua vida/histórico experimental (por exemplo: trânsito entre setores ou barreiras sanitárias, retorno de áreas cirúrgicas/laboratórios externos, suspeita sanitária em lote e reintroduções). 

Portanto, cada evento de quarentena e sua respectiva liberação médica-veterinária compõem o histórico clínico auditável do animal e devem ser exibidos de forma independente na timeline.

---

## Contratos da API (`LiberacaoQuarentenaController`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/LiberacaoQuarentena?animalId={animalId}` | Retorna a lista de liberações de quarentena, filtrada opcionalmente por `animalId`, ordenada por data de saída decrescente. |
| `GET` | `/api/LiberacaoQuarentena/{id}` | Retorna o detalhe da liberação de quarentena específica pelo seu `id`. 404 se não encontrada. |
| `GET` | `/api/LiberacaoQuarentena/animal/{animalId}` | Retorna a liberação de quarentena mais recente do animal (mantido para retrocompatibilidade com clientes legados). |
| `POST` | `/api/LiberacaoQuarentena` | Registra uma nova liberação de quarentena para o animal. Permite múltiplos registros para o mesmo `animalId`. |
| `PUT` | `/api/LiberacaoQuarentena` | Atualiza uma liberação de quarentena existente via seu `id`. |
| `DELETE` | `/api/LiberacaoQuarentena/{id}` | Exclui uma liberação de quarentena específica. |

---

## Comportamento Esperado & Regras de Negócio

1. **Permissão de Múltiplos Registros (1:N):** O banco de dados e as validações permitem múltiplos registros de `LiberacaoQuarentena` associados ao mesmo `animalId`.
2. **Consulta e Carregamento na Timeline:**
   - Na aba clínica (`AbaClinico.tsx`), o frontend deve consultar `liberacaoQuarentenaService.getAll({ animalId })`.
   - Todas as liberações de quarentena registradas para o animal devem aparecer na timeline clínica, ordenadas cronologicamente com as demais consultas, evoluções, exames e procedimentos.
3. **Abertura do Documento e Edição por ID Específico:**
   - Ao clicar no card da liberação na timeline, o modal de visualização (`DocumentoClinicoModal.tsx`) deve carregar a liberação específica utilizando o `id` daquele registro (`liberacaoQuarentenaService.getById(id)`).
   - Ao clicar em editar o documento, o modal de edição (`LiberacaoQuarentenaModal.tsx`) deve carregar os dados específicos daquele registro pelo `id`.
4. **Atualização da Instalação do Animal:**
   - No registro da liberação, caso informada `InstalacaoBioterioId`, a instalação física do animal é atualizada para o destino selecionado.

---

## Casos de Teste (A2A)

1. `CT-01`: Criar liberação de quarentena inicial com dados válidos → 200 OK com `id`.
2. `CT-02`: Criar segunda liberação de quarentena para o mesmo animal com datas posteriores → 200 OK com novo `id`.
3. `CT-03`: Listar liberações por `animalId` (`GET /api/LiberacaoQuarentena?animalId={id}`) → 200 OK contendo array com ambas as liberações ordenadas decrescente.
4. `CT-04`: Buscar liberação específica por ID (`GET /api/LiberacaoQuarentena/{id}`) → 200 OK com os dados exatos daquele registro.
5. `CT-05`: Buscar liberação por ID inexistente → 404 NotFound.
6. `CT-06`: Atualizar liberação específica via PUT (`PUT /api/LiberacaoQuarentena`) → 200 OK garantindo que o outro registro permaneça intacto.
7. `CT-07`: Deletar uma liberação específica (`DELETE /api/LiberacaoQuarentena/{id}`) → 204 NoContent e a outra liberação permanece persistida.

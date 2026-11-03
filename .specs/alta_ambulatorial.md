# Spec: Múltiplas Altas Ambulatoriais por Animal

## Descrição

O sistema deve permitir registrar múltiplos episódios de **Alta Ambulatorial** para o mesmo animal, refletindo a rotina real de biotérios onde um animal pode necessitar de internação/atendimento ambulatorial em diferentes momentos do seu ciclo de vida ou protocolo experimental.

---

## Contratos da API (`AltaAmbulatoriaController`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/AltaAmbulatoria?animalId={animalId}` | Retorna a lista de altas ambulatoriais, filtrada opcionalmente por `animalId`, ordenada pela data da alta decrescente. |
| `GET` | `/api/AltaAmbulatoria/{id}` | Retorna o detalhe da alta ambulatorial específica pelo seu ID. 404 se não encontrada. |
| `GET` | `/api/AltaAmbulatoria/animal/{animalId}` | Retorna a última alta clínica registrada para o animal (retrocompatibilidade). 200 ou null. |
| `POST` | `/api/AltaAmbulatoria` | Registra uma nova alta ambulatorial para o animal. Permite múltiplos registros para o mesmo `animalId`. |
| `PUT` | `/api/AltaAmbulatoria` | Atualiza uma alta ambulatorial existente. |
| `DELETE` | `/api/AltaAmbulatoria/{id}` | Remove uma alta ambulatorial específica. |

---

## Comportamento Esperado & Regras de Negócio

1. **Permissão de Múltiplas Altas:** O validador `CreateAltaAmbulatoriaValidator` não deve bloquear a criação de nova alta se o animal já possuir outra registrada.
2. **Validação Cronológica:** A data da alta clínica não pode ser anterior à data de entrada no ambulatório quando ambas estiverem preenchidas.
3. **Consulta por ID:** Permitir carregar e visualizar o documento exato de qualquer alta do histórico através do endpoint canônico `GET /api/AltaAmbulatoria/{id}`.
4. **Listagem Completa na Timeline:** A listagem clínica do animal no frontend exibirá todas as altas históricas na timeline. Ao clicar em visualizar ou editar, deve ser carregado o registro com base no `id` daquela alta.
5. **Atualização de Instalação:** Quando informada `InstalacaoBioterioRetornoId`, a instalação atual do animal continua sendo atualizada para a instalação de retorno informada no momento da liberação.

---

## Casos de Teste (A2A)

1. `CT-01`: Criar alta inicial com dados válidos → 200 OK.
2. `CT-02`: Criar segunda alta para o mesmo animal → 200 OK (anteriormente gerava erro 400).
3. `CT-03`: Listar altas por `animalId` (`GET /api/AltaAmbulatoria?animalId={id}`) → 200 OK com array contendo ambas as altas.
4. `CT-04`: Buscar alta específica por ID (`GET /api/AltaAmbulatoria/{id}`) → 200 OK com os dados daquela alta.
5. `CT-05`: Buscar alta por ID inexistente → 404 NotFound.
6. `CT-06`: Validar data de alta anterior à entrada → Erro de validação 400.
7. `CT-07`: Deletar uma alta específica (`DELETE /api/AltaAmbulatoria/{id}`) → 204 NoContent e a outra alta permanece registrada.

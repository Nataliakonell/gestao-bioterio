# Spec: Registro de Óbito de Animal

## Visão Geral
Módulo responsável pelo registro formal de óbito de animais do biotério, coletando informações como data do óbito, se houve realização de necropsia, observações/laudo preliminar e atualizando automaticamente a situação do animal para `Situacao.Obito`.

---

## Modelo de Dados (`RegistroObito`)
- `Id`: int (PK, identity)
- `AnimalId`: int (FK -> Animal, Restrict)
- `DataObito`: DateTime (obrigatório)
- `HouveNecropsia`: bool (obrigatório, questionário de necropsia)
- `Observacoes`: string? (opcional, máx 1000 caracteres)
- Auditoria (`AuditableEntity`): `DataCriacao`, `RF`

---

## Contrato da API

### `GET /api/RegistroObito`
- **Query params:** `animalId` (opcional)
- **Retorno:** `200 OK` com `List<RegistroObitoListVm>`

### `GET /api/RegistroObito/{id}`
- **Retorno:** `200 OK` com `RegistroObitoDetailVm` ou `404 Not Found`

### `GET /api/RegistroObito/animal/{animalId}`
- **Retorno:** `200 OK` com `RegistroObitoDetailVm?` (último registro do animal)

### `POST /api/RegistroObito`
- **Body:** `CreateRegistroObitoCommand`
  ```json
  {
    "animalId": 1,
    "dataObito": "2026-10-29T10:00:00Z",
    "houveNecropsia": true,
    "observacoes": "Necropsia realizada conforme protocolo."
  }
  ```
- **Retorno:** `200 OK` com `CreateRegistroObitoResponse` (`Id`, `RegistroObitoDto`) ou `400 BadRequest`

### `PUT /api/RegistroObito`
- **Body:** `UpdateRegistroObitoCommand`
- **Retorno:** `200 OK` com `BaseResponse` ou `400 BadRequest`

### `DELETE /api/RegistroObito/{id}`
- **Retorno:** `204 NoContent`

---

## Comportamento Esperado & Regras de Negócio
1. **Atualização automática de situação:** Ao registrar o óbito com sucesso, a `SituacaoAnimal` da entidade `Animal` correspondente deve ser automaticamente atualizada para `Situacao.Obito`.
2. **Validação de duplicidade/estado:** Não permitir registrar óbito para um animal inexistente ou que já se encontre com situação `Situacao.Obito`.
3. **Data válida:** A data de óbito não pode ser no futuro.

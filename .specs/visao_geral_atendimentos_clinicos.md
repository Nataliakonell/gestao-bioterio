# Spec: Visão Geral de Atendimentos Clínicos

## 1. Visão Geral e Motivação
Na rotina de biotério, o médico veterinário ou técnico realiza atendimentos sequenciais (consultas, prescrições, evoluções, exames, procedimentos, altas, liberações de quarentena, óbitos, etc.) em diversos animais. Devido à alta rotatividade e volume de animais, o profissional frequentemente se perde sobre **qual foi o último animal avaliado/registrado**.

Esta feature introduz uma **Visão Geral Clínica** estruturada com `HorizontalCard`, destacando com clareza o **último animal atendido**, histórico temporal de atendimentos por animal, localização atual, status clínico e atalhos rápidos para prontuário/novo atendimento.

---

## 2. Contrato da API (Backend CQRS)

### `GET /api/Clinico/visao-geral`
Retorna uma lista paginada de animais que possuem atendimentos clínicos registrados, ordenados por padrão por data de atendimento decrescente (o mais recente primeiro), além de filtros opcionais.

#### Query Parameters:
- `page` (int, default: 1)
- `pageSize` (int, default: 10)
- `search` (string, opcional): Busca por número de registro do animal, nome/identificador ou CRMV/RF do responsável.
- `especieId` (int, opcional): Filtro por espécie.
- `tipoAtendimento` (string, opcional): Filtra por tipo do último atendimento (`Consulta`, `LiberacaoQuarentena`, `AltaAmbulatorial`, `RegistroObito`, `PrescricaoMedicacao`, `SolicitacaoExame`, `Anexo`, `Evolucao`, `Procedimento`).
- `dataInicio` (DateTime?, opcional)
- `dataFim` (DateTime?, opcional)

#### Response Body (`VisaoGeralClinicaResponse`):
```json
{
  "totalCount": 42,
  "page": 1,
  "pageSize": 10,
  "destaqueUltimoAtendimentoGeral": {
    "animalId": 15,
    "numeroRegistro": "RAT-082",
    "especieNome": "Rattus norvegicus",
    "faseDeVida": 3,
    "faseDeVidaNome": "Adulto",
    "sexo": "Macho",
    "localizacao": "Biotério Central - Sala 2 (Gaiola 04)",
    "situacaoAnimal": 1,
    "situacaoAnimalNome": "Vivo",
    "statusClinico": "Em Tratamento",
    "ultimoAtendimento": {
      "tipo": "PrescricaoMedicacao",
      "tipoLabel": "Prescrição de Medicação",
      "dataHora": "2026-11-02T16:30:00Z",
      "responsavel": "Dr. Carlos Santos (CRMV 5421)",
      "resumo": "Meloxicam 0.2mg/kg - 1x ao dia por 3 dias"
    },
    "totalAtendimentos": 5
  },
  "items": [
    {
      "animalId": 15,
      "numeroRegistro": "RAT-082",
      "especieNome": "Rattus norvegicus",
      "faseDeVida": 3,
      "faseDeVidaNome": "Adulto",
      "sexo": "Macho",
      "localizacao": "Biotério Central - Sala 2 (Gaiola 04)",
      "situacaoAnimal": 1,
      "situacaoAnimalNome": "Vivo",
      "statusClinico": "Em Tratamento",
      "ultimoAtendimento": {
        "tipo": "PrescricaoMedicacao",
        "tipoLabel": "Prescrição de Medicação",
        "dataHora": "2026-11-02T16:30:00Z",
        "responsavel": "Dr. Carlos Santos (CRMV 5421)",
        "resumo": "Meloxicam 0.2mg/kg - 1x ao dia por 3 dias"
      },
      "totalAtendimentos": 5
    }
  ]
}
```

---

## 3. Comportamento e Regras de Negócio

1. **Ordenação por Recência**:
   - Por padrão, a lista retorna os animais ordenados por `UltimoAtendimento.DataHora DESC`.
   - O primeiro item da lista (ou em card de destaque no topo) é o **último animal atendido no biotério**.
2. **Tipos de Atendimento Considerados**:
   - Consulta (`Consulta`)
   - Liberação de Quarentena (`LiberacaoQuarentena`)
   - Alta Ambulatorial (`AltaAmbulatorial`)
   - Registro de Óbito (`RegistroObito`)
   - Prescrição de Medicação (`PrescricaoMedicacao`)
   - Solicitação de Exame (`SolicitacaoExame`)
   - Registro de Evolução (`Evolucao`)
   - Procedimento Clínico (`Procedimento`)
   - Anexos Clínicos (`Anexo`)
3. **Status Clínico Determinado**:
   - `Óbito`: Se houver Registro de Óbito ou situação do animal = Óbito.
   - `Quarentena`: Se em quarentena sem liberação.
   - `Em Tratamento`: Se houver prescrição médica com doses ativas/em andamento.
   - `Alta Ambulatorial`: Se houve alta recente sem nova queixa.
   - `Em Observação`: Se houver consulta/evolução sem prescrição ativa.
4. **Interatividade do HorizontalCard**:
   - Clique no Card direciona para `/ficha-animal/{id}?tab=clinico`.
   - Exibição de:
     - `title`: Espécie + `#numeroRegistro`
     - `subtitle`: Localização atual (Sala / Estante / Gaiola) + Fase de vida
     - `badge`: Tipo do último atendimento (com cor semântica do marker clínico)
     - `infoBlocks`:
       - *Último Registro*: Tipo do evento + preview do resumo.
       - *Data/Hora*: Exibição relativa/formatada (ex: "Hoje às 16:30").
       - *Responsável*: Veterinário / RF.
       - *Status Clínico*: Em Tratamento, Quarentena, Alta, Óbito.
   - Tag visual de destaque no card mais recente: `"Último atendido"`.

---

## 4. Frontend & Navegação

1. **Menu Lateral (`app-sidebar.tsx`)**:
   - Adicionar link em **Clínico**:
     - *Atendimentos Clínicos* (`/clinico/atendimentos`)
2. **Nova Rota**:
   - `Frontend/src/routes/Clinico/VisaoGeralAtendimentosClinicos.tsx`
   - Incorpora:
     - `BarraDeBuscaEFiltro` (busca por registro/responsável, filtro por espécie e tipo de atendimento).
     - Lista de `HorizontalCard`.
     - `PaginationBar` para paginação no servidor.

---

## 5. Casos de Teste (A2A Tests)

Arquivo: `Gestao-Bioterio.A2ATests/VisaoGeralClinicaModuleTests.cs`

1. **CT-01**: Obter visão geral com dados válidos → 200 OK e lista ordenada por data de atendimento decrescente.
2. **CT-02**: Validar que animal com atendimento mais recente aparece como `destaqueUltimoAtendimentoGeral`.
3. **CT-03**: Animal sem atendimentos clínicos não deve poluir a listagem quando filtrado por animais atendidos.
4. **CT-04**: Filtro por espécie retorna apenas animais daquela espécie.
5. **CT-05**: Paginação correta (`page=1&pageSize=1` retorna `totalCount > 1` e apenas 1 item).

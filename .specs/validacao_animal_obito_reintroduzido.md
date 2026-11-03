# Spec: Bloqueio de Registros para Animais em Situação de Óbito ou Reintroduzido

## Visão Geral
Garantir a integridade do domínio, conformidade regulatória (CONCEA/CEUA) e consistência das rotinas do biotério, impedindo que animais com situação **Óbito** ou **Reintroduzido** recebam novos registros de manejo ativo, acompanhamento clínico e execução de procedimentos:
1. **Alimentação** (`Alimentacao`)
2. **Biometria** (`BiometriaAnimal`)
3. **Prescrições e Mapa de Execução / Administração de Medicamentos** (`PrescricaoMedicacao` e `MedicacaoAdministrada`)
4. **Desverminação** (`ProtocoloDesverminacao` e `DosesAplicacaoDesverminacao`)
5. **Acompanhamento de Rotina** (`RotinaAnimal` / `status/all`)

---

## Regras de Negócio e Comportamento Esperado

### 1. Regra Geral de Estado do Animal
- Um animal é considerado **apto** para receber registros de manejo, alimentação, biometria e administração de medicação/desverminação **somente** se `SituacaoAnimal == Situacao.Vivo` (1).
- Se `SituacaoAnimal == Situacao.Obito` (2) ou `SituacaoAnimal == Situacao.Reintroduzido` (3):
  - **Alimentação:** Não é permitido registrar (`CreateAlimentacao`) nem atualizar (`UpdateAlimentacao`) alimentação para o animal.
  - **Biometria:** Não é permitido registrar (`CreateBiometriaAnimal`) nem atualizar (`UpdateBiometriaAnimal`) biometria para o animal.
  - **Prescrição de Medicação:** Não é permitido criar prescrições (`CreatePrescricaoMedicacao`).
  - **Mapa de Execução / Administração:** Não é permitido registrar nova administração (`CreateMedicacaoAdministrada`) nem marcar como concluída/atualizar dose (`UpdateMedicacaoAdministrada`) para prescrições cujo animal vinculado esteja em Óbito ou Reintroduzido.
  - **Desverminação:** Não é permitido criar protocolo (`CreateProtocoloDesverminacao`) nem registrar/atualizar aplicação de dose (`CreateDoseAplicacaoDesverminacao`, `UpdateDoseAplicacaoDesverminacao`) para animais em Óbito ou Reintroduzidos.
  - **Rotina:** As listas de pendências de rotina e mapas continuam excluindo animais que não estejam vivos.

### 2. Mensagens de Validação Amigáveis e Padronizadas
- **Alimentação:** *"Não é permitido registrar alimentação para animal com situação '{Situacao}'."*
- **Biometria:** *"Não é permitido registrar biometria para animal com situação '{Situacao}'."*
- **Prescrição:** *"Não é permitido prescrever medicação para animal com situação '{Situacao}'."*
- **Administração de Medicação (Mapa de Execução):** *"Não é permitido registrar administração de medicamento: o animal associado encontra-se com situação '{Situacao}'."*
- **Desverminação (Protocolo e Doses):** *"Não é permitido registrar protocolo ou dose de desverminação para animal com situação '{Situacao}'."*

---

## Contratos e Modificações na API

### 1. `POST /api/Alimentacao` e `PUT /api/Alimentacao`
- Retorno em caso de animal em Óbito/Reintroduzido:
  - `HTTP 200 OK` com `CreateAlimentacaoResponse { Success = false, ValidationErrors = ["Não é permitido registrar alimentação para animal com situação 'Óbito'."] }`

### 2. `POST /api/BiometriaAnimal` e `PUT /api/BiometriaAnimal`
- Retorno em caso de animal em Óbito/Reintroduzido:
  - `HTTP 200 OK` com `CreateBiometriaAnimalResponse { Success = false, ValidationErrors = ["Não é permitido registrar biometria para animal com situação 'Óbito'."] }`

### 3. `POST /api/PrescricaoMedicacao`
- Retorno em caso de animal em Óbito/Reintroduzido:
  - `HTTP 200 OK` com `CreatePrescricaoMedicacaoResponse { Success = false, ValidationErrors = ["Não é permitido prescrever medicação para animal com situação 'Óbito'."] }`

### 4. `POST /api/MedicacaoAdministrada` e `PUT /api/MedicacaoAdministrada` (Mapa de Execução)
- Retorno em caso de animal em Óbito/Reintroduzido:
  - `HTTP 200 OK` com `CreateMedicacaoAdministradaResponse { Success = false, ValidationErrors = ["Não é permitido registrar administração de medicamento: o animal associado encontra-se com situação 'Óbito'."] }`

### 5. `POST /api/ProtocoloDesverminacao` e `POST /api/DosesAplicacaoDesverminacao`
- Retorno em caso de animal em Óbito/Reintroduzido:
  - `HTTP 200 OK` com `BaseResponse { Success = false, ValidationErrors = [...] }`

---

## Mudanças no Frontend

1. **`RegistroAlimentacao.tsx`**:
   - Se aberto com `animalId` de um animal que está em Óbito ou Reintroduzido, exibir alerta/bloqueio visual e desabilitar o botão de salvar.
2. **`CadastroBiometria.tsx`**:
   - Se aberto com `animalId` de um animal não-vivo, exibir alerta e desabilitar o formulário.
3. **`MapaExecucao.tsx`**:
   - Filtrar doses de modo que animais baixados (Óbito/Reintroduzido) não fiquem elegíveis para marcação de dose no mapa diário, exibindo indicador visual ou ocultando doses pendentes órfãs.
4. **`AbaDesverminacao.tsx`**:
   - Ocultar/desabilitar o botão "Nova Dose" e desabilitar ações de agendamento se `situacaoAnimal !== Situacao.Vivo`.

---

## Casos de Teste (A2A Tests)

1. **CT-01 (Alimentação):** Tentar criar alimentação para animal em Óbito → `Success = false` e erro no response.
2. **CT-02 (Alimentação):** Tentar criar alimentação para animal Reintroduzido → `Success = false` e erro no response.
3. **CT-03 (Biometria):** Tentar criar biometria para animal em Óbito ou Reintroduzido → `Success = false`.
4. **CT-04 (Prescrição):** Tentar criar prescrição para animal em Óbito ou Reintroduzido → `Success = false`.
5. **CT-05 (Mapa de Execução / Administração):** Tentar administrar dose de prescrição cujo animal está em Óbito → `Success = false`.
6. **CT-06 (Desverminação):** Tentar criar protocolo ou dose de desverminação para animal em Óbito ou Reintroduzido → `Success = false`.
7. **CT-07 (Regressão / Animais Vivos):** Todos os cadastros para animais na situação `Vivo` continuam operando normalmente com `Success = true`.

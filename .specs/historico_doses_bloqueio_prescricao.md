# Spec: Histórico de Registro de Doses e Bloqueio de Prescrição com Doses Concluídas

## 1. Visão Geral
Na **Ficha do Animal** (aba Clínico), ao acessar os detalhes de uma prescrição de medicação previamente cadastrada:
1. Quando a prescrição já possuir ao menos uma dose administrada registrada (dose com status concluído/aplicado), exibir o bloco **"Histórico de registro de doses"** posicionado na lateral direita logo abaixo de **"Resumo da prescrição"** e **"Horário de doses"**.
2. Cada dose no histórico indicará claramente seu estado atual:
   - **Aplicada**: Dose com administração já realizada e confirmada no sistema (verde).
   - **Aguardando / Próxima**: Dose pendente dentro do prazo planejado, destacando a dose imediata (azul).
   - **Atrasada**: Dose pendente cujo horário previsto já expirou sem registro de administração (vermelho).
   - Exibição de dados complementares de auditoria clínica: data/hora prevista vs. realizada, profissional responsável e observações (quando houver).
3. **Regra de integridade e imutabilidade do prontuário:**
   - Se **todas as doses** da prescrição estiverem concluídas/registradas:
     - **Não é permitido suspender** a prescrição (ação e botão de suspensão bloqueados/ocultados).
     - **Não é permitido editar ou atualizar** a prescrição (botão de salvar ocultado, campos de formulário desabilitados em modo somente leitura com título "Visualizar prescrição").
     - **No Backend**: O endpoint `PUT /api/PrescricaoMedicacao` rejeita atualizações de prescrições cujas doses foram todas concluídas com erro de validação de negócio (`Success = false`). O endpoint de suspensão mantém a rejeição já existente.

---

## 2. Contratos da API

### 2.1. Buscar Detalhes da Prescrição com Administrações
- `GET /api/PrescricaoMedicacao/{id}` → `PrescricaoMedicacaoDetailVm`
  - Retorna o detalhe da prescrição contendo a lista `administracoes: List<AdministracaoVm>` com:
    - `id`: int
    - `dataHoraPrevista`: DateTime
    - `dataHoraAdministracao`: DateTime?
    - `statusDose`: string ("Agendada", "Atrasada", "Concluido")
    - `responsavel`: string
    - `observacao`: string

### 2.2. Atualização de Prescrição de Medicação
- `PUT /api/PrescricaoMedicacao`
  - **Body**: `UpdatePrescricaoMedicacaoCommand`
  - **Comportamento**:
    - Se a prescrição estiver com `StatusPrescricao == Suspensa` → Retorna `Success = false` ("Não é possível editar uma prescrição suspensa.").
    - Se a prescrição estiver com `StatusPrescricao == Concluida` OU todas as doses da prescrição estiverem concluídas (`StatusDose.Concluido`) → Retorna `Success = false` com mensagem:
      > *"Não é possível editar uma prescrição cujas doses já foram todas concluídas."*
    - Se houver doses pendentes → Atualiza os dados e retorna `Success = true`.

### 2.3. Suspensão de Prescrição de Medicação
- `POST /api/PrescricaoMedicacao/suspend`
  - **Body**: `SuspendPrescricaoMedicacaoCommand` (`id`, `motivoSuspensao`)
  - **Comportamento**:
    - Se todas as doses estiverem concluídas → Retorna `Success = false` com mensagem:
      > *"Não é possível suspender: todas as doses já foram concluídas."*

---

## 3. Comportamento Esperado na Interface (Frontend)

### 3.1. Rota de Edição/Visualização (`NovaPrescricao.tsx`)
- Ao carregar uma prescrição existente (`prescricaoParaEditar` / `id`):
  - Busca as doses atualizadas da prescrição via API (`prescricaoMedicacaoService.getById(id)`).
  - Calcula os estados:
    - `temDoseAdministrada`: `doses.some(d => d.statusDose === "Concluido")`
    - `todasDosesConcluidas`: `doses.length > 0 && doses.every(d => d.statusDose === "Concluido")`
    - `isReadOnly`: `isSuspended || todasDosesConcluidas || !canEdit`

### 3.2. Bloco Lateral: Histórico de Registro de Doses
- Localizado no container lateral (`sideContent`), posicionado exatamente **abaixo de Resumo da Prescrição e Horário de Doses**.
- Exibição condicional:
  - Só aparece se `temDoseAdministrada === true`.
- Layout alinhado a `PrescricoesAtivasCard`:
  - Cabeçalho com ícone de pílula, título *"Histórico de registro de doses"* e badge com progresso (ex: *3 de 4 doses aplicadas*).
  - Componente de timeline visual (`TimelineDoses` horizontal ou vertical) com identificadores de etapa.
  - Indicadores de cada dose:
    - **Feita / Aplicada**: Ícone/círculo verde, badge *"aplicada"*, data/hora de administração e responsável.
    - **Aguardando / Próxima**: Ícone/círculo azul, badge *"próxima"* ou *"aguardando"*, data/hora prevista.
    - **Atrasada**: Ícone/círculo vermelho, badge *"atrasada"*, data/hora prevista vencida.
  - Box de resumo informando próxima dose prevista (quando houver pendente) ou mensagem *"Todas as doses previstas já foram aplicadas."* (quando 100% concluído).

### 3.3. Modo Somente Leitura (Todas as Doses Registradas)
- Se `todasDosesConcluidas === true`:
  - Título da página exibido como: **"Visualizar prescrição"**.
  - Banner informativo em destaque:
    > *"Prescrição finalizada: todas as doses já foram administradas. O registro está disponível apenas para visualização."*
  - Todos os campos desabilitados (`disabled={true}`): animal, biometria, medicação, dose, via, quantidade de doses, intervalo, data de início e observações.
  - Botão de submissão ocultado (`hideSubmit={true}`).
  - Botão de suspensão desabilitado/ocultado (`podeSuspender = false`).

### 3.4. Botão "Ir para o mapa de execução" e Filtro Temporal
- No rodapé do card de histórico de doses (e no card de prescrições ativas), há o botão estilizado com seta:
  - *Ir para o mapa de execução* (`handleGoToMapa`).
- Ao clicar, o sistema extrai a data relevante da prescrição:
  1. Data da próxima dose pendente (`proximaDose`);
  2. Ou data da primeira dose agendada (`dataHoraPrevista`);
  3. Ou data de início da prescrição (`dataHoraInicio`).
- A rota chamada passa os parâmetros `?animalId={id}&data={YYYY-MM-DD}`.
- Na tela do **Mapa de Execução** (`MapaExecucao.tsx`):
  - Lê e inicializa `selectedDate` diretamente com o parâmetro `?data=YYYY-MM-DD` da URL.
  - Se apenas `?animalId={id}` for fornecido (sem `data`), detecta automaticamente se o animal possui doses na data atual e, caso negativo, seleciona automaticamente a data das doses do animal, sincronizando a URL.
  - O campo de busca é pré-preenchido com o registro do animal, exibindo de imediato as medicações no dia exato da prescrição.

---

## 4. Casos de Teste (A2A e Backend)

1. **CT-01**: Tentativa de atualizar prescrição com todas as doses concluídas → Retorna `Success = false` com erro de validação.
2. **CT-02**: Atualizar prescrição com doses pendentes → Retorna `Success = true` com status 200.
3. **CT-03**: Tentativa de suspender prescrição com todas as doses concluídas → Retorna `Success = false`.
4. **CT-04**: Buscar detalhes da prescrição com doses → Retorna `PrescricaoMedicacaoDetailVm` com a lista correta de administrações.

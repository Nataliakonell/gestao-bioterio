# Spec: Migração Gradual de Localização do Animal para a Nova Estrutura (Localizacao / AnimalLocalizacao)

## 1. Contexto e Motivação
Atualmente, o animal possui vínculo direto com a entidade legada `InstalacaoBioterio` através da propriedade `InstalacaoBioterioId`. Conforme a modelagem unificada da Etapa 6 descrita em `.specs/entidades_localizacao_evento_movimentacao.md`, o sistema passa a utilizar a entidade hierárquica `Localizacao` e o estado atual na entidade `AnimalLocalizacao`.

Conforme solicitação do usuário:
- A entidade/tabela `InstalacaoBioterio` deve permanecer intacta no banco de dados e no modelo EF Core, mas sem uso operacional no fluxo de localização do animal.
- A nova estrutura de **Localização** (`Localizacao` e `AnimalLocalizacao`) passa a ser a fonte de verdade do **Local Atual** do animal em todas as visualizações, fichas e cadastros.

---

## 2. Decisões Arquiteturais e de Negócio

1. **Entidade `InstalacaoBioterio`:**
   - Permanece mapeada no `BioterioDbContext`, na pasta de entidades do `Domain` e em suas configurações de persistência, evitando breaking changes no schema relacional.
   - Deixa de ser utilizada como referência de localização atual nas telas de cadastro, edição, listagem e ficha do animal.

2. **Cadastro e Atualização de Animal:**
   - O comando de criação/edição de animal receberá `LocalizacaoId` (opcional/compatível).
   - Ao cadastrar um animal com `LocalizacaoId`:
     - O sistema registra automaticamente a associação atual em `AnimalLocalizacao`.
     - Também grava o histórico inicial em `MovimentacaoAnimal` (com `TipoMovimentacao = Transferencia`).
     - Para manter compatibilidade retroativa com a coluna NOT NULL existente na base de dados (`InstalacaoBioterioId`), caso não seja informado um ID de instalação legada, o handler utiliza um valor padrão/válido ou a primeira instalação existente como fallback transparente.
   - Ao atualizar um animal com alteração de `LocalizacaoId`:
     - Se o animal mudou de `LocalizacaoId`, registra a movimentação em `MovimentacaoAnimal` e atualiza a tupla de estado em `AnimalLocalizacao`.

3. **Consultas (Queries & View Models):**
   - `AnimalListVm`:
     - Adicionar `LocalizacaoId` (int?), `LocalizacaoNome` (string?) e preencher `InstalacaoBioterioNome` prioritariamente com o nome da `Localizacao` atual caso existente, garantindo compatibilidade imediata com tabelas do frontend.
   - `RotinaAnimalDetailVm` (Ficha do Animal / GetAnimalDetail):
     - Adicionar `LocalizacaoId` (int?), `LocalizacaoNome` (string?) e caminho hierárquico `LocalizacaoHierarquia` (string?).
   - Repositório `AnimalRepository`:
     - Carregar ou associar o `AnimalLocalizacao` com sua respectiva `Localizacao` para alimentar a localização atual.

4. **Frontend:**
   - **Cadastro / Edição de Animal (`CadastroAnimal.tsx`):**
     - O seletor de "Local" passa a listar as opções obtidas de `localizacaoService.getAll()`, gravando `localizacaoId`.
   - **Listagem de Animais (`VisaoGeral.tsx`):**
     - A coluna "Local" passa a exibir o nome da `Localizacao` atual obtida do backend.
   - **Ficha do Animal (`CardFichaAnimalForm.tsx` & `FichaAnimalVisaoGeral.tsx`):**
     - O campo "Local" exibe a `Localizacao` atual.

---

## 3. Contratos de API

### 3.1 `POST /api/Animal` (CreateAnimal)
- Recebe `localizacaoId?: number` no FormData/payload.
- Se informado, cria registro em `AnimalLocalizacao` e `MovimentacaoAnimal`.

### 3.2 `PUT /api/Animal` (UpdateAnimal)
- Recebe `localizacaoId?: number`.
- Se informado e diferente do atual, sincroniza `AnimalLocalizacao` e gera registro em `MovimentacaoAnimal`.

### 3.3 `GET /api/Animal` & `GET /api/Animal/{id}`
- Respostas contêm as informações da localização atual resolvidas a partir de `AnimalLocalizacao`.

---

## 4. Casos de Teste (A2A)

1. **CT-LOC-01:** Criar animal informando `LocalizacaoId` → Verifica status 200, criação do animal, persistência de `AnimalLocalizacao` e `MovimentacaoAnimal`.
2. **CT-LOC-02:** Obter detalhe do animal (`GET /api/Animal/{id}`) → Retorna o nome e ID da nova localização atual.
3. **CT-LOC-03:** Listar animais (`GET /api/Animal`) → A lista contém a localização resolvida a partir da nova estrutura.
4. **CT-LOC-04:** Atualizar localização via `PUT /api/Animal` → `AnimalLocalizacao` atualizado e novo histórico gravado.
5. **CT-LOC-05:** `InstalacaoBioterio` permanece íntegra e sem interferência em seu repositório.

---

## 5. Script de Seed (`initdata.mjs`)
- Garantir que todos os animais de exemplo fiquem vinculados às `Localizacao` cadastradas via `AnimalLocalizacao`.

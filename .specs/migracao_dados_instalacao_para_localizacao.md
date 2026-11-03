# Spec: Migração de Dados de InstalacaoBioterio para Localizacao

## 1. Contexto e Motivação
A entidade e tabela legada `InstalacoesBioterio` representava locais planos no biotério (ex: *"Sala A - Matrizes"*, *"Sala B - Experimentação"*, etc.).
Com a evolução da gestão espacial e rastreamento animal, foi introduzida a nova estrutura hierárquica de `Localizacao` (`Id`, `Nome`, `LocalizacaoPaiId`, `Ambiente`, `CaminhoIds`, `CaminhoHierarquia`) e o vínculo dinâmico com o animal em `AnimalLocalizacao`.

O objetivo desta etapa é:
1. Migrar os registros existentes da tabela `InstalacoesBioterio` para serem sublocalizações (salas filhas) sob a hierarquia oficial:
   **`UCDB` (Pai Raiz) -> `Biotério` (Pai Intermediário) -> `[Nome da Sala]` (Filha)**, todas com ambiente **`Interno`**.
2. Associar cada animal que ainda esteja apontando para uma `InstalacaoBioterioId` à nova `Localizacao` filha correspondente via `AnimalLocalizacao`.
3. Adicionar o registro correspondente em `MovimentacaoAnimal` (Entrada/Transferência inicial).
4. Atualizar o script de seed inicial (`initdata.mjs`) para refletir perfeitamente essa árvore de 3 níveis e vincular todos os animais.

---

## 2. Modelagem e Estrutura Hierárquica de 3 Níveis

### 2.1 Raiz e Intermediário
- **Nível 1 (Raiz):**
  - **Nome:** `"UCDB"`
  - **Ambiente:** `Interno` (`'Interno'`)
  - **LocalizacaoPaiId:** `NULL`
  - **CaminhoHierarquia:** `"UCDB"`
  - **CaminhoIds:** `"/{Id_UCDB}"`

- **Nível 2 (Intermediário):**
  - **Nome:** `"Biotério"`
  - **Ambiente:** `Interno` (`'Interno'`)
  - **LocalizacaoPaiId:** `{Id_UCDB}`
  - **CaminhoHierarquia:** `"UCDB -> Biotério"`
  - **CaminhoIds:** `"/{Id_UCDB}/{Id_Bioterio}"`

### 2.2 Nível 3 (Salas Filhas migradas de `InstalacaoBioterio`)
Para cada registro em `[bioterio].[InstalacoesBioterio]`:
- Exemplo de sala: *"Sala de Produtores de Venenos"*, *"Sala A - Matrizes"*, *"Sala B - Experimentação"*, etc.
- **Nome:** `InstalacaoBioterio.Nome`
- **Ambiente:** `Interno` (`'Interno'`)
- **LocalizacaoPaiId:** `{Id_Bioterio}`
- **CaminhoHierarquia:** `"UCDB -> Biotério -> " + InstalacaoBioterio.Nome`
- **CaminhoIds:** `"/{Id_UCDB}/{Id_Bioterio}/{NovoId_Sala}"`
- **RF:** `"SYSTEM_MIGRATION"`
- **DataCriacao:** `GETDATE()`

### 2.3 Migração dos Vínculos dos Animais (`AnimalLocalizacao`)
Para cada animal em `[bioterio].[Animals]` que possua `InstalacaoBioterioId`:
- Localiza o `Localizacao.Id` da sala correspondente ao `InstalacoesBioterio.Nome`.
- Se o animal ainda não possuir registro em `[bioterio].[AnimalLocalizacao]`:
  - Insere em `[bioterio].[AnimalLocalizacao]`:
    - `AnimalId`: `Animal.Id`
    - `LocalizacaoId`: `Localizacao.Id`
    - `RF`: `"SYSTEM_MIGRATION"`
    - `DataCriacao`: `GETDATE()`
    - `DataAtualizacao`: `GETDATE()`
    - `TipoOperacao`: `"Criacao"`
  - Insere registro em `[bioterio].[MovimentacaoAnimal]`:
    - `AnimalId`: `Animal.Id`
    - `LocalizacaoId`: `Localizacao.Id`
    - `TipoMovimentacao`: `1` (Transferência)
    - `RF`: `"SYSTEM_MIGRATION"`
    - `DataCriacao`: `GETDATE()`

---

## 3. Implementação da Migration EF Core

Uma nova migration será gerada no projeto `Gestao-Bioterio.Persistence`:
- **Nome da Migration:** `MigrateInstalacoesBioterioToLocalizacao`
- **Script SQL Idempotente:**
  - Verifica se `"UCDB"` existe; se não, cria.
  - Verifica se `"Biotério"` (filho da UCDB) existe; se não, cria.
  - Varre `[bioterio].[InstalacoesBioterio]`, inserindo as que ainda não estiverem sob `"Biotério"`.
  - Atualiza os caminhos hierárquicos e IDs.
  - Popula `[bioterio].[AnimalLocalizacao]` e `[bioterio].[MovimentacaoAnimal]` para os animais órfãos da nova tabela.

---

## 4. Atualização de Seed (`initdata.mjs`)
- Criar:
  1. `UCDB` (Interno)
  2. `Biotério` (Interno, filho de UCDB)
  3. Salas filhas de `Biotério`:
     - `Sala de Produtores de Venenos`
     - `Sala A - Matrizes`
     - `Sala B - Experimentação`
     - `Sala C - Quarentena`
- Vincular animais diretamente às salas filhas criadas.

---

## 5. Casos de Teste (A2A)

1. **CT-01: Verificação da Hierarquia UCDB -> Biotério -> Salas**
   - Verificar se as localizações criadas possuem `LocalizacaoPaiId` correto e `CaminhoHierarquia` no formato `"UCDB -> Biotério -> [Nome]"`.
2. **CT-02: Vínculo do Animal com a Sala Filha**
   - Verificar se o animal tem sua `LocalizacaoId` apontando para a sala filha e seu `LocalizacaoHierarquia` retornando o caminho completo.
3. **CT-03: Suíte completa de testes A2A**
   - `dotnet test` passando todos os testes.

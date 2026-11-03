# Spec: Compatibilidade Clínica e Localização de Destino em Quarentena e Alta

## 1. Contexto e Motivação
Na etapa anterior, a estrutura de `Localizacao` e `AnimalLocalizacao` assumiu a gestão espacial dos animais, com migration idempotente preservando os dados legados de `InstalacaoBioterio`.
As entidades clínicas `Consulta`, `LiberacaoQuarentena` e `AltaAmbulatorial` contêm colunas legadas opcionais (`InstalacaoBioterioId` / `InstalacaoBioterioRetornoId`).

Para garantir **zero quebra**:
- As tabelas e colunas no banco permanecem exatamente como estão (todas já são `nullable int?`).
- **`Consulta`**:
  - No frontend, o campo de seleção de instalação deixa de ser exigido ou exibe informativamente o local atual do animal via `AnimalLocalizacao`.
- **`LiberacaoQuarentena` e `AltaAmbulatorial`**:
  - O campo visual "Instalação de Destino / Retorno" passa a carregar as salas de `localizacaoService.getAll()` (ex: `UCDB -> Biotério -> [Sala]`).
  - Ao salvar o formulário com a nova sala de destino selecionada:
    - O backend (ou fluxo de frontend) atualiza a localização do animal (`AnimalLocalizacao`) para essa nova sala e registra em `MovimentacaoAnimal` (Transferência).
    - Preserva compatibilidade com os campos existentes no DTO.
- **Relatórios, Documentos e Laudos**:
  - `DocumentoClinicoModal.tsx` e `BaseDocumentContext.ts` já usam `animal.instalacaoBioterioNome` (que mapeia `AnimalLocalizacao.Localizacao.Nome`), garantindo que o nome da sala atual ou de destino seja impresso perfeitamente.

---

## 2. Mudanças Planejadas

### 2.1 Backend: Handlers de Liberação de Quarentena e Alta Ambulatorial
1. **`CreateLiberacaoQuarentenaCommand` / `CreateAltaAmbulatorialCommand`**:
   - Adicionar campo opcional `public int? LocalizacaoDestinoId { get; set; }`.
2. **Handlers correspondentes**:
   - Se `LocalizacaoDestinoId` for informado e for maior que 0:
     - Atualiza ou cria o `AnimalLocalizacao` do `AnimalId`.
     - Insere histórico em `MovimentacaoAnimal` com `TipoMovimentacao = 1` (Transferência).

### 2.2 Frontend: Modais e Formulários Clínicos
1. **`LiberacaoQuarentenaModal.tsx`**:
   - Carrega `localizacaoService.getAll()` em vez de `instalacaoBioterioService`.
   - Dropdown exibe as salas filhas com o caminho hierárquico formatado.
   - Ao salvar, envia `localizacaoDestinoId`.
2. **`AltaAmbulatorialModal.tsx`**:
   - Carrega `localizacaoService.getAll()` em vez de `instalacaoBioterioService`.
   - Ao salvar, envia `localizacaoDestinoId`.
3. **`ConsultaFormModal.tsx`** (se houver seletor de instalação):
   - Exibe o local atual do animal como informativo ou consome `localizacaoService`.

---

## 3. Casos de Teste (A2A)
1. **CT-01**: Liberação de Quarentena com `LocalizacaoDestinoId` atualiza `AnimalLocalizacao` do animal.
2. **CT-02**: Alta Ambulatorial com `LocalizacaoDestinoId` atualiza `AnimalLocalizacao` do animal.
3. **CT-03**: Suíte A2A completa executada com sucesso.

# Especificação Técnica: AbaMovimentacoes na Ficha do Animal

## 1. Visão Geral
Criar o componente `AbaMovimentacoes` dentro da Ficha do Animal (`FichaAnimalVisaoGeral.tsx`) para exibir o histórico de movimentações do animal em formato de timeline cronológica, reutilizando os componentes visuais existentes (`HorizontalCard`, linha vertical contínua, marcadores circulares e `BarraDeBuscaEFiltro`).

---

## 2. Tipos de Movimentação e Regras de Exibição

### 2.1 Entrada (Primeiro Registro)
- **Origem dos Dados**:
  - Representa o primeiro registro do animal no biotério (`dataDeEntrada` do cadastro do animal ou a primeira movimentação com tipo Entrada/registro inicial).
  - **Título / Badge**: `Entrada` com estilo visual amarelo/alerta (`bg-amber-100 text-amber-800 border-l-amber-500`, marcador com fundo âmbar/alerta e ícone indicativo).
  - **Data**: Data de cadastro (`dataDeEntrada`) formatada (`dd/MM/yyyy`).
  - **Descrição Padrão**: "Primeiro registro de entrada do animal no Biotério (situado no Ambulatório)."

### 2.2 Transferência (Entre salas filhas)
- **Origem dos Dados**:
  - Registros de `MovimentacaoAnimal` com `TipoMovimentacao = 1` (`Transferencia`).
  - Sequência de salas: a origem é o local da movimentação anterior (ou Ambulatório se for a primeira transferência) e o destino é a localização do registro atual.
  - **Título / Badge**: `Transferência` com estilo visual verde/sucesso (`bg-green-100 text-green-800 border-l-green-500`, marcador verde com ícone).
  - **Data**: Data em que a transferência ocorreu (`dataCriacao` formatada).
  - **Descrição Padrão**: `"Transferido do [Origem] para [Destino]"` com os nomes dos locais destacados em negrito (ex: `Transferido do <strong>Ambulatório</strong> para <strong>Sala de Produtores de Veneno</strong>`).
  - **Responsável**: Exibe profissional/responsável se disponível na movimentação.

---

## 3. Estrutura do Layout e Reutilização de Componentes

1. **Título da Seção**:
   - Cabeçalho com título `"Timeline completa"` no topo da lista.
2. **Filtros no Topo**:
   - Integração com `BarraDeBuscaEFiltro` montada no portal `#tab-header-actions` (padrão de `AbaClinico` e `AbaDesverminacao`), com:
     - Campo de busca textual (filtra por texto da descrição ou nome da localização).
     - Filtro por Intervalo de Datas (`dateRange`).
     - Filtro por Tipo de Movimentação (`checkbox`: "Entrada", "Transferência").
     - Ordenação (`select`: Mais recente primeiro / Mais antiga primeiro).
3. **Linha da Timeline**:
   - Linha vertical cinza contínua (`absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200`) e marcadores circulares flutuantes alinhados (`absolute -left-[37px] top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full`).
4. **Cards da Timeline**:
   - Reutilização de `HorizontalCard` com `leftBorderClass`, `badge`, `title` (com ícone de calendário e data), e descrição/detalhes no corpo.
5. **Integração na Ficha**:
   - Inclusão da aba na lista e renderização em `FichaAnimalVisaoGeral.tsx`:
     ```tsx
     {activeTab === "Movimentações" && id && (
       <AbaMovimentacoes animalId={parseInt(id)} dataEntrada={animal.dataDeEntrada} />
     )}
     ```

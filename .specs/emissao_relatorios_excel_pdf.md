# Spec: Emissão de Relatórios em Excel e PDF

## 1. Visão Geral e Objetivo
Implementar a emissão de relatórios gerenciais e operacionais em formatos **Excel (.xlsx)** e **PDF (.pdf)** para os 7 módulos/assuntos principais do sistema:
1. **Plantel**: Situação dos animais cadastrados com filtros demográficos e taxonômicos.
2. **Alimentar**: Histórico de alimentação diária, consumo e responsáveis.
3. **Clínico**: Atendimentos veterinários (consultas, altas, quarentenas, medicações, exames, evoluções e procedimentos).
4. **Instalações (Salas Filhas / Recintos)**: Animais alocados em uma localização/sala específica da hierarquia.
5. **Eventos (Internos e Externos)**: Histórico e planejamento de eventos institucionais, aulas e atividades externas.
6. **Movimentações**: Histórico de transferências de sala, saídas/retornos de eventos e ambulatório.
7. **SISFAUNA**: Registro obrigatório de animais cadastrados no Sistema Nacional de Gestão de Fauna Silvestre (IBAMA/SISFAUNA), filtrados por ano de referência ou período de entrada.

> **Importante**: Não serão criadas novas tabelas/entidades de banco de dados para os relatórios. O módulo de relatórios é estritamente uma camada de consulta (Queries CQRS) que lê as entidades já existentes e projeta os dados em fluxos de bytes (`FileStreamResult` / `byte[]`) para Excel e PDF.

---

## 2. Padrão Arquitetural e Tecnologias

### 2.1 Backend (.NET 8)
- **Estrutura CQRS (MediatR)**:
  - Pasta: `Features/Relatorios/Queries/Export{Assunto}Relatorio/`
  - Query: `Export{Assunto}RelatorioQuery : IRequest<ExportRelatorioFileDto>`
  - Formato selecionável: `FormatoRelatorio` enum (`Excel = 1`, `Pdf = 2`)
  - Retorno:
    ```csharp
    public class ExportRelatorioFileDto
    {
        public byte[] FileBytes { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
    }
    ```
- **Bibliotecas recomendadas**:
  - **Excel**: `ClosedXML` (MIT, leve, amplamente adotado em .NET para planilhas estilizadas e seguras).
  - **PDF**: `QuestPDF` (Community MIT para projetos elegíveis) ou `PdfSharpCore` / `DinkToPdf` / renderizador fluente em C#. *Recomendado:* `QuestPDF` pela facilidade de criação de tabelas dinâmicas, paginação nativa (página X de Y), cabeçalhos e rodapés institucionais limpos.
- **Controller Dedicado**: `RelatoriosController` com rotas `GET /api/Relatorios/{assunto}?formato=Excel&...` retornando `File(dto.FileBytes, dto.ContentType, dto.FileName)`.

---

## 3. Contratos de API e Filtros por Módulo

### 3.1 Relatório Plantel
- **Rota**: `GET /api/Relatorios/plantel`
- **Filtros (Query Parameters)**:
  - `grupoId` (int, opcional)
  - `especieId` (int, opcional)
  - `situacao` (enum Situacao: Vivo = 1, Obito = 2, Reintroduzido = 3, opcional)
  - `genero` (enum Genero: Macho = 1, Femea = 2, NaoIdentificado = 3, opcional)
  - `faseDeVida` (enum FaseDeVida: Filhote = 1, Jovem = 2, Adulto = 3, opcional)
  - `dataEntradaInicio` (DateTime, opcional)
  - `dataEntradaFim` (DateTime, opcional)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Número de Registro
  - Nome Popular
  - Espécie (Nome Científico / Popular)
  - Grupo
  - Sexo
  - Fase de Vida
  - Situação
  - Localização
  - Data de Entrada
  - SISFAUNA (Sim / Não)
  - Nº Microchip

### 3.2 Relatório Alimentar
- **Rota**: `GET /api/Relatorios/alimentacao`
- **Filtros**:
  - `dataInicio` (DateTime, obrigatório ou default últimos 30 dias)
  - `dataFim` (DateTime, obrigatório)
  - `especieId` (int, opcional)
  - `consumo` (enum: Todos = 0, Aceitou = 1, Negou = 2, Regurgitou = 3, Pendente = 4, opcional)
  - `responsavelRF` ou `responsavelNome` (string, opcional)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Data
  - Animal (Número de Registro e Nome)
  - Espécie
  - Refeição
  - Quantidade Ofertada
  - Quantidade Consumida / Saldo
  - Status / Consumo (Comeu/Aceitou, Negou, Regurgitou, Pendente)
  - Responsável pelo Trato (RF / Nome)
  - Observações

### 3.3 Relatório Clínico
- **Rota**: `GET /api/Relatorios/clinico`
- **Filtros**:
  - `dataInicio` (DateTime, obrigatório)
  - `dataFim` (DateTime, obrigatório)
  - `tipoClinico` (enum: Todos = 0, Consultas = 1, AltaAmbulatorial = 2, LiberacaoQuarentena = 3, Medicacoes = 4, SolicitacaoExames = 5, Evolucoes = 6, Procedimentos = 7)
  - `animalId` (int, opcional)
  - `veterinarioRF` (string, opcional)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Data / Hora
  - Registro do Animal
  - Nome / Espécie
  - Tipo de Atendimento
  - Descrição / Motivo / Diagnóstico / Medicamento
  - Veterinário / Responsável
  - Status / Parecer / Desfecho

### 3.4 Relatório Instalações (Salas Filhas / Recintos)
- **Rota**: `GET /api/Relatorios/instalacoes`
- **Filtros**:
  - `localizacaoId` (int, obrigatório - sala ou recinto específico)
  - `incluirSublocais` (bool, default true)
  - `especieId` (int, opcional)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Sala / Localização Completa (Caminho Hierárquico)
  - Capacidade / Ambiente (Interno / Externo)
  - Animal (Registro e Nome)
  - Espécie
  - Sexo / Fase de Vida
  - Data de Alocação no Local

### 3.5 Relatório de Eventos (Internos e Externos)
- **Rota**: `GET /api/Relatorios/eventos`
- **Filtros**:
  - `dataInicio` (DateTime, opcional)
  - `dataFim` (DateTime, opcional)
  - `tipoEvento` (enum TipoEvento: Todos = 0, Interno = 1, Externo = 2)
  - `status` (enum Status: Todos = 0, Agendado = 1, EmAndamento = 2, Cancelado = 3, Concluido = 4, RegistroRetornoAtrasado = 5)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Nome do Evento
  - Tipo (Interno / Externo)
  - Status
  - Início / Retorno Previsto
  - Responsável
  - Quantidade de Animais Participantes
  - Animais Envolvidos (Resumo de Registros)

### 3.6 Relatório de Movimentações
- **Rota**: `GET /api/Relatorios/movimentacoes`
- **Filtros**:
  - `dataInicio` (DateTime, opcional)
  - `dataFim` (DateTime, opcional)
  - `animalId` (int, opcional)
  - `tipoMovimentacao` (enum: Transferencia, SaidaEvento, RetornoEvento, AtendimentoClinico, RetornoAmbulatorio, Todos)
  - `localizacaoOrigemId` ou `localizacaoDestinoId` (int, opcional)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Data / Hora do Registro
  - Animal (Nº Registro, Nome)
  - Espécie
  - Tipo de Movimentação
  - Localização Destino
  - Evento Vinculado (se houver)
  - Usuário Responsável (RF)

### 3.7 Relatório SISFAUNA
- **Definição de Domínio**:
  Animais registrados com `Sisfauna = true` no sistema. O SISFAUNA exige controle de cativeiro e relatórios de fauna com base no **Ano de Referência** (exercício fiscal/anual) e data de entrada/nascimento no plantel, além de registros de óbitos e evasões/reintroduções no período.
- **Rota**: `GET /api/Relatorios/sisfauna`
- **Filtros**:
  - `anoReferencia` (int, opcional - ex.: 2026)
  - `dataEntradaInicio` (DateTime, opcional)
  - `dataEntradaFim` (DateTime, opcional)
  - `especieId` (int, opcional)
  - `somenteAtivos` (bool, default false - se true traz só vivos; se false inclui óbitos e reintroduções do período)
  - `formato` (Excel | Pdf, obrigatório)
- **Colunas do Relatório**:
  - Registro Interno
  - Nº Registro SISFAUNA / Marcação (Microchip / Anilha)
  - Espécie (Nome Científico e Nome Comum)
  - Sexo / Fase de Vida
  - Procedência / Origem
  - Data de Entrada
  - Situação no Ano de Referência (Vivo no Plantel, Óbito com Data, Soltura/Reintrodução)
  - Termo de Doação / Documentação Legal

---

## 4. Design da Interface do Usuário (Frontend)

1. **Central de Relatórios**:
   - Tela `/relatorios` já configurada na rota do `AppSidebar` (item `Relatórios` com ícone `FileChartColumn`).
   - Navegação por Abas estilizadas usando os mesmos ícones do menu lateral do sistema:
     - 📖 **Plantel** (`Book`)
     - 🐀 **Alimentação** (`Rat`)
     - 🩺 **Clínico** (`Stethoscope`)
     - 🏢 **Instalações** (`Building2`)
     - 📅 **Eventos** (`CalendarDays`)
     - 🔄 **Movimentações** (`ArrowLeftRight`)
     - 📋 **SISFAUNA** (`FileText`)
2. **Componente de Filtros Reutilizável**:
   - Cada aba exibe seu formulário limpo de filtros correspondentes com selects integrados aos endpoints já existentes (`/api/Especie`, `/api/Grupo`, `/api/Localizacao`, etc.).
   - Dois botões de ação com feedback de loading:
     - `Gerar Excel (.xlsx)` (ícone de planilha verde)
     - `Gerar PDF (.pdf)` (ícone de PDF vermelho)
3. **Download transparente no navegador**:
   - O frontend dispara o download via Blob com o nome amigável do arquivo retornado pelo header `content-disposition` (ex.: `relatorio-plantel-2026-11-04.xlsx`).

---

## 5. Casos de Teste (A2A)

1. **CT-01: Exportar Relatório Plantel Excel e PDF com Sucesso**
   - Requisição: `GET /api/Relatorios/plantel?formato=Excel`
   - Resposta: 200 OK com mime type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` e stream com bytes válidos.
   - Requisição: `GET /api/Relatorios/plantel?formato=Pdf`
   - Resposta: 200 OK com mime type `application/pdf` e bytes iniciando com `%PDF`.

2. **CT-02: Exportar Relatório Alimentar com Filtro de Consumo e Período**
   - Requisição com data inicial e final e `consumo=Aceitou`.
   - Valida retorno 200 e dados filtrados.

3. **CT-03: Exportar Relatório Clínico por Tipo e Período**
   - Requisição filtrando por `tipoClinico=Consultas`.
   - Valida geração correta do arquivo.

4. **CT-04: Exportar Relatório Instalações sem Localização Obrigatória**
   - Requisição sem `localizacaoId`.
   - Valida retorno de erro de validação (400 Bad Request).

5. **CT-05: Exportar Relatório SISFAUNA por Ano de Referência**
   - Requisição com `anoReferencia=2026`.
   - Valida que apenas animais com `Sisfauna == true` e movimentações do ano são computados.

---

## 6. Plano de Implementação

1. **Dependências do Backend**:
   - Instalar `ClosedXML` (para Excel) e `QuestPDF` (para PDF) no `Gestao-Bioterio.Application` ou `Gestao-Bioterio.Infra`.
2. **Camada de Aplicação (Queries)**:
   - Criar `Features/Relatorios/Common/` com interfaces para exportação `IExcelReportGenerator` e `IPdfReportGenerator`.
   - Implementar os Handlers de cada relatório consultando os repositórios correspondentes com `.AsNoTracking()`.
3. **Controller**:
   - Criar `Gestao-Bioterio.Api/Controllers/RelatoriosController.cs` com os endpoints para cada relatório.
4. **Testes A2A**:
   - Criar `RelatorioModuleTests.cs` em `Gestao-Bioterio.A2ATests/` cobrindo geração em Excel e PDF para cada rota.
5. **Frontend**:
   - Criar `src/services/relatorioService.ts` com métodos blob para baixar Excel e PDF.
   - Criar rota e tela `src/routes/Relatorios/VisaoGeralRelatorios.tsx`.
   - Adicionar o item "Relatórios" na navegação lateral (`MainLayout`).

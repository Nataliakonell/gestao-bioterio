# Especificação Técnica: Módulo de Instalações, Eventos e Movimentações (SIGBIO)

## 1. Visão Geral

Este documento especifica a modelagem de dados e a arquitetura relacional para a gestão unificada de **Localizações, Eventos e Movimentações** do sistema SIGBIO (UCDB). 

A ideia central desta refatoração é juntar a entidade legada `InstalacaoBioterio` com a nova estrutura unificada `Localizacao`. Hoje, a `InstalacaoBioterio` guarda apenas as salas onde os animais ficam hospedados. Com a evolução do sistema, surge a necessidade de controlar outros tipos de ambientes, tais como setores institucionais e locais externos à UCDB (para eventos, exposições, feiras e estudos de campo). 

Em vez de criar uma tabela para cada tipo de local, a tabela `Localizacao` irá centralizar absolutamente tudo. Isso permite organizar os locais de forma hierárquica e padronizada, simplificando o rastreamento de animais dentro e fora do biotério.

## 2. Decisões de Arquitetura e Modelagem

1. **Unificação e Hierarquia de Locais (`Localizacao`):**
   * Substitui a tabela `InstalacaoBioterio`, unificando recintos, salas, setores e destinos externos em uma única estrutura.
   * Suporta hierarquias via auto-relacionamento (`LocalizacaoPaiId`).
   * *Exemplo de hierarquia interna:* `UCDB → Biotério → Sala de Produtores de Veneno`.
   * *Exemplo de localização externa:* `Shopping Bosque dos Ipês`.

2. **Estratégia de Migração de Dados (Legacy Transition):**
   * Os dados existentes na tabela `InstalacaoBioterio` serão migrados diretamente para a nova tabela `Localizacao`.
   * As referências legadas no código serão refatoradas para apontar para `Localizacao`.
   * A localização atual de cada animal existente no sistema será populada na tabela `AnimalLocalizacao` como estado inicial, garantindo zero perda de dados.


4. **Trilha de Movimentação em Sequência de Linhas (*Append-Only*):**
   * A tabela `MovimentacaoAnimal` grava um histórico incremental (linha a linha) de por onde o animal passou.
   * Não são utilizadas colunas de `Origem` e `Destino` na mesma linha; a sequência histórica reflete os passos do animal ao longo do tempo.

5. **Estado Atual Desnormalizado (`AnimalLocalizacao`):**
   * Para respostas instantâneas de "onde o animal está agora", a tabela `AnimalLocalizacao` guarda o estado presente e é atualizada a cada nova linha inserida em `MovimentacaoAnimal`.

6. **Desacoplamento Burocrático (`DocumentoEvento`):**
   * Dados customizados exigidos em formulários oficiais para eventos externos (ex: formulário do IMASUL, condutores, veículos, rotas) são armazenados em formato JSON na tabela `DocumentoEvento`, vinculados ao template em `ModeloDocumento`.

---

## 3. Dicionário de Dados

### 3.1 `Localizacao`
Centraliza todos os recintos, salas, setores e locais externos.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `Nome` | `string` | Nome do local (ex: "Sala de Produtores de Veneno", "Shopping Bosque dos Ipês") |
| `LocalizacaoPaiId` | `int?` / `Guid?` (FK) | ID da localização pai (suporta a árvore hierárquica) |
| `Ambiente` | `string` | Classificação do ambiente (ex: "Interno", "Externo", "Transitório") |
| `CaminhoId` | `string?` | Path de IDs para otimização de busca em árvore |
| `CaminhoHierarquia` | `string?` | Path textual legível (ex: "UCDB -> Biotério -> Sala de Produtores de Veneno") |

### 3.2 `AnimalLocalizacao`
Armazena a localização presente e exata de cada animal.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `AnimalId` | `int` / `Guid` (FK) | Identificador do animal |
| `LocalizacaoId` | `int` / `Guid` (FK) | Identificador da localização atual do animal |
| `DataAtualizacao` | `DateTime` | Data/Hora da última atualização de local |


### 3.3 `MovimentacaoAnimal`
Histórico em sequência de linhas (log transacional) das movimentações dos animais.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `AnimalId` | `int` / `Guid` (FK) | Identificador do animal movimentado |
| `LocalizacaoId` | `int` / `Guid` (FK) | Localização para onde o animal foi movido nesta etapa |
| `EventoId` | `int?` / `Guid?` (FK) | ID do evento associado (nulo para transferências/rotinas simples) |
| `TipoMovimentacao` | `Enum` | `TransferenciaInterna`, `BanhoDeSol`, `SaidaEvento`, `RetornoEvento`, `AtendimentoClinico` |
| `DataAtualizacao` | `DateTime` | Data e hora em que a movimentação foi efetuada |

### 3.4 `Evento`
Cadastro e agendamento de eventos internos e externos.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `Nome` | `string` | Título do evento ou exposição |
| `TipoEvento` | `Enum` | `Interno` ou `Externo` |
| `LocalizacaoId` | `int` / `Guid` (FK) | Localização de destino do evento |
| `DataHoraInicio` | `DateTime` | Data e hora agendada para início |
| `DataHoraPrevisaoRetorno` | `DateTime` | Data e hora prevista para retorno |
| `Status` | `Enum` | `Agendado`, `EmAndamento`, `RetornoAtrasado`, `RetornoConfirmado` |
| `Observacao` | `string?` | Observações gerais do agendamento |

### 3.5 `EventoAnimal`
Tabela de relacionamento N:N entre eventos e os animais participantes.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `Nome` | `string?` | Identificador amigável / rótulo do item (opcional) |
| `EventoId` | `int` / `Guid` (FK) | Identificador do evento |
| `AnimalId` | `int` / `Guid` (FK) | Identificador do animal participante |

### 3.6 `DocumentoEvento`
Armazena as informações burocráticas e específicas de eventos externos para geração de documentos.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Id` | `int` / `Guid` (PK) | Chave primária padrão |
| `EventoId` | `int` / `Guid` (FK) | Identificador do evento associado |
| `ModeloDocumentoId` | `int` / `Guid` (FK) | ID do template na tabela `ModeloDocumento` |
| `ConteudoDadosJson` | `string (JSON)` | JSON com os dados preenchidos no formulário (IMASUL, veículos, condutores, etc.) |

---

## 4. Plano de Migração e Automações

1. **Passo 1: Migração de Estrutura:**
   * Executar Script/Migration para criar a tabela `Localizacao`, `AnimalLocalizacao`, `MovimentacaoAnimal`, `Evento`, `EventoAnimal` e `DocumentoEvento`.

2. **Passo 2: Carga e Depara Inicial (`InstalacaoBioterio` → `Localizacao`):**
   * Inserir o nó raiz: `UCDB` (`LocalizacaoPaiId = null`).
   * Inserir o segundo nível: `Biotério` (`LocalizacaoPaiId = ID_UCDB`).
   * Copiar todas as registros da `InstalacaoBioterio` para `Localizacao` definindo `LocalizacaoPaiId = ID_BIOTERIO`.

3. **Passo 3: Inicialização do Estado Atual do Plantel (`AnimalLocalizacao`):**
   * Ler os vínculos existentes entre `Animal` e `InstalacaoBioterio` e inserir a primeira linha em `AnimalLocalizacao` apontando para a respectiva nova `LocalizacaoId`.

4. **Passo 4: Ciclo de Vida da Movimentação (Manuais e Eventos):**
   * Toda movimentação (manual ou por mudança de status de evento) insere um registro em `MovimentacaoAnimal` e atualiza o ponteiro presente em `AnimalLocalizacao`.
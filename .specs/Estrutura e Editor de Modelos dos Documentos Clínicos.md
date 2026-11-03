# Implementação dos Documentos Clínicos e Editor de Modelos

## Contexto

O sistema possui atendimentos clínicos e, a partir deles, podem ser gerados diferentes documentos.

Atualmente existem **três tipos de documentos clínicos** que precisam ser estruturados no sistema:

1. **Liberação de Quarentena**
2. **Alta Ambulatorial**
3. **Solicitação de Exame**

Cada documento possui:

- uma entidade própria no backend;
- dados próprios;
- formulário próprio para preenchimento;
- modelo visual próprio para impressão.

Além disso, quero que o sistema tenha um conceito de **Editor de Modelo de Documento**, permitindo trabalhar com modelos editáveis utilizando um editor de texto rico.

---

# 1. Conceito importante — Documento x Modelo x Editor

Não confundir os seguintes conceitos.

## Entidade do documento

Representa os dados registrados no banco.

Exemplos:

```text
LiberacaoQuarentena
AltaAmbulatorial
SolicitacaoExame
```

## Formulário

É a tela utilizada pelo usuário para preencher os dados do documento.

Exemplos:

```text
Nova Liberação de Quarentena
Nova Alta Ambulatorial
Nova Solicitação de Exame
```

## Modelo do documento

É a estrutura visual utilizada para gerar o documento que será impresso.

Por exemplo:

```text
LIBERAÇÃO DE QUARENTENA

Animal: {{Animal.Identificacao}}

Data de entrada: {{DataEntradaQuarentena}}

Data de saída: {{DataSaidaQuarentena}}

...
```

## Editor de Modelo

É a interface administrativa utilizada para criar/editar esse modelo.

Esse componente pode ser chamado de:

- **Rich Text Editor (RTE)**
- **Editor de Texto Rico**
- **Editor WYSIWYG**
- **Rich Text Area**
- **Editor de Template**
- **Template Editor**
- **Editor de Modelo de Documento**

Para o sistema, o conceito desejado é principalmente:

> **Editor de Modelo de Documento (Template Editor)**

utilizando um **Rich Text Editor / WYSIWYG** como componente de edição.

---

# 2. Não armazenar HTML diretamente nas entidades

As entidades abaixo representam dados de negócio:

```text
LiberacaoQuarentena
AltaAmbulatorial
SolicitacaoExame
```

Não adicionar propriedades como:

```csharp
public string HtmlDocumento { get; set; }
```

nem:

```csharp
public string TemplateHtml { get; set; }
```

dentro dessas entidades.

O HTML do modelo deve ser responsabilidade do mecanismo de **Template Editor / Editor de Modelo de Documento**.

---

# 3. Entidade existente — LiberacaoQuarentena

Manter a entidade existente:

```csharp
public class LiberacaoQuarentena : AuditableEntity
{
    public int Id { get; set; }

    public int AtendimentoId { get; set; }

    public DateTime DataEntradaQuarentena { get; set; }

    public DateTime DataSaidaQuarentena { get; set; }

    public int? InstalacaoBioterioId { get; set; }
}
```

Avaliar os relacionamentos de navegação de acordo com o padrão já utilizado no projeto.

Se fizer sentido e seguir o padrão existente:

```csharp
public Atendimento? Atendimento { get; set; }

public InstalacaoBioterio? InstalacaoBioterio { get; set; }
```

A entidade deve continuar representando exclusivamente a **liberação da quarentena**.

---

# 4. Entidade existente — AltaAmbulatorial

Manter a entidade existente:

```csharp
public class AltaAmbulatorial : AuditableEntity
{
    public int Id { get; set; }

    public int AtendimentoId { get; set; }

    public Atendimento? Atendimento { get; set; }

    public DateTime? DataEntradaAmbulatorio { get; set; }

    public DateTime? DataAltaClinica { get; set; }

    public string? ProcedimentosMedicacoes { get; set; }

    public string? ObservacoesClinicas { get; set; }

    public int? InstalacaoBioterioRetornoId { get; set; }

    public InstalacaoBioterio? InstalacaoBioterioRetorno { get; set; }
}
```

Não alterar sua finalidade.

Ela representa os dados clínicos da **Alta Ambulatorial**.

---

# 5. Nova entidade — SolicitacaoExame

Criar uma entidade própria:

```csharp
public class SolicitacaoExame : AuditableEntity
{
    public int Id { get; set; }

    public int AtendimentoId { get; set; }

    public Atendimento? Atendimento { get; set; }

    public DateTime DataSolicitacao { get; set; }

    public string? SinaisClinicosObservados { get; set; }

    public string? SuspeitaClinica { get; set; }

    public string? RegiaoAnatomicaInteresse { get; set; }

    public string? ObservacoesAdicionais { get; set; }

    public ICollection<SolicitacaoExameItem> ExamesSolicitados { get; set; }
        = new List<SolicitacaoExameItem>();
}
```

A solicitação deve estar vinculada ao `Atendimento`.

Não duplicar na entidade dados que já podem ser obtidos através do atendimento/animal, como:

- espécie;
- identificação;
- origem.

Essas informações deverão ser utilizadas na geração do documento através dos relacionamentos existentes.

---

# 6. Tipos de exame

Utilizar a opção de entidade intermediária para os exames.

Não utilizar `[Flags]`.

Criar:

```csharp
public enum TipoExame
{
    HemogramaCompleto = 1,
    Ultrassonografia = 2,
    Radiografia = 3,
    Outros = 99
}
```

Criar também:

```csharp
public class SolicitacaoExameItem : AuditableEntity
{
    public int Id { get; set; }

    public int SolicitacaoExameId { get; set; }

    public SolicitacaoExame? SolicitacaoExame { get; set; }

    public TipoExame TipoExame { get; set; }

    public string? Descricao { get; set; }
}
```

Isso permitirá:

```text
SolicitacaoExame
    ├── HemogramaCompleto
    ├── Ultrassonografia
    └── Radiografia
```

E também:

```text
SolicitacaoExame
    └── Outros
          └── Descricao: Exame bioquímico
```

Avaliar a necessidade de `Descricao` conforme os padrões existentes do projeto.

---

# 7. Modelo da Solicitação de Exame

O documento oficial deve conter:

```text
Data:

Responsável:

Solicita-se a realização de exames complementares
do animal descrito abaixo:

Espécie:
Identificação do animal:
Origem:

Sinais clínicos observados:

Suspeita clínica:

Exames solicitados:

☐ Hemograma completo
☐ Ultrassonografia
☐ Radiografia (Raio-X)
☐ Outros:

Região anatômica de interesse (Raio X e ultrassom):

Observações adicionais:


Nome do responsável
CRM:
```

Os campos devem ser preenchidos dinamicamente a partir dos dados do atendimento, animal, usuário responsável e `SolicitacaoExame`.

---

# 8. Editor de Modelo de Documento

Criar o conceito de **Editor de Modelo de Documento**.

O objetivo é permitir que um administrador consiga editar visualmente o modelo de cada documento.

O editor deve funcionar como um:

> **Rich Text Editor (RTE) / Editor WYSIWYG / Template Editor**

O usuário deve conseguir visualizar o documento de forma semelhante ao resultado final.

---

# 9. Funcionalidades desejadas do Rich Text Editor

O editor de modelo deve permitir, conforme as capacidades da biblioteca escolhida:

- texto em negrito;
- itálico;
- sublinhado;
- alinhamento;
- tamanho de fonte;
- títulos;
- listas;
- tabelas;
- espaçamento;
- quebra de linha;
- inserção de campos dinâmicos;
- edição visual do conteúdo;
- copiar/colar;
- formatação básica de documento.

O editor deve ser adequado para documentos oficiais que posteriormente serão impressos.

---

# 10. Campos dinâmicos / placeholders

O principal recurso do Template Editor deve ser permitir inserir campos dinâmicos.

Por exemplo:

```text
{{Data}}
{{Responsavel.Nome}}
{{Responsavel.CRM}}
{{Animal.Especie}}
{{Animal.Identificacao}}
{{Animal.Origem}}
{{Atendimento.Id}}
```

Para cada documento, os placeholders disponíveis devem depender dos dados daquele documento.

Por exemplo, no modelo de **Alta Ambulatorial**:

```text
{{DataEntradaAmbulatorio}}
{{DataAltaClinica}}
{{ProcedimentosMedicacoes}}
{{ObservacoesClinicas}}
{{InstalacaoBioterioRetorno.Nome}}
```

Na **Liberação de Quarentena**:

```text
{{DataEntradaQuarentena}}
{{DataSaidaQuarentena}}
{{InstalacaoBioterio.Nome}}
```

Na **Solicitação de Exame**:

```text
{{DataSolicitacao}}
{{SinaisClinicosObservados}}
{{SuspeitaClinica}}
{{RegiaoAnatomicaInteresse}}
{{ObservacoesAdicionais}}
```

E campos relacionados ao animal/atendimento:

```text
{{Animal.Especie}}
{{Animal.Identificacao}}
{{Animal.Origem}}
```

---

# 11. Inserção de campos no editor

Não obrigar o usuário a digitar manualmente:

```text
{{Animal.Especie}}
```

Criar uma forma visual de inserir campos.

Por exemplo:

```text
┌──────────────────────────────────────┐
│ Editor de Modelo                     │
├──────────────────────────────────────┤
│ B I U  Tamanho  Alinhamento  Tabela │
│                                      │
│ [Inserir campo ▼]                    │
│                                      │
│ LIBERAÇÃO DE QUARENTENA              │
│                                      │
│ Animal: {{Animal.Identificacao}}     │
│                                      │
│ Data: {{DataSaidaQuarentena}}        │
│                                      │
└──────────────────────────────────────┘
```

Ao clicar em **Inserir campo**, apresentar opções agrupadas:

```text
Animal
  - Espécie
  - Identificação
  - Origem

Atendimento
  - Número
  - Data

Usuário / Responsável
  - Nome
  - CRM

Documento
  - Data
  - ...

Dados específicos do documento
  - ...
```

Ao selecionar um campo, o sistema insere o placeholder correspondente.

---

# 12. Modelos separados para cada documento

Não utilizar um único template para todos os documentos.

Devem existir modelos independentes:

```text
Template
├── LiberacaoQuarentena
├── AltaAmbulatorial
└── SolicitacaoExame
```

Cada documento possui seus próprios placeholders disponíveis.

---

# 13. Estrutura sugerida do modelo

Se for necessário criar uma entidade para armazenar os templates, ela deve ser separada das entidades de negócio.

Por exemplo, avaliar uma estrutura semelhante a:

```csharp
public class ModeloDocumento : AuditableEntity
{
    public int Id { get; set; }

    public TipoDocumento TipoDocumento { get; set; }

    public string Nome { get; set; }

    public string Conteudo { get; set; }

    public bool Ativo { get; set; }
}
```

Criar o enum:

```csharp
public enum TipoDocumento
{
    LiberacaoQuarentena = 1,
    AltaAmbulatorial = 2,
    SolicitacaoExame = 3
}
```

Adaptar os nomes ao padrão real do projeto.

O importante é manter a separação:

```text
ModeloDocumento
        ↓
conteúdo/template

LiberacaoQuarentena
        ↓
dados

AltaAmbulatorial
        ↓
dados

SolicitacaoExame
        ↓
dados
```

---

# 14. Segurança do Rich Text

Como o editor permitirá conteúdo HTML/Rich Text, não confiar cegamente no HTML enviado pelo frontend.

O backend deve considerar sanitização do conteúdo antes de armazená-lo ou renderizá-lo.

O conceito pode ser tratado como:

> **Input de Texto Sanitizado / Rich Text Area**

Evitar permitir scripts ou conteúdo HTML potencialmente perigoso.

O conteúdo do modelo deve aceitar somente as tags/formatações necessárias para documentos.

---

# 15. Formulários dos três documentos

Criar ou adequar os formulários:

```text
Nova Liberação de Quarentena

Nova Alta Ambulatorial

Nova Solicitação de Exame
```

Esses formulários não precisam utilizar Rich Text Editor para todos os campos.

Os campos estruturados devem continuar sendo componentes adequados:

```text
Data → DatePicker

Instalação → Select

Exames → Checkbox / seleção múltipla

Observações → Textarea

Sinais clínicos → Textarea

Suspeita clínica → Textarea
```

O **Rich Text Editor deve ser utilizado principalmente para o Editor de Modelo de Documento**, e não substituir todos os formulários estruturados.

---

# 16. Fluxo esperado

O fluxo deve funcionar aproximadamente assim:

```text
ADMINISTRADOR
      ↓
Editor de Modelo de Documento
      ↓
Escolhe:
  Liberação de Quarentena
  Alta Ambulatorial
  Solicitação de Exame
      ↓
Edita o modelo
      ↓
Insere campos dinâmicos
      ↓
Salva modelo
```

Depois:

```text
USUÁRIO
   ↓
Atendimento
   ↓
Escolhe documento
   ↓
Preenche formulário
   ↓
Salva
   ↓
Visualiza documento
   ↓
Sistema utiliza o modelo correspondente
   ↓
Substitui os placeholders pelos dados reais
   ↓
Documento final
   ↓
Imprimir / gerar PDF
```

---

# 17. Separação das responsabilidades

A arquitetura final deve seguir este conceito:

```text
┌───────────────────────────────┐
│ ENTIDADES DE DOMÍNIO          │
├───────────────────────────────┤
│ LiberacaoQuarentena           │
│ AltaAmbulatorial              │
│ SolicitacaoExame              │
│ SolicitacaoExameItem          │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ MODELO DO DOCUMENTO           │
├───────────────────────────────┤
│ ModeloDocumento               │
│ TipoDocumento                 │
│ Conteúdo Rich Text/HTML       │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ EDITOR                         │
├───────────────────────────────┤
│ Rich Text Editor               │
│ WYSIWYG                        │
│ Template Editor                │
│ Inserção de campos dinâmicos   │
└───────────────────────────────┘
                ↓
┌───────────────────────────────┐
│ DOCUMENTO FINAL                │
├───────────────────────────────┤
│ HTML/CSS                       │
│ Impressão                      │
│ PDF, se o sistema possuir     │
└───────────────────────────────┘
```

---

# 18. Não criar complexidade desnecessária

Antes de implementar uma nova estrutura, verificar o que já existe no projeto.

Se já houver:

- componente Rich Text Editor;
- mecanismo de impressão;
- editor HTML;
- sanitização;
- sistema de templates;
- componentes de documentos;
- sistema de placeholders;

reutilizar o que já existe.

Não criar uma segunda implementação da mesma funcionalidade.

---

# 19. Resultado esperado

Ao final da implementação, o sistema deve suportar os três documentos:

### Liberação de Quarentena

```text
LiberacaoQuarentena
```

### Alta Ambulatorial

```text
AltaAmbulatorial
```

### Solicitação de Exame

```text
SolicitacaoExame
    └── SolicitacaoExameItem
```

E deve existir um mecanismo separado para seus modelos:

```text
ModeloDocumento
    ├── Liberação de Quarentena
    ├── Alta Ambulatorial
    └── Solicitação de Exame
```

com edição através de um:

> **Editor de Modelo de Documento (Template Editor)**

baseado em:

> **Rich Text Editor (RTE) / Editor WYSIWYG**

com suporte a campos dinâmicos e conteúdo sanitizado.

---

# 20. Importante antes de alterar o código

Analisar primeiro a implementação existente no projeto.

Identificar:

- como as entidades estão organizadas;
- como as configurações do Entity Framework são feitas;
- como são criadas as migrations;
- como são estruturados Commands e Handlers;
- como os DTOs são definidos;
- como os enums são organizados;
- como os usuários logados são identificados;
- como o CRM é obtido;
- como os documentos existentes são gerados;
- se já existe algum editor Rich Text;
- se já existe algum componente WYSIWYG;
- como a impressão é implementada;
- como o frontend organiza formulários e páginas;
- como são feitas validações.

Depois disso, implementar as mudanças seguindo os padrões já existentes.

Não substituir código existente sem necessidade.

Ao final, apresentar:

1. Arquivos criados;
2. Arquivos alterados;
3. Alterações nas entidades;
4. Alterações nos DTOs;
5. Alterações nos endpoints;
6. Alterações no frontend;
7. Migrations necessárias;
8. Dependências novas, caso alguma biblioteca Rich Text/WYSIWYG seja adicionada;
9. Como o Editor de Modelo de Documento foi integrado;
10. Como os placeholders são inseridos e posteriormente substituídos pelos dados reais.



# Implementação de geração, visualização e impressão de PDF dos documentos clínicos

Preciso alterar o fluxo atual de documentos clínicos do sistema para que a geração de PDF seja feita de forma profissional e consistente, sem depender exclusivamente da janela de impressão do navegador.

## Contexto atual

O frontend utiliza React + TypeScript + Tailwind/Radix e possui o componente `DocumentoViewer`.

Atualmente o componente:

- Busca o modelo de documento através de `modeloDocumentoService`.
- Monta o HTML do documento.
- Substitui os campos dinâmicos através de `parseDocumentTemplate`.
- Utiliza `fullHtml` para renderizar uma prévia do documento.
- Possui um botão `Imprimir / Gerar PDF`.
- Esse botão utiliza `window.print()` através de um iframe.
- O usuário fica dependente da janela de impressão do navegador para escolher "Salvar como PDF".
- A impressão pode ficar limitada às configurações do navegador, inclusive a opção de preto e branco.
- A visualização atual simula uma folha A4 usando `800px` e `900px`, em vez de utilizar dimensões proporcionais ao A4 real.

Quero substituir esse fluxo por uma solução de geração de PDF real.

## Objetivo

Implementar um fluxo semelhante a um visualizador profissional de PDF:

```text
Documento clínico
       ↓
Template HTML + dados dinâmicos
       ↓
Renderização do documento
       ↓
Geração de PDF real
       ↓
┌─────────────────────────────┐
│ Visualizar PDF              │
│ Baixar PDF                  │
│ Imprimir                    │
└─────────────────────────────┘
```

A experiência deve ser semelhante a visualizadores de PDF como o Google Drive/Google Docs Viewer, com documento em A4, navegação, zoom e ações de baixar/imprimir.

## Requisito principal

Não quero que o botão "Baixar PDF" simplesmente execute `window.print()`.

Preciso que seja gerado um **arquivo PDF real**, preservando:

- cores;
- fontes;
- negrito;
- itálico;
- alinhamentos;
- listas;
- tabelas;
- espaçamentos;
- margens;
- cabeçalho;
- rodapé;
- imagens;
- quebras de página;
- formatação HTML do template.

A geração deve utilizar o backend .NET sempre que isso for mais adequado à arquitetura existente.

Antes de implementar, analise o projeto para identificar:

1. versão do .NET;
2. arquitetura atual da API;
3. padrão utilizado pelos Controllers;
4. Services;
5. Repositories;
6. DTOs;
7. autenticação/autorização;
8. padrões existentes para download de arquivos;
9. bibliotecas já instaladas que possam ser utilizadas para PDF.

Não instale uma biblioteca nova sem antes verificar se já existe alguma solução no projeto.

---

# 1. Analisar o DocumentoViewer atual

Localize o componente `DocumentoViewer` e preserve sua lógica atual de:

```tsx
modeloDocumentoService.getByTipo(...)
```

```tsx
parseDocumentTemplate(...)
```

```tsx
renderHeaderFooterHtml(...)
```

e:

```tsx
const fullHtml
```

Não quero perder a funcionalidade atual de substituição dos campos dinâmicos.

O HTML final gerado atualmente por:

```tsx
const combined = parseDocumentTemplate(combinedRaw, dados);
```

deve continuar sendo a fonte do documento.

---

# 2. Separar as ações

Substituir o botão atual:

```text
Imprimir / Gerar PDF
```

por ações separadas:

```text
Visualizar
Baixar PDF
Imprimir
```

Sugestão:

- `Eye` → Visualizar
- `FileDown` → Baixar PDF
- `Printer` → Imprimir

Pode adaptar o layout conforme o padrão visual existente no projeto.

---

# 3. Visualização em A4

A área de visualização deve representar uma folha A4 real.

Não utilizar como referência principal:

```tsx
max-w-[800px]
min-h-[900px]
```

Utilizar proporção/dimensões equivalentes a:

```text
210mm × 297mm
```

A prévia deve ter:

- fundo branco;
- sombra;
- centralização;
- fundo cinza ao redor;
- aparência de folha;
- zoom adequado;
- suporte a documentos com múltiplas páginas.

Se `fullHtml` ultrapassar uma página, o sistema deve conseguir representar corretamente as páginas seguintes.

Não cortar o conteúdo simplesmente por causa de `min-height`.

---

# 4. Geração real do PDF

Criar um endpoint no backend responsável por gerar o PDF.

Exemplo conceitual:

```http
POST /api/documentos/gerar-pdf
```

Payload:

```json
{
  "html": "...",
  "nomeArquivo": "Alta-Ambulatorial.pdf"
}
```

A resposta deve ser um arquivo:

```http
Content-Type: application/pdf
```

com o PDF gerado.

Porém, antes de definir exatamente esse contrato, analise os padrões existentes na API e siga a arquitetura atual do projeto.

---

# 5. Tecnologia para geração

Avalie a melhor solução para o projeto.

A prioridade é utilizar uma solução capaz de renderizar HTML/CSS de forma fiel.

Se possível, utilizar um mecanismo baseado em Chromium/Playwright ou equivalente que consiga renderizar o HTML como um navegador.

O PDF precisa ser gerado em:

```text
A4
```

com suporte a:

```css
@page {
    size: A4;
}
```

e preservação de cores.

Não utilizar uma solução que converta o documento apenas em uma imagem, pois preciso manter qualidade de texto e layout.

---

# 6. CSS de impressão/PDF

Reestruturar o CSS para evitar conflito entre:

```css
@page {
    margin: ...
}
```

e o `padding` do `.document-page`.

A página deve controlar:

- tamanho A4;
- margens.

O conteúdo deve controlar:

- espaçamento interno;
- tipografia;
- layout.

Evitar aplicar simultaneamente margens externas e padding que possam causar deslocamento ou corte no PDF.

Garantir:

```css
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
```

quando necessário.

---

# 7. Preservar cores

O documento deve ser gerado em cores.

Não quero depender da configuração:

```text
Cor / Preto e branco
```

da janela de impressão do navegador para a geração do PDF.

O PDF baixado deve preservar as cores definidas pelo template.

---

# 8. Quebra de páginas

Implementar suporte adequado para documentos com mais de uma página.

Evitar:

- cortar textos;
- cortar tabelas;
- cortar imagens;
- deixar títulos isolados;
- sobrepor rodapé;
- ultrapassar os limites da folha.

Utilizar, quando necessário:

```css
page-break-before
page-break-after
page-break-inside
break-before
break-after
break-inside
```

e regras específicas para tabelas.

Exemplo:

```css
table {
    width: 100%;
    border-collapse: collapse;
}

tr {
    break-inside: avoid;
}
```

---

# 9. Cabeçalho e rodapé

O sistema já possui:

```tsx
renderHeaderFooterHtml(...)
```

e:

```tsx
modelo?.headerTemplate
modelo?.footerTemplate
```

Preservar essa estrutura.

Verificar se o cabeçalho e rodapé precisam ser repetidos em todas as páginas do PDF.

Se o mecanismo escolhido permitir cabeçalho/rodapé real de página, utilizar essa funcionalidade quando fizer sentido.

Não remover a funcionalidade existente.

---

# 10. Botão "Baixar PDF"

Ao clicar:

```text
Baixar PDF
```

o frontend deve chamar a API e receber o PDF.

Depois deve realizar o download com um nome adequado.

Exemplo:

```text
Alta-Ambulatorial.pdf
```

Se houver nome do animal, atendimento ou data disponíveis, pode avaliar um nome melhor, por exemplo:

```text
Alta-Ambulatorial-NomeAnimal-20-08-2026.pdf
```

Mas siga o padrão de nomenclatura já utilizado no projeto.

Durante a geração:

```text
Gerando PDF...
```

deve ser apresentado ao usuário.

Evitar múltiplos cliques enquanto a requisição estiver em andamento.

---

# 11. Botão "Visualizar"

Ao clicar em:

```text
Visualizar
```

quero uma experiência de visualização de PDF.

Pode ser implementada de duas formas, conforme a melhor solução encontrada no projeto:

### Opção A

Gerar o PDF e abrir um visualizador de PDF dentro de um modal/página.

### Opção B

Abrir uma rota própria de visualização:

```text
/documentos/visualizar/:id
```

ou equivalente.

O visualizador deve permitir:

- zoom;
- reduzir zoom;
- aumentar zoom;
- navegar entre páginas;
- visualizar o documento;
- baixar;
- imprimir.

Não precisa necessariamente reproduzir exatamente o Google Viewer, mas deve proporcionar uma experiência semelhante e profissional.

---

# 12. Botão "Imprimir"

O botão:

```text
Imprimir
```

deve continuar permitindo impressão física.

Porém, preferencialmente:

```text
HTML → PDF → impressão
```

ou utilizar uma estratégia que preserve o layout do PDF.

Não quero que "Imprimir" seja confundido com "Baixar PDF".

---

# 13. Segurança

Como o sistema usa:

```tsx
dangerouslySetInnerHTML
```

e os templates são editáveis pelo usuário, verificar a segurança do HTML.

Analisar se existe sanitização antes da renderização e/ou antes da geração do PDF.

Não introduzir vulnerabilidade de:

- XSS;
- scripts arbitrários;
- HTML malicioso;
- acesso indevido a recursos.

Não remover uma sanitização existente sem justificativa.

---

# 14. Não quebrar o editor de templates

Essa alteração não deve prejudicar a funcionalidade existente de modelos de documentos.

Os templates continuarão podendo conter campos dinâmicos como:

```text
{{Animal.Nome}}
{{Animal.Especie}}
{{Animal.DataNascimento}}
{{Atendimento.Data}}
```

ou os padrões já existentes no projeto.

A substituição continuará sendo responsabilidade de:

```tsx
parseDocumentTemplate(...)
```

Não quero duplicar essa lógica.

---

# 15. Estrutura desejada

A arquitetura final pode seguir este conceito:

```text
ModeloDocumento
       ↓
Template HTML
       ↓
parseDocumentTemplate
       ↓
fullHtml
       ↓
DocumentoViewer
       │
       ├── Visualizar
       │
       ├── Baixar PDF
       │       ↓
       │    API .NET
       │       ↓
       │    Gerador PDF
       │       ↓
       │    application/pdf
       │
       └── Imprimir
```

---

# 16. Compatibilidade com futuros documentos

Essa implementação precisa ser genérica.

Não faça uma solução específica apenas para:

```text
AltaAmbulatorial
```

Posteriormente teremos outros documentos, como:

- Alta Ambulatorial;
- Alta de Quarentena;
- Solicitação de Exame;
- outros documentos clínicos.

Portanto, a geração deve funcionar para qualquer:

```tsx
TipoDocumento
```

e qualquer:

```tsx
ModeloDocumento
```

existente.

---

# 17. O que NÃO fazer

Não quero:

- remover `parseDocumentTemplate`;
- remover `renderHeaderFooterHtml`;
- criar lógica específica para apenas um tipo de documento;
- transformar o PDF em uma imagem;
- depender exclusivamente de `window.print()`;
- depender do usuário selecionar "Salvar como PDF";
- ignorar as cores do template;
- utilizar dimensões arbitrárias como `800x900` para definir A4;
- duplicar a lógica de substituição dos campos dinâmicos;
- criar uma solução que funcione apenas no Chrome;
- instalar várias bibliotecas sem necessidade.

---

# 18. Antes de alterar o código

Primeiro analise o projeto e identifique:

1. `DocumentoViewer`;
2. `ModeloDocumentoService`;
3. `DocumentParser`;
4. entidades relacionadas a `ModeloDocumento`;
5. `TipoDocumento`;
6. controllers da API;
7. services da API;
8. padrão utilizado para retornar arquivos;
9. bibliotecas existentes relacionadas a PDF;
10. infraestrutura atual do backend.

Depois implemente seguindo os padrões existentes.

---

# 19. Entrega esperada

Ao final, quero:

### Frontend

- `DocumentoViewer` atualizado;
- botão Visualizar;
- botão Baixar PDF;
- botão Imprimir;
- prévia A4 real;
- loading durante geração;
- tratamento de erros;
- suporte a múltiplas páginas;
- preservação das cores.

### Backend

- endpoint para geração do PDF;
- service responsável pela geração;
- DTO necessário;
- configuração da biblioteca utilizada;
- retorno correto de `application/pdf`;
- nome de arquivo adequado.

### Resultado

Ao clicar em:

```text
Baixar PDF
```

deve baixar diretamente um PDF real.

Ao clicar em:

```text
Visualizar
```

deve abrir uma experiência de visualização de PDF.

Ao clicar em:

```text
Imprimir
```

deve permitir a impressão do documento preservando o layout.

---

## Importante

Não faça apenas uma explicação teórica.

Analise o código existente, identifique os arquivos corretos e implemente a alteração seguindo a arquitetura atual do projeto.

Antes de modificar qualquer arquivo, explique brevemente:

1. qual solução de geração de PDF você encontrou como mais adequada;
2. quais arquivos serão alterados/criados;
3. por que essa abordagem é compatível com a estrutura atual.

Depois faça a implementação completa.

Ao final, informe:

- arquivos alterados;
- arquivos criados;
- dependências adicionadas;
- endpoints criados;
- como o fluxo passou a funcionar;
- possíveis pontos que precisam ser testados.
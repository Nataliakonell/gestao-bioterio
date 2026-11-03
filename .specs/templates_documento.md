# Spec: Templates de Documento (Header, Body, Footer) e Geração de PDF

## 1. Descrição

Mecanismo completo para gerenciamento de Templates de Documentos no módulo de Administração e sua utilização em atendimentos clínicos (como Alta Ambulatorial), suportando:
- Templates de Documento (Body) com vínculos opcionais a templates de Cabeçalho (Header) e Rodapé (Footer).
- Templates de Header e Footer com layout estruturado em 3 colunas (Esquerda, Meio, Direita), suportando texto ou imagem em cada seção.
- Editor de texto rico para templates de corpo, com inserção de placeholders de comandos de sistema/backend `[FUN_*]` e inputs de formulário `[INPUT_*]`.
- Resolução e renderização do documento final (Header + Body + Footer com substituição de tokens) e geração/preview de PDF/impressão no atendimento de Alta Ambulatorial.

---

## 2. Contrato da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/ModelosDocumento` | Retorna todos os modelos de documentos (filtrável por `tipoSecao`, `tipoDocumento`, `ativo`). |
| `GET` | `/api/ModelosDocumento/{id}` | Retorna o detalhe de um modelo específico por ID. |
| `GET` | `/api/ModelosDocumento/tipo/{tipoDocumento}` | Retorna o modelo ativo do tipo de documento especificado (ex: AltaAmbulatorial = 2). |
| `POST` | `/api/ModelosDocumento` | Cria um novo modelo (Body, Header ou Footer). |
| `PUT` | `/api/ModelosDocumento` | Atualiza um modelo existente. |
| `DELETE` | `/api/ModelosDocumento/{id}` | Remove um modelo existente. |
| `POST` | `/api/Atendimento/PreviewDocumento` | Gera o documento HTML substituindo todas as tags `[FUN_*]` com dados do banco/request, preservando `[INPUT_*]` para o frontend. |

### Schema — ModeloDocumento

```csharp
public enum TipoSecaoTemplate
{
    Body = 1,
    Header = 2,
    Footer = 3
}

public enum TipoDocumento
{
    Geral = 0,
    LiberacaoQuarentena = 1,
    AltaAmbulatorial = 2,
    SolicitacaoExame = 3
}
```

```json
{
  "id": 1,
  "nome": "Template Padrão de Alta Ambulatorial",
  "tipoSecao": 1,
  "tipoDocumento": 2,
  "conteudo": "# Documento de Alta Ambulatorial\nData: [FUN_DATA_AGORA]...",
  "headerTemplateId": 2,
  "footerTemplateId": 3,
  "configuracaoLayoutJson": "{\"esquerda\":{\"tipo\":\"imagem\",\"conteudo\":\"...\"},\"meio\":{\"tipo\":\"texto\",\"conteudo\":\"...\"},\"direita\":{\"tipo\":\"texto\",\"conteudo\":\"...\"}}",
  "ativo": true
}
```

---

## 3. Placeholders / Variáveis Suportadas

### 3.1 Funções / Comandos de Sistema (`[FUN_*]`)
- `[FUN_DATA_AGORA]`: Data atual formatada (DD/MM/AAAA)
- `[FUN_DATA_HORA_AGORA]`: Data e hora atual formatada
- `[FUN_NOME_RESPONSAVEL]` / `[FUN_NOME_RESPOSAVEL]`: Nome do veterinário/usuário responsável
- `[FUN_NUMERO_REGISTRO]`: Número de registro do animal
- `[FUN_NOME_POPULAR]`: Nome popular do animal
- `[FUN_ESPECIE]`: Nome da espécie do animal
- `[FUN_GENERO]`: Gênero do animal
- `[FUN_FASE_VIDA]`: Fase de vida do animal
- `[FUN_LOCAL_ORIGEM]`: Local de origem do animal
- `[FUN_INSTALACAO_ATUAL]`: Instalações do biotério atual
- `[FUN_DIAGNOSTICO]`: Diagnóstico clínico
- `[FUN_TRATAMENTO]`: Tratamento registrado

### 3.2 Campos de Entrada do Formulário (`[INPUT_*]`)
- `[INPUT_DATA_ENTRADA_AMBULATORIO]`: Data de entrada no ambulatório
- `[INPUT_DATA_CLINICA]`: Data da alta clínica
- `[INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO]`: Procedimentos e medicações realizadas
- `[INPUT_OBS_CLINICAS_ALTA]`: Observações clínicas no momento da alta
- `[INPUT_INSTALACAO_RETORNO]`: Instalação de destino/retorno após alta

---

## 4. Estrutura do Header e Footer

O Header e Footer possuem 3 seções:
- **Esquerda**: Tipo (`texto` ou `imagem`) + Conteúdo (texto formatado ou URL/base64 de imagem)
- **Meio**: Tipo (`texto` ou `imagem`) + Conteúdo
- **Direita**: Tipo (`texto` ou `imagem`) + Conteúdo

São renderizados com diagramação horizontal em grade/flex alinhada, mantendo proporções ideais para impressão A4 e exportação PDF.

---

## 5. Casos de Teste (A2A)

1. `CT-01`: Criar Template Header com layout 3 colunas válido → 200 + ID
2. `CT-02`: Criar Template Footer válido → 200 + ID
3. `CT-03`: Criar Template Body vinculado a Header e Footer → 200 + ID
4. `CT-04`: Listar templates por tipo de seção (`Body`, `Header`, `Footer`) → 200 + lista filtrada
5. `CT-05`: Obter template de Alta Ambulatorial ativo com dados de Header e Footer → 200 + dados completos
6. `CT-06`: Atualizar template existente → 200
7. `CT-07`: Excluir template → 204 No Content

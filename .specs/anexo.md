# Spec: Anexo

## Contrato da API

### `POST /api/Anexo` (multipart/form-data)
Cria um novo anexo na ficha do animal e, opcionalmente, faz upload do arquivo associado para a PortalAPI Externa.
**Request Form:**
- `AnimalId` (int) - Obrigatório
- `NomeArquivoAnexo` (string) - Opcional (se não fornecido, o nome original do arquivo pode ser usado ou ficar vazio)
- `Descricao` (string) - Opcional
- `Responsavel` (string) - Opcional
- `Arquivo` (IFormFile) - Opcional (se fornecido, o arquivo é enviado)

**Response:** `CreateAnexoResponse`
```json
{
  "success": true,
  "message": "Anexo cadastrado com sucesso!",
  "validationErrors": null,
  "id": 1,
  "anexo": {
    "id": 1,
    "animalId": 10,
    "nomeArquivoAnexo": "documento.pdf",
    "descricao": "Exame de sangue",
    "responsavel": "João"
  }
}
```

### `GET /api/Anexo`
Retorna a lista de anexos, podendo filtrar por `animalId`.

### `GET /api/Anexo/{id}`
Retorna os detalhes de um anexo.

### `PUT /api/Anexo` (application/json)
Atualiza os metadados de um anexo (o arquivo em si não é alterado por esse endpoint de update).

### `DELETE /api/Anexo/{id}`
Deleta o registro de anexo do sistema.

## Comportamento esperado
- O `CreateAnexoCommand` deve suportar o recebimento de `IFormFile Arquivo`.
- Quando um `Arquivo` for fornecido na requisição de criação, o sistema deve:
  1. Obter o `NumeroRegistro` do Animal pelo `AnimalId`.
  2. Acionar a integração `IPortalExternalApiRepository.UploadArquivosAsync` usando o `NumeroRegistro` como identificador do path no servidor de destino.
  3. Preencher o `NomeArquivoAnexo` com o `FileName` original, caso não tenha sido preenchido pelo usuário.
  4. Salvar o registro do Anexo no banco de dados.
- O endpoint deve estar protegido por autenticação e autorização (`[RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]`).

## Casos de teste (A2A)
1. CT-01: Criar anexo com arquivo válido e dados corretos → 200 e arquivo enviado para o mock da API externa.
2. CT-02: Criar anexo sem enviar o campo arquivo (apenas dados) → 200 (cria registro no banco sem upload).
3. CT-03: Buscar anexo por id inexistente → 404
4. CT-04: Listar todos os anexos de um animal → 200 + lista

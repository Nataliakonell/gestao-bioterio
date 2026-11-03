# Agente de Desenvolvimento — Gestão Biotério

Este documento define como o agente (AI) deve atuar no projeto. Leia-o **integralmente** antes de qualquer tarefa.

---

## 1. Arquitetura (Clean Architecture)

```
Domain → Application → Persistence / Infra → Api
```

### Camadas

| Camada | Responsabilidade | Projeto |
|--------|------------------|---------|
| **Domain** | Entidades, enums, common (AuditableEntity) | `Gestao-Bioterio.Domain` |
| **Application** | Casos de uso (CQRS), contratos, mapping, validação | `Gestao-Bioterio.Application` |
| **Persistence** | EF Core, DbContext, repositórios, migrations | `Gestao-Bioterio.Persistence` |
| **Infrastructure** | Serviços externos (Blob, Identity) | `Gestao-Bioterio.Infra` |
| **Api** | Controllers, middleware, startup | `Gestao-Bioterio.Api` |

### Fluxo de uma requisição

```
HTTP Request
  → Controller (injecta IMediator, envia Command/Query)
    → Handler (valida, chama repositório, retorna Response/Vm)
      → Repository (EF Core)
        → DbContext (aplica auditoria em SaveChangesAsync)
```

### Fluxo de injeção

`ApplicationServiceRegistration.cs` registra AutoMapper + MediatR + FluentValidation.
`PersistenceServiceRegistration.cs` registra DbContext + repositórios (Scoped).
`InfrastructureServiceRegistration.cs` registra serviços de infraestrutura.

---

## 2. Metodologia: Spec-Driven Development (SDD) & Agentes Especialistas

### 2.1 Agentes Especialistas (Subagents)

O projeto conta com dois subagents consultivos essenciais para garantir conformidade técnica e de domínio:

1. **`arquiteto_dotnet`** (Especialista Técnico & Arquiteto .NET / Banco de Dados):
   - Avalia arquitetura (Clean Architecture, CQRS, MediatR, FluentValidation, AutoMapper).
   - Analisa modelagem relacional, mapeamentos EF Core, performance (AsNoTracking, índices), integridade e segurança.
   - Orienta padrões de testes A2A, injeção de dependências e design de APIs/frontend.

2. **`especialista_bioterio`** (Especialista de Domínio & Gestão de Biotério):
   - Avalia regras de negócio sob a ótica da rotina de biotérios e pesquisa animal.
   - Valida conformidade com normas éticas e regulatórias (CONCEA, CEUA).
   - Valida fluxos de colônias, linhagens, fases de vida, manejo, quarentena, atendimento clínico veterinário, prescrições, biometria e laudos.

> **Regra de Consulta**: Antes de fechar especificações (`.specs/`), propor mudanças arquiteturais ou alterar fluxos de negócio de biotério, o agente deve consultar os respectivos especialistas para assegurar que estamos no caminho correto.

### 2.2 Antes de codificar, escreva a SPEC

Para cada nova feature, o agente DEVE criar/atualizar um arquivo `.md` em `.specs/` com:

```markdown
# Spec: [Nome da Feature]

## Contrato da API
- `GET /api/...` → `List<XxxListVm>` (descrição)
- `POST /api/...` → `XxxResponse` (body esperado)

## Comportamento esperado
- Regra de negócio 1
- Regra de negócio 2

## Casos de teste (A2A)
1. CT-01: Criar com dados válidos → 200
2. CT-02: Criar sem campo obrigatório → erro de validação
3. CT-03: Buscar por id inexistente → 404
4. CT-04: Listar todos → 200 + lista
```

### 2.3 Estrutura de diretório `.specs/`

```
.specs/
  README.md               ← explica o que é SDD
  alimentacao.md
  animal.md
  ... (um por entidade)
```

### 2.4 A SPEC deve ser revisada pelo usuário antes da implementação

O agente DEVE apresentar a SPEC, aguardar aprovação, e só então implementar.

---

## 3. Padrão CQRS — Estrutura Obrigatória

Cada entidade segue **exatamente** esta estrutura em `Features/{Entidade}/`:

### Criar

```
Command/Create{Entidade}/
  Create{Entidade}Command.cs    → IRequest<Create{Entidade}Response>
  Create{Entidade}Handler.cs    → IRequestHandler<>
  Create{Entidade}Validator.cs  → AbstractValidator<>
  Create{Entidade}Dto.cs        → Propriedades de retorno
  Create{Entidade}Response.cs   → BaseResponse + Id + EntidadeDto
```

### Atualizar

```
Command/Update{Entidade}/
  Update{Entidade}Command.cs    → IRequest<BaseResponse>
  Update{Entidade}Handler.cs
  Update{Entidade}Validator.cs
```

### Excluir

```
Command/Delete{Entidade}/
  Delete{Entidade}Command.cs    → IRequest
  Delete{Entidade}Handler.cs
```

### Listar

```
Queries/GetAll{Entidade}/
  GetAll{Entidade}Query.cs      → IRequest<List<{Entidade}ListVm>>
  GetAll{Entidade}Handler.cs
  {Entidade}ListVm.cs
```

### Detalhe

```
Queries/Get{Entidade}Detail/
  Get{Entidade}DetailQuery.cs   → IRequest<{Entidade}DetailVm>
  Get{Entidade}DetailHandler.cs
  {Entidade}DetailVm.cs
```

### Regras:

- **Command** retorna `CreateResponse` ou `BaseResponse` (nunca diretamente a entidade)
- **Query** retorna `Vm` (nunca a entidade)
- **Validator** usa `FluentValidation`, injeta repositório via primary constructor
- **Handler** usa primary constructor com `IMapper`, repositórios, `IValidator`
- **Handler** valida antes de persistir, retorna `response.Success = false` com `ValidationErrors` se falhar
- **Response** estende `BaseResponse` (que tem `Success`, `Message`, `ValidationErrors`)
- `BaseResponse` está em `Application/Responses/BaseResponse.cs`

### Exemplo completo (CreateGrupo):

```csharp
// Command
public class CreateGrupoCommand : IRequest<CreateGrupoResponse>
{
    public string Nome { get; set; } = string.Empty;
}

// Handler
public class CreateGrupoHandler(IMapper mapper, IGrupoRepository repo, IValidator<CreateGrupoCommand> validator)
    : IRequestHandler<CreateGrupoCommand, CreateGrupoResponse>
{
    public async Task<CreateGrupoResponse> Handle(CreateGrupoCommand cmd, CancellationToken ct)
    {
        var response = new CreateGrupoResponse();
        var validation = await validator.ValidateAsync(cmd, ct);
        if (validation.Errors.Count > 0) { response.Success = false; response.ValidationErrors = ...; return response; }
        var entity = mapper.Map<Grupo>(cmd);
        entity = await repo.AddAsync(entity);
        response.Id = entity.Id;
        response.Grupo = mapper.Map<CreateGrupoDto>(entity);
        response.Message = "Grupo cadastrado com sucesso!";
        return response;
    }
}
```

---

## 4. Controller — Padrão Obrigatório

```csharp
[ApiController]
[Route("api/[controller]")]
public class XxxController(IMediator mediator) : ControllerBase
{
    [HttpGet(Name = "GetAllXxx")]
    public async Task<ActionResult<List<XxxListVm>>> GetAll() { ... }

    [HttpGet("{id}", Name = "GetXxxById")]
    public async Task<ActionResult<XxxDetailVm>> GetById(int id) { ... }

    [HttpPost(Name = "AddXxx")]
    public async Task<ActionResult> Create([FromBody] CreateXxxCommand cmd) { ... }

    [HttpPut(Name = "UpdateXxx")]
    public async Task<ActionResult> Update([FromBody] UpdateXxxCommand cmd) { ... }

    [HttpDelete("{id}", Name = "DeleteXxx")]
    public async Task<ActionResult> Delete(int id) { ... }
}
```

### Regras:
- Usar **primary constructor** (`(IMediator mediator)`)
- Nomear a rota com `Name = "OperacaoXxx"`
- Retornar `Ok(await _mediator.Send(...))`
- `DELETE` retorna `NoContent()`
- `PUT` retorna `Ok(response)` (não 204, pois o frontend espera o response body)

---

## 5. Repository — Padrão Obrigatório

### Interface no Application

```csharp
public interface IXxxRepository : IAsyncRepository<Xxx>
{
    // Métodos específicos além do CRUD genérico
    Task<List<Xxx>> GetByFilterAsync(int? param);
}
```

### Implementação no Persistence

```csharp
public class XxxRepository(BioterioDbContext context) : BaseRepository<Xxx>(context), IXxxRepository
{
    public async Task<List<Xxx>> GetByFilterAsync(int? param)
    {
        var query = _context.Xxxs.AsQueryable();
        if (param.HasValue) query = query.Where(x => x.Prop == param.Value);
        return await query.ToListAsync();
    }
}
```

### Regras:
- `BaseRepository<T>` já tem: `GetByIdAsync`, `ListAllAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync`
- Sempre usar `AsNoTracking()` em queries de leitura
- Usar `AsNoTracking()` via método específico ou na consulta

---

## 6. AutoMapper — Registro Obrigatório

Em `Application/Profiles/MappingProfile.cs`, para cada entidade:

```csharp
CreateMap<Xxx, XxxListVm>();
CreateMap<Xxx, XxxDetailVm>();
CreateMap<Xxx, CreateXxxDto>();
CreateMap<CreateXxxCommand, Xxx>();
CreateMap<UpdateXxxCommand, Xxx>();
CreateMap<Xxx, Xxx>().ReverseMap();
```

### Regras:
- Se um mapping faltar, o AutoMapper lança erro em runtime (ex.: `InstalacaoBioterio -> CreateInstalacaoBioterioDto`)
- Mappings de `UpdateCommand → Entity` DEVM usar `ForMember(dest => dest.Id, opt => opt.Ignore())` quando necessário
- Para enums com string display, usar `.ForMember(dest => dest.Prop, opt => opt.MapFrom(src => src.Prop.ToString()))`

---

## 7. A2A Tests — Obrigatórios para Toda Feature

Arquivo: `Backend/Gestao-Bioterio.A2ATests/{Entidade}ModuleTests.cs`

### Estrutura da classe de teste

```csharp
[Collection("SequentialA2A")]
public class XxxModuleTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public XxxModuleTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("UcdbAuthentication:Authority", "http://localhost:9999");
            builder.UseSetting("UcdbAuthentication:ClientId", "test-client");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll(typeof(DbContextOptions<BioterioDbContext>));
                services.AddDbContext<BioterioDbContext>(options =>
                    options.UseInMemoryDatabase("GestaoBioterioTestDb"));
                services.AddHttpClient("UcdbAuth")
                    .ConfigurePrimaryHttpMessageHandler(() => new MockAuthHandler());
            });
        });
        _client = _factory.CreateClient();
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "test-token");
    }
}
```

### Cobertura mínima de testes

Para cada endpoint:

| Teste | O que verifica |
|-------|----------------|
| `GetAll_ReturnsOk` | Status 200 |
| `GetAll_FilterByX_Filters` | Filtro funciona (se aplicável) |
| `Create_ValidData_ReturnsOk` | Criação com dados válidos |
| `Create_InvalidData_ReturnsError` | Validação rejeita dados inválidos |
| `CreateAndGet_ReturnsCorrectData` | Dados persistidos corretamente |
| `GetById_NotFound_ReturnsError` | 404 para id inexistente |
| `Update_ValidData_UpdatesCorrectly` | Atualização funciona |
| `Delete_Existing_ReturnsNoContent` | Exclusão funciona |

### Regras:
- Usar `[Collection("SequentialA2A")]` para evitar conflitos de banco em paralelo
- Incluir classe `MockAuthHandler` (cópia do padrão em `AlimentacaoModuleTests.cs`)
- Usar `SeedBaseDataAsync()` com `if (context.Groups.Any()) return;` para evitar duplicidade
- Usar `await _client.GetAsJsonAsync<>()`, `PostAsJsonAsync`, `PutAsJsonAsync`, `DeleteAsync`
- Validar status code E conteúdo do response

---

## 8. initdata — Atualização Obrigatória

Sempre que uma nova entidade for criada, o script `Frontend/scripts/initdata.mjs` DEVE ser atualizado para incluí-la.

### Regras:
- Inserir dados na ordem de dependência (FKs)
- Cada inserção usa `await post('/{Entidade}', { ... })`
- Acumular IDs em `ids.{entidade}` para permitir referências em inserções posteriores
- Usar `console.log` amigável (com emoji) para feedback
- Tratar erros com `exit(1)` via `process.on('unhandledRejection')`
- JWT obtido via `POST {AUTH_URL}/Login` com `Content-Type: application/x-www-form-urlencoded`
- O script roda com `npm run dev:initdata`

### Exemplo de inserção:

```javascript
ids.grupos = [];
for (const nome of ['Roedores', 'Primatas']) {
  const r = await post('/Grupo', { nome });
  ids.grupos.push(r.id);
}
```

### endpoint com multipart/form-data:

```javascript
const form = new FormData();
form.append('numeroRegistro', 'RAT-001');
form.append('especieId', String(ids.especies[0]));
// ... outros campos ...
const r = await post('/Animal', form, true); // true = isFormData
```

---

## 9. Frontend — Padrões

### Services (`src/services/XxxService.ts`)

```typescript
import api from './api';

export const getXxxs = async (): Promise<XxxListVm[]> => {
    const response = await api.get<XxxListVm[]>('/Xxx');
    return response.data;
};
```

### Regras:
- Usar `api.get/post/put/delete` (instância axios configurada com token)
- Tipar responses com interfaces exportadas
- Nunca usar `axios` diretamente sem interceptors

### Chamadas à API no frontend

- Usar `Promise.all` para chamadas independentes no `useEffect`
- Nunca fazer N+1 calls (`animalService.getAll()` + `forEach` → `getAnimalRotinaStatus(id)`)
- Para listas com status, criar endpoint batch no backend (ex.: `GET /api/RotinaAnimal/status/all`)

---

## 10. Regras Gerais

### Naming
- Pastas: `PascalCase` (Features, Commands, Queries)
- Arquivos: `PascalCase.cs` / `PascalCase.tsx` / `camelCase.ts`
- Namespaces: `Gestao_Bioterio.Application.Features.{Entidade}.Command.{Operacao}` (nota: `Gestao_` vs `gestao_` — seguir o que já existe)
- DTOs: `Create{Entidade}Dto`, `{Entidade}ListVm`, `{Entidade}DetailVm`
- Commands: `{Operacao}{Entidade}Command`
- Handlers: `{Operacao}{Entidade}Handler`

### Validação
- Sempre criar `Validator` mesmo se o comando só tiver campos opcionais
- Injetar repositório no validator para validações de unicidade
- Validar no handler ANTES de persistir

### Auditoria
- `AuditableEntity` tem `RF` + `DataCriacao`, preenchidos automaticamente no `SaveChangesAsync`
- `AnimalLog` e `RotinaAnimalLog` são criados automaticamente pelo DbContext em mudanças
- NOVAS entidades que precisam de log DEVEM ser adicionadas ao `BioterioDbContext.SaveChangesAsync`

### Entity Framework
- Todas as entidades precisam de `Configuration` em `Persistence/Configurations/`
- Schema padrão: `bioterio`
- Usar `.HasDefaultSchema("bioterio")` no `OnModelCreating`

### DbContext
- `BioterioDbContext.SaveChangesAsync` injeta `ICurrentUserService` para obter `RF` do token JWT
- Toda nova entidade que implemente `AuditableEntity` deve ter seu `DataCriacao` e `RF` populados
- Para entidades que precisam de log de alterações (ex.: Animal, RotinaAnimal), criar uma entidade `Log` correspondente

### Auth
- `UcdbAuthenticationMiddleware` valida token com Keycloak + cache em memória
- Headers necessários: `Authorization: Bearer {token}`
- O `RF` do usuário logado é extraído do token e fica disponível no HttpContext
- Para testar, usar `MockAuthHandler` que retorna `{"active":true}` para `/validatetoken`

### CORS
- Configurado via `StartupExtensions.cs` com `WithOrigins("http://localhost:5173", "http://localhost:3000")`

### Pipeline de middleware (ordem)
```
ExceptionHandler → RateLimiter → Swagger (dev) → HttpsRedirection → CORS → UcdbAuth → Authorization → MapControllers
```

---

## 11. Fluxo de Trabalho do Agente

### Para cada nova tarefa:

1. **Analisar & Consultar Especialistas**:
   - Consultar `especialista_bioterio` para validação e consistência das regras de negócio, fluxos éticos e práticos.
   - Consultar `arquiteto_dotnet` para validação de modelagem de dados, arquitetura CQRS/Clean Architecture e contratos de API.
2. **Escrever SPEC** em `.specs/{feature}.md` e apresentar ao usuário
3. **Após aprovação**, implementar:
   a. Entidade (Domain) + Configuration (Persistence)
   b. Interface do repositório (Application/Contracts)
   c. Implementação do repositório (Persistence/Repository)
   d. Command/Query + Handler + Validator + Dto/Response/Vm (Application/Features)
   e. Mapping no `MappingProfile.cs`
   f. Controller (Api/Controllers)
   g. Atualizar `BioterioDbContext.cs` se nova entidade
   h. Registrar DI em `PersistenceServiceRegistration.cs` se novo repositório
4. **Criar A2A tests** em `Gestao-Bioterio.A2ATests/`
5. **Atualizar `initdata.mjs`** com seed da nova entidade
6. **Buildar e rodar testes**: `dotnet build && dotnet test`
7. **Verificar frontend**: criar/adicionar service em `src/services/` se necessário

### Checklist de verificação pós-implementação:

- [ ] Build do backend passa (`dotnet build`)
- [ ] Todos os A2A tests passam (`dotnet test`)
- [ ] initdata inclui a nova entidade
- [ ] MappingProfile tem todos os mappings necessários
- [ ] Validator cobre todos os campos obrigatórios
- [ ] Controller segue o padrão (primary constructor, Ok/NoContent)
- [ ] Interface do repositório registrada em `PersistenceServiceRegistration.cs`
- [ ] Frontend service criado/atualizado (se endpoint é consumido pelo frontend)
- [ ] SPEC atualizada com o resultado final (se houve mudanças)

---

## 12. PostgreSQL Compatibility Notes

- O projeto usa **SQL Server** (`UseSqlServer`) em desenvolvimento
- Testes A2A usam **InMemory database** (`UseInMemoryDatabase`)
- Se precisar de PostgreSQL, adicionar pacote `Npgsql.EntityFrameworkCore.PostgreSQL`
- O schema `bioterio` é configurado via `.HasDefaultSchema("bioterio")` no `OnModelCreating`
- Migrations estão em `Persistence/Migrations/` e usam `_context.Database.MigrateAsync()` no startup

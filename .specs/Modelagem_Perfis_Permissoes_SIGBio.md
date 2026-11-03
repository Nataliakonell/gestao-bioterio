Preciso que você faça uma AUDITORIA da implementação atual do gerenciamento de USUARIOS, PERFIS, FUNCIONALIDADES E PERMISSÕES do projeto Gestão-Bioterio / SIGBio.

Você já possui acesso ao código-fonte do projeto. NÃO quero que você simplesmente crie uma nova implementação.

Primeiro, analise o código existente e compare com a modelagem de banco de dados e as regras de negócio descritas abaixo.

O objetivo é verificar se o que já foi implementado está de acordo com a modelagem proposta e identificar:

1. O que já está correto;
2. O que está parcialmente correto;
3. O que está divergente da modelagem;
4. O que está faltando;
5. Quais relacionamentos precisam ser ajustados;
6. Quais regras de negócio ainda não estão sendo respeitadas;
7. Quais partes do backend e frontend precisam ser ajustadas.

IMPORTANTE:
- Não altere o código ainda.
- Primeiro faça somente uma auditoria.
- Não crie entidades, tabelas, endpoints ou componentes desnecessários.
- Reutilize a arquitetura e os padrões que já existem no projeto.
- Não substitua a arquitetura atual por outra.
- Considere o padrão já utilizado no projeto, como Entity, Configuration, Repository, Service/Handler, Controller, DTO/ViewModel, Validator, AutoMapper, MediatR, DbContext etc.
- Ao encontrar divergências, mostre exatamente em qual arquivo/classe/método elas estão.
- Depois da análise, apresente uma lista organizada do que precisa ser corrigido.

==================================================
1. OBJETIVO DA MODELAGEM
==================================================

O SIGBio precisa possuir um sistema de Gerenciamento de perfis, FUNCIONALIDADES E PERMISSÕES.

A ideia é que o acesso dos usuários ao sistema não seja definido simplesmente pelo fato de o usuário estar cadastrado.

Cada usuário pertence a um PERFIL.

O PERFIL determina quais FUNCIONALIDADES do sistema podem ser utilizadas e quais PERMISSÕES podem ser executadas dentro dessas funcionalidades.

Exemplo do SIGBio:

Módulo:
Clínico

Funcionalidades:
- Atendimento
- Procedimento
- Prescrição de medicação
- Edição de prescrição
- Registro de dose administrada
- Anexos
- Solicitação de exame
- Alta ambulatorial
- Liberação de quarentena

Dentro dessas funcionalidades podem existir diferentes permissões, por exemplo:

- Visualizar
- Criar
- Editar
- Excluir
- Registrar
- Administrar
- Aprovar

O sistema deve verificar a permissão do usuário antes de permitir determinadas operações.

==================================================
2. MODELAGEM DO BANCO DE DADOS
==================================================

A modelagem possui as seguintes entidades principais:

--------------------------------
FUNCIONALIDADE
--------------------------------

Tabela: Funcionalidade

Campos:

- id
- nome
- descricao

Representa uma funcionalidade do sistema.

Exemplos:

- Atendimento Clínico
- Prescrição de Medicamento
- Registro de Dose
- Cadastro de Animais
- Escala de Alimentação
- Escala de Biometria
- Registro de Biometria
- Registro de Alimentação
- Editar Animal

Uma funcionalidade pode possuir vários registros de associação em perfil_permissao.

Relacionamento:

Funcionalidade 1:N perfil_permissao

Ou seja:

Uma Funcionalidade pode estar relacionada a várias configurações de permissão.

--------------------------------
PERFIL
--------------------------------

Tabela: Perfil

Campos:

- id
- nome
- descricao

Representa um perfil de acesso do sistema.

Exemplos conceituais:

- Administrador
- Responsável Técnico
- Veterinário
- Biólogo
- Técnico de Biotério
- Estagiário

Esses exemplos são apenas ilustrativos. NÃO crie perfis automaticamente sem verificar o que já existe no código.

Um Perfil pode possuir várias configurações de permissões.

Relacionamentos:

Perfil 1:N perfil_permissao

Perfil 1:N Usuario

Isso significa:

Um Perfil pode possuir várias permissões configuradas.

Um Perfil pode estar associado a vários usuários.

--------------------------------
USUARIO
--------------------------------

Tabela: Usuario

Campos apresentados na modelagem:

- id
- RF
- nome
- email
- status

O usuário possui um perfil.

Relacionamento:

Perfil 1:N Usuario

Portanto:

Um Perfil pode possuir vários Usuários.

Cada Usuário deve estar associado a um Perfil.

O usuário NÃO deve receber permissões diretamente se a regra definida no sistema for baseada em Perfil.

A autorização deve ser obtida através do perfil do usuário.

--------------------------------
PERFIL_PERMISSAO
--------------------------------

Tabela:

perfil_permissao

Campos:

- id
- perfil_id
- permissao_id
- funcionalidade_id
- RF
- data_criacao

Essa tabela representa a configuração efetiva de uma permissão de um perfil para uma determinada funcionalidade.

Ela funciona como uma tabela de associação/configuração entre:

Perfil
+
Permissão
+
Funcionalidade

Exemplo conceitual:

Perfil:
Veterinário

Funcionalidade:
Prescrição de Medicamento

Permissão:
Criar

Resultado:

O perfil Veterinário possui a permissão Criar para a funcionalidade Prescrição de Medicamento.

Outro exemplo:

Perfil:
Estagiário

Funcionalidade:
Prescrição de Medicamento

Permissão:
Visualizar

Resultado:

O estagiário pode visualizar, mas não necessariamente criar ou editar prescrições.

Relacionamentos:

Perfil 1:N perfil_permissao

Funcionalidade 1:N perfil_permissao

Permissao 1:N perfil_permissao

ATENÇÃO:

Na imagem da modelagem existe o campo permissao_id em perfil_permissao, portanto verifique no código se existe uma entidade/tabela correspondente a PERMISSAO.

Caso exista com outro nome, identifique.

Caso não exista, NÃO crie automaticamente. Apenas sinalize que a modelagem possui uma referência para Permissão que precisa ser validada.

--------------------------------
LOGPERMISSAO
--------------------------------

Tabela:

LogPermissao

Campos:

- id
- usuario_id
- papel_id
- RF
- data_criacao
- tipo_operacao

Essa tabela deve representar o histórico/auditoria das operações relacionadas ao gerenciamento de permissões.

O objetivo é permitir identificar:

- qual usuário realizou a alteração;
- qual papel/perfil estava envolvido;
- RF relacionado à operação;
- quando a alteração aconteceu;
- qual foi o tipo da operação.

Exemplos de operações que podem ser registradas:

- criação de permissão;
- alteração de permissão;
- remoção de permissão;
- alteração de perfil;
- associação de usuário a perfil;
- remoção de usuário de perfil.

Não presuma exatamente quais operações devem ser registradas. Primeiro analise o código atual e identifique como essa regra foi implementada.

==================================================
3. RELACIONAMENTOS DA MODELAGEM
==================================================

A estrutura principal deve ser interpretada da seguinte maneira:

FUNCIONALIDADE
      |
      | 1:N
      |
PERFIL_PERMISSAO
      |
      | N:1
      |
PERFIL
      |
      | 1:N
      |
USUARIO


Além disso:

PERMISSAO
      |
      | 1:N
      |
PERFIL_PERMISSAO


Portanto, perfil_permissao é a estrutura que conecta:

Perfil
+
Permissão
+
Funcionalidade


Exemplo:

Perfil = Veterinário

        |
        +---- Funcionalidade = Atendimento
        |       Permissão = Visualizar
        |
        +---- Funcionalidade = Atendimento
        |       Permissão = Criar
        |
        +---- Funcionalidade = Prescrição
        |       Permissão = Criar
        |
        +---- Funcionalidade = Prescrição
        |       Permissão = Editar
        |
        +---- Funcionalidade = Dose Administrada
                Permissão = Registrar


==================================================
4. REGRA PRINCIPAL DE AUTORIZAÇÃO
==================================================

O sistema deve conseguir responder:

"Este usuário pode realizar esta ação nesta funcionalidade?"

A verificação deve considerar:

USUARIO
   ↓
PERFIL
   ↓
PERFIL_PERMISSAO
   ↓
FUNCIONALIDADE + PERMISSAO

Exemplo:

Usuário:
João

Perfil:
Veterinário

Tentativa:
Criar uma prescrição de medicamento.

O sistema deve identificar:

João
→ Perfil Veterinário
→ Funcionalidade Prescrição de Medicamento
→ Permissão Criar

Se existir a associação:

Veterinário + Prescrição de Medicamento + Criar

a operação pode ser autorizada.

Caso não exista:

a operação deve ser bloqueada.

==================================================
5. IMPORTANTE: TOKEN / USUÁRIO AUTORIZADO
==================================================

Existe uma regra de negócio importante:

Alguns usuários terão autonomia administrativa para gerenciar permissões.

Ou seja, não basta apenas verificar se o usuário está logado.

O sistema deve conseguir identificar através da autenticação/token se o usuário possui autorização para administrar perfis e permissões.

Exemplo conceitual:

Usuário A
Perfil: Administrador

Pode:
- criar perfil;
- editar perfil;
- associar permissões;
- remover permissões;
- associar usuários a perfis;
- alterar configurações de acesso.

Usuário B
Perfil: Estagiário

Pode utilizar somente as funcionalidades permitidas ao seu perfil.

ATENÇÃO:

Não quero que você presuma que a autorização administrativa deve ser feita exclusivamente pelo nome "Administrador".

Analise como o projeto atual trabalha com autenticação, token, claims, RF, usuário logado e autorização.

Verifique se a implementação atual está preparada para utilizar a estrutura de Perfil + Permissão + Funcionalidade.

==================================================
6. RELAÇÃO COM OS MÓDULOS E FEATURES DO SIGBIO
==================================================

A modelagem deve ser capaz de representar as funcionalidades existentes nos módulos do SIGBio.

Exemplos:

Módulo Animal:

- Visualizar animal
- Criar animal
- Editar animal
- Alterar situação
- Registrar movimentação

Módulo Alimentação:

- Visualizar alimentação
- Registrar alimentação
- Editar alimentação
- Registrar consumo

Módulo Biometria:

- Visualizar biometria
- Registrar biometria
- Editar biometria

Módulo Clínico:

- Visualizar atendimento
- Criar atendimento
- Editar atendimento
- Registrar procedimento
- Criar prescrição
- Editar prescrição
- Registrar dose administrada
- Solicitar exame
- Registrar resultado de exame
- Registrar alta ambulatorial
- Registrar liberação/quarentena

Módulo Rotina:

- Visualizar rotina
- Configurar rotina
- Registrar execução
- Editar configuração

Esses são exemplos para validar a arquitetura.

NÃO crie todas essas funcionalidades automaticamente.

Primeiro verifique como o projeto atual está estruturado.

==================================================
7. O QUE VOCÊ DEVE ANALISAR NO BACKEND
==================================================

Faça uma varredura no projeto inteiro e procure as implementações relacionadas a:

- Perfil
- Permissão
- Funcionalidade
- PerfilPermissao
- Usuario
- LogPermissao
- autenticação
- autorização
- token
- claims
- RF
- permissões
- roles
- policies

Analise especificamente:

--------------------------------
ENTITIES
--------------------------------

Verifique se existem entidades equivalentes a:

- Perfil
- Permissao
- Funcionalidade
- PerfilPermissao
- Usuario
- LogPermissao

Verifique:

- propriedades;
- tipos;
- chaves primárias;
- Foreign Keys;
- propriedades de navegação;
- relacionamentos;
- nullable;
- nomes;
- auditoria;
- RF;
- status.

Compare cada entidade com a modelagem.

--------------------------------
CONFIGURATION
--------------------------------

Localize as configurações do Entity Framework Core.

Verifique:

- HasKey;
- HasOne;
- WithMany;
- HasForeignKey;
- IsRequired;
- MaxLength;
- DeleteBehavior;
- índices;
- nomes das tabelas;
- nomes das colunas.

Confirme principalmente se os relacionamentos:

Perfil → Usuario

Perfil → PerfilPermissao

Funcionalidade → PerfilPermissao

Permissao → PerfilPermissao

estão corretamente configurados.

--------------------------------
DBCONTEXT
--------------------------------

Verifique se as entidades estão corretamente registradas no DbContext.

Verifique também:

- DbSet;
- configurações aplicadas;
- relacionamentos;
- auditoria;
- filtros;
- migrations, se existirem.

--------------------------------
REPOSITORIES
--------------------------------

Verifique se existem repositories relacionados ao gerenciamento de:

- Perfil
- Permissão
- Funcionalidade
- PerfilPermissao
- LogPermissao

Analise se os repositories estão seguindo o padrão já utilizado no projeto.

Não proponha um padrão novo caso o projeto já possua um padrão consolidado.

--------------------------------
APPLICATION / FEATURES
--------------------------------

Verifique a estrutura de Features existente.

Procure operações como:

- Create
- Update
- Delete
- GetById
- GetAll
- Lookup

E identifique se existem operações específicas para:

- criar perfil;
- editar perfil;
- listar perfis;
- associar permissões;
- remover permissões;
- associar usuário ao perfil;
- alterar perfil do usuário;
- consultar permissões do usuário;
- verificar se usuário possui determinada permissão.

Verifique também:

- Commands;
- Queries;
- Handlers;
- DTOs;
- ViewModels;
- Validators;
- AutoMapper;
- MediatR.

--------------------------------
CONTROLLERS
--------------------------------

Verifique os Controllers relacionados ao gerenciamento de:

- Perfil
- Permissão
- Funcionalidade
- Usuário
- Autorização

Analise:

- rotas;
- HTTP verbs;
- autorização;
- validações;
- retorno HTTP;
- DTOs;
- paginação;
- filtros.

--------------------------------
SERVICES / AUTHORIZATION
--------------------------------

Procure qualquer serviço responsável por verificar permissões.

Exemplos conceituais:

- PermissionService
- AuthorizationService
- CurrentUser
- UserContext
- TokenService
- PermissionChecker

Não presuma que esses nomes existem.

Localize os equivalentes no projeto atual.

Verifique se a autorização está realmente considerando:

Usuário → Perfil → Funcionalidade → Permissão

ou se atualmente está considerando somente:

Usuário → Role

ou somente:

Usuário → RF

ou outro mecanismo.

==================================================
8. AUTENTICAÇÃO E TOKEN
==================================================

Analise como o usuário autenticado é identificado atualmente.

Verifique:

- JWT;
- Claims;
- RF;
- UserId;
- Perfil;
- Roles;
- Policies;
- CurrentUser;
- HttpContext.User.

Quero saber se o token atual possui informações suficientes para identificar o usuário e posteriormente consultar suas permissões.

Não altere o token ainda.

Apenas identifique:

1. O que já existe;
2. O que está sendo utilizado;
3. O que seria necessário para implementar corretamente a autorização baseada em perfil/permissão/funcionalidade.

==================================================
9. FRONTEND
==================================================

Também analise o frontend React + TypeScript.

Procure:

- páginas;
- rotas;
- serviços;
- hooks;
- contextos;
- componentes;
- menus;
- sidebar;
- botões de ação;
- guards;
- permissões;
- autorização.

Verifique principalmente se o frontend está apenas escondendo botões ou se existe também validação no backend.

REGRA IMPORTANTE:

Esconder um botão no frontend NÃO deve ser considerado segurança.

Exemplo:

Se o usuário não possui permissão de EDITAR PRESCRIÇÃO:

Frontend:
→ botão Editar pode não aparecer.

Backend:
→ endpoint de edição também deve verificar a autorização.

Verifique se isso está sendo respeitado atualmente.

==================================================
10. CORS
==================================================

Verifique também a configuração de CORS existente no projeto.

Não quero alterar CORS simplesmente por causa da implementação de permissões.

Apenas verifique se a autenticação/autorização atual está funcionando corretamente entre:

Frontend React
↓
API .NET
↓
JWT/Token
↓
Autorização

Caso encontre algum problema de CORS relacionado ao fluxo de autenticação, apenas reporte.

==================================================
11. AUDITORIA / LOGPERMISSAO
==================================================

Verifique se as alterações de permissões estão sendo registradas.

A ideia é manter rastreabilidade.

Exemplo:

Usuário:
RF 12345

Operação:
ALTEROU_PERMISSAO

Perfil:
Veterinário

Data:
23/09/2026

O log deve permitir saber quem executou a alteração e quando.

Verifique se o código atual registra corretamente:

- usuário responsável pela operação;
- RF;
- perfil/papel relacionado;
- data;
- tipo da operação.

Verifique também se o usuário que está executando a alteração é diferente do usuário afetado pela alteração.

Exemplo:

Natália está logada.

Natália altera o perfil de João.

O sistema deve distinguir:

Usuário executor:
Natália

Usuário afetado:
João

Não confunda o usuário autenticado com o usuário que está recebendo a alteração.

==================================================
12. REGRA DE NEGÓCIO IMPORTANTE
==================================================

O sistema deve separar:

QUEM ESTÁ LOGADO

de

QUEM ESTÁ SENDO ALTERADO

e de

QUEM POSSUI A PERMISSÃO.

Exemplo:

Natália está logada.

Natália possui permissão para administrar perfis.

Natália altera o perfil de João.

Então:

Executor da operação:
Natália

Usuário afetado:
João

Novo perfil:
Técnico de Biotério

O log deve registrar a operação feita por Natália.

O perfil de João deve ser alterado.

As permissões efetivas de João devem passar a ser determinadas pelo novo perfil.

==================================================
13. O QUE QUERO COMO RESULTADO DA AUDITORIA
==================================================

Não faça alterações ainda.

Quero um relatório dividido exatamente nestas partes:

1. VISÃO GERAL DA IMPLEMENTAÇÃO ATUAL

Explique como o sistema está funcionando hoje.

2. COMPARAÇÃO COM A MODELAGEM

Monte uma tabela:

Item | Modelagem esperada | Implementação atual | Status

Status possíveis:

- CORRETO
- PARCIAL
- DIVERGENTE
- AUSENTE

3. ENTIDADES

Para cada entidade relacionada ao gerenciamento de permissões, informe:

- arquivo;
- classe;
- propriedades relevantes;
- relacionamentos;
- divergências.

4. ENTITY CONFIGURATIONS

Liste as configurações encontradas e compare com os relacionamentos da modelagem.

5. REPOSITORIES

Mostre quais repositories existem e se atendem à necessidade.

6. FEATURES / APPLICATION

Mostre Commands, Queries, Handlers, DTOs, Validators e demais estruturas encontradas.

7. CONTROLLERS / API

Mostre os endpoints existentes e se estão de acordo com a regra de negócio.

8. AUTENTICAÇÃO E TOKEN

Explique como o usuário é identificado atualmente e como as permissões estão sendo obtidas.

9. AUTORIZAÇÃO

Explique se atualmente existe uma verificação:

Usuário
→ Perfil
→ Funcionalidade
→ Permissão

ou se o sistema está usando outro mecanismo.

10. LOGPERMISSAO

Explique se o histórico está sendo registrado corretamente.

11. FRONTEND

Explique como as permissões estão sendo refletidas na interface.

12. PROBLEMAS ENCONTRADOS

Liste todos os problemas encontrados.

Para cada problema informe:

- arquivo;
- classe;
- método;
- problema;
- regra esperada;
- impacto.

13. O QUE ESTÁ FALTANDO

Liste tudo que precisa ser implementado para que a modelagem fique completa.

14. PLANO DE CORREÇÃO

Organize em ordem de prioridade:

1. Banco/Entities
2. Configurations
3. Repositories
4. Application/Features
5. Autorização
6. Controllers
7. Frontend
8. Logs/Auditoria

15. CONCLUSÃO

Diga objetivamente se a implementação atual está:

- alinhada com a modelagem;
- parcialmente alinhada;
- ou divergente.

NÃO faça alterações no código nesta primeira análise.

Depois que eu analisar seu relatório, vou solicitar as correções individualmente.
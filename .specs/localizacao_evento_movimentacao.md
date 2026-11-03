**Etapa 6: Módulo Movimentação, Localização e Eventos**

Versão 1.1

# **1\. INTRODUÇÃO**

## **1.1 Objetivo do Documento**

Este documento apresenta a análise detalhada de requisitos para o desenvolvimento da sexta etapa do Sistema de Informação de Gestão do Biotério (SIGBio) da Universidade Católica Dom Bosco (UCDB). O objetivo é formalizar, com precisão técnica, todas as funcionalidades a serem implementadas no módulo de Movimentação, Localização e Eventos, servindo como contrato funcional entre a equipe de desenvolvimento e os stakeholders do biotério, previamente à definição final das telas e fluxos de interface.

## **1.2 Contextualização do Domínio**

O biotério da UCDB mantém sob custódia um plantel diversificado de animais silvestres e exóticos, com destaque para serpentes, jabutis, jacarés, cágados, lagartos e mamíferos exóticos. Os animais permanecem alojados em suas salas (instalações) e podem ser transferidos de uma instalação para outra. Também podem ser levados ao ambulatório quando há atendimento clínico para tratamento.

Antes de serem alocados em uma sala específica, os animais recém-chegados ficam em quarentena (por exemplo, no ambulatório) durante um período determinado. Ao término desse período, o animal é encaminhado para a sala definitiva, e esse deslocamento já constitui uma movimentação que deve ser registrada.

Os animais também participam de eventos, que podem ser internos (dentro da UCDB e/ou do Biotério) ou externos (fora da UCDB, por exemplo, em um shopping), para fins de estudo, exposição e atividades similares.

Atualmente, o controle dessas atividades é realizado de forma manual e por planilhas eletrônicas, o que apresenta os seguintes riscos:

* Esquecimento ao anotar qual animal trocou de sala;

* Perda de rastreabilidade histórica dos eventos;

* Dificuldade de identificar animais que saíram de seu local há poucos dias;

* Descumprimento do intervalo mínimo de 30 dias entre saídas de um animal da sala para evento interno ou externo, por falta de controle sistematizado.

A implementação do módulo de Movimentação, Localização e Eventos do SIGBio visa eliminar esses riscos, digitalizando e automatizando o acompanhamento da localização dos animais com segurança, padronização e rastreabilidade completa.

## **1.3 Escopo desta Etapa**

Esta etapa abrange exclusivamente os seguintes módulos e funcionalidades:

* **Módulo de Instalações/Localização:** cadastro de instalações e consulta, atual e histórica, de onde cada animal está localizado no Biotério.

* **Módulo de Transferência (Movimentação):** permite transferir um ou mais animais de uma instalação para outra, em uma única operação.

* **Módulo de Eventos:** agenda dos animais que participarão, participaram e irão participar de um evento interno ou externo, incluindo a geração do documento de saída nos eventos externos.

### **Fora do escopo desta etapa**

* Atendimento clínico propriamente dito (prontuário, medicações e procedimentos), tratado em etapa própria; neste módulo apenas a movimentação do animal ao ambulatório é registrada.

* Criação e edição de modelos de documento: a entidade Modelo Documento já existe no sistema e será apenas utilizada.

## **1.4 Glossário**

| Termo | Definição |
| :---- | :---- |
| Instalação | Local físico onde os animais ficam alojados (ex.: Sala de Produtores de Veneno, Ambulatório, Quarentena, Solário 1). Também chamada de sala. |
| Localização | Posição atual de um animal, identificada de forma hierárquica (ex.: UCDB → Biotério → Sala de Produtores de Veneno). |
| Movimentação | Registro de mudança de localização de um animal: entrada, transferência, saída externa ou retorno. |
| Evento | Atividade agendada da qual animais participam. Pode ser interno ou externo. |
| Evento interno | Evento realizado dentro da UCDB (no próprio biotério ou em outra sala da universidade). |
| Evento externo | Evento realizado fora da UCDB (ex.: exposição no Shopping Bosque dos Ipês). Exige documento de saída. |
| Modelo Documento | Entidade já existente no sistema, usada para gerar documentos a partir de um formulário preenchido. |
| Formulário de Transporte de Fauna | Documento de saída gerado nos eventos externos, no padrão do IMASUL/SEMADE (MS). |
| Ficha do Animal | Cadastro individual do animal, com abas como Visão geral, Alimentação, Pesagem, Clínico, Medicações e Movimentações. |

# **2\. VISÃO GERAL DO MÓDULO**

O módulo é estruturado em torno de três conceitos que se relacionam: a Instalação (onde o animal está), a Movimentação (o registro de cada mudança) e o Evento (o motivo planejado para uma saída). Toda mudança de localização, qualquer que seja a origem, gera uma movimentação que alimenta o histórico da Ficha do Animal.

| Origem da mudança | Movimentação gerada |
| :---- | :---- |
| Entrada no biotério (resgate, doação etc.) | Entrada, com origem, data e responsável. |
| Transferência entre instalações | Transferência, com instalação de origem, destino, data e responsável. |
| Evento interno | Movimentação registrada quando o animal realmente muda de local. |
| Evento externo | Saída Externa registrada quando o animal sai efetivamente; concluída com o retorno. |

As localizações são organizadas em hierarquia, por exemplo: UCDB → Biotério → Sala de Produtores de Veneno. Para um evento externo, o destino pode ser um local fora dessa hierarquia, como o Shopping Bosque dos Ipês.

# **3\. MÓDULO DE INSTALAÇÕES / LOCALIZAÇÃO**

Este módulo identifica onde os animais estão localizados no momento no Biotério, por exemplo: Sala de Produtores de Veneno, Sala de Exóticas, Ambulatório, Quarentena e Solários. Cada instalação é exibida em um cartão com nome, descrição, quantidade de animais, botão para ver os animais e botão para movimentar.

## **3.1 Visualização dos animais de uma instalação**

Ao acionar “Ver animais”, o sistema abre um modal com todos os animais atualmente localizados na instalação, exibindo Registro, Nome Popular e Espécie. Cada linha possui a ação “Ver Ficha”, que abre a Ficha do Animal.

## **3.2 Criação de nova instalação**

O usuário pode criar uma nova instalação informando o nome (obrigatório) e, opcionalmente, já selecionar os animais que ficarão nela, buscando por número de registro ou espécie. O contador “Animais desta instalação” mostra a quantidade adicionada.

## **3.3 Requisitos funcionais**

| ID | Requisito |
| :---- | :---- |
| RF-INS-01 | O sistema deve listar todas as instalações, exibindo nome e quantidade de animais atualmente alojados. |
| RF-INS-02 | O sistema deve permitir buscar instalações por número de registro ou espécie dos animais nelas alojados. |
| RF-INS-03 | O sistema deve exibir, em modal, os animais de uma instalação (Registro, Nome Popular, Espécie) com a ação “Ver Ficha”. |
| RF-INS-04 | O sistema deve permitir criar uma nova instalação com nome obrigatório. |
| RF-INS-05 | O sistema deve permitir, na criação da instalação, adicionar animais por busca de registro ou espécie. |
| RF-INS-06 | O sistema deve permitir editar nome de uma instalação existente (ícone de edição no cartão). |
| RF-INS-07 | O sistema deve organizar as instalações em hierarquia (ex.: UCDB → Biotério → Sala). |
| RF-INS-08 | O sistema deve manter o histórico de localizações de cada animal, permitindo saber onde ele esteve em qualquer data. |
| RF-INS-09 | Cada cartão de instalação deve oferecer o atalho “Movimentar”, abrindo a transferência com a origem já preenchida. |

# **4\. MÓDULO DE TRANSFERÊNCIA (MOVIMENTAÇÃO)**

O módulo permite transferir mais de um animal de uma instalação para outra em uma única operação. A transferência acontece com frequência, o que facilita para os funcionários locomover vários animais e registrá-los todos de uma vez, sem risco de perda de informação.

## **4.1 Fluxo de transferência**

1. O usuário seleciona o local de origem; o sistema exibe a quantidade de animais entre parênteses.

2. O usuário seleciona o local de destino.

3. O sistema lista os animais da origem (Registro, Espécie, Nome popular, Fase de vida, Instalação), com filtro opcional por espécie.

4. O usuário seleciona um ou mais animais e confirma a transferência.

5. O sistema atualiza a localização atual de cada animal e registra uma movimentação do tipo Transferência na Ficha do Animal.

## **4.2 Registro na Ficha do Animal**

Todas as movimentações de sala são registradas no histórico da Ficha do Animal, na aba Movimentações, em uma linha do tempo completa. Cada registro mostra o tipo (Entrada, Transferência, Saída Externa), a data, a descrição (ex.: “Saiu da Quarentena para Sala de Produtores de Veneno”) e o responsável. Nas saídas externas são exibidos também status, retorno previsto, retorno real e transportador. A aba oferece o botão “Registrar movimentação” para lançamentos manuais.

## **4.3 Requisitos funcionais**

| ID | Requisito |
| :---- | :---- |
| RF-TRF-01 | O sistema deve permitir transferir um ou mais animais de uma instalação de origem para uma de destino em uma única operação. |
| RF-TRF-02 | O sistema deve exibir a quantidade de animais de cada instalação nos seletores de origem e destino. |
| RF-TRF-03 | O sistema deve listar apenas animais da instalação de origem e permitir filtrar por espécie. |
| RF-TRF-04 | O sistema deve exibir o contador de animais selecionados e impedir a confirmação sem ao menos um animal selecionado. |
| RF-TRF-05 | O sistema deve impedir que origem e destino sejam a mesma instalação. |
| RF-TRF-06 | Ao confirmar, o sistema deve atualizar a localização atual de cada animal e gerar uma movimentação do tipo Transferência por animal. |
| RF-TRF-07 | Cada movimentação deve registrar origem, destino, data/hora e usuário responsável. |
| RF-TRF-08 | O sistema deve exibir todas as movimentações na linha do tempo da Ficha do Animal, em ordem cronológica decrescente. |
| RF-TRF-09 | O sistema deve permitir o registro manual de movimentação pela Ficha do Animal (botão “Registrar movimentação”). |
| RF-TRF-10 | O sistema deve registrar o deslocamento da quarentena/ambulatório para a sala definitiva como transferência comum. |

# **5\. MÓDULO DE EVENTOS**

Os animais podem participar de eventos internos ou externos. O evento é caracterizado por uma agenda, na qual o usuário acompanha o que está planejado, em andamento ou concluído.

## **5.1 Agenda de eventos**

A tela de agendamentos exibe uma visão semanal com navegação entre semanas e o botão “Novo evento”. No topo, quatro indicadores resumem a situação: Fora do biotério agora, Retornos atrasados, Agendadas e Retornos concluídos.

## **5.2 Diferença entre evento interno e externo**

O sistema controla os dois tipos de evento, com fluxos um pouco diferentes. Nos dois casos, é preciso controlar onde os animais estão e registrar suas movimentações. A diferença é que, no evento externo, existe também a etapa de geração do documento de saída.

**Evento interno:** acontece dentro da UCDB, como uma atividade ou estudo realizado no próprio biotério ou em outra sala da universidade. O sistema registra o evento e os animais participantes, e a movimentação é registrada quando os animais realmente se mudarem de local.

**Evento externo:** acontece fora da UCDB, como uma exposição no Shopping Bosque dos Ipês. Além de registrar o evento e os animais participantes, é necessário preencher o formulário para gerar o documento de saída, utilizando a entidade Modelo Documento que já existe no sistema.

| Aspecto | Evento interno | Evento externo |
| :---- | :---- | :---- |
| Local | Dentro da UCDB (biotério ou outra sala) | Fora da UCDB (ex.: Shopping Bosque dos Ipês) |
| Cadastro do evento | Tipo, local/destino, responsável, data/hora, previsão de retorno, observação e animais | Os mesmos campos, mais o formulário de saída |
| Documento | Não se aplica | Formulário de Transporte de Fauna |
| Movimentação | Registrada quando os animais realmente mudam de local | Saída Externa registrada na saída efetiva; concluída no retorno |
| Relatórios | Sim | Sim |

## **5.3 Exemplo do fluxo completo**

Imagine que o biotério participará de uma exposição externa com três serpentes.

6. **Cadastro do evento:** o usuário cadastra a exposição, informando local, data e responsável, e seleciona as três serpentes. O evento fica com o status Planejado.

7. **Seleção e confirmação dos animais:** o usuário confirma se serão mesmo as três serpentes e quais realmente irão participar. Essa confirmação é importante para não registrar a saída de um animal que acabou não indo.

8. **Geração do documento:** por ser um evento externo, o usuário preenche o formulário de saída. O sistema utiliza o Modelo Documento adequado e gera o documento para o transporte, chamado Formulário de Transporte de Fauna.

9. **Saída dos animais:** quando os animais saem efetivamente, o sistema registra uma movimentação para cada um, atualiza sua localização atual e a agenda do evento passa para “Em andamento”.

10. **Retorno dos animais:** o retorno também precisa ser registrado pelo usuário. Ao confirmar que cada serpente retornou, o sistema registra o horário real e atualiza sua localização atual. Se um animal ainda não voltou, sua movimentação continua em andamento.

## **5.4 Registro de retorno e retorno atrasado**

O retorno é registrado em um modal que lista os animais do evento, permite uma observação opcional e solicita a data/hora do retorno. Se a data de retorno previsto for ultrapassada sem registro de retorno, o sistema sinaliza o evento como Retorno Atrasado, e ele passa a compor o indicador “Retornos atrasados” da agenda.

## **5.5 Formulário do evento externo e documento gerado**

No evento externo, o cadastro inclui as seções abaixo, que alimentam o Modelo Documento. O requerente (UCDB) é preenchido automaticamente com os dados institucionais.

| Seção do formulário | Campos |
| :---- | :---- |
| Destinatário | Tipo (Zoológico, Expositor, Criadouro conservacionista, Instituição/criadouro científico, Criadouro comercial, Pesquisador, Outros; em “Outros”, especificar), Nome/Razão Social, CNPJ/CPF, endereço, bairro, município, CEP, telefone e CTF nº. |
| Objeto | Transporte de material zoológico (especificar), Transporte de produto e subproduto da fauna (especificar), Exposição de animais silvestres ou Outros (especificar). |
| Descrição do material | Animais selecionados para o evento, com chip/registro, espécie e sexo; permite remover animais da lista. |
| Meio de transporte e dados do transportador | Terrestre rodoviário, Terrestre ferroviário, Aéreo ou Fluvial (especificar); nome e CPF do condutor/transportador; veículo (marca, tipo, ano e placa). |
| Rota e data | Rodovias utilizadas (rota) e data do transporte a ser efetuado. |

O documento gerado reproduz o cabeçalho oficial (Governo do Estado de Mato Grosso do Sul, SEMADE e IMASUL) e as seções numeradas de 1 a 7, incluindo declaração, data e assinatura do requerente. A tela de visualização permite Editar, Salvar (download), Imprimir, Excluir e Confirmar retorno.

*Figura 10 – Documento: Formulário de Transporte de Fauna*

## **5.6 Status do evento**

| Status | Descrição |
| :---- | :---- |
| Planejado | Evento cadastrado, com animais selecionados, aguardando a data de saída. |
| Em andamento | Animais saíram efetivamente; há movimentação em aberto (“Fora do biotério agora”). |
| Retorno atrasado | Passou o retorno previsto e há animal que ainda não retornou. |
| Concluído | Todos os animais confirmados tiveram o retorno registrado. |
| Cancelado | Evento cancelado antes da saída; nenhuma movimentação é gerada (a validar). |

## **5.7 Requisitos funcionais**

| ID | Requisito |
| :---- | :---- |
| RF-EVT-01 | O sistema deve exibir a agenda de eventos em visão semanal, com navegação entre semanas. |
| RF-EVT-02 | A agenda deve exibir os indicadores: Fora do biotério agora, Retornos atrasados, Agendadas e Retornos concluídos. |
| RF-EVT-03 | O sistema deve permitir cadastrar um evento informando tipo (interno/externo), local/destino, responsável, data/hora do agendamento, previsão de retorno e observação. |
| RF-EVT-04 | O sistema deve permitir selecionar os animais do evento por busca de registro ou espécie. |
| RF-EVT-05 | Ao ser salvo, o evento deve ficar com o status Planejado. |
| RF-EVT-06 | O sistema deve exigir a confirmação dos animais que realmente participarão antes de registrar a saída. |
| RF-EVT-07 | Para evento externo, o sistema deve exibir o formulário de saída (destinatário, objeto, descrição do material, transporte, rota e data). |
| RF-EVT-08 | Para evento externo, o sistema deve gerar o Formulário de Transporte de Fauna a partir da entidade Modelo Documento existente. |
| RF-EVT-09 | O documento gerado deve poder ser visualizado, editado, baixado, impresso e excluído. |
| RF-EVT-10 | Ao registrar a saída efetiva, o sistema deve gerar uma movimentação por animal, atualizar a localização atual e mudar o evento para Em andamento. |
| RF-EVT-11 | Em evento interno, a movimentação deve ser registrada quando os animais realmente mudarem de local. |
| RF-EVT-12 | O sistema deve permitir registrar o retorno por animal, com data/hora real e observação opcional, e atualizar a localização atual. |
| RF-EVT-13 | Enquanto um animal não retornar, sua movimentação deve permanecer em andamento. |
| RF-EVT-14 | Se a data de retorno previsto for ultrapassada, o sistema deve sinalizar Retorno Atrasado. |
| RF-EVT-15 | O sistema deve registrar todos os eventos e movimentações de forma que possam ser usados na geração de relatórios. |
| RF-EVT-16 | Os eventos devem aparecer no histórico (Saída Externa e correlatos) da Ficha do Animal participante. |

# **6\. REGRAS DE NEGÓCIO**

| ID | Regra |
| :---- | :---- |
| RN-01 | Todo animal deve ter exatamente uma localização atual (instalação ou “fora do biotério” em evento externo). |
| RN-02 | Toda mudança de localização gera uma movimentação com data/hora, responsável, origem e destino. Movimentações não são apagadas; correções geram novo registro. |
| RN-03 | Um animal não pode participar de dois eventos com períodos sobrepostos. |
| RN-04 | Um animal que saiu da sala para evento interno ou externo deve respeitar o intervalo mínimo de 30 dias antes de nova saída. O sistema deve alertar o usuário ao selecioná-lo (ex: aprova a saída do animal?) |
| RN-05 | A saída só é registrada para animais confirmados como participantes. Animal selecionado que não for ao evento é removido sem gerar movimentação. |
| RN-06 | O retorno é registrado por animal. O evento só passa para Concluído quando todos os animais confirmados tiverem retorno registrado. |
| RN-07 | Passada a data/hora de retorno previsto sem retorno registrado, o evento é sinalizado como Retorno Atrasado. |
| RN-08 | O Formulário de Transporte de Fauna é obrigatório em evento externo e deve usar o Modelo Documento correspondente. |
| RN-09 | Os dados do requerente (UCDB) no documento são preenchidos automaticamente; os dados do destinatário e do transporte são informados pelo usuário. |
| RN-10 | Uma instalação com animais alojados não pode ser excluída; só pode ser inativada após esvaziada (a validar). |
| RN-11 | A transferência exige origem diferente do destino e ao menos um animal selecionado. |

# **7\. MODELO DE DADOS PRELIMINAR**

Entidades principais previstas. Os nomes e campos são preliminares e serão refinados na etapa de projeto.

| Entidade | Principais atributos |
| :---- | :---- |
| Instalacao | id, nome, descricao, instalacao\_pai\_id (hierarquia), tipo, ativa |
| Movimentacao | id, animal\_id, tipo (Entrada, Transferência, Saída Externa, Retorno), origem\_id, destino\_id, destino\_externo, data\_hora\_saida, retorno\_previsto, retorno\_real, status, evento\_id (opcional), responsavel\_id, transportador, observacao |
| Evento | id, tipo (interno/externo), local\_destino, responsavel\_id, data\_hora\_agendamento, previsao\_retorno, status, finalidade, observacao |
| Evento Animal | evento\_id, animal\_id, confirmado, movimentacao\_id |
| Formulário Saída | id, evento\_id, modelo\_documento\_id, destinatario (tipo, nome, CNPJ/CPF, endereço, contato, CTF), objeto, meio\_transporte, dados\_transportador, rodovias, data\_transporte |
| Modelo Documento | Entidade já existente, utilizada para gerar o Formulário de Transporte de Fauna |

# **8\. REQUISITOS NÃO FUNCIONAIS**

| ID | Requisito |
| :---- | :---- |
| RNF-01 | Rastreabilidade: o histórico de movimentações deve ser imutável e auditável, identificando usuário e data/hora de cada registro. |
| RNF-02 | Usabilidade: a transferência de vários animais deve ser concluída em poucos passos, com busca e filtro por espécie. |
| RNF-03 | Desempenho: a listagem de animais de uma instalação e a agenda semanal devem carregar em até 3 segundos em condições normais de uso. |
| RNF-04 | Integridade: operações que afetam vários animais (transferência, saída, retorno) devem ser atômicas, sem atualização parcial. |
| RNF-05 | Segurança: o acesso às funcionalidades deve respeitar os perfis de usuário do sistema. |
| RNF-06 | Documentos: o formulário gerado deve ser exportável em formato imprimível e manter o layout oficial do IMASUL. |
| RNF-07 | Compatibilidade: a interface deve funcionar nos navegadores atuais e em telas de tablet, usado no manejo diário. |

# **9\. CRITÉRIOS DE ACEITE**

11. Ao transferir três animais da Quarentena para a Sala de Produtores de Veneno, os três aparecem na nova sala e cada Ficha mostra uma movimentação do tipo Transferência com origem, destino, data e responsável.

12. Ao cadastrar um evento externo com três serpentes, o evento nasce como Planejado e o Formulário de Transporte de Fauna é gerado com os dados do destinatário, os animais e o transporte informados.

13. Se um dos três animais não for ao evento, ele pode ser removido na confirmação e nenhuma saída é registrada para ele.

14. Ao registrar a saída, o evento passa a ser Em andamento e o indicador “Fora do biotério agora” aumenta de acordo com os animais que saíram.

15. Ao registrar o retorno de dois dos três animais, o evento continua em andamento e a movimentação do terceiro permanece aberta.

16. Passada a data de retorno previsto sem retorno, o evento aparece como Retorno Atrasado e conta no indicador correspondente.

17. Ao tentar selecionar para um evento um animal que saiu há menos de 30 dias, o sistema exibe o alerta definido na regra RN-04.




# **MODELAGEM BANCO DE DADOS

# Explicação da modelagem de dados — SigBio

## 1. Localizacao

- Id — PK: identificador único da localização.
- Nome: nome do local, como Biotério, Ambulatório ou Sala de Serpentes.
- LocalizacaoPaiId — FK: identifica a localização superior, permitindo criar uma hierarquia de locais.
- Ambiente: identifica o tipo de ambiente, como interno ou externo.
- CaminhoIds: armazena os identificadores das localizações hierárquicas.
- CaminhoHierarquia: armazena o caminho completo para facilitar a exibição, como UCDB → Biotério → Sala de Serpentes.

Explicação: essa tabela centraliza o cadastro de todos os locais onde os animais podem ficar, tanto dentro da UCDB quanto em locais externos. A hierarquia permite organizar salas, setores e instituições sem precisar criar tabelas diferentes para cada tipo de local.

## 2. AnimalLocalizacao

- Id — PK: identificador único do registro.
- AnimalId — FK: identifica o animal.
- LocalizacaoId — FK: identifica a localização atual do animal.
- DataAtualizacao: registra quando a localização foi atualizada.

Explicação: essa tabela mantém a localização atual de cada animal, separada do cadastro principal do animal. Assim, quando um animal muda de sala ou retorna de um evento, sua localização pode ser atualizada sem perder os dados cadastrais.

## 3. MovimentacaoAnimal

- Id — PK: identificador único da movimentação.
- AnimalId — FK: identifica o animal movimentado.
- LocalizacaoId — FK: identifica a localização relacionada à movimentação, conforme a estrutura atual do diagrama.
- EventoId — FK: identifica o evento associado à movimentação.
- TipoMovimentacao: identifica o motivo ou tipo da movimentação, como transferência, evento ou atendimento clínico.

Explicação: essa tabela registra as movimentações dos animais, permitindo consultar seu histórico de deslocamentos. A associação com eventos possibilita identificar em quais atividades os animais foram utilizados.

Observação: na modelagem anterior, você havia definido `LocalizacaoOrigemId` e `LocalizacaoDestinoId`. O diagrama atual apresenta somente `LocalizacaoId`. Se você precisa registrar de qual local o animal saiu e para qual foi, recomendo manter origem e destino separados.

## 4. Evento

- Id — PK: identificador único do evento.
- Nome: nome do evento.
- TipoEvento: categoria do evento, como exposição, estudo, feira ou atendimento.
- LocalizacaoId — FK: identifica o local onde o evento será realizado.
- DataHoraInicio: data e horário de início do evento.
- DataHoraPrevisaoRetorno: previsão de retorno dos animais, conforme a entidade atual.
- Responsavel: nome do responsável pelo evento.
- Status: situação do evento — Agendado, Em andamento, Concluído ou Cancelado.
- Observacao: informações complementares sobre o evento.

Explicação: essa tabela armazena os dados gerais dos eventos realizados pelo biotério, sejam internos ou externos. Ela centraliza as informações do agendamento, do local, do responsável e da situação do evento.

## 5. EventoAnimal

- Id — PK: identificador único do vínculo.
- EventoId — FK: identifica o evento.
- AnimalId — FK: identifica o animal participante.

Explicação: essa tabela relaciona os eventos aos animais participantes. Um evento pode envolver vários animais, e um mesmo animal pode participar de vários eventos ao longo do tempo. Por isso, ela resolve o relacionamento muitos para muitos entre `Evento` e `Animal`.

## 6. DocumentoEvento

- Id — PK: identificador único do documento.
- EventoId — FK: identifica o evento relacionado.
- ModeloDocumentoId — FK: identifica o modelo utilizado para gerar o documento.
- ConteudoDadosJson: armazena os dados preenchidos no formulário para gerar o documento.

Explicação: essa tabela registra os documentos associados aos eventos, reutilizando a estrutura existente de `ModeloDocumento`. Por exemplo, em uma exposição externa, o sistema pode utilizar um modelo de autorização e preencher seus campos com os dados do evento e dos animais participantes.

## Como as tabelas trabalham juntas

O fluxo esperado é:

1. Cadastrar o local do evento em `Localizacao`.
2. Criar o evento em `Evento`.
3. Vincular os animais participantes por meio de `EventoAnimal`.
4. Registrar as movimentações dos animais em `MovimentacaoAnimal`, conforme as saídas e os retornos realmente confirmados.
5. Gerar e registrar os documentos do evento em `DocumentoEvento`.

Dessa forma, o SigBio consegue organizar os locais, planejar eventos, relacionar os animais participantes, acompanhar suas movimentações e manter os documentos associados a cada atividade.




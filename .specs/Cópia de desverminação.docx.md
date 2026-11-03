

## **1.5 Protocolo Técnico de Referência — Desverminação**

As regras de negócio do ciclo de desverminação implementadas no sistema devem respeitar rigorosamente o seguinte protocolo estabelecido pela equipe técnica do biotério:

| Etapa do Ciclo | Prazo | Regra de Cálculo da Data Prevista |
| :---- | :---- | :---- |
| 1ª Dose | 60 dias após a entrada | Data de entrada no biotério \+ 60 dias |
| 2ª Dose | 15 dias após a 1ª dose | Data de aplicação da 1ª dose \+ 15 dias |
| Manutenção anual | 12 meses após a última dose | Data da última dose aplicada \+ 12 meses, repetindo-se indefinidamente |

*Concluída a 2ª dose do ciclo inicial, o animal passa à condição de "apto para liberação", e a desverminação torna-se um cuidado de manutenção anual, sem novo ciclo de duas doses.*

## **2.4 Módulo de Protocolo de Desverminação**

### **2.4.1 Visão Geral do Protocolo (RF-CL-07)**

A tela de visão geral da Desverminação deve listar todos os animais com protocolo em andamento ou em manutenção, exibindo para cada um: número de registro, espécie, data de entrada no biotério, data da 1ª dose (aplicada ou prevista), data da 2ª dose (aplicada ou prevista), data da próxima dose anual e uma etiqueta de status. Devem existir, no mínimo, as seguintes situações de status:

* Ciclo inicial em andamento: 1ª dose já aplicada, aguardando a data prevista da 2ª dose;

* Iniciar 1ª dose hoje / Iniciar 2ª dose hoje: quando a data prevista da respectiva dose coincide com a data corrente;

* Atrasado: quando a data prevista de qualquer dose (1ª, 2ª ou anual) foi ultrapassada sem registro de aplicação;

* Manutenção anual: ciclo inicial concluído, animal apto para liberação e em acompanhamento anual.

Deve haver campo de busca por número de registro ou espécie e filtro avançado por status.

// imagem de referencia da tela está na pasta public Desverminação.png

### **2.4.2 Registro de Dose (RF-CL-08)**

Ao acionar a ação "Registrar dose", o sistema deve apresentar um formulário guiado, composto pelas seguintes informações:

* Animal: campo de seleção obrigatório;

* Data de entrada: exibida automaticamente a partir do cadastro do animal;

* Situação do ciclo de desverminação: seleção obrigatória entre duas opções: "Animal ainda não iniciou o ciclo" (o sistema calculará a 1ª dose para 60 dias após a entrada e a 2ª dose para 15 dias após a 1ª) ou "Animal já fez doses anteriores" (o usuário informa a data da última dose aplicada e seu tipo, para que o sistema calcule as etapas seguintes);

* Quando "Animal já fez doses anteriores" for selecionado: campo de dose administrada (1ª dose, 2ª dose ou dose anual) e data da dose;

* Observação (opcional): reações, intercorrências ou observações do manejo relacionadas à aplicação;

* Painel de resumo do protocolo, exibindo em formato de linha do tempo as quatro etapas do ciclo (entrada no biotério, 1ª dose, 2ª dose e manutenção anual), com a data de cada etapa (realizada ou prevista, conforme cálculo automático) e destaque da etapa atual;

imagem de referencia da tela está na pasta public Registrar dose desverminacao.png

### **2.4.3 Regras de Cálculo do Cronograma**

Os campos calculados automaticamente pelo sistema devem seguir as regras já descritas na Seção 1.5. O sistema não deve permitir o registro de uma etapa fora de sequência (ex.: registrar a 2ª dose sem que a 1ª dose conste como aplicada), exceto no fluxo de regularização de animais que já possuíam doses anteriores aplicadas fora do sistema.

### **2.4.4 Encaminhamento para Liberação (RF-CL-09)**

Ao ser registrada a conclusão da 2ª dose do ciclo inicial de desverminação, o sistema deve permitir a emissão do Encaminhamento para Liberação, documento/registro formal que autoriza a movimentação do animal do ambulatório/instalação de quarentena para a instalação definitiva junto às demais serpentes saudáveis. Esse encaminhamento deve ser registrável como um tipo específico de atendimento (Seção 2.1.2) e deve atualizar automaticamente o status do protocolo de desverminação do animal para "Manutenção anual".

### **2.4.5 Histórico na Ficha do Animal (RF-CL-10)**

A ficha individual de cada animal deve exibir o histórico completo do protocolo de desverminação, em ordem cronológica decrescente, contendo todas as doses já aplicadas (com data e tipo de dose) e a próxima dose prevista em destaque, além de um painel-resumo com: data de início do protocolo, quantidade total de doses aplicadas, data da última dose aplicada e status atual do protocolo.

// imagem de referencia da tela está na pasta public Ficha animal - desverminação.png


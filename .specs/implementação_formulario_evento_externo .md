# **Implementação do Formulário de Evento Externo** 

### **Contexto e Objetivo**

Ao criar um agendamento do tipo **"Evento Externo (Fora da UCDB)"**, a interface deve exibir e exigir o preenchimento da seção **"Formulário de Transporte de Fauna"**.

Este preenchimento condicional servirá de base para a geração e emissão do documento oficial em PDF/Módulo de Impressão (com leiaute oficial do IMASUL / Gerência de Recursos Pesqueiros e Fauna), de forma análoga a fluxos existentes como *Solicitação de Exame*, *Liberação de Quarentena* e *Alta Ambulatorial*.

## **1\. Regra de Exibição Condicional**

* **Gatilho:** No modal de "Agendar Novo Evento", quando o campo Tipo de Evento for selecionado como Externo (Fora da UCDB), expandir/exibir o bloco de formulário abaixo.  
* 

## **2\. Estrutura e Especificação do Formulário**

### **Seção 1: Destinatário**

1. **Tipo de Destinatário (**Radio Button**):**  
2. **Opções:**

   * Zoológico  
     *   
     * Expositor  
     *   
     * Criadouro conservacionista  
     *   
     * Instituição/criadouro científico  
     *   
     * Criadouro comercial  
     *   
     * Pesquisador  
     *   
     * Outros  
     *   
   * **Regra Dinâmica:** Ao selecionar a opção Outros, exibir obrigatoriamente o campo de texto:

     * Especifique outro destinatário \* (Campo textual simples, estilo caixa de texto/input).

3. **Dados do Requerente / Destinatário (Campos de Entrada Textual):**

   * Nome / Razão Social: *(Input text)*  
   *   
   * CNPJ / CPF: *(Input text com máscara)*  
   *   
   * Endereço do requerente: *(Input text)*  
   *   
   * Bairro: *(Input text)*  
   *   
   * Município: *(Input text)*  
   *   
   * CEP: *(Input text com máscara)*  
   *   
   * Telefone: *(Input text com máscara)*  
   *   
   * CTF nº: *(Input text)*  
   * 

### **Seção 2: Objeto**

1. **Tipo de Objeto (**Radio Button**):**  
2. **Opções:**  
   * Transporte de material zoológico (especificar)  
     * Transporte de produto e subproduto da fauna (especificar)  
     * Exposição de animais silvestres  
     * Outros (especificar)  
   * **Regra Dinâmica:** Ao selecionar Outros (ou opções que exijam detalhamento), exibir obrigatoriamente o campo textual:  
     * Especifique outro objeto \* (Campo textual simples/input).  
       

### **Seção 3: Descrição do Material**

* **Módulo de Lista de Animais Selecionados:**  
    
  * Exibir a listagem dos animais vinculados à instalação/evento.  
  * Cada item adicionado deve exibir obrigatoriamente as 3 informações essenciais:

    1. **Nº do Chip**  
    2. **Espécie (Nome Científico)**  
    3. **Gênero / Sexo**  
  * Permitir remoção ou inclusão dinâmica de animais na listagem.  
    

### **Seção 4: Meio de Transporte e Dados do Transportador**

1. **Meio de Transporte (**Radio Button**):**  
2. **Opções:**

   * Terrestre \- Rodoviário (especificar)  
     *   
     * Terrestre \- Ferroviário (especificar)  
     *   
     * Aéreo (especificar)  
     *   
     * Fluvial (especificar)  
     *   
3. **Campo de Detalhamento do Transportador e Veículos:**  
     
   * **Rótulo:** Especifique Meio de transporte e dados do transportador \* *(Área de texto/Textarea editável)*.  
   * **Comportamento:** O campo deve vir **pré-preenchido por padrão** com o seguinte texto editável:  
     **Nome do condutor/transportadora:** Luiz Humberto Guimarães Riquelme Junior CPF 033.728.421-03 / Henrique Emanuel Hatzis Gomes CPF 431.428.668-76 / Brenda Silva Campos Martins CPF 138.758.397-22 / João Batista Camilo de Araújo CPF 401.996.358-46. / Thiago Guazina Morinigo CPF: 062.428.381-09 **Veículo (marca, tipo, ano e placa):** KWID BRANCO PLACA SLX8G41 ANO 2023; SIENA BRANCO PLACA QAX7103 ANO 2020; L-200 AZUL PLACA NOO4161 ANO 2014; L200 TRITON Placa: BEF-4I50 BRANCA Ano: 2023; Van Master Placa: DWO-6I12 Ano: 2024 Branca  
4. **Campos Adicionais de Trajeto:**

   * Rodovias utilizadas (Rota): *(Input text)*  
   * Data do transporte a ser efetuado: *(DatePicker / Input Data)*

## **3\. Geração de Documento Oficial (Visualização e Impressão)**

Após o salvamento do formulário de Evento Externo:

1. **Visualização:** Disponibilizar a visualização em documento/PDF conforme o modelo padrão do IMASUL (*Governo do Estado de Mato Grosso do Sul \- IMASUL \- Formulário de Transporte de Fauna*).

2. **Ações Disponíveis:**

   * **Editar:** Permite reabrir o modal e atualizar as informações cadastradas.  
   * **Salvar (download):** Exportar o formulário preenchido em formato PDF.  
   * **Imprimir:** Ação direta de impressão do documento oficial com termo de declaração e espaço para data/assinatura do requerente.  
     

   A geração de documento será utilizado a entidade e seus recursos de ModeloDocumento.cse identificar em DocumentoEvento.cs

### **Mapeamento e Persistência de Entidades**

A geração e vínculo do documento deve reaproveitar os padrões e microsserviços/módulos existentes no sistema para criação de documentos oficiais (`SolicitacaoExame`, `LiberacaoQuarentena`, etc.).

1. [**`ModeloDocumento.cs`](http://ModeloDocumento.cs)`: ja existe. UTILIZAR`**  
2. **`DocumentoEvento.cs`**


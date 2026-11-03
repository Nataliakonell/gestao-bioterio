# Spec: Visualização de Documentos Clínicos na Ficha do Animal

## 1. Descrição
Permitir que o usuário, ao consultar o histórico clínico na Ficha do Animal (`/plantel/ficha/:id?tab=clinico`), visualize o documento clínico gerado para os eventos de:
1. **Alta Ambulatorial**
2. **Liberação da Quarentena**
3. **Solicitação de Exame**

O documento deve ser exibido em modal com layout A4 e disponibilizar ações para **Salvar (Download)** e **Imprimir**.

## 2. Comportamento Esperado
- Ao clicar no card de um evento clínico do tipo **Alta Ambulatorial**, o sistema abre um modal com o documento de Alta Ambulatorial pré-preenchido com os dados do atendimento e da alta.
- Ao clicar no card de um evento clínico do tipo **Liberação da Quarentena**, o sistema abre um modal com o documento de Liberação de Quarentena preenchido com os dados do atendimento e da quarentena.
- Ao clicar no card de um evento clínico do tipo **Exame** ou no botão/badge resumo **Exame (N)** de qualquer atendimento com exames solicitados, o sistema abre um modal com o documento de Solicitação de Exame preenchido com os exames marcados e observações.
- No cabeçalho do documento / visualizador, devem constar as opções:
  - **Salvar (Download)**: aciona o fluxo de salvar/baixar o documento como PDF.
  - **Imprimir**: aciona a impressão direta do documento com formatação A4 limpa.
  - **Editar Atendimento**: permite navegar para a página de edição do atendimento caso o usuário necessite fazer alterações.
  - **Fechar**: fecha o modal.

## 3. Casos de Teste (A2A / Frontend)
1. **CT-01**: Clicar em evento de Alta Ambulatorial na timeline -> Modal abre exibindo template de Alta com os dados do animal e da alta.
2. **CT-02**: Clicar em evento de Liberação de Quarentena na timeline -> Modal abre exibindo template de Quarentena com os dados do animal e da quarentena.
3. **CT-03**: Clicar em evento de Exame ou badge de Exame na timeline -> Modal abre exibindo template de Solicitação de Exame com os campos e exames solicitados.
4. **CT-04**: Clicar no botão Imprimir -> Executa impressão limpa via iframe com estilos A4.
5. **CT-05**: Clicar no botão Salvar (Download) -> Inicia o fluxo de download/salvamento do PDF do documento.

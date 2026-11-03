# Spec: Alimentação por Lote e Anotação de Resultados em Lote (Frontend-First)

## 1. Visão Geral e Princípio de Preservação de Produção

Para garantir **zero risco de quebra em produção** e evitar migrações de banco, a arquitetura deste novo fluxo opera utilizando **integralmente os modelos, contratos e endpoints de `Alimentacao`, `Refeicao` e `BiometriaAnimal` existentes**.

Toda a inteligência dos 4 passos é orquestrada na experiência de usuário (frontend web):
1. **Passo 1 — Escolha do Grupo:** Seleção de Espécie, Sala/Recinto, Data da Alimentação, Responsável e listagem de animais com checkboxes.
2. **Passo 2 — Grade de Lançamento:** Tabela unificada com linha por animal, peso atual (com recálculo e peso sugerido editável), colunas dinâmicas para refeições (`Refeição 1`, `Refeição 2`...) com tipo, peso, situação e observação opcional, além de totalizadores no rodapé.
3. **Passo 3 — Persistência:** Disparo transacional por animal na API `POST /api/Alimentacao` existente. O lote e o responsável são registrados de forma rastreável no campo `Observacoes` da alimentação (ex: `[Lote: bdc2aadd | Responsável: Natalia]`). Em "Salvar como pendente", todas as refeições são inicializadas com situação `Pendente`.
4. **Passo 4 — Anotação de Resultados:** Na Visão Geral (`/alimentacao`), exibição com acordeão expansível para as refeições de cada animal, botão "Selecionar refeições pendentes" e botão "Atualizar status em lote" que despacha atualizações instantâneas via `PUT /api/Alimentacao` existente.

---

## 2. Modelagem e Endpoints Existentes Utilizados

- `POST /api/Alimentacao`: `CreateAlimentacaoCommand` (cria alimentação, calcula totais, cria biometria se peso > 0).
- `PUT /api/Alimentacao`: `UpdateAlimentacaoCommand` (atualiza refeições, pesos e recalcula totais e status).
- `GET /api/Alimentacao`: traz lista paginada com `refeicoes`, `biometriaAnimal`, `especieNome`, etc.
- `GET /Animal`: listagem paginada e filtrada de animais.
- `GET /AnimalLocalizacao`: localização atual de cada animal por sala/recinto.
- `GET /Especie/lookup`: lista de espécies ativas.
- `GET /Localizacao`: lista de salas e recintos.

---

## 3. UI/UX e Componentes

- Nova rota: `/alimentacao/lote` — Página de Registro de Alimentação por Lote (Passos 1 e 2).
- Atualização em `/alimentacao`: Visão Geral com acordeão de refeições filhas e barra de ações em lote (Passo 4).
- Botão "Alimentação em lote" no cabeçalho da Visão Geral.

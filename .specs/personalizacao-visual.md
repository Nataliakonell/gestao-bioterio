# Spec: Personalização Visual (Tema e Cor de Destaque)

## Contrato da API
Nenhum. Feature 100% frontend (v1). Persistência em `localStorage` (`sigbio:appearance`), por dispositivo. Persistência por usuário no backend fica para v2.

## Comportamento esperado
- Modo `light` (padrão, aparência atual) e `dark`.
- Cor de destaque: `blue` (padrão), `teal`, `green`, `violet`, `rose`, `orange`.
- Tokens centralizados em `Frontend/theme.config.js` (plugin Tailwind): paletas `gray`, `slate`, `blue` (destaque) e paletas semânticas viram variáveis CSS `--c-*`. Claro = valores originais do Tailwind; escuro = remapeamento.
- `html.dark` + `html[data-accent]` controlados por `ThemeContext`; script inline no `index.html` evita flash.
- Cores semânticas (red/green/amber/etc.) preservadas, apenas adaptadas ao escuro.
- Tela `/configuracoes/aparencia` (menu do usuário → Aparência) com prévia ao vivo; só persiste ao clicar em Salvar, sair sem salvar reverte.
- Logout preserva a preferência.

## Casos de teste (manuais)
1. CT-01: Primeiro acesso → claro/azul, idêntico ao atual.
2. CT-02: Escolher Escuro + Salvar → todas as telas escuras; F5 mantém.
3. CT-03: Escolher cor + Salvar → botões, abas, links e foco mudam; badges de status não mudam.
4. CT-04: Escolher sem salvar e navegar → volta ao tema salvo.
5. CT-05: Logout/login → preferência mantida.

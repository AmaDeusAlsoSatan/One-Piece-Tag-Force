# Guia interno do projeto

Este documento resume como rodar e validar localmente o projeto One Piece Tag Force durante o trabalho de desenvolvimento. Ele e voltado para uso interno e nao substitui documentacao publica do produto.

## Visao geral

- Aplicacao web em React com Vite.
- Codigo principal em `src/`.
- Configuracao do Vite em `vite.config.ts`.
- Scripts de suporte em `scripts/`.
- Pacote npm: `one-piece-tag-force`.

## Requisitos

- Node.js instalado.
- npm disponivel no terminal.
- Dependencias instaladas com `npm install`.

## Instalar dependencias

```bash
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento usa Vite com host local:

```text
http://127.0.0.1:5173
```

Se a porta estiver ocupada, confira a saida do terminal do Vite para ver a porta alternativa.

## Gerar build

```bash
npm run build
```

Esse comando executa TypeScript e Vite:

```bash
tsc && vite build
```

## Visualizar build local

```bash
npm run preview
```

## Importar cartas

Existe um script dedicado para importar dados de cartas:

```bash
npm run import:cards
```

Antes de alterar esse fluxo, leia o script em `scripts/importOptcgCards.mjs` e confira quais arquivos de entrada e saida ele espera.

## Estrutura importante

```text
src/              Codigo da aplicacao
scripts/          Scripts auxiliares
index.html        Entrada HTML do Vite
vite.config.ts    Configuracao do Vite
tsconfig.json     Configuracao TypeScript
package.json      Scripts e dependencias
```

## Validacoes recomendadas

Para uma mudanca pequena, rode pelo menos:

```bash
npm run build
```

Para mudancas de comportamento, tambem valide manualmente o fluxo no navegador via:

```bash
npm run dev
```

## Cuidados para agentes

- Nao alterar dependencias sem necessidade explicita.
- Nao editar `package-lock.json` se a tarefa nao envolver dependencias.
- Nao commitar arquivos gerados como `dist/`.
- Nao alterar arquivos `.env`.
- Preferir mudancas pequenas e bem localizadas.
- Registrar no relatorio final quais arquivos foram alterados e quais validacoes foram executadas.

## Fluxo com Maestro

Quando esta tarefa vier de uma run do Maestro, trabalhe somente no workspace sandbox indicado pelo handoff. Nao altere diretamente o repositorio original do projeto.

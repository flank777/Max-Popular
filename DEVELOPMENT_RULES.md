# Regras de desenvolvimento

## Organização obrigatória

- Separe TypeScript/TSX, CSS, JSON e Markdown em arquivos próprios.
- Use nomes específicos e extensões adequadas para cada responsabilidade.
- Organize componentes, dados, repositories, services, tipos e utilitários em suas pastas correspondentes.
- Não misture interface, regra de negócio, dados mockados e persistência no mesmo módulo.
- Antes de criar código, procure componentes, hooks, services, repositories, tipos e utilitários reutilizáveis.

## Títulos de seção

Arquivos com mais de um bloco lógico devem usar títulos visuais de seção, por exemplo:

```ts
// ======================================================
// IMPORTS
// ======================================================
```

Use títulos equivalentes para tipos, constantes, validações, regras de negócio, handlers, renderização e exports. Em CSS, use comentários de seção para variáveis, layout, componentes, estados, responsividade e animações.

## Responsabilidade única

- Componentes visuais devem cuidar da apresentação.
- Páginas devem organizar o fluxo.
- Hooks devem concentrar lógica reutilizável ligada ao React.
- Services devem concentrar regras de negócio.
- Repositories devem concentrar acesso e persistência de dados.
- Dados de teste devem ficar em `src/data/mocks`.
- Tipos devem ficar em `src/types`.
- Funções genéricas devem ficar em `src/utils`.

## Documentação e revisão

- Mantenha `README.md`, `ARCHITECTURE.md` e este arquivo atualizados.
- Antes de finalizar, remova imports, estados, funções e arquivos sem uso.
- Valide TypeScript, build, responsividade, navegação e funcionalidades existentes.

## QR Code

- Preserve o fluxo de QR Code, incluindo permissão, leitura, identificação e erros.
- Nunca substitua ou refaça o scanner funcional sem analisar seus consumidores.
- Depois de alterações, valide a abertura da câmera, a leitura, a identificação e o tratamento de erro.

# Drogarias Maxi Popular

Aplicação PWA mobile-first para reposição e conferência de produtos em gôndolas.

## Executar

```bash
npm install
npm run dev
```

Para validar o build:

```bash
npm run build
```

## Fluxo atual

O repositor pode ler um QR Code de gôndola ou informar códigos como `03-02` e `GONDOLA-03-PRATELEIRA-02`. Após localizar a posição, confere o checklist, busca ou escaneia o produto e registra o resultado no histórico local do navegador.

## Estrutura

- `src/components`: componentes visuais reutilizáveis.
- `src/data/mocks`: dados de demonstração.
- `src/repositories`: acesso aos dados.
- `src/services`: regras de negócio.
- `src/types`: contratos TypeScript.
- `src/utils`: funções auxiliares.
- `src/App.tsx`: composição da experiência do repositor.

Veja também [ARCHITECTURE.md](./ARCHITECTURE.md) e [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).

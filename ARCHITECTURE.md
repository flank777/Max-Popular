# Arquitetura

```text
Sistema
├── Repositor
│   ├── QR Code
│   ├── Gôndola
│   ├── Produto
│   └── Conferência
├── Produtos
├── Gôndolas
├── Histórico
└── Relatórios
```

O fluxo segue `componente visual -> página/fluxo -> service -> repository -> dados`. Os scanners ficam em `components/scanner`, a interpretação do código da gôndola em `utils` e os dados de desenvolvimento em `data/mocks`.

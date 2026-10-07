# Regras de desenvolvimento

- Preserve o fluxo de QR Code, incluindo permissão, leitura, identificação e erros.
- Mantenha responsabilidades separadas entre componentes, páginas, serviços, repositories, tipos, dados e utilitários.
- Use nomes que expliquem claramente a responsabilidade do arquivo.
- Antes de criar lógica, procure componentes, hooks, services, repositories, tipos e utilitários existentes.
- Não misture interface, regra de negócio e acesso a dados no mesmo módulo.
- Preserve layout, responsividade e navegação existentes.
- Depois de cada mudança, execute `npm run build` e valide o fluxo de QR Code e busca manual.
- Remova imports, estados e arquivos sem uso antes de finalizar.

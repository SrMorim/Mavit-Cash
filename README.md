# Mavit - Cash

Mavit - Cash é um aplicativo de desktop elegante e focado no usuário para gerenciamento de finanças pessoais. Desenvolvido com Electron, React e TypeScript, oferece uma interface moderna e intuitiva para controlar gastos, definir orçamentos, gerenciar dívidas e acompanhar metas financeiras.

## Características Principais

- **🎨 Interface Elegante**: Design moderno com tema escuro e animações fluidas
- **📊 Dashboard Interativo**: Visão geral das finanças com gráficos e indicadores
- **💳 Gestão de Despesas**: Cadastro de despesas únicas e recorrentes
- **🎯 Metas Financeiras**: Definição e acompanhamento de objetivos de economia
- **📈 Orçamentos Inteligentes**: Controle de gastos por categoria com alertas
- **📉 Gestão de Dívidas**: Estratégias de quitação (Bola de Neve e Avalanche)
- **📊 Relatórios Detalhados**: Análises e gráficos para entender seus hábitos
- **🔄 Backup Automático**: Sincronização e backup dos dados

## Tecnologias Utilizadas

- **Electron**: Framework para aplicações desktop multiplataforma
- **React**: Biblioteca para construção de interfaces de usuário
- **TypeScript**: Linguagem com tipagem estática
- **Vite**: Build tool rápido e moderno
- **Tailwind CSS**: Framework CSS utilitário
- **Zustand**: Gerenciamento de estado leve e flexível
- **Framer Motion**: Biblioteca de animações
- **Recharts**: Biblioteca de gráficos para React
- **React Router**: Roteamento para React
- **Electron Store**: Armazenamento persistente para Electron

## Instalação e Uso

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/SrMorim/Mavit-Cash.git
cd Mavit-Cash
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Execute o aplicativo em modo de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

### Build para Produção

Para criar um build para produção:

\`\`\`bash
# Build completo (React + Electron + Package)
npm run build

# Ou etapas individuais:
npm run build:react    # Build da aplicação React
npm run build:electron # Compilação do TypeScript do Electron
npm run make           # Criação do executável
\`\`\`

## Funcionalidades Implementadas

### ✅ Concluído
- [x] Configuração inicial do projeto
- [x] Interface com sidebar colapsável
- [x] Dashboard com visão geral financeira
- [x] Sistema de categorias
- [x] Gerenciamento de estado com Zustand
- [x] Tema escuro personalizado
- [x] Estrutura de páginas principais
- [x] Configuração de build

### 🚧 Em Desenvolvimento
- [ ] Integração com electron-store
- [ ] Formulários para cadastro de dados
- [ ] Sistema de notificações
- [ ] Funcionalidades de importação/exportação
- [ ] Mais tipos de gráficos e relatórios

## Estrutura do Projeto

\`\`\`
Mavit-Cash/
├── electron/              # Processo principal do Electron
│   ├── main.ts           # Arquivo principal do Electron
│   ├── preload.ts        # Script de preload
│   └── utils.ts          # Utilitários
├── src/                  # Código fonte da aplicação React
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas da aplicação
│   ├── store/           # Gerenciamento de estado
│   ├── types/           # Definições TypeScript
│   ├── utils/           # Funções utilitárias
│   └── styles/          # Estilos CSS
├── package.json         # Configuração do projeto
├── vite.config.ts       # Configuração do Vite
├── tailwind.config.js   # Configuração do Tailwind
└── forge.config.js      # Configuração do Electron Forge
\`\`\`

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou envie um pull request.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor

Desenvolvido por Maverick

---

*Mavit - Cash: Transformando a maneira como você gerencia suas finanças pessoais.*
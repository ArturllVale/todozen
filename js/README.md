# Estrutura Modular do TodoZen

O arquivo `script.js` foi dividido em módulos para facilitar a manutenção e organização do código.

## Estrutura dos Módulos

### 📁 `modules/`

#### `constants.js`
- Constantes da aplicação (chaves de storage, cores predefinidas, textos de recorrência)

#### `storage.js`
- Gerenciamento de dados no LocalStorage
- Funções para salvar/carregar tarefas, tags e listas
- Migração de dados para compatibilidade

#### `dom-elements.js`
- Mapeamento de todos os elementos DOM
- Centraliza as referências aos elementos HTML

#### `utils.js`
- Funções utilitárias (formatação de datas, notificações, temas)
- Funções auxiliares reutilizáveis

#### `notifications.js`
- Gerenciamento de notificações do sistema
- Verificação de tarefas vencidas
- Permissões de notificação

#### `tasks.js`
- Gerenciamento completo de tarefas
- Renderização, criação, edição e exclusão
- Filtros e ordenação

#### `tags.js`
- Gerenciamento de tags
- Criação, edição e exclusão de tags
- Renderização de tags selecionáveis

#### `lists.js`
- Gerenciamento de listas de tarefas
- Criação e navegação entre listas
- Movimentação de tarefas entre listas

#### `dialogs.js`
- Gerenciamento de todos os diálogos/modais
- Abertura e fechamento de diálogos
- Coordenação entre diferentes diálogos

#### `calendar.js`
- Visualização em calendário
- Navegação entre meses
- Exibição de tarefas por data

#### `import-export.js`
- Importação e exportação de dados
- Backup e restauração
- Limpeza de dados

#### `sidebar.js`
- Gerenciamento da barra lateral
- Abertura e fechamento do menu

#### `pwa.js`
- Funcionalidades de Progressive Web App
- Service Worker e instalação

#### `keyboard-shortcuts.js`
- Atalhos de teclado
- Navegação por teclado

### 📄 `script.js` (Principal)
- Arquivo principal que importa e coordena todos os módulos
- Inicialização da aplicação
- Event listeners principais
- Coordenação entre módulos

## Vantagens da Modularização

### ✅ **Manutenibilidade**
- Código organizado por funcionalidade
- Fácil localização de bugs
- Modificações isoladas

### ✅ **Reutilização**
- Módulos podem ser reutilizados
- Funções bem definidas
- Separação de responsabilidades

### ✅ **Escalabilidade**
- Fácil adição de novas funcionalidades
- Estrutura preparada para crescimento
- Módulos independentes

### ✅ **Testabilidade**
- Cada módulo pode ser testado isoladamente
- Dependências claras
- Funções puras quando possível

### ✅ **Colaboração**
- Diferentes desenvolvedores podem trabalhar em módulos diferentes
- Conflitos de merge reduzidos
- Código mais legível

## Como Usar

1. **Importação ES6**: O arquivo principal usa `import/export` do ES6
2. **Módulos**: Cada funcionalidade está em seu próprio arquivo
3. **Coordenação**: O `script.js` principal coordena todos os módulos
4. **Inicialização**: Todos os gerenciadores são instanciados no início

## Exemplo de Uso

```javascript
// Importar módulos necessários
import { TaskManager } from './modules/tasks.js';
import { TagManager } from './modules/tags.js';

// Instanciar gerenciadores
const taskManager = new TaskManager();
const tagManager = new TagManager();

// Usar funcionalidades
taskManager.renderTasks();
tagManager.updateTagFiltersUI();
```

## Compatibilidade

- ✅ Navegadores modernos com suporte a ES6 modules
- ✅ Chrome, Firefox, Safari, Edge (versões recentes)
- ⚠️ Requer servidor HTTP (não funciona com file://)

## Migração

A migração do arquivo monolítico para a estrutura modular mantém:
- ✅ Todas as funcionalidades existentes
- ✅ Compatibilidade com dados salvos
- ✅ Interface do usuário inalterada
- ✅ Performance equivalente ou melhor
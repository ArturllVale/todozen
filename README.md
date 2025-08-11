# TODO Zen

Um aplicativo de gerenciamento de tarefas moderno e elegante, desenvolvido com HTML, CSS e JavaScript vanilla.

## 📁 Estrutura do Projeto

```
todozen/
├── assets/          # Ícones e imagens
├── css/            # Arquivos de estilo
│   └── style.css
├── js/             # Scripts JavaScript
│   └── script.js
├── index.html      # Página principal
├── manifest.json   # Manifesto PWA
├── sw.js          # Service Worker
└── README.md      # Documentação
```

## ✨ Funcionalidades

### Principais
- ✅ **Adicionar tarefas** com título e descrição
- 🏷️ **Sistema de tags** com cores personalizáveis
- 🔍 **Busca** por título e descrição
- ⭐ **Favoritar** tarefas importantes
- 📦 **Arquivar** tarefas concluídas
- 🌙 **Modo escuro/claro**
- 📱 **PWA** - Instalável como app

### Melhorias Implementadas
1. **Estrutura organizada** - Pastas separadas para CSS, JS e assets
2. **Título e descrição** - Tarefas agora têm título e descrição opcional
3. **Criação rápida de tags** - Crie tags diretamente ao adicionar tarefas
4. **Faixa colorida lateral** - Visual elegante baseado na cor da primeira tag
5. **Correção de bugs** - Tarefas não desaparecem mais ao adicionar novas
6. **Filtro por clique** - Clique em uma tag para filtrar por ela

## 🎨 Sistema de Tags

- **16 cores predefinidas** para escolher
- **Criação rápida** durante a adição de tarefas
- **Filtros visuais** com chips removíveis
- **Faixa lateral colorida** nas tarefas baseada na primeira tag

## 🚀 Como Usar

1. Abra o `index.html` no navegador
2. Clique em "Adicionar Tarefa" para criar uma nova tarefa
3. Preencha título, descrição (opcional) e selecione/crie tags
4. Use a busca para encontrar tarefas específicas
5. Clique em tags para filtrar tarefas
6. Gerencie suas tags através do menu

## 💾 Armazenamento

Todos os dados são salvos localmente no navegador usando localStorage. Você pode:
- **Exportar** seus dados em formato JSON
- **Importar** dados de backup
- **Limpar** todos os dados se necessário

## 🔧 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript ES6+** - Funcionalidades interativas
- **PWA** - Service Worker para funcionamento offline
- **LocalStorage** - Persistência de dados local

## 📱 PWA (Progressive Web App)

O TODO Zen pode ser instalado como um aplicativo nativo:
1. Abra no navegador
2. Clique no menu (⋮)
3. Selecione "Instalar App"
4. Confirme a instalação

---

**Desenvolvido por Artur Vale com ❤️**
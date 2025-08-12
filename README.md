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
- ⏰ **Datas e Lembretes**
  - Defina datas de vencimento
  - Escolha tempo de notificação (5-60 minutos)
  - Notificações precisas antes do vencimento
- 🔄 **Tarefas Recorrentes**
  - Opções: diária, semanal, mensal
  - Visualização clara do tipo de recorrência
- 🎯 **Prioridades**
  - Níveis: baixa, média, alta
  - Indicadores visuais por cores
- ⌨️ **Atalhos de Teclado**
  - N: Nova tarefa
  - F: Busca
  - ESC: Fechar diálogos

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
2. Clique em "Adicionar Tarefa" (ou pressione N) para criar uma nova tarefa
3. Preencha:
   - Título e descrição (opcional)
   - Data de vencimento e tempo de notificação
   - Prioridade (baixa, média, alta)
   - Recorrência (diária, semanal, mensal)
   - Selecione/crie tags
4. Use a busca (atalho F) para encontrar tarefas específicas
5. Clique em tags para filtrar tarefas
6. Gerencie suas tags através do menu
7. Use ESC para fechar diálogos rapidamente

## 💾 Armazenamento

Todos os dados são salvos localmente no navegador usando localStorage. Você pode:
- **Exportar** seus dados em formato JSON
  - Exportar todas as listas
  - Exportar apenas a lista atual
- **Importar** dados de backup
  - Importar como nova lista
  - Mesclar com dados existentes
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
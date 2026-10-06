# Manga Reader

Leitor de mangá em HTML, CSS e JavaScript puro. Sem build, sem dependências: abre direto no navegador.

## Recursos

- **Catálogo** com 18 títulos, filtro por gênero e ordenação por nome, nota, popularidade ou lançamento
- **Busca** por título, título original, autor ou gênero (ignora acentos: `acao` acha "Ação")
- **Ranking** por visualizações e lista de **capítulos recentes** agrupada por dia
- **Página do mangá** com sinopse, ficha técnica e lista de capítulos filtrável por número
- **Leitor** com rolagem vertical, barra de progresso, contador de páginas e troca de capítulo pelas setas do teclado
- **Continuar lendo**: guarda o último capítulo aberto e marca os capítulos lidos
- **Favoritos** salvos no navegador (`localStorage`)
- **Tema claro e escuro** (segue o sistema por padrão)
- **Links que funcionam**: cada tela tem URL própria (`#/manga/1`, `#/ler/1/5`), então o botão voltar do navegador e o F5 funcionam
- Layout responsivo para celular

## Como rodar

Abra o `index.html` no navegador, ou sirva a pasta:

```bash
python -m http.server 5173
```

e acesse `http://localhost:5173`.

## Atalhos

| Tecla | Ação |
| --- | --- |
| `/` | Focar a busca |
| `←` `→` | Capítulo anterior / próximo (no leitor) |
| `Esc` | Voltar |

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura das telas |
| `style.css` | Visual (tokens de cor para tema claro/escuro) |
| `data.js` | Catálogo de mangás e geração dos capítulos |
| `script.js` | Rotas, renderização, favoritos, progresso e leitor |

## Observações

Projeto demonstrativo. As capas vêm do MyAnimeList e do AniList; as páginas dos capítulos são ilustrações em estilo mangá desenhadas no navegador com `<canvas>`, não conteúdo real.

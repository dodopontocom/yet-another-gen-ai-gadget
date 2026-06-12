# memory.md
<!-- gerado por commit_memory.sh — não editar manualmente -->

> Histórico de lições aprendidas por commit.
> Injetado como system prompt no início de cada sessão de desenvolvimento.

---



## [9b594ac] 2026-06-12 14:33 🔴
**O que mudou:** Adicionada rota /api/games no backend com proxy para API externa e interface de datas/times no front, mas commit contém marcadores de conflito de merge não resolvidos
**Por quê:** Commit de trabalho em andamento (wip) incluiu marcadores <<<<<<<, ======= e >>>>>>>, que quebram a sintaxe do código e impedem a execução
**Lição:** Nunca comitar marcadores de conflito de merge (<<<<<<<, =======, >>>>>>>) sem resolvê-los; sempre revisar o diff completo antes do commit
**Risco:** high | **Tags:** deploy, express, typescript


## [2ac5163] 2026-06-12 14:37 🔴
**O que mudou:** Marcadores de conflito de merge removidos, mantendo a nova rota /api/games
**Por quê:** Commit anterior continha marcadores <<<<<<<, ======= e >>>>>>> que quebram a sintaxe do código
**Lição:** Nunca comitar marcadores de conflito de merge sem resolvê-los; sempre revisar o diff antes do commit
**Risco:** high | **Tags:** deploy, express, typescript, git


## [af16bf6] 2026-06-12 15:07 🔴
**O que mudou:** Removido selectedGames e sortedDateKeys.length das dependências do useEffect que chama fetchGames e alterada inicialização de apostas para usar updater funcional, evitando loop infinito de re-renderização
**Por quê:** selectedGames como dependência causava re-fetch infinito porque, ao atualizar o estado dentro de fetchGames, o efeito disparava novamente
**Lição:** Sempre verificar se o estado modificado dentro de um useEffect não está listado em suas dependências, ou usar updater funcional para evitar loops infinitos
**Risco:** high | **Tags:** nextjs, typescript, hooks

